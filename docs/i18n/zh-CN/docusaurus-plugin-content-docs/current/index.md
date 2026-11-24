---
sidebar_position: 1
title: 欢迎
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-ltr-light.webp" className="light-only" />
<img src="/img/banner-ltr-dark.webp" className="dark-only" />

AdvantageScope 是 [6328 团队](https://littletonrobotics.org) 为 FIRST 队伍开发的机器人诊断、日志分析与数据可视化应用程序。它支持读取 WPILOG、Hoot (CTRE)、REVLOG (REV Robotics)、Road Runner、CSV、NI DS log 和 RLOG 等格式的日志文件，也能通过 NT4、Phoenix、RLOG 或 FTC Dashboard 串流实时查看机器人数据。AdvantageScope 适用于任何 WPILib 项目，同时也针对我们的 [AdvantageKit](https://docs.advantagekit.org) 日志重放框架进行了深度优化。请注意，**使用 AdvantageScope 并非必须搭配 AdvantageKit**。

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

- 丰富且灵活的各类图表
- 位姿数据的 2D 与 3D 场地可视化，支持自定义机器人 CAD 模型
- 支持与单独导入的比赛视频同步回放
- 控制器可视化，在可自定义的控制器图示上显示驾驶员操作
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

欢迎前往 [Issues 页面](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 提交反馈、功能建议或 Bug 报告。想了解如何为 AdvantageScope 贡献力量，请参阅 [贡献指南](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md)。如需私下联系，请发送邮件至 software@team6328.org。

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />
