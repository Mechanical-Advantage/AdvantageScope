---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL (非官方 REV 相容記錄器) {#unofficial-rev-compatible-logger}

:::info
從 2026 賽季起，REVLib 新增了官方的日誌記錄方案，可將 Spark Max 與 Spark Flex 的資料儲存為 REV CAN 日誌 (`.revlog`)。詳情請參閱[官方文件](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger)。這些檔案能直接在 AdvantageScope 中開啟，但無法與其他資料來源精確同步。

在 2026 賽季，AdvantageScope 仍會繼續提供*非官方* REV 相容記錄器 (URCL)，確保隊伍順利過渡並維持與過往賽季相同的功能。我們會在日後公布 2027 年及之後的日誌記錄規劃。
:::

URCL（**U**nofficial **R**EV-**C**ompatible **L**ogger，非官方 REV 相容記錄器）是一款支援 Java、C++ 與 Python 的日誌函式庫，可自動記錄 Spark Max 與 Spark Flex 的資料，讓所有裝置都能進行即時繪圖與日誌記錄，就像 CTRE 的 [Tuner X 繪圖功能](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html)與 [Phoenix 6 訊號記錄器](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html)一樣。

設定完成後，所有 Spark Max 與 Spark Flex 裝置的週期性 CAN 訊框都會發布到 NetworkTables 或 DataLog。若透過 NetworkTables 發布，可以使用 WPILib 的 [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) 將資料擷取並寫入日誌檔案，接著就能在 AdvantageScope 中檢視這些訊框（請參閱[管理日誌檔案](/overview/log-files)與[連線到即時來源](/overview/live-sources)）。

- **所有訊號**都會自動擷取，**新增裝置時也不需手動設定**。
- **完整擷取每個訊框**，即使狀態訊框的週期比機器人迴圈週期還快也不會漏掉。
- 訊框會以 **CAN RX 接收時間作為時間戳記**來記錄，相較於在使用者程式碼中進行傳統記錄，能讓 [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) 做出更準確的加速度特性分析（請參閱下方的「SysId 使用方式」）。
- 記錄過程**極具效率**：相關作業採用多執行緒處理，即使記錄大量裝置，每個 20 毫秒週期內的執行時間也低於 80 微秒。
- **完全不影響 REVLib 的任何功能。**

:::info
由於此函式庫並非 REV 官方工具，若有支援問題請前往 URCL 的 [issues 頁面](https://github.com/Mechanical-Advantage/URCL/issues)或寄信至 software@team6328.org，切勿聯絡 REV 官方支援。
:::

## 設定 {#setup}

請依照在 VSCode 中使用相依性管理員安裝[第三方函式庫](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html)的步驟，安裝 URCL 第三方函式庫 (vendordep)；或者也可以直接使用以下廠商 JSON URL：

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL 預設會發布到 NetworkTables，你可以啟用 WPILib 的 DataLogManager 將資料儲存到日誌檔案；或者也可以讓 URCL 直接寫入 DataLog。記錄器應在 `robotInit` 中啟動，範例如下。

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
URCL 與 AdvantageKit 的相容性僅為方便使用而提供，寫入日誌的資料並**無法**用於重播 (replay)。**REV 馬達控制器仍必須透過定義好輸入的 IO 實作來支援重播**。
:::

</TabItem>
</Tabs>

為了在日誌中更容易辨識各個裝置，你可以將一個映射物件 (map) 傳入 `start()` 或 `startExternal()` 方法，為 CAN ID 指定別名。其中 key 為 CAN ID，value 則是在日誌中顯示的名稱字串。未指定別名的裝置會以預設名稱記錄。

:::warning
為了降低 CAN 匯流排使用率，Spark 裝置大多數的狀態訊框**預設為停用**，直到程式呼叫對應的 getter 方法才會啟用。任何包含在這些停用狀態訊框中的資料，都不會出現在 URCL 日誌裡。

詳情請參閱 [REVLib 文件](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods)。我們建議在設定 Spark 時使用 [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig)，手動啟用你想記錄到日誌檔案中的所有訊號。
:::

## SysId 使用方式 {#sysid-usage}

1. 如上所述設定好 URCL 後，建立 SysId 常規程序 (routine) 時將機構的 log consumer 設為 `null`。下方為 Java 範例，此設定可直接放在子系統 (subsystem) 類別中。

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// 建立 SysId 常規程序
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // 不指定日誌接收端，因為資料由 URCL 記錄
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
    null, // 不指定日誌接收端，因為資料由 URCL 記錄
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

2. 在機器人上執行 SysId 常規程序。你可以將 SysId 指令設定為自動階段常規程序，或綁定到搖桿按鈕觸發。

3. 下載日誌檔案並在 AdvantageScope 中開啟。從選單列選擇 `檔案` > `匯出資料...`，將格式設為「WPILOG」、欄位集設為「包含產生的欄位」，然後點擊儲存圖示並選擇儲存位置。

:::warning
從機器人下載的日誌檔案必須先透過 AdvantageScope 開啟並匯出，**才能用 SysId 分析器開啟**。這是為了將 URCL 記錄的 CAN 資料轉換成與 SysId 相容的格式。
:::

4. 在 VSCode 命令選擇區搜尋「WPILib: Start Tool」並選擇「SysId」（或在 Windows 上使用桌面啟動器）來開啟 SysId 分析器，接著點擊「Open data log file...」開啟剛匯出的日誌檔案。

5. 選取以下欄位即可使用預設編碼器進行分析，也可以改用次要編碼器（備用、外部、類比、絕對等）的位置與速度資料：

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId 產生的增益值 (gains) 會採用 Spark Max/Flex 設定回報的單位（透過 [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) 與 [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>) 設定）。預設情況下，未套用齒輪比時的單位為圈數與 RPM。若記錄資料時使用的單位與你想要的單位不同，可以在 SysId 分析過程中調整縮放比例。
:::
