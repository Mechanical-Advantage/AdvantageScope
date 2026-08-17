---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Swerve 分頁顯示四個 Swerve 模組的狀態，包括速度向量、空閒位置、機器人旋轉與底盤速度。

<img src="/img/tab-reference/swerve-1.webp" alt="Swerve 分頁概述" />

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與視覺化。點擊時間軸會選擇一個時間，按右鍵取消選擇。選取的時間在所有分頁中保持同步，從而可以輕鬆在其他視圖中快速找到此位置。

黃色區域表示機器人在自動階段，藍色區域表示機器人在遙控階段，灰色區域表示機器人在實用工具模式。

要縮放，請將游標置於時間軸上方並向上或向下滾動。也可以透過按住 `Shift` 的同時點擊並拖曳來選擇範圍。透過水平滾動（在受支援的裝置上）或透過在時間軸上點擊並拖曳來左右移動。當即時連線時，向左滾動會解鎖目前時間，滾動到最右側會再次鎖定到目前時間。按下 `Ctrl+\` 可縮放至機器人啟用的時間段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

## 新增來源 {#adding-sources}

要開始，請將欄位拖曳到「來源」區段。使用 X 按鈕刪除來源，或透過點擊眼睛圖示或雙擊欄位名稱暫時隱藏它。要移除所有來源，請點擊軸標題附近的垃圾桶，然後點擊 `全部清除`。可以透過點擊並拖曳在清單中重新排列來源。

**要自訂每個來源，請點擊彩色圖示或在欄位名稱上按右鍵。** AdvantageScope 支援三種來源類型：

- **模組速度：** 一組四個 Swerve 模組狀態，在圖表上顯示為向量。
- **機器人速度：** 在圖表中心顯示的線速度與角速度。
- **旋轉：** 用於旋轉圖表的角度位置。

## 資料格式 {#data-format}

資料應使用 `SwerveModuleVelocity[]`、`ChassisVelocities`、`Rotation2d` 或 `Rotation3d` 類型作為位元組編碼的 struct 或 protobuf 發布。

許多函式庫都支援 struct 格式，包括 WPILib 與 AdvantageKit。下面的範例程式碼展示了如何在 Java 中記錄 Swerve 模組狀態。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
在 2027 年，此資料結構已從 `SwerveModuleState` 重新命名為 `SwerveModuleVelocity`。
對於在 WPILib 2027 和 Systemcore 之前建立的日誌檔案，仍支援使用舊的 `SwerveModuleState` 類型進行視覺化。
:::

## 設定 {#configuration}

以下是可用的設定選項：

- **最大速度：** 模組可達到的最大速度，用於調整向量的大小。
- **框架尺寸：** 左右與前後 Swerve 模組之間的距離。變更機器人圖示的長寬比。
- **方向：** 調整機器人圖示指向的方向。此選項通常對於與姿態資料對齊或匹配影片非常有幫助。

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
