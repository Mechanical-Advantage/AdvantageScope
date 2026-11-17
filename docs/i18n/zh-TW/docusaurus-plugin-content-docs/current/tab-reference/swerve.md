---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Swerve 分頁會顯示四個 Swerve 模組的狀態，包括速度向量、靜止位置、機器人旋轉角度與底盤速度。

<img src="/img/tab-reference/swerve-1.webp" alt="Swerve 分頁概述" />

_上圖所示為英文介面。_

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與視覺化。點擊時間軸可選取時間點，按右鍵則可取消選取；選取的時間會在所有分頁間同步，方便你快速在其他分頁中定位到相同時間。

黃色區段代表機器人處於自動階段，藍色區段代表遙控階段，灰色區段則代表實用工具模式。

將游標移至時間軸上方並上下滾動即可縮放，也可以按住 `Shift` 拖曳來選取範圍。在支援的裝置上可透過水平滾動左右移動，或直接在時間軸上按住左鍵拖曳。在即時連線狀態下，向左滾動會解除鎖定目前時間，向右滾動到底則會重新鎖定目前時間。按下 `Ctrl+\` 可縮放至機器人啟用的時段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

## 新增來源 {#adding-sources}

將欄位拖曳到「來源」區段即可開始使用。點擊 X 按鈕可移除來源，點擊眼睛圖示或雙擊欄位名稱則可暫時隱藏。若要移除所有來源，請點擊標題旁的垃圾桶圖示，再選擇 `全部清除`。在清單中拖曳欄位即可重新排序。

**點擊彩色圖示或在欄位名稱上按右鍵，即可自訂各個來源的外觀。** AdvantageScope 支援三種來源類型：

- **模組速度：** 一組四個 Swerve 模組狀態，在圖表上顯示為向量。
- **機器人速度：** 顯示於圖表中心的線速度與角速度。
- **旋轉：** 用於旋轉圖表的角度位置。

## 資料格式 {#data-format}

資料應使用 `SwerveModuleVelocity[]`、`ChassisVelocities`、`Rotation2d` 或 `Rotation3d` 類型，並以位元組編碼的 struct 或 protobuf 格式發布。

WPILib 與 AdvantageKit 等多個函式庫皆支援 struct 格式，以下範例程式示範如何在 Java 中記錄 Swerve 模組狀態：

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
自 2027 年起，此資料結構已從 `SwerveModuleState` 重新命名為 `SwerveModuleVelocity`。
若需視覺化 WPILib 2027 與 Systemcore 之前建立的舊版日誌檔案，仍可支援舊的 `SwerveModuleState` 類型。
:::

## 設定 {#configuration}

以下是可用的設定選項：

- **最大速度：** 模組可達到的最大速度，用於調整向量顯示的比例。
- **框架尺寸：** 左右與前後 Swerve 模組之間的距離，用來調整機器人圖示的長寬比。
- **方向：** 調整機器人圖示朝向的方向，常用於對齊姿態資料或比賽影片的視角。

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
