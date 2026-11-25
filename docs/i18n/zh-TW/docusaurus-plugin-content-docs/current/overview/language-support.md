---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 語言支援 {#language-support}

AdvantageScope 支援多種語言，為世界各地的隊伍提供在地化體驗。目前以下語言已支援 AdvantageScope 文件、桌面應用程式、行動應用程式 (AdvantageScope XR 與 AdvantageTune)，以及 AdvantageScope Lite（包含 Systemcore 與 FIRST 駕駛站內的版本）：

- 英語（美國）
- 西班牙語（拉丁美洲）
- 法語
- 荷蘭語
- 葡萄牙語（巴西）
- 羅馬尼亞語
- 土耳其語
- 俄語
- 哈薩克語
- 希伯來語
- 阿拉伯語
- 印地語
- 簡體中文
- 繁體中文

感謝 FRC Team 6907 The G.O.A.T. 協助審校並改進 AdvantageScope 的翻譯！

## 設定 {#configuration}

若要在 AdvantageScope 中變更顯示語言，請點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗。在「語言」設定中，你可以從支援的語言清單中選擇，或選取「系統預設」來自動套用作業系統的語言。

<img src="/img/prefs_zh-TW.webp" alt="偏好設定圖解" height="450" />

## 日誌鍵名 {#logging-keys}

AdvantageScope 支援的所有格式在定義日誌鍵名時都完整相容 Unicode。也就是說，你可以用自己偏好的語言（包含重音符號、特殊字元與非拉丁字母）來記錄資料，AdvantageScope 都能正確記錄並顯示。

以下是使用繁體中文鍵名記錄字串的範例：

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Telemetry.log("驅動/右馬達速度", "快");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::telemetry::Log("驅動/右馬達速度", "快");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import telemetry

telemetry.log("驅動/右馬達速度", "快")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("驅動/右馬達速度", "快");
```

</TabItem>
</Tabs>

:::tip 單位支援
關於如何傳遞單位中繼資料，請參閱[單位支援](/tab-reference/line-graph/units)頁面。無論 AdvantageScope 選擇哪種語言，單位名稱都必須使用 SI 符號或英文（美式或英式拼法）。
:::

## 開發 {#development}

AdvantageScope 的在地化是透過人工智慧與社群協作共同完成的。由於 AdvantageScope 是一個快速演進的專案，運用 AI 才能讓翻譯後的應用程式與文件在所有語言之間保持同步。這代表無論你選擇哪種語言，新功能與更新都會同步推出。

我們的流程致力於貼近在地隊伍熟悉的詞彙、借詞與音譯。不過，**AI 翻譯仍可能出現不夠自然的用詞或其他不準確的地方**。歡迎提供意見回饋；當介面設定為英語以外的任何語言時，你可以點擊應用程式中的紫色圖示，或透過文件標題列中的意見回饋連結來回報翻譯相關問題。
