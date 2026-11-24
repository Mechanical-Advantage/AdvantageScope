# 📉 折线图 {#line-graph}

折线图是 AdvantageScope 中的默认视图，支持连续（数值）字段和离散字段。

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="折线图演示" />

_上图所示为英文界面。_

## 视图面板 {#viewer-pane}

将光标置于主图表上方并上下滚动即可缩放，也可以按住 `Shift` 键的同时点击并拖动来框选范围。通过水平滚动（在受支持的设备上）或在图表上点击并拖动即可左右平移。在实时连接状态下，向左滚动会解除对当前时间的锁定，向右滚动到底则会重新锁定到当前时间。

点击图表即可选中某个时间点，右键点击则取消选中。图例中会显示该时间点各字段的数值。选中的时间点会在所有选项卡之间同步，方便你在其他视图中快速定位。

:::tip
所选时间与悬停时间之间的差值会直接叠加显示在图表上，方便你测量时间跨度。时间戳的显示格式可在 [时间戳](/more-features/timestamps) 首选项中调整。
:::

## 控制面板 {#control-pane}

要开始使用，请将字段拖入“左轴”、“右轴”或“离散字段”区域。点击 X 按钮可删除字段；点击眼睛图标或双击字段名称可临时隐藏字段。要移除所有字段，请点击坐标轴标题旁的三个点，然后选择 `全部清除`。你还可以在列表中点击并拖动字段来调整顺序。

点击彩色图标或右键点击字段名称，即可自定义每个字段的颜色和线条样式。将警告组作为离散字段添加后，还可以可视化来自 WPILib [持久警告](https://docs.wpilib.org/zh-cn/latest/docs/software/telemetry/persistent-alerts.html) API 的数据，效果如下图所示。

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="警告可视化" />

:::tip
要叠加显示机器人模式（自动阶段、遥控阶段或测试模式），请点击“离散字段”旁的三个点，然后选择“显示机器人模式”。

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="机器人模式覆盖层" />

_上图所示为英文界面。_
:::

### 调整轴 {#adjusting-axes}

默认情况下，每个坐标轴都会根据可见数据自动调整范围。如需禁用自动调整范围并将范围锁定为当前的最大值与最小值，请点击坐标轴标题旁的三个点，然后选择 `锁定轴`。如需手动调整范围，请选择 `编辑范围...` 并输入目标数值。

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="编辑轴范围" height="250" />

_上图所示为英文界面。_

### 积分与求导 {#integration-and-differentiation}

AdvantageScope 可以自动对数值进行积分或求导，时间差值始终以秒为单位。点击坐标轴标题旁的三个点，然后选择 `求导` 或 `积分`。

:::info
导数通过相邻采样点的 [有限差分](https://zh.wikipedia.org/wiki/%E5%B7%AE%E5%88%86) 计算得出，积分则采用 [梯形法则](https://zh.wikipedia.org/wiki/%E6%A2%AF%E5%BD%A2%E5%85%AC%E5%BC%8F) 计算。
:::
