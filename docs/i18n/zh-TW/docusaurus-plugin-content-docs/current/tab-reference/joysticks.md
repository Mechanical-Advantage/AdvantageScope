---
sidebar_position: 8
---

# 🎮 搖桿 {#joysticks}

「搖桿」分頁最多可同時顯示六個已連線控制器的狀態。下圖為一個範例配置，包含兩支 Xbox 控制器與一個通用搖桿。每個按鈕在按下時都會亮起提示，同時也會顯示搖桿與其他軸的即時狀態。

<img src="/img/tab-reference/joysticks-1.webp" alt="搖桿分頁概述" />

_上圖所示為英文介面。_

<details>
<summary>時間軸控制項</summary>

時間軸用於控制播放與資料視覺化。點擊時間軸即可選取時間點，按右鍵則可取消選取。選取的時間點會在所有分頁間同步，方便你快速在其他檢視中定位。

黃色區段代表機器人處於自動階段，藍色區段代表遙控階段，灰色區段則代表測試模式。

若要縮放，請將游標移至時間軸上方並向上或向下捲動。你也可以按住 `Shift` 並點擊拖曳來選取範圍。若要左右移動，可在支援的裝置上水平捲動，或直接在時間軸上點擊拖曳。即時連線時，向左捲動會解除鎖定目前時間，捲動至最右側則會重新鎖定目前時間。按下 `Ctrl+\` 可快速縮放至機器人啟用的區段。

<img src="/img/tab-reference/timeline.webp" alt="時間軸" />

</details>

## 控制面板 {#control-pane}

在分頁底部的表格中選擇各個搖桿的類型。搖桿 ID 範圍為 0 到 5，與 Driver Station 及 WPILib 中的 ID 一致。更多關於搖桿的說明，請參閱 [WPILib 文件](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html)。

AdvantageScope 內建多款常見搖桿，其中包括將所有按鈕、軸與 POV（視角）以格狀呈現的「通用搖桿」（如上圖所示）。若要新增自訂搖桿，請參閱[自訂資源](/more-features/custom-assets)。

:::warning
**透過原生 WPILib 的 NetworkTables 連線時，無法取得搖桿資料。** 目前僅支援 WPILib 日誌檔案（需[啟用搖桿記錄](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)）、AdvantageKit 日誌以及 AdvantageKit 串流。
:::
