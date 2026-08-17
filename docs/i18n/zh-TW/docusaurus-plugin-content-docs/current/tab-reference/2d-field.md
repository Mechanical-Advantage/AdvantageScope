---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D 場地 {#2d-field}

2D 場地分頁顯示了覆蓋在場地地圖上的機器人 2D 視覺化。它還可以顯示視覺目標狀態與參考姿態等額外資料。

<img src="/img/tab-reference/2d-field-1.webp" alt="2D 場地分頁概述" />

_上圖所示為英文介面。_

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與視覺化。點擊時間軸會選擇一個時間，按右鍵取消選擇。選取的時間在所有分頁中保持同步，從而可以輕鬆在其他視圖中快速找到此位置。

黃色區域表示機器人在自動階段，藍色區域表示機器人在遙控階段，灰色區域表示機器人在實用工具模式。

要縮放，請將游標置於時間軸上方並向上或向下滾動。也可以透過按住 `Shift` 的同時點擊並拖曳來選擇範圍。透過水平滾動（在受支援的裝置上）或透過在時間軸上點擊並拖曳來左右移動。當即時連線時，向左滾動會解鎖目前時間，滾動到最右側會再次鎖定到目前時間。按下 `Ctrl+\` 可縮放至機器人啟用的時間段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

## 新增物件 {#adding-objects}

要開始，請將欄位拖曳到「姿態」區段。使用 X 按鈕刪除物件，或透過點擊眼睛圖示或雙擊欄位名稱暫時隱藏它。要移除所有物件，請點擊軸標題附近的垃圾桶，然後點擊 `全部清除`。可以透過點擊並拖曳在清單中重新排列物件。

**要自訂每個物件，請點擊彩色圖示或在欄位名稱上按右鍵。** AdvantageScope 支援大量物件類型，其中許多類型都可以自訂（例如變更顏色）。某些物件必須作為子物件新增至現有物件。

:::tip
要檢視受支援物件類型的完整清單，請點擊 `?` 圖示。該清單還包含受支援的資料類型以及物件是否必須作為子物件新增。
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="帶有物件的 2D 場地" />

## 資料格式 {#data-format}

幾何資料應作為位元組編碼的 struct 或 protobuf 發布。支援各種 2D 與 3D 幾何類型，包括 `Pose2d`、`Pose3d`、`Translation2d`、`Translation3d` 等。

許多函式庫都支援 struct 格式，包括 WPILib 與 AdvantageKit。下面的範例程式碼展示了如何在 Java 中記錄 2D 姿態資料。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
WPILib 的 [`Field2d`](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/glass/field2d-widget.html) 類別也可以用於一起記錄數組 2D 姿態資料。
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// 此協定不支援現代 struct 格式，但可以
// 使用包含後綴 "x"、"y" 與 "heading" 的
// 獨立欄位來發布姿態數值（如下所示）：
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // 英吋
packet.put("Pose y", 2.8); // 英吋
packet.put("Pose heading", 3.14); // 弧度

// 或者，也可以以度為單位發布航向
packet.put("Pose heading (deg)", 180.0); // 度

// 在此新增其他遙測數值...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// 或者，使用 MultipleTelemetry 與標準 SDK 遙測：
// 在 OpMode 初始化時：
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// 在迴圈中：
telemetry.addData("Pose x", 6.3); // 英吋
telemetry.addData("Pose y", 2.8); // 英吋
telemetry.addData("Pose heading", 3.14); // 弧度

// 或者...
telemetry.addData("Pose heading (deg)", 180.0); // 度

// 在此新增其他遙測數值...
telemetry.update();
```

</TabItem>
</Tabs>

## 設定 {#configuration}

- **場地：** 要使用的場地圖片。支援所有近期的 FRC 與 FTC 比賽。要新增自訂場地圖片，請參閱[自訂資源](/more-features/custom-assets)。
- **方向：** 檢視器面板中場地圖片的方向。
- **大小：** 機器人的邊長（FRC 為 30/27/24 英吋，FTC 為 18/16/14 英吋）。

:::info
在此分頁上使用的座標系是可自訂的。有關詳細資訊，請參閱[座標系](/more-features/coordinate-systems)頁面。
:::
