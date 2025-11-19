import { ArgumentParser, SubParser } from "argparse";
import ExportOptions from "../shared/ExportOptions";
import fs from "fs";
import Log from "../shared/log/Log";
import WPILOGLoader from "../hub/dataSources/wpilog/WPILOGFileLoader";
import LogExporter from "../hub/LogExporter";
import { xgcd } from "mathjs";
import { AKIT_TIMESTAMP_KEYS, EVENT_KEYS, MATCH_NUMBER_KEYS, MATCH_TYPE_KEYS, SYSTEM_TIME_KEYS } from "../shared/log/LogUtil";
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

  public async parseArgs() {
    let out = this.parser.parse_args();

    if (out.command === "convert") {
      let logs: Log[] = [];
      for (let file of out.input) {
        let data = fs.readFileSync(file); //TODO Error handling
        if (file.endsWith(".wpilog")) {
          try {
            let loader = new WPILOGLoader(() => { });
            let logLoad = await loader.loadFile(data);
            this.updateFieldRequest(logLoad.log, loader)
            console.log(logLoad.log)
            logs.push(logLoad.log);
          } catch (e) {
            console.log(e)
            this.parser.error("Failed to load log: " + file);
            process.exit(1);
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
      let mergedLog = logs[0] //Log.mergeLogs(logs);
      let options: ExportOptions = {
        format: out.format,
        samplingMode: out["sampling-mode"],
        samplingPeriod: out["sampling-period"],
        prefixes: out.prefixes,
        includeGenerated: out["include-generated"]
      };
      fs.writeFileSync(out.output, await LogExporter.generateBin(mergedLog, options));
      process.exit(1)
    }
    // return this.parser.parse_args();
  }
  private fileTypeCheck(parser: ArgumentParser, filename: string, fileFlags: fs.OpenMode) {
    try {
      let fileDescriptor = fs.openSync(filename, fileFlags);
      fs.closeSync(fileDescriptor);
      return filename;
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
      parseField.parseField(field)
    });


  }

}