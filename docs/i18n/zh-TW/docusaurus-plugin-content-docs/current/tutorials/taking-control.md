---
sidebar_position: 3
---

# 🕹️ 掌握控制：DS 與搖桿

在場上除錯時，了解駕駛員輸入與通訊健康狀況至關重要。AdvantageScope 與 [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) 無縫整合，讓你能監控即時診斷資訊、檢視駕駛站日誌並視覺化控制器輸入。

在這篇教學課程中，你將學會如何：

- 直接從 **FIRST Driver Station** 存取 AdvantageScope。
- 連線至即時駕駛站診斷資訊。
- 比較並同步**機器人端日誌**與**駕駛站日誌**。
- 在 **💬 主控台**分頁中檢視主控台輸出與錯誤訊息。
- 在 **🎮 搖桿**分頁中視覺化搖桿輸入與控制器佈局。

## 1. 從 FIRST Driver Station 存取 AdvantageScope

💡 [AdvantageScope Lite](/more-features/advantagescope-lite) 已直接整合在 FIRST Driver Station 中。點擊 ⚙️ 圖示，再點擊「Open Log Viewer in Browser」即可存取。

<img src="/img/tutorials/taking-control-1.webp" alt="FIRST Driver Station 中的 Open Log Viewer In Browser 按鈕" />

_上圖所示為英文介面。_

## 2. 即時連線至駕駛站

當與 FIRST Driver Station 在同一台筆記型電腦上執行時，AdvantageScope 桌面應用程式也可以即時串流駕駛站狀態的遙測與診斷資訊：

1. 同時啟動 FIRST Driver Station 與 AdvantageScope。
2. 在頂端選單中選擇 `檔案` > `連線到駕駛站`。
3. AdvantageScope 會連線到本機駕駛站服務，即時串流比賽狀態、電池電壓、搖桿狀態等資訊。
4. 開啟 📉 [折線圖](/tab-reference/line-graph)或 🔢 [表格](/tab-reference/table)分頁，檢視即時 DS 診斷資料。

:::tip
你也可以使用鍵盤快捷鍵 `Ctrl+Option+Shift+K` (macOS) 或 `Ctrl+Alt+Shift+K` (Windows/Linux) 快速將駕駛站作為即時來源進行連線。
:::

## 3. 駕駛站日誌 vs 機器人端日誌

在比賽或練習後診斷機器人行為時，主要有兩種日誌類型需要考量：

| 日誌類型         | 來源                                | 記錄的資料                                                                                                        |
| :--------------- | :---------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **機器人端日誌** | 透過 `DataLogManager` 的 Systemcore | 高頻遙測（50+ Hz）、機器人狀態、搖桿狀態、感測器測量值、馬達電流、PID 控制器狀態、姿態估計與機構資料。            |
| **駕駛站日誌**   | 駕駛站筆記型電腦                    | 網路往返時間（延遲）、封包遺失率 %、無線電 ping、電池電壓、機器人控制器 CPU %、主控台資料、機器人狀態與搖桿狀態。 |

:::important 通常優先使用機器人端日誌
由於**機器人端日誌**直接在來源端記錄豐富的高頻遙測資料，在調查機器人行為、控制迴圈與自動階段路徑時通常是首選。然而，**DS 日誌**會擷取機器人本身無法測量的關鍵外部網路與比賽事件。

**兩份日誌中**都會擷取搖桿資料，如下方[第 6 節](#6-visualizing-joysticks)所示。
:::

## 4. 合併與同步多個日誌

AdvantageScope 讓你在單一時間軸上開啟並同步來自多個來源的日誌：

1. 使用 `檔案` > `開啟日誌...` 開啟你的機器人端日誌檔案（或直接將 `.wpilog` 檔案拖曳進 AdvantageScope）。
2. 在選單列中選擇 `檔案` > `新增日誌...`，並選取對應的駕駛站日誌。
3. AdvantageScope 會自動將兩份日誌對齊到同步的時間軸上！每份日誌的欄位會整理在不同的表格下（例如 `Log0` 與 `Log1`）。
4. 現在你可以在 📉 [折線圖](/tab-reference/line-graph)中將機器人端遙測（如馬達電流或姿態估計）直接疊加對照駕駛站訊號（如封包遺失率或電池電壓），觀察異常的機器人行為是否與無線電斷線或電壓驟降 (brownout) 同時發生。

<img src="/img/overview/log-files/open-file-1.webp" alt="在 AdvantageScope 中開啟已儲存的日誌檔案。" />

_上圖所示為英文介面。_

## 5. 檢視主控台資料

💬 [主控台](/tab-reference/console)分頁可讓你檢視由機器人或駕駛站列印的文字輸出與錯誤日誌。主控台資料可儲存在任一份日誌檔案中：

- **機器人端日誌：** WPILib 的 `DataLogManager` 會自動記錄機器人主控台輸出。
- **駕駛站日誌：** 在 DS 中，主控台輸出與系統事件訊息會儲存在 `DS:/Dscomm/Console` 欄位中。

若要檢視主控台資料：

1. 點擊分頁列中的 **+** 按鈕並選擇**主控台**。
2. 從側邊欄將主控台欄位（`DS:/Dscomm/Console` 或 `messages`）拖曳到主檢視區。
3. 每一列代表一則帶有時間戳記的日誌訊息。點擊任一訊息即可將所有已開啟分頁的同步時間軸跳轉至該精確時刻！
4. 使用「篩選」方塊（或按下 `Ctrl+F` / `Cmd+F`）搜尋特定訊息，或點擊調色盤圖示切換警告與錯誤的醒目提示。

<img src="/img/tab-reference/console-1.webp" alt="顯示日誌訊息的主控台分頁。" />

_上圖所示為英文介面。_

## 6. 視覺化搖桿 {#6-visualizing-joysticks}

🎮 [搖桿](/tab-reference/joysticks)分頁提供最多 6 支遊戲控制器的即時視覺呈現，在逼真的控制器配置圖上顯示軸移動、扳機按壓、POV 視角帽與按鈕按下。為確保搖桿輸入記錄在機器人端日誌檔案中，請依照 👋 [你好，遙測！](/tutorials/hello-telemetry)的說明，在 `Robot` 建構子中與 `DataLogManager` 一同初始化 `DriverStation.startDataLog()`。

1. 點擊頂端分頁列中的 **+** 按鈕並選擇**搖桿**。
2. 在分頁底部的表格中，將每個搖桿 ID（0 到 5）指派給適當的配置（例如 **Xbox Controller**、**PS4 Controller** 或 **Generic Joystick**）。
3. 當你拖曳瀏覽日誌檔案或從駕駛站串流即時資料時，按鈕就會亮起，類比搖桿也會與駕駛員的操作同步移動！

<img src="/img/tab-reference/joysticks-1.webp" alt="顯示目前控制器按鈕按壓與類比搖桿位置的搖桿分頁。" />

_上圖所示為英文介面。_

## 下一步？

恭喜你完成了核心 AdvantageScope 教學課程系列！你現在已經知道如何：

- 在 **👋 [你好，遙測！](/tutorials/hello-telemetry)** 中設定遙測、連線即時串流並檢視圖表／表格。
- 在 **🤖 [踏上場地](/tutorials/to-the-field)** 中視覺化 2D／3D 里程計、軌跡與機構。
- 在 **🕹️ [掌握控制](/tutorials/taking-control)** 中串流即時駕駛站診斷資訊、合併多來源日誌並重播搖桿輸入。

繼續探索 AdvantageScope 的進階工具與功能：

- **📂 [日誌檔案](/overview/log-files)：** 了解支援的日誌格式、匯出資料與批次下載。
- **🛜 [即時來源](/overview/live-sources)：** 關於連線即時來源（包含微調模式）的詳細指南。
- **[分頁參考](/category/tab-reference)：** 涵蓋每種視覺化類型功能的參考指南。
- **[更多功能](/category/more-features)：** 關於 AdvantageScope 其他功能的說明文件與原理。
