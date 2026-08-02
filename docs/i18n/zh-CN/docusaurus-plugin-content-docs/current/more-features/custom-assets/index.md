# ⚙️ 自定义资源 {#custom-assets}

AdvantageScope 使用一组默认的平面场地图像、场地模型、机器人模型和控制器配置。简单资源（例如常青场地）包含在初始安装中。当 AdvantageScope 连接到互联网时，详细资源（例如特定赛季的场地）会在后台自动下载。要检查这些下载的状态，请点击 `应用程序`/`AdvantageScope` > `资源下载状态...`。

如果需要，可以自定义资源集以添加更多选项。要打开用户资源文件夹，请点击 `应用程序`/`AdvantageScope` > `显示资源文件夹`。资源的预期格式定义如下。作为参考，请参阅 [详细资源](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) 和 [内置资源](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) 的默认集合。

:::tip
要从替代位置加载资源，请点击 `应用程序`/`AdvantageScope` > `使用自定义资源文件夹`。所选文件夹应该是可以放置位于不同子文件夹中的多个资源的 _父文件夹_。此功能允许将自定义资源与机器人代码一起存储在版本控制之下。
:::

## 常规格式 {#general-format}

所有资源都存储在具有命名规范 "TYPE_NAME" 的文件夹中。AdvantageScope 不会显示文件夹使用的 NAME。可能的资源类型为：

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
文件夹名称示例包括 “Field2d_2023Field”、“Joystick_OperatorButtons”或“Robot_Dozer”。
:::

此文件夹应包含一个名为 "config.json" 的文件和一个或多个资源文件，如下所述。配置文件始终包含在 AdvantageScope 中显示的资源名称。此名称对于每种资源类型都必须是唯一的。

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  ... // 依赖于类型的配置，如下所述
}
```

## 3D 机器人模型 {#3d-robot-models}

### 视频教程 {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### 概述 {#overview}

文件夹中必须包含名为“model.glb”的模型。CAD 文件必须转换为 glTF；有关详细信息，请参阅 [此页面](gltf-convert)。配置文件必须采用以下格式：

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  "isFTC": boolean // 模型是否打算在 FTC 场地而非 FRC 场地上使用（默认为 "false"）
  "disableSimplification": boolean // 是否禁用模型简化，可选
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
  "position": [number, number, number] // 位置偏移量（以米为单位），在旋转后应用
  "cameras": [ // 固定相机位置，可以为空
    {
      "name": string // 相机名称
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
      "position": [number, number, number] // 相对于机器人的位置偏移量（以米为单位），在旋转后应用
      "resolution": [number, number] // 像素分辨率，用于设置固定宽高比
      "fov": number // 水平视野（以度为单位）
    }
  ],
  "components": [...] // 参见“铰接组件”
}
```

确定适当位置和旋转值的最简单方法是反复试验。我们建议在调整位置之前调整旋转，因为变换是按照此顺序应用的。

:::info
AdvantageScope 会自动简化模型几何形状以提高性能，其中细节水平取决于所选的 [渲染模式](/tab-reference/3d-field#rendering-modes)。在模型简化在自定义资源中产生非预期效果的情况下，可以使用两种解决方案：

- 要禁用特定网格的自动移除，请在网格名称中包含字符串 `NOSIMPLIFY`。
- 要禁用整个机器人模型的模型简化，请将配置中的 `disableSimplification` 选项设置为 `true`。

:::

### 铰接组件 {#articulated-components}

:::warning
设置铰接组件可能非常复杂且耗时。可考虑使用 AdvantageScope 的 3D [`Mechanism2d` 支持](/tab-reference/3d-field#2d-mechanisms)，它提供了在 **3D 场地上可视化机构** 的更简化方法。
:::

机器人模型可以包含用于可视化机构数据的铰接组件（细节参阅 [此处](/tab-reference/3d-field)）。基础 glTF 模型应不包含任何组件，然后每个组件都应导出为单独的 glTF 模型。组件模型遵循命名规范“model_INDEX.glb”，因此第一个铰接组件将是“model_0.glb”

组件配置在机器人的配置文件中提供。应在 "components" 键下提供一个组件数组。当用户在 AdvantageScope 中未提供任何组件位姿时，组件模型将使用默认的机器人旋转和位置进行定位（见上文）。当用户提供组件位姿时，则应用“归零”的旋转和位置将每个组件带到机器人原点。然后应用用户的位姿将每个组件移动到机器人上的正确位置。

:::tip
在相对于机器人对 3D 组件进行定位时，坐标系原点与已发布的机器人位姿相匹配。请注意，此位姿通常使用高度零——即地板平面，而 _不是_ 机器人底盘（对于典型的 2D 机器人运动）。
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
    "zeroedPosition": [number, number, number] // 相对于机器人的位置偏移量（以米为单位），在旋转后应用
  }
]
```

#### 设置过程 {#setup-process}

要校准铰接组件的位置，我们推荐以下过程：

1. 在其正确的“默认”位置导出基础模型和组件。如果没有在 AdvantageScope 中提供组件位姿，它们就应该这样被渲染。

2. 从机器人代码发布一个归零的 2D 位姿，然后在 AdvantageScope 中将其选择为机器人位姿。切换到显示场地原点的 "Axes" 3D 场地。

3. 调整机器人的整体旋转（而不是组件的旋转），直到整个机器人方向正确。然后，调整整体位置将整个机器人带到原点。在此过程中，组件应始终渲染在相同的默认位置。

4. 从机器人代码发布一个 3D 归零位姿数组，其数量与模型中的组件数量相匹配，然后在 AdvantageScope 中将其选择为组件位姿集合。

5. 调整每个组件的旋转，随后调整位置，直到它们对齐到原点。例如，机械臂段在沿 X 轴朝前的同时，其枢轴将与原点对齐。

6. 从机器人代码发布真实的组件位姿，这些位姿将基于每个组件新定义的原点。例如，机械臂段的位姿将放置在机械臂的关节处，并指向该段的方向。

## 控制器 {#joysticks}

文件夹中必须包含名为 "image.png" 的图像。配置文件必须采用以下格式：

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  "components": [...] // 组件配置数组，见下文
}
```

