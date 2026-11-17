---
sidebar_position: 1
---

# 微調模式 {#tuning-mode}

部分即時來源支援即時微調數值與布林值。舉例來說，連線至 NetworkTables 來源時，你可以用這個功能來[微調控制器增益](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html)。請注意，機器人程式碼必須支援透過 NetworkTables 接收增益。

預設情況下，AdvantageScope 中的所有數值都是唯讀的。連線至支援的即時來源時，**點擊搜尋列右側的滑桿圖示**即可切換微調模式。當圖示變為紫色時，代表微調模式已啟用，你可以編輯欄位數值。

- 若要編輯**數值欄位**，請在側邊欄欄位右側的文字方塊中輸入新值，取消選取輸入方塊或按下「Enter」鍵後即會發布。若將文字方塊留空，則會改用機器人發布的值。
- 若要切換**布林欄位**，請點擊側邊欄欄位右側的紅色或綠色圓點。
- 若要將所有已發布的值複製到剪貼簿，請**在滑桿圖示上按右鍵**並選擇**「複製微調值」**。

:::warning
此功能並非設計用來在場地上操控機器人，也不支援選擇器 (chooser)、觸發按鈕等儀表板類型的輸入元件。
:::

## 使用 AdvantageKit 進行微調 {#tuning-with-advantagekit}

由 AdvantageKit 發布至 `AdvantageKit` 子表格的欄位僅供輸出，無法編輯；不過，你可以從使用者程式碼發布能在 AdvantageScope 中微調的欄位。**使用「NetworkTables (AdvantageKit)」即時來源時，發布到 NetworkTables「/Tuning」表格的欄位都會顯示在「Tuning」表格下。**

例如，可以使用 [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) 類別發布可微調的數字：

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` 子表格**無法編輯**，因為 AdvantageKit 會用它來記錄網路輸入以供日誌儲存與重播。若要與網路輸入進行即時互動，請使用 `Tuning` 表格。
:::
