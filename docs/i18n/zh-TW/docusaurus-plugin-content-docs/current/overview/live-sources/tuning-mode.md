---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 微調模式 {#tuning-mode}

部分即時來源支援在連線時直接微調數值與布林值。舉例來說，連線至 NetworkTables 來源時，你可以用這個功能來[微調控制器增益](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html)。請注意，機器人程式碼必須支援透過 NetworkTables 接收增益。

預設情況下，AdvantageScope 中的所有數值都是唯讀的。連線至支援的即時來源時，**點擊搜尋列右側的滑桿圖示**即可切換微調模式。當圖示變為紫色時，代表微調模式已啟用，你可以編輯欄位數值。

- 若要編輯**數值欄位**，請在側邊欄欄位右側的文字方塊中輸入新值，取消選取輸入方塊或按下「Enter」鍵後即會發布。若將文字方塊留空，則會改用機器人發布的值。
- 若要切換**布林欄位**，請點擊側邊欄欄位右側的紅色或綠色圓點。
- 若要將所有已發布的值複製到剪貼簿，請**在滑桿圖示上按右鍵**並選擇**「複製微調值」**。

:::tip
對於 iPhone 與 iPad 使用者，**AdvantageTune** 是 AdvantageScope 開發團隊推出的另一項選擇，方便從行動裝置微調 NetworkTables 數值。

[<img src="/img/app-store-zh-TW.svg" alt="App Store" />](https://apps.apple.com/tw/app/advantagetune/id6811453643)
:::

## WPILib 可微調參數 {#wpilib-tunables}

在 WPILib 中，可以使用 Tunable API 設定數值與布林值等參數，以便在 AdvantageScope 中即時調整。可微調數值只需註冊一次，即可在機器人程式碼中定期讀取：

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// 定期讀取數值
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// 定期讀取數值
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# 定期讀取數值
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## 使用 AdvantageKit 進行微調 {#tuning-with-advantagekit}

由 AdvantageKit 發布至 `AdvantageKit` 子表格的欄位僅供輸出，無法編輯；不過，你可以從使用者程式碼發布能在 AdvantageScope 中微調的欄位。**使用「NetworkTables (AdvantageKit)」即時來源時，發布到 NetworkTables「/Tuning」表格的欄位都會顯示在「Tuning」表格下。**

例如，可以使用 [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) 類別發布可微調的數字：

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` 子表格**無法編輯**，因為 AdvantageKit 會用它來記錄網路輸入以供日誌儲存與重播。若要與網路輸入進行即時互動，請使用 `Tuning` 表格。
:::
