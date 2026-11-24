---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ 机构 {#mechanism}

机构选项卡用于显示由一个或多个 [Mechanism2d](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/glass/mech2d-widget.html) 对象构建的铰接机构。

<img src="/img/tab-reference/mechanism-1.webp" alt="机构选项卡概述" />

_上图所示为英文界面。_

<details>
<summary>时间轴控制</summary>

时间轴用于控制数据回放和可视化显示。在时间轴上点击即可选中某个时间点，右键点击可取消选择。所选时间点会在所有选项卡之间同步，方便你在其他视图中快速定位到同一时刻。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

将鼠标悬停在时间轴上并上下滚动即可缩放；按住 `Shift` 并点击拖动可以框选时间范围。在支持横向滚动的设备上水平滚动，或在时间轴上直接点击拖动，即可左右移动视图。实时连接时，向左滚动会解除对当前时间的锁定，一直向右滚动到底则会重新锁定到当前时间。按下 `Ctrl+\` 可一键缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.webp" alt="时间轴" />

</details>

## 添加机构 {#adding-mechanisms}

将 `Mechanism2d` 字段拖入控制面板即可开始使用。点击 X 按钮可删除机构，点击眼睛图标或双击字段名称可暂时隐藏机构。如需移除所有机构，请点击列表标题旁的垃圾桶图标，然后选择 `清除所有字段`。你也可以在列表中点击并拖动机构来调整排列顺序。

## 发布数据 {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

要使用 WPILib 发布机构数据，请通过 `Telemetry` 周期性地记录 `Mechanism2d` 对象（如下所示）。请注意，该调用只会记录 `Mechanism2d` 当前的状态，因此在每次更新对象后，都必须在每个循环周期中重新调用一次。

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

要使用 AdvantageKit 发布机构数据，请将 `Mechanism2d` 周期性地记录为输出字段（如下所示）。请注意，该调用只会记录 `Mechanism2d` 当前的状态，因此在每次更新对象后，都必须在每个循环周期中重新调用一次。

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
也可以使用 AdvantageKit 的 [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) 注解，在每个循环周期自动记录机构状态，无需手动调用 `Logger.recordOutput`。
:::

</TabItem>
</Tabs>
