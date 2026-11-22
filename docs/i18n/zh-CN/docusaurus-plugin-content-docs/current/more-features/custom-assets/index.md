# ⚙️ 自定义资源 {#custom-assets}

AdvantageScope 内置了一套默认的平面场地图像、场地模型、机器人模型和控制器配置。其中，基础资源（如“常青”场地）随安装包自带；而精细资源（如特定赛季的场地）会在 AdvantageScope 联网时于后台自动下载。如需查看下载状态，请点击 `应用程序`/`AdvantageScope` > `资源下载状态...`。

如有需要，你也可以添加自定义资源来扩展可选项。点击 `应用程序`/`AdvantageScope` > `显示资源文件夹` 即可打开用户资源目录。下文详细介绍了各类资源的格式规范，你也可以参考默认的 [精细资源](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) 和 [内置资源](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets)。

:::tip
如果要从其他位置加载资源，请点击 `应用程序`/`AdvantageScope` > `使用自定义资源文件夹`。注意，你选择的应当是 _父文件夹_，里面可以存放多个独立子文件夹形式的资源。这样一来，你就能将自定义资源与机器人代码放在一起进行版本控制。
:::

## 常规格式 {#general-format}

所有资源都保存在以“TYPE_NAME”命名的文件夹中。AdvantageScope 不会显示文件夹名中的 NAME 部分。可用的资源类型包括：

- “Field2d”
- “Field3d”
- “Robot”
- “Joystick”

:::info
文件夹名称示例：“Field2d_2023Field”、“Joystick_OperatorButtons”或“Robot_Dozer”。
:::

该文件夹中应包含一个名为“config.json”的文件以及一个或多个资源文件，具体要求见下文。配置文件中必须包含资源在 AdvantageScope 中显示的名称，且该名称在同一种资源类型中必须唯一。你还可以选择在资源中添加一个“locales”对象，将语言代码（如“es-419”、“fr”、“zh-CN”）映射到对应的翻译名称。如果当前选择的语言未在“locales”中提供，或省略了“locales”字段，系统将默认使用顶层的“name”。

```json
{
  "name": string, // 唯一的默认名称，所有资源类型均需要
  "locales": { [locale: string]: string } // 可选的本地化名称，将语言代码（例如 "es-419"、"fr"）映射到对应翻译
  ... // 因类型而异的配置，见下文说明
}
```

## 3D 机器人模型 {#3d-robot-models}

### 视频教程 {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### 概述 {#overview}

文件夹中必须包含名为“model.glb”的模型文件。CAD 文件需先转换为 glTF 格式，详情请参阅 [此页面](gltf-convert)。配置文件格式如下：

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  "locales": { [locale: string]: string } // 资源名称的可选翻译
  "isFTC": boolean // 模型是否用于 FTC 场地而非 FRC 场地（默认为 "false"）
  "disableSimplification": boolean // 是否禁用模型简化，可选
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
  "position": [number, number, number] // 位置偏移量（单位：米），在旋转后应用
  "cameras": [ // 固定相机位置，可以为空
    {
      "name": string // 相机名称
      "locales": { [locale: string]: string } // 相机名称的可选翻译
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
      "position": [number, number, number] // 相对于机器人的位置偏移量（单位：米），在旋转后应用
      "resolution": [number, number] // 像素分辨率，用于设置固定宽高比
      "fov": number // 水平视野（单位：度）
    }
  ],
  "components": [...] // 参见“关节组件”
}
```

确定合适的位置和旋转参数最简单的方法是反复微调测试。建议先调整旋转，再调整位置，因为软件会按此顺序应用变换。

:::info
AdvantageScope 会自动简化模型几何结构以提升性能，简化程度取决于当前所选的 [渲染模式](/tab-reference/3d-field#rendering-modes)。如果模型简化在自定义资源上产生了意外效果，可以通过以下两种方式解决：

- 若要禁止自动移除特定网格，请在网格名称中包含字符串 `NOSIMPLIFY`。
- 若要禁用整个机器人模型的简化功能，请在配置中将 `disableSimplification` 设为 `true`。

:::

### 关节组件 {#articulated-components}

:::warning
配置关节组件可能较为复杂且耗时。你可以考虑使用 AdvantageScope 的 3D [`Mechanism2d` 支持](/tab-reference/3d-field#2d-mechanisms)，它能以更简单的方式 **在 3D 场地上可视化机构**。
:::

机器人模型可以包含用于可视化机构数据的关节组件（详情参阅 [此处](/tab-reference/3d-field)）。基础 glTF 模型不应包含任何组件，每个组件都应单独导出为独立的 glTF 模型。组件模型按“model_INDEX.glb”命名，例如第一个关节组件应命名为“model_0.glb”。

组件配置在机器人的配置文件中完成，需要在“components”键下提供一个组件数组。如果用户在 AdvantageScope 中未指定任何组件位姿，组件模型将沿用机器人的默认旋转和位置（见上文）；如果指定了组件位姿，系统则会先应用“归零”旋转和位置，将每个组件移至机器人原点，然后再应用用户提供的位姿，将组件移动到机器人上的正确位置。

:::tip
在相对于机器人定位 3D 组件时，坐标系的原点与已发布的机器人位姿一致。请注意，对于常规 2D 机器人运动，该位姿的高度通常为 0——即代表地面，而**不是**机器人底盘。
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
    "zeroedPosition": [number, number, number] // 相对于机器人的位置偏移量（单位：米），在旋转后应用
  }
]
```

#### 设置过程 {#setup-process}

要校准关节组件的位置，建议按以下步骤操作：

1. 按正确的“默认”位置导出基础模型和各个组件。如果 AdvantageScope 中未提供组件位姿，模型就会按此默认位置渲染。

2. 从机器人代码发布一个归零的 2D 位姿，并在 AdvantageScope 中将其选为机器人位姿。将 3D 场地切换为“坐标轴”模式，以显示场地原点。

3. 调整机器人的整体旋转（注意不是组件的旋转），直到整个机器人的朝向正确；接着调整整体位置，将机器人移动到原点。在此过程中，组件应始终保持在原有的默认位置渲染。

4. 从机器人代码发布一个长度与组件数量一致的 3D 归零位姿数组，并在 AdvantageScope 中将其选为组件位姿集合。

5. 依次调整每个组件的旋转和位置，直到它们与原点对齐。例如，对于一段机械臂，应使其旋转枢轴位于原点，并沿 X 轴朝前伸出。

6. 从机器人代码发布实际的组件位姿，这些位姿将基于前面为各组件定义的新原点进行计算。例如，机械臂段的位姿应位于机械臂的关节处，并指向该段机械臂的方向。

## 控制器 {#joysticks}

文件夹中必须包含名为“image.png”的图像文件。配置文件格式如下：

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  "locales": { [locale: string]: string } // 资源名称的可选翻译
  "components": [...] // 组件配置数组，见下文
}
```

:::info
按钮、摇杆和轴数值同时支持 [SDL](https://www.libsdl.org) 绑定（现行 FIRST Driver Station 使用）和 NI 绑定（旧版 NI FRC Driver Station 使用）。每个组件至少需要提供一套绑定配置。

对于 NI 绑定，AdvantageScope 向下兼容旧版不带前缀的配置键（例如 `sourceIndex`）。**所有新建的控制器资源都应使用显式的 SDL 绑定（例如 `sdlSourceIndex`），以兼容现行的 FIRST Driver Station。**
:::

### 单个按钮 / POV 值 {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // 可选，可以是 "up"、"right"、"down" 或 "left"。如果提供，"sdlSourceIndex" 将是要读取的 POV 的索引。

  // NI Driver Station 的替代绑定（可选）
  "niSourceIndex": number
  "niSourcePov": string
}
```

### 双轴摇杆 {#two-axis-joystick}

```json
{
  "type": "joystick" // 在两个维度上移动的摇杆
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // 未取反：右 = 正
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // 未取反：上 = 正
  "sdlButtonSourceIndex": number // 可选

  // NI Driver Station 的替代绑定（可选）
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### 单轴 {#single-axis}

```json
{
  "type": "axis" // 单个轴值
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // 最小值大于最大值以取反

  // NI Driver Station 的替代绑定（可选）
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### 触控板 {#touchpad}

```json
{
  "type": "touchpad" // 触控板
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## 平面场地图像 {#flat-field-images}

文件夹中必须包含名为“image.png”的图像文件，且场地朝向应为红方联盟在左侧。配置文件格式如下：

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  "locales": { [locale: string]: string } // 资源名称的可选翻译
  "isFTC": boolean // 是否为 FTC 场地（而非 FRC 场地）
  "coordinateSystem": // 默认使用的坐标系（见下文）
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC 传统
      "center-red"       // Systemcore
  "useGrid": boolean // 如果此场地为 FTC 场地，是否渲染网格线（默认为 "true"）
  "sourceUrl": string // 原始文件链接，可选
  "topLeft": [number, number] // 像素坐标（原点在左上角）
  "bottomRight": [number, number] // 像素坐标（原点在左上角）
  "widthInches": number // 场地实际宽度（长边）
  "heightInches": number // 场地实际高度（短边）
}
```

## 3D 场地模型 {#3d-field-models}

文件夹中必须包含名为“model.glb”的模型文件。应用所有旋转后，场地朝向应为红方联盟在左侧。CAD 文件需先转换为 glTF 格式，详情请参阅 [此页面](gltf-convert)。游戏元素模型按它们在“gamePieces”数组中出现的顺序，遵循“model_INDEX.glb”命名规范。无论其他配置项如何设置，此处声明的 AprilTag 始终使用 [中心/红方](/more-features/coordinate-systems#center-red) 坐标系进行定位。

配置文件格式如下：

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  "locales": { [locale: string]: string } // 资源名称的可选翻译
  "isFTC": boolean // 是否为 FTC 场地（而非 FRC 场地）
  "coordinateSystem": // 默认使用的坐标系（见下文）
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC 传统
      "center-red"       // Systemcore
  "useGrid": boolean // 如果此场地为 FTC 场地，是否渲染网格线（默认为 "true"）
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
  "widthInches": number // 场地实际宽度（长边）
  "heightInches": number // 场地实际高度（短边）
  "defaultOrigin": "auto" | "blue" | "red" // 默认原点位置，未指定时为 "auto"
  "driverStations": [
    [number, number] // 操控站位置（相对于场地中心的 X 和 Y，单位：米）
    ...              // 对于 FRC，6 个元素按 [B1, B2, B3, R1, R2, R3] 顺序排列；对于 FTC，4 个元素按 [BL, BR, RL, RR] 顺序排列。
  ]
  "gamePieces": [ // 游戏元素类型列表
    {
      "name": string // 游戏元素名称
      "locales": { [locale: string]: string } // 游戏元素名称的可选翻译
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
      "position": [number, number, number] // 位置偏移量（单位：米），在旋转后应用
      "stagedObjects": string[] // 预设放置的游戏元素对象名称，若提供了用户位姿则会将其隐藏
    },
    ...
  ],
  "aprilTags": [ // 补充的 AprilTag 模型列表（若未包含在场地模型中）
    "variant": string // 格式为 "FAMILY-SIZEin"，其中 "FAMILY" 为 "36h11" 或 "16h5"，"SIZE" 为黑色部分的长度
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
    "position": [number, number, number] // 位置偏移量（单位：米），在旋转后应用
  ]
}
```
