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
    below. You must select an appropriate directory (such as "/U/logs/"
    on a USB drive or "/home/systemcore/logs/") for temporarily staging
    vendor logs during capture.

    ```python
    # Start WPILib's DataLogManager normally
    wpilib.DataLogManager.start()

    # Enable vendor log capturing from a temporary staging directory
    VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/U/logs/")

    # Start the vendor logger AFTER log capture is enabled
    # If configurable, the output directory must match the path above
    phoenix6.SignalLogger.start()
    ```
    """
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
        # Check for new files in the directory tree.
        if not cls._capture_directory.exists():
            return

        for root, _, files in os.walk(cls._capture_directory):
            for name in files:
                p = Path(root) / name
                if cls._is_capturable(p) and p not in cls._tracked_logs and p not in cls._ignored_logs:
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
                        cls._tracked_logs[p] = TrackedLog(stream, log_entry, p)

                        # Create marker file
                        marker_path = p.with_name(f".{p.name}.captured")
                        try:
                            marker_path.touch()
                        except OSError:
                            pass

                        # Print status
                        print(f'[VendorLogCapture] Capturing log "{p}" to entry "{entry_name}"', file=sys.stderr)
                    except IOError:
                        print(f'[VendorLogCapture] Could not open log "{p}"', file=sys.stderr)

        # Capture new data from each log
        for _, tracked_log in list(cls._tracked_logs.items()):
            try:
                while True:
                    tracked_log.stream.seek(tracked_log.current_offset)
                    data_chunk = tracked_log.stream.read(65536)

                    if not data_chunk:
                        break

                    tracked_log.entry.append(data_chunk)
                    tracked_log.current_offset += len(data_chunk)
            except IOError:
                # File may have been temporarily locked; retry next cycle
                pass

    @classmethod
    def _is_capturable(cls, file: Path) -> bool:
        """
        Checks if a file is a capturable log file. Excludes WPILOG and hidden files.
        """
        filename = file.name
        if filename.endswith(".wpilog"):
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
                    marker_path = p.with_name(f".{p.name}.captured")
                    if marker_path.exists():
                        try:
                            p.unlink()
                            marker_path.unlink()
                        except OSError:
                            pass
                    else:
                        cls._ignored_logs.add(p)
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
