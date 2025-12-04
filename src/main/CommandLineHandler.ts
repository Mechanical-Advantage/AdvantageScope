import { ArgumentParser, SubParser } from "argparse";
import fs from "fs";
import CSVDecoder from "../hub/dataSources/csv/CSVDecoder";
import { DSEventsReader } from "../hub/dataSources/dslog/DSEventsReader";
import { DSLogReader } from "../hub/dataSources/dslog/DSLogReader";
import RLOGDecoder from "../hub/dataSources/rlog/RLOGDecoder";
import RRLOGDecoder from "../hub/dataSources/roadrunnerlog/RRLOGDecoder";
import WPILOGLoader from "../hub/dataSources/wpilog/WPILOGFileLoader";
import LogExporter from "../hub/LogExporter";
import ExportOptions from "../shared/ExportOptions";
import Log from "../shared/log/Log";
import {
  AKIT_TIMESTAMP_KEYS,
  EVENT_KEYS,
  MATCH_NUMBER_KEYS,
  MATCH_TYPE_KEYS,
  SYSTEM_TIME_KEYS
} from "../shared/log/LogUtil";
import { convertHoot } from "./electron/owletInterface";
// import { AKIT_TIMESTAMP_KEYS, EVENT_KEYS, MATCH_NUMBER_KEYS, MATCH_TYPE_KEYS, SYSTEM_TIME_KEYS } from "../shared/log/LogUtil";
export default class CommandLineHandler {
  private parser: ArgumentParser;
  private subparsers: SubParser;
  constructor() {
    this.parser = new ArgumentParser({
      description: "AdvantageScope CLI"
    });

    this.subparsers = this.parser.add_subparsers({
      title: "subcommands",
      description: "AdvantageScope subcommands",
      help: "Additional help",
      dest: "command"
    });

    this.setupConvertParser();
  }
  private progressStub(value: number) {}
  public async parseArgs() {
    let out = this.parser.parse_args();

    if (out.command === "convert") {
      let logs: Log[] = [];
      for (let fileInput of out.input) {
        let data = fs.readFileSync(fileInput.path); //TODO Error handling
        let type = fileInput.type; //TODO: use file type over path
        let file = fileInput.path;
        if (file.endsWith(".wpilog")) {
          try {
            let loader = new WPILOGLoader(() => {});
            let logLoad = await loader.loadFile(data);
            this.updateFieldRequest(logLoad.log, loader);
            logs.push(logLoad.log);
          } catch (e) {
            console.log(e);
            this.parser.error("Failed to load log: " + file);
            process.exit(1);
          }
        } else if (file.endsWith(".rlog")) {
          let log = new Log(false); // No timestamp set cache for efficiency
          let decoder = new RLOGDecoder(true);
          let success = decoder.decode(log, data, this.progressStub);
          if (success) {
            logs.push(log);
          }
        } else if (file.endsWith(".hoot")) {
          let wpilog_path = await convertHoot(file);
          out.push({ path: wpilog_path, type: "wpilog" }); // Hacky Solution for now. Push new wpilog to path
        } else if (file.endsWith(".dslog")) {
          //TODO: Split this stuff out into the Loader model
          let log = new Log();
          let dsLog = new DSLogReader(data);
          if (!dsLog.isSupportedVersion()) {
            this.parser.error("Error: Unsupported Version");
            return;
          }
          dsLog.forEach((entry) => {
            log.putNumber("/DSLog/TripTimeMS", entry.timestamp, entry.tripTimeMs);
            log.putNumber("/DSLog/PacketLoss", entry.timestamp, entry.packetLoss);
            log.putNumber("/DSLog/BatteryVoltage", entry.timestamp, entry.batteryVolts);
            log.putNumber("/DSLog/CPUUtilization", entry.timestamp, entry.cpuUtilization);
            log.putBoolean("/DSLog/Status/Brownout", entry.timestamp, entry.brownout);
            log.putBoolean("/DSLog/Status/Watchdog", entry.timestamp, entry.watchdog);
            log.putBoolean("/DSLog/Status/DSTeleop", entry.timestamp, entry.dsTeleop);
            log.putBoolean("/DSLog/Status/DSDisabled", entry.timestamp, entry.dsDisabled);
            log.putBoolean("/DSLog/Status/RobotTeleop", entry.timestamp, entry.robotTeleop);
            log.putBoolean("/DSLog/Status/RobotAuto", entry.timestamp, entry.robotAuto);
            log.putBoolean("/DSLog/Status/RobotDisabled", entry.timestamp, entry.robotDisabled);
            log.putNumber("/DSLog/CANUtilization", entry.timestamp, entry.canUtilization);
            log.putNumberArray("/DSLog/PowerDistributionCurrents", entry.timestamp, entry.powerDistributionCurrents);

            // Signal strength and bandwidth are not logged:
            // https://www.chiefdelphi.com/t/alternate-viewer-for-driver-station-logs-dslog/120629/11
            //
            // log.putNumber("/DSLog/WifiDb", entry.timestamp, entry.wifiDb);
            // log.putNumber("/DSLog/WifiMb", entry.timestamp, entry.wifiMb);
          });
          logs.push(log);
        } else if (file.endsWith(".dsevents")) {
          let log = new Log();
          let dsEvents = new DSEventsReader(data);
          if (!dsEvents.isSupportedVersion()) {
            this.parser.error("Error: Unsupported Version");
            return;
          }
          dsEvents.forEach((entry) => {
            log.putString("/DSEvents", entry.timestamp, entry.text);
          });
          logs.push(log);
        } else if (file.endsWith(".log")) {
          let log = new Log(false); // No timestamp set cache for efficiency
          let decoder = new RRLOGDecoder();
          let success = decoder.decode(log, data, this.progressStub);
          if (!success) {
            this.parser.error("Error Loading RRLog");
          } else {
            logs.push(log);
          }
        } else if (file.endsWith(".csv")) {
          try {
            let decodedData = new TextDecoder().decode(data);
            let log = new Log(false); // No timestamp set cache for efficiency

            let decoder = new CSVDecoder();
            decoder.decode(log, decodedData, this.progressStub);

            log.getChangedFields(); // Reset changed fields
            logs.push(log);
            // progress(1);
          } catch (e) {
            // console.error(e);
            this.parser.error(`Error Loading CSV: ${e}`);
            return;
          }
        } else {
          //TODO maybe to file Mime/magic detection
          this.parser.error("Unknown log file type: " + file);
          process.exit(1);
        }
        // rlog
        // dsevents
        // dslogs
        // hoot
      }
      if (logs.length === 0) {
        this.parser.error("No logs loaded, exiting...");
        process.exit(1);
      }
      let mergedLog = new Log();
      logs.forEach((log) => {
        mergedLog.mergeWith(log);
      });
      let options: ExportOptions = {
        format: out.format,
        samplingMode: out["sampling-mode"],
        samplingPeriod: out["sampling-period"],
        prefixes: out.prefixes,
        includeGenerated: out["include-generated"]
      };
      try {
        fs.writeFileSync(out.output.path, await LogExporter.generateBin(mergedLog, options));
      } catch (e) {
        console.log(e);
      }
      console.log("Done");
      process.exit(1);
    }
    // return this.parser.parse_args();
  }
  private fileTypeCheck(parser: ArgumentParser, filename: string, fileFlags: fs.OpenMode) {
    try {
      let fileDescriptor = fs.openSync(filename, fileFlags);
      fs.closeSync(fileDescriptor); // Quick and dirty check for file existance and permissions.
      // TODO: implement magic byte checking.
      let out: any = {};
      out.path = filename;
      if (filename.endsWith(".wpilog")) {
        out.type = "wpilog";
      } else if (filename.endsWith(".rlog")) {
        out.type = "rlog";
      } else if (filename.endsWith(".hoot")) {
        out.type = "hoot";
      } else if (filename.endsWith(".dslog") && filename.endsWith(".dsevents")) {
        out.type = "dslog";
      } else if (filename.endsWith(".log")) {
        out.type = "rrlog";
      } else if (filename.endsWith(".csv")) {
        out.type = "csv";
      } else {
        parser.error(`Unsupported File Type: ${filename}`);
        return;
      }
      return out;
    } catch (e) {
      parser.error(`Error Opening File: ${filename} \n ${e}`);
    }
  }
  private setupConvertParser() {
    const convertParser = this.subparsers.add_parser("convert", { help: "Convert log files" });

    convertParser.add_argument("--input", {
      help: "Input log files",
      required: true,
      type: (x: string) => {
        return this.fileTypeCheck(this.parser, x, "r");
      },
      nargs: "+"
    });

    convertParser.add_argument("--output", {
      help: "Output file",
      type: (x: string) => {
        return this.fileTypeCheck(this.parser, x, "w");
      },
      required: true
    });

    convertParser.add_argument("--format", {
      help: "Export format",
      choices: ["csv-table", "csv-list", "wpilog", "mcap"],
      required: true
    });

    convertParser.add_argument("--sampling-mode", {
      help: "Sampling mode",
      choices: ["changes", "fixed", "akit"],
      default: "changes",
      required: false
    });
    convertParser.add_argument("--sampling-period", {
      help: "Sampling period (milliseconds)",
      default: 20,
      type: "int",
      required: false
    });
    convertParser.add_argument("--prefixes", {
      help: "Prefixes to use",
      default: "",
      required: false
    });
    convertParser.add_argument("--include-generated", {
      help: "Include generated data",
      default: true,
      action: "store_true",
      required: false
    });
  }
  private updateFieldRequest(log: Log, parseField: any) {
    let requestFields: Set<string> = new Set();

    // Need to access all fields, load everything
    log?.getFieldKeys().forEach((key) => {
      requestFields.add(key);
    });

    // Add keys that are always requested
    log?.getFieldKeys().forEach((key) => {
      if (key.includes("/.schema/")) {
        requestFields.add(key);
      }
    });
    [...SYSTEM_TIME_KEYS, ...AKIT_TIMESTAMP_KEYS, ...EVENT_KEYS, ...MATCH_TYPE_KEYS, ...MATCH_NUMBER_KEYS].forEach(
      (key) => requestFields.add(key)
    );

    // Decode schemas and URCL metadata first
    let requestFieldsArray = Array.from(requestFields);
    requestFieldsArray = [
      ...requestFieldsArray.filter(
        (field) =>
          field.includes("/.schema/") ||
          // A bit of a hack but it works
          field.includes("URCL/Raw/Aliases") ||
          field.includes("URCL/Raw/Persistent")
      ),
      ...requestFieldsArray.filter((field) => !field.includes("/.schema/"))
    ];

    // Send requests
    requestFieldsArray.forEach((field) => {
      parseField.parseField(field);
    });
  }
}
