---
title: 2026 版本有哪些新功能？
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-light.png" className="light-only" />
<img src="/img/whats-new/banner-dark.png" className="dark-only" />

AdvantageScope 的 2026 版本现已发布！请查看 [安装文档](/overview/installation) 和 [完整更新日志](https://github.com/Mechanical-Advantage/AdvantageScope/releases) 了解详情。此版本包含多项重大新功能以及针对整个应用程序的大量改进。本版本中的许多功能旨在提高现有控制系统的使用体验，同时为未来赛季顺畅过渡到 [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) 奠定基础。

**我们非常重视你的反馈！欢迎在 [issues 页面](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 提供反馈、功能需求或报告 Bug。**

## ✴️ 实验性：FTC 支持 {#ftc-support}

为了在 2027-2028 赛季为 Systemcore 提供完整支持做准备，此版本新增了几项功能，以提高与现有 FIRST Tech Challenge 控制系统的兼容性：

- 🗺️ [2D 场地](/tab-reference/2d-field) 和 👀 [3D 场地](/tab-reference/3d-field) 上的 FTC 场地与机器人模型
- 新的 [坐标系](/more-features/coordinate-systems) 选项，兼容 [标准 FTC 坐标](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- 支持 [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) 日志文件
- 支持 [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard) 实时串流格式

:::tip
FTC 队伍在官方赛季期间使用实验性软件时应保持谨慎。AdvantageScope 对 FTC 的支持仍在积极开发中。
:::

<div className="image-gallery">
  <img src="/img/whats-new/ftc-1.jpg" />
  <img src="/img/whats-new/ftc-2.jpg" />
  <img src="/img/whats-new/ftc-3.png" />
  <img src="/img/whats-new/ftc-4.png" />
  <img src="/img/whats-new/ftc-5.png" />
</div>

某些第三方 FTC 日志/遥测库支持与 AdvantageScope 兼容的其他格式，例如 WPILOG 和 RLOG。这些库的文档可以在各自的项目中找到；AdvantageScope 开发者不特别赞同/推荐任何用于 AdvantageScope 的特定 FTC 日志解决方案。

:::info
AdvantageScope 旨在与 WPILib 框架及相关日志工具配合使用时提供最佳体验。使用非官方日志解决方案时，你可能会遇到兼容性问题或功能受限。

在 2027-2028 赛季过渡到 Systemcore 之后，AdvantageScope 的所有功能都将在 FTC 中获得官方支持。
:::

## 🧮 单位感知图表 {#unit-aware-graphing}

📉 [折线图](/tab-reference/line-graph/) 选项卡经过重新设计，现已全面支持单位感知。这在绘制数值字段图表时启用了多项新功能：

- Y 轴和数值显示的精确标记
- 快速转换为兼容单位（无需弹窗）
- 单个轴内兼容单位类型的隐式转换
- [积分与求导](/tab-reference/line-graph/#integration-and-differentiation) 单位的准确显示

下面的截图展示了所有这些功能的实际应用。请注意，左轴包含具有不同角速度单位的字段，而右轴包含已求导并以非原生单位（度）显示的数值。选择单位也比以往任何时候都更加容易，每个轴的控制菜单中都直接集成了兼容的单位选项。

_有关单位支持的更多信息，请参阅 [文档](/tab-reference/line-graph/units)。_

<img src="/img/tab-reference/line-graph/units-1.png" alt="单位感知图表" />

## 🏁 更快的日志下载 {#faster-log-downloads}

[从 roboRIO 下载日志](/overview/log-files/#downloading-from-the-robot) 现在比以前的版本快 **2 到 4 倍**。这是通过切换到新的协议 (FTP) 实现的，该协议允许 roboRIO 以更少的 CPU 开销传输日志数据。

下表显示了在通过以太网有线连接（最大带宽 100 Mb/s）时，AdvantageScope 2025 和 2026 版本的实测传输速度。请注意，2025 版本的性能受到 roboRIO 上 CPU 负载的严重影响。

|                                                | 2025 (SFTP) | 2026 (FTP) | 加速                                             |
| ---------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| 高 CPU 负载<br /><sub>复杂的机器人代码</sub>   | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| 平均 CPU 负载<br /><sub>正常的机器人代码</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| 最小 CPU 负载<br /><sub>无机器人代码</sub>     | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 从子文件夹下载日志 {#download-logs-from-subfolders}

下载窗口现在支持保存存储在子文件夹中的日志。每个日志子文件夹都可以作为一组进行下载，为下载 CTRE 的 2026 版本 [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) 生成的日志提供了一种简化的方法（该日志库使用子文件夹作为无法将数据存储在单个日志文件中的变通方案）。

<img src="/img/whats-new/subfolders.png" alt="下载日志子文件夹" />

## 🌈 新的可视化选项 {#new-visualization-options}

🗺️ [2D 场地](/tab-reference/2d-field) 和 👀 [3D 场地](/tab-reference/3d-field) 上支持了多项新的可视化选项：

- 2D 场地现已支持更广泛的机器人保险杠颜色选择，并且每个对象都可以配置自己的颜色。这在将幽灵模型与多个机器人对象结合时提供了更大的灵活性。
- 在 [3D 场地上可视化 2D 机构](/tab-reference/3d-field/#2d-mechanisms) 时，机构现在除了可以放置在 XZ 平面上之外，还可以放置在 YZ 平面上。这使得在多个轴上运动的复杂机构更易于可视化。
- 3D 场地现在支持可选的抗锯齿，以提高渲染边缘的质量。

<img src="/img/whats-new/field-viz.jpg" alt="新的场地可视化" />

## 🪵 REV Robotics CAN 日志支持 {#rev-robotics-can-log-support}

你现在可以直接在 AdvantageScope 中打开由 REV Robotics 的 [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) 生成的 `.revlog` 文件。这些文件记录了来自 Spark Max 和 Spark Flex 设备的 CAN 信号，提供了 AdvantageScope 的 [URCL](/more-features/urcl) 库的官方替代方案。

URCL 和官方的 `StatusLogger` 都将在 2026 赛季期间保持可用，以确保平滑过渡并提供与以往赛季相同的功能。我们将在稍后分享关于 2027 赛季及以后日志选项的更多细节。

<img src="/img/whats-new/revlog.png" alt="REVLOG 可视化" />

## 💿 CSV 文件导入 {#csv-file-imports}

为了更灵活地可视化在机器人日志框架之外生成的数据，AdvantageScope 现在包含导入 CSV 文件的基础支持。有关支持格式和其他限制的更多细节，请查看 [文档](/overview/log-files/#csv-formatting)。

<img src="/img/overview/log-files/export-2.png" alt="CSV 数据" />

## 🤩 美观改进 {#aesthetic-improvements}

Windows 11 上的 AdvantageScope UI 已更新，支持半透明侧边栏，这在以前是 macOS 版本独有的。基于 Apple 的 Liquid Glass 材质，还为 macOS Tahoe 提供了更新的应用程序图标。

<img src="/img/whats-new/windows-ui.png" alt="Windows UI" />

## 📋 简化的菜单 {#streamlined-menus}

菜单栏和相关控件已得到简化和重组，使所有平台上的控件更易于访问且更加一致。显著的功能包括：

- 在实时数据源（例如 NetworkTables 和 [Phoenix 诊断](/overview/live-sources/phoenix-diagnostics)）之间进行更快的切换，无需打开首选项窗口。
- 右键单击侧边栏可快速复制字段名称（或完整字段键）。
- 重新组织了首选项窗口，使选项更容易快速找到。

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.png" />
  <img src="/img/whats-new/menus-2.png" />
  <img src="/img/prefs.png" />
</div>

## 🐛 稳定性改进 {#stability-improvements}

此版本包含针对整个应用程序的各种 Bug 修复和稳定性改进。完整列表可以在发布 [更新日志](https://github.com/Mechanical-Advantage/AdvantageScope/releases) 中找到，以下列出了一些值得注意的修复：

- 大幅提升了 AdvantageScope 在长时间串流数据时的性能，特别是在使用折线图选项卡时。
- AdvantageScope 现在对异常日志数据具有更好的容错能力，包括大型日志文件和大型场地数值。
- 修复了浏览日志数据时的各种视觉缺陷，特别是在折线图选项卡上使用过滤器时。
- 修复了下载窗口中 AdvantageKit 日志文件的排序问题；没有时间戳的日志现在位于列表底部，与其他格式类似。
- 在 3D 场地选项卡上，在横滚轴 (roll axis) 上具有非零旋转的机器人相机现在可以正确进行可视化。
- 提升了 AdvantageScope XR 的稳定性，特别是在 iOS/iPadOS 26 上运行时。对于离线安装，请在 App Store 中检查可用更新。
