This folder contains extra resources for the odometry and 3D views. See the sections below for the expected formats. You must restart Advantage Scope for the changes to take effect.

> Example data folder: https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/frcData

========== FLAT FIELD IMAGES ==========

Files must follow the naming convention "Field2d_NAME.json" and "Field2d_NAME.png". The JSON file must be in the following format:

{
  sourceUrl: string
  topLeft: [number, number] // Pixel coordinate (origin at upper left)
  bottomRight: [number, number] // Pixel coordinate (origin at upper left)
  widthInches: number // Real width of the field (long side)
  heightInches: number // Real height of the field (short side)
}

========== 3D FIELD MODELS ==========

Files must follow the naming convention "Field3d_NAME.json" and "Field3d_NAME.glb". CAD files must be converted to gLTF (.glb). The JSON file must be in the following format:

{
  sourceUrl: string
  rotations: [number, number, number, number][] // Sequence of rotations in axis-angle form (x, y, z, angle in degrees)
  widthInches: number // Real width of the field (long side)
  heightInches: number // Real height of the field (short side)
}

========== 3D ROBOT MODELS ==========

Files must follow the naming convention "Robot_NAME.json" and "Robot_NAME.glb". CAD files must be converted to gLTF (.glb). The JSON file must be in the following format:

{
  sourceUrl: string
  rotations: [number, number, number, number][] // Sequence of rotations in axis-angle form (x, y, z, angle in degrees)
  position: [number, number, number] // Position offset in meters, applied after rotation
}

The simplest way to determine appropriate position and rotation values is by trial and error. We recommend adjusting rotation before position as the transforms will be applied in this order. You can temporarily adjust these values by opening the developer tools (View > Toggle Developer Tools) and using the following command:

> override3dRobotConfig(name, rotations, position)
> override3dRobotConfig("6328 (Bot-Bot Strikes Back)", [[0, 0, 0, 0], [0, 0, 0, 0]], [0, 0, 0])

THESE VALUES ARE NOT RETAINED WHEN THE APP IS CLOSED. Please copy them to the JSON config file when you have finished.