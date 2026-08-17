# 📉 折線圖 {#line-graph}

折線圖是 AdvantageScope 中的預設視圖。它同時支援連續（數值）與離散欄位。

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="折線圖示範" />

## 檢視器面板 {#viewer-pane}

要縮放，請將游標置於主圖表上方並向上或向下滾動。也可以透過按住 `Shift` 的同時點擊並拖曳來選擇範圍。透過水平滾動（在受支援的裝置上）或透過在圖表上點擊並拖曳來左右移動。當即時連線時，向左滾動會解鎖目前時間，滾動到最右側會再次鎖定到目前時間。

點擊圖表會選擇一個時間，按右鍵取消選擇。每個欄位在該時間的數值會顯示在圖例中。選取的時間在所有分頁中保持同步，從而可以輕鬆在其他視圖中快速找到此位置。

:::tip
選取時間與游標懸停時間之間的差值會作為覆蓋層顯示在圖表上，從而可以輕鬆測量時間範圍。時間戳記會根據 [時間戳記](/more-features/timestamps) 偏好設定進行格式化。
:::

## 控制面板 {#control-pane}

要開始，請將欄位拖曳到三個區段之一（左側、右側或離散）。使用 X 按鈕刪除欄位，或透過點擊眼睛圖示或雙擊欄位名稱暫時隱藏它。要移除所有欄位，請點擊軸標題附近的三個點，然後點擊 `全部清除`。可以透過點擊並拖曳在清單中重新排列欄位。

可以透過點擊彩色圖示或在欄位名稱上按右鍵來自訂每個欄位的顏色與線條樣式。來自 WPILib [持久性警示](https://docs.wpilib.org/zh-cn/latest/docs/software/telemetry/persistent-alerts.html) API 的資料可以透過將警示群組作為離散欄位新增來視覺化。下面顯示了一個範例視覺化。

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="警示視覺化" />

:::tip
要覆蓋機器人模式（自動、遙控或實用工具），請點擊「離散欄位」旁邊的三個點，然後點擊「顯示機器人模式」。

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="機器人模式覆蓋層" />
:::

### 調整軸 {#adjusting-axes}

預設情況下，每個軸會根據可見資料調整其範圍。要停用自動範圍調整並將範圍鎖定到目前的最小值與最大值，請點擊軸標題附近的三個點，然後點擊 `鎖定軸`。要手動調整範圍，請選擇 `編輯範圍...` 並輸入所需的數值。

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="編輯軸範圍" height="250" />

### 積分與微分 {#integration-and-differentiation}

AdvantageScope 可以自動對數值進行積分或微分。時間差總是以秒為單位測量。點擊軸標題附近的三個點，然後選擇 `微分` 或 `積分`。

:::info
導數使用相鄰取樣的[有限差分](https://zh.wikipedia.org/wiki/%E5%B7%AE%E5%88%86)計算。積分使用[梯形積分](https://zh.wikipedia.org/wiki/%E6%A2%AF%E5%BD%A2%E5%85%AC%E5%BC%8F)計算。
:::
