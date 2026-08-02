---
sidebar_position: 3
---

# 發布 NetworkTables 資料 {#publishing-networktables-data}

AdvantageScope 支援將儲存在日誌檔案中的 NetworkTables 資料發布回 NetworkTables 伺服器，例如模擬器或機器人。可能的用途包括：

- 在模擬中重播比賽以進行偵錯。
- 在真實機器人上模仿來自協同處理器 (coprocessor) 的資料。
- 使用真實比賽資料對駕駛員儀表板應用程式進行偵錯。

此功能需要包含 NetworkTables 資料完整擷取的日誌檔案，可以使用 WPILib 的[內建資料記錄器](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html)來產生。請注意，AdvantageKit 不支援此功能，因為它在模擬中啟用了更完整的確定性重播。

## 開始使用 {#getting-started}

要開始發布，必須先開啟包含 NetworkTables 資料的日誌檔案。然後按照以下步驟操作：

- **發布至機器人：** 點擊 `檔案` > `發布 NT 資料` > `連線到機器人`。
- **發布至模擬器：** 點擊 `檔案` > `發布 NT 資料` > `連線到模擬器`。

視窗頂部會顯示文字「搜尋中」或「發布中」以指示資料發布狀態。在斷開連線後，AdvantageScope 會嘗試使用相同設定自動重新連線。

所有欄位都將使用許多 AdvantageScope 分頁所使用的*選取時間戳記*下的儲存值進行發布。這允許透過與 AdvantageScope 內部重播相同的機制進行實時網路重播。有關詳細資訊，請參閱[應用程式導覽](/overview/navigation)。如果未選取時間戳記，則欄位會使用*游標懸停時間戳記*下的儲存值進行發布。

要停止發布，請點擊 `檔案` > `發布 NT 資料` > `停止發布`。

## 篩選欄位 {#filtering-fields}

預設情況下，AdvantageScope 會發布儲存在日誌檔案中的所有 NetworkTables 欄位（伺服器發布的中繼主題除外）。某些用途（例如模仿協同處理器）僅需要發布有限的欄位或子表格集。要調整允許的欄位前綴集，請點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗。

「NT 發布前綴」選項設定發布到 NetworkTables 的欄位之允許前綴。如果留空，將包含所有欄位。否則，可以提供以逗號分隔的前綴或欄位清單。請參閱下方範例。

- 「_SmartDashboard_」：包含「SmartDashboard」表格中的所有欄位。
- 「_SmartDashboard/Auto Selector_」：僅包含「SmartDashboard/Auto Selector」表格。
- 「_limelight/tx,limelight/ty_」：僅包含「limelight/tx」與「limelight/ty」欄位。

## 限制 {#limitations}

:::warning

- 欄位每 20 毫秒發布一次，因此原本以更高頻率發布的 NetworkTables 資料將會跳過取樣。
- 發布取樣的時間戳記不會保留。當在時間軸中前後滾動或以不同速度重播時，保留原始時間戳記是不可能的。
  :::
