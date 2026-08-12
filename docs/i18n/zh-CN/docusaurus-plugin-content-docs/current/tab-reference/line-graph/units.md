# 单位支持 {#unit-support}

折线图选项卡具备单位感知能力，这意味着可以轻松在兼容的单位类型之间转换数值。当单位信息可用时，在 Y 轴或图例中显示的所有数值也都会被准确标记。关于发布单位信息的更多信息，请参阅 [此处](#supported-formats)。AdvantageScope 提供了多种在单位之间快速转换的工具：

- 当在 **同一轴上添加具有兼容单位类型的字段** 时，AdvantageScope 会自动将两个字段转换为相同的单位。这会反映在 Y 轴和图例的标记中。
- 点击轴标题附近的三个点可 **快速切换到其他单位**。此列表包含与所选字段兼容的最常见单位。
- 启用 **积分或求导**（[文档](/tab-reference/line-graph/#integration-and-differentiation)）以查看准确的积分或导数单位。基准单位可以使用菜单进行调整，以支持以非原生单位进行过滤。

<img src="/img/tab-reference/line-graph/units-1.png" alt="单位感知图表" />

## 受支持的格式 {#supported-formats}

AdvantageScope 支持多种提供每个字段单位信息的方法。支持大多数常见单位；有关完整列表，请在配置 [手动转换](#manual-conversion) 时查看弹出菜单。

对于 (2) 和 (3)，单位类型使用字符串进行解析。AdvantageScope 支持每个单位的多个名称，包括常见的缩写（例如 `ft` 和 `feet` 均可）。请注意，无论 AdvantageScope 中选择了什么语言，单位名称都必须使用国际单位制 (SI) 符号或美式英语提供。如果单位名称没有按预期被解析，请 [提交 issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues)。

:::tip
不确定单位是否被正确解析？请检查将字段添加到折线图时 Y 轴上是否显示了单位类型。
:::

### 🥇 结构体单位 {#struct-units}

AdvantageScope 自动对常见的结构化数据类型（如 `Rotation2d` 和 `Translation3d`）使用原生单位。使用这些格式发布适用值 **始终是发布数据的最佳方式**，并能在可视化几何数据时确保最大程度的兼容性。

### 🥈 字段元数据 {#field-metadata}

WPILOG 和 NetworkTables 格式支持为每个字段发布附加的“元数据”。AdvantageScope 会查找名为“unit”或“units”且包含单位类型字符串名称的 JSON 字段（使用空格、驼峰命名法、帕斯卡命名法或蛇形命名法）。要检查每个字段的元数据，请将光标悬停在侧边栏中的字段名称上。

:::tip
AdvantageKit 在记录输入和输出（包括注解日志记录）时包含对单位元数据的支持。有关细节，请参阅 [此处](https://docs.advantagekit.org/data-flow/supported-types#units) 的文档。
:::

### 🥉 字段命名 {#field-naming}

作为回退方案，AdvantageScope 会尝试通过解析每个字段的名称来确定正确的单位类型。**单位类型必须作为后缀包含。** AdvantageScope 支持多种命名方案。下面列出了一些有效的选项：

- **驼峰/帕斯卡命名法**，例如 `PositionMeters`、`velocityRadPerSec` 和 `TimestampS`
- **蛇形命名法**，例如 `position_meters`、`velocity_rad_per_sec` 和 `timestamp_s`
- **空格分隔符**，例如 `position meters`、`velocity rad per sec` 和 `timestamp s`

使用蛇形命名法或空格分隔符时，命名 _不_ 区分大小写。

:::tip
如果单位解析错误，点击 `手动转换` > `禁用自动单位` 以忽略单位信息。然后可以使用手动转换切换到其他单位。
:::

## 手动转换 {#manual-conversion}

当单位元数据不可用或不准确时，也可以手动配置轴在单位之间进行转换（或完全忽略单位元数据）。

要配置手动转换，请点击轴标题附近的三个点，然后点击 `手动转换` > `编辑转换...`。选择单位类型、原单位和目标单位。每个值还会乘以“额外因数”，从而允许自定义转换（如齿轮比、角量到线量的转换，或 AdvantageScope 未提供的其他单位）。因数也可以使用数学表达式输入，例如 `1.5*pi`。

:::tip
要快速启用或禁用单位转换，请点击轴标题附近的三个点，然后选择 `近期预设` 或 `重置单位`。
:::

<img src="/img/tab-reference/line-graph/units-2.png" alt="编辑单位转换" />
