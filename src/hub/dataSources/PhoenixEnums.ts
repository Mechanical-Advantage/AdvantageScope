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
    32: "MotionMagicVelocityTorqueCurrentFOC"
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

export default PhoenixEnums;
