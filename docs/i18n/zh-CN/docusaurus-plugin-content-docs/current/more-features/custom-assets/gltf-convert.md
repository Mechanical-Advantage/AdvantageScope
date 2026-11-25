# 将 Onshape 与 STEP 文件转换为 glTF {#converting-onshape-and-step-files-to-gltf}

AdvantageScope 的 [👀 3D 场地](/tab-reference/3d-field) 视图支持导入自定义的场地和机器人模型，具体安装步骤可参考 [自定义资源指南](/more-features/custom-assets)。所有模型都必须使用二进制 [glTF](https://www.khronos.org/gltf/) 文件格式（`.glb`），该格式文件体积小、加载速度快。

:::info
glTF 文件有两种格式：JSON（`.gltf`）和二进制（`.glb`）。AdvantageScope 需要二进制 **`.glb`** 格式，它会将所有模型数据打包在单个文件中。
:::

## 将 Onshape 转换为 STEP {#converting-onshape-to-step}

虽然 Onshape 自带 glTF 导出选项，但导出的文件往往体积庞大，管理起来很不方便。因此我们建议你先从 Onshape 导出为 STEP 格式，再按照下一节的步骤将其转换为二进制 glTF（`.glb`）。

1. 打开 Onshape 文件后，右键点击主装配体并选择“Export...”：

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="选择“Export...”选项" />

2. 在弹出的选项窗口中，确认导出格式为“STEP”，然后点击“Export”：

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="导出选项弹出窗口" />

3. 等待文件转换并下载完成，这可能需要几分钟时间。

## 将 STEP 转换为 glTF (.glb) {#converting-step-to-gltf}

1. 下载 [CAD Assistant](https://www.opencascade.com/products/cad-assistant/)。这是一款免费软件，支持在多种 3D 格式（包括 STEP 和 glTF（`.glb`））之间互相转换。

2. 打开 CAD Assistant，选择要转换的 STEP 文件：

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="在 CAD Assistant 中打开 STEP 文件" />

3. 等待 STEP 文件导入完成，这可能需要几分钟时间。

4. 点击“保存”图标：

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="点击“保存”图标" />

5. 选择保存位置，然后通过下拉菜单将导出格式切换为“glb”（二进制 glTF）：

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="切换导出格式" />

6. 点击齿轮图标，启用“Merge faces within the same part”（合并同一零件内的面）：

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="启用“Merge faces within the same part”" />

7. 点击“保存”图标并等待导出完成：

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="点击“保存”图标" />

导出完成后，将 `.glb` 文件重命名（例如 `model.glb`），并按照 [自定义资源](/more-features/custom-assets) 页面中的说明将其添加到你的自定义资源文件夹中。
