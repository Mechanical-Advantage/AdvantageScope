---
sidebar_position: 1
---

# ✴️ FTC 兼容性 {#ftc-compatibility}

AdvantageScope 包含多项功能，可在现有的 FIRST Tech Challenge 控制系统上提供流畅的体验，同时为在未来赛季过渡到 [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) 做好准备。从 2027-2028 赛季开始过渡到 Systemcore 后，AdvantageScope 的所有功能都将在 FTC 中得到官方支持。

## 场地与机器人 {#fields-and-robots}

FTC 场地和机器人模型原生完全支持。

- **场地和机器人模型：** 在 🗺️ [2D 场地](/tab-reference/2d-field) 和 👀 [3D 场地](/tab-reference/3d-field) 选项卡中直接从下拉菜单中选择 FTC 场地和机器人模型。所有场地均与 [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) 兼容。
- **坐标系：** 配置 [坐标系](/more-features/coordinate-systems) 以在任何场地上与 [标准 FTC 坐标](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) 兼容。该坐标系在 FTC 场地上默认使用。

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## 受支持的格式 {#supported-formats}

除了 WPILOG 和 NetworkTables 等 WPILib 兼容格式之外，AdvantageScope 还原生支持 **FTC Dashboard** 实时串流格式和 **Road Runner** `.log` 文件。

一些第三方 FTC 日志记录和遥测库可以输出与 AdvantageScope 兼容格式的数据。AdvantageScope 开发者不特别认可或推荐任何特定的 FTC 日志解决方案；在使用某些日志解决方案时，你可能会遇到功能受限的情况。

下面的列表提供了一个参考起点，但并非详尽无遗：

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/)：生成日志文件用于调试路径规划逻辑。
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/)：串流与其自带面板和 AdvantageScope 均兼容的实时遥测数据。
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver)：允许将自定义数据记录为多种格式，包括日志文件和实时串流。
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log)：使用注解将数据保存为 WPILOG 格式。
- **PsiKit**：受 AdvantageKit 启发的 FTC 日志记录和重放框架。

:::warning
各队伍在比赛期间必须确保遵守 R704 规则。比赛中禁止通过 Wi-Fi 连接第三方遥测服务（如 FTC Dashboard）。
:::

### 适用于 FTC 的 AdvantageScope Lite {#advantagescope-lite-for-ftc}

提供了一个针对 FTC 进行优化的 AdvantageScope Lite 非官方发行版：[**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC)。该发行版是非官方的，不受 AdvantageScope 开发者的支持。

标准的 [AdvantageScope Lite](/more-features/advantagescope-lite) 是专为在 Systemcore 和 FIRST 操控站上使用而设计的 Web 应用程序，而非官方 FTC 发行版则经过专门修改，可直接在现有的 FTC 控制系统上使用。它原生支持通过 FTC Dashboard 协议查看实时数据，无需额外的软件。
