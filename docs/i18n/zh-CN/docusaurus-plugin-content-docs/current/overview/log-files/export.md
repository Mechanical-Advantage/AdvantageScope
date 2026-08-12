# 导出日志数据 {#exporting-log-data}

AdvantageScope 包含一个灵活的系统，可将日志数据导出为 CSV、WPILOG 或 MCAP 文件。导出功能在查看日志文件或连接到实时数据源时均可使用。可能的使用场景包括：

- 将 WPILOG 文件转换为 CSV 或 MCAP，以便在其他应用程序中进行分析。
- 导出基于 NetworkTables 数据的 WPILOG 文件，以便日后访问。
- 保存包含限定数量字段（并已移除重复值）的 WPILOG，以减小文件体积。

要查看导出选项，请点击 `文件` > `导出数据...`。

<img src="/img/overview/log-files/export-1.png" alt="导出选项" />

:::tip
除了此处描述的完整日志导出之外，💬 [控制台](/tab-reference/console) 选项卡还允许将控制台数据导出为文本文件。
:::

:::warning
**为 SysId 导出数据**

我们不建议使用此功能导出 **在仿真中生成的** 日志数据用于 [SysId](https://docs.wpilib.org/zh-cn/stable/docs/software/advanced-controls/system-identification/introduction.html)，因为 SysId 需要与 AdvantageScope 默认导出选项不一致的附加时间戳数据。请注意，**在仿真 _之外_ 生成的** 日志数据可以导出用于 SysId，数据损失极小（尽管通过在 SysId 中直接使用 _原始_ 数据日志可以获得最大的准确性）。

_此警告 **不适用于** 由 AdvantageKit 生成的日志，选择“AdvantageKit 周期”选项导出此类日志不会造成数据损失。有关细节，请参阅 [此页面](https://docs.advantagekit.org/data-flow/sysid-compatibility)。_
:::

## 选项 {#options}

导出时提供以下选项：

- **格式：** 设置导出文件的常规格式。参阅以下选项：
  - _CSV（表格）：_ 逗号分隔值，其中每行代表一个独立的时间戳，每列代表一个字段（加上一列时间戳值）。每行可以代表多个字段中的值。
  - _CSV（列表）：_ 逗号分隔值，其中每行代表单个字段中的值，包含时间戳、键和值的列。
  - _WPILOG：_ 可在 AdvantageScope 中再次打开的标准 WPILOG 文件。
  - _MCAP：_ 可在 [Foxglove](https://foxglove.dev) 中打开的标准 [MCAP](https://mcap.dev) 文件。
- **时间戳：** 仅适用于“CSV（表格）”。设置创建新行的方法。参阅以下选项：
  - _所有更改：_ 仅在字段值更新时创建新行/条目。最大限度地减小导出的文件体积。
  - _固定周期：_ 以固定的时间间隔创建新行/条目，适用于没有时间戳同步的日志（当许多字段正以类似但不完全相同的时间戳进行记录时）。请注意，无论采样点之间是否有更改，都会包含所有值。
  - _AdvantageKit 周期：_ 为每个 AdvantageKit 同步循环周期创建一个新的行/条目。请注意，无论循环周期之间是否有更改，都会包含所有值。
- **周期：** 仅当选择“固定周期”时适用。设置每个采样点之间的周期（以毫秒为单位）。通常，这应该与机器人代码的循环周期匹配。
- **前缀：** 如果留空，则包含所有字段。否则，仅包含与所提供的前缀匹配的字段（用逗号分隔）。参阅以下示例：
  - “_/DriverStation/Joystick0_”：包含以“/DriverStation/Joystick0”开头的所有字段（来自第一个控制器的数据）。
  - “_Flywheels,DS:enabled_”：包含以“/Flywheels”或“DS:enabled”开头的所有字段（来自飞轮的所有数据，加上机器人的启用状态）。
  - “_Drive/LeftPosition,Drive/RightPosition_”：仅包含“/Drive/LeftPosition”和“/Drive/RightPosition”字段。
- **字段集：** 参阅以下选项。生成字段由 AdvantageScope 创建以拆分复杂类型，并在侧边栏中以灰色文本显示。这包括数组、结构体和其他 Schema 的各个组成部分。
  - _包含生成字段：_ 导出所有可查看字段，其中包括生成字段。如果导出的数据将在无法解析复杂类型的应用程序中打开，则推荐使用此选项。
  - _仅原始字段：_ 仅导出原始日志文件中存在的字段，排除生成字段。如果导出的数据将在 AdvantageScope 或能够解析复杂类型的其他应用程序中打开，则推荐使用此选项。

下面显示了从 AdvantageScope 导出的示例 CSV 文件，格式为“CSV（表格）”，时间戳设置为“所有更改”：

<img src="/img/overview/log-files/export-2.png" alt="CSV 表格" />
