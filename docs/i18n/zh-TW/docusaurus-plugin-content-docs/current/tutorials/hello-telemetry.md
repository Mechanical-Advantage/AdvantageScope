---
sidebar_position: 1
---

# 👋 你好，遙測！

歡迎來到 AdvantageScope！遙測與資料記錄是強大的功能，能提升你理解機器人程式碼、診斷問題並在場內外實作解決方案的能力。這些教學課程旨在帶你入門遙測功能，讓你充分發揮 AdvantageScope 的完整實力。

在這篇教學課程中，你將學會如何：

- 在 Java WPILib 專案中設定基本的機器人遙測。
- 在 AdvantageScope 中連線至即時資料串流。
- 將資料記錄至日誌檔案以便日後存取。
- 使用 AdvantageScope 視覺化遙測資料。

:::tip 想找其他內容嗎？

- **FTC 隊伍：** 如果你使用的是現有的 FIRST Tech Challenge 控制系統，請參閱 ✴️ [FTC 相容性](/more-features/ftc-compatibility)指南。
- **網頁介面：** FIRST Driver Station 與 Systemcore 網頁介面中直接內建了瀏覽器版本的 AdvantageScope。詳細資訊請參閱 💡 [AdvantageScope Lite](/more-features/advantagescope-lite)。
- **AdvantageKit：** 專為模擬環境中的決定性重播而設計的進階日誌框架。詳細資訊請參閱[相關文件](https://docs.advantagekit.org)。我們建議先從下方介紹的 WPILib 內建遙測 API 開始。
  :::

## 1. 建立新的 WPILib 專案

首先，在 VS Code 中建立一個新的 WPILib Java 專案：

1. 開啟 VS Code。
2. 點擊右上角的 WPILib 圖示（或按下 `Ctrl+Shift+P` / `Cmd+Shift+P` 並輸入 **WPILib: Create a new project**）。
3. 選擇 **Template** > **Java** > **Command v3 Robot**（或 **Command v2 Robot**）。
4. 選擇資料夾、為專案命名（例如 `HelloTelemetry`），並輸入你的隊號。
5. 勾選 **Enable Desktop Support** 並點擊 **Create Project**。

<img src="/img/tutorials/hello-telemetry-1.webp" alt="在 VS Code 中使用 WPILib 專案建立器建立新的 WPILib Java 專案。" />

_上圖所示為英文介面。_

## 2. 初始化資料記錄

WPILib 透過 `DataLogManager` 提供內建的資料記錄功能。啟動後，它會自動將所有遙測、NetworkTables 項目與駕駛站輸入記錄至 `.wpilog` 檔案。

:::info 建議
雖然日誌可以儲存在 Systemcore 的內部儲存空間，但內部快閃記憶體容量有限。我們強烈建議將標準的 **FAT32 格式 USB 隨身碟**插入 Systemcore 上的任一 USB 連接埠。`DataLogManager` 會自動偵測隨身碟並將所有日誌直接寫入其中。
:::

開啟 `src/main/java/first/robot/Robot.java`，並在 `Robot()` 建構子中初始化 `DataLogManager`：

```java
public class Robot extends OpModeRobot {
  // ...

  public Robot() {
    // 啟動 DataLogManager，將所有遙測資料記錄至 USB 隨身碟上的 .wpilog 檔案
    DataLogManager.start();

    // 同時記錄駕駛站資料（搖桿、OpMode、啟用狀態）
    DriverStation.startDataLog(DataLogManager.getLog());
  }

  // ...
}
```

## 3. 發布遙測資料

WPILib 的 `Telemetry` 類別只需一行程式碼即可發布資料，並將欄位整理為階層式表格。此 API 支援多種資料類型，包含數值、布林值、字串、陣列與 WPILib [幾何類型](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/index.html)。

:::info
WPILib 中的 `Telemetry` 類別與 FTC SDK 中的 `Telemetry` 類別不同。WPILib 的 `Telemetry` 類別會將資訊從機器人程式傳送至儀表板、除錯工具或日誌檔案。若要更新內建的駕駛站顯示內容，請使用 WPILib 的 `DriverStationDisplay` 類別。
:::

更新 `src/main/java/first/robot/ExampleTeleop.java`：

```java
@Teleop
public class ExampleTeleop implements OpMode {
  // ...

  @Override
  public void periodic() {
    double currentTime = Timer.getTimestamp();
    double sineWave = Math.sin(currentTime * 2.0);

    // 使用 Telemetry API 發布遙測數值
    Telemetry.log("Time", currentTime);
    Telemetry.log("SineWave/Value", sineWave);
    Telemetry.log("SineWave/Low", sineWave < 0.5);
  }
}
```

將程式碼部署到機器人（或在 VS Code 中執行 `WPILib: Simulate Robot Code`）。在模擬環境中，點擊 `Teleoperated` > `ExampleTeleop` > `Enable`。

<img src="/img/tutorials/hello-telemetry-2.webp" alt="在模擬器 GUI 中啟用 ExampleTeleop OpMode。" height="200" />

_上圖所示為英文介面。_

:::tip
只有在呼叫 `Telemetry.log` 時才會發布新的遙測資料。`Robot` 類別、OpMode、子系統與機構中的週期性方法會在不同條件下處於作用狀態；決定將記錄呼叫放在何處時，請仔細查閱 API 文件。
:::

## 4. 即時連線至 AdvantageScope

啟動 AdvantageScope 桌面應用程式。在頂端選單中選擇 `檔案` > `連線到機器人` > `NetworkTables`（若正在模擬，則選擇 `檔案` > `連線到模擬器`）。連線成功後，左側邊欄會在 `NT:/Telemetry` 下列出已發布的欄位。

:::tip 鍵盤快捷鍵
按下 `Ctrl+K` / `Cmd+K` 可快速連線至機器人，或按下 `Ctrl+Shift+K` / `Cmd+Shift+K` 連線至模擬器。
:::

<img src="/img/tutorials/hello-telemetry-3.webp" alt="AdvantageScope 連線至即時機器人串流，並在側邊欄樹狀結構中列出欄位。" />

_上圖所示為英文介面。_

## 5. 視覺化遙測資料

### 折線圖

📉 [折線圖](/tab-reference/line-graph)是 AdvantageScope 中的預設分頁，提供數值與離散值的即時繪製。

1. 查看左側邊欄中的 `Telemetry` > `SineWave`。
2. 將 `Value` 拖曳到控制面板的「左軸」區域。
3. 將 `Low` 拖曳到控制面板的「離散欄位」區域。
4. 點擊「離散欄位」旁的三個點圖示，然後選擇「顯示機器人模式」。

隨著資料串流進來，你會看到正弦波與機器人狀態即時更新！

:::info 與圖表互動

- **暫停／拖曳檢視：** 水平捲動或在圖表上點擊並拖曳即可檢視過去的資料。右上角的紅色箭頭代表即時自動捲動已暫停；點擊該箭頭或按下 `L` 鍵即可切換即時自動捲動。
- **縮放：** 將游標移至圖表上方並上下捲動，或按住 `Shift` 拖曳以放大特定時間區間。
- **檢查數值：** 點擊圖表上的任意位置可放置時間游標，並在圖例中查看精確數值。
  :::

<img src="/img/tutorials/hello-telemetry-4.webp" alt="繪製正弦波訊號的折線圖。" />

_上圖所示為英文介面。_

### 表格

🔢 [表格](/tab-reference/table)分頁會以依時間順序排列的試算表形式顯示狀態與數值變化，非常適合用來診斷狀態切換與事件序列。

1. 點擊頂端分頁列中的 **+** 按鈕並選擇**表格**。
2. 從側邊欄將 `NT:/Telemetry/SineWave/Value` 與 `NT:/Telemetry/Low` 拖曳到表格檢視中。
3. 每當任何顯示欄位的值發生變化時，系統就會自動新增一列。
4. 點擊任一列，即可立即將所有已開啟的分頁跳轉到該精確時刻！

:::tip
你可以使用分頁列重新排列並重新命名分頁。點擊標題列中的視窗按鈕，即可在彈出視窗中開啟分頁並同時並排檢視多個分頁。
:::

<img src="/img/tutorials/hello-telemetry-5.webp" alt="顯示正弦波資料的表格分頁。" />

_上圖所示為英文介面。_

### 統計資料

📊 [統計資料](/tab-reference/statistics)分頁會顯示數值的直方圖，讓你深入了解一個或多個欄位的資料分布。

1. 點擊頂端分頁列中的 **+** 按鈕並選擇**統計資料**。
2. 從側邊欄將 `NT:/Telemetry/SineWave/Value` 拖曳到「測量值」區段。
3. 將「資料範圍」設為 `-1` 與 `1`，並將「組距」設為 `0.1`。
4. 透過直方圖與摘要統計資料檢視資料。
5. 捲動頂端的時間軸以調整要納入的資料範圍。

<img src="/img/tutorials/hello-telemetry-6.webp" alt="顯示正弦波資料的統計資料分頁。" />

_上圖所示為英文介面。_

## 6. 下載並開啟日誌檔案

測試或比賽結束後，你可以從機器人下載 `.wpilog` 檔案以事後檢視資料：

1. 在選單列中選擇 `檔案` > `下載日誌...`。
2. AdvantageScope 會連線到機器人並列出所有已記錄的日誌檔案（最新的排在最上方）。
3. 選取要檢查的日誌檔案，點擊下載 (↓) 圖示，並選擇電腦上的資料夾。
4. 使用 `檔案` > `開啟日誌...` 或直接將 `.wpilog` 檔案拖曳進 AdvantageScope 來開啟已下載的檔案。

<img src="/img/overview/log-files/open-file-2.webp" alt="下載對話方塊顯示機器人儲存空間上可用的 WPILOG 檔案。" height="350" />

_上圖所示為英文介面。_

## 下一步？

既然你已經讓基本遙測與日誌記錄運作起來，接著可以將視覺化提升到下一個層次：

- **🤖 [踏上場地：機器人視覺化](/tutorials/to-the-field)：** 學習如何在 FRC 與 FTC 場地模型上視覺化 2D／3D 機器人位置、軌跡與機構。
- **[概述](/category/overview)：** 關於管理檔案、導覽快捷鍵與即時串流選項的完整指南。
- **[單位支援](/tab-reference/line-graph/units)：** 如何將單位中繼資料整合至日誌中以進行更精確的視覺化。
- **💬 [主控台](/tab-reference/console)：** 視覺化由 WPILib 的 `DataLogManager` 儲存的文字日誌。
- **🔍 [中繼資料](/tab-reference/metadata)：** 儲存額外資訊以識別及分類日誌檔案。
- **[Epilogue](https://docs.wpilib.org/en/stable/docs/software/telemetry/robot-telemetry-with-annotations.html)：** 在 Java 中使用註解記錄遙測資料。
