# 📂 日誌檔案 {#log-files}

## 支援的格式 {#supported-formats}

- **WPILOG (.wpilog)** - 由 WPILib 的[內建資料記錄](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html)與 AdvantageKit 產生。[URCL](/more-features/urcl) 可用於將來自 REV 馬達控制器的訊號擷取到 WPILOG 檔案中。
- **駕駛站日誌 (.dslog 與 .dsevents)** - 由 [FRC Driver Station](https://docs.wpilib.org/zh-cn/stable/docs/software/driverstation/driver-station.html) 產生。開啟任一日誌類型時，AdvantageScope 會自動搜尋對應的日誌檔案。
- **Hoot (.hoot)** - 由 CTRE 的 Phoenix 6 [訊號記錄器](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html)產生。
- **REVLOG (.revlog)** - 由 REV Robotics 的 [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) 產生。
- **Road Runner (.log)** - 由用於 FTC 的 [Road Runner](https://github.com/acmerobotics/road-runner) 函式庫產生。
- **CSV (.csv)** - 逗號分隔值，符合 AdvantageScope 在「CSV (表格)」或「CSV (列表)」模式下[匯出](/overview/log-files/export)的格式。有關詳細資訊，請參閱[此處](#csv-formatting)。
- **RLOG (.rlog)** - 舊版，由 AdvantageKit 2022 產生。

:::info
只有在同意 CTRE 的[最終使用者授權合約](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt)後才能開啟 Hoot 日誌檔案。首次開啟 Hoot 日誌檔案時，AdvantageScope 會顯示提示以確認同意這些條款。
:::

## 開啟日誌 {#opening-logs}

在選單列中，點擊 `檔案` > `開啟日誌...`，然後從本機磁碟選擇一個或多個日誌檔案。將日誌檔案從系統檔案瀏覽器拖曳到 AdvantageScope 圖示或視窗也會將其開啟。

:::info
如果同時開啟多個檔案，時間戳記將會自動對齊。這使得能夠輕鬆比較來自多個來源的日誌檔案。
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="開啟儲存的日誌" />

## 新增新日誌 {#adding-new-logs}

開啟日誌檔案後，可以輕鬆將額外的日誌新增到視覺化中。時間戳記將自動重新對齊以與現有資料同步。

在選單列中，點擊 `檔案` > `新增日誌...`，然後選擇一個或多個要新增到目前視覺化中的日誌檔案。來自每個日誌的欄位將記錄在名為 `Log0`、`Log1` 等表格中。

## 從機器人下載 {#downloading-from-the-robot}

<details>
<summary>設定</summary>

點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗。更新機器人位址與日誌資料夾。

<img src="/img/prefs.webp" alt="偏好設定圖解" />
</details>

點擊 `檔案` > `下載日誌...` 開啟下載視窗。連線到機器人後，可用的日誌會顯示在清單中，最新的位於頂部。選擇一個或多個要下載的日誌檔案（Shift + 點擊可選擇範圍，或 **Cmd/Ctrl + A** 全選）。然後點擊 ↓ 符號並選擇儲存位置。

:::info
CTRE 的[訊號記錄器](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html)使用將日誌分組在子資料夾中的非標準格式。在清單中選擇一個或多個資料夾以將日誌檔案作為一組下載。
:::

:::tip
下載多個檔案時，AdvantageScope 會跳過目的地資料夾中已存在的任何檔案。
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="下載日誌檔案" />

## CSV 格式化 {#csv-formatting}

CSV 欄位名稱必須是「Timestamp, Key, Value」或「Timestamp, (Key), (Key), etc」。時間戳記數值以秒為單位。下表顯示了常見數值類型的預期格式。請注意，將日誌資料作為 CSV 匯出與重新匯入是*有損的*，因為 CSV 不支援複雜欄位類型。

- **布林值：** `true` 或 `false`
- **字串：** `"(值)"`
  - 範例：`"Hello world"`
- **陣列：** `[(值); (值); (值)]`
  - 範例：`[1; 2; 3]`
- **位元組：** 十六進位，以 `-` 分隔
  - 範例：`4d-41-36-33-32-38`
