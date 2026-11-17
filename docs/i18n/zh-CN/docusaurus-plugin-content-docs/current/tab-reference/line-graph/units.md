# 单位支持 {#unit-support}

折线图选项卡支持单位感知，可以在兼容的单位类型之间轻松换算数值。当字段包含单位信息时，坐标轴和图例中的所有数值都会准确标注单位。关于发布单位信息的详细方法，请参阅 [受支持的格式](#supported-formats)。AdvantageScope 提供了多种便捷的单位换算方式：

- **在同一坐标轴上添加单位类型兼容的字段** 时，AdvantageScope 会自动将这些字段换算为统一单位，并在 Y 轴和图例中体现。
- 点击坐标轴标题旁的三个点，即可 **快速切换到其他兼容单位**。列表中会显示与所选字段兼容的常用单位。
- 启用 **积分或求导**（[文档](/tab-reference/line-graph/#integration-and-differentiation)）后，系统会显示对应的积分或导数单位。你也可以通过菜单调整基础单位，以便在非原生单位下进行计算。

<img src="/img/tab-reference/line-graph/units-1.webp" alt="单位感知图表" />

_上图所示为英文界面。_

## 受支持的格式 {#supported-formats}

AdvantageScope 提供了多种为字段添加单位信息的方式，支持绝大多数常见单位；完整列表可在配置 [手动换算](#manual-conversion) 时的弹出菜单中查看。

对于第 (2) 和第 (3) 种方式，系统会通过字符串解析单位类型。AdvantageScope 支持每个单位的多种写法，包括常见缩写（如 `ft` 和 `feet` 均可）以及美式和英式拼写（如 `meters` 和 `metres`）。请注意，无论 AdvantageScope 当前使用哪种界面语言，单位名称都必须使用国际单位制 (SI) 符号或英文。如果某个单位名称未能按预期解析，欢迎在 GitHub 上 [提交 issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues)。

:::tip
不确定单位是否正确解析？将字段添加到折线图后，查看 Y 轴上是否显示了单位类型即可确认。
:::

### 🥇 结构体单位 {#struct-units}

对于 `Rotation2d` 和 `Translation3d` 等常见结构体数据类型，AdvantageScope 会自动使用其原生单位。使用这些格式发布适用数据 **始终是最佳实践**，也能在可视化几何数据时提供最佳兼容性。

### 🥈 字段元数据 {#field-metadata}

WPILOG 和 NetworkTables 格式支持为每个字段发布额外的“元数据”。AdvantageScope 会查找名为 `unit` 或 `units` 的 JSON 字段，其中应包含单位类型的字符串名称（支持空格分隔、驼峰命名法、帕斯卡命名法或蛇形命名法）。将光标悬停在侧边栏的字段名称上，即可查看该字段的元数据。

:::tip
在 WPILib 中，使用 `Telemetry.log()` 记录 `Measure` 对象时会自动附加单位元数据；也可以通过 `Telemetry.setProperty("fieldName", "unit", "\"volts\"")` 显式配置单位元数据。

AdvantageKit 在记录输入和输出时同样支持单位元数据（详情请参阅 [此处](https://docs.advantagekit.org/data-flow/supported-types#units)）。
:::

### 🥉 字段命名 {#field-naming}

作为备选方案，AdvantageScope 会尝试通过解析字段名称来推断单位类型。**单位类型必须作为后缀添加到字段名称末尾。** AdvantageScope 支持多种命名风格，常见有效格式如下：

- **驼峰/帕斯卡命名法**，例如 `PositionMeters`、`velocityRadPerSec` 和 `TimestampS`
- **蛇形命名法**，例如 `position_meters`、`velocity_rad_per_sec` 和 `timestamp_s`
- **空格分隔符**，例如 `position meters`、`velocity rad per sec` 和 `timestamp s`

使用蛇形命名法或空格分隔符时，命名**不**区分大小写。

:::tip
如果单位解析有误，请点击 `手动单位` > `禁用自动单位` 以忽略自动识别的单位信息，随后即可使用手动换算功能切换为其他单位。
:::

## 手动换算 {#manual-conversion}

当单位元数据缺失或不准确时，你可以手动配置坐标轴进行单位换算（或完全忽略单位元数据）。

要配置手动换算，请点击坐标轴标题旁的三个点，然后选择 `手动单位` > `编辑换算...`，接着选择单位类型、原单位和目标单位。每个数值还会乘以“额外因数”，方便你实现自定义换算（例如齿轮比、角量与线量的转换，或 AdvantageScope 未内置的其他单位）。缩放系数也支持输入数学表达式，例如 `1.5*pi`。

:::tip
要快速启用或禁用单位换算，请点击坐标轴标题旁的三个点，然后选择 `最近预设` 或 `重置单位`。
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="编辑单位转换" height="250" />

_上图所示为英文界面。_
