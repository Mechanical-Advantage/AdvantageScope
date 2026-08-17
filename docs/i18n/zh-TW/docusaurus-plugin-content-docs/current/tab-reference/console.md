---
sidebar_position: 5
---

# 💬 主控台 {#console}

主控台視圖旨在檢視帶有主控台資料的單一字串欄位。下面列出了某些建議的欄位。

- **DS:/Dscomm/Console** - 由 FIRST Driver Station 儲存。
- **messages** - 由 WPILib 的內建記錄基於對 [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>) 方法的呼叫而儲存。
- **/RealOutputs/Console** - 在機器人運作期間由 AdvantageKit 自動儲存（如往常一樣使用 `System.out.println`）。
- **/ReplayOutputs/Console** - 在日誌重播期間由 AdvantageKit 自動儲存（如往常一樣使用 `System.out.println`）。

將所需的欄位拖曳到檢視器面板即可開始。每列代表欄位的一次更新。對於 WPILib 日誌，會為每個儲存的行建立一個新列。對於 AdvantageKit 日誌，會為每個迴圈週期建立一個新列。

<img src="/img/tab-reference/console-1.webp" alt="主控台視圖" />

_上圖所示為英文介面。_

:::info
點擊調色盤圖示可切換警告與錯誤訊息的高亮顯示。對於 WPILib 與 AdvantageKit 日誌，如果訊息包含文字「warning」或「error」，則會被高亮顯示。
:::

控制項類似於 🔢 [表格](../tab-reference/table)分頁。選取的時間在所有分頁中保持同步。點擊某一列可選取它，或將游標懸停在某一列上可在任何可見的快顯視窗中預覽它。點擊 ↓ 按鈕會跳至選取的時間（或在方塊中輸入的時間）。時間戳記與跳轉輸入會根據 [時間戳記](/more-features/timestamps) 偏好設定進行格式化。

在「篩選」輸入方塊中輸入文字，以僅顯示包含篩選文字的列。按下 `Ctrl+F` 可快速選擇「篩選」輸入方塊。在篩選文字開頭新增「!」可從主視圖中*排除*匹配的訊息。

## ANSI 格式化 {#ansi-formatting}

主控台渲染器支援使用標準 ANSI 跳脫序列進行格式化與色彩編碼：

- **文字樣式：** 粗體 (bold)、變暗 (dim)、斜體 (italic) 與底線 (underline)
- **前景與背景顏色：** 16 種標準顏色 (標準與高亮度)
- **8 位元與 24 位元顏色：** 256 色查詢調色盤與 24 位元 RGB
- **選擇性重設：** 重設特定樣式或顏色，同時保留其他樣式

:::tip
點擊儲存圖示可將主控台資料匯出為文字檔案。
:::
