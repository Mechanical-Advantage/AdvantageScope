---
title: 2027 新功能？
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

AdvantageScope 2027 版本現已推出，帶來對 Systemcore 的完整支援，以及整體應用程式超過 **100 項新功能與更新**。詳細資訊請參閱[安裝文件](/overview/installation)與[完整更新日誌](https://github.com/Mechanical-Advantage/AdvantageScope/releases)。本頁面重點介紹此版本的主要新增功能與改進。

**我們重視你的意見！歡迎到 [issues 頁面](https://github.com/Mechanical-Advantage/AdvantageScope/issues)提供回饋、提出功能需求或回報 Bug。**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Systemcore 相容性 {#systemcore-compatibility}

AdvantageScope 2027 專為與全新 Systemcore 機器人控制器及 WPILib 2027 無縫搭配而打造：

- 預設機器人位址現已改為 `robot.local`，無需設定隊號即可進行即時連線或下載日誌。選單列中亦可直接選取 Systemcore 的 USB 與 Wi-Fi 位址。
- [日誌下載](/overview/log-files#downloading-from-the-robot)現已支援透過 SFTP 下載 Systemcore 日誌，並保留舊版 roboRIO 日誌下載功能。
- 新增自 2027 年起用於 FRC 場地、自 2027–2028 年起用於 FTC 場地的[中心/紅方](/more-features/coordinate-systems#center-red)座標系。
- 新增對 WPILib 2027 `Telemetry` 與 `Tunables` API 的支援、更新的警示顏色，以及新的[時間戳記顯示偏好設定](/more-features/timestamps)，讓 Systemcore 時間戳記更易於閱讀。
- 全新的 [Systemcore 診斷](/overview/live-sources)即時模式可直接連線至 Systemcore 內建的 NetworkTables 伺服器，無需使用者程式碼即可監控機器人狀態與硬體 IO。

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite) 將 AdvantageScope 的視覺化與分析工具直接帶入網頁瀏覽器，可從 Systemcore 網頁介面以及 FIRST Driver Station 內部直接存取，**無需安裝**。

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope 與全新 [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) 緊密整合，簡化賽場診斷流程：

- 可直接從 FIRST Driver Station 設定選單存取 [AdvantageScope Lite](/more-features/advantagescope-lite)，分析由 DS 產生的 WPILOG 檔案。
- 使用桌面應用程式無需任何設定，即可從本機駕駛站即時串流比賽狀態、通訊指標、電池電壓與搖桿輸入。
- 在桌面版開啟駕駛站 `.wpilog` 檔案時，系統會提示是否要在預先配置好主控台輸出、通訊指標、電源、CPU 使用率與搖桿分頁的獨立視窗中開啟（[文件](/overview/log-files#driver-station-layout)）。此佈局也是 FIRST Driver Station 中 AdvantageScope Lite 的預設佈局。
- 在 💬 [主控台](/tab-reference/console)分頁中檢視駕駛站主控台日誌，支援自動醒目提示警告／錯誤訊息，並完整支援 [ANSI 跳脫序列](/tab-reference/console#ansi-formatting)（顏色與文字樣式）。

<img src="/img/tutorials/taking-control-1.webp" alt="從 FIRST Driver Station 開啟 AdvantageScope Lite" />

_上圖所示為英文介面。_

## 🌐 多語言支援 {#language-support}

AdvantageScope 現已在桌面應用程式、文件網站、行動應用程式以及 AdvantageScope Lite 中提供 **14 種語言**：英語（美國）、西班牙語（拉丁美洲）、法語、荷蘭語、葡萄牙語（巴西）、羅馬尼亞語、土耳其語、俄語、哈薩克語、希伯來語、阿拉伯語、印地語、簡體中文與繁體中文。

:::info
翻譯仍在持續改進中，由人工智慧與社群貢獻者共同完成，**可能包含不夠自然的用詞或不準確之處**。感謝已經協助審校並完善這些翻譯的隊伍！有關我們的翻譯流程以及如何提交意見回饋，請參閱 🌐 [語言支援](/overview/language-support)頁面。
:::

<img src="/img/whats-new/multi-language-1.webp" alt="簡體中文介面的折線圖分頁" />

## 📖 全新教學課程與文件 {#new-tutorials-and-documentation}

文件已擴充全新的三部曲[教學課程系列](/category/tutorials)，協助隊伍快速上手 WPILib 2027 與 AdvantageScope：

1. **👋 [你好，遙測！](/tutorials/hello-telemetry)：** 設定 `DataLogManager` 與 `Telemetry` API、進行即時連線，並使用折線圖、表格與統計資料進行分析。
2. **🤖 [踏上場地：機器人視覺化](/tutorials/to-the-field)：** 在 FRC 與 FTC 場地上發布 2D／3D 姿態、軌跡與 `Mechanism2d` 物件。
3. **🕹️ [掌握控制：DS 與搖桿](/tutorials/taking-control)：** 串流即時駕駛站診斷資訊、同步機器人與 DS 日誌、檢視主控台輸出以及視覺化控制器輸入。

整份文件中的程式碼範例也已全面更新，涵蓋多種語言的 WPILib `Telemetry` API。

<img src="/img/tutorials/to-the-field-4.webp" alt="來自《踏上場地》教學課程的 3D 場地視覺化" />

_上圖所示為英文介面。_

## 📱 AdvantageTune {#advantagetune}

AdvantageTune 是一款全新的獨立 iPhone 與 iPad 應用程式，提供輕量級的行動裝置微調體驗，與 AdvantageScope 相輔相成。你可以直接從手機檢視並修改即時 [NetworkTables](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) 主題（包含基本型別、陣列、WPILib 結構與 Protobuf），讓每個人都能輕鬆參與機器人程式碼的微調。

AdvantageTune 與 AdvantageScope 皆簡化了將微調數值匯出回機器人程式碼的流程，提供按鈕可將所有已微調數值儲存為文字檔案以方便分享（[文件](/overview/live-sources/tuning-mode)）。

[<img src="/img/app-store-zh-TW.svg" alt="App Store" />](https://apps.apple.com/tw/app/advantagetune/id6811453643)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="AdvantageTune 瀏覽檢視" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="AdvantageTune 主題編輯" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="AdvantageTune 結構編輯" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="AdvantageTune 已微調數值清單" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="AdvantageTune 搜尋與篩選" />
</div>

_上圖所示為英文介面。_

## 🪐 WPILOG 通用日誌記錄 {#wpilog-universal-logging}

透過[通用日誌記錄](/more-features/universal-logging)，單一 WPILOG 檔案現在可以作為多種日誌串流與格式的通用容器，包含廠商專用裝置日誌、CSV 資料與子 WPILOG 檔案。通用日誌記錄以彈性且與廠商無關的方式取代了 URCL：來自各來源的資料會自動同步並合併至單一統一的側邊欄樹狀結構中。關於在 AdvantageKit 及 WPILib（即將推出）中擷取廠商日誌的詳細說明，請參閱[通用日誌記錄文件](/more-features/universal-logging#experimental-vendor-logging)。

<img src="/img/more-features/universal-logging-1.webp" alt="側邊欄中顯示多個廠商日誌的 WPILOG 檔案" />

_上圖所示為英文介面。_

## 🗺️ 場地分頁改進 {#field-tab-improvements}

🗺️ [2D 場地](/tab-reference/2d-field)與 👀 [3D 場地](/tab-reference/3d-field)分頁新增了多項實用改進：

- 在 2D 場地上平移與縮放，或按右鍵鎖定攝影機以跟隨機器人的位置與旋轉（[文件](/tab-reference/2d-field#camera-controls)）。
- 新增選項，可在欄位近期未更新時淡出 2D 與 3D 殘影（適用於視覺姿態渲染）。
- 在 2D 與 3D FTC 場地上新增地墊格線，方便空間參考。
- 開啟新的 2D 或 3D 場地分頁時，AdvantageScope 現在會記住上次使用的是 FRC 還是 FTC 場地。

<img src="/img/tab-reference/2d-field-1.webp" alt="2D 場地分頁概述" />

_上圖所示為英文介面。_

## 📉 折線圖改進 {#line-graph-improvements}

📉 [折線圖](/tab-reference/line-graph)與時間軸包含多項視覺化最佳化，讓分析更清晰：

- 啟用「顯示機器人模式」時，現在會針對自動、遙控、實用工具與停用階段繪製色彩編碼橫條。
- 點狀圖表會依任意縮放層級自動調整點的大小，以維持最佳可視性。
- 折線圖與時間軸上會顯示實用提示，引導新使用者操作捲動與縮放手勢。
- 改進了時間軸與折線圖座標軸上較大時間戳記數值的渲染與可讀性。

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="折線圖上色彩編碼的機器人模式疊加顯示" />

_上圖所示為英文介面。_

## 🤝 無障礙功能強化 {#accessibility-enhancements}

AdvantageScope 2027 包含多項更新，提升應用程式的無障礙體驗：

- 為所有輸入控制項新增鍵盤 Tab 導覽，並為全應用程式的所有控制項新增描述性工具提示。
- AdvantageScope 現在會遵循作業系統層級的「減少透明度」與「減少動態效果」設定。
- 側邊欄中的布林指示器現在不再僅依賴顏色來區分狀態。

## 🥔 新增單位類型 {#new-unit-types}

AdvantageScope 的[單位感知圖表](/tab-reference/line-graph/units)已擴充支援更多單位類型與解析選項：

- 功率（瓦特、馬力等）
- 比率（無因次、百分比）
- 克耳文溫度
- 馬鈴薯能量 (Potato energy)
- 英式英語單位拼法（例如 `metres`）
- WPILib 單位函式庫的後綴

## 🧱 穩定性改進 {#stability-improvements}

此版本包含大量 Bug 修復、效能最佳化以及全應用程式的穩定性改進。完整清單請見發布[更新日誌](https://github.com/Mechanical-Advantage/AdvantageScope/releases)，主要亮點如下：

- 官方 Windows 發行版本現已進行程式碼簽章，降低安裝過程中出現 SmartScreen 警告的頻率。
- 顯著提升日誌載入與繪圖效能，特別是在處理 Hoot (`.hoot`) 日誌與大型結構陣列時。
- 修復同時檢視 AdvantageKit 日誌與高頻率資料來源時的時間戳記處理問題。
- 改進對齊多來源日誌時的多日誌時間戳記同步演算法。
- 提升 [Phoenix 診斷](/overview/live-sources/phoenix-diagnostics)的連線可靠性。
- 修復彈出視窗選單列與 [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) 中錄製彈出視窗的介面問題。
- 最佳化全應用程式的介面文字與措辭以提升清晰度。
