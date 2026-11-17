---
sidebar_position: 5
---

# ⏱️ 時間戳記 {#timestamps}

AdvantageScope 讓你在所有畫面中自訂時間戳記的顯示方式，包含時間軸、📉 [折線圖](/tab-reference/line-graph)、🔢 [表格](/tab-reference/table)與 💬 [主控台](/tab-reference/console)。

## 顯示模式 {#display-modes}

你可以在偏好設定視窗中選擇時間戳記的顯示模式：

- **從零開始 (預設)：** 將所有時間戳記平移，使日誌中最早的資料從零 (`+0.0s`) 開始計算。此模式下時間戳記會加上 `+` 前綴，代表自資料起始點經過的時間。
- **原始時間：** 直接顯示日誌檔案中所記錄的原始時間戳記數值，與機器人程式碼實際使用的數值完全一致。

:::info
從 WPILib 2027 開始，Systemcore 與模擬環境皆改用裝置開機後經過的時間作為時間戳記。由於原始時間戳記可能是從一個相當大的任意數字開始，我們提供了 **從零開始** 這個更直觀的顯示選項。
:::

## 多日誌同步 {#multi-log-synchronization}

當[同時開啟多個日誌檔案](/overview/log-files/#opening-logs)時，AdvantageScope 會自動同步並對齊各檔案的時間戳記。在 **從零開始** 模式下，系統會將所有已載入檔案中最早的時間戳記設為零點；在 **原始時間** 模式下，則會以第一個開啟的日誌作為時間基準，並將其他日誌平移對齊。

## 自訂 {#customization}

若要更改時間戳記的顯示模式，請點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS)，或按下 `Ctrl+,` / `Cmd+,` 開啟偏好設定視窗，接著將 **時間戳記** 調整為想要的選項。

<img src="/img/prefs_zh-TW.webp" alt="偏好設定圖表" height="450" />
