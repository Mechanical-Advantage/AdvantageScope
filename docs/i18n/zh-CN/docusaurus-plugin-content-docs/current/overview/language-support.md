---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 语言支持 {#language-support}

AdvantageScope 支持多种语言，为全球队伍提供本地化体验。目前支持以下语言：

- 英语（美国）
- 西班牙语（拉丁美洲）
- 法语
- 葡萄牙语（巴西）
- 土耳其语
- 罗马尼亚语
- 希伯来语
- 哈萨克语
- 俄语
- 阿拉伯语
- 简体中文
- 繁体中文

## 配置 {#configuration}

要在 AdvantageScope 中更改显示语言，请点击 `App` > `显示偏好设置...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开偏好设置窗口。在“语言”设置下，你可以从受支持的语言列表中进行选择，或选择“系统默认”以自动匹配操作系统的语言。

<img src="/img/prefs_zh-CN.webp" alt="偏好设置图解" height="450" />

## 日志键名 {#logging-keys}

AdvantageScope 支持的所有格式在定义日志键名时均具有完全的 Unicode 兼容性。这意味着你可以使用自己的母语（包括重音符号、特殊字符和非拉丁字母）记录数据，并且这些数据将在 AdvantageScope 中正确记录和显示。

以下是使用简体中文键名记录字符串的示例：

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SmartDashboard.putString("驱动/右电机速度", "快");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("驱动/右电机速度", "快");
```

</TabItem>
</Tabs>

:::tip 单位支持
有关传递单位元数据的更多详细信息，请参阅 [单位支持](/tab-reference/line-graph/units) 页面。无论在 AdvantageScope 中选择了什么语言，单位名称都必须使用国际单位制 (SI) 符号或英语（美式或英式拼写）提供。
:::

## 开发 {#development}

AdvantageScope 的本地化是由人工智能与社区协作共同推动的。由于 AdvantageScope 是一个快速发展的项目，使用 AI 对于保持翻译后的应用程序和文档在所有语言中同步至关重要。这意味着无论你选择哪种语言，新功能和更新始终同时可用。

为了确保最高质量的翻译，我们的流程依赖于来自 FIRST 社区母语人士的丰富参考资料，为每种语言构建详细的词汇表和指南。这有助于翻译契合本地队伍所熟悉的特定词汇、借词和音译。

基础翻译是在人类对关键选择（例如 FIRST 专业术语翻译）的监督下，使用 AI 迭代生成的。随后，这些翻译由 FIRST 社区的母语人士进行审查和润色，以确保最终文本的准确性。用户还可以通过点击应用程序中的紫色图标来提供有关翻译的反馈（当设置为英语以外的任何语言时）。
