// Copyright (c) 2021-2026 Littleton Robotics. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// - Redistributions of source code must retain the above copyright
//   notice, this list of conditions and the following disclaimer.
// - Redistributions in binary form must reproduce the above copyright
//   notice, this list of conditions and the following disclaimer in the
//   documentation and/or other materials provided with the distribution.
// - Neither the name of Littleton Robotics, FRC 6328 ("Mechanical Advantage"),
//   AdvantageScope, nor the names of other AdvantageScope contributors may be
//   used to endorse or promote products derived from this software without
//   specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY LITTLETON ROBOTICS AND OTHER ADVANTAGESCOPE
// CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT
// NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY NONINFRINGEMENT
// AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// LITTLETON ROBOTICS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
// NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

#pragma once

#include <filesystem>
#include <fstream>
#include <map>
#include <memory>
#include <set>
#include <string>
#include <vector>

#include "wpi/datalog/DataLog.hpp"
#include "wpi/system/Notifier.hpp"

/**
 * AdvantageScope vendor log capture (v1.0)
 *
 * Automatically captures data from vendor log files into an active
 * DataLog (.wpilog).
 *
 * Many robot projects generate multiple log files simultaneously: a standard
 * .wpilog file for WPILib telemetry alongside proprietary files from
 * vendor libraries. Universal logging with AdvantageScope eliminates this split
 * by embedding those vendor logs directly into the main .wpilog.
 *
 * This class should be initialized in your Robot constructor as shown
 * below. You must select an appropriate directory (such as "/U/logs/"
 * on a USB drive or "/home/systemcore/logs/") for temporarily staging
 * vendor logs during capture.
 *
 * \code{.cpp}
 * Robot::Robot() {
 *   // Start WPILib's DataLogManager normally
 *   wpi::DataLogManager::Start();
 *
 *   // Enable vendor log capturing from a temporary staging directory
 *   VendorLogCapture::Start(&wpi::DataLogManager::GetLog(), "/U/logs/");
 *
 *   // Start the vendor logger AFTER log capture is enabled
 *   // If configurable, the output directory must match the path above
 *   ctre::phoenix6::SignalLogger::Start();
 * }
 * \endcode
 */
class VendorLogCapture {
public:
  VendorLogCapture() = delete;

  /**
   * Starts capturing vendor logs from the specified directory into the given
   * DataLog. This method must be called BEFORE starting any vendor loggers.
   *
   * @param log       The DataLog to write captured vendor log
   *                  entries into (e.g. wpi::DataLogManager::GetLog()).
   * @param directory The path to the staging directory where vendor
   *                  libraries write their log files (such as
   *                  "/U/logs/" on a USB drive or
   *                  "/home/systemcore/logs/").
   */
  static void Start(wpi::log::DataLog *log, const std::string &directory);

private:
  static void Periodic();

  /**
   * Checks if a file is a capturable log file. Excludes WPILOG and hidden
   * files.
   */
  static bool IsCapturable(const std::filesystem::path &file);

  /**
   * Extracts the file extension from a path.
   */
  static std::string GetExtension(const std::filesystem::path &file);

  /**
   * Cleans any capturable log files and subdirectories.
   */
  static void CleanCapturableLogs();

  struct TrackedLog {
    std::shared_ptr<std::ifstream> stream;
    wpi::log::RawLogEntry entry;
    std::filesystem::path filePath;
    uint64_t currentOffset;

    TrackedLog(std::shared_ptr<std::ifstream> stream,
               wpi::log::RawLogEntry entry, std::filesystem::path filePath)
        : stream(std::move(stream)), entry(std::move(entry)),
          filePath(std::move(filePath)), currentOffset(0) {}
  };

  static wpi::log::DataLog *dataLog;
  static std::filesystem::path captureDirectory;
  static std::unique_ptr<wpi::Notifier> notifier;

  static std::vector<uint8_t> readBuffer;
  static std::map<std::filesystem::path, TrackedLog> trackedLogs;
  static std::map<std::string, int> formatCounts;
  static std::set<std::filesystem::path> ignoredLogs;
};
