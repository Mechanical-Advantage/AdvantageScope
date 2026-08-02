---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ 機構

機構分頁顯示使用一個或多個 [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) 物件建立的關節機構。

<img src="/img/tab-reference/mechanism-1.png" alt="機構分頁概述" />

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與視覺化。點擊時間軸會選擇一個時間，按右鍵取消選擇。選取的時間在所有分頁中保持同步，從而可以輕鬆在其他視圖中快速找到此位置。

黃色區域表示機器人在自動階段，藍色區域表示機器人在遙控階段，灰色區域表示機器人在實用工具模式。

要縮放，請將游標置於時間軸上方並向上或向下滾動。也可以透過按住 `Shift` 的同時點擊並拖曳來選擇範圍。透過水平滾動（在受支援的裝置上）或透過在時間軸上點擊並拖曳來左右移動。當即時連線時，向左滾動會解鎖目前時間，滾動到最右側會再次鎖定到目前時間。按下 `Ctrl+\` 可縮放至機器人啟用的時間段。

<img src="/img/tab-reference/timeline.png" alt="時間軸" />

</details>

## 新增機構

要開始，請將 `Mechanism2d` 拖曳到控制面板。使用 X 按鈕刪除機構，或透過點擊眼睛圖示或雙擊欄位名稱暫時隱藏它。要移除所有機構，請點擊軸標題附近的垃圾桶，然後點擊 `全部清除`。可以透過點擊並拖曳在清單中重新排列機構。

## 發布資料

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

要使用 WPILib 發布機構資料，請將 `Mechanism2d` 物件發送至 NetworkTables（如下所示）。如果啟用了資料記錄，還可以基於產生的 WPILOG 檔案檢視機構。

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

要使用 AdvantageKit 發布機構資料，請將 `Mechanism2d` 記錄為輸出欄位（如下所示）。請注意，此呼叫僅記錄 `Mechanism2d` 的目前狀態，因此在物件更新後，必須在每個迴圈週期呼叫它。

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
