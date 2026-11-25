---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 使用 WPILOG 進行通用日誌記錄 {#universal-logging-with-wpilog}

WPILOG 是整個 WPILib 生態系採用的標準開放日誌格式。透過 AdvantageScope，WPILOG 可以作為多種日誌檔案與格式的通用容器。這表示單一 `.wpilog` 檔案即可包含多組以 AdvantageScope 支援的任意格式編碼之資料流，包括 CSV、廠商專用日誌或其他 WPILOG 檔案。

這項功能旨在簡化診斷流程，**將機器人的所有診斷資料集中到單一通用日誌檔案中**；即使從第三方函式庫或外部服務蒐集資料，也不需要在單場比賽後下載、關聯或同步多個日誌檔案。舉例來說，單一 WPILOG 檔案可以包含：

- 透過 WPILib 的 `Telemetry` API 或 NetworkTables 發布的標準機器人遙測資料。
- 廠商函式庫記錄的高頻裝置訊號。
- 來自協同處理器與外部服務、記錄為 CSV 或 WPILOG 的狀態資料。
- ……以及更多！

所有這些資料都會在 AdvantageScope 中顯示於同一個統一的樹狀結構下，如下圖所示，一個 WPILOG 檔案中同時包含了由多家廠商擷取的裝置訊號。

:::note
在 Systemcore 上，[URCL](https://github.com/Mechanical-Advantage/URCL) 已被官方的 REV [狀態記錄器](https://docs.revrobotics.com/revlib/logs)取代。透過 AdvantageScope 的通用日誌記錄功能，官方狀態記錄器可以將所有 REV 裝置的資料記錄到單一 WPILOG 檔案中（類似 URCL）。
:::

<img src="/img/more-features/universal-logging-1.webp" alt="側邊欄中顯示多個廠商日誌的 WPILOG 檔案。" />

_上圖所示為英文介面。_

:::tip
AdvantageKit 使用者還可以善用 XZ 壓縮，大幅縮減儲存在 WPILOG 中的第三方日誌檔案大小。詳細資訊請參閱 AdvantageKit 文件中關於日誌資料接收器的章節。
:::

## 實驗性功能：廠商日誌記錄 {#experimental-vendor-logging}

許多機器人專案會同時產生多個日誌檔案：一個用於 WPILib／AdvantageKit 遙測的標準 WPILOG 檔案，以及來自廠商函式庫的專有檔案。通用日誌記錄消除了這種拆分的狀況，直接將這些廠商日誌內嵌進主要的 `.wpilog` 檔案中。請參閱下方針對 WPILib 與 AdvantageKit 的說明。

:::note
由於此作法未獲廠商官方支援，若有支援需求請前往 AdvantageScope 的 [issues 頁面](https://github.com/Mechanical-Advantage/AdvantageScope/issues)或寄信至 software@team6328.org。關於如何匯出原始日誌檔案進行診斷的詳細說明，請參閱[匯出廠商資料](#exporting-vendor-data)。
:::

<Tabs groupId="library">
{/*
<TabItem value="wpilib-java" label="Java" default>

下載 [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) 類別並放入你的機器人專案中。此類別會自動將廠商日誌資料擷取到使用中的 `DataLog`，並應如下所示在 `Robot` 建構子中進行設定。你必須選擇一個合適的目錄（建議使用 `/home/systemcore/logs/`）作為擷取期間暫存廠商日誌的位置。詳細資訊請參閱[運作原理](#how-it-works)一節。

```java
public Robot() {
  // 如常啟動 WPILib 的 DataLogManager
  DataLogManager.start();

  // 啟用從暫存目錄擷取廠商日誌
  // 即使使用 USB 隨身碟，我們仍建議將廠商日誌暫存在內部儲存空間
  // （廠商日誌在擷取後不會永久保留）
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // 在啟用日誌擷取之後再啟動廠商日誌記錄器
  // 若可設定輸出目錄，路徑必須與上方一致
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

下載 [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) 與 [`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) 檔案並放入你的機器人專案中。此類別會自動將廠商日誌資料擷取到使用中的 `DataLog`，並應如下所示在 `Robot` 建構子中進行設定。你必須選擇一個合適的目錄（建議使用 `/home/systemcore/logs/`）作為擷取期間暫存廠商日誌的位置。詳細資訊請參閱[運作原理](#how-it-works)一節。

```cpp
Robot::Robot() {
  // 如常啟動 WPILib 的 DataLogManager
  wpi::DataLogManager::Start();

  // 啟用從暫存目錄擷取廠商日誌
  // 即使使用 USB 隨身碟，我們仍建議將廠商日誌暫存在內部儲存空間
  // （廠商日誌在擷取後不會永久保留）
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // 在啟用日誌擷取之後再啟動廠商日誌記錄器
  // 若可設定輸出目錄，路徑必須與上方一致
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

下載 [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) 檔案並放入你的機器人專案中。此輔助模組會自動將廠商日誌資料擷取到使用中的 `DataLog`，並應如下所示在 `robotInit` 中進行設定。你必須選擇一個合適的目錄（建議使用 `/home/systemcore/logs/`）作為擷取期間暫存廠商日誌的位置。詳細資訊請參閱[運作原理](#how-it-works)一節。

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # 如常啟動 WPILib 的 DataLogManager
        wpilib.DataLogManager.start()

        # 啟用從暫存目錄擷取廠商日誌
        # 即使使用 USB 隨身碟，我們仍建議將廠商日誌暫存在內部儲存空間
        # （廠商日誌在擷取後不會永久保留）
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # 在啟用日誌擷取之後再啟動廠商日誌記錄器
        # 若可設定輸出目錄，路徑必須與上方一致
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
*/}
<TabItem value="wpilib" label="WPILib">

:::warning
透過 DataLogManager 擷取廠商日誌的功能尚未推出，因為這需仰賴 WPILib 的上游變更。我們很快就會分享更多資訊！
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

:::note
此功能需要 AdvantageKit v27.0.0-beta-1，該版本即將推出。你可以在 GitHub [releases 頁面](https://github.com/Mechanical-Advantage/AdvantageKit/releases)查看目前狀態。
:::

廠商日誌擷取功能已內建於 AdvantageKit 中，可如下所示啟用。你必須選擇一個合適的目錄（建議使用 `/home/systemcore/logs/`）作為擷取期間暫存廠商日誌的位置。詳細資訊請參閱[運作原理](#how-it-works)一節。

```java
public Robot() {
  // 啟用從暫存目錄擷取廠商日誌
  // 即使使用 USB 隨身碟，我們仍建議將廠商日誌暫存在內部儲存空間
  // （廠商日誌在擷取後不會永久保留）
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // 如常啟動 AdvantageKit
  Logger.start();

  // 在啟動 AdvantageKit 日誌記錄器之後再啟動廠商日誌記錄器
  // 若可設定輸出目錄，路徑必須與上方一致
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
無論選擇哪種日誌資料接收器，廠商日誌都只能透過下載 WPILOG 檔案來檢視。由於所擷取日誌資料的結構限制，不支援即時串流。
:::

</TabItem>
</Tabs>

請注意，部分廠商日誌記錄器會在實例化對應裝置類別（例如 `SparkMax`）時*立即*開始寫入資料。我們建議等到 `Robot` 建構子的最後再實例化硬體物件，以確保日誌能完整擷取。

### 運作原理 {#how-it-works}

1. **擷取：** 機器人程式同時執行標準 WPILib 日誌記錄與廠商日誌記錄器。輕量級輔助程式會定期讀取廠商日誌記錄器寫入的新資料，並將原始資料區塊直接封裝進使用中的 `DataLog` 資料流。
2. **儲存：** 完整的合併日誌會儲存為單一 `.wpilog` 檔案（例如儲存在連接到 Systemcore 的 USB 隨身碟上）。機器人上建立的暫存廠商日誌檔案不會在重新啟動後保留，避免佔用儲存空間。
3. **視覺化：** 當 AdvantageScope 開啟 `.wpilog` 時，會自動偵測所有內嵌的日誌項目、解碼其內容，並將所有欄位連同標準遙測資料一起合併至側邊欄樹狀結構中。
4. **擷取匯出：** 若你需要開啟廠商日誌以取得支援或進行進階診斷，可以依照[匯出廠商資料](#exporting-vendor-data)的說明從 `.wpilog` 中無損匯出原始廠商日誌檔案。

外部日誌資料會使用類型字串遵循 `log:<format>` 慣例的原始項目儲存至 WPILOG 格式。解析這類欄位時，AdvantageScope 會依時間順序串接該項目的所有二進位記錄，並將產生的承載資料作為指定格式的獨立日誌進行解碼。解碼後的訊號接著會合併進主欄位樹中，並與現有資料自動同步。

:::tip
使用 WPILOG 進行通用日誌記錄不僅限於廠商日誌；任何與 AdvantageScope 相容的日誌格式都可以使用相同的慣例內嵌至 WPILOG 中。
:::

### 匯出廠商資料 {#exporting-vendor-data}

雖然可以直接在 AdvantageScope 中瀏覽廠商日誌資料，但有時仍可能需要匯出由原始函式庫產生的原始廠商日誌（例如在廠商專用工具中檢視）。

若要直接從 AdvantageScope 匯出單一子日誌，請在側邊欄中對該子日誌項目按右鍵並選擇**匯出原始日誌...**。

若需批次匯出，也可以使用 [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py) Python 腳本，它會搜尋一個或多個 `.wpilog` 或 `.wpilogxz` 檔案中所有整合的廠商日誌並匯出為獨立檔案：

```bash
pip3 install robotpy-wpiutil # 必要相依套件
python3 extract_vendor_logs.py path/to/source.wpilog
```
