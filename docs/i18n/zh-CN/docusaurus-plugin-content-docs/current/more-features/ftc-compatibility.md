---
sidebar_position: 1
---

# ✴️ FTC 兼容性 {#ftc-compatibility}

AdvantageScope 提供了多项功能，不仅能让你在现有的 FIRST Tech Challenge 控制系统上获得流畅体验，也为未来赛季平滑过渡到 [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) 做好了准备。从 2027-2028 赛季正式过渡到 Systemcore 起，AdvantageScope 的所有功能都将在 FTC 中获得官方支持。

## 场地与机器人 {#fields-and-robots}

软件原生完整支持 FTC 场地和机器人模型。

- **场地和机器人模型：** 在 🗺️ [2D 场地](/tab-reference/2d-field) 和 👀 [3D 场地](/tab-reference/3d-field) 选项卡中，直接从下拉菜单选择 FTC 场地和机器人模型。所有场地均兼容 [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr)。
- **坐标系：** 你可以在任意场地上配置 [坐标系](/more-features/coordinate-systems)，以兼容 [标准 FTC 坐标](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)。FTC 场地默认即采用该坐标系。

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## 受支持的格式 {#supported-formats}

除了 WPILOG 和 NetworkTables 等 WPILib 兼容格式之外，AdvantageScope 还原生支持 **FTC Dashboard** 实时串流格式和 **Road Runner** `.log` 文件。

多家第三方 FTC 日志与遥测库也支持输出与 AdvantageScope 兼容的数据格式。需要说明的是，AdvantageScope 开发者不对任何特定的 FTC 日志方案做背书或推荐；使用部分方案时，你可能会遇到功能受限的情况。

以下列表可供入门参考（并未涵盖全部工具）：

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/)：生成日志文件，用于调试路径规划逻辑。
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/)：串流与其自带面板和 AdvantageScope 均兼容的实时遥测数据。
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver)：支持将自定义数据记录为多种格式，包括日志文件和实时串流。
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log)：使用注解将数据保存为 WPILOG 格式。
- **PsiKit**：受 AdvantageKit 启发的 FTC 日志记录和重放框架。

:::warning
各队伍在比赛期间务必遵守 R704 规则：比赛中禁止通过 Wi-Fi 连接第三方遥测服务（如 FTC Dashboard）。
:::

### 适用于 FTC 的 AdvantageScope Lite {#advantagescope-lite-for-ftc}

目前社区提供了针对 FTC 优化的非官方 AdvantageScope Lite 发行版：[**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC)。请注意，该版本并非官方发行版，AdvantageScope 开发者不对其提供技术支持。

标准版 [AdvantageScope Lite](/more-features/advantagescope-lite) 是专为 Systemcore 和 FIRST 操控站设计的 Web 应用；而上述非官方 FTC 版本则经过专门修改，可直接运行在现有的 FTC 控制系统上。它原生支持通过 FTC Dashboard 协议实时查看数据，无需安装额外软件。
