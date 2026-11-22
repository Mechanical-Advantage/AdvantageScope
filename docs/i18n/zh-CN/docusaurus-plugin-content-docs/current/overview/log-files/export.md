# 导出日志数据 {#exporting-log-data}

AdvantageScope 内置灵活的日志导出功能，支持将数据导出为 CSV、WPILOG 或 MCAP 文件。无论是查看离线日志还是连接实时数据源，均可使用导出功能。常见用途包括：

- 将 WPILOG 文件转换为 CSV 或 MCAP 格式，以便在其他软件中进行分析。
- 将接收到的 NetworkTables 实时数据导出为 WPILOG 文件，方便日后查阅。
- 仅导出部分字段（并去除重复值）为 WPILOG，以大幅减小文件体积。

点击 `文件` > `导出数据...` 即可打开导出选项窗口。

<img src="/img/overview/log-files/export-1.webp" alt="导出选项" />

_上图所示为英文界面。_

:::tip
除了此处介绍的完整日志导出功能，💬 [控制台](/tab-reference/console) 选项卡还支持将控制台日志单独导出为文本文件。
:::

:::warning
**为 SysId 导出数据**

我们不建议将**在仿真中生成的**日志数据导出后用于 [SysId](https://docs.wpilib.org/zh-cn/stable/docs/software/advanced-controls/system-identification/introduction.html)，因为 SysId 需要额外的时间戳信息，而这与 AdvantageScope 的默认导出格式并不一致。不过，**非仿真环境**生成的日志数据仍可导出供 SysId 使用，且几乎不会损失数据（当然，直接在 SysId 中导入**原始**日志文件依然能获得最高精度）。

_此警告**不适用于** AdvantageKit 生成的日志——导出时只需选择“AdvantageKit 周期”选项，即可无损导出。详情请参阅 [此页面](https://docs.advantagekit.org/data-flow/sysid-compatibility)。_
:::

## 选项 {#options}

导出时提供以下配置项：

- **格式：** 设置导出文件的格式，具体如下：
  - _CSV (表格)：_ 逗号分隔值格式，每行代表一个独立的时间戳，每列代表一个字段（另附一列时间戳）。单行可同时记录多个字段的值。
  - _CSV (列表)：_ 逗号分隔值格式，每行仅记录单个字段的一次取值，包含时间戳、键名和数值三列。
  - _WPILOG：_ 标准 WPILOG 文件，可在 AdvantageScope 中再次打开。
  - _MCAP：_ 标准 [MCAP](https://mcap.dev) 文件，可在 [Foxglove](https://foxglove.dev) 中打开。
- **时间戳：** 仅在“CSV (表格)”格式下可用，用于设置生成新行的方式：
  - _所有变化：_ 仅当字段值发生变化时才创建新行，可最大限度减小导出文件的体积。
  - _固定周期：_ 按固定时间间隔生成新行，适用于未进行时间戳同步的日志（例如多个字段记录在相近但不完全相同的时间戳上）。注意：无论相邻采样点之间数值是否变化，都会输出所有字段的值。
  - _AdvantageKit 周期：_ 为每个 AdvantageKit 同步循环周期生成一行。同样，无论循环周期之间数值是否变化，都会输出所有字段的值。
- **周期：** 仅在选择“固定周期”时可用，用于设置相邻采样点之间的间隔（单位为毫秒），通常应与机器人代码的循环周期一致。
- **前缀：** 留空表示导出所有字段；否则仅导出匹配指定前缀的字段（多个前缀以逗号分隔）。示例如下：
  - “_/DriverStation/Joystick0_”：包含所有以“/DriverStation/Joystick0”开头的字段（即第一个控制器的数据）。
  - “_Flywheels,DS:enabled_”：包含以“/Flywheels”或“DS:enabled”开头的所有字段（飞轮的所有数据以及机器人的启用状态）。
  - “_Drive/LeftPosition,Drive/RightPosition_”：仅包含“/Drive/LeftPosition”和“/Drive/RightPosition”这两个字段。
- **字段集：** 控制是否导出生成字段。“生成字段”是 AdvantageScope 为拆分复杂数据类型（如数组、结构体及其他 Schema 的各个子项）而自动创建的字段，在侧边栏中以灰色文字显示。
  - _包含生成字段：_ 导出所有可见字段，包含生成字段。如果导出文件要在不支持解析复杂数据类型的软件中打开，建议选择此项。
  - _仅原始字段：_ 仅导出原始日志文件中存在的字段，不包含生成字段。如果导出文件要在 AdvantageScope 或其他支持复杂数据类型的软件中打开，建议选择此项。

下图展示了以“CSV (表格)”格式、时间戳设为“所有变化”时从 AdvantageScope 导出的 CSV 文件示例：

<img src="/img/overview/log-files/export-2.webp" alt="CSV 表格" />
