---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ 機構 {#mechanism}

「機構」分頁會顯示由一個或多個 [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) 物件建立的連桿機構。

<img src="/img/tab-reference/mechanism-1.webp" alt="機構分頁概述" />

_上圖所示為英文介面。_

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與資料視覺化。點擊時間軸即可選取時間點，按右鍵則可取消選取。選取的時間點會在所有分頁間同步，方便你快速在其他檢視中定位。

黃色區段代表機器人處於自動階段，藍色區段代表遙控階段，灰色區段則代表測試模式。

若要縮放，請將游標移至時間軸上方並向上或向下捲動。你也可以按住 `Shift` 並點擊拖曳來選取範圍。若要左右移動，可在支援的裝置上水平捲動，或直接在時間軸上點擊拖曳。即時連線時，向左捲動會解除鎖定目前時間，捲動至最右側則會重新鎖定目前時間。按下 `Ctrl+\` 可快速縮放至機器人啟用的區段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

## 新增機構 {#adding-mechanisms}

先將 `Mechanism2d` 拖曳到控制面板即可開始。點擊 X 按鈕可刪除機構；點擊眼睛圖示或雙擊欄位名稱則可暫時隱藏。若要移除所有機構，請點擊標題旁的垃圾桶圖示，再選擇 `清除所有欄位`。你也可以點擊並拖曳來調整機構在清單中的順序。

## 發布資料 {#publishing-data}

若要發布機構資料，請定期記錄 `Mechanism2d` 物件（如下所示）。請注意，此呼叫只會記錄 `Mechanism2d` 當下的狀態，因此必須在每個迴圈週期更新物件後再次呼叫。

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::Mechanism2d mechanism{3, 3};

void Periodic() {
  wpi::telemetry::Log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import wpilib
import telemetry

mechanism = wpilib.Mechanism2d(3, 3)

def periodic():
    telemetry.log("MyMechanism", mechanism)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
你也可以使用 AdvantageKit 的 [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) 註解，在每個迴圈週期自動記錄機構狀態，而不需手動呼叫 `Logger.recordOutput`。
:::

</TabItem>
</Tabs>
