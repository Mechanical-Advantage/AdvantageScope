---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 點位圖 {#points}

「點位圖」分頁可用於呈現任意點位的 2D 視覺化圖形。這是一項相當彈性的工具，適合用來建立視覺資料／管線或機構狀態等自訂視覺化畫面。

<img src="/img/tab-reference/points-1.webp" alt="點位圖分頁範例" />

_上圖所示為英文介面。_

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與視覺化。點擊時間軸可選取時間點，按右鍵則可取消選取；選取的時間會在所有分頁間同步，方便你快速在其他分頁中定位到相同時間。

黃色區段代表機器人處於自動階段，藍色區段代表遙控階段，灰色區段則代表測試模式。

將游標移至時間軸上方並上下滾動即可縮放，也可以按住 `Shift` 拖曳來選取範圍。在支援的裝置上可透過水平滾動左右移動，或直接在時間軸上按住左鍵拖曳。在即時連線狀態下，向左滾動會解除鎖定目前時間，向右滾動到底則會重新鎖定目前時間。按下 `Ctrl+\` 可縮放至機器人啟用的時段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

## 新增來源 {#adding-sources}

將欄位拖曳到「來源」區段即可開始使用。點擊 X 按鈕可移除來源，點擊眼睛圖示或雙擊欄位名稱則可暫時隱藏。若要移除所有物件，請點擊標題旁的垃圾桶圖示，再選擇 `全部清除`。在清單中拖曳欄位即可重新排序。

**點擊彩色圖示或在欄位名稱上按右鍵，即可自訂各個來源的外觀**，包括符號樣式、顏色與大小。

:::tip
若要查看所有支援的來源類型與資料格式，請點擊 `?` 圖示。
:::

## 資料格式 {#data-format}

點資料應使用 `Translation2d[]` 類型，並以位元組編碼的 struct 或 protobuf 格式發布。WPILib 與 AdvantageKit 等多個函式庫皆支援此格式，以下範例程式示範如何在 Java 中記錄點資料：

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

## 設定 {#configuration}

以下是可用的設定選項：

- **尺寸：** 顯示區域的大小，可使用與所發布點資料相符的任何單位。顯示視覺資料時，這代表攝影機的解析度。
- **座標系方向：** 要使用的座標系方向（X 軸與 Y 軸的朝向）。
- **座標系原點：** 原點在座標系中的位置。
