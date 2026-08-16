---
sidebar_position: 1
---

# ✴️ FTC 相容性 {#ftc-compatibility}

AdvantageScope 包含多項功能，可在現有的 FIRST Tech Challenge 控制系統上提供流暢的體驗，同時為在未來賽季過渡到 [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) 做好準備。從 2027-2028 賽季開始過渡到 Systemcore 後，AdvantageScope 的所有功能都將在 FTC 中獲得官方支援。

## 場地與機器人 {#fields-and-robots}

FTC 場地和機器人模型原生完全支援。

- **場地和機器人模型：** 在 🗺️ [2D 場地](/tab-reference/2d-field) 和 👀 [3D 場地](/tab-reference/3d-field) 分頁中直接從下拉選單中選擇 FTC 場地和機器人模型。所有場地均與 [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) 相容。
- **座標系：** 設定[座標系](/more-features/coordinate-systems)以在任何場地上與[標準 FTC 座標](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)相容。此座標系在 FTC 場地上預設使用。

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## 支援的格式 {#supported-formats}

除了 WPILOG 與 NetworkTables 等 WPILib 相容格式之外，AdvantageScope 還原生支援 **FTC Dashboard** 即時串流格式以及 **Road Runner** `.log` 檔案。

數個第三方 FTC 日誌記錄與遙測函式庫可以輸出與 AdvantageScope 相容格式的資料。AdvantageScope 開發人員不特別背書或推薦任何特定的 FTC 日誌解決方案；在使用某些日誌解決方案時，你可能會遇到功能受限的情況。

下面的清單提供了一個起點，但並非詳盡無遺：

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/)：產生用於除錯路徑規劃邏輯的日誌檔案。
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/)：串流與其自帶儀表板以及 AdvantageScope 均相容的即時遙測資料。
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver)：允許將自訂資料記錄為多種格式，包括日誌檔案與即時串流。
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log)：使用註解將資料儲存為 WPILOG 格式。
- **PsiKit**：受 AdvantageKit 啟發的 FTC 日誌記錄與重播 (replay) 框架。

:::warning
各隊伍在比賽期間必須確保遵守 R704 規則。比賽中禁止透過 Wi-Fi 連接第三方遙測服務（例如 FTC Dashboard）。
:::

### 適用於 FTC 的 AdvantageScope Lite {#advantagescope-lite-for-ftc}

提供了一個針對 FTC 進行最佳化的 AdvantageScope Lite 非官方版本：[**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC)。該版本是非官方的，不受 AdvantageScope 開發人員的支援。

標準的 [AdvantageScope Lite](/more-features/advantagescope-lite) 是專為在 Systemcore 與 FIRST 駕駛站上使用而設計的 Web 應用程式，而非官方 FTC 版本則經過專門修改，可直接在現有的 FTC 控制系統上使用。它原生支援透過 FTC Dashboard 協定檢視即時資料，無需額外的軟體。
