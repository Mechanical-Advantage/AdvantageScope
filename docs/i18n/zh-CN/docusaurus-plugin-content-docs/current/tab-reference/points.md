---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 点位

点位选项卡展示任意点的 2D 可视化。这是一个非常灵活的工具，允许对视觉数据/管道、机构状态等进行自定义可视化。

<img src="/img/tab-reference/points-1.png" alt="点位选项卡示例" />

<details>
<summary>时间轴控制</summary>

时间轴用于控制播放和可视化。在时间轴上点击可选择时间，右键单击可取消选择。所选时间将在所有选项卡中同步，从而可以轻松地在其他视图中快速找到此位置。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

要进行缩放，请将光标置于时间轴上方并向上或向下滚动。按住 `Shift` 的同时点击并拖动也可以选择一个范围。通过水平滚动（在受支持的设备上）或在时间轴上点击并拖动来左右移动。当进行实时连接时，向左滚动会解锁与当前时间的关联，而一路向右滚动将重新锁定到当前时间。按下 `Ctrl+\` 可缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.png" alt="时间轴" />

</details>

## 添加数据源

要开始使用，请将字段拖动到“来源”部分。使用 X 按钮删除数据源，或通过点击眼睛图标或双击字段名称临时隐藏它。要移除所有对象，请点击轴标题附近的垃圾桶图标，然后点击 `清除所有字段`。可以在列表中通过点击并拖动来重新排列数据源。

**要自定义每个数据源，请点击彩色图标或右键单击字段名称。** 可以调整每个数据源的符号、颜色和大小。

:::tip
要查看受支持数据源类型的完整列表，请点击 `?` 图标。该列表还包含受支持的数据类型。
:::

## 数据格式

点位数据应作为使用 `Translation2d[]` 类型的字节编码结构体或 protobuf 进行发布。许多库都支持这种格式，包括 WPILib 和 AdvantageKit。下面的示例代码展示了如何在 Java 中记录点位数据。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
StructArrayPublisher<Translation2d> publisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyTranslations", Translation2d.struct).publish();

periodic() {
  publisher.set(new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
  publisher.set(
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  );
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
Logger.recordOutput("MyTranslations",
  new Translation2d(0.0, 1.0),
  new Translation2d(2.0, 3.0)
);
```

</TabItem>
</Tabs>

## 配置

提供以下配置选项：

- **维度：** 显示区域的大小。这可以使用与已发布点位匹配的任何单位。显示视觉数据时，这是相机的分辨率。
- **方向：** 要使用的坐标系（X 轴和 Y 轴的方向）。
- **原点：** 坐标系中原点的位置。
