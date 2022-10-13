This folder contains extra resources for the odometry, 3D field, and joystick views. See the sections below for the expected formats. You must restart Advantage Scope for the changes to take effect.

> Example data folder: https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/frcData

========== FLAT FIELD IMAGES ==========

Files must follow the naming convention "Field2d_NAME.json" and "Field2d_NAME.png". The image should be oriented with the blue alliance on the left. The JSON file must be in the following format:

{
  "sourceUrl": string
  "topLeft": [number, number] // Pixel coordinate (origin at upper left)
  "bottomRight": [number, number] // Pixel coordinate (origin at upper left)
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}

========== 3D FIELD MODELS ==========

Files must follow the naming convention "Field3d_NAME.json" and "Field3d_NAME.glb". After all rotations are applied, the field should be oriented with the blue alliance on the left. CAD files must be converted to gLTF (.glb). The JSON file must be in the following format:

{
  "sourceUrl": string
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}

========== 3D ROBOT MODELS ==========

Files must follow the naming convention "Robot_NAME.json" and "Robot_NAME.glb". CAD files must be converted to gLTF (.glb). The JSON file must be in the following format:

{
  "sourceUrl": string
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "position": [number, number, number] // Position offset in meters, applied after rotation
}

The simplest way to determine appropriate position and rotation values is by trial and error. We recommend adjusting rotation before position as the transforms will be applied in this order. You can temporarily adjust these values by opening the developer tools (View > Toggle Developer Tools) and using the following command:

> override3dRobotConfig(name, rotations, position)
> override3dRobotConfig("6328 (Bot-Bot Strikes Back)", [{ "axis": "x", "degrees": 0 }, { "axis": "y", "degrees": 0 }], [0, 0, 0])

The values set using this method are not retained when the app is closed. Please copy them to the JSON config file when you have finished.

========== JOYSTICKS ==========

Files must follow the naming convention "Joystick_NAME.json" and "Joystick_NAME.png". The JSON file must be an array of objects with one of the formats below.

[
  {
    "type": "button"
    "isYellow": boolean
    "isEllipse": boolean
    "centerPx": [number, number]
    "sizePx": [number, number]
    "sourceIndex": number
    "sourcePov": string // Optional, can be "up", "right", "down", or "left". If provided, the "sourceIndex" will be the index of the POV to read.
  },
  {
    "type": "joystick" // A joystick that moves in two dimensions
    "isYellow": boolean
    "centerPx": [number, number]
    "radiusPx": number
    "xSourceIndex": number
    "xSourceInverted": boolean // Not inverted: right = positive
    "ySourceIndex": number
    "ySourceInverted": boolean // Not inverted: up = positive
    "buttonSourceIndex": number // Optional
  },
  {
    "type": "axis" // A single axis value
    "isYellow": boolean
    "centerPx": [number, number]
    "sizePx": [number, number]
    "sourceIndex": number,
    "sourceRange": [number, number]; // Min greater than max to invert
  }
]