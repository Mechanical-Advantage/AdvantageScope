---
title: 2026 版本有哪些新功能？
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

AdvantageScope 2026 版现已发布！详情请查看 [安装文档](/overview/installation) 和 [完整更新日志](https://github.com/Mechanical-Advantage/AdvantageScope/releases)。本次更新带来了多项重磅新功能和全方位的体验优化，不仅能改善现有控制系统的使用体验，也为未来赛季平滑过渡到 [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) 做好了准备。

**我们非常重视你的意见！欢迎前往 [Issues 页面](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 提交反馈、功能建议或 Bug 报告。**

## ✴️ 实验性：FTC 支持 {#ftc-support}

为迎接 2027-2028 赛季对 Systemcore 的全面支持，本版本新增了多项功能，以提升与现有 FIRST Tech Challenge 控制系统的兼容性：

- 🗺️ [2D 场地](/tab-reference/2d-field) 和 👀 [3D 场地](/tab-reference/3d-field) 上的 FTC 场地与机器人模型
- 新增 [坐标系](/more-features/coordinate-systems) 选项，兼容 [标准 FTC 坐标系](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- 支持 [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) 日志文件
- 支持 [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard) 实时串流格式

:::tip
FTC 队伍在正式赛季期间使用实验性软件时请务必谨慎。AdvantageScope 的 FTC 支持仍在积极开发中。
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

部分第三方 FTC 日志与遥测库支持 WPILOG、RLOG 等兼容 AdvantageScope 的格式，具体用法可查阅各自项目的文档；AdvantageScope 开发团队对任何特定的 FTC 日志方案不作任何背书或推荐。

:::info
搭配 WPILib 框架及相关日志工具使用时，AdvantageScope 能发挥出最佳效果。若采用非官方日志方案，可能会遇到兼容性问题或部分功能受限。

2027-2028 赛季全面过渡到 Systemcore 后，AdvantageScope 的全部功能都将正式支持 FTC。
:::

## 🧮 单位感知图表 {#unit-aware-graphing}

📉 [折线图](/tab-reference/line-graph/) 选项卡现已重新设计，全面支持单位感知，为数值字段的绘图带来多项新特性：

- 精确标注 Y 轴与数值显示
- 兼容单位间快速换算（无需弹窗）
- 同一坐标轴内自动隐式换算兼容单位
- 准确显示 [积分与微分](/tab-reference/line-graph/#integration-and-differentiation) 后的单位

下方截图展示了这些功能的实际效果。可以看到，左轴包含了不同角速度单位的字段，右轴则展示了微分后以非原生单位（度）显示的数据。单位选择也比以往更加便捷，每个坐标轴的控制菜单中都直接集成了兼容单位选项。

_有关单位支持的更多信息，请参阅 [文档](/tab-reference/line-graph/units)。_

<img src="/img/tab-reference/line-graph/units-1.webp" alt="单位感知图表" />

_上图所示为英文界面。_

## 🏁 更快的日志下载 {#faster-log-downloads}

[从 roboRIO 下载日志](/overview/log-files/#downloading-from-the-robot) 现在比以前的版本快 **2 到 4 倍**。这得益于切换到了新的传输协议 (FTP)，让 roboRIO 能以更低的 CPU 开销传输日志数据。

下表展示了通过以太网有线连接（最大带宽 100 Mb/s）时，AdvantageScope 2025 与 2026 版本的实测传输速率。可以看到，2025 版本的性能受 roboRIO CPU 负载的影响非常明显。

|                                                | 2025 (SFTP) | 2026 (FTP) | 加速                                             |
| ---------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| 高 CPU 负载<br /><sub>复杂的机器人代码</sub>   | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| 平均 CPU 负载<br /><sub>正常的机器人代码</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| 最小 CPU 负载<br /><sub>无机器人代码</sub>     | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 从子文件夹下载日志 {#download-logs-from-subfolders}

下载窗口现已支持保存存放在子文件夹中的日志，每个子文件夹可作为一个整体打包下载。这一改进简化了 CTRE 2026 版 [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) 日志的获取流程（由于无法将全部数据写入单个日志文件，该库采用子文件夹来分存数据）。

<img src="/img/whats-new/subfolders.webp" alt="下载日志子文件夹" height="450" />

## 🌈 新的可视化选项 {#new-visualization-options}

🗺️ [2D 场地](/tab-reference/2d-field) 和 👀 [3D 场地](/tab-reference/3d-field) 新增了多项可视化选项：

- 2D 场地现已提供更丰富的机器人保险杠配色，且每个对象均可单独设置颜色。将幽灵模型与多个机器人对象组合展示时，配置更加灵活。
- 在 [3D 场地上可视化 2D 机构](/tab-reference/3d-field/#2d-mechanisms) 时，除 XZ 平面外，现在还可以将机构放置在 YZ 平面上，让多轴运动机构的展示更加直观。
- 3D 场地现已支持可选的抗锯齿功能，有效提升模型边缘的渲染质量。

<img src="/img/whats-new/field-viz.jpg" alt="新的场地可视化" />

## 🪵 REV Robotics CAN 日志支持 {#rev-robotics-can-log-support}

现在你可以直接在 AdvantageScope 中打开 REV Robotics [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) 生成的 `.revlog` 文件。这些文件记录了 Spark Max 和 Spark Flex 设备的 CAN 信号，可作为 AdvantageScope [URCL](/more-features/urcl) 库的官方替代方案。

2026 赛季期间，URCL 与官方 `StatusLogger` 将继续并行支持，确保平滑过渡并保持与往届赛季一致的功能体验。关于 2027 赛季及之后的日志方案，我们将在后续公布更多详情。

<img src="/img/whats-new/revlog.webp" alt="REVLOG 可视化" />

## 💿 CSV 文件导入 {#csv-file-imports}

为方便可视化机器人日志框架之外生成的数据，AdvantageScope 现已提供基础的 CSV 文件导入功能。支持的格式及相关限制详情请参阅 [文档](/overview/log-files/#csv-formatting)。

<img src="/img/overview/log-files/export-2.webp" alt="CSV 数据" />

## 🤩 美观改进 {#aesthetic-improvements}

Windows 11 版 AdvantageScope 的界面已更新，现已支持半透明侧边栏（此前仅限 macOS 版本）。此外，我们还基于 Apple 的 Liquid Glass 材质，为 macOS Tahoe 适配了全新应用图标。

<img src="/img/whats-new/windows-ui.webp" alt="Windows 界面" />

## 📋 简化的菜单 {#streamlined-menus}

我们对菜单栏及相关控件进行了精简与重组，让各平台的操作入口更加直观一致。主要改进包括：

- 无需打开首选项窗口，即可在实时数据源（如 NetworkTables 和 [Phoenix 诊断](/overview/live-sources/phoenix-diagnostics)）间快速切换。
- 右键点击侧边栏即可快速复制字段名称（或完整字段键）。
- 重新整理了首选项窗口的布局，常用选项一目了然。

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_zh-CN.webp" />
</div>

## 🐛 稳定性改进 {#stability-improvements}

本次更新还包含全方位的 Bug 修复与稳定性优化。完整列表请参见版本 [更新日志](https://github.com/Mechanical-Advantage/AdvantageScope/releases)，以下是几项重点修复：

- 显著优化了长时间串流实时数据时的性能，折线图选项卡的流畅度提升尤为明显。
- 增强了对异常日志数据的容错能力，包括超大日志文件及包含大量数据的字段值。
- 修复了浏览日志数据时的多处界面显示问题，尤其是在折线图选项卡中使用过滤器时的异常。
- 修复了下载窗口中 AdvantageKit 日志文件的排序问题；与其他格式一致，无时间戳的日志现已统一排在列表底部。
- 修复了 3D 场地选项卡中横滚轴 (roll axis) 旋转角度非零时机器人相机的显示问题。
- 提升了 AdvantageScope XR 的稳定性，尤其是 iOS/iPadOS 26 设备的运行表现。如需离线更新，请前往 App Store 检查可用版本。
