---
sidebar_position: 2
---

# Phoenix 诊断 {#phoenix-diagnostics}

AdvantageScope 支持从 Phoenix 6 设备实时串流信号，**无需在用户代码中进行设置**。这使得利用熟悉的界面和 AdvantageScope 的强大功能可以轻松进行 Phoenix 设备的调试与调参：

- 灵活的可视化选项，包括对多轴和离散字段的支持
- 完全支持单位感知图表，包括隐式和一键单位转换（[文档](/tab-reference/line-graph/units)）
- 在侧边栏中实时预览所有数值，便于浏览
- 支持同时绘制和预览来自多个设备的信号
- 将枚举值解码为易于阅读的字符串（控制模式、桥接状态、CANcoder 磁铁状态等）
- 集成侧边栏工具提示，包含每个信号的描述和单位
- 信号的分层组织，按 CAN 总线、设备和信号类型分组
- 借助内置积分和求导选项进行高级数据分析（[文档](/tab-reference/line-graph/#adjusting-axes)）

:::tip
要建立连接，请在从菜单栏连接到机器人或模拟器时选择“Phoenix 诊断”。
:::

<img src="/img/overview/live-sources/phoenix-1.png" alt="折线图截图" />

AdvantageScope 的 📊 [统计](/tab-reference/statistics) 选项卡还支持对 Phoenix 信号进行高级分析，支持直方图、自定义范围以及用于相对和绝对误差测量的派生字段：

<img src="/img/overview/live-sources/phoenix-2.png" alt="统计数据截图" />

:::note
由于 Phoenix 更新，此功能偶尔可能会遇到问题。我们建议使用最新版本的 AdvantageScope 以最大程度减少问题。否则，请 [提交 issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 以告知我们遇到的任何问题。
:::
