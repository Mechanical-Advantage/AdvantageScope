---
sidebar_position: 2
---

# 🤖 踏上場地：機器人視覺化

既然基本遙測已經運作起來，現在該來視覺化你的機器人了！AdvantageScope 提供強大的 2D 與 3D 場地檢視器，能在 FRC 與 FTC 場地模型上生動呈現里程計、視覺估計、軌跡與連桿機構。

在這篇教學課程中，你將學會如何：

- 使用 **Telemetry API** 發布結構化姿態資料。
- 使用 **🗺️ 2D 場地**與 **👀 3D 場地**分頁視覺化機器人移動。
- 在 2D 與 3D 中發布並渲染機構。

## 1. 發布姿態

在 WPILib 中，會使用 `Pose2d`、`Pose3d` 與 `Translation2d` 等幾何物件來表示機器人與場地元素的位置。透過 **Telemetry API**，只需一次方法呼叫即可直接記錄姿態／平移及其陣列（例如規劃路徑或視覺目標）：

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

<details>
<summary>範例 OpMode</summary>

想在沒有完整機器人專案的情況下體驗 AdvantageScope 的視覺化功能嗎？複製下方的 OpMode，它會在 FRC 場地模型上發布數個 2D 與 3D 姿態以供示範。有關建立新 WPILib 專案並設定遙測的詳細說明，請參閱 👋 [你好，遙測！](/tutorials/hello-telemetry)。

```java
@Teleop
public class ExampleTeleop implements OpMode {
  @Override
  public void periodic() {
    double t = Timer.getTimestamp();

    // 產生範例圓形行駛軌跡
    double x = 2.0 * Math.cos(t * 0.5);
    double y = 2.0 * Math.sin(t * 0.5);
    Rotation2d rotation = Rotation2d.fromRadians(t * 0.5 + Math.PI / 2.0);
    Pose2d robotPose2d = new Pose2d(x, y, rotation);

    // 建立範例 3D 姿態（例如來自視覺定位或陀螺儀俯仰／滾轉角）
    Pose3d robotPose3d = new Pose3d(x, y, 0.0, new Rotation3d(0.0, 0.0, rotation.getRadians()));

    // 建立範例軌跡（Pose2d 物件陣列）
    Pose2d[] trajectory = new Pose2d[] {
        new Pose2d(8.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 6.0, Rotation2d.CW_PI_2)
    };

    // 記錄個別的 2D 與 3D 姿態
    Telemetry.log("Field/RobotPose2d", robotPose2d);
    Telemetry.log("Field/RobotPose3d", robotPose3d);

    // 記錄姿態陣列（例如軌跡或 AprilTag 姿態）
    Telemetry.log("Field/Trajectory", trajectory);
  }
}
```

</details>

在 AdvantageScope 中，側邊欄裡的幾何數值會標示其類型。你也可以展開每個欄位，檢視姿態的各個分量，例如 X、Y 與旋轉數值：

<img src="/img/tutorials/to-the-field-1.webp" alt="在 AdvantageScope 側邊欄中檢視姿態資料。" />

_上圖所示為英文介面。_

## 2. 視覺化 2D 資料

🗺️ [2D 場地](/tab-reference/2d-field)分頁會顯示機器人疊加在比賽場地上的俯視圖。

1. 在 AdvantageScope 中，點擊分頁列中的 **+** 按鈕並選擇 **2D 場地**（或選取現有的 2D 場地分頁）。
2. 從底部控制面板的「場地」下拉式選單中，選擇目前賽季或常駐場地。
3. 在側邊欄樹狀結構中找到 `NT:/Telemetry/Field/RobotPose2d`，將其拖曳到控制面板的「姿態」清單中。
4. 你的機器人就會出現在場地上！
5. 點擊控制面板中姿態旁的圖示可變更機器人顏色。

:::info 攝影機控制

在場地畫布任意處按右鍵，即可選擇**未鎖定**、**鎖定到機器人**（隨機器人平移），或**鎖定機器人位置與旋轉**（旋轉場地讓機器人始終朝上）。點擊「方向」下方的按鈕可調整旋轉。
:::

<img src="/img/tutorials/to-the-field-2.webp" alt="2026 FRC 場地上的機器人視覺化。" />

_上圖所示為英文介面。_

## 3. 切換物件類型

除了單純的機器人姿態外，AdvantageScope 還支援多種視覺物件類型，包括殘影（半透明機器人）、軌跡、視覺目標、熱力圖、AprilTag、遊戲物件等等！若要探索 AdvantageScope 能渲染哪些物件類型：

1. 點擊控制面板中的 `?`（說明）圖示。
2. 隨即會開啟一個視窗，列出所有支援的視覺類型、預期的資料類型（例如 `Pose2d`、`Pose3d[]`、`Translation2d`），以及它們可以作為獨立項目新增，或是必須作為子物件附加到另一個物件下方。

點擊控制面板中每個姿態旁的圖示即可切換物件類型。試著將機器人姿態切換為殘影、箭頭或熱力圖等其他物件類型！

<img src="/img/tutorials/to-the-field-3.webp" alt="2D 場地的內建說明視窗。" height="500" />

