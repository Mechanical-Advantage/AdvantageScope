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

Files must follow the naming convention "Field3d_NAME.json" and "Field3d_NAME.glb". After all rotations are applied, the field should be oriented with the blue alliance on the left. CAD files must be converted to gLTF (.glb). The JSON file must be in the following format:

```
{
  "sourceUrl": string // Optional, link to the original file
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}
```

## 3D Robot Models

Files must follow the naming convention "Robot_NAME.json" and "Robot_NAME.glb". CAD files must be converted to gLTF (.glb). The JSON file must be in the following format:

```
{
  "sourceUrl": string // Optional, link to the original file
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "position": [number, number, number] // Position offset in meters, applied after rotation
}
```

The simplest way to determine appropriate position and rotation values is by trial and error. We recommend adjusting rotation before position as the transforms will be applied in this order. To temporarily adjust these values, open the developer tools ("View" > "Toggle Developer Tools") and use the following command:

```
override3dRobotConfig(name, rotations, position)
override3dRobotConfig("6328 (Bot-Bot Strikes Back)", [{ "axis": "x", "degrees": 0 }, { "axis": "y", "degrees": 0 }], [0, 0, 0])
```

The values set using this method are not retained when the app is closed; copy them to the JSON config file when finished.

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
