---
sidebar_position: 5
---

# ⏱️ 時間戳記 {#timestamps}

AdvantageScope 支援在所有檢視中自訂時間戳記的顯示選項，包括時間軸、📉 [折線圖](/tab-reference/line-graph)、🔢 [表格](/tab-reference/table) 和 💬 [主控台](/tab-reference/console)。

## 顯示模式 {#display-modes}

時間戳記顯示模式可以在偏好設定視窗中設定：

- **從零開始 (預設)：** 偏移所有時間戳記，使日誌中最早的資料從零開始 (`+0.0s`)。在此模式下顯示的時間戳記帶有 `+` 前綴，表示自資料開始以來經過的時間。
- **原始時間：** 使用日誌檔案中記錄的原始數值顯示時間戳記，與機器人程式碼使用的精確值一致。

:::info
從 WPILib 2027 開始，Systemcore 和模擬中均使用自裝置開機 (boot) 以來的時間來測量時間戳記。由於原始時間戳記可能會從任意大數開始，因此提供了 **從零開始** 作為更直觀的檢視選項。
:::

## 多日誌同步 {#multi-log-synchronization}

當 [同時開啟多個日誌檔案](/overview/log-files/#opening-logs) 時，AdvantageScope 會同步並對齊它們的時間戳記。在 **從零開始** 模式下，零點設定為所有已載入檔案中最早的時間戳記。在 **原始時間** 模式下，時間戳記使用第一個開啟的日誌的時間基準顯示，任何其他日誌都會進行偏移以與其對齊。

## 自訂 {#customization}

要變更時間戳記顯示模式，請透過點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS)，或按下 `Ctrl+,` / `Cmd+,` 開啟偏好設定視窗。將 **時間戳記** 設定更新為所需選項。

<img src="/img/prefs_zh-TW.webp" alt="偏好設定圖表" height="450" />
