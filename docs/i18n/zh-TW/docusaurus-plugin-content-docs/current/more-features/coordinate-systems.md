---
sidebar_position: 3
---

# 📐 座標系 {#coordinate-systems}

AdvantageScope 在 [🗺️ 2D 場地](/tab-reference/2d-field) 與 [👀 3D 場地](/tab-reference/3d-field) 分頁上支援數種常見的座標系。有關 AdvantageScope 使用的軸與旋轉慣例的更多資訊，請參閱 [WPILib 座標系文件](https://docs.wpilib.org/zh-cn/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system)。

### 自訂 {#customization}

預設情況下，會根據選取的場地圖片/模型自動選擇座標系。要選擇不同的座標系以用於所有場地，請點擊 `應用程式` > `顯示偏好設定...` (Windows/Linux) 或 `AdvantageScope` > `設定...` (macOS) 開啟偏好設定視窗，並變更「座標系」選項。

:::tip
所有座標系選項均與 FRC 和 FTC 場地相容。
:::

## 中心/紅方 (Systemcore) {#center-red}

原點位於場地中心，+X 軸背對紅方聯盟牆，如下圖所示。**這是自 2027 年起的 FRC 場地與自 2027-2028 年起的 FTC 場地的預設座標系。**

<img src="/img/more-features/coordinate-system-center-red.png" alt="中心/紅方座標系" />

## 藍方牆 {#blue-wall}

原點位於藍方聯盟牆的最右角，+X 軸面向紅方聯盟牆，如下圖所示。**這是 2023 年至 2026 年 FRC 場地的預設座標系。**

<img src="/img/more-features/coordinate-system-blue-wall.png" alt="藍方牆座標系" />

## 聯盟牆 {#alliance-wall}

原點位於*機器人目前聯盟*的聯盟牆最右角，+X 軸面向對面聯盟牆，如下圖所示。**這是 2022 年 FRC 的預設座標系。**

<img src="/img/more-features/coordinate-system-alliance-wall.png" alt="聯盟牆座標系" />

## 中心/旋轉 {#center-rotated}

原點位於場地中心，從紅方聯盟牆的視角來看，+X 軸面向右側，如下圖所示。**這是 2024-2025 年至 2026-2027 年 FTC 場地的預設座標系。**

<img src="/img/more-features/coordinate-system-center-rotated.png" alt="中心/旋轉座標系" height="400" />
