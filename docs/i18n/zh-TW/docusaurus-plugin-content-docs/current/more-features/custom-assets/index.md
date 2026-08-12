# ⚙️ 自訂資源 {#custom-assets}

AdvantageScope 使用一組預設的平面場地圖片、場地模型、機器人模型與搖桿設定。初次安裝中包含簡單資源（例如常青場地）。當 AdvantageScope 連線到網際網路時，會在背景自動下載詳細資源（例如特定賽季的場地）。要檢查這些下載的狀態，請點擊 `應用程式`/`AdvantageScope` > `資源下載狀態...`。

如果需要，可以自訂資源集以新增更多選項。要開啟使用者資源資料夾，請點擊 `應用程式`/`AdvantageScope` > `顯示資源資料夾`。資源的預期格式定義如下。請參閱預設的[詳細資源](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases)與[隨附資源](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets)作為參考。

:::tip
要從替代位置載入資源，請點擊 `應用程式`/`AdvantageScope` > `使用自訂資源資料夾`。選取的資料夾應為*父資料夾*，其中可以在單獨的子資料夾中放置多個資源。此功能允許自訂資源與機器人程式碼一起儲存在版本控制之下。
:::

## 通用格式 {#general-format}

所有資源都儲存在命名慣例為「TYPE_NAME」的資料夾中。資料夾使用的 NAME 不會由 AdvantageScope 顯示。可能的資源類型為：

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
範例資料夾名稱為「Field2d_2023Field」、「Joystick_OperatorButtons」或「Robot_Dozer」。
:::

此資料夾應包含名為「config.json」的檔案以及一個或多個資源檔案，如下所述。設定檔總是包含 AdvantageScope 要顯示的資源名稱。此名稱在每種資源類型中必須是唯一的。

```json
{
  "name": string // 唯一名稱，所有資源類型均需要
  ... // 依類型而定的設定，如下所述
}
```

## 3D 機器人模型 {#3d-robot-models}

### 影片教學 {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### 概述 {#overview}

資料夾中必須包含名為「model.glb」的模型。CAD 檔案必須轉換為 glTF；有關詳細資訊，請參閱[此頁面](gltf-convert)。設定檔必須採用以下格式：

```json
{
  "name": string // 唯一名稱，所有資源類型均需要
  "isFTC": boolean // 模型是否旨在用於 FTC 場地而非 FRC 場地（預設為 "false"）
  "disableSimplification": boolean // 是否停用模型簡化，選填
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉序列
  "position": [number, number, number] // 以公尺為單位的平移偏移，在旋轉後應用
  "cameras": [ // 固定攝影機位置，可為空
    {
      "name": string // 攝影機名稱
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉序列
      "position": [number, number, number] // 相對於機器人的公尺為單位的平移偏移，在旋轉後應用
      "resolution": [number, number] // 像素解析度，用於設定固定長寬比
      "fov": number // 水平視野（度）
    }
  ],
  "components": [...] // 請參閱「關節組件」
}
```

確定適當位置與旋轉數值最簡單的方法是反覆試驗。我們建議在位置之前調整旋轉，因為變換是按此順序應用的。

