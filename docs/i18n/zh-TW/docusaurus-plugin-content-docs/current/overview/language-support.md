---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 語言支援 {#language-support}

AdvantageScope 支援多種語言，為全球隊伍提供在地化體驗。目前支援以下語言：

- 英語 (美國)
- 西班牙語 (拉丁美洲)
- 法語
- 葡萄牙語 (巴西)
- 土耳其語
- 羅馬尼亞語
- 希伯來語
- 哈薩克語
- 俄語
- 阿拉伯語
- 簡體中文
- 繁體中文

## 設定 {#configuration}

若要在 AdvantageScope 中變更顯示語言，請點擊 `App` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗。在「語言」設定下，你可以從支援的語言清單中進行選擇，或選擇「系統預設」以自動符合作業系統的語言。

<img src="/img/prefs_zh-TW.webp" alt="偏好設定圖解" height="350" />

## 日誌鍵名 {#logging-keys}

AdvantageScope 支援的所有格式在定義日誌鍵名時均具有完全的 Unicode 相容性。這意味著你可以使用自己的母語（包括重音符號、特殊字元與非拉丁字母）記錄資料，並且這些資料將在 AdvantageScope 中正確記錄與顯示。

以下是使用繁體中文鍵名記錄字串的範例：

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SmartDashboard.putString("驅動/右馬達速度", "快");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("驅動/右馬達速度", "快");
```

</TabItem>
</Tabs>

:::tip 單位支援
有關傳遞單位中繼資料的更多詳細資訊，請參閱[單位支援](/tab-reference/line-graph/units)頁面。無論在 AdvantageScope 中選擇哪種語言，單位名稱都必須使用 SI 符號或英語（美式或英式拼寫）提供。
:::

## 開發 {#development}

AdvantageScope 的在地化是由人工智慧與社群協作共同推動的。由於 AdvantageScope 是一個快速發展的專案，使用 AI 對於保持翻譯後的應用程式與文件在所有語言中同步至關重要。這意味著無論你選擇哪種語言，新功能與更新始終同時可用。

為了確保最高品質的翻譯，我們的流程依賴於來自 FIRST 社群母語人士的豐富參考資料，為每種語言建立詳細的詞彙表與指南。這有助於翻譯符合在地隊伍所熟悉的特定詞彙、借詞與音譯。

基礎翻譯是在人類對關鍵選擇（例如 FIRST 專業術语翻譯）的監督下，使用 AI 迭代產生的。隨後，這些翻譯由 FIRST 社群的母語人士進行審查與潤色，以確保最終文字的準確性。使用者還可以透過點擊應用程式中的紫色圖示來提供有關翻譯的回饋（當設定為英語以外的任何語言時）。