_上圖所示為英文介面。_

## 4. 視覺化 3D 資料

👀 [3D 場地](/tab-reference/3d-field)分頁會渲染包含遊戲物件、燈光與可自訂機器人模型的 3D 場地。

1. 點擊分頁列中的 **+** 並選擇 **3D 場地**（或選取現有的 3D 場地分頁）。
2. 從「場地」下拉式選單中選擇你的賽季場地模型。
3. 將 `NT:/Telemetry/Field/RobotPose3d` 或 `NT:/Telemetry/Field/RobotPose2d` 拖曳到「姿態」區段。（2D 姿態會自動放置在場地地板上）。
4. 將 `NT:/Telemetry/Field/Trajectory` 拖曳到「姿態」清單中並將其類型設為**軌跡**，即可在場地上將路徑渲染為緞帶。
5. 按住**滑鼠左鍵**拖曳可繞場地旋轉攝影機；按住**滑鼠右鍵**拖曳可平移；滾動滾輪可縮放。
6. 或者，使用 **WASD** 平移、**IJKL** 旋轉，以及 **Q/E** 上下移動。
7. 在 3D 檢視區按右鍵，可在**環繞機器人**、**駕駛站**（從你的聯盟視角觀看比賽）與**固定攝影機**（從機器人上的視覺攝影機視角觀看）之間切換。

<img src="/img/tutorials/to-the-field-4.webp" alt="3D 場地分頁渲染帶有軌跡緞帶的 3D 機器人模型在場地上行駛。" />

_上圖所示為英文介面。_

## 5. 發布機構資料

如果你的機器人具有升降梯、手臂或手腕等連桿結構，可以使用 WPILib 的 `Mechanism2d` 來進行視覺化。詳細資訊請參閱 WPILib [文件](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html)。下方示範了一個單關節手臂的範例。

```java
public class ExampleTeleop implements OpMode {
  // 建立 2D 機構畫布（寬 2 m、高 2 m）
  private final Mechanism2d mechanism = new Mechanism2d(2.0, 2.0);
  private MechanismLigament2d arm;

  public ExampleTeleop(Robot robot) {
    // 建立根部設於 (1 m, 0.5 m) 的手臂
    MechanismRoot2d root = mechanism.getRoot("ArmRoot", 1.0, 0.5);
    arm = root.append(new MechanismLigament2d("Arm", 0.8, 0.0, 6.0, new Color8Bit(255, 100, 0)));
  }

  @Override
  public void periodic() {
    // 為手臂角度製作動畫
    double angle = 45.0 + 45.0 * Math.sin(Timer.getTimestamp() * 2.0);
    arm.setAngle(angle);

    // 每個迴圈週期發布機構狀態
    Telemetry.log("Superstructure/Mechanism", mechanism);
  }
}
```

## 6. 在 2D 中視覺化機構

可以使用 ⚙️ [機構](/tab-reference/mechanism)分頁在 2D 中視覺化機構。

1. 點擊分頁列中的 **+** 並選擇**機構**。
2. 將 `NT:/Telemetry/Superstructure/Mechanism` 拖曳到控制面板中，你會看到動態的 2D 手臂即時移動。

<img src="/img/tutorials/to-the-field-5.webp" alt="顯示 2D 連桿手臂視覺化的機構分頁。" />

_上圖所示為英文介面。_

## 7. 在 3D 中視覺化機構

你也可以將同一個 `Mechanism2d` 直接投影到 3D 場地分頁中的機器人上！

1. 在 3D 場地分頁中，確保你的機器人姿態已加入「姿態」清單。
2. 將 `NT:/Telemetry/Superstructure/Mechanism` **拖曳到**物件清單中的機器人姿態項目**上**（作為子物件）。
3. 2D 機構就會投影到機器人底盤的 3D 空間中！點擊機構旁的齒輪圖示，即可在 **XZ**（側面輪廓）與 **YZ**（正面輪廓）平面之間切換。

<img src="/img/tutorials/to-the-field-6.webp" alt="3D 場地分頁顯示投影在 3D 機器人模型上的機構。" />

_上圖所示為英文介面。_

## 下一步？

既然你已經能在 2D 與 3D 中視覺化機器人的動作與機構：

- **🕹️ [掌握控制：DS 與搖桿](/tutorials/taking-control)：** 學習如何與 FIRST Driver Station 整合、處理 DS 日誌並視覺化控制器輸入。
- **👀 [3D 場地](/tab-reference/3d-field)：** 3D 場地分頁的完整指南，包含遊戲物件視覺化、攝影機選項與渲染模式。
- **[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr)：** 在 iPhone 與 iPad 上透過擴增實境生動呈現 3D 場地檢視。
- **🎬 [影片](/tab-reference/video)：** 將場地視覺化與真實比賽影片並排比較。
- **🦀 [Swerve](/tab-reference/swerve)：** 視覺化 Swerve 驅動機構的狀態，包含在 2D 與 3D 場地上的疊加顯示。
- **⚙️ [自訂資源](/more-features/custom-assets)：** 新增自訂 CAD 模型、連桿機構與場地圖片／模型。
