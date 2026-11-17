---
sidebar_position: 3
---

# 發布 NetworkTables 資料 {#publishing-networktables-data}

AdvantageScope 支援將儲存在日誌檔案中的 NetworkTables 資料發布回 NetworkTables 伺服器，例如模擬器或機器人。可能的用途包括：

- 在模擬中重播比賽來偵錯。
- 在真實機器人上模仿來自協同處理器 (coprocessor) 的資料。
- 使用真實比賽資料為駕駛員儀表板應用程式偵錯。

此功能需要包含完整 NetworkTables 資料的日誌檔案，可透過 WPILib 的[內建資料記錄器](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html)產生。請注意，AdvantageKit 不支援此功能，因為 AdvantageKit 改為在模擬中提供更完整的確定性重播。

## 開始使用 {#getting-started}

開始發布前，必須先開啟包含 NetworkTables 資料的日誌檔案，接著依以下步驟操作：

- **發布至機器人：** 點擊 `檔案` > `發布 NT 資料` > `連線到機器人`。
- **發布至模擬器：** 點擊 `檔案` > `發布 NT 資料` > `連線到模擬器`。

視窗頂端會顯示「搜尋中」或「發布中」以表示資料發布狀態。若連線中斷，AdvantageScope 會嘗試使用相同設定自動重新連線。

所有欄位都會以許多 AdvantageScope 分頁採用的*選取時間戳記*當時的值發布，讓你透過與 AdvantageScope 內部相同的重播機制即時在網路上重播（詳情請參閱[應用程式導覽](/overview/navigation)）。若未選取時間戳記，則會發布*游標懸停時間戳記*當時的值。

要停止發布，請點擊 `檔案` > `發布 NT 資料` > `停止發布`。

## 篩選欄位 {#filtering-fields}

預設情況下，AdvantageScope 會發布日誌檔案中的所有 NetworkTables 欄位（伺服器發布的中繼主題除外）。某些情境（例如模仿協同處理器）只需發布特定欄位或子表格。若要調整允許的欄位前綴，請點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗。

「NT 發布前綴」選項可設定要發布到 NetworkTables 的欄位前綴。若留空則會包含所有欄位；否則可輸入以逗號分隔的前綴或欄位清單，範例如下：

- 「_Telemetry_」：包含「Telemetry」表格中的所有欄位。
- 「_Telemetry/Drive_」：僅包含「Telemetry/Drive」表格。
- 「_limelight/tx,limelight/ty_」：僅包含「limelight/tx」與「limelight/ty」欄位。

## 限制 {#limitations}

:::warning

- 欄位每 20 毫秒發布一次，因此原本以更高頻率發布的 NetworkTables 資料將會跳過部分取樣。
- 發布取樣的時間戳記不會保留。在時間軸中來回拖曳或以不同倍速重播時，原本就不可能保留原始時間戳記。
  :::
