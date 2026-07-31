---
sidebar_position: 5
---

# 💬 控制台

控制台视图旨在查看包含控制台数据的单个字符串字段。下面列出了一些建议的字段：

- **DS:/Dscomm/Console** - 由 FIRST Driver Station 保存。
- **messages** - 由 WPILib 基于对 [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>) 方法调用的内置日志记录生成。
- **/RealOutputs/Console** - 在机器人运行期间由 AdvantageKit 自动保存（按正常方式使用 `System.out.println`）。
- **/ReplayOutputs/Console** - 在日志重放期间由 AdvantageKit 自动保存（按正常方式使用 `System.out.println`）。

要开始使用，请将所需的字段拖动到主视图中。每行代表字段的一次更新。对于 WPILib 日志，会为每个保存的行创建一个新行。对于 AdvantageKit 日志，会为每个循环周期创建一个新行。

<img src="/img/tab-reference/console-1.png" alt="控制台视图" />

:::info
点击调色板图标可切换警告和错误消息的高亮显示。对于 WPILib 和 AdvantageKit 日志，包含文本“warning”或“error”的消息将被高亮显示。
:::

此处的控件类似于 🔢 [表格](../tab-reference/table) 选项卡。所选时间将在所有选项卡中同步。点击某行即可选中它，或者将鼠标悬停在某行上可在任何可见的弹出窗口中进行预览。点击 ↓ 按钮可跳转到所选时间（或在框中输入的指定时间）。

在“过滤”输入框中输入文本可仅显示包含过滤文本的行。按 `Ctrl+F` 可快速选中“过滤”输入框。在过滤文本的开头添加 "!" 可从主视图中 _排除_ 匹配的消息。

:::tip
点击保存图标可将控制台数据导出为文本文件。
:::
