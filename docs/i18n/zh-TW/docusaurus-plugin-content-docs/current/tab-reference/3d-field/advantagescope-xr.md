# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR 將 👀 [3D 場地](/tab-reference/3d-field)視圖帶入擴增實境，讓您能以全新的方式視覺化資料。以實際尺寸觀看模擬自動程序、用桌面場地模型複習比賽策略、在真實機器人上疊加診斷資訊等等！下面的影片展示了此功能的幾個使用案例：

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 系統需求 {#requirements}

- **主機：** Windows、macOS 或 Linux 上的 AdvantageScope 桌面應用程式（v4.1.0 或更高版本）。裝置上的任何防火牆都應[停用](https://docs.wpilib.org/zh-cn/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall)。
- **客戶端：** 搭載 iOS/iPadOS 16 或更高版本的 iPhone 或 iPad。無需安裝應用程式。
- **網路：** 兩台裝置必須連線到同一網路（Wi-Fi、USB 網路共用等）。根據以下需求，此網路不需要連線到網際網路。
- **網際網路：** 如果最近未使用過 AdvantageScope XR，行動裝置必須有網際網路連線（例如行動數據）。要消除此需求，請查看下方的[離線使用](#offline-usage)部分。

:::tip
AdvantageScope XR 在許多 iPhone 與 iPad 型號上均受支援，但對於配備 **LiDAR 感測器**的裝置更為穩定。這包括 iPhone Pro（從 iPhone 12 Pro 開始）與 iPad Pro（2020 年春季或更高版本）。
:::

<details>
<summary>其他平台怎麼辦？</summary>

AdvantageScope XR 僅在 iOS 與 iPadOS 上受支援。目前沒有支援其他平台的即時計畫。客戶端應用程式需要與擴增實境、影片錄製、網頁渲染等原生 API 緊密整合。iOS 與 iPadOS 在開發與支援方面優先受到以下幾個原因：

- **一致性：** AdvantageScope XR 是一個要求較高的應用程式。雖然 Android 裝置在處理能力與功能方面差異很大，但 iPhone 與 iPad 提供了跨代的一致開發體驗。所有近期的 iOS 與 iPadOS 裝置都有足夠的能力運行 AdvantageScope XR，較新的裝置還支援 AdvantageScope 可以利用的其他功能（如 LiDAR）。

- **可及性：** iPhone 仍然是美國學生最有可能擁有或能輕鬆從同伴處取得的最常見智慧型手機，且比任何 VR 或混合實境頭盔型號更廣泛可用。支援 iOS 最大化了可以輕鬆使用 AdvantageScope XR 的使用者數量。

- **平板電腦支援：** 使用者可以利用在平板電腦上運行 AdvantageScope XR 的優勢，因為平板電腦提供了更大的顯示器，更容易讓多人同時觀看。iPad 是全球最常用的平板電腦，因此支援 iPadOS 使平板電腦體驗盡可能易於存取。

</details>

## 設定 {#setup}

1. 在主機系統上，**點擊任何 3D 場地分頁上的「XR」按鈕**。同一時間只能有一個 XR 主機工作階段處於活動狀態，因此點擊此按鈕將中斷任何其他活動工作階段。

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="XR 按鈕" />

2. **XR 控制視窗**將開啟，其中包含 QR 碼與自訂 AR 體驗的[選項](#options)。要取消 XR 工作階段並中斷任何客戶端的連線，請關閉控制視窗。

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="XR 視窗" />

3. 使用客戶端裝置上的**內建相機應用程式**掃描 QR 碼。無需安裝應用程式。
4. 點擊「AdvantageScope XR」，然後點擊「打開」以**啟動體驗**並連線到主機。如果出現提示，請允許 AdvantageScope XR 存取**相機和區域網路**。
5. 按照裝置上的指示**校準並定位場地模型**。
6. 使用主機裝置正常控制場地模型，包括**日誌播放與即時串流**。場地模型的狀態會即時顯示在客戶端裝置上。
7. 要快速**錄製影片**，請點擊螢幕頂部的「錄製」圖示。再次點擊以停止錄製，然後編輯並儲存片段。

:::warning
熱力圖與 Swerve 模組速度目前在 XR 中尚不支援。支援所有其他物件類型。
:::

:::tip
AdvantageScope XR 是一個要求較高的應用程式，根據 3D 場景的複雜程度，可能會出現效能問題。如有必要，請考慮使用更簡單的機器人模型或更少的物件。
:::

## 選項 {#options}

XR 控制視窗提供了幾個選項，用於控制模型在擴增實境中的顯示方式：

- **校準：**
  - 選擇*迷你版*以視覺化縮小版的場地，適合桌面使用。
  - 選擇*完整尺寸*以按精確比例視覺化場地，根據真實場地護欄進行定位。在*藍方聯盟*與*紅方聯盟*之間切換可控制哪一側的場地用於校準，但在所有情況下都會視覺化完整場地。
- **串流：**
  - 對於延遲可接受以換取更可靠串流的應用程式，選擇*平滑*，例如模擬自動程序或播放日誌檔案。
  - 對於即時應用程式，輕微的抖動可接受的情況，選擇*低延遲*，例如在真實機器人上疊加資料或在遙控中駕駛模擬機器人。
- **顯示地板：** 在場地下方顯示平坦的地毯/地磚模型，而非疊加在真實表面上。
- **顯示場地：** 顯示場地模型，包括場地護欄與比賽特定元素。自訂[遊戲物件](/tab-reference/3d-field#game-piece-objects)始終顯示。
- **顯示機器人：** 顯示機器人模型，在真實機器人上疊加資料時可停用（例如視覺目標或 2D 機構）。

## 離線使用 {#offline-usage}

AdvantageScope XR 不需要網際網路連線。要確保應用程式在離線狀態下可用，請使用下面的連結從 App Store 下載 AdvantageScope XR。要連線到 AdvantageScope 桌面應用程式，請使用 iOS 相機應用程式掃描 QR 碼，或點擊 AdvantageScope XR 應用程式中的「掃描」按鈕。

<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />

:::note
即使在沒有網際網路連線的情況下運行，主機與客戶端裝置**必須連線到同一網路**（例如機器人、自訂 Wi-Fi 網路或透過 USB 網路共用）。
:::
