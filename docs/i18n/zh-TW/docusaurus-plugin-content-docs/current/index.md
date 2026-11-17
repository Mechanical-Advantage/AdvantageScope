---
sidebar_position: 1
title: 歡迎
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-ltr-light.webp" className="light-only" />
<img src="/img/banner-ltr-dark.webp" className="dark-only" />

AdvantageScope 是由 [6328 團隊](https://littletonrobotics.org) 為 FIRST 隊伍開發的機器人診斷、日誌檢視／分析與資料視覺化應用程式。它可以讀取 WPILOG、Hoot (CTRE)、REVLOG (REV Robotics)、Road Runner、CSV、NI DS log 和 RLOG 等格式的日誌檔案，並支援使用 NT4、Phoenix、RLOG 或 FTC Dashboard 串流即時查看機器人資料。AdvantageScope 適用於任何 WPILib 專案，同時也針對我們的 [AdvantageKit](https://docs.advantagekit.org) 日誌重播框架做了最佳化。請注意，**不一定要搭配 AdvantageKit 才能使用 AdvantageScope**。

<DocCardList
items={[
{
type: "category",
label: "概述",
href: "/category/overview"
},
{
type: "category",
label: "分頁參考",
href: "/category/tab-reference"
},
{
type: "category",
label: "更多功能",
href: "/category/more-features"
},
{
type: "link",
label: "世錦賽研討會",
href: "/overview/champs-conference"
}
]}
/>

AdvantageScope 包含以下工具：

- 各類彈性圖表與視覺化工具
- 以 2D 與 3D 場地視覺化呈現姿態資料，並支援自訂 CAD 機器人模型
- 可與另外載入的比賽影片同步播放
- 搖桿視覺化，可在自訂的控制器圖示上顯示駕駛員操作
- Swerve 驅動模組向量顯示
- 主控台訊息檢視
- 日誌統計分析
- 彈性的匯出選項，支援 CSV 與 WPILOG

<Button
label="前往下載"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

歡迎到 [issues 頁面](https://github.com/Mechanical-Advantage/AdvantageScope/issues)提供回饋、提出功能需求或回報 Bug。想了解如何參與 AdvantageScope 的開發貢獻，請參閱[貢獻頁面](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md)。若有不方便公開的詢問，請寄信至 software@team6328.org。

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />
