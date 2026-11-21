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

package first.robot;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.wpilib.datalog.DataLog;
import org.wpilib.datalog.RawLogEntry;
import org.wpilib.system.Notifier;

/**
 * <b>AdvantageScope vendor log capture (v1.0)</b>
 * 
 * <p>
 * Automatically captures data from vendor log files into an active
 * {@link DataLog} (.wpilog).
 *
 * <p>
 * Many robot projects generate multiple log files simultaneously: a standard
 * {@code .wpilog} file for WPILib telemetry alongside proprietary files from
 * vendor libraries. Universal logging with AdvantageScope eliminates this split
 * by embedding those vendor logs directly into the main {@code .wpilog}.
 *
 * <p>
 * This class should be initialized in your {@code Robot} constructor as shown
 * below. You must select an appropriate directory (we recommend
 * {@code "/home/systemcore/logs/"}) for temporarily staging
 * vendor logs during capture.
 *
 * <pre>{@code
 * public Robot() {
 *   // Start WPILib's DataLogManager normally
 *.  DataLogManager.start();
 * 
 *.  // Enable vendor log capturing from a temporary staging directory
 *.  // We recommend staging vendor logs on the internal storage even
 *.  // when using a USB drive (vendor logs do not persist after capture)
 *.  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");
 * 
 *.  // Start the vendor logger AFTER log capture is enabled
 *.  // If configurable, the output directory must match the path above
 *.  VendorLogger.setPath("/home/systemcore/logs/");
 *.  VendorLogger.start();
 * }
 * }</pre>
 */
public class VendorLogCapture {
  private static final int CHUNK_SIZE = 65536;
  private static final int MAX_CHUNKS_PER_CYCLE = 6;
  private static final long MAX_UNCAPTURED_BYTES = 1048576; // 1 MB

  private static DataLog dataLog;
  private static Path captureDirectory;
  private static Notifier notifier;

  private static final ByteBuffer readBuffer = ByteBuffer.allocateDirect(CHUNK_SIZE);
  private static final Map<Object, TrackedLog> trackedLogs = new HashMap<>();
  private static final Map<String, Integer> formatCounts = new HashMap<>();
  private static final Set<Object> ignoredLogs = new HashSet<>();

  private VendorLogCapture() {
    throw new RuntimeException("This class cannot be instantiated.");
  }

  /**
   * Starts capturing vendor logs from the specified directory into the given
   * {@link DataLog}. This method must be called BEFORE starting any vendor
   * loggers.
   *
   * @param log       The {@link DataLog} to write captured vendor log
   *                  entries into (e.g. {@code DataLogManager.getLog()}).
   * @param directory The path to the staging directory where vendor
   *                  libraries write their log files (such as
   *                  {@code "/U/logs/"} on a USB drive or
   *                  {@code "/home/systemcore/logs/"}).
   */
  public static void start(DataLog log, String directory) {
    // Initialize configuration
    if (dataLog != null) {
      return;
    }
    dataLog = log;
    captureDirectory = Paths.get(directory);

    // Ensure that the log directory exists
    if (!Files.exists(captureDirectory)) {
      try {
        Files.createDirectories(captureDirectory);
      } catch (IOException e) {
      }
    }

    // Remove any pre-existing capturable logs
    cleanCapturableLogs();

    // Start the capture notifier
    notifier = new Notifier(VendorLogCapture::periodic);
    notifier.setName("VendorLogCapture");
    notifier.startPeriodic(0.2);

    // Print status
    System.err.println("[VendorLogCapture] Searching for logs in \"" + directory + "\"");
  }

  private static void periodic() {
    // Ensure DataLog stays active even when DS is disconnected
    dataLog.resume();

    // Check for new files in the directory tree.
    try {
      if (!Files.exists(captureDirectory)) {
        return;
      }
      Files.walkFileTree(captureDirectory, new SimpleFileVisitor<Path>() {
        @Override
        public FileVisitResult visitFileFailed(Path file, IOException exc) {
          return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
          Object fileKey = getFileKey(file, attrs);
          TrackedLog existing = trackedLogs.get(fileKey);
          if (existing != null) {
            if (!existing.filePath.equals(file)) {
              // File was renamed, move the marker and update the tracked path
              try {
                Files.deleteIfExists(getMarkerPath(existing.filePath));
              } catch (IOException e) {
              }
              existing.filePath = file;
              writeMarkerOffset(file, existing.currentOffset);
            }
            return FileVisitResult.CONTINUE;
          }

          if (isCapturable(file) && !ignoredLogs.contains(fileKey)) {
            String extension = getExtension(file);
            if (extension.isEmpty()) {
              return FileVisitResult.CONTINUE;
            }

            // Generate entry name
            String entryBaseName = extension.equalsIgnoreCase("hoot") ? "Hoot" : extension.toUpperCase();
            int currentCount = formatCounts.getOrDefault(entryBaseName, 0);
            formatCounts.put(entryBaseName, currentCount + 1);
            String entryName = "/" + entryBaseName + (currentCount == 0 ? "" : String.valueOf(currentCount));

            // Initialize capture
            try {
              FileChannel channel = FileChannel.open(file, StandardOpenOption.READ);
              RawLogEntry entry = new RawLogEntry(dataLog, entryName, "", "log:" + extension.toLowerCase());
              trackedLogs.put(fileKey, new TrackedLog(channel, entry, file));

              // Create marker file
              writeMarkerOffset(file, 0);

              // Print status
              System.err.println("[VendorLogCapture] Capturing log \"" + file + "\" to entry \"" + entryName + "\"");
            } catch (IOException e) {
              System.err.println("[VendorLogCapture] Could not open log \"" + file + "\"");
            }
          }
          return FileVisitResult.CONTINUE;
        }
      });
    } catch (IOException e) {
    }

    // Capture new data from each log
    int totalChunks = 0;
    for (TrackedLog log : trackedLogs.values()) {
      boolean updated = false;
      try {
        while (totalChunks < MAX_CHUNKS_PER_CYCLE) {
          readBuffer.clear();
          int bytesRead = log.channel.read(readBuffer, log.currentOffset);

          if (bytesRead <= 0) {
            break; // Reached current EOF
          }

          readBuffer.flip();
          byte[] dataChunk = new byte[bytesRead];
          readBuffer.get(dataChunk);

          log.entry.append(dataChunk);
          log.currentOffset += bytesRead;
          totalChunks++;
          updated = true;
        }
      } catch (IOException e) {
        // File may have been temporarily locked; retry next cycle
      }
      if (updated) {
        writeMarkerOffset(log.filePath, log.currentOffset);
      }
      if (totalChunks >= MAX_CHUNKS_PER_CYCLE) {
        break;
      }
    }
  }

  /**
   * Checks if a file is a capturable log file. Excludes WPILOG and hidden files.
   */
  private static boolean isCapturable(Path file) {
    String filename = file.getFileName().toString();
    return !filename.endsWith(".wpilog") && !filename.endsWith(".wpilogxz") && !filename.startsWith(".");
  }

  /**
   * Extracts the file extension from a path.
   */
  private static String getExtension(Path file) {
    String fileName = file.getFileName().toString();
    int dotIndex = fileName.lastIndexOf('.');
    if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
      return fileName.substring(dotIndex + 1);
    }
    return "";
  }

  /**
   * Returns the platform file key if available, falling back to the path.
   */
  private static Object getFileKey(Path file, BasicFileAttributes attrs) {
    Object fileKey = attrs.fileKey();
    return fileKey != null ? fileKey : file;
  }

  /**
   * Returns the capture marker path corresponding to a log file.
   */
  private static Path getMarkerPath(Path file) {
    return file.resolveSibling("." + file.getFileName().toString() + ".captured");
  }

  /**
   * Writes the captured byte offset to the marker file.
   */
  private static void writeMarkerOffset(Path file, long offset) {
    try {
      Files.writeString(
          getMarkerPath(file),
          Long.toString(offset),
          StandardCharsets.UTF_8,
          StandardOpenOption.CREATE,
          StandardOpenOption.TRUNCATE_EXISTING,
          StandardOpenOption.WRITE);
    } catch (IOException e) {
    }
  }

  /**
   * Reads the captured byte offset from a marker file, or returns -1 if invalid.
   */
  private static long readMarkerOffset(Path markerPath) {
    try {
      return Long.parseLong(Files.readString(markerPath, StandardCharsets.UTF_8).trim());
    } catch (IOException | NumberFormatException e) {
      return -1;
    }
  }

  /**
   * Cleans any capturable log files and subdirectories.
   */
  private static void cleanCapturableLogs() {
    try {
      if (!Files.exists(captureDirectory)) {
        return;
      }

      Files.walkFileTree(captureDirectory, new SimpleFileVisitor<Path>() {
        @Override
        public FileVisitResult visitFileFailed(Path file, IOException exc) {
          return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
          String filename = file.getFileName().toString();
          if (isCapturable(file)) {
            Path markerPath = getMarkerPath(file);
            if (Files.exists(markerPath)) {
              long capturedOffset = readMarkerOffset(markerPath);
              long fileSize = attrs.size();
              Files.deleteIfExists(markerPath);
              if (capturedOffset >= 0 && fileSize - capturedOffset <= MAX_UNCAPTURED_BYTES) {
                Files.deleteIfExists(file);
              } else {
                ignoredLogs.add(getFileKey(file, attrs));
              }
            } else {
              ignoredLogs.add(getFileKey(file, attrs));
            }
          } else if (filename.startsWith(".") && filename.endsWith(".captured")) {
            String originalName = filename.substring(1, filename.length() - 9);
            if (!Files.exists(file.resolveSibling(originalName))) {
              Files.deleteIfExists(file);
            }
          }
          return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
          if (!Files.isSameFile(dir, captureDirectory)) {
            try {
              Files.delete(dir);
            } catch (DirectoryNotEmptyException | NoSuchFileException ignored) {
            } catch (IOException e) {
            }
          }
          return FileVisitResult.CONTINUE;
        }
      });
    } catch (IOException e) {
    }
  }

  private static class TrackedLog {
    final FileChannel channel;
    final RawLogEntry entry;
    volatile Path filePath;
    long currentOffset;

    TrackedLog(FileChannel channel, RawLogEntry entry, Path filePath) {
      this.channel = channel;
      this.entry = entry;
      this.filePath = filePath;
      this.currentOffset = 0;
    }
  }
}