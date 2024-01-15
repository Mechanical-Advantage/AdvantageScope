import Log from "../../shared/log/Log";
import { PHOENIX_PREFIX } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";

export default class PhoenixDiagnosticsSource extends LiveDataSource {
  private PORT = 1250;
  private GET_DEVICES_PERIOD = 500;
  private GET_DEVICES_TIMEOUT = 400;
  private GET_SIGNALS_TIMEOUT = 200;
  private PLOT_PERIOD = 50;
  private PLOT_TIMEOUT = 40;
  private PLOT_RESOLUTION = 50;

  private getDevicesInterval: NodeJS.Timeout | null = null;
  private plotInterval: NodeJS.Timeout | null = null;

  private deviceDescriptions: { [key: string]: Response_Device } = {};
  private deviceSignals: { [key: string]: Response_Signal[] } = {};
  private liveStartRealTime: number | null = null;
  private liveStartLogTime: number | null = null;

  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    super.connect(address, statusCallback, outputCallback);

    // Get devices periodically
    let getDevicesPeriodic = () => {
      this.getDevices()
        .then((devices) => {
          let initialConnection = this.status !== LiveDataSourceStatus.Active;
          if (initialConnection) {
            this.log = new Log();
            this.deviceDescriptions = {};
            this.deviceSignals = {};
            this.liveStartRealTime = new Date().getTime() / 1000;
            this.liveStartLogTime = null;
          }
          this.setStatus(LiveDataSourceStatus.Active);
          devices.forEach((device) => {
            // Phoenix 6 devices use a "pro" application regardless of
            // license state. Phoenix 5 devices evices use a different
            // protocol that does not advertise a list of signals, so
            // don't include them in the list
            if (!device.IsPROApplication) return;
            let deviceName = this.getDeviceName(device);
            if (!(deviceName in this.deviceDescriptions)) {
              this.deviceDescriptions[deviceName] = device;
            }
            if (!(deviceName in this.deviceSignals)) {
              this.deviceSignals[deviceName] = [];
            }
            if (this.deviceSignals[deviceName].length === 0) {
              this.getSignals(device).then((signals) => {
                this.deviceSignals[deviceName] = signals;

                // Add fields for all signals
                signals.forEach((signal) => {
                  let key = PHOENIX_PREFIX + "/" + deviceName + "/" + signal.Name;
                  let isEnum = signal.Name in PhoenixEnums;
                  this.log?.createBlankField(key, isEnum ? LoggableType.String : LoggableType.Number);
                  if (signal.Units.length > 0) {
                    this.log?.setMetadataString(
                      key,
                      JSON.stringify({ units: signal.Units, description: signal.Summary })
                    );
                  }
                });
                this.newOutput();
              });
            }
          });
          if (initialConnection) this.newOutput();
        })
        .catch(() => {
          this.setStatus(LiveDataSourceStatus.Connecting);
        });
    };
    getDevicesPeriodic();
    this.getDevicesInterval = setInterval(getDevicesPeriodic, this.GET_DEVICES_PERIOD);

    // Get new plot data periodically
    this.plotInterval = setInterval(() => {
      // Get active signal IDs
      let findActiveSignals = (activeFields: string[]) => {
        let activeSignals: { [key: string]: Response_Signal[] } = {};
        activeFields.forEach((activeField) => {
          if (!activeField.startsWith(PHOENIX_PREFIX)) return;
          let splitKey = activeField.split("/");
          let deviceName: string, signalName: string;
          if (splitKey.length === 3) {
            deviceName = splitKey[1];
            signalName = splitKey[2];
          } else if (splitKey.length === 4) {
            deviceName = splitKey[1] + "/" + splitKey[2];
            signalName = splitKey[3];
          } else {
            return;
          }

          if (!(deviceName in activeSignals)) {
            activeSignals[deviceName] = [];
          }
          if (!(deviceName in this.deviceSignals)) return;
          let signal = this.deviceSignals[deviceName].find((signal) => signal.Name === signalName);
          if (signal === undefined) return;
          if (activeSignals[deviceName].find((prevSignal) => prevSignal.Id === signal!.Id) !== undefined) return;
          activeSignals[deviceName].push(signal);
        });
        return activeSignals;
      };
      let tabsActiveSignals = findActiveSignals([...window.tabs.getActiveFields()]);
      let sidebarActiveSignals = findActiveSignals([...window.sidebar.getActiveFields()]);

      // Choose device to request
      if (Object.keys(sidebarActiveSignals).length + Object.keys(tabsActiveSignals).length === 0) return;
      let deviceName = "";
      let signalCount = 0;
      Object.entries(tabsActiveSignals).forEach(([activeDeviceName, activeDeviceSignals]) => {
        if (activeDeviceSignals.length > signalCount) {
          deviceName = activeDeviceName;
          signalCount = activeDeviceSignals.length;
        }
      });
      if (signalCount === 0) {
        // No active signals for tabs, use sidebar instead
        Object.entries(sidebarActiveSignals).forEach(([activeDeviceName, activeDeviceSignals]) => {
          if (activeDeviceSignals.length > signalCount) {
            deviceName = activeDeviceName;
            signalCount = activeDeviceSignals.length;
          }
        });
      }

      // Merge sidebar and tab signals
      let signals: Response_Signal[] = [];
      if (deviceName in sidebarActiveSignals) {
        signals = signals.concat(signals, sidebarActiveSignals[deviceName]);
      }
      if (deviceName in tabsActiveSignals) {
        signals = signals.concat(signals, tabsActiveSignals[deviceName]);
      }

      // Request data
      if (!(deviceName in this.deviceDescriptions)) return;
      let device = this.deviceDescriptions[deviceName];
      this.getPlotData(
        device,
        signals.map((signal) => signal.Id)
      ).then((points) => {
        // Reset live time based on last timestamp
        if (this.liveStartLogTime === null && this.liveStartRealTime !== null && points.length > 0) {
          this.liveStartLogTime =
            points[points.length - 1].Timestamp - (new Date().getTime() / 1000 - this.liveStartRealTime);
        }

        // Add all points
        points.forEach((point) => {
          Object.entries(point.Signals).forEach(([signalIdStr, value]) => {
            let signalId = Number(signalIdStr);
            let signal = signals.find((signal) => signal.Id === signalId);
            if (signal === undefined) return;
            let fieldKey = PHOENIX_PREFIX + "/" + deviceName + "/" + signal.Name;
            let timestamp = point.Timestamp - this.liveStartLogTime!;
            if (signal.Name in PhoenixEnums) {
              let valueStr = PhoenixEnums[signal.Name][value];
              if (valueStr === undefined) valueStr = "";
              this.log?.putString(fieldKey, timestamp, valueStr);
            } else {
              this.log?.putNumber(fieldKey, timestamp, value);
            }
          });
        });
        this.newOutput();
      });
    }, this.PLOT_PERIOD);
  }

  stop() {
    if (this.getDevicesInterval) clearInterval(this.getDevicesInterval);
    if (this.plotInterval) clearInterval(this.plotInterval);
    super.stop();
  }

  /** Runs the output callback with the current log and an appropriate timestamp supplier. */
  private newOutput() {
    if (this.outputCallback !== null && this.log !== null && this.status !== LiveDataSourceStatus.Stopped) {
      this.log.clearBeforeTime(0.0);
      this.outputCallback(this.log, () => {
        if (this.liveStartRealTime !== null) {
          return new Date().getTime() / 1000 - this.liveStartRealTime;
        } else {
          return 0;
        }
      });
    }
  }

  /** Converts a device object to its simple name. */
  private getDeviceName(device: Response_Device): string {
    let name = device.Model.replaceAll(" ", "");
    if (name.startsWith("CANCoder")) {
      name = "CANcoder";
    } else if (name.startsWith("TalonFX")) {
      name = "TalonFX";
    } else if (name.startsWith("Pigeon2")) {
      name = "Pigeon2";
    }
    name = name + "-" + (device.Name.startsWith(device.Model) ? device.ID.toString() : device.Name);
    if (device.CANivoreDevName.length > 0) {
      name = "CANivore-" + device.CANivoreDevName + "/" + name;
    }
    return name;
  }

  /** Returns the set of attached devices. */
  private async getDevices(): Promise<Response_Device[]> {
    let response = await fetch("http://" + this.address + ":" + this.PORT.toString() + "/?action=getdevices", {
      signal: AbortSignal.timeout(this.GET_DEVICES_TIMEOUT)
    });
    let json = (await response.json()) as Response_GetDevices;
    if (json.GeneralReturn.Error !== 0) throw "Non-zero error code";
    return json.DeviceArray;
  }

  /** Returns the set of available signals for a device. */
  private async getSignals(device: Response_Device): Promise<Response_Signal[]> {
    let response = await fetch(
      "http://" +
        this.address +
        ":" +
        this.PORT.toString() +
        "/?action=getsignals&model=" +
        encodeURIComponent(device.Model) +
        "&id=" +
        device.ID.toString() +
        "&canbus=" +
        encodeURIComponent(device.CANbus),
      {
        signal: AbortSignal.timeout(this.GET_SIGNALS_TIMEOUT)
      }
    );
    let json = (await response.json()) as Response_GetSignals;
    if (json.GeneralReturn.Error !== 0) throw "Non-zero error code";
    return json.Signals;
  }

  /** Returns a section of plot data for a set of signals. */
  private async getPlotData(device: Response_Device, signals: number[]): Promise<Response_Point[]> {
    let response = await fetch(
      "http://" +
        this.address +
        ":" +
        this.PORT.toString() +
        "/?action=plotpro&model=" +
        encodeURIComponent(device.Model) +
        "&id=" +
        device.ID.toString() +
        "&canbus=" +
        encodeURIComponent(device.CANbus) +
        "&signals=" +
        signals.map((value) => value.toString()).join(",") +
        "&resolution=" +
        this.PLOT_RESOLUTION.toString(),
      {
        signal: AbortSignal.timeout(this.PLOT_TIMEOUT)
      }
    );
    let json = (await response.json()) as Response_PlotPro;
    if (json.GeneralReturn.Error !== 0) throw "Non-zero error code";
    return json.Points;
  }
}

interface Response {
  GeneralReturn: Response_GeneralReturn;
}

interface Response_GeneralReturn {
  Error: number;
  ErrorMessage: string;
  // ... incomplete
}

interface Response_GetDevices extends Response {
  BusUtilPerc: number;
  DeviceArray: Response_Device[];
}

interface Response_Device {
  CANbus: string;
  CANivoreDevName: string;
  ID: number;
  Model: string;
  Name: string;
  IsPROApplication: boolean;
  // ... incomplete
}

interface Response_GetSignals extends Response {
  Signals: Response_Signal[];
}

interface Response_Signal {
  Id: number;
  Name: string;
  Summary: string;
  Units: string;
}

interface Response_PlotPro extends Response {
  Count: number;
  Points: Response_Point[];
}

interface Response_Point {
  Ordinal: number;
  Timestamp: number;
  Signals: { [key: string]: number };
}

// Valid as of Phoenix 24.0.0-beta-4
const PhoenixEnums: { [key: string]: { [key: number]: string } } = {
  AppliedRotorPolarity: {
    0: "PositiveIsCounterClockwise",
    1: "PositiveIsClockwise"
  },
  BridgeOutput: {
    0: "BridgeReq_Coast",
    1: "BridgeReq_Brake",
    6: "BridgeReq_Trapez",
    7: "BridgeReq_FOCTorque",
    8: "BridgeReq_MusicTone",
    9: "BridgeReq_FOCEasy",
    12: "BridgeReq_FaultBrake",
    13: "BridgeReq_FaultCoast"
  },
  ControlMode: {
    0: "DisabledOutput",
    1: "NeutralOut",
    2: "StaticBrake",
    3: "DutyCycleOut",
    4: "PositionDutyCycle",
    5: "VelocityDutyCycle",
    6: "MotionMagicDutyCycle",
    7: "DutyCycleFOC",
    8: "PositionDutyCycleFOC",
    9: "VelocityDutyCycleFOC",
    10: "MotionMagicDutyCycleFOC",
    11: "VoltageOut",
    12: "PositionVoltage",
    13: "VelocityVoltage",
    14: "MotionMagicVoltage",
    15: "VoltageFOC",
    16: "PositionVoltageFOC",
    17: "VelocityVoltageFOC",
    18: "MotionMagicVoltageFOC",
    19: "TorqueCurrentFOC",
    20: "PositionTorqueCurrentFOC",
    21: "VelocityTorqueCurrentFOC",
    22: "MotionMagicTorqueCurrentFOC",
    23: "Follower",
    24: "Reserved",
    25: "CoastOut",
    26: "UnauthorizedDevice",
    27: "MusicTone",
    28: "MotionMagicVelocityDutyCycle",
    29: "MotionMagicVelocityDutyCycleFOC",
    30: "MotionMagicVelocityVoltage",
    31: "MotionMagicVelocityVoltageFOC",
    32: "MotionMagicVelocityTorqueCurrentFOC",
    33: "MotionMagicExpoDutyCycle",
    34: "MotionMagicExpoDutyCycleFOC",
    35: "MotionMagicExpoVoltage",
    36: "MotionMagicExpoVoltageFOC",
    37: "MotionMagicExpoTorqueCurrentFOC"
  },
  DeviceEnable: {
    1: "Enabled",
    0: "Disabled"
  },
  DifferentialControlMode: {
    0: "DisabledOutput",
    1: "NeutralOut",
    2: "StaticBrake",
    3: "DutyCycleOut",
    4: "PositionDutyCycle",
    5: "VelocityDutyCycle",
    6: "MotionMagicDutyCycle",
    7: "DutyCycleFOC",
    8: "PositionDutyCycleFOC",
    9: "VelocityDutyCycleFOC",
    10: "MotionMagicDutyCycleFOC",
    11: "VoltageOut",
    12: "PositionVoltage",
    13: "VelocityVoltage",
    14: "MotionMagicVoltage",
    15: "VoltageFOC",
    16: "PositionVoltageFOC",
    17: "VelocityVoltageFOC",
    18: "MotionMagicVoltageFOC",
    19: "TorqueCurrentFOC",
    20: "PositionTorqueCurrentFOC",
    21: "VelocityTorqueCurrentFOC",
    22: "MotionMagicTorqueCurrentFOC",
    23: "Follower",
    24: "Reserved",
    25: "CoastOut"
  },
  ForwardLimit: {
    0: "ClosedToGround",
    1: "Open"
  },
  IsProLicensed: {
    0: "NotLicensed",
    1: "Licensed"
  },
  MagnetHealth: {
    1: "Magnet_Red",
    2: "Magnet_Orange",
    3: "Magnet_Green",
    0: "Magnet_Invalid"
  },
  MotionMagicIsRunning: {
    1: "Enabled",
    0: "Disabled"
  },
  ReverseLimit: {
    0: "ClosedToGround",
    1: "Open"
  }
};
