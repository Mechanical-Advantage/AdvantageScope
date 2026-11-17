# ⚙️ 自訂資源 {#custom-assets}

AdvantageScope 內建一組預設的平面場地圖片、場地模型、機器人模型與搖桿設定。初次安裝時已包含基本資源（例如常青場地）；當 AdvantageScope 連上網際網路時，會在背景自動下載精細資源（例如特定賽季的場地）。若要檢查下載狀態，請點擊 `應用程式`/`AdvantageScope` > `資源下載狀態...`。

如有需要，你也可以自訂資源來擴充選項。點擊 `應用程式`/`AdvantageScope` > `顯示資源資料夾` 即可開啟使用者資源資料夾。以下說明各類資源的格式規範，你也可以參考預設的[精細資源](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases)與[內建隨附資源](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets)。

:::tip
若要從其他位置載入資源，請點擊 `應用程式`/`AdvantageScope` > `使用自訂資源資料夾`。選取的資料夾應作為*父資料夾*，底下可依需求建立多個獨立的子資料夾來存放不同資源。這樣一來，你就能將自訂資源與機器人程式碼一起納入版本控制。
:::

## 通用格式 {#general-format}

所有資源都必須存放在符合「TYPE_NAME」命名規則的資料夾中。資料夾名稱中的 NAME 不會顯示在 AdvantageScope 介面上。支援的資源類型如下：

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
範例資料夾名稱為「Field2d_2023Field」、「Joystick_OperatorButtons」或「Robot_Dozer」。
:::

資料夾內必須包含一個「config.json」設定檔以及一個或多個資源檔案（詳見下方說明）。設定檔中一定要有「name」欄位，用來指定 AdvantageScope 顯示的資源名稱，且同一資源類型下的名稱不可重複。此外，你也可以選擇性地加入「locales」物件，將語言代碼（例如「es-419」、「fr」、「zh-CN」）對應到翻譯後的名稱；若未提供目前所選語言的翻譯或省略「locales」，系統就會使用根層級的「name」作為預設名稱。

```json
{
  "name": string, // 唯一的預設名稱，所有資源類型皆為必填
  "locales": { [locale: string]: string } // 選填的本地化名稱，將語言代碼（例如 "es-419"、"fr"）對應到翻譯
  ... // 依類型而定的設定，詳見下文
}
```

## 3D 機器人模型 {#3d-robot-models}

### 影片教學 {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### 概述 {#overview}

資料夾內必須包含名為「model.glb」的模型檔案。CAD 檔案須先轉換為 glTF 格式，詳細步驟請參閱[此頁面](gltf-convert)。設定檔格式如下：

```json
{
  "name": string // 唯一名稱，所有資源類型皆為必填
  "locales": { [locale: string]: string } // 資源名稱的選填翻譯
  "isFTC": boolean // 模型是否用於 FTC 場地而非 FRC 場地（預設為 "false"）
  "disableSimplification": boolean // 是否停用模型簡化，選填
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉順序
  "position": [number, number, number] // 以公尺為單位的位置偏移，在旋轉後套用
  "cameras": [ // 固定攝影機位置，可為空陣列
    {
      "name": string // 攝影機名稱
      "locales": { [locale: string]: string } // 攝影機名稱的選填翻譯
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉順序
      "position": [number, number, number] // 相對於機器人的位置偏移（公尺），在旋轉後套用
      "resolution": [number, number] // 像素解析度，用於設定固定長寬比
      "fov": number // 水平視野（度）
    }
  ],
  "components": [...] // 請參閱「連桿組件」
}
```

要找出正確的位置與旋轉數值，最簡單的方法就是反覆測試。由於系統會先套用旋轉再套用平移，建議你先調整旋轉角度，再調整位置。

