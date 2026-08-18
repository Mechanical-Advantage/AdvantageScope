---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL (非官方 REV 相容記錄器) {#unofficial-rev-compatible-logger}

:::info
2026 年最新功能，REVLib 包含官方記錄解決方案，用於將來自 Spark Max 與 Spark Flex 的資料儲存至 REV CAN 日誌 (`.revlog`)。有關詳細資訊，請參閱[此處](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger)。這些檔案可以直接在 AdvantageScope 中開啟，但無法與其他資料來源精確同步。

AdvantageScope 的*非官方* REV 相容記錄器 (URCL) 在 2026 賽季也將繼續向隊伍提供，以確保順暢過渡並提供與先前賽季同等的功能。我們將在稍後日期分享有關 2027 年及以後記錄選項的更多詳細資訊。
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger，非官方 REV 相容記錄器) 是一個可用於 Java、C++ 與 Python 的記錄函式庫，可自動記錄來自 Spark Max 與 Spark Flex 的資料。這實現了所有裝置的即時繪圖與記錄，類似於 CTRE 的 [Tuner X 繪圖功能](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) 與 [Phoenix 6 訊號記錄器](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html)。

設定完成後，來自所有 Spark Max 與 Spark Flex 裝置的週期性 CAN 框架都會發布到 NetworkTables 或 DataLog。使用 NetworkTables 時，可以使用 WPILib 的 [DataLogManager](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html) 將資料擷取到日誌檔案中。這些框架可以在 AdvantageScope 中檢視（請參閱[管理日誌檔案](/overview/log-files)與[連線到即時來源](/overview/live-sources)）。

- **所有訊號**都會被自動擷取，**新裝置無需手動設定**。
- **擷取每一個框架**，即使狀態框架週期比機器人迴圈週期更快。
- 框架以**基於 CAN RX 時間的時間戳記**進行記錄，與使用者程式碼中的傳統記錄相比，可以在 [SysId](https://docs.wpilib.org/zh-cn/stable/docs/software/pathplanning/system-identification/introduction.html) 中實現更準確的加速度表徵（請參閱下方的「SysId 使用」）。
- 記錄**高度高效**；操作經過執行緒化處理，每個 20ms 週期性週期的執行時間在 80µs 以下，即使在記錄大量裝置時也是如此。
- **REVLib 的所有功能均不受影響。**

:::info
由於此函式庫並非 REV 官方工具，支援諮詢應發送至 URCL [issues 頁面](https://github.com/Mechanical-Advantage/URCL/issues) 或 software@team6328.org，而非 REV 的支援聯絡方式。
:::

## 設定 {#setup}

按照在 VSCode 中使用依賴項管理員安裝[第三方函式庫](https://docs.wpilib.org/zh-cn/stable/docs/software/vscode-overview/3rd-party-libraries.html)的說明安裝 URCL 第三方函式庫 (vendordep)。或者，您可以使用以下廠商 JSON URL：

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL 預設發布到 NetworkTables，在其中可以透過啟用 WPILib 的 DataLogManager 將資料儲存到日誌檔案中。或者，URCL 可以直接記錄到 DataLog。記錄器應在 `robotInit` 中啟動，如下所示。

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // 如果要發布到 NetworkTables 和 DataLog
  DataLogManager.start();
  URCL.start();

  // 如果只記錄到 DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // 如果要發布到 NetworkTables 和 DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // 如果只記錄到 DataLog
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # 如果要發布到 NetworkTables 和 DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # 如果只記錄到 DataLog
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
URCL 與 AdvantageKit 的相容性僅為方便提供；記錄到日誌中的資料在重播中**不可用**。**REV 馬達控制器仍必須是具有已定義輸入的 IO 實作的一部分以支援重播**。
:::

</TabItem>
</Tabs>

為了在日誌中更容易識別裝置，可以透過將映射物件傳遞給 `start()` 或 `startExternal()` 方法來將 CAN ID 指派給別名。鍵是 CAN ID，值是在日誌中使用的名稱字串。未指派別名的任何裝置都將使用其預設名稱進行記錄。

:::warning
為了盡可能減少 CAN 利用率，Spark 裝置的大多數狀態框架在呼叫關聯的 getter 方法之前**預設為停用**。這些停用的狀態框架中包含的任何資料在 URCL 日誌中都將不可用。

有關更多詳細資訊，請查看 [REVLib 文件](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods)。我們建議在設定 Spark 時使用 [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) 以手動啟用要在日誌檔案中包含的任何訊號。
:::

## SysId 使用 {#sysid-usage}

1. 如上所示設定 URCL 後，將 SysId 常規程序設定為使用 `null` 作為機構日誌消費者。Java 的範例顯示如下。此設定可在次系統類別內部執行。

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// 建立 SysId 常規程序
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // 無日誌消費者，因為資料由 URCL 記錄
    subsystem
  )
);

// 以下方法回傳 Command 物件
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// 建立 SysId 常規程序
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // 無日誌消費者，因為資料由 URCL 記錄
    subsystem
  )
);

// 以下方法回傳 Command 物件
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. 在機器人上執行 SysId 常規程序。SysId 命令可以設定為自動常規程序或連線到按鈕觸發器。

3. 下載日誌檔案並在 AdvantageScope 中開啟。在選單列中，前往 `檔案` > `匯出資料...`。將格式設定為「WPILOG」，將欄位集設定為「包含產生的」。點擊儲存圖示並選擇儲存日誌的位置。

:::warning
來自機器人的日誌檔案必須在*使用 SysId 分析器開啟之前*，先由 AdvantageScope 開啟並匯出。這是將 URCL 記錄的 CAN 資料轉換為與 SysId 相容的格式所必需的。
:::

4. 透過在 VSCode 命令分頁中搜尋「WPILib: Start Tool」並選擇「SysId」（或在 Windows 上使用桌面啟動器）來開啟 SysId 分析器。點擊「Open data log file...」開啟匯出的日誌檔案。

5. 選擇下方欄位以使用預設編碼器執行分析。也可以使用來自次要編碼器的位置與速度資料（備用、外部、類比、絕對等）。

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId 產生的增益將使用 Spark Max/Flex 設定回報的單位（使用 [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) 與 [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)）。預設情況下，這些是在未應用齒輪比情況下的圈數與 RPM。如果記錄資料時使用的單位與所需的單位不符，可在分析期間於 SysId 中調整縮放比例。
:::