:::info
按钮、摇杆和轴数值支持 [SDL](https://www.libsdl.org) 绑定（当前的 FIRST Driver Station 使用）和 NI 绑定（旧的 NI FRC Driver Station 使用）。必须为每个组件提供至少一套绑定。

对于 NI 绑定，AdvantageScope 反向兼容旧的不带前缀的配置键（例如 `sourceIndex`）。**所有新控制器都应使用显式的 SDL 绑定（例如 `sdlSourceIndex`），以兼容当前的 FIRST Driver Station。**
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

文件夹中必须包含名为 "image.png" 的图像。它的方向应该是红方联盟在左侧。配置文件必须采用以下格式：

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  "isFTC": boolean // 这是否是 FTC 场地而不是 FRC 场地
  "coordinateSystem": // 要使用的默认坐标系（见下文）
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC 传统
      "center-red"       // Systemcore
  "useGrid": boolean // 如果此场地是 FTC 场地，是否渲染网格线（默认为 "true"）
  "sourceUrl": string // 原始文件的链接，可选
  "topLeft": [number, number] // 像素坐标（原点在左上角）
  "bottomRight": [number, number] // 像素坐标（原点在左上角）
  "widthInches": number // 场地的实际宽度（长边）
  "heightInches": number // 场地的实际高度（短边）
}
```

## 3D 场地模型 {#3d-field-models}

文件夹中必须包含名为“model.glb”的模型。应用所有旋转后，场地的方向应该是红方联盟在左侧。CAD 文件必须转换为 glTF；有关详细信息，请参阅 [此页面](gltf-convert)。游戏元素模型根据它们在 “gamePieces”数组中出现的顺序，遵循命名规范“model_INDEX.glb”。无论任何其他配置选项如何，此处声明的 AprilTag 始终使用 [中心/红色](/more-features/coordinate-systems#center-red) 坐标系进行定位。

配置文件必须采用以下格式：

```json
{
  "name": string // 唯一名称，所有资源类型均需要
  "isFTC": boolean // 这是否是 FTC 场地而不是 FRC 场地
  "coordinateSystem": // 要使用的默认坐标系（见下文）
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC 传统
      "center-red"       // Systemcore
  "useGrid": boolean // 如果此场地是 FTC 场地，是否渲染网格线（默认为 "true"）
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
  "widthInches": number // 场地的实际宽度（长边）
  "heightInches": number // 场地的实际高度（短边）
  "defaultOrigin": "auto" | "blue" | "red" // 默认原点位置，若未指定则为 "auto"
  "driverStations": [
    [number, number] // 操控站位置（相对于场地中心的 X 和 Y，单位为米）
    ...              // 对于 FRC，6 个元素排序为 [B1, B2, B3, R1, R2, R3]。对于 FTC，4 个元素排序为 [BL, BR, RL, RR]。
  ]
  "gamePieces": [ // 游戏元素类型列表
    {
      "name": string // 游戏元素名称
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
      "position": [number, number, number] // 位置偏移量（以米为单位），在旋转后应用
      "stagedObjects": string[] // 暂存游戏元素对象的名称，如果提供了用户位姿则进行隐藏
    },
    ...
  ],
  "aprilTags": [ // 补充 AprilTag 模型列表（如果不属于场地模型的一部分）
    "variant": string // 格式为 "FAMILY-SIZEin"，其中 "FAMILY" 为 "36h11" 或 "16h5"，"SIZE" 为黑色部分的长度
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 轴的旋转序列
    "position": [number, number, number] // 位置偏移量（以米为单位），在旋转后应用
  ]
}
```
