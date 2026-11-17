---
sidebar_position: 2
---

# Phoenix 診斷 {#phoenix-diagnostics}

AdvantageScope 支援來自 Phoenix 6 裝置訊號的即時串流，**無需在使用者程式碼中進行任何設定**，讓你透過熟悉的介面與 AdvantageScope 強大的分析工具，輕鬆對 Phoenix 裝置進行偵錯與微調：

- 彈性的視覺化選項，支援表格與統計分析
- 完整支援單位感知圖表，包含自動轉換與一鍵單位轉換 ([文件](/tab-reference/line-graph/units))
- 將列舉 (enum) 值解碼為可讀字串（控制模式、橋接狀態、CANcoder 磁鐵狀態等）
- 整合側邊欄工具提示，顯示每個訊號的說明與單位
- 階層式訊號整理，依 CAN 匯流排、裝置與訊號類型分組
- 內建積分與微分選項的進階資料分析 ([文件](/tab-reference/line-graph/#adjusting-axes))

:::tip
在選單列連線至機器人或模擬器時，選擇「Phoenix 診斷」即可連線。
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="折線圖螢幕截圖" />

AdvantageScope 的 📊 [統計資料](/tab-reference/statistics)分頁也能對 Phoenix 訊號進行進階分析，支援直方圖、自訂範圍，以及用於計算相對與絕對誤差的衍生欄位：

<img src="/img/overview/live-sources/phoenix-2.webp" alt="統計資料螢幕截圖" />

_上圖所示為英文介面。_

:::note
由於 Phoenix 更新，此功能偶爾可能會出現相容性問題。建議使用最新版本的 AdvantageScope 以減少問題；若仍遇到異常，請[建立 issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 告訴我們。
:::