:::info
AdvantageScope 會自動簡化模型幾何形狀以提升效能，其中詳細程度取決於選取的[渲染模式](/tab-reference/3d-field#rendering-modes)。如果在自訂資源中模型簡化產生了不希望的效果，可以使用兩種解決方案：

- 要停用特定網格 (mesh) 的自動移除，請在網格名稱中包含字串 `NOSIMPLIFY`。
- 要停用整個機器人模型的模型簡化，請將設定中的 `disableSimplification` 選項設定為 `true`。

:::

### 關節組件 {#articulated-components}

:::warning
設定關節組件可能複雜且耗時。請考慮利用 AdvantageScope 的 3D [`Mechanism2d` 支援](/tab-reference/3d-field#2d-mechanisms)，它提供了一種更簡化的方法來**在 3D 場地上視覺化機構**。
:::

機器人模型可以包含用於視覺化機構資料的關節組件（有關詳細資訊，請參閱[此處](/tab-reference/3d-field)）。基礎 glTF 模型應不包含任何組件，然後每個組件應作為單獨的 glTF 模型匯出。組件模型遵循命名慣例「model_INDEX.glb」，因此第一個關節組件將是「model_0.glb」。

組件設定在機器人的設定檔中提供。應在「components」鍵下提供組件陣列。當使用者未在 AdvantageScope 中提供組件姿態時，組件模型將使用預設的機器人旋轉與位置（見上文）進行定位。當使用者提供組件姿態時，將改為應用「歸零」的旋轉與位置，以將每個組件帶到機器人原點。然後應用使用者的姿態將每個組件移動到機器人上的正確位置。

:::tip
當相對於機器人定位 3D 組件時，座標系的原點與機器人發布的姿態相匹配。請注意，此姿態通常使用零高度，即地面平面，而非機器人底板（對於典型的 2D 機器人運動）。
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉序列
    "zeroedPosition": [number, number, number] // 相對於機器人的公尺為單位的平移偏移，在旋轉後應用
  }
]
```

#### 設定流程 {#setup-process}

要校準關節組件的位置，我們建議採用以下流程：

1. 將基礎模型與組件在其正確的「預設」位置匯出。如果在 AdvantageScope 中未提供組件姿態，這就是它們應有的渲染方式。

2. 從機器人程式碼發布歸零的 2D 姿態，然後在 AdvantageScope 中將其選取為機器人姿態。切換到顯示場地原點的「Axes」3D 場地。

3. 調整機器人（而非組件）的全域旋轉，直到整個機器人定向正確。然後，調整全域位置以將整個機器人帶到原點。在此過程中，組件應始終以相同的預設位置進行渲染。

4. 從機器人程式碼發布與模型中組件數量相匹配的歸零 3D 姿態陣列，然後在 AdvantageScope 中將其選取為組件姿態集。

5. 調整每個組件的旋轉，然後是位置，直到它們對齊到原點。例如，手臂區段將與原點處的樞軸對齊，同時沿 X 軸向前指向。

6. 發布來自機器人程式碼的真實組件姿態，這些姿態將基於每個組件新定義的原點。例如，手臂區段的姿態將位於手臂關節處，指向區段的方向。

## 搖桿 {#joysticks}

資料夾中必須包含名為「image.webp」的圖片。設定檔必須採用以下格式：

```json
{
  "name": string // 唯一名稱，所有資源類型均需要
  "components": [...] // 組件設定陣列，見下文
}
```

:::info
按鈕、搖桿與軸值均支援 [SDL](https://www.libsdl.org) 綁定（由目前 FIRST Driver Station 使用）與 NI 綁定（由舊版 NI FRC Driver Station 使用）。每個組件必須至少提供一組綁定。

對於 NI 綁定，AdvantageScope 反向相容舊的無前綴設定鍵名（例如 `sourceIndex`）。**所有新搖桿都應使用明確的 SDL 綁定（例如 `sdlSourceIndex`），以相容目前的 FIRST Driver Station。**
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

資料夾中必須包含名為「image.webp」的圖片。方向應設定為紅方聯盟在左側。設定檔必須採用以下格式：

```json
{
  "name": string // 唯一名稱，所有資源類型均需要
  "isFTC": boolean // 這是否為 FTC 場地而非 FRC 場地
  "coordinateSystem": // 要使用的預設座標系（見下文）
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC 傳統
      "center-red"       // Systemcore
  "useGrid": boolean // 如果此場地是 FTC 場地，是否渲染格線（預設為 "true"）
  "sourceUrl": string // 原始檔案連結，選填
  "topLeft": [number, number] // 像素座標（原點在左上角）
  "bottomRight": [number, number] // 像素座標（原點在左上角）
  "widthInches": number // 場地的真實寬度（長邊）
  "heightInches": number // 場地的真實高度（短邊）
}
```

## 3D 場地模型 {#3d-field-models}

資料夾中必須包含名為「model.glb」的模型。應用所有旋轉後，場地方向應設定為紅方聯盟在左側。CAD 檔案必須轉換為 glTF；有關詳細資訊，請參閱[此頁面](gltf-convert)。遊戲物件模型根據其在「gamePieces」陣列中出現的順序，遵循命名慣例「model_INDEX.glb」。此處宣告的 AprilTag 總是使用[中心/紅方](/more-features/coordinate-systems#center-red)座標系進行定位，無論是否有任何其他設定選項。

設定檔必須採用以下格式：

```json
{
  "name": string // 唯一名稱，所有資源類型均需要
  "isFTC": boolean // 這是否為 FTC 場地而非 FRC 場地
  "coordinateSystem": // 要使用的預設座標系（見下文）
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC 傳統
      "center-red"       // Systemcore
  "useGrid": boolean // 如果此場地是 FTC 場地，是否渲染格線（預設為 "true"）
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉序列
  "widthInches": number // 場地的真實寬度（長邊）
  "heightInches": number // 場地的真實高度（短邊）
  "defaultOrigin": "auto" | "blue" | "red" // 預設原點位置，如果未指定則為 "auto"
  "driverStations": [
    [number, number] // 駕駛站位置（相對於場地中心的 X 與 Y 公尺數）
    ...              // 對於 FRC，包含 6 個元素按 [B1, B2, B3, R1, R2, R3] 排序。對於 FTC，包含 4 個元素按 [BL, BR, RL, RR] 排序。
  ]
  "gamePieces": [ // 遊戲物件類型清單
    {
      "name": string // 遊戲物件名稱
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉序列
      "position": [number, number, number] // 以公尺為單位的平移偏移，在旋轉後應用
      "stagedObjects": string[] // 預置遊戲物件的名稱，如果提供了使用者姿態則隱藏
    },
    ...
  ],
  "aprilTags": [ // 補充 AprilTag 模型清單（如果不屬於場地模型的一部分）
    "variant": string // 格式為 "FAMILY-SIZEin"，其中 "FAMILY" 為 "36h11" 或 "16h5"，"SIZE" 為黑色區域的長度
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // 沿 x、y 和 z 軸的旋轉序列
    "position": [number, number, number] // 以公尺為單位的平移偏移，在旋轉後應用
  ]
}
```
