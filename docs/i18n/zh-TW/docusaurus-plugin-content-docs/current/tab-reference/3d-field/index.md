import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 3D 場地 {#3d-field}

「3D 場地」分頁會以 3D 方式呈現機器人與場地的立體視覺化畫面。除了搭配一般的 2D 姿態使用外，在處理 3D 計算時（例如使用 AprilTag 進行定位）特別實用。這裡提供多種攝影機視角，包含相對場地、相對機器人與固定視角；透過 [AdvantageScope XR](advantagescope-xr)，你還能在擴增實境中檢視此分頁的內容。時間軸會標示機器人的啟用時段，並可用來瀏覽日誌資料。

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="3D 場地分頁範例" />

_上圖所示為英文介面。_

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與資料視覺化。點擊時間軸即可選取時間點，按右鍵則可取消選取。選取的時間點會在所有分頁間同步，方便你快速在其他檢視中定位。

黃色區段代表機器人處於自動階段，藍色區段代表遙控階段，灰色區段則代表實用工具模式。

若要縮放，請將游標移至時間軸上方並向上或向下捲動。你也可以按住 `Shift` 並點擊拖曳來選取範圍。若要左右移動，可在支援的裝置上水平捲動，或直接在時間軸上點擊拖曳。即時連線時，向左捲動會解除鎖定目前時間，捲動至最右側則會重新鎖定目前時間。按下 `Ctrl+\` 可快速縮放至機器人啟用的區段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

:::warning 2026-2027 FTC 場地
由於蜂巢 (hive) 上的標籤位置預期會在比賽期間變動，2026-2027 FTC 場地模型並未內建 AprilTag。隊伍可以發布 `Pose3d[]` 與 `number[]`，將動態的 AprilTag 物件新增到場地上。此場地適用的 AprilTag 尺寸為 **3.25 英吋**。
:::

:::warning 2026 FRC 場地
2026 FRC 場地模型採用的是**焊接場地 (welded field)** 的 AprilTag 佈局。焊接場地與 AndyMark 場地之間的差異非常細微，但若依據 AndyMark 場地佈局來視覺化 AprilTag 姿態，仍可能出現約 0.5 英吋的小幅偏差。
:::

## 新增物件 {#adding-objects}

先將欄位拖曳到「姿態」區段即可開始。點擊 X 按鈕可刪除物件；點擊眼睛圖示或雙擊欄位名稱則可暫時隱藏。若要移除所有物件，請點擊標題旁的垃圾桶圖示，再選擇 `清除所有欄位`。你也可以點擊並拖曳來調整物件在清單中的順序。

**若要自訂各個物件，請點擊彩色圖示或在欄位名稱上按右鍵。** AdvantageScope 支援多種物件類型，其中許多都可以進行自訂（例如變更顏色與機器人模型）。部分物件必須作為子物件新增至現有物件下方。

:::tip
點擊 `?` 圖示即可檢視所有支援的物件類型清單，其中也包含支援的資料類型，以及該物件是否必須作為子物件新增。
:::

:::info
AdvantageScope 支援 FTC 場地的多種 AprilTag 尺寸。尺寸是以 AprilTag **黑色部分的邊長**計算，不包含外圍的白色邊框。
:::

## 資料格式 {#data-format}

幾何資料應以位元組編碼的 struct 或 protobuf 格式發布。AdvantageScope 支援多種 2D 與 3D 幾何類型，包括 `Pose2d`、`Pose3d`、`Translation2d`、`Translation3d` 等。

許多函式庫都支援 struct 格式，包括 WPILib 與 AdvantageKit。以下範例程式碼示範如何在 Java 中記錄 3D 姿態資料。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose3d[] {poseA, poseB});
```

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

機構資料可以使用 2D 機構或連桿 3D 組件來視覺化。

### 2D 機構 {#2d-mechanisms}

若要視覺化使用 [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) 記錄的機構資料，請將機構欄位新增至現有的機器人或殘影物件。機構會如下圖所示，以簡單的方塊投影到機器人的 XZ 或 YZ 平面上。點擊齒輪圖示或在欄位名稱上按右鍵，即可在 XZ 與 YZ 平面之間切換。機器人的原點位於機構底部邊緣的中心點。

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="2D 機構" />

### 3D 組件 {#3d-components}

:::warning
設定 3D 組件通常較為複雜且耗時。建議優先考慮上述的 AdvantageScope `Mechanism2d` 支援，能以更簡便的方式在 3D 場地上視覺化機構。
:::

若要以連桿組件呈現機構，請記錄一組代表各組件相對於機器人位置的 3D 姿態，將這些姿態新增至現有的機器人或殘影物件，並將物件類型設為「組件」。

每個組件都能獨立移動（例如電梯滑台、手臂或末端執行器）。AdvantageKit 使用者可以考慮使用 [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) 方法，將 `Mechanism2d` 轉換為 `Pose3d` 物件陣列。有關設定含組件機器人的更多資訊，請參閱[自訂資源](/more-features/custom-assets)。

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="3D 機構" />

## 遊戲物件 {#game-piece-objects}

每個場地都內建一組遊戲物件類型，可根據機器人程式碼發布的資料，在場地上的任何位置渲染遊戲物件。常見應用包括：

- 以簡單動畫呈現模擬自動階段的動作
- 顯示場地上偵測到的遊戲物件位置
- 標示遊戲物件在機器人內部的位置
- 檢視依據物理計算得出的射擊軌跡

另一個常見用途是根據感測器資料顯示機器人內部的遊戲物件狀態。例如，當 2024 年機器人音符通道中的紅外線感測器偵測到音符時，畫面上的音符就會隨之顯示（如下圖所示）。

<details>
<summary>程式碼範例</summary>

AdvantageKit KitBot 2024 範例專案包含一個簡單的[命令](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java)範例，用於製作音符從機器人飛向音箱的動畫。此命令已整合至標準[發射序列](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73)中，在每次釋放音符時觸發動畫。[這支影片](https://youtube.com/shorts/-HxfDo9f19U?feature=share)展示了如何運用遊戲物件動畫來呈現多個不同賽季的自動階段。

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="2024 KitBot 音符視覺化" />

## 攝影機選項 {#camera-options}

在渲染出的場地檢視上按右鍵，即可切換選取的攝影機模式。每個彈出視窗的攝影機模式與位置皆可獨立控制，方便建立多視角畫面。

:::info
在場地檢視上按右鍵並點擊「設定視野...」，即可調整環繞與駕駛站攝影機的視野 (FOV)。
:::

### 環繞場地 {#orbit-field}

這是預設的攝影機模式，攝影機可相對於場地自由移動。**滑鼠左鍵 + 拖曳**可旋轉攝影機，**滑鼠右鍵 + 拖曳**可平移攝影機，**滾動滾輪**則可縮放畫面。

:::tip
你也可以使用鍵盤控制攝影機：**WASD** 鍵用於平移，**IJKL** 鍵用於旋轉，**E** 與 **Q** 鍵則用於垂直升降。
:::

### 環繞機器人 {#orbit-robot}

此模式的操作方式與「環繞場地」相同，但攝影機的位置會相對於機器人鎖定，適合用來製作機器人移動時的「追蹤」鏡頭。

### 駕駛站 {#driver-station}

此模式會將攝影機鎖定在其中一個駕駛站後方的一般視線高度。你可以手動選擇要檢視的站台，或選擇「自動」以套用日誌資料中記錄的聯盟與站台編號。

:::warning
檢視 AdvantageKit 2023 或更早版本產生的日誌資料時，自動選擇站台編號的功能可能會不準確。
:::

### 固定攝影機 {#fixed-camera}

每個機器人模型都可設定一組固定攝影機，例如視覺攝影機與駕駛攝影機，各自擁有固定的位置、長寬比與 FOV。這些視角常用來檢查視覺辨識資料，或模擬駕駛看到的攝影機畫面。下圖即為駕駛攝影機的範例。

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="固定攝影機" />

若提供了「攝影機覆寫」姿態，它會取代所有固定攝影機的預設姿態，同時保留各自設定的 FOV 與長寬比。這讓機器人程式碼能提供動態攝影機的位置，例如安裝在砲塔或射手罩上的攝影機。

:::info
與其他姿態資料相同，「攝影機覆寫」姿態必須是*相對場地*的座標，而非相對機器人。
:::

## 設定 {#configuration}

你可以透過下拉式選單設定場地模型，所有近期的 FRC 與 FTC 比賽皆有支援。對於圖形效能有限的裝置，建議使用「Evergreen」場地。「座標軸」場地則只會在原點顯示 XYZ 軸，並搭配作為比例參考的場地輪廓。

:::info
此分頁使用的座標系可依需求自訂，詳細說明請參閱[座標系](/more-features/coordinate-systems)頁面。
:::

### 渲染模式 {#rendering-modes}

3D 場地支援三種渲染模式：

- **電影級 (左)：** 啟用陰影、光照、反射與高細節 3D 模型進行渲染，呈現更擬真的視覺效果，需要效能較強的 GPU。
- **標準 (中)：** 預設模式，採用基本光照與簡化的 3D 模型進行渲染，在多數裝置上都能流暢執行。
- **節能 (右)：** 降低畫面更新率、解析度與模型細節以減少耗電，讓低階裝置也能維持穩定效能。

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="渲染模式比較" />

若要調整渲染模式，請點擊 `應用程式` > `顯示偏好設定...`（Windows/Linux）或 `AdvantageScope` > `設定...`（macOS）開啟偏好設定視窗。你可以將「3D 模式 (使用電池)」設定從預設值切換為其他模式，以覆寫筆記型電腦在未充電時使用的渲染模式，例如在比賽現場藉此節省電量。

<img src="/img/prefs_zh-TW.webp" alt="偏好設定圖解" height="450" />
