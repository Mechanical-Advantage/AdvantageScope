# Custom Fields/Robots/Joysticks

_[< Return to homepage](/docs/INDEX.md)_

AdvantageScope includes a default set of flat field images, field models, robot models, and joystick configurations. These can be customized to add more options if desired. To open the configuration folder, click "Help" > "Show FRC Data Folder". AdvantageScope must be restarted for changes to take effect.

The expected formats for the configuration files are defined below. See the [built-in configurations](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/frcData) for reference.

## Flat Field Images

Files must follow the naming convention "Field2d_NAME.json" and "Field2d_NAME.png". The image should be oriented with the blue alliance on the left. The JSON file must be in the following format:

```
{
  "sourceUrl": string // Optional, link to the original file
  "topLeft": [number, number] // Pixel coordinate (origin at upper left)
  "bottomRight": [number, number] // Pixel coordinate (origin at upper left)
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}
```

## 3D Field Models

Files must follow the naming convention "Field3d_NAME.json" and "Field3d_NAME.glb". After all rotations are applied, the field should be oriented with the blue alliance on the left. CAD files must be converted to glTF; see [this page](/docs/GLTF-CONVERT.md) for details. The JSON file must be in the following format:

```
{
  "sourceUrl": string // Optional, link to the original file
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}
```

## 3D Robot Models

Files must follow the naming convention "Robot_NAME.json" and "Robot_NAME.glb". CAD files must be converted to glTF; see [this page](/docs/GLTF-CONVERT.md) for details. The JSON file must be in the following format:

```
{
  "sourceUrl": string // Optional, link to the original file
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "position": [number, number, number] // Position offset in meters, applied after rotation
  "cameras": [ // Fixed camera positions, can be empty
    {
      "name": string // Camera name
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
      "position": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
      "resolution": [number, number] // Resolution in pixels, used to set the fixed aspect ratio
      "fov": number // Horizontal field of view in degrees
    }
  ],
  "components": [...] // See "Articulated Components"
}
```

The simplest way to determine appropriate position and rotation values is by trial and error. We recommend adjusting rotation before position as the transforms are applied in this order. To temporarily adjust these values, open the developer tools ("View" > "Toggle Developer Tools") and use the following command:

```
override3dRobotConfig(name, rotations, position)
override3dRobotConfig("6328 (Bot-Bot Strikes Back)", [{ "axis": "x", "degrees": 0 }, { "axis": "y", "degrees": 0 }], [0, 0, 0])
```

The values set using this method are not retained when the app is closed; copy them to the JSON config file when finished.

### Articulated Components

Robot models can contain articulated components for visualizing mechanism data (see [here](/docs/tabs/3D-FIELD.md) for details). The base glTF model should include no components, then each component should be exported as a separate glTF model. Components models follow the naming convention "Robot_NAME_INDEX.glb". For example, the first component of the robot "Duck Bot" would be named "Robot_Duck Bot_0.glb".

Component configuration is provided in the robot's JSON file (each robot only has one JSON file). An array of components should be provided under the "components" key. When no component poses are provided by the user, the component models will be positioned using the default robot rotations and position (see above). When component poses are provided by the user, the "zeroed" rotations and position are instead applied to bring each component to the robot origin. The user's poses are then applied to move each component to the correct location on the robot.

```
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
    "zeroedPosition": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
  }
]
```

## Joysticks

Files must follow the naming convention "Joystick_NAME.json" and "Joystick_NAME.png". The JSON file must be an **array of objects** with one of the formats below.

### Single Button / POV Value:

```
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sourceIndex": number
  "sourcePov": string // Optional, can be "up", "right", "down", or "left". If provided, the "sourceIndex" will be the index of the POV to read.
}
```

### Two-Axis Joystick:

```
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
}
```

### Single Axis:

```
{
  "type": "axis" // A single axis value
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sourceIndex": number,
  "sourceRange": [number, number]; // Min greater than max to invert
}
```
