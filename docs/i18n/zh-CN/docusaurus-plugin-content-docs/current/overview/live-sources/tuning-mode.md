---
sidebar_position: 1
---

# 调参模式 {#tuning-mode}

某些实时数据源支持对数值和布尔值进行在线调参。例如，连接到 NetworkTables 数据源时，你可以用此功能 [调整控制器增益](https://docs.wpilib.org/zh-cn/stable/docs/software/advanced-controls/introduction/tutorial-intro.html)（前提是机器人代码已支持通过 NetworkTables 接收增益参数）。

默认情况下，AdvantageScope 中的所有字段均为只读。连接到受支持的实时数据源后，**点击搜索栏右侧的滑块图标**即可开启调参模式；图标变为紫色时，表示已进入调参模式，可以开始编辑字段。

- 要编辑 **数值字段**，请在侧边栏该字段右侧的文本框中输入新值，点击输入框外部或按下 `Enter` 键后即会发布。将文本框留空可恢复使用机器人端发布的值。
- 要切换 **布尔字段**，请直接点击侧边栏该字段右侧的红色或绿色圆点。
- 如需将所有已发布的值复制到剪贴板，请**右键点击滑块图标**并选择**“复制调参值”**。

:::warning
此功能并非用于在赛场上操控机器人，也不支持选择器、触发按钮等仪表盘类控件。
:::

## 使用 AdvantageKit 调参 {#tuning-with-advantagekit}

AdvantageKit 发布到 `AdvantageKit` 子表的字段均为只读输出，无法编辑。不过，你可以在代码中主动发布支持在 AdvantageScope 中调参的字段。**使用“NetworkTables (AdvantageKit)”实时数据源时，所有发布到 NetworkTables `/Tuning` 表的字段都会显示在 `Tuning` 表下。**

例如，可以使用 [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) 类发布可调参数值：

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` 子表**不可编辑**，因为它专门用于 AdvantageKit 记录网络输入以供日志保存与重放。如需实时调整网络输入参数，请使用 `Tuning` 表。
:::
