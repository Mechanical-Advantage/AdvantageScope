---
sidebar_position: 5
---

# 💬 主控台 {#console}

「主控台」分頁專用於檢視包含主控台資料的單一字串欄位。以下列出幾種常見的建議欄位：

- **DS:/Dscomm/Console** - 由 FIRST Driver Station 自動儲存。
- **messages** - 由 WPILib 內建資料記錄功能儲存。
- **/RealOutputs/Console** - 在機器人運作期間由 AdvantageKit 自動儲存。
- **/ReplayOutputs/Console** - 在日誌重播期間由 AdvantageKit 自動儲存。

將需要的欄位拖曳到主檢視區即可開始。每一列代表欄位的一次更新：在 WPILib 日誌中，每儲存一行就會建立一列；在 AdvantageKit 日誌中，則是每個迴圈週期建立一列。

<img src="/img/tab-reference/console-1.webp" alt="主控台視圖" />

_上圖所示為英文介面。_

:::info
點擊調色盤圖示可切換警告與錯誤訊息的醒目提示。對於 WPILib 與 AdvantageKit 日誌，只要訊息包含「warning」或「error」文字，系統就會自動標示。
:::

操作方式與 🔢 [表格](../tab-reference/table)分頁類似，選取的時間點會在所有分頁間同步。點擊任一列即可選取，將游標懸停在某列上則可在其他可見的彈出視窗中預覽。點擊 ↓ 按鈕會跳至目前選取的時間點（或輸入框中指定的時間）。時間戳記與跳轉輸入的格式皆會依照[時間戳記](/more-features/timestamps)偏好設定顯示。

在「篩選」輸入框中輸入關鍵字，即可只顯示包含該文字的列；按下 `Ctrl+F` 可快速跳至「篩選」輸入框。若在篩選文字開頭加上「!」，則可從主檢視中*排除*符合條件的訊息。

## ANSI 格式化 {#ansi-formatting}

主控台渲染器支援使用標準 ANSI 跳脫序列進行格式化與色彩顯示：

- **文字樣式：** 粗體 (bold)、變暗 (dim)、斜體 (italic) 與底線 (underline)
- **前景與背景顏色：** 16 種標準顏色（標準與高亮度）
- **8 位元與 24 位元顏色：** 256 色調色盤與 24 位元 RGB
- **選擇性重設：** 可單獨重設特定樣式或顏色，同時保留其他設定

:::tip
點擊儲存圖示可將主控台資料匯出為純文字檔案。
:::
