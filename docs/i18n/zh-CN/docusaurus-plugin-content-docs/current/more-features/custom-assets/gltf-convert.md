# 将 Onshape & STEP 文件转换为 glTF {#converting-onshape-and-step-files-to-gltf}

AdvantageScope 的 [👀 3D 场地](/tab-reference/3d-field) 接收用于场地和机器人的自定义模型，这些模型可以使用 [此处](/more-features/custom-assets) 描述的流程进行安装。所有模型都必须使用 [glTF](https://www.khronos.org/gltf/) 文件格式，选择该格式是因为它在存储和加载模型时具有较高的效率。请注意，AdvantageScope 使用二进制形式 (.glb)——它将所有资源包含在单个文件中，而不是纯 JSON 形式 (.gltf)。

## 将 Onshape 转换为 STEP {#converting-onshape-to-step}

虽然 Onshape 包含 glTF 的导出选项，但这通常会生成非常大且难以管理的拆分文件。相反，建议从 Onshape 导出为 STEP，然后按照下一节中的说明转换为 glTF。

1. 打开 Onshape 文件后，右键单击主装配体并选择 “Export...”：

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="选择“Export...”选项" />

2. 在选项弹出窗口中，确保导出格式为 “STEP”，然后点击 “Export”：

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="导出选项弹出窗口" />

3. 等待文件转换并下载。这可能需要几分钟时间。

## 将 STEP 转换为 glTF {#converting-step-to-gltf}

1. 下载 [CAD Assistant](https://www.opencascade.com/products/cad-assistant/)。这款免费的应用程序能够在多种 3D 格式之间进行转换，包括 STEP 和 glTF。

2. 打开 CAD Assistant 并选择要转换的 STEP 文件：

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="在 CAD Assistant 中打开 STEP 文件" />

3. 等待 STEP 文件导入。这可能需要几分钟时间。

4. 点击“保存”图标：

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="点击“保存”图标" />

5. 选择保存位置，然后使用下拉菜单将导出格式切换为 “glb”：

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="切换导出格式" />

6. 点击齿轮图标，然后启用 “Merge faces within the same part”（合并同一零件内的面）：

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="启用“Merge faces within the same part”" />

7. 点击“保存”图标并等待导出完成：

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="点击“保存”图标" />
