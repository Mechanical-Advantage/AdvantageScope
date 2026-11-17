# 📉 折線圖 {#line-graph}

折線圖是 AdvantageScope 的預設檢視畫面，同時支援連續（數值）與離散欄位。

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="折線圖示範" />

_上圖所示為英文介面。_

## 檢視器面板 {#viewer-pane}

將游標移至主圖表上方並上下滾動即可縮放，也可以按住 `Shift` 拖曳來選取範圍。在支援的裝置上可透過水平滾動左右移動，或直接在圖表上按住左鍵拖曳。在即時連線狀態下，向左滾動會解除鎖定目前時間，向右滾動到底則會重新鎖定目前時間。

點擊圖表可選取時間點，按右鍵則可取消選取；圖例中會顯示各欄位在該時間點的數值。選取的時間會在所有分頁間同步，方便你快速在其他分頁中定位到相同時間。

:::tip
圖表上會疊加顯示選取時間與游標懸停時間之間的差值，方便測量時間區間。時間戳記的顯示格式會依據[時間戳記](/more-features/timestamps)偏好設定而定。
:::

## 控制面板 {#control-pane}

將欄位拖曳到左側、右側或離散三個區段之一即可開始使用。點擊 X 按鈕可移除欄位，點擊眼睛圖示或雙擊欄位名稱則可暫時隱藏。若要移除所有欄位，請點擊軸標題旁的三個點，再選擇 `全部清除`。在清單中拖曳欄位即可重新排序。

點擊彩色圖示或在欄位名稱上按右鍵，就能自訂各欄位的顏色與線條樣式。將 WPILib [持久性警示 (Persistent Alerts)](https://docs.wpilib.org/en/latest/docs/software/telemetry/persistent-alerts.html) API 的警示群組作為離散欄位加入後，即可將其視覺化，範例如下所示。

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="警示視覺化" />

:::tip
要疊加機器人模式（自動、遙控或實用工具），請點擊「離散欄位」旁的三個點，再點擊「顯示機器人模式」。

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="機器人模式疊加顯示" />

_上圖所示為英文介面。_
:::

### 調整軸 {#adjusting-axes}

預設情況下，每個軸會根據可見資料自動調整範圍。若要停用自動調整並將範圍鎖定在目前的最小值與最大值，請點擊軸標題旁的三個點，再選擇 `鎖定軸`。若要手動調整範圍，請選擇 `編輯範圍...` 並輸入所需數值。

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="編輯軸範圍" height="250" />

_上圖所示為英文介面。_

### 積分與微分 {#integration-and-differentiation}

AdvantageScope 可自動對數值進行積分或微分，時間差一律以秒為單位計算。點擊軸標題旁的三個點後，選擇 `微分` 或 `積分` 即可套用。

:::info
導數是利用相鄰取樣的[有限差分](https://zh.wikipedia.org/wiki/%E5%B7%AE%E5%88%86)計算；積分則是使用[梯形積分](https://zh.wikipedia.org/wiki/%E6%A2%AF%E5%BD%A2%E5%85%AC%E5%BC%8F)計算。
:::
