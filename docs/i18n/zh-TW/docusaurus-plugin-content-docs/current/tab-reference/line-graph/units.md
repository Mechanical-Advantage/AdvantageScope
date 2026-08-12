# 單位支援 {#unit-support}

折線圖分頁具有單位感知功能，這表示數值可以輕鬆在相容的單位類型之間進行轉換。當單位資訊可用時，所有數值在顯示於軸或圖例時也會有精確的標籤。有關發布單位資訊的更多資訊，請參閱[此處](#supported-formats)。AdvantageScope 提供了幾種工具來快速在單位之間進行轉換：

- 在**同一軸上新增具有相容單位類型的欄位**時，AdvantageScope 會自動將兩個欄位轉換為相同的單位。這會反映在 Y 軸與圖例的標籤中。
- 點擊軸標題附近的三個點，以**快速切換至替代單位**。此清單包含與選取欄位相容的最常見單位。
- 啟用**積分或微分**（[文件](/tab-reference/line-graph/#integration-and-differentiation)）以查看精確的積分或導數單位。可以使用選單調整基礎單位以支援在非原生單位中進行篩選。

<img src="/img/tab-reference/line-graph/units-1.png" alt="單位感知圖表" />

## 支援的格式 {#supported-formats}

AdvantageScope 支援幾種方法來提供每個欄位的單位資訊。支援大多數常見單位；有關完整清單，請在設定[手動轉換](#manual-conversion)時查看快顯選單。

對於 (2) 和 (3)，單位類型使用字串進行解析。AdvantageScope 支援每種單位的多個名稱，包括常見縮寫（例如 `ft` 和 `feet` 都可以）。請注意，無論在 AdvantageScope 中選擇哪種語言，單位名稱必須使用 SI 符號或美式英語提供。如果單位名稱未按預期進行解析，請[建立一個 issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues)。

:::tip
不確定單位是否正確解析？請在將欄位新增至折線圖時，確認 Y 軸上是否顯示了單位類型。
:::

### 🥇 Struct 單位 {#struct-units}

AdvantageScope 自動使用常見結構化資料類型（如 `Rotation2d` 與 `Translation3d`）的原生單位。使用這些格式發布適用的數值**始終是發布資料的最佳方式**，並確保在視覺化幾何資料時的最大相容性。

### 🥈 欄位中繼資料 {#field-metadata}

WPILOG 與 NetworkTables 格式支援為每個欄位發布額外的「中繼資料」。AdvantageScope 會尋找名為「unit」或「units」的 JSON 欄位，其中包含單位類型的字串名稱（使用空格、駝峰式大小寫、帕斯卡大小寫或下底線格式）。要檢查每個欄位的中繼資料，請將游標懸停於側邊欄中的欄位名稱上。

:::tip
AdvantageKit 在記錄輸入與輸出（包括注釋記錄）時支援單位中繼資料。請在[此處](https://docs.advantagekit.org/data-flow/supported-types#units)查看文件了解詳細資訊。
:::

### 🥉 欄位命名 {#field-naming}

作為後備方案，AdvantageScope 會嘗試透過解析每個欄位的名稱來確定正確的單位類型。**單位類型必須作為後綴包含在內。** AdvantageScope 支援各種命名方案。下面列出了一些有效選項：

- **駝峰式/帕斯卡大小寫**，例如 `PositionMeters`、`velocityRadPerSec` 與 `TimestampS`
- **下底線格式**，例如 `position_meters`、`velocity_rad_per_sec` 與 `timestamp_s`
- **空格分隔符號**，例如 `position meters`、`velocity rad per sec` 與 `timestamp s`

使用下底線格式或空格分隔符號時，命名*不*區分大小寫。

:::tip
如果單位解析不正確，請點擊 `手動單位` > `停用自動單位` 以忽略單位資訊。然後可以使用手動轉換來切換至替代單位。
:::

## 手動轉換 {#manual-conversion}

當單位中繼資料不可用或不準確時，也可以手動設定軸以在單位之間進行轉換（或完全忽略單位中繼資料）。

要設定手動轉換，請點擊軸標題附近的三個點，然後點擊 `手動單位` > `編輯轉換...`。選擇單位類型、來源單位與目標單位。每個值還會乘以「額外係數」，允許進行自訂轉換（如齒輪比、角度轉線性轉換或 AdvantageScope 未提供的其他單位）。係數也可以使用數學運算式（如 `1.5*pi`）輸入。

:::tip
要快速啟用或停用單位轉換，請點擊軸標題附近的三個點，然後選擇 `最近的預設值` 或 `重設單位`。
:::

<img src="/img/tab-reference/line-graph/units-2.png" alt="編輯單位轉換" />
