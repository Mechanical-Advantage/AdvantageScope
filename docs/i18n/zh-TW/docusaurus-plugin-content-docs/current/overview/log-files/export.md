# 匯出日誌資料 {#exporting-log-data}

AdvantageScope 包含一個彈性的系統，用於將日誌資料匯出為 CSV、WPILOG 或 MCAP 檔案。匯出功能在檢視日誌檔案或連線到即時資料來源時均可使用。可能的用途包括：

- 將 WPILOG 檔案轉換為 CSV 或 MCAP，以便在其他應用程式中進行分析。
- 基於 NetworkTables 資料匯出 WPILOG 檔案，以備日後存取。
- 儲存包含有限欄位數量（並移除重複值）的 WPILOG 以減少檔案大小。

要檢視匯出選項，請點擊 `檔案` > `匯出資料...`。

<img src="/img/overview/log-files/export-1.webp" alt="匯出選項" />

:::tip
除了此處描述的完整日誌匯出外，💬 [主控台](/tab-reference/console)分頁還允許將主控台資料匯出為文字檔案。
:::

:::warning
**為 SysId 匯出資料**

我們不建議使用此功能匯出**在模擬中產生**的日誌資料以在 [SysId](https://docs.wpilib.org/zh-cn/stable/docs/software/advanced-controls/system-identification/introduction.html) 中使用，因為 SysId 需要與 AdvantageScope 預設匯出選項不一致的額外時間戳記資料。請注意，**在模擬*之外*產生**的日誌資料可以匯出並在 SysId 中使用，且資料損失極小（不過透過直接在 SysId 中使用*原始*資料日誌可以獲得最大準確度）。

_此警告**不適用**於由 AdvantageKit 產生的日誌，透過選擇「AdvantageKit 週期」選項匯出這些日誌不會有任何資料損失。有關詳細資訊，請參閱[此頁面](https://docs.advantagekit.org/data-flow/sysid-compatibility)。_
:::

## 選項 {#options}

匯出時提供以下選項：

- **格式：** 設定匯出檔案的通用格式。請參閱下方選項。
  - _CSV (表格)：_ 逗號分隔值，其中每列代表一個不同的時間戳記，每欄代表一個欄位（加上一欄時間戳記數值）。每列可以代表多個欄位中的值。
  - _CSV (列表)：_ 逗號分隔值，其中每列代表單一欄位中的值，並帶有時間戳記、鍵名和數值的欄。
  - _WPILOG：_ 可以在 AdvantageScope 中再次開啟的標準 WPILOG 檔案。
  - _MCAP：_ 可以在 [Foxglove](https://foxglove.dev) 中開啟的標準 [MCAP](https://mcap.dev) 檔案。
- **時間戳記：** 僅適用於「CSV (表格)」。設定建立新列的方法。請參閱下方選項。
  - _所有變更：_ 僅在欄位值更新時建立新列/條目。大幅減少匯出的檔案大小。
  - _固定週期：_ 以固定時間間隔建立新列/條目，對於沒有時間戳記同步的日誌非常有用（當許多欄位以類似但不同的時間戳記進行記錄時）。請注意，包含所有值，無論取樣點之間是否有變更。
  - _AdvantageKit 週期：_ 為每個 AdvantageKit 同步迴圈週期建立一個新列/條目。請注意，包含所有值，無論迴圈週期之間是否有變更。
- **週期：** 僅在選擇「固定週期」時可用。設定每次取樣之間的毫秒週期。通常，這應該與機器人程式碼的迴圈週期相匹配。
- **前綴：** 如果留空，包含所有欄位。否則，僅包含與提供的前綴匹配的欄位（用逗號分隔）。請參閱下方範例。
  - 「_/DriverStation/Joystick0_」：包含以「/DriverStation/Joystick0」開頭的所有欄位（來自第一個搖桿的資料）。
  - 「_Flywheels,DS:enabled_」：包含以「/Flywheels」或「DS:enabled」開頭的所有欄位（來自飛輪的所有資料，加上機器人的已啟用狀態）。
  - 「_Drive/LeftPosition,Drive/RightPosition_」：僅包含欄位「/Drive/LeftPosition」與「/Drive/RightPosition」。
- **欄位集：** 請參閱下方選項。產生的欄位是由 AdvantageScope 建立以拆解複雜類型，並在側邊欄中以灰色文字顯示。這包括陣列、結構體 (struct) 和其他結構的單個組件。
  - _包含產生的：_ 匯出所有可檢視的欄位，其中包括產生的欄位。如果匯出的資料將在無法解析複雜類型的應用程式中開啟，建議使用此選項。
  - _僅限原始：_ 僅匯出原始日誌檔案中存在的欄位，不包括產生的欄位。如果匯出的資料將在 AdvantageScope 或另一個能夠解析複雜類型的應用程式中開啟，建議使用此選項。

從 AdvantageScope 匯出的範例 CSV 檔案如下所示，採用「CSV (表格)」格式且時間戳記設定為「所有變更」：

<img src="/img/overview/log-files/export-2.webp" alt="CSV 表格" />
