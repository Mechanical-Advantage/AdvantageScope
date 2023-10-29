# Custom Assets

_[< Return to homepage](/docs/INDEX.md)_

AdvantageScope uses a default set of flat field images, field models, robot models, and joystick configurations. Simple assets (e.g. evergreen fields) are included in the initial installation. Detailed assets (e.g. season-specific fields) are downloaded automatically in the background when AdvantageScope is connected to the internet. To check the status of these downloads, click "Help" > "Asset Download Status...".

The set of assets can be customized to add more options if desired. To open the user assets folder, click "Help" > "Show Assets Folder". The expected formats for the assets are defined below. See the default set of [detailed assets](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) and [bundled assets](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) for reference.

## General Format

All assets are stored in folders with the naming convention "TYPE_NAME". The NAME used for the folder is not displayed by AdvantageScope. The possible asset types are:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

> Note: Example folder names would be "Field2d_2023Field", "Joystick_OperatorButtons", or "Robot_Dozer".

This folder should contain a file named "config.json" and one or more asset files, as described below. The config file always includes the name of the asset to be displayed by AdvantageScope. This name must be unique for each asset type.

```
{
  "name": string // Unique name, required for all asset types
  ... // Type-dependent configuration, described below
}
```

## Flat Field Images

An image must be included in the folder with the name "image.png". It should be oriented with the blue alliance on the left. The config file must be in the following format:

```
{
  "name": string // Unique name, required for all asset types
  "sourceUrl": string // Link to the original file, optional
  "topLeft": [number, number] // Pixel coordinate (origin at upper left)
  "bottomRight": [number, number] // Pixel coordinate (origin at upper left)
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}
```

## 3D Field Models

A model must be included in the folder with the name "model.glb". After all rotations are applied, the field should be oriented with the blue alliance on the left. CAD files must be converted to glTF; see [this page](/docs/GLTF-CONVERT.md) for details. The config file must be in the following format:

```
{
  "name": string // Unique name, required for all asset types
  "sourceUrl": string // Link to the original file, optional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}
```

## 3D Robot Models

A model must be included in the folder with the name "model.glb". CAD files must be converted to glTF; see [this page](/docs/GLTF-CONVERT.md) for details. The config file must be in the following format:

```
{
  "name": string // Unique name, required for all asset types
  "sourceUrl": string // Link to the original file, optional
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

The simplest way to determine appropriate position and rotation values is by trial and error. We recommend adjusting rotation before position as the transforms are applied in this order.

### Articulated Components

Robot models can contain articulated components for visualizing mechanism data (see [here](/docs/tabs/3D-FIELD.md) for details). The base glTF model should include no components, then each component should be exported as a separate glTF model. Components models follow the naming convention "model_INDEX.glb", so the first articulated component would be "model_0.glb"

Component configuration is provided in the robot's config file. An array of components should be provided under the "components" key. When no component poses are provided by the user in AdvantageScope, the component models will be positioned using the default robot rotations and position (see above). When component poses are provided by the user, the "zeroed" rotations and position are instead applied to bring each component to the robot origin. The user's poses are then applied to move each component to the correct location on the robot.

```
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
    "zeroedPosition": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
  }
]
```

## Joysticks

An image must be included in the folder with the name "image.png". The config file must be in the following format:

```
{
  "name": string // Unique name, required for all asset types
  "components": [...] // Array of component configurations, see below
}
```

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
