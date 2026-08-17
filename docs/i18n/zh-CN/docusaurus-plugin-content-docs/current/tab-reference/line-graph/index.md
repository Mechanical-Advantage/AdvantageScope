# 📉 折线图 {#line-graph}

折线图是 AdvantageScope 中的默认视图。它支持连续（数值）字段和离散字段。

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="折线图演示" />

_上图所示为英文界面。_

## 视图面板 {#viewer-pane}

要进行缩放，请将光标置于主图表上方并向上或向下滚动。按住 `Shift` 的同时点击并拖动也可以选择一个范围。通过水平滚动（在受支持的设备上）或在图表上点击并拖动来左右移动。当进行实时连接时，向左滚动会解锁与当前时间的关联，而一路向右滚动将重新锁定到当前时间。

在图表上点击可选择时间，右键单击可取消选择。该时间下每个字段的数值均显示在图例中。所选时间将在所有选项卡中同步，从而可以轻松地在其他视图中快速找到此位置。

:::tip
所选时间与悬停时间之间的 delta（差值）在图表上以叠加层形式显示，使测量时间范围变得非常容易。时间戳将根据 [时间戳](/more-features/timestamps) 偏好设置进行格式化。
:::

## 控制面板 {#control-pane}

要开始使用，请将字段拖动到三个部分之一（左轴、右轴或离散字段）。使用 X 按钮删除字段，或通过点击眼睛图标或双击字段名称临时隐藏它。要移除所有字段，请点击轴标题附近的三个点，然后点击 `清除所有字段`。可以在列表中通过点击并拖动来重新排列字段。

可以通过点击彩色图标或右键单击字段名称来自定义每个字段的颜色和线条样式。来自 WPILib [持久警告](https://docs.wpilib.org/zh-cn/latest/docs/software/telemetry/persistent-alerts.html) API 的数据可以通过将警告组添加为离散字段来进行可视化。示例可视化如下图所示。

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="警报可视化" />

:::tip
要叠加机器人模式（自动阶段、遥控阶段或测试模式），请点击“离散字段”旁边的三个点，然后点击“显示机器人模式”。

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="机器人模式覆盖层" />

_上图所示为英文界面。_
:::

### 调整轴 {#adjusting-axes}

默认情况下，每个轴都会根据可见数据调整其范围。要禁用自动调程并将范围锁定到其当前的最小值和最大值，请点击轴标题附近的三个点，然后点击 `锁定轴`。要手动调整范围，请选择 `编辑范围...` 并输入所需的值。

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="编辑轴范围" height="250" />

_上图所示为英文界面。_

### 积分与求导 {#integration-and-differentiation}

值可以由 AdvantageScope 自动积分或求导。Delta 时间始终以秒为单位测量。点击轴标题附近的三个点，然后选择 `求导` 或 `积分`。

:::info
导数是使用相邻采样的 [有限差分](https://zh.wikipedia.org/wiki/%E5%B7%AE%E5%88%86) 计算出来的。积分是使用 [梯形积分](https://zh.wikipedia.org/wiki/%E6%A2%AF%E5%BD%A2%E5%85%AC%E5%BC%8F) 计算出来的。
:::
