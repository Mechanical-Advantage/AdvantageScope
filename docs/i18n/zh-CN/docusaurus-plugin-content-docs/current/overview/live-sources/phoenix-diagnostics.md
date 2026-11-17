---
sidebar_position: 2
---

# Phoenix 诊断 {#phoenix-diagnostics}

AdvantageScope 支持直接实时串流 Phoenix 6 设备的信号，**无需在机器人代码中做任何额外配置**。你可以借助熟悉的操作界面与 AdvantageScope 的完整功能，轻松调试和调参 Phoenix 设备：

- 灵活的可视化方式，支持表格展示与统计分析
- 完整支持单位感知图表，包含隐式换算与一键单位转换（[文档](/tab-reference/line-graph/units)）
- 将枚举值自动解码为易读文本（如控制模式、桥接状态、CANcoder 磁铁状态等）
- 侧边栏内置工具提示，悬停即可查看每个信号的说明与单位
- 按 CAN 总线、设备和信号类型分层归类信号
- 内置积分与微分等高级数据分析工具（[文档](/tab-reference/line-graph/#adjusting-axes)）

:::tip
在菜单栏连接机器人或模拟器时，选择“Phoenix 诊断”即可建立连接。
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="折线图截图" />

借助 AdvantageScope 的 📊 [统计](/tab-reference/statistics) 选项卡，你还可以对 Phoenix 信号进行深入分析，包括直方图、自定义范围，以及用于衡量相对误差与绝对误差的派生字段：

<img src="/img/overview/live-sources/phoenix-2.webp" alt="统计数据截图" />

_上图所示为英文界面。_

:::note
由于 Phoenix 自身会持续更新，此功能偶尔可能出现兼容性问题。建议始终使用最新版本的 AdvantageScope 以减少此类情况；如仍有异常，欢迎 [提交 issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 告知我们。
:::
