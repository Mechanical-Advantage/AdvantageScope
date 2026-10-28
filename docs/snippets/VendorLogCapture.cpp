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

#include "VendorLogCapture.hpp"

#include <algorithm>
#include <iostream>
#include <span>
#include <system_error>

#include "wpi/units/time.hpp"

wpi::log::DataLog *VendorLogCapture::dataLog = nullptr;
std::filesystem::path VendorLogCapture::captureDirectory;
std::unique_ptr<wpi::Notifier> VendorLogCapture::notifier;

std::vector<uint8_t> VendorLogCapture::readBuffer(65536);
std::map<std::filesystem::path, VendorLogCapture::TrackedLog>
    VendorLogCapture::trackedLogs;
std::map<std::string, int> VendorLogCapture::formatCounts;
std::set<std::filesystem::path> VendorLogCapture::ignoredLogs;

void VendorLogCapture::Start(wpi::log::DataLog *log,
                             const std::string &directory) {
  // Initialize configuration
  if (dataLog != nullptr) {
    return;
  }
  dataLog = log;
  captureDirectory = std::filesystem::path(directory);

  // Ensure that the log directory exists
  if (!std::filesystem::exists(captureDirectory)) {
    std::error_code ec;
    std::filesystem::create_directories(captureDirectory, ec);
  }

  // Remove any pre-existing capturable logs
  CleanCapturableLogs();

  // Start the capture notifier
  notifier = std::make_unique<wpi::Notifier>(&VendorLogCapture::Periodic);
  notifier->SetName("VendorLogCapture");
  notifier->StartPeriodic(wpi::units::second_t(0.2));

  // Print status
  std::cerr << "[VendorLogCapture] Searching for logs in \"" << directory
            << "\"" << std::endl;
}

void VendorLogCapture::Periodic() {
  // Check for new files in the directory tree.
  if (!std::filesystem::exists(captureDirectory)) {
    return;
  }

  std::error_code ec;
  for (const auto &entry : std::filesystem::recursive_directory_iterator(
           captureDirectory,
           std::filesystem::directory_options::skip_permission_denied, ec)) {
    if (ec)
      break;
    if (entry.is_regular_file()) {
      auto file = entry.path();
      if (IsCapturable(file) && trackedLogs.find(file) == trackedLogs.end() &&
          ignoredLogs.find(file) == ignoredLogs.end()) {
        std::string extension = GetExtension(file);
        if (extension.empty()) {
          continue;
        }

        // Generate entry name
        std::string entryBaseName = extension;
        std::transform(entryBaseName.begin(), entryBaseName.end(),
                       entryBaseName.begin(), ::toupper);
        if (entryBaseName == "HOOT") {
          entryBaseName = "Hoot";
        }

        int currentCount = formatCounts[entryBaseName];
        formatCounts[entryBaseName] = currentCount + 1;
        std::string entryName =
            "/" + entryBaseName +
            (currentCount == 0 ? "" : std::to_string(currentCount));

        // Initialize capture
        auto stream = std::make_shared<std::ifstream>(file, std::ios::binary |
                                                                std::ios::ate);
        if (!stream->is_open()) {
          std::cerr << "[VendorLogCapture] Could not open log \""
                    << file.string() << "\"" << std::endl;
          continue;
        }
        stream->seekg(0, std::ios::beg);

        std::string extLower = extension;
        std::transform(extLower.begin(), extLower.end(), extLower.begin(),
                       ::tolower);
        wpi::log::RawLogEntry logEntry(*dataLog, entryName, "",
                                       "log:" + extLower);

        trackedLogs.emplace(file,
                            TrackedLog(stream, std::move(logEntry), file));

        // Create marker file
        std::filesystem::path markerPath = file;
        markerPath.replace_filename("." + file.filename().string() +
                                    ".captured");
        std::ofstream markerStream(markerPath);
        markerStream.close();

        // Print status
        std::cerr << "[VendorLogCapture] Capturing log \"" << file.string()
                  << "\" to entry \"" << entryName << "\"" << std::endl;
      }
    }
  }

  // Capture new data from each log
  for (auto &[path, log] : trackedLogs) {
    while (true) {
      log.stream->clear();
      log.stream->seekg(log.currentOffset, std::ios::beg);
      log.stream->read(reinterpret_cast<char *>(readBuffer.data()),
                       readBuffer.size());
      std::streamsize bytesRead = log.stream->gcount();

      if (bytesRead <= 0) {
        break; // Reached current EOF
      }

      log.entry.Append(std::span<const uint8_t>(readBuffer.data(), bytesRead));
      log.currentOffset += bytesRead;
    }
  }
}

bool VendorLogCapture::IsCapturable(const std::filesystem::path &file) {
  std::string filename = file.filename().string();
  if (filename.length() >= 7 &&
      filename.substr(filename.length() - 7) == ".wpilog") {
    return false;
  }
  if (!filename.empty() && filename[0] == '.') {
    return false;
  }
  return true;
}

std::string VendorLogCapture::GetExtension(const std::filesystem::path &file) {
  std::string filename = file.filename().string();
  size_t dotIndex = filename.find_last_of('.');
  if (dotIndex != std::string::npos && dotIndex > 0 &&
      dotIndex < filename.length() - 1) {
    return filename.substr(dotIndex + 1);
  }
  return "";
}

void VendorLogCapture::CleanCapturableLogs() {
  if (!std::filesystem::exists(captureDirectory)) {
    return;
  }

  std::vector<std::filesystem::path> directories;
  std::error_code ec;
  for (const auto &entry : std::filesystem::recursive_directory_iterator(
           captureDirectory,
           std::filesystem::directory_options::skip_permission_denied, ec)) {
    if (ec)
      break;
    if (entry.is_regular_file()) {
      std::string filename = entry.path().filename().string();
      if (IsCapturable(entry.path())) {
        std::filesystem::path markerPath = entry.path();
        markerPath.replace_filename("." + filename + ".captured");
        if (std::filesystem::exists(markerPath)) {
          std::filesystem::remove(entry.path(), ec);
          std::filesystem::remove(markerPath, ec);
        } else {
          ignoredLogs.insert(entry.path());
        }
      } else if (filename.length() > 10 && filename.front() == '.' &&
                 filename.substr(filename.length() - 9) == ".captured") {
        std::string originalName = filename.substr(1, filename.length() - 10);
        std::filesystem::path originalPath = entry.path();
        originalPath.replace_filename(originalName);
        if (!std::filesystem::exists(originalPath)) {
          std::filesystem::remove(entry.path(), ec);
        }
      }
    } else if (entry.is_directory()) {
      directories.push_back(entry.path());
    }
  }

  // Reverse iterate to perform a post-visit deletion (children before parents)
  for (auto it = directories.rbegin(); it != directories.rend(); ++it) {
    if (*it != captureDirectory) {
      std::error_code ec2;
      std::filesystem::remove(*it, ec2);
    }
  }
}
