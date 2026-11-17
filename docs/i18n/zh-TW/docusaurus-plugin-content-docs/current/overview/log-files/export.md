# 匯出日誌資料 {#exporting-log-data}

AdvantageScope 提供彈性的匯出功能，可將日誌資料匯出為 CSV、WPILOG 或 MCAP 檔案。無論是檢視日誌檔案或連線至即時資料來源，都能使用此功能。常見用途包括：

- 將 WPILOG 檔案轉換為 CSV 或 MCAP，以便在其他應用程式中分析。
- 將 NetworkTables 資料匯出成 WPILOG 檔案，方便日後調閱。
- 只匯出部分欄位（並移除重複值）以縮小 WPILOG 檔案體積。

點擊 `檔案` > `匯出資料...` 即可檢視匯出選項。

<img src="/img/overview/log-files/export-1.webp" alt="匯出選項" />

_上圖所示為英文介面。_

:::tip
除了這裡介紹的完整日誌匯出功能，你也可以在 💬 [主控台](/tab-reference/console)分頁中將主控台資料匯出為文字檔。
:::

:::warning
**為 SysId 匯出資料**

我們不建議使用此功能匯出**在模擬中產生**的日誌資料來給 [SysId](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/introduction.html) 使用，因為 SysId 需要額外的時間戳記資料，與 AdvantageScope 預設的匯出選項不相容。**在模擬*之外*產生**的日誌資料則可匯出供 SysId 使用，且資料損失極小（不過若想獲得最高準確度，建議直接在 SysId 中使用*原始*日誌檔案）。

_此警告**不適用**於 AdvantageKit 產生的日誌，只要選擇「AdvantageKit 週期」選項即可無損匯出。詳情請參閱[此頁面](https://docs.advantagekit.org/data-flow/sysid-compatibility)。_
:::

## 選項 {#options}

匯出時提供以下選項：

- **格式：** 設定匯出檔案的格式，請參閱下方選項。
  - _CSV（表格）：_ 逗號分隔值檔案，每一列代表一個時間戳記，每一欄代表一個欄位（外加一欄時間戳記數值），每列可包含多個欄位的值。
  - _CSV（列表）：_ 逗號分隔值檔案，每一列代表單一欄位的一筆數值，包含時間戳記、鍵名與數值三欄。
  - _WPILOG：_ 標準 WPILOG 檔案，可重新在 AdvantageScope 中開啟。
  - _MCAP：_ 標準 [MCAP](https://mcap.dev) 檔案，可在 [Foxglove](https://foxglove.dev) 中開啟。
- **時間戳記：** 僅適用於「CSV（表格）」，用來設定建立新資料列的方式。請參閱下方選項。
  - _所有變更：_ 僅在欄位數值更新時建立新列／項目，可將匯出檔案縮到最小。
  - _固定週期：_ 以固定時間間隔建立新列／項目，適合未進行時間戳記同步的日誌（例如許多欄位以相近但不完全相同的時間戳記記錄時）。請注意，無論取樣點之間數值是否變更，都會包含所有數值。
  - _AdvantageKit 週期：_ 為每個 AdvantageKit 同步迴圈週期建立一筆新列／項目。請注意，無論週期之間數值是否變更，都會包含所有數值。
- **週期：** 僅在選擇「固定週期」時可用，用來設定每次取樣之間的毫秒間隔。通常應與機器人程式碼的迴圈週期一致。
- **前綴：** 若留空則匯出所有欄位；否則僅匯出符合指定前綴的欄位（以逗號分隔），範例如下：
  - 「_/DriverStation/Joystick0_」：包含所有以「/DriverStation/Joystick0」開頭的欄位（第一個搖桿的資料）。
  - 「_Flywheels,DS:enabled_」：包含所有以「/Flywheels」或「DS:enabled」開頭的欄位（飛輪的所有資料，以及機器人的啟用狀態）。
  - 「_Drive/LeftPosition,Drive/RightPosition_」：僅包含「/Drive/LeftPosition」與「/Drive/RightPosition」欄位。
- **欄位集：** 請參閱下方選項。產生的欄位是 AdvantageScope 為了拆解複雜類型而自動建立的欄位，在側邊欄中會以灰色文字顯示，包含陣列、結構體 (struct) 與其他資料結構的個別成員。
  - _包含產生的欄位：_ 匯出所有可檢視的欄位，包括自動產生的欄位。若匯出的資料要在無法解析複雜類型的應用程式中開啟，建議選擇此項。
  - _僅限原始欄位：_ 僅匯出原始日誌檔案中原本就存在的欄位，不包含自動產生的欄位。若匯出的資料要在 AdvantageScope 或其他支援複雜類型的應用程式中開啟，建議選擇此項。

以下為 AdvantageScope 匯出的 CSV 檔案範例，採用「CSV（表格）」格式，時間戳記設為「所有變更」：

<img src="/img/overview/log-files/export-2.webp" alt="CSV 表格" />
