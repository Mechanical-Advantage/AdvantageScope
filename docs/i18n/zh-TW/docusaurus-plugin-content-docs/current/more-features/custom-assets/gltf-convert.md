# 將 Onshape 與 STEP 檔案轉換為 glTF {#converting-onshape-and-step-files-to-gltf}

AdvantageScope 的 3D 視圖支援自訂場地與機器人模型，安裝方式請參考[自訂資源](/more-features/custom-assets)頁面。所有模型都必須採用二進位 [glTF](https://www.khronos.org/gltf/) 格式（`.glb`），其檔案體積小且載入速度快。

:::info
glTF 檔案有兩種格式：JSON（`.gltf`）與二進位（`.glb`）。AdvantageScope 需要二進位 **`.glb`** 格式，它會將所有模型資料打包在單一檔案中。
:::

## 將 Onshape 轉換為 STEP {#converting-onshape-to-step}

雖然 Onshape 內建匯出 glTF 的選項，但產生的檔案通常非常龐大且難以處理。因此，建議先從 Onshape 匯出為 STEP 檔案，再依照下一節的步驟轉換為二進位 glTF（`.glb`）。

1. 開啟 Onshape 檔案後，在主組件上按右鍵並選擇「Export...」：

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="選擇「Export...」選項" />

2. 在彈出的選項視窗中，確認匯出格式為「STEP」，然後點擊「Export」：

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="匯出選項彈出視窗" />

3. 等待檔案轉換並下載，這可能需要幾分鐘。

## 將 STEP 轉換為 glTF (.glb) {#converting-step-to-gltf}

1. 下載 [CAD Assistant](https://www.opencascade.com/products/cad-assistant/)。這款免費軟體支援多種 3D 格式之間的轉換，包含 STEP 與 glTF（`.glb`）。

2. 開啟 CAD Assistant 並選擇要轉換的 STEP 檔案：

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="在 CAD Assistant 中開啟 STEP 檔案" />

3. 等待 STEP 檔案匯入，這可能需要幾分鐘。

4. 點擊「儲存」圖示：

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="點擊「儲存」圖示" />

5. 選擇儲存位置，接著從下拉式選單將匯出格式切換為「glb」（二進位 glTF）：

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="切換匯出格式" />

6. 點擊齒輪圖示，然後啟用「Merge faces within the same part」：

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="啟用「Merge faces within the same part」" />

7. 點擊「儲存」圖示並等待匯出完成：

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="點擊「儲存」圖示" />

匯出完成後，請將 `.glb` 檔案重新命名（例如 `model.glb`），並依照[自訂資源](/more-features/custom-assets)頁面的說明將其加入您的自訂資源資料夾。