:::info
AdvantageScope 會自動簡化模型幾何結構以提升效能，細節程度取決於你選擇的[渲染模式](/tab-reference/3d-field#rendering-modes)。如果自動簡化讓自訂資源出現非預期的外觀問題，可以透過以下兩種方式處理：

- 若要停用特定網格 (mesh) 的自動簡化移除，請在該網格名稱中加入字串 `NOSIMPLIFY`。
- 若要停用整個機器人模型的簡化功能，請在設定檔中將 `disableSimplification` 設為 `true`。

:::

### 連桿組件 {#articulated-components}

:::warning
設定連桿組件可能相當繁瑣且耗時。建議優先考慮使用 AdvantageScope 的 3D [`Mechanism2d` 支援](/tab-reference/3d-field#2d-mechanisms)，這是在 **3D 場地上視覺化機構**更簡便的做法。
:::

機器人模型可以包含連桿組件，用來視覺化機構資料（詳情請參閱[此處](/tab-reference/3d-field)）。基礎 glTF 模型中不應包含任何組件，每個組件都必須單獨匯出成獨立的 glTF 檔案。組件模型須遵守「model_INDEX.glb」的命名規則，例如第一個連桿組件就是「model_0.glb」。

組件設定需寫在機器人的設定檔中，並於「components」鍵下提供組件陣列。如果使用者未在 AdvantageScope 中提供組件姿態，組件模型會套用機器人預設的旋轉與位置（見上文）。當使用者提供了組件姿態時，系統會改為先套用「歸零」(zeroed) 的旋轉與位置，將每個組件移回機器人原點，接著再套用使用者的姿態資料，把各組件移動到機器人上的正確位置。

:::tip
相對於機器人定位 3D 組件時，座標系的原點會與機器人發布的姿態對齊。請注意，這組姿態的高度通常為零（也就是地面平面），而非機器人底盤底板（適用於一般的 2D 機器人移動）。
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉順序
    "zeroedPosition": [number, number, number] // 相對於機器人的位置偏移（公尺），在旋轉後套用
  }
]
```

#### 設定流程 {#setup-process}

若要校準連桿組件的位置，建議按照以下步驟操作：

1. 以正確的「預設」位置匯出基礎模型與各個組件。如果在 AdvantageScope 中沒有提供組件姿態，這就是它們應該呈現的樣子。

2. 從機器人程式碼發布一組歸零的 2D 姿態，並在 AdvantageScope 中將它選為機器人姿態，同時將 3D 場地切換為會顯示場地原點的「座標軸」(Axes)。

3. 調整整個機器人（不是單獨調整組件）的全域旋轉角度，直到機器人朝向正確，接著調整全域位置，將整個機器人移至原點。在這整個過程中，各組件都應維持在原本的預設位置。

4. 從機器人程式碼發布一組數量與模型組件數相同的歸零 3D 姿態陣列，並在 AdvantageScope 中將其選為組件姿態。

5. 依序調整每個組件的旋轉角度與位置，直到它們都對齊原點。例如，手臂連桿應讓樞軸對齊原點，並沿著 X 軸朝前延伸。

6. 從機器人程式碼發布真實的組件姿態，這些姿態會以各組件剛定義好的新原點為基準。例如，手臂連桿的姿態會位於手臂關節處，並指向該連桿的方向。

## 搖桿 {#joysticks}

資料夾內必須包含名為「image.png」的圖片，設定檔格式如下：

```json
{
  "name": string // 唯一名稱，所有資源類型皆為必填
  "locales": { [locale: string]: string } // 資源名稱的選填翻譯
  "components": [...] // 組件設定陣列，詳見下文
}
```

:::info
按鈕、搖桿與軸數值同時支援 [SDL](https://www.libsdl.org) 綁定（目前 FIRST Driver Station 所使用）與 NI 綁定（舊版 NI FRC Driver Station 所使用）。每個組件至少必須提供一組綁定設定。

在 NI 綁定方面，AdvantageScope 向下相容舊版無前綴的設定鍵名（例如 `sourceIndex`）。**所有新增的搖桿設定都應明確使用 SDL 綁定（例如 `sdlSourceIndex`），以確保與目前的 FIRST Driver Station 相容。**
:::

### 單一按鈕 / POV 值 {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // 選填，可以是 "up"、"right"、"down" 或 "left"。如果提供，"sdlSourceIndex" 將是要讀取的 POV 索引。

  // NI Driver Station 的替代綁定 (選填)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### 雙軸搖桿 {#two-axis-joystick}

```json
{
  "type": "joystick" // 在二維方向上移動的搖桿
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // 未反轉：右 = 正數
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // 未反轉：上 = 正數
  "sdlButtonSourceIndex": number // 選填

  // NI Driver Station 的替代綁定 (選填)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### 單軸 {#single-axis}

```json
{
  "type": "axis" // 單軸數值
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // 最小值大於最大值以反轉

  // NI Driver Station 的替代綁定 (選填)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### 觸控板 {#touchpad}

```json
{
  "type": "touchpad" // 觸控板
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## 平面場地圖片 {#flat-field-images}

資料夾內必須包含名為「image.png」的圖片，且方向應讓紅方聯盟位於左側。設定檔格式如下：

```json
{
  "name": string // 唯一名稱，所有資源類型皆為必填
  "locales": { [locale: string]: string } // 資源名稱的選填翻譯
  "isFTC": boolean // 是否為 FTC 場地（而非 FRC 場地）
  "coordinateSystem": // 要使用的預設座標系（見下文）
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC 傳統
      "center-red"       // Systemcore
  "useGrid": boolean // 若為 FTC 場地，是否顯示格線（預設為 "true"）
  "sourceUrl": string // 原始檔案連結，選填
  "topLeft": [number, number] // 像素座標（原點在左上角）
  "bottomRight": [number, number] // 像素座標（原點在左上角）
  "widthInches": number // 場地的實際寬度（長邊）
  "heightInches": number // 場地的實際高度（短邊）
}
```

## 3D 場地模型 {#3d-field-models}

資料夾內必須包含名為「model.glb」的模型檔案。套用所有旋轉後，場地方向應讓紅方聯盟位於左側。CAD 檔案須先轉換為 glTF 格式，詳細步驟請參閱[此頁面](gltf-convert)。遊戲物件模型會依照在「gamePieces」陣列中的出現順序，遵守「model_INDEX.glb」的命名規則。不論其他設定選項為何，此處宣告的 AprilTag 一律使用[中心/紅方](/more-features/coordinate-systems#center-red)座標系來定位。

設定檔格式如下：

```json
{
  "name": string // 唯一名稱，所有資源類型皆為必填
  "locales": { [locale: string]: string } // 資源名稱的選填翻譯
  "isFTC": boolean // 是否為 FTC 場地（而非 FRC 場地）
  "coordinateSystem": // 要使用的預設座標系（見下文）
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC 傳統
      "center-red"       // Systemcore
  "useGrid": boolean // 若為 FTC 場地，是否顯示格線（預設為 "true"）
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉順序
  "widthInches": number // 場地的實際寬度（長邊）
  "heightInches": number // 場地的實際高度（短邊）
  "defaultOrigin": "auto" | "blue" | "red" // 預設原點位置，未指定時為 "auto"
  "driverStations": [
    [number, number] // 駕駛站位置（相對於場地中心的 X 與 Y 公尺數）
    ...              // FRC 包含 6 個元素，依 [B1, B2, B3, R1, R2, R3] 排序；FTC 包含 4 個元素，依 [BL, BR, RL, RR] 排序
  ]
  "gamePieces": [ // 遊戲物件類型清單
    {
      "name": string // 遊戲物件名稱
      "locales": { [locale: string]: string } // 遊戲物件名稱的選填翻譯
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉順序
      "position": [number, number, number] // 以公尺為單位的位置偏移，在旋轉後套用
      "stagedObjects": string[] // 預置遊戲物件的名稱，當使用者提供姿態時將隱藏這些物件
    },
    ...
  ],
  "aprilTags": [ // 補充的 AprilTag 模型清單（若未包含於場地模型中）
    "variant": string // 格式為 "FAMILY-SIZEin"，其中 "FAMILY" 為 "36h11" 或 "16h5"，"SIZE" 為黑色區域的邊長
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉順序
    "position": [number, number, number] // 以公尺為單位的位置偏移，在旋轉後套用
  ]
}
```
