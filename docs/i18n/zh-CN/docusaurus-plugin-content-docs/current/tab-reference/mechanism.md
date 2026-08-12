---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ 机构 {#mechanism}

机构选项卡显示由一个或多个 [Mechanism2d](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/glass/mech2d-widget.html) 对象创建的铰接机构。

<img src="/img/tab-reference/mechanism-1.png" alt="机构标签页概述" />

<details>
<summary>时间轴控制</summary>

时间轴用于控制播放和可视化。在时间轴上点击可选择时间，右键单击可取消选择。所选时间将在所有选项卡中同步，从而可以轻松地在其他视图中快速找到此位置。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

要进行缩放，请将光标置于时间轴上方并向上或向下滚动。按住 `Shift` 的同时点击并拖动也可以选择一个范围。通过水平滚动（在受支持的设备上）或在时间轴上点击并拖动来左右移动。当进行实时连接时，向左滚动会解锁与当前时间的关联，而一路向右滚动将重新锁定到当前时间。按下 `Ctrl+\` 可缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.png" alt="时间轴" />

</details>

## 添加机构 {#adding-mechanisms}

要开始使用，请将 `Mechanism2d` 拖动到控制面板。使用 X 按钮删除机构，或通过点击眼睛图标或双击字段名称临时隐藏它。要移除所有机构，请点击轴标题附近的垃圾桶图标，然后点击 `清除所有字段`。可以在列表中通过点击并拖动来重新排列机构。

## 发布数据 {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

要使用 WPILib 发布机构数据，请将 `Mechanism2d` 对象发送到 NetworkTables（如下所示）。如果启用了数据日志记录，还可以根据生成的 WPILOG 文件查看机构。

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

要使用 AdvantageKit 发布机构数据，请将 `Mechanism2d` 记录为输出字段（如下所示）。请注意，此调用仅记录 `Mechanism2d` 的当前状态，因此在更新对象后必须在每个循环周期调用它。

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
