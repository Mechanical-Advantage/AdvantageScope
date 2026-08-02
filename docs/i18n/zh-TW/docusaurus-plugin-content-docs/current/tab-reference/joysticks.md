---
sidebar_position: 8
---

# 🎮 搖桿 {#joysticks}

搖桿分頁顯示多達六個已連線控制器的狀態。下圖顯示了一個範例佈局，包含兩個 Xbox 控制器和一個通用搖桿。每個按鈕在按下時都會高亮顯示，並顯示搖桿和其他軸的狀態。

<img src="/img/tab-reference/joysticks-1.png" alt="搖桿分頁概述" />

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與視覺化。點擊時間軸會選擇一個時間，按右鍵取消選擇。選取的時間在所有分頁中保持同步，從而可以輕鬆在其他視圖中快速找到此位置。

黃色區域表示機器人在自動階段，藍色區域表示機器人在遙控階段，灰色區域表示機器人在實用工具模式。

要縮放，請將游標置於時間軸上方並向上或向下滾動。也可以透過按住 `Shift` 的同時點擊並拖曳來選擇範圍。透過水平滾動（在受支援的裝置上）或透過在時間軸上點擊並拖曳來左右移動。當即時連線時，向左滾動會解鎖目前時間，滾動到最右側會再次鎖定到目前時間。按下 `Ctrl+\` 可縮放至機器人啟用的時間段。

<img src="/img/tab-reference/timeline.png" alt="時間軸" />

</details>

## 控制面板 {#control-pane}

在分頁底部的表格中選擇搖桿類型。搖桿 ID 範圍從 0 到 5，並與 Driver Station 和 WPILib 中的 ID 相匹配。有關搖桿的更多資訊可以在 [WPILib 文件](https://docs.wpilib.org/zh-cn/stable/docs/software/basic-programming/joystick.html)中找到。

AdvantageScope 包含一組常見的搖桿，包括以網格格式包含所有按鈕、軸與 POV 的「通用搖桿」（見上圖）。要新增自訂搖桿，請參閱[自訂資源](/more-features/custom-assets)。

:::warning
**使用原生 WPILib 的 NetworkTables 連線時，搖桿資料不可用。** 支援 WPILib 日誌檔案（[已啟用搖桿記錄](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html#logging-joystick-data)）、AdvantageKit 日誌以及 AdvantageKit 串流。
:::
