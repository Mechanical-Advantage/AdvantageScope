---
title: 2027 新特性
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

AdvantageScope 2027 现已发布，带来对 Systemcore 的全面支持以及全应用范围内超过 **100 项新功能与更新**。请查看[安装文档](/overview/installation)和[完整更新日志](https://github.com/Mechanical-Advantage/AdvantageScope/releases)了解详情。本页面重点介绍本次发布的主要新增功能与改进。

**我们非常重视你的意见！欢迎前往 [Issues 页面](https://github.com/Mechanical-Advantage/AdvantageScope/issues)提交反馈、功能请求或 Bug 报告。**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Systemcore 兼容性 {#systemcore-compatibility}

AdvantageScope 2027 专为与全新 Systemcore 机器人控制器和 WPILib 2027 无缝配合而打造：

- 默认机器人地址现已改为 `robot.local`，无需配置队号即可进行实时连接或下载日志。菜单栏中也可以直接选择 Systemcore 的 USB 和 Wi-Fi 地址。
- [日志下载](/overview/log-files#downloading-from-the-robot)现已支持通过 SFTP 从 Systemcore 下载日志，同时保留对旧版 roboRIO 日志下载的支持。
- 新增自 2027 赛季起用于 FRC 场地、自 2027–2028 赛季起用于 FTC 场地的[中心/红方](/more-features/coordinate-systems#center-red)坐标系。
- 新增对 WPILib 2027 `Telemetry` 和 `Tunables` API 的支持、更新的警报颜色，以及新的[时间戳显示首选项](/more-features/timestamps)，让 Systemcore 时间戳更易阅读。
- 新增的 [Systemcore 诊断](/overview/live-sources)实时模式可直接连接到 Systemcore 内置的 NetworkTables 服务器，无需编写用户代码即可监控机器人状态和硬件 IO。

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite) 将 AdvantageScope 的可视化与分析工具直接带入网页浏览器。你可以从 Systemcore 网页界面以及 FIRST Driver Station 内部直接访问它，**无需任何安装**。

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope 与全新 [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) 深度集成，简化赛场诊断流程：

- 可直接从 FIRST Driver Station 设置菜单打开 [AdvantageScope Lite](/more-features/advantagescope-lite)，分析由 DS 生成的 WPILOG 文件。
- 使用桌面应用无需任何配置即可从本地操控站实时串流比赛状态、通信指标、电池电压和控制器输入。
- 在桌面端打开操控站 `.wpilog` 文件时，系统会提示是否在一个预配置好的独立窗口中打开，其中包含控制台输出、通信指标、电源、CPU 使用率和控制器选项卡（[文档](/overview/log-files#driver-station-layout)）。该布局也是 FIRST Driver Station 中 AdvantageScope Lite 的默认布局。
- 在 💬 [控制台](/tab-reference/console)选项卡中查看操控站控制台日志，支持自动高亮显示警告/错误，并完整支持 [ANSI 转义序列](/tab-reference/console#ansi-formatting)（颜色和文本样式）。

<img src="/img/tutorials/taking-control-1.webp" alt="从 FIRST Driver Station 打开 AdvantageScope Lite" />

_上图所示为英文界面。_

## 🌐 多语言支持 {#language-support}

AdvantageScope 现已在桌面应用、文档网站、移动应用以及 AdvantageScope Lite 中提供 **14 种语言**：英语（美国）、西班牙语（拉丁美洲）、法语、荷兰语、葡萄牙语（巴西）、罗马尼亚语、土耳其语、俄语、哈萨克语、希伯来语、阿拉伯语、印地语、简体中文和繁体中文。

:::info
翻译工作仍在持续完善中，由人工智能和社区贡献者共同完成，**可能存在不够自然的表述或不准确之处**。感谢已经协助审校和改进这些译文的队伍！有关我们的翻译流程以及如何提交反馈，请参阅 🌐 [语言支持](/overview/language-support)页面。
:::

<img src="/img/whats-new/multi-language-1.webp" alt="简体中文界面的折线图选项卡" />

## 📖 全新教程与文档 {#new-tutorials-and-documentation}

文档现已扩展，新增了一套三部曲[教程系列](/category/tutorials)，帮助队伍快速上手 WPILib 2027 和 AdvantageScope：

1. **👋 [你好，遥测！](/tutorials/hello-telemetry)：** 配置 `DataLogManager` 和 `Telemetry` API、进行实时连接，并使用折线图、表格和统计数据进行分析。
2. **🤖 [踏上赛场：机器人可视化](/tutorials/to-the-field)：** 在 FRC 和 FTC 场地上发布 2D/3D 位姿、轨迹和 `Mechanism2d` 对象。
3. **🕹️ [掌握控制：DS 与控制器](/tutorials/taking-control)：** 串流实时操控站诊断数据、同步机器人与 DS 日志、查看控制台输出以及可视化控制器输入。

整个文档中的代码示例也已更新，全面覆盖多种语言的 WPILib `Telemetry` API。

<img src="/img/tutorials/to-the-field-4.webp" alt="来自《踏上赛场》教程的 3D 场地可视化" />

_上图所示为英文界面。_

## 📱 AdvantageTune {#advantagetune}

AdvantageTune 是一款全新的独立 iPhone 和 iPad 应用，提供轻量级的移动端调参体验，与 AdvantageScope 形成互补。你可以直接在手机上查看和修改实时 [NetworkTables](https://docs.wpilib.org/zh-cn/stable/docs/software/networktables/index.html) 主题（包括基本类型、数组、WPILib 结构体和 Protobuf），让每个人都能轻松参与机器人代码调参。

AdvantageTune 和 AdvantageScope 均简化了将调参结果导出回机器人代码的流程，提供按钮可将所有已调参数保存为文本文件，方便分享（[文档](/overview/live-sources/tuning-mode)）。

[<img src="/img/app-store_zh-CN.svg" alt="App Store" />](https://apps.apple.com/cn/app/advantagetune/id6811453643)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="AdvantageTune 浏览视图" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="AdvantageTune 主题编辑" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="AdvantageTune 结构体编辑" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="AdvantageTune 已调参数列表" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="AdvantageTune 搜索与过滤" />
</div>

_上图所示为英文界面。_

## 🪐 WPILOG 通用日志记录 {#wpilog-universal-logging}

借助[通用日志记录](/more-features/universal-logging)，单个 WPILOG 文件现在可以作为多种日志流和格式的通用容器，包括厂商专用设备日志、CSV 数据和子 WPILOG 文件。通用日志记录以灵活且与厂商无关的方式取代了 URCL：来自各个来源的数据会自动同步并合并到单一的侧边栏树形结构中。有关在 AdvantageKit 和 WPILib（即将推出）中采集厂商日志的详情，请参阅[通用日志记录文档](/more-features/universal-logging#experimental-vendor-logging)。

<img src="/img/more-features/universal-logging-1.webp" alt="侧边栏中显示多个厂商日志的 WPILOG 文件" />

_上图所示为英文界面。_

## 🗺️ 场地选项卡改进 {#field-tab-improvements}

🗺️ [2D 场地](/tab-reference/2d-field)和 👀 [3D 场地](/tab-reference/3d-field)选项卡新增了多项实用改进：

- 支持在 2D 场地上平移和缩放，或右键点击锁定相机以跟随机器人的位置和旋转（[文档](/tab-reference/2d-field#camera-controls)）。
- 新增选项，可在字段近期未更新时淡出 2D 和 3D 虚影（适用于视觉位姿渲染）。
- 在 2D 和 3D FTC 场地上新增地垫网格线，方便空间参考。
- 新建 2D 或 3D 场地选项卡时，AdvantageScope 现在会记住上次使用的是 FRC 还是 FTC 场地。

<img src="/img/tab-reference/2d-field-1.webp" alt="2D 场地选项卡概览" />

_上图所示为英文界面。_

## 📉 折线图改进 {#line-graph-improvements}

📉 [折线图](/tab-reference/line-graph)和时间轴包含多项视觉优化，让分析更加清晰：

- 启用“显示机器人模式”时，现在会为自动、遥控、测试和禁用阶段渲染带颜色编码的横条。
- 点状图表会根据任意缩放级别自动调整点的大小，以保持良好的可见性。
- 折线图和时间轴上新增实用提示，引导新用户掌握滚动和缩放手势。
- 改进了时间轴和折线图坐标轴上较大时间戳数值的渲染和可读性。

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="折线图上带颜色编码的机器人模式叠加显示" />

_上图所示为英文界面。_

## 🤝 无障碍功能增强 {#accessibility-enhancements}

AdvantageScope 2027 包含多项更新，提升应用的无障碍体验：

- 为所有输入控件添加了键盘 Tab 导航，并为全应用的所有控件添加了描述性工具提示。
- AdvantageScope 现在会遵循操作系统级的“减少透明度”和“减少动态效果”设置。
- 侧边栏中的布尔指示器现在不再仅依赖颜色来区分状态。

## 🥔 新增单位类型 {#new-unit-types}

AdvantageScope 的[单位感知图表](/tab-reference/line-graph/units)现已扩展支持更多单位类型和解析选项：

- 功率（瓦特、马力等）
- 比率（无量纲、百分比）
- 开尔文温度
- 土豆能量 (Potato energy)
- 英式英语单位拼写（例如 `metres`）
- WPILib 单位库的后缀

## 🧱 稳定性改进 {#stability-improvements}

本版本包含大量 Bug 修复、性能优化以及全应用的稳定性提升。完整列表请见发布[更新日志](https://github.com/Mechanical-Advantage/AdvantageScope/releases)，主要亮点如下：

- 官方 Windows 发布版本现已进行代码签名，减少安装期间出现 SmartScreen 警告的频率。
- 显著提升了日志加载和绘图性能，尤其是处理 Hoot (`.hoot`) 日志和大型结构体数组时。
- 修复了同时查看 AdvantageKit 日志和高频数据源时的时间戳处理问题。
- 改进了对齐多源日志时的多日志时间戳同步算法。
- 提升了 [Phoenix 诊断](/overview/live-sources/phoenix-diagnostics)的连接可靠性。
- 修复了弹出窗口菜单栏以及 [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) 中录制弹窗的界面问题。
- 优化了全应用的界面文本和措辞，提升清晰度。
