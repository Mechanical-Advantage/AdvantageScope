---
sidebar_position: 1
---

# ✴️ FTC 相容性 {#ftc-compatibility}

AdvantageScope 提供多項功能，讓你在現有的 FIRST Tech Challenge 控制系統上也能享有流暢的使用體驗，同時為未來過渡到 [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) 做好準備。自 2027-2028 賽季起正式轉用 Systemcore 後，AdvantageScope 的所有功能都將在 FTC 中獲得官方支援。

## 場地與機器人 {#fields-and-robots}

完整原生支援 FTC 場地與機器人模型。

- **場地和機器人模型：** 在 🗺️ [2D 場地](/tab-reference/2d-field) 和 👀 [3D 場地](/tab-reference/3d-field) 分頁中，你可以直接從下拉式選單選擇 FTC 場地與機器人模型。所有場地皆相容於 [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr)。
- **座標系：** 你可以將任何場地的[座標系](/more-features/coordinate-systems)設定為相容於[標準 FTC 座標](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)。FTC 場地預設就會採用此座標系。

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## 支援的格式 {#supported-formats}

除了 WPILOG 與 NetworkTables 等 WPILib 相容格式之外，AdvantageScope 還原生支援 **FTC Dashboard** 即時串流格式以及 **Road Runner** `.log` 檔案。

多款第三方 FTC 日誌記錄與遙測函式庫都能輸出與 AdvantageScope 相容的資料格式。AdvantageScope 開發團隊並不背書或推薦任何特定的 FTC 日誌方案，且部分方案可能會遇到功能受限的情況。

以下清單提供幾個常見選項作為參考（並非完整列表）：

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/)：產生用於除錯路徑規劃邏輯的日誌檔案。
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/)：串流與其自帶儀表板以及 AdvantageScope 均相容的即時遙測資料。
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver)：支援將自訂資料記錄為多種格式，包含日誌檔案與即時串流。
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log)：使用註解將資料儲存為 WPILOG 格式。
- **PsiKit**：受 AdvantageKit 啟發的 FTC 日誌記錄與重播 (replay) 框架。

:::warning
各隊伍在比賽期間必須確保遵守 R704 規則。比賽中禁止透過 Wi-Fi 連接第三方遙測服務（例如 FTC Dashboard）。
:::

### 適用於 FTC 的 AdvantageScope Lite {#advantagescope-lite-for-ftc}

社群也提供了一個專為 FTC 最佳化的 [AdvantageScope Lite](/more-features/advantagescope-lite) 非官方版本：[**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC)。此為非官方發行版，AdvantageScope 開發團隊不提供支援。

標準版 [AdvantageScope Lite](/more-features/advantagescope-lite) 是專為 Systemcore 與 FIRST Driver Station 設計的網頁應用程式，而非官方 FTC 版本則經過特別修改，可直接運行於現有的 FTC 控制系統上。它原生支援透過 FTC Dashboard 協定檢視即時資料，不需要額外安裝軟體。
