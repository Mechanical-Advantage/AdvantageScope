---
sidebar_position: 1
---

# 微調模式

某些即時來源支援對數值與布林值進行即時微調。例如，連線到 NetworkTables 來源時，此功能可用於[微調控制器增益](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html)。請注意，機器人程式碼必須支援透過 NetworkTables 接收增益。

預設情況下，AdvantageScope 中的所有數值均為唯讀。要切換微調模式，連線到受支援的即時來源時，請**點擊搜尋列右側的滑桿圖示**。當圖示為紫色時，微調模式處於分頁狀態，並已啟用欄位編輯。

- 要編輯**數值欄位**，請在側邊欄欄位右側的文字方塊中輸入新值。取消選擇輸入方塊或按下「Enter」鍵後即會發布該值。將文字方塊留空以使用機器人發布的值。
- 要切換**布林欄位**，請點擊側邊欄欄位右側的紅色或綠色圓圈。

:::warning
此功能並非旨在於場地上控制機器人。不支援儀表板樣式的輸入，如選擇器 (chooser)、觸發按鈕等。
:::

## 使用 AdvantageKit 進行微調

由 AdvantageKit 發布到 `AdvantageKit` 子表格的欄位僅供輸出，無法編輯。但是，使用者可以從使用者程式碼發布可在 AdvantageScope 中微調的欄位。**在使用「NetworkTables (AdvantageKit)」即時來源時，發布到 NetworkTables 上「/Tuning」表格的任何欄位都將顯示在「Tuning」表格下。**

例如，可以使用 [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) 類別發布可微調的數字：

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` 子表格**無法編輯**，因為它被 AdvantageKit 用於記錄網路值以進行日誌記錄與重播。請使用 `Tuning` 表格與網路輸入進行實時互動。
:::
