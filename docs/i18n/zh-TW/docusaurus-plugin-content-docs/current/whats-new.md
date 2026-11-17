---
title: 2026 版本有哪些新功能？
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

AdvantageScope 2026 版本現已推出！詳細資訊請查看[安裝文件](/overview/installation)與[完整更新日誌](https://github.com/Mechanical-Advantage/AdvantageScope/releases)。這個版本帶來多項重大新功能與全方位的改進，不僅能提升現有控制系統的操作體驗，也為未來賽季順利轉換至 [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) 做好準備。

**我們非常重視你的回饋！歡迎到 [issues 頁面](https://github.com/Mechanical-Advantage/AdvantageScope/issues)提供回饋、提出功能需求與回報 Bug。**

## ✴️ 實驗性功能：FTC 支援 {#ftc-support}

為了幫 2027-2028 賽季全面支援 Systemcore 預做準備，這個版本新增了幾項功能，提升與現有 FIRST Tech Challenge 控制系統的相容性：

- 🗺️ [2D 場地](/tab-reference/2d-field) 與 👀 [3D 場地](/tab-reference/3d-field) 上的 FTC 場地與機器人模型
- 新增[座標系](/more-features/coordinate-systems)選項，相容於[標準 FTC 座標](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- 支援 [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) 日誌檔案
- 支援 [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard) 即時串流格式

:::tip
FTC 隊伍在官方賽季期間使用實驗性軟體時請務必謹慎。AdvantageScope 的 FTC 支援仍在積極開發中。
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

目前已有數個第三方 FTC 日誌／遙測函式庫支援與 AdvantageScope 相容的格式（例如 WPILOG 和 RLOG）。你可以前往各專案查看詳細文件；AdvantageScope 開發團隊不為任何特定的 FTC 日誌解決方案背書或推薦。

:::info
搭配 WPILib 框架與相關日誌工具時，AdvantageScope 能提供最佳體驗。若使用非官方的日誌解決方案，可能會遇到相容性問題或部分功能受限。

在 2027-2028 賽季轉換至 Systemcore 後，AdvantageScope 的所有功能都將在 FTC 中獲得官方支援。
:::

## 🧮 單位感知圖表 {#unit-aware-graphing}

📉 [折線圖](/tab-reference/line-graph/)分頁經過重新設計，現已完全支援單位感知，繪製數值欄位時可使用以下新功能：

- 精確標示 Y 軸與數值
- 快速轉換為相容單位（無彈出視窗）
- 在同一個軸內自動轉換相容的單位類型
- 精確顯示[積分與微分](/tab-reference/line-graph/#integration-and-differentiation)單位

下圖展示了這些功能的實際效果。可以看到左軸包含了不同角速度單位的欄位，右軸則是經過微分、並以非原生單位（度）顯示的數值。切換單位也比以往更方便，相容的單位選項已直接整合進每個軸的控制選單中。

_有關單位支援的更多資訊，請參閱[文件](/tab-reference/line-graph/units)。_

<img src="/img/tab-reference/line-graph/units-1.webp" alt="單位感知圖表" />

_上圖所示為英文介面。_

## 🏁 更快速的日誌下載 {#faster-log-downloads}

從 roboRIO [下載日誌](/overview/log-files/#downloading-from-the-robot)現在比先前版本**快 2 到 4 倍**。這是因為改用了新的 FTP 協定，讓 roboRIO 能以更低的 CPU 負載來傳輸日誌資料。

下表列出透過乙太網路連線（最大頻寬 100 Mb/s）時，AdvantageScope 2025 與 2026 版本的實測傳輸速度。可以看到 2025 版本的效能深受 roboRIO CPU 負載影響。

|                                                | 2025 (SFTP) | 2026 (FTP) | 加速倍率                                         |
| ---------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| 高 CPU 負載<br /><sub>複雜機器人程式碼</sub>   | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| 平均 CPU 負載<br /><sub>一般機器人程式碼</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| 最小 CPU 負載<br /><sub>無機器人程式碼</sub>   | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 從子資料夾下載日誌 {#download-logs-from-subfolders}

下載視窗現在支援抓取存放在子資料夾中的日誌，並可將每個子資料夾作為一個群組一次下載。這讓下載 CTRE 2026 版 [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) 產生的日誌變得更順暢（該工具因無法將所有資料寫入單一檔案，改以子資料夾存放）。

<img src="/img/whats-new/subfolders.webp" alt="下載日誌子資料夾" height="450" />

## 🌈 全新視覺化選項 {#new-visualization-options}

🗺️ [2D 場地](/tab-reference/2d-field) 與 👀 [3D 場地](/tab-reference/3d-field) 支援數個全新視覺化選項：

- 2D 場地上現在提供更多種機器人保險桿顏色，且每個物件都能單獨設定顏色，搭配殘影與多個機器人物件時更有彈性。
- 在 [3D 場地上視覺化 2D 機構](/tab-reference/3d-field/#2d-mechanisms)時，機構除了 XZ 平面外，現在也能放置在 YZ 平面上，更容易視覺化多軸運動的複雜機構。
- 3D 場地現在支援選填的反鋸齒功能，以提升渲染邊緣的品質。

<img src="/img/whats-new/field-viz.jpg" alt="全新場地視覺化" />

## 🪵 REV Robotics CAN 日誌支援 {#rev-robotics-can-log-support}

你現在可以直接在 AdvantageScope 中開啟由 REV Robotics [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) 產生的 `.revlog` 檔案。這些檔案記錄了 Spark Max 與 Spark Flex 裝置的 CAN 訊號，是 AdvantageScope [URCL](/more-features/urcl) 函式庫的官方替代方案。

URCL 與官方 `StatusLogger` 在 2026 賽季期間都會繼續提供，確保團隊能順利轉換並維持與先前賽季相同的功能。我們日後會再公布 2027 年及之後日誌記錄選項的更多細節。

<img src="/img/whats-new/revlog.webp" alt="REVLOG 視覺化" />

## 💿 CSV 檔案匯入 {#csv-file-imports}

為了更彈性地視覺化機器人日誌框架之外產生的資料，AdvantageScope 現在提供匯入 CSV 檔案的基本支援。支援格式與其他限制請參閱[文件](/overview/log-files/#csv-formatting)。

<img src="/img/overview/log-files/export-2.webp" alt="CSV 資料" />

## 🤩 介面外觀改進 {#aesthetic-improvements}

Windows 11 上的 AdvantageScope UI 已更新並支援半透明側邊欄，這項功能先前僅 macOS 版本獨享。macOS Tahoe 也同步換上基於 Apple Liquid Glass 材質設計的新版應用程式圖示。

<img src="/img/whats-new/windows-ui.webp" alt="Windows UI" />

## 📋 精簡的選單 {#streamlined-menus}

選單列與相關控制項經過精簡與重新整理，讓各平台的操作更直覺一致。主要改進包括：

- 在即時來源（例如 NetworkTables 與 [Phoenix 診斷](/overview/live-sources/phoenix-diagnostics)）之間更快速地切換，無需開啟偏好設定視窗。
- 在側邊欄上按右鍵，即可快速複製欄位名稱（或完整的欄位鍵名）。
- 重新整理偏好設定視窗，讓各項設定更好找。

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_zh-TW.webp" />
</div>

## 🐛 穩定性提升 {#stability-improvements}

此版本包含整個應用程式的多項 Bug 修復與穩定性提升。完整清單請見發布[更新日誌](https://github.com/Mechanical-Advantage/AdvantageScope/releases)，以下列出幾項重點修復：

- 大幅提升 AdvantageScope 長時間串流資料時的效能，特別是在使用折線圖分頁時。
- 提升對異常日誌資料的容錯度，包含體積較大的日誌檔案與資料量龐大的欄位值。
- 修正瀏覽日誌資料時的各種畫面異常，特別是在折線圖分頁中使用篩選器時。
- 修正下載視窗中 AdvantageKit 日誌檔案的排序；沒有時間戳記的日誌現在與其他格式一樣位於清單底部。
- 在 3D 場地分頁中，滾轉軸 (roll axis) 旋轉角度非零的機器人攝影機現在能正確顯示。
- 提升 AdvantageScope XR 的穩定性，特別是在 iOS/iPadOS 26 上執行時。若為離線安裝，請前往 App Store 檢查是否有可用更新。
