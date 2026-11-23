# Copyright (c) 2021-2026 Littleton Robotics. All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# - Redistributions of source code must retain the above copyright
#   notice, this list of conditions and the following disclaimer.
# - Redistributions in binary form must reproduce the above copyright
#   notice, this list of conditions and the following disclaimer in the
#   documentation and/or other materials provided with the distribution.
# - Neither the name of Littleton Robotics, FRC 6328 ("Mechanical Advantage"),
#   AdvantageScope, nor the names of other AdvantageScope contributors may be
#   used to endorse or promote products derived from this software without
#   specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY LITTLETON ROBOTICS AND OTHER ADVANTAGESCOPE
# CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT
# NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY NONINFRINGEMENT
# AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
# LITTLETON ROBOTICS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
# INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
# NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
# OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
# NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
# EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import os
import glob
import sys
import math
from pathlib import Path
import wpilog
import wpilib


class TrackedLog:
    def __init__(self, stream, entry, file_path):
        self.stream = stream
        self.entry = entry
        self.file_path = file_path
        self.current_offset = 0


class VendorLogCapture:
    """
    AdvantageScope vendor log capture (v1.0)

    Automatically captures data from vendor log files into an active
    DataLog (.wpilog).

    Many robot projects generate multiple log files simultaneously: a standard
    .wpilog file for WPILib telemetry alongside proprietary files from
    vendor libraries. Universal logging with AdvantageScope eliminates this split
    by embedding those vendor logs directly into the main .wpilog.

    This class should be initialized in your Robot constructor as shown
    below. You must select an appropriate directory (we recommend
    "/home/systemcore/logs/") for temporarily staging vendor logs during capture.

    ```python
    # Start WPILib's DataLogManager normally
    wpilib.DataLogManager.start()

    # Enable vendor log capturing from a temporary staging directory
    # We recommend staging vendor logs on the internal storage even
    # when using a USB drive (vendor logs do not persist after capture)
    VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

    # Start the vendor logger AFTER log capture is enabled
    # If configurable, the output directory must match the path above
    VendorLogger.set_path("/home/systemcore/logs/")
    VendorLogger.start()
    ```
    """
    _CHUNK_SIZE = 65536
    _MAX_CHUNKS_PER_CYCLE = 4
    _MIN_FREE_BUFFER_BYTES = 262144  # 256 KB
    _MAX_UNCAPTURED_BYTES = 524288  # 0.5 MB

    _data_log = None
    _capture_directory = None
    _notifier = None
    _tracked_logs = {}
    _format_counts = {}
    _ignored_logs = set()

    @classmethod
    def start(cls, log: wpilog.DataLog, directory: str):
        """
        Starts capturing vendor logs from the specified directory into the given
        DataLog. This method must be called BEFORE starting any vendor loggers.

        :param log:       The DataLog to write captured vendor log
                          entries into (e.g. wpilib.DataLogManager.get_log()).
        :param directory: The path to the staging directory where vendor
                          libraries write their log files (such as
                          "/U/logs/" on a USB drive or
                          "/home/systemcore/logs/").
        """
        # Initialize configuration
        if cls._data_log is not None:
            return

        cls._data_log = log
        cls._capture_directory = Path(directory)

        # Ensure that the log directory exists
        if not cls._capture_directory.exists():
            cls._capture_directory.mkdir(parents=True, exist_ok=True)

        # Remove any pre-existing capturable logs
        cls._clean_capturable_logs()

        # Start the capture notifier
        cls._notifier = wpilib.Notifier(cls._periodic)
        cls._notifier.set_name("VendorLogCapture")
        cls._notifier.start_periodic(0.2)

        # Print status
        print(f"[VendorLogCapture] Searching for logs in \"{directory}\"", file=sys.stderr)

    @classmethod
    def _periodic(cls):
        # Ensure DataLog stays active even when DS is disconnected
        cls._data_log.resume()

        # Check for new files in the directory tree.
        if not cls._capture_directory.exists():
            return

        for root, _, files in os.walk(cls._capture_directory):
            for name in files:
                p = Path(root) / name
                file_key = cls._get_file_key(p)
                existing = cls._tracked_logs.get(file_key)
                if existing is not None:
                    if existing.file_path != p:
                        # File was renamed, move the marker and update the tracked path
                        try:
                            cls._get_marker_path(existing.file_path).unlink(missing_ok=True)
                        except OSError:
                            pass
                        existing.file_path = p
                        cls._write_marker_offset(p, existing.current_offset)
                    continue

                if cls._is_capturable(p) and file_key not in cls._ignored_logs:
                    extension = cls._get_extension(p)
                    if not extension:
                        continue

                    # Generate entry name
                    entry_base_name = "Hoot" if extension.lower() == "hoot" else extension.upper()
                    current_count = cls._format_counts.get(entry_base_name, 0)
                    cls._format_counts[entry_base_name] = current_count + 1
                    entry_name = f"/{entry_base_name}" + (str(current_count) if current_count > 0 else "")

                    # Initialize capture
                    try:
                        stream = open(p, "rb")
                        ext_lower = extension.lower()
                        log_entry = wpilog.RawLogEntry(cls._data_log, entry_name, "", f"log:{ext_lower}")
                        cls._tracked_logs[file_key] = TrackedLog(stream, log_entry, p)

                        # Create marker file
                        cls._write_marker_offset(p, 0)

                        # Print status
                        print(f'[VendorLogCapture] Capturing log "{p}" to entry "{entry_name}"', file=sys.stderr)
                    except IOError:
                        print(f'[VendorLogCapture] Could not open log "{p}"', file=sys.stderr)

        # Capture new data from each log
        total_chunks = 0
        for _, tracked_log in list(cls._tracked_logs.items()):
            updated = False
            try:
                while (
                    total_chunks < cls._MAX_CHUNKS_PER_CYCLE
                    and cls._data_log.get_buffer_free_space() >= cls._MIN_FREE_BUFFER_BYTES
                ):
                    tracked_log.stream.seek(tracked_log.current_offset)
                    data_chunk = tracked_log.stream.read(cls._CHUNK_SIZE)

                    if not data_chunk:
                        break

                    tracked_log.entry.append(data_chunk)
                    tracked_log.current_offset += len(data_chunk)
                    total_chunks += 1
                    updated = True
            except IOError:
                # File may have been temporarily locked; retry next cycle
                pass
            if updated:
                cls._write_marker_offset(tracked_log.file_path, tracked_log.current_offset)
            if (
                total_chunks >= cls._MAX_CHUNKS_PER_CYCLE
                or cls._data_log.get_buffer_free_space() < cls._MIN_FREE_BUFFER_BYTES
            ):
                break

    @classmethod
    def _get_file_key(cls, file: Path):
        """
        Returns the platform file key if available, falling back to the path.
        """
        try:
            st = file.stat()
            if st.st_ino != 0:
                return (st.st_dev, st.st_ino)
        except OSError:
            pass
        return file

    @classmethod
    def _get_marker_path(cls, file: Path) -> Path:
        """
        Returns the capture marker path corresponding to a log file.
        """
        return file.with_name(f".{file.name}.captured")

    @classmethod
    def _write_marker_offset(cls, file: Path, offset: int):
        """
        Writes the captured byte offset to the marker file.
        """
        try:
            cls._get_marker_path(file).write_text(str(offset), encoding="utf-8")
        except OSError:
            pass

    @classmethod
    def _read_marker_offset(cls, marker_path: Path) -> int:
        """
        Reads the captured byte offset from a marker file, or returns -1 if invalid.
        """
        try:
            return int(marker_path.read_text(encoding="utf-8").strip())
        except (OSError, ValueError):
            return -1

    @classmethod
    def _is_capturable(cls, file: Path) -> bool:
        """
        Checks if a file is a capturable log file. Excludes WPILOG and hidden files.
        """
        filename = file.name
        if filename.endswith(".wpilog") or filename.endswith(".wpilogxz"):
            return False
        if filename.startswith("."):
            return False
        return True

    @classmethod
    def _get_extension(cls, file: Path) -> str:
        """
        Extracts the file extension from a path.
        """
        filename = file.name
        if "." in filename:
            ext = filename.split(".")[-1]
            if ext:
                return ext
        return ""

    @classmethod
    def _clean_capturable_logs(cls):
        """
        Cleans any capturable log files and subdirectories.
        """
        if not cls._capture_directory.exists():
            return

        directories = []
        for root, dirs, files in os.walk(cls._capture_directory):
            directories.append(Path(root))
            for name in files:
                p = Path(root) / name
                if cls._is_capturable(p):
                    marker_path = cls._get_marker_path(p)
                    if marker_path.exists():
                        captured_offset = cls._read_marker_offset(marker_path)
                        try:
                            file_size = p.stat().st_size
                            if (
                                captured_offset >= 0
                                and file_size >= captured_offset
                                and file_size - captured_offset <= cls._MAX_UNCAPTURED_BYTES
                            ):
                                p.unlink()
                                marker_path.unlink()
                            else:
                                marker_path.unlink()
                                cls._ignored_logs.add(cls._get_file_key(p))
                        except OSError:
                            cls._ignored_logs.add(cls._get_file_key(p))
                    else:
                        cls._ignored_logs.add(cls._get_file_key(p))
                elif name.startswith(".") and name.endswith(".captured"):
                    original_name = name[1:-9]
                    if not p.with_name(original_name).exists():
                        try:
                            p.unlink()
                        except OSError:
                            pass

        # Reverse sort by length of path to delete children before parents
        directories.sort(key=lambda x: len(str(x)), reverse=True)
        for d in directories:
            if d != cls._capture_directory:
                try:
                    d.rmdir()
                except OSError:
                    pass
