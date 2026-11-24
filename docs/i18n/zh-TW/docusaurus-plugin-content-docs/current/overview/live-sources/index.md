# 🛜 即時來源 {#live-sources}

除了日誌檔案之外，AdvantageScope 的所有視覺化工具也能接收來自機器人或模擬器的即時資料。本節將說明如何連線至即時資料來源。AdvantageScope 支援以下即時資料來源：

- **NetworkTables：** 這是 WPILib 的主要網路協定。詳細資訊請參閱 [WPILib 文件](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html)。
- **NetworkTables (AdvantageKit)：** 此模式專為執行 AdvantageKit 的機器人程式碼設計，AdvantageKit 會將資料發布到 NetworkTables 的 `AdvantageKit` 表格中。
- **Systemcore 診斷：** 此模式連線到 Systemcore OS 使用的內建 NetworkTables 伺服器，其中包含機器人狀態與裝置 IO 等診斷資料。
- **Phoenix 診斷：** 此模式透過 HTTP 連線到 Phoenix [診斷伺服器](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html)，以使用 [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/) 串流來自 CTRE CAN 裝置的資料。這類似於 Phoenix Tuner 中的[繪圖功能](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html)。詳細資訊請參閱[此頁面](/overview/live-sources/phoenix-diagnostics)。
- **RLOG 伺服器：** AdvantageKit 支援此協定作為 NetworkTables 的替代方案，預設透過連接埠 5800 建立連線。
- **FTC Dashboard：** 此模式適用於將資料發布至 [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard) 的 FTC 機器人。

:::info
當 AdvantageScope 與 DS 應用程式在同一台裝置上執行時，可直接連線到 FIRST 駕駛站檢視診斷資料，無需任何設定（請參閱下方說明）。
:::

## 開始連線 {#starting-the-connection}

請按照以下步驟開始即時連線：

- **機器人：** 點擊 `檔案` > `連線到機器人` > `預設` 或特定即時來源
- **模擬器：** 點擊 `檔案` > `連線到模擬器` > `預設` 或特定即時來源
- **駕駛站：** 點擊 `檔案` > `連線到駕駛站`

在連線到目標之前，視窗標題會顯示 IP 位址與「搜尋中」字樣。若連線中斷，AdvantageScope 會嘗試以相同設定自動重新連線。

## 檢視即時資料 {#viewing-live-data}

連線到即時來源時，AdvantageScope 預設會將所有分頁鎖定在目前時間。📉 [折線圖](/tab-reference/line-graph) 與 🔢 [表格](/tab-reference/table) 等檢視會自動捲動，而場地與搖桿等檢視則會顯示各欄位的即時數值。點擊導覽列上的紅色箭頭按鈕即可切換鎖定狀態，方便你檢視與重播過去的資料。

<img src="/img/overview/live-sources/open-live-1.webp" alt="即時鎖定/解鎖按鈕" />

:::tip
在折線圖或時間軸中向左捲動會解除鎖定目前時間，捲動到最右側則會再次鎖定。
:::

## 設定 {#configuration}

點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗。

<img src="/img/prefs_zh-TW.webp" alt="偏好設定圖解" height="450" />

### 機器人位址 {#robot-address}

如 [WPILib 文件](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation)所述，輸入機器人的主機名稱（例如 `robot.local`）或 IP 位址（例如 `10.TE.AM.2`）。透過 USB 或內建 Wi-Fi 無線基地台連線至 Systemcore 時，可點擊 `檔案` > `使用 Systemcore USB 位址`／`使用 Systemcore Wi-Fi 位址`，暫時套用正確的靜態 IP 位址。

### 即時模式 {#live-mode}

使用 NetworkTables 作為即時來源時，可選擇以下即時模式：

- **低頻寬（預設）：** AdvantageScope 只會向伺服器請求目前有在使用的欄位資料，在選擇欄位前發布的資料將無法取得。在網路頻寬受限的環境中，或當機器人發布大量欄位時，**強烈建議**使用此模式。
- **記錄：** 無論欄位是否正在使用，AdvantageScope 都會請求所有欄位的資料。這樣一來，你只要暫停即時資料串流（見上方說明），就能回頭檢視先前未選取的欄位。此模式在開發期間相當實用，但**在頻寬有限時請勿使用**。

### 捨棄即時資料 {#discard-live-data}

在即時連線期間，資料會儲存在本機，以便重播過去的資料（請參閱上方的「檢視即時資料」）。為避免記憶體用量過高，系統預設會在 20 分鐘後捨棄舊資料。你可以選擇較短的保留時間來節省記憶體，或選擇「永不」以持續保留所有即時資料。
