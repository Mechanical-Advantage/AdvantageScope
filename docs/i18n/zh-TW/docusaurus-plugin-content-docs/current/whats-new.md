---
title: 2026 版本有哪些新功能？
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-light.png" className="light-only" />
<img src="/img/whats-new/banner-dark.png" className="dark-only" />

AdvantageScope 2026 版本現已推出！請查看[安裝文件](/overview/installation)與[完整更新日誌](https://github.com/Mechanical-Advantage/AdvantageScope/releases)以瞭解詳細資訊。此版本包含數個重大新功能以及整個應用程式的多項改進。此版本中的許多功能旨在提升現有控制系統的使用體驗，同時為未來賽季順暢過渡至 [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) 奠定基礎。

**我們非常重視你的回饋！歡迎在 [issues 頁面](https://github.com/Mechanical-Advantage/AdvantageScope/issues) 提供回饋、功能需求與報告 Bug。**

## ✴️ 實驗性功能：FTC 支援 {#ftc-support}

為了在 2027-2028 賽季全面支援 Systemcore 做準備，此版本新增了多項功能以提升與現有 FIRST Tech Challenge 控制系統的相容性：

- 🗺️ [2D 場地](/tab-reference/2d-field) 與 👀 [3D 場地](/tab-reference/3d-field) 上的 FTC 場地與機器人模型
- 新增[座標系](/more-features/coordinate-systems)選項，以相容於 [標準 FTC 座標](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- 支援 [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) 日誌檔案
- 支援 [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard) 即時串流格式

:::tip
FTC 隊伍在官方賽季期間使用實驗性軟體時應保持謹慎。AdvantageScope 對 FTC 的支援仍在積極開發中。
:::

<div className="image-gallery">
  <img src="/img/whats-new/ftc-1.jpg" />
  <img src="/img/whats-new/ftc-2.jpg" />
  <img src="/img/whats-new/ftc-3.png" />
  <img src="/img/whats-new/ftc-4.png" />
  <img src="/img/whats-new/ftc-5.png" />
</div>

數個第三方 FTC 日誌/遙測函式庫支援與 AdvantageScope 相容的其他格式，例如 WPILOG 和 RLOG。這些函式庫的文件可在各自的專案中找到；AdvantageScope 開發人員不背書/推薦任何特定用於 AdvantageScope 的 FTC 日誌解決方案。

:::info
AdvantageScope 旨在配合 WPILib 框架及相關日誌工具使用時提供最佳體驗。在使用非官方日誌解決方案時，你可能會遇到相容性問題或受限的功能。

在 2027-2028 賽季過渡至 Systemcore 後，AdvantageScope 的所有功能都將在 FTC 中獲得官方支援。
:::

## 🧮 感知單位的圖表繪製 {#unit-aware-graphing}

📉 [折線圖](/tab-reference/line-graph/)分頁已重新設計，完全支援單位感知。這在繪製數值欄位時啟用了多項新功能：

- 精確標示 Y 軸與數值顯示
- 快速轉換為相容單位（無快顯視窗）
- 在單一軸內隱式轉換相容單位類型
- 精確顯示[積分與微分](/tab-reference/line-graph/#integration-and-differentiation)單位

下方螢幕截圖展示了所有這些功能的實際運作情況。請注意，左軸包含具有不同角速度單位的欄位，而右軸包含經過微分並以非原生單位（度）顯示的值。選擇單位也比以往更加輕鬆，相容的單位選項已直接整合到每個軸的控制選單中。

_有關單位支援的更多資訊可以在[文件](/tab-reference/line-graph/units)中找到。_

<img src="/img/tab-reference/line-graph/units-1.png" alt="感知單位的圖表繪製" />

## 🏁 更快速的日誌下載 {#faster-log-downloads}

從 roboRIO [下載日誌](/overview/log-files/#downloading-from-the-robot)現在比先前版本**快 2 到 4 倍**。這是透過切換到新協定 (FTP) 來實現的，該協定允許 roboRIO 以更少的 CPU 開銷傳輸日誌資料。

下表顯示了在透過乙太網路連接（最大頻寬為 100 Mb/s）時，AdvantageScope 2025 和 2026 版本的實測傳輸速度。請注意，2025 版本的效能受到 roboRIO 上 CPU 負載的嚴重影響。

|                                                | 2025 (SFTP) | 2026 (FTP) | 加速比                                           |
| ---------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| 高 CPU 負載<br /><sub>複雜機器人程式碼</sub>   | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| 平均 CPU 負載<br /><sub>一般機器人程式碼</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| 最小 CPU 負載<br /><sub>無機器人程式碼</sub>   | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 從子資料夾下載日誌 {#download-logs-from-subfolders}

下載視窗現在支援儲存儲存在子資料夾中的日誌。每個日誌子資料夾都可以作為一組下載，為下載 CTRE 2026 版本 [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) 產生的日誌提供了一種簡化的方法（該軟體使用子資料夾作為無法將資料儲存在單一日誌檔案中的通融辦法）。

<img src="/img/whats-new/subfolders.png" alt="下載日誌子資料夾" height="450" />

## 🌈 全新視覺化選項 {#new-visualization-options}

🗺️ [2D 場地](/tab-reference/2d-field) 與 👀 [3D 場地](/tab-reference/3d-field) 支援數個全新視覺化選項：

- 2D 場地上現在提供更多種機器人保險桿顏色，且每個物件都可以設定自己的顏色。這在將殘影與多個機器人物件相結合時提供了更大的彈性。
- 在 [3D 場地上視覺化 2D 機構](/tab-reference/3d-field/#2d-mechanisms)時，機構現在除了 XZ 平面外還可以放置在 YZ 平面上。這使得具有多軸運動的複雜機構能夠更輕鬆地進行視覺化。
- 3D 場地現在支援選填的反鋸齒功能，以提升渲染邊緣的品質。

<img src="/img/whats-new/field-viz.jpg" alt="全新場地視覺化" />

## 🪵 REV Robotics CAN 日誌支援 {#rev-robotics-can-log-support}

您現在可以直接在 AdvantageScope 中開啟由 REV Robotics [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) 產生的 `.revlog` 檔案。這些檔案記錄了 Spark Max 與 Spark Flex 裝置的 CAN 訊號，提供了 AdvantageScope [URCL](/more-features/urcl) 函式庫的官方替代方案。

URCL 和官方 `StatusLogger` 將在 2026 賽季期間繼續提供，以確保順暢過渡並提供與先前賽季同等的功能。我們將在稍後日期分享有關 2027 年及以後日誌記錄選項的更多詳細資訊。

<img src="/img/whats-new/revlog.png" alt="REVLOG 視覺化" />

## 💿 CSV 檔案匯入 {#csv-file-imports}

為了更彈性地視覺化機器人日誌框架之外產生的資料，AdvantageScope 現在包含匯入 CSV 檔案的基本支援。請查看[文件](/overview/log-files/#csv-formatting)以取得有關支援格式與其他限制的更多詳細資訊。

<img src="/img/overview/log-files/export-2.png" alt="CSV 資料" />

## 🤩 美學改進 {#aesthetic-improvements}

Windows 11 上的 AdvantageScope UI 已更新以支援半透明側邊欄，此功能先前為 macOS 版本獨享。基於 Apple 液態玻璃 (Liquid Glass) 材質，macOS Tahoe 還獲得了更新的應用程式圖示。

<img src="/img/whats-new/windows-ui.png" alt="Windows UI" />

## 📋 精簡的選單 {#streamlined-menus}

選單列與相關控制項已經過精簡與重新組織，使所有平台上的控制項更加易用與一致。主要功能包括：

- 在即時來源（例如 NetworkTables 和 [Phoenix 診斷](/overview/live-sources/phoenix-diagnostics)）之間更快速地切換，無需開啟偏好設定視窗。
- 在側邊欄上按右鍵可快速複製欄位名稱（或完整欄位鍵名）。
- 重新組織偏好設定視窗，使選項更容易快速找到。

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.png" />
  <img src="/img/whats-new/menus-2.png" />
  <img src="/img/prefs.png" />
</div>

## 🐛 穩定性提升 {#stability-improvements}

此版本包含整個應用程式中的各種 Bug 修復與穩定性提升。完整清單可以在發布[更新日誌](https://github.com/Mechanical-Advantage/AdvantageScope/releases)中找到，以下列出了一些值得注意的修復：

- 大幅提升了 AdvantageScope 在長時間串流資料時的效能，特別是在使用折線圖分頁時。
- AdvantageScope 現在對異常日誌資料具備更高容錯度，包括大型日誌檔案與大型場值。
- 修復了瀏覽日誌資料時的各種視覺缺陷，特別是在折線圖分頁上使用篩選器時。
- 修復了下載視窗中 AdvantageKit 日誌檔案的排序；沒有時間戳記的日誌現在位於清單底部，與其他格式類似。
- 在 3D 場地分頁上，滾轉軸 (roll axis) 旋轉非零的機器人攝影機現在可以正確視覺化。
- 提升了 AdvantageScope XR 的穩定性，特別是在 iOS/iPadOS 26 上執行時。對於離線安裝，請在 App Store 中檢查可用的更新。
