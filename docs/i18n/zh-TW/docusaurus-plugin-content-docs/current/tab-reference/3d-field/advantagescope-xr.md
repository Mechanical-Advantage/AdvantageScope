# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR 將 👀 [3D 場地](/tab-reference/3d-field)帶入擴增實境，讓你以全新方式呈現資料。你可以用實際尺寸觀看模擬的自動階段、透過桌面場地模型討論比賽策略，甚至在真實機器人上疊加診斷資訊！以下影片示範了這項功能的幾種常見應用：

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 系統需求 {#requirements}

- **主機：** Windows、macOS 或 Linux 上的 AdvantageScope 桌面應用程式（v4.1.0 或更高版本）。請先[停用](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall)裝置上的防火牆。
- **客戶端：** 搭載 iOS / iPadOS 16 或更高版本的 iPhone 或 iPad，無需安裝應用程式。
- **網路：** 兩台裝置必須連線到同一個網路（Wi-Fi、USB 網路共用等）。除下列特定情況外，此網路不需要連接網際網路。
- **網際網路：** 若近期未曾使用過 AdvantageScope XR，行動裝置需具備網際網路連線（例如行動數據）。若想省去這項需求，請參考下方的[離線使用](#offline-usage)說明。

:::tip
AdvantageScope XR 支援多款 iPhone 與 iPad 機型，但在配備 **LiDAR 感測器**的裝置上會更加穩定，包括 iPhone Pro（自 iPhone 12 Pro 起）與 iPad Pro（2020 年春季或更新機型）。
:::

<details>
<summary>那其他平台呢？</summary>

AdvantageScope XR 僅支援 iOS 與 iPadOS，近期內也沒有支援其他平台的計畫。由於客戶端必須與擴增實境、影片錄製、網頁渲染等原生 API 緊密整合，團隊優先開發並支援 iOS 與 iPadOS 的原因如下：

- **一致性：** AdvantageScope XR 對裝置效能的要求較高。Android 裝置在處理能力與功能上差異甚大，而 iPhone 與 iPad 則能提供跨世代一致的開發體驗。所有近期的 iOS 與 iPadOS 裝置都有足夠效能執行 AdvantageScope XR，較新的機型也支援 LiDAR 等進階功能。

- **普及度：** 在美國學生族群中，iPhone 是最常見、也最容易向同學借到的智慧型手機，也比任何 VR 或混合實境頭戴式裝置更為普及。支援 iOS 能讓最多使用者輕鬆體驗 AdvantageScope XR。

- **平板電腦支援：** 在平板電腦上執行 AdvantageScope XR 也有其優勢：較大的螢幕更方便多人同時觀看。iPad 是全球最普及的平板電腦，因此支援 iPadOS 能讓更多使用者享受大螢幕體驗。

</details>

## 設定 {#setup}

1. 在主機端，**點擊任一 3D 場地分頁上的「XR」按鈕**。同一時間只能有一個 XR 主機連線處於啟用狀態，因此點擊此按鈕會中斷其他正在進行的連線。

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="XR 按鈕" height="450" />

_上圖所示為英文介面。_

2. 接著會開啟 **XR 控制視窗**，裡頭包含 QR Code 與自訂 AR 體驗的[選項](#options)。若要結束 XR 連線並中斷所有客戶端，直接關閉控制視窗即可。

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="XR 視窗" height="350" />

_上圖所示為英文介面。_

3. 使用客戶端裝置上的**內建相機應用程式**掃描 QR Code，無需額外安裝應用程式。
4. 點擊「AdvantageScope XR」，再點擊「開啟」以**啟動體驗**並連線至主機。如果出現權限提示，請允許 AdvantageScope XR 存取**相機與區域網路**。
5. 按照裝置上的指示**校準並定位場地模型**。
6. 如常在主機裝置上操作場地模型，包含**日誌播放與即時串流**，場地模型的狀態都會即時同步顯示在客戶端裝置上。
7. 若想快速**錄製影片**，請點擊螢幕頂端的「錄製」圖示；再次點擊即可停止錄製，之後就能編輯並儲存片段。

:::warning
XR 目前尚未支援熱力圖與 Swerve 模組速度，其餘所有物件類型皆可使用。
:::

:::tip
AdvantageScope XR 對效能的要求較高，依 3D 場景的複雜程度，有時可能會出現效能下降的情況。如有需要，可考慮改用較精簡的機器人模型或減少顯示的物件數量。
:::

## 選項 {#options}

XR 控制視窗提供數個選項，可調整模型在擴增實境中的顯示方式：

- **校準：**
  - 選擇*迷你*可檢視縮小版的場地模型，適合放在桌面上使用。
  - 選擇*實際大小*則會依真實比例顯示場地，並以實體場地護欄作為定位基準。切換*藍方聯盟*與*紅方聯盟*可決定要以哪一側的場地進行校準，但無論選擇哪一側，畫面都會顯示完整的場地。
- **串流：**
  - 若應用場景能接受些微延遲以換取更穩定的串流品質（例如模擬自動階段或播放日誌檔案），請選擇*平滑*。
  - 在可接受輕微畫面抖動的即時應用中（例如在真實機器人上疊加資料，或在遙控階段駕駛模擬機器人），請選擇*低延遲*。
- **顯示地板：** 在場地下方顯示平坦的地毯／地磚模型，而不直接疊加在真實地面上。
- **顯示場地：** 顯示場地模型，包含場地護欄與各賽季專屬的場地物件。自訂[遊戲物件](/tab-reference/3d-field#game-piece-objects)則始終會顯示。
- **顯示機器人：** 顯示機器人模型。若要在真實機器人上疊加資料（如視覺目標或 2D 機構），可將此選項關閉。

## 離線使用 {#offline-usage}

AdvantageScope XR 不需要網際網路連線。為確保離線時也能使用，請透過下方連結從 App Store 下載 AdvantageScope XR。若要連線至 AdvantageScope 桌面應用程式，請使用 iOS 相機應用程式掃描 QR Code，或點擊 AdvantageScope XR 應用程式中的「掃描」按鈕。

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
即使在沒有網際網路連線的情況下執行，主機與客戶端裝置**仍必須連線到同一個網路**（例如機器人網路、自訂 Wi-Fi 網路，或透過 USB 網路共用）。
:::
