---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D 場地 {#2d-field}

「2D 場地」分頁會在場地地圖上疊加顯示機器人的 2D 視覺化畫面，也能同時呈現視覺目標狀態與參考姿態等額外資料。

<img src="/img/tab-reference/2d-field-1.webp" alt="2D 場地分頁概述" />

_上圖所示為英文介面。_

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與資料視覺化。點擊時間軸即可選取時間點，按右鍵則可取消選取。選取的時間點會在所有分頁間同步，方便你快速在其他檢視中定位。

黃色區段代表機器人處於自動階段，藍色區段代表遙控階段，灰色區段則代表實用工具模式。

若要縮放，請將游標移至時間軸上方並向上或向下捲動。你也可以按住 `Shift` 並點擊拖曳來選取範圍。若要左右移動，可在支援的裝置上水平捲動，或直接在時間軸上點擊拖曳。即時連線時，向左捲動會解除鎖定目前時間，捲動至最右側則會重新鎖定目前時間。按下 `Ctrl+\` 可快速縮放至機器人啟用的區段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

## 攝影機控制 {#camera-controls}

在場地上向上或向下捲動即可縮放畫面，點擊並拖曳則可平移場地。在場地任意處按右鍵可開啟攝影機選單，包含以下選項：

- **未鎖定**：手動平移與縮放畫面。
- **鎖定到機器人**：攝影機會自動平移以追蹤機器人。
- **鎖定到機器人與旋轉**：攝影機會自動平移並旋轉，追蹤機器人的位置與方向。

在任一鎖定模式下，你仍可自由將攝影機平移離開機器人；此外，無論在哪種模式下，都能使用控制面板中的方向按鈕來旋轉攝影機視角。

## 新增物件 {#adding-objects}

先將欄位拖曳到「姿態」區段即可開始。點擊 X 按鈕可刪除物件；點擊眼睛圖示或雙擊欄位名稱則可暫時隱藏。若要移除所有物件，請點擊標題旁的垃圾桶圖示，再選擇 `清除所有欄位`。你也可以點擊並拖曳來調整物件在清單中的順序。

**若要自訂各個物件，請點擊彩色圖示或在欄位名稱上按右鍵。** AdvantageScope 支援多種物件類型，其中許多都可以進行自訂（例如變更顏色）。部分物件必須作為子物件新增至現有物件下方。

:::tip
點擊 `?` 圖示即可檢視所有支援的物件類型清單，其中也包含支援的資料類型，以及該物件是否必須作為子物件新增。
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="帶有物件的 2D 場地" />

## 資料格式 {#data-format}

幾何資料應以位元組編碼的 struct 或 protobuf 格式發布。AdvantageScope 支援多種 2D 與 3D 幾何類型，包括 `Pose2d`、`Pose3d`、`Translation2d`、`Translation3d` 等。

許多函式庫都支援 struct 格式，包括 WPILib 與 AdvantageKit。以下範例程式碼示範如何在 Java 中記錄 2D 姿態資料。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

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

- **場地：** 要使用的場地圖片。支援所有近期的 FRC 與 FTC 賽季場地。若要新增自訂場地圖片，請參閱[自訂資源](/more-features/custom-assets)。
- **方向：** 檢視器面板中場地圖片的顯示方向。
- **大小：** 機器人的邊長（FRC 為 30/27/24 英吋，FTC 為 18/16/14 英吋）。

:::info
此分頁使用的座標系可依需求自訂，詳細說明請參閱[座標系](/more-features/coordinate-systems)頁面。
:::
