import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 3D 場地 {#3d-field}

3D 場地顯示機器人與場地的 3D 視覺化。它可以與一般的 2D 姿態搭配使用，但在處理 3D 計算時特別有幫助（例如使用 AprilTag 進行定位）。提供多種攝影機視角，包括相對於場地、相對於機器人以及固定視角。[AdvantageScope XR](advantagescope-xr) 允許使用擴增實境來視覺化此分頁。時間軸顯示機器人何時啟用，並可用於導覽日誌資料。

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="3D 場地分頁範例" />

_上圖所示為英文介面。_

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與視覺化。點擊時間軸會選擇一個時間，按右鍵取消選擇。選取的時間在所有分頁中保持同步，從而可以輕鬆在其他視圖中快速找到此位置。

黃色區域表示機器人在自動階段，藍色區域表示機器人在遙控階段，灰色區域表示機器人在實用工具模式。

要縮放，請將游標置於時間軸上方並向上或向下滾動。也可以透過按住 `Shift` 的同時點擊並拖曳來選擇範圍。透過水平滾動（在受支援的裝置上）或透過在時間軸上點擊並拖曳來左右移動。當即時連線時，向左滾動會解鎖目前時間，滾動到最右側會再次鎖定到目前時間。按下 `Ctrl+\` 可縮放至機器人啟用的時間段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

:::warning
2026 FRC 場地模型與**焊接**場地的 AprilTag 佈局一致。焊接場地與 AndyMark 場地之間的差異非常微小，但在根據 AndyMark 場地佈局視覺化 AprilTag 姿態時，可能會出現微小的（約 0.5 英吋）偏差。
:::

## 新增物件 {#adding-objects}

要開始，請將欄位拖曳到「姿態」區段。使用 X 按鈕刪除物件，或透過點擊眼睛圖示或雙擊欄位名稱暫時隱藏它。要移除所有物件，請點擊軸標題附近的垃圾桶，然後點擊 `全部清除`。可以透過點擊並拖曳在清單中重新排列物件。

**要自訂每個物件，請點擊彩色圖示或在欄位名稱上按右鍵。** AdvantageScope 支援大量物件類型，其中許多類型都可以自訂（例如變更顏色與機器人模型）。某些物件必須作為子物件新增至現有物件。

:::tip
要檢視受支援物件類型的完整清單，請點擊 `?` 圖示。該清單還包含受支援的資料類型以及物件是否必須作為子物件新增。
:::

:::info
AdvantageScope 支援 FTC 場地的多種尺寸 AprilTag。尺寸以 AprilTag **黑色部分的邊長**為準，不包含必要的白色邊框。
:::

## 資料格式 {#data-format}

幾何資料應作為位元組編碼的 struct 或 protobuf 發布。支援各種 2D 與 3D 幾何類型，包括 `Pose2d`、`Pose3d`、`Translation2d`、`Translation3d` 等。

許多函式庫都支援 struct 格式，包括 WPILib 與 AdvantageKit。下面的範例程式碼展示了如何在 Java 中記錄 3D 姿態資料。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

StructPublisher<Pose3d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose3d.struct).publish();
StructArrayPublisher<Pose3d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose3d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose3d[] {poseA, poseB});
}
```

:::tip
WPILib 的 [`Field2d`](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/glass/field2d-widget.html) 類別也可以用於一起記錄數組 2D 姿態資料。
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
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
```

</TabItem>
</Tabs>

## 機構與組件 {#mechanisms-and-components}

機構資料可以使用 2D 機構或關節 3D 組件進行視覺化。

### 2D 機構 {#2d-mechanisms}

要視覺化使用 [`Mechanism2d`](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/glass/mech2d-widget.html) 記錄的機構資料，請將機構欄位新增至現有的機器人或幽靈物件。機構使用簡單的方塊投影到機器人的 XZ 或 YZ 平面上，如下所示。點擊齒輪圖示或在欄位名稱上按右鍵以在 XZ 和 YZ 平面之間切換。機器人的原點位於機構底部邊緣的中心。

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="2D 機構" />

### 3D 組件 {#3d-components}

:::warning
設定 3D 組件可能複雜且耗時。請考慮使用如上所述的 AdvantageScope `Mechanism2d` 支援，它提供了一種更簡化的方法來在 3D 場地上視覺化機構。
:::

機構可以透過記錄一組代表每個組件相對於機器人位置的 3D 姿態來使用關節組件進行視覺化。將姿態新增至現有的機器人或殘影物件，並將物件類型設定為「Component」。

每個組件都可以獨立移動（如升降車廂、手臂或末端執行器）。AdvantageKit 使用者應考慮使用 [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) 方法將 Mechanism2d 轉換為 Pose3d 物件陣列。有關設定帶有組件的機器人的更多資訊，請參閱[自訂資源](/more-features/custom-assets)。

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="3D 機構" />

## 遊戲物件 {#game-piece-objects}

每個場地都包含一組遊戲物件類型，允許使用機器人程式碼發布的資料，將遊戲物件渲染在場地上的任何位置。這有各種應用，包括：

- 使用簡單動畫視覺化模擬自動程序的動作
- 顯示場地上偵測到的遊戲物件位置
- 指示遊戲物件在機器人內的位置
- 根據物理計算查看射擊軌跡

另一個簡單的使用案例是根據感測器資料顯示機器人內遊戲物件的狀態。例如，2024 年機器人音符路徑中的光幕感測器可能導致音符出現（如下所示）。

<details>
<summary>程式碼範例</summary>

AdvantageKit KitBot 2024 範例專案包含一個簡單的[命令](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java)範例，用於對音符從機器人飛向音箱的過程進行動畫處理。此命令已整合至標準[發射序列](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73)中，每當音符被釋放時觸發動畫。[此影片](https://youtube.com/shorts/-HxfDo9f19U?feature=share)展示了如何使用遊戲物件動畫來視覺化多種不同比賽的自動程序。

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="2024 KitBot 音符視覺化" />

## 攝影機選項 {#camera-options}

要切換選取的攝影機模式，請在渲染的場地視圖上按右鍵。每個快顯視窗的攝影機模式與位置都是獨立控制的，可以輕鬆建立多攝影機視圖。

:::info
在渲染的場地視圖上按右鍵，然後點擊「設定 FOV...」以調整環繞與駕駛站攝影機的 FOV。
:::

### 環繞場地 {#orbit-field}

這是預設的攝影機模式，攝影機可以相對於場地自由移動。**滑鼠左鍵 + 拖曳**旋轉攝影機，**滑鼠右鍵 + 拖曳**平移攝影機。**滾動**以縮放。

:::tip
攝影機也可以使用鍵盤控制。**WASD** 鍵用於平移，**IJKL** 鍵用於旋轉，**E** 與 **Q** 鍵用於垂直平移。
:::

### 環繞機器人 {#orbit-robot}

此模式具有與「環繞場地」模式相同的控制項，但攝影機的位置相對於機器人是鎖定的。這允許對機器人的移動進行「追蹤」拍攝。

### 駕駛站 {#driver-station}

此模式將攝影機鎖定在典型眼高度的其中一個駕駛站後方。可以手動選擇要查看的站台，或選擇「自動」以使用日誌資料中儲存的聯盟與站台號碼。

:::warning
當查看 AdvantageKit 2023 或更早版本產生的日誌資料時，站台號碼的自動選擇可能不準確。
:::

### 固定攝影機 {#fixed-camera}

每個機器人模型都設定了一組固定攝影機，如視覺與駕駛攝影機。這些攝影機具有固定的位置、長寬比與 FOV。這些視圖通常用於檢查視覺資料或模擬駕駛攝影機視角。下例中顯示了一個駕駛攝影機。

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="固定攝影機" />

如果提供了「攝影機覆蓋」姿態，它將取代所有固定攝影機的預設姿態，同時保留其設定的 FOV 與長寬比。這允許機器人程式碼提供移動攝影機的位置，例如安裝在砲塔或射手罩上的攝影機。

:::info
與其他姿態資料一致，「攝影機覆蓋」姿態必須是*相對於場地*的，而非相對於機器人的。
:::

## 設定 {#configuration}

可以使用下拉式選單設定場地模型。支援所有近期的 FRC 與 FTC 比賽。我們建議圖形效能有限的裝置使用「Evergreen」場地。「Axes」場地僅顯示原點處的 XYZ 軸以及用於縮放的場地輪廓。

:::info
在此分頁上使用的座標系是可自訂的。有關詳細資訊，請參閱[座標系](/more-features/coordinate-systems)頁面。
:::

### 渲染模式 {#rendering-modes}

3D 場地支援三種渲染模式：

- **電影級模式 (左)：** 使用陰影、光照、反射與高細節 3D 模型進行渲染，以獲得更真實的外觀。需要相當強大的 GPU。
- **標準模式 (中)：** 預設，使用最少的光照與簡化的 3D 模型進行渲染。在大多數裝置上運行良好。
- **節能模式 (右)：** 降低幀率、解析度與模型細節以減少電池消耗，並在低階裝置上提供更穩定的效能。

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="渲染模式比較" />

要設定渲染模式，請按一下 `應用程式` > `顯示偏好設定...`（Windows/Linux）或 `AdvantageScope` > `設定...`（macOS）以開啟偏好設定視窗。可以將「3D 模式（電池）」設定從預設值切換，以覆蓋筆記型電腦在未充電時使用的渲染模式。例如，這可用於在比賽時節省電池。

<img src="/img/prefs_zh-TW.webp" alt="偏好設定圖解" height="450" />
