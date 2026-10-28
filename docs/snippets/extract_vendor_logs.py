#!/usr/bin/env python3

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

import sys
import glob
import lzma
from pathlib import Path
from wpiutil.log import DataLogReader


def decompress_xz(file_path):
    """
    Decompresses an XZ file chunk by chunk.
    """
    decompressed_data = bytearray()
    decompressor = lzma.LZMADecompressor()

    with open(file_path, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            try:
                decompressed_data.extend(decompressor.decompress(chunk))
            except lzma.LZMAError:
                break

    return decompressed_data


def extract_vendor_logs(wpilog_path_str):
    wpilog_path = Path(wpilog_path_str)
    if not wpilog_path.is_file():
        print(f"Error: Could not find WPILOG file at \"{wpilog_path_str}\"")
        return

    print(f"Processing \"{wpilog_path.name}\"...")

    # Check for compressed log
    is_xz = wpilog_path.name.endswith(".wpilogxz")
    if is_xz:
        log_data = decompress_xz(wpilog_path)
        reader = DataLogReader(buffer=log_data)
    else:
        reader = DataLogReader(str(wpilog_path))

    active_files = {}

    try:
        for record in reader:
            if record.isStart():
                start_data = record.getStartData()

                # Identify captured logs based on type
                if start_data.type.startswith("log:"):
                    ext = start_data.type[4:]
                    base_name = wpilog_path.stem

                    # Handle naming collisions for existing files or multiple same-type embedded logs
                    counter = 0
                    while True:
                        suffix = f"_{counter}" if counter > 0 else ""
                        out_path = wpilog_path.with_name(f"{base_name}{suffix}.{ext}")

                        if not out_path.exists():
                            break
                        counter += 1

                    # Print status
                    print(f"  -> Extracting entry \"{start_data.name}\" to \"{out_path.name}\"")

                    # Open file
                    active_files[start_data.entry] = open(out_path, "wb")

            # Write raw data chunks to the appropriate open file
            elif record.getEntry() in active_files:
                active_files[record.getEntry()].write(record.getRaw())

    finally:
        # Ensure all extracted files are properly closed
        for f in active_files.values():
            f.close()

        if not active_files:
            print(f"No embedded vendor logs found in '{wpilog_path.name}'.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_vendor_logs.py <file|folder|wildcard> [additional_paths...]")
        sys.exit(1)

    files_to_process = []

    # Iterate over all provided arguments to handle multiple inputs or shell expansions
    for arg in sys.argv[1:]:
        # Use standard library glob to manually expand wildcards
        for matched_path in glob.glob(arg):
            p = Path(matched_path)

            if p.is_dir():
                # If a directory is passed, search for all log files inside it
                files_to_process.extend(p.glob("*.wpilog"))
                files_to_process.extend(p.glob("*.wpilogxz"))
            elif p.is_file():
                # If it's a file, add it directly
                files_to_process.append(p)

    # Remove duplicates while preserving order (in case of overlapping wildcards/folders)
    files_to_process = list(dict.fromkeys(files_to_process))

    if not files_to_process:
        print("Error: No valid WPILOG files found to process.")
        sys.exit(1)

    # Process all gathered files
    for wpilog_file in files_to_process:
        extract_vendor_logs(wpilog_file)
