---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 点位 {#points}

点位选项卡用于对任意点进行 2D 可视化。它非常灵活，适合用来自定义可视化视觉数据、视觉处理流水线或机构状态等内容。

<img src="/img/tab-reference/points-1.webp" alt="点位选项卡示例" />

_上图所示为英文界面。_

<details>
<summary>时间轴控制</summary>

时间轴用于控制播放和可视化进度。点击时间轴可选中某个时间点，右键点击则取消选中。选中的时间点会在所有选项卡之间同步，方便你在其他视图中快速定位。

黄色区段表示机器人处于自动阶段，蓝色区段表示遥控阶段，灰色区段表示测试模式。

将光标置于时间轴上方并上下滚动即可缩放，也可以按住 `Shift` 键的同时点击并拖动来框选范围。通过水平滚动（在受支持的设备上）或在时间轴上点击并拖动即可左右平移。在实时连接状态下，向左滚动会解除对当前时间的锁定，向右滚动到底则会重新锁定到当前时间。按下 `Ctrl+\` 可快速缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.webp" alt="时间轴" />

</details>

## 添加数据源 {#adding-sources}

将字段拖入“来源”区域即可开始使用。点击 X 按钮可删除数据源，点击眼睛图标或双击字段名称可临时隐藏它。要移除所有对象，请点击标题旁的垃圾桶图标，然后选择 `全部清除`。你还可以在列表中点击并拖动数据源来调整顺序。

**点击彩色图标或右键点击字段名称，即可自定义每个数据源的显示效果**，包括符号样式、颜色和大小。

:::tip
点击 `?` 图标可查看受支持的数据源类型及数据类型完整列表。
:::

## 数据格式 {#data-format}

点位数据应以字节编码的结构体或 protobuf 形式发布，数据类型为 `Translation2d[]`。包括 WPILib 和 AdvantageKit 在内的许多库都支持这种格式。以下示例展示了如何在 Java 中记录点位数据。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
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

## 配置 {#configuration}

可用的配置选项如下：

- **尺寸：** 显示区域的大小，可使用与发布点位一致的任何单位。显示视觉数据时，通常设置为相机的分辨率。
- **方向：** 使用的坐标系方向（即 X 轴和 Y 轴的正方向）。
- **原点：** 坐标系原点的位置。
