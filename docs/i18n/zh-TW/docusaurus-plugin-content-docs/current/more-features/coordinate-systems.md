---
sidebar_position: 4
---

# 📐 座標系 {#coordinate-systems}

AdvantageScope 的 [🗺️ 2D 場地](/tab-reference/2d-field) 與 [👀 3D 場地](/tab-reference/3d-field) 分頁支援多種常見的座標系。如果想深入了解 AdvantageScope 所採用的座標軸與旋轉慣例，請參閱 [WPILib 座標系文件](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system)。

### 自訂 {#customization}

預設情況下，系統會根據選取的場地圖片或模型自動決定座標系。如果你想在所有場地套用其他座標系，請點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗，並修改「座標系」選項。

:::tip
所有座標系選項都同時相容於 FRC 與 FTC 場地。
:::

## 中心/紅方 (Systemcore) {#center-red}

原點位於場地中心，+X 軸背對紅方聯盟牆，如下圖所示。**這是 2027 年起 FRC 場地以及 2027-2028 賽季起 FTC 場地的預設座標系。**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="中心/紅方座標系" />

## 藍方牆 {#blue-wall}

原點位於藍方聯盟牆的最右角，+X 軸面向紅方聯盟牆，如下圖所示。**這是 2023 年至 2026 年 FRC 場地的預設座標系。**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="藍方牆座標系" />

## 聯盟牆 {#alliance-wall}

原點位於*機器人目前聯盟*的聯盟牆最右角，+X 軸面向對面聯盟牆，如下圖所示。**這是 2022 年 FRC 的預設座標系。**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="聯盟牆座標系" />

## 中心/旋轉 {#center-rotated}

原點位於場地中心，以紅方聯盟牆的視角來看，+X 軸面向右側，如下圖所示。**這是 2024-2025 至 2026-2027 賽季 FTC 場地的預設座標系。**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="中心/旋轉座標系" height="400" />
