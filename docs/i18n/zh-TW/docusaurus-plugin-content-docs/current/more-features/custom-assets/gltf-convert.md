# 將 Onshape 與 STEP 檔案轉換為 glTF

AdvantageScope 的 3D 視圖接受用於場地與機器人的自訂模型，這些模型可以透過[此處](/more-features/custom-assets)描述的流程進行安裝。所有模型都必須使用 [glTF](https://www.khronos.org/gltf/) 檔案格式，選擇該格式是因為其在儲存與載入模型時的高效性。請注意，AdvantageScope 使用二進位形式 (.glb)，該形式在單一檔案中包含所有資源，而非純 JSON 形式 (.gltf)。

## 將 Onshape 轉換為 STEP

雖然 Onshape 包含 glTF 的匯出選項，但這通常會產生非常大且難以管理的檔案。相反地，建議從 Onshape 匯出為 STEP，然後按照下一節中的說明轉換為 glTF。

1. 開啟 Onshape 檔案後，按右鍵點擊主組件並選擇「Export...」：

<img src="/img/more-features/custom-assets/gltf-convert-1.png" alt="選擇「Export...」選項" />

2. 在選項快顯視窗中，確保匯出格式為「STEP」，然後點擊「Export」：

<img src="/img/more-features/custom-assets/gltf-convert-2.png" alt="匯出選項快顯視窗" />

3. 等待檔案轉換與下載。這可能需要幾分鐘的時間。

## 將 STEP 轉換為 glTF

1. 下載 [CAD Assistant](https://www.opencascade.com/products/cad-assistant/)。這款免費應用程式可以在許多 3D 格式之間進行轉換，包括 STEP 和 glTF。

2. 開啟 CAD Assistant 並選擇要轉換的 STEP 檔案：

<img src="/img/more-features/custom-assets/gltf-convert-3.png" alt="在 CAD Assistant 中開啟 STEP 檔案" />

3. 等待 STEP 檔案匯入。這可能需要幾分鐘的時間。

4. 點擊「儲存」圖示：

<img src="/img/more-features/custom-assets/gltf-convert-4.png" alt="點擊「儲存」圖示" />

5. 選擇儲存位置，然後使用下拉式選單將匯出格式切換為「glb」：

<img src="/img/more-features/custom-assets/gltf-convert-5.png" alt="切換匯出格式" />

6. 點擊齒輪圖示，然後啟用「Merge faces within the same part」：

<img src="/img/more-features/custom-assets/gltf-convert-6.png" alt="啟用「Merge faces within the same part」" />

7. 點擊「儲存」圖示並等待匯出完成：

<img src="/img/more-features/custom-assets/gltf-convert-7.png" alt="點擊「儲存」圖示" />
