---
sidebar_position: 2
---

# Phoenix 診斷

AdvantageScope 支援來自 Phoenix 6 裝置訊號的即時串流，**無需在使用者程式碼中進行任何設定**。這允許使用熟悉介面與 AdvantageScope 的強大功能輕鬆對 Phoenix 裝置進行偵錯與微調：

- 彈性的視覺化選項，包括支援多軸與離散欄位
- 完全支援單位感知圖表繪製，包括隱式與一鍵式單位轉換 ([文件](/tab-reference/line-graph/units))
- 側邊欄中所有數值的即時預覽，以便輕鬆瀏覽
- 支援同時對來自多個裝置的訊號進行繪圖與預覽
- 將列舉 (enum) 值解碼為可讀字串（控制模式、橋接狀態、CANcoder 磁鐵狀態等）
- 整合式側邊欄工具提示，帶有每個訊號的說明與單位
- 訊號的階層式組織，按 CAN 匯流排、裝置與訊號類型分組
- 帶有內建積分與微分選項的進階資料分析 ([文件](/tab-reference/line-graph/#adjusting-axes))

:::tip
要連線，請在從選單列連線到機器人或模擬器時選擇「Phoenix 診斷」。
:::

<img src="/img/overview/live-sources/phoenix-1.png" alt="折線圖螢幕截圖" />

AdvantageScope 的 📊 [統計資料](/tab-reference/statistics)分頁還支援對 Phoenix 訊號進行進階分析，支援直方圖、自訂範圍以及用於相對與絕對誤差測量的衍生欄位：

<img src="/img/overview/live-sources/phoenix-2.png" alt="統計資料螢幕截圖" />

:::note
由於 Phoenix 更新，此功能偶爾可能會遇到問題。我們建議使用最新版本的 AdvantageScope 以減少問題。否則，請[建立 issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 以通知我們任何問題。
:::
