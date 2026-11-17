# 📂 日誌檔案 {#log-files}

## 支援的格式 {#supported-formats}

- **WPILOG (.wpilog)** - 由 WPILib 的[內建資料記錄](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html)與 AdvantageKit 產生。也可搭配 [URCL](/more-features/urcl) 將 REV 馬達控制器的訊號記錄到 WPILOG 檔案中。
- **Hoot (.hoot)** - 由 CTRE 的 Phoenix 6 [訊號記錄器](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html)產生。
- **REVLOG (.revlog)** - 由 REV Robotics 的 [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) 產生。
- **Road Runner (.log)** - 由用於 FTC 的 [Road Runner](https://github.com/acmerobotics/road-runner) 函式庫產生。
- **CSV (.csv)** - 逗號分隔值，符合 AdvantageScope 在「CSV (表格)」或「CSV (列表)」模式下[匯出](/overview/log-files/export)的格式。詳細資訊請參閱[此處](#csv-formatting)。
- **NI 駕駛站日誌 (.dslog 與 .dsevents)** - 舊版格式，由 NI 的 [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) (2010-2026) 產生。開啟任一種日誌時，AdvantageScope 會自動搜尋並配對另一份檔案。
- **RLOG (.rlog)** - 舊版格式，由 AdvantageKit 2022 產生。

:::info
必須先同意 CTRE 的[最終使用者授權合約](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt)才能開啟 Hoot 日誌檔案。首次開啟 Hoot 日誌檔案時，AdvantageScope 會跳出提示視窗讓你確認同意條款。
:::

## 開啟日誌 {#opening-logs}

在選單列中點擊 `檔案` > `開啟日誌...`，然後從本機磁碟選擇一個或多個日誌檔案。你也可以直接將日誌檔案從系統檔案瀏覽器拖曳到 AdvantageScope 圖示或視窗中開啟。

:::info
若同時開啟多個檔案，時間戳記會自動對齊，方便你比較來自不同來源的日誌檔案。時間戳記顯示選項的詳細說明請參閱[時間戳記](/more-features/timestamps)頁面。
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="開啟儲存的日誌" />

_上圖所示為英文介面。_

## 新增新日誌 {#adding-new-logs}

開啟日誌檔案後，你還可以輕鬆加入其他日誌一起檢視，系統會自動重新對齊時間戳記以與現有資料同步。

在選單列中點擊 `檔案` > `新增日誌...`，然後選擇一個或多個要加入目前視覺化中的日誌檔案。每個日誌的欄位會分別收錄在名為 `Log0`、`Log1` 等表格中。

## 從機器人下載 {#downloading-from-the-robot}

<details>
<summary>設定</summary>

點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗。更新機器人位址與日誌資料夾。

<img src="/img/prefs_zh-TW.webp" alt="偏好設定圖解" height="450" />
</details>

點擊 `檔案` > `下載日誌...` 開啟下載視窗，Systemcore 與 roboRIO 皆支援此功能。連線到機器人後，可用的日誌會顯示在清單中，最新的排在最上方。選擇一個或多個要下載的日誌檔案或資料夾（按住 Shift 點擊可選取範圍，或按 **Cmd/Ctrl + A** 全選），接著點擊 ↓ 符號並選擇儲存位置。

:::tip
下載多個檔案時，AdvantageScope 會跳過目的地資料夾中已存在的任何檔案。
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="下載日誌檔案" height="350" />

_上圖所示為英文介面。_

## CSV 格式化 {#csv-formatting}

CSV 欄位名稱必須為「Timestamp, Key, Value」或「Timestamp, (Key), (Key), etc」，時間戳記的單位為秒。下方列出常見數值類型的格式規範。請注意，將日誌匯出為 CSV 再重新匯入屬於*有損*轉換，因為 CSV 不支援複雜的欄位類型。

- **布林值：** `true` 或 `false`
- **字串：** `"(值)"`
  - 範例：`"Hello world"`
- **陣列：** `[(值); (值); (值)]`
  - 範例：`[1; 2; 3]`
- **位元組：** 十六進位，以 `-` 分隔
  - 範例：`4d-41-36-33-32-38`
