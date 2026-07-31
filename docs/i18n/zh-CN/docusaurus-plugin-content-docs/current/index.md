---
sidebar_position: 1
title: 欢迎
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner.png" alt="AdvantageScope" />

AdvantageScope 是由 [6328 团队](https://littletonrobotics.org) 为 FIRST 队伍开发的一款机器人诊断、日志查看/分析和数据可视化应用程序。它可以读取 WPILOG、DS log、Hoot (CTRE)、REVLOG (REV Robotics)、Road Runner、CSV 和 RLOG 等格式的日志文件，并支持使用 NT4、Phoenix、RLOG 或 FTC Dashboard 串流实时查看机器人数据。AdvantageScope 可以配合任何 WPILib 项目使用，但也针对我们的 [AdvantageKit](https://docs.advantagekit.org) 日志重放框架进行了优化。请注意，**使用 AdvantageScope 并不强制要求使用 AdvantageKit**。

<DocCardList
items={[
{
type: "category",
label: "概述",
href: "/category/overview"
},
{
type: "category",
label: "选项卡参考",
href: "/category/tab-reference"
},
{
type: "category",
label: "更多功能",
href: "/category/more-features"
},
{
type: "link",
label: "锦标赛研讨会",
href: "/overview/champs-conference"
}
]}
/>

AdvantageScope 包含以下工具：

- 丰富的灵活图表与图形
- 位姿数据的 2D 和 3D 场地可视化，支持自定义 CAD 机器人模型
- 与单独加载的比赛视频同步播放
- 操纵杆可视化，在可自定义的控制器图示上显示驾驶员操作
- Swerve 驱动模块矢量显示
- 控制台消息查看
- 日志统计分析
- 灵活的导出选项，支持 CSV 和 WPILOG

<Button
label="前往下载"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

欢迎在 [issues 页面](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 提供反馈、功能需求或报告 Bug。有关参与 AdvantageScope 贡献的更多信息，请参阅 [贡献页面](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md)。如有非公开咨询，请致信 software@team6328.org。

<img src="/img/screenshot-light.png" className="light-only" />
<img src="/img/screenshot-light.png" className="dark-only" />
