# 單位支援 {#unit-support}

折線圖分頁具備單位感知功能，可輕鬆在相容的單位之間進行轉換。只要欄位包含單位資訊，座標軸與圖例上的所有數值都會標示正確的單位。關於如何發布單位資訊，請參閱[支援的格式](#supported-formats)。AdvantageScope 也提供多項工具讓你快速轉換單位：

- 將**單位相容的欄位加入同一座標軸**時，AdvantageScope 會自動將兩個欄位轉換為相同單位，並同步更新 Y 軸與圖例的標示。
- 點擊軸標題旁的三個點，即可**快速切換為其他相容單位**。選單中會列出與所選欄位最常搭配的相容單位。
- 啟用**積分或微分**（[說明文件](/tab-reference/line-graph/#integration-and-differentiation)）即可查看對應的積分或導數單位。你也可以透過選單調整基礎單位，以非原生單位進行計算與篩選。

<img src="/img/tab-reference/line-graph/units-1.webp" alt="單位感知圖表" />

_上圖所示為英文介面。_

## 支援的格式 {#supported-formats}

AdvantageScope 支援多種為欄位提供單位資訊的方式，涵蓋大多數常見單位；完整清單可在設定[手動轉換](#manual-conversion)時於彈出選單中查看。

在方法 (2) 與 (3) 中，單位類型是以字串解析的。AdvantageScope 支援同一單位的多種寫法，包括常見縮寫（例如 `ft` 與 `feet` 皆可）以及美式和英式英語拼法（例如 `meters` 與 `metres`）。請注意，無論 AdvantageScope 介面選擇哪種語言，單位名稱都必須使用 SI 符號或英文提供。如果某個單位名稱無法正確解析，歡迎在 GitHub 上[建立 issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues)。

:::tip
不確定單位是否解析成功？將欄位加入折線圖後，看看 Y 軸上是否顯示了對應的單位類型即可確認。
:::

### 🥇 Struct 單位 {#struct-units}

對於 `Rotation2d` 和 `Translation3d` 等常見的結構化資料類型，AdvantageScope 會自動採用其原生單位。使用這類格式發布資料**始終是最佳做法**，能確保幾何資料在視覺化時具備最佳的相容性。

### 🥈 欄位中繼資料 {#field-metadata}

WPILOG 與 NetworkTables 格式皆支援為每個欄位發布額外的「中繼資料」。AdvantageScope 會讀取名為「unit」或「units」的 JSON 欄位，並解析其中的單位名稱字串（支援空格、駝峰式大小寫、帕斯卡大小寫或蛇形命名）。將游標懸停在側邊欄的欄位名稱上，即可查看該欄位的中繼資料。

:::tip
在 WPILib 中，使用 `Telemetry.log()` 記錄 `Measure` 物件時會自動附加單位中繼資料，也可以使用 `Telemetry.setProperty("fieldName", "unit", "\"volts\"")` 明確設定。

AdvantageKit 在記錄輸入與輸出時同樣支援單位中繼資料（詳情請見[此處](https://docs.advantagekit.org/data-flow/supported-types#units)）。
:::

### 🥉 欄位命名 {#field-naming}

作為備用方案，AdvantageScope 會嘗試從欄位名稱解析出正確的單位類型，**單位名稱必須放在欄位名稱的結尾作為後綴**。AdvantageScope 支援以下幾種命名方式：

- **駝峰式／帕斯卡大小寫**，例如 `PositionMeters`、`velocityRadPerSec` 與 `TimestampS`
- **底線分隔（蛇形命名）**，例如 `position_meters`、`velocity_rad_per_sec` 與 `timestamp_s`
- **空格分隔**，例如 `position meters`、`velocity rad per sec` 與 `timestamp s`

使用底線分隔或空格分隔時，命名*不*區分大小寫。

:::tip
如果單位解析不正確，請點擊 `手動單位` > `停用自動單位` 以忽略單位資訊，接著就能使用手動轉換切換為其他單位。
:::

## 手動轉換 {#manual-conversion}

當單位中繼資料缺失或不準確時，你可以手動設定座標軸來轉換單位（或完全忽略單位中繼資料）。

點擊軸標題旁的三個點，選擇 `手動單位` > `編輯轉換...`，接著依序選擇單位類型、來源單位與目標單位。每個數值還會乘上「額外縮放係數」，可用於自訂轉換（例如齒輪比、角速度轉線速度，或 AdvantageScope 未內建的單位）；係數欄位也支援輸入數學運算式，例如 `1.5*pi`。

:::tip
若要快速啟用或停用單位轉換，請點擊軸標題旁的三個點，再選擇 `最近的預設` 或 `重設單位`。
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="編輯單位轉換" height="250" />

_上圖所示為英文介面。_
