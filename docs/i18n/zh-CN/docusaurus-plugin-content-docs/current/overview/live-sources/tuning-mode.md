---
sidebar_position: 1
---

# 调参模式

某些实时数据源支持数值和布尔值的实时调参。例如，当连接到 NetworkTables 数据源时，此功能可用于 [调整控制器增益](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html)。请注意，机器人代码必须支持通过 NetworkTables 接收增益。

默认情况下，AdvantageScope 中的所有值都是只读的。要切换调参模式，请在连接到支持的实时数据源时 **点击搜索栏右侧的滑块图标**。当图标变为紫色时，调参模式处于活动状态，并且字段编辑已被启用。

- 要编辑 **数值字段**，请在侧边栏字段右侧的文本框中输入新值。在取消选中输入框或按下 "Enter" 键后，该值将被发布。留空文本框将使用机器人发布的值。
- 要切换 **布尔字段**，请点击侧边栏字段右侧的红/绿圆形。

:::warning
此功能并非旨在用于在场地上控制机器人。不支持仪表盘样式的输入（如选择器、触发按钮等）。
:::

## 使用 AdvantageKit 调参

由 AdvantageKit 发布到 `AdvantageKit` 子表中的字段是只读输出，无法被编辑。但是，用户可以从用户代码发布可在 AdvantageScope 中调参的字段。**当使用“NetworkTables (AdvantageKit)”实时数据源时，发布到 NetworkTables 上“/Tuning”表的任何字段都将显示在“Tuning”表下。**

例如，可以使用 [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) 类发布可调参数值：

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` 子表 **无法被编辑**，因为它被 AdvantageKit 用于记录网络值以进行日志记录和重放。使用 `Tuning` 表在实时环境中与网络输入进行交互。
:::
