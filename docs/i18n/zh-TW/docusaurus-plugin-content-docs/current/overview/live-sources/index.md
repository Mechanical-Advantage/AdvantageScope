# 🛜 即時來源

AdvantageScope 中的所有視覺化除了支援日誌檔案外，還被設計為可以接收來自機器人或模擬器的即時資料。本節介紹如何連線到實時資料來源。AdvantageScope 支援以下即時資料來源：

- **NetworkTables：** 這是 WPILib 的主要網路協定。有關詳細資訊，請參閱 [WPILib 文件](https://docs.wpilib.org/zh-cn/stable/docs/software/networktables/index.html)。
- **NetworkTables (AdvantageKit)：** 此模式旨在配合執行 AdvantageKit 的機器人程式碼使用，AdvantageKit 會發布到 NetworkTables 中的 `AdvantageKit` 表格。
- **Systemcore 診斷：** 此模式連線到 Systemcore OS 使用的內建 NetworkTables 伺服器，其中包含機器人狀態與裝置 IO 等診斷資料。
- **Phoenix 診斷：** 此模式使用 HTTP 連線到 Phoenix [診斷伺服器](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html)，允許使用 [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/) 串流來自 CTRE CAN 裝置的資料。這類似於 Phoenix Tuner 中的[繪圖功能](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html)。有關詳細資訊，請參閱[此頁面](/overview/live-sources/phoenix-diagnostics)。
- **RLOG 伺服器：** AdvantageKit 支援此協定作為 NetworkTables 的替代方案。預設情況下在連接埠 5800 上發起連線。
- **FTC Dashboard：** 此模式整合了將資料發布到 [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard) 的 FTC 機器人。

:::info
當與 DS 應用程式在同一台裝置上執行時，AdvantageScope 可以連線到 FIRST Driver Station 以檢視診斷資料。無需進行任何設定（請參閱下方說明）。
:::

## 開始連線

要開始即時連線，請按照以下步驟操作：

- **機器人：** 點擊 `檔案` > `連線到機器人` > `預設` 或特定即時來源
- **模擬器：** 點擊 `檔案` > `連線到模擬器` > `預設` 或特定即時來源
- **駕駛站：** 點擊 `檔案` > `連線到駕駛站`

視窗標題會顯示 IP 位址與文字「搜尋中」，直到連線到目標。在斷開連線後，AdvantageScope 會嘗試使用相同設定自動重新連線。

## 檢視即時資料

當連線到即時來源時，AdvantageScope 預設會將所有分頁鎖定為目前時間。諸如 📉 [折線圖](/tab-reference/line-graph) 和 🔢 [表格](/tab-reference/table) 等視圖會自動滾動，而場地與搖桿等視圖則顯示每個欄位的目前值。點擊導覽列中的紅色箭頭按鈕可切換此鎖定狀態，進而允許檢視與重播過去的資料。

<img src="/img/overview/live-sources/open-live-1.png" alt="即時鎖定/解鎖按鈕" />

:::tip
在折線圖或時間軸中向左滾動會解鎖目前時間，滾動到最右側會再次鎖定到目前時間。
:::

## 設定

點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗。

<img src="/img/prefs.png" alt="偏好設定圖解" height="350" />

### 機器人位址

如 [WPILib 文件](https://docs.wpilib.org/zh-cn/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation) 中所述，使用 10.TE.AM.2 IP 位址輸入機器人位址。當透過 USB 或內建 Wi-Fi 無線基地台連線到 Systemcore 時，點擊 `檔案` > `使用 Systemcore USB 位址`/`使用 Systemcore Wi-Fi 位址` 以暫時使用正確的靜態 IP 位址。

### 即時模式

當使用 NetworkTables 作為即時來源時，可以選擇以下即時模式：

- **低頻寬 (預設)：** AdvantageScope 僅從伺服器請求正在積極使用的欄位資料。在選擇欄位之前發布的資料將無法使用。在網路頻寬有限的環境中執行，或正在發布大量欄位時，**強烈建議**使用此模式。
- **記錄：** 無論是否正在積極使用欄位，AdvantageScope 都會請求所有欄位的資料。這意味著可以透過暫停即時資料串流來追溯檢視欄位（見下文）。此模式通常在開發期間很有用，但**不應在頻寬有限時使用**。

### 捨棄即時資料

在即時連線期間，資料會儲存在本機以允許重播過去的資料（請參閱下方的「檢視即時資料」）。為避免非常高的記憶體使用量，預設情況下會在 20 分鐘後捨棄資料。可以選擇更短的時間段來減少記憶體使用量，或者選擇「永不」以無限期儲存即時資料。
