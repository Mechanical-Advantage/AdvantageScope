---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 语言支持 {#language-support}

AdvantageScope 支持多种语言，旨在为全球队伍提供本地化体验。目前，AdvantageScope 文档、桌面应用、移动应用（AdvantageScope XR 和 AdvantageTune）以及 AdvantageScope Lite（运行于 Systemcore 及 FIRST Driver Station 中）均已支持以下语言：

- 英语（美国）
- 西班牙语（拉丁美洲）
- 法语
- 荷兰语
- 葡萄牙语（巴西）
- 罗马尼亚语
- 土耳其语
- 俄语
- 哈萨克语
- 希伯来语
- 阿拉伯语
- 印地语
- 简体中文
- 繁体中文

## 配置 {#configuration}

如需更改 AdvantageScope 的界面语言，请点击 `应用程序` > `显示首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口。在“语言”选项中，你可以选择任意受支持的语言，或选择“系统默认”以自动跟随系统语言。

<img src="/img/prefs_zh-CN.webp" alt="首选项图解" height="450" />

## 日志键名 {#logging-keys}

AdvantageScope 支持的所有日志格式均完整兼容 Unicode 键名。也就是说，你可以直接用自己熟悉的语言（包括重音符号、特殊字符和非拉丁文字）记录数据，AdvantageScope 都能正常解析并显示。

以下是使用简体中文键名记录字符串的示例：

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("驱动/右电机速度", "快");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("驱动/右电机速度", "快");
```

</TabItem>
</Tabs>

:::tip 单位支持
关于如何传入单位元数据，详情请参阅 [单位支持](/tab-reference/line-graph/units) 页面。无论你在 AdvantageScope 中选择了哪种界面语言，单位名称都必须使用国际单位制 (SI) 符号或英语（美式或英式拼写）。
:::

## 开发 {#development}

AdvantageScope 的本地化工作由人工智能与社区协作共同完成。由于 AdvantageScope 迭代迅速，借助 AI 对于让所有语言的应用界面和文档保持同步至关重要。这样一来，无论你选择哪种语言，都能第一时间用上新功能与更新。

我们的本地化流程会尽量贴合各地队伍熟悉的专业词汇、借词和译法，但 AI 翻译仍可能出现生硬或不准确之处。欢迎随时向我们反馈：在应用中选择英语以外的任意语言时，点击标题栏中的紫色图标即可提交翻译意见。
