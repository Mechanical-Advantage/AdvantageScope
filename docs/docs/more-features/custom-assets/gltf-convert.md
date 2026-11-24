# Converting Onshape & STEP Files to glTF {#converting-onshape-and-step-files-to-gltf}

AdvantageScope's 3D view accepts custom models for fields and robots, which can be installed using the process described [here](/more-features/custom-assets). All models must use the binary [glTF](https://www.khronos.org/gltf/) file format (`.glb`), chosen for its small file sizes and fast loading performance.

:::info
glTF files come in two formats: JSON (`.gltf`) and binary (`.glb`). AdvantageScope requires the binary **`.glb`** format, which bundles all model data into a single file.
:::

## Converting Onshape to STEP {#converting-onshape-to-step}

While Onshape includes an export option for glTF, this often produces very large files that are difficult to manage. Instead, it is recommended to export from Onshape to STEP, then follow the instructions in the next section to convert to binary glTF (`.glb`).

1. After opening the Onshape file, right-click on the main assembly and choose "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selecting the &quot;Export...&quot; option" />

2. In the options pop-up, ensure that the export format is "STEP" and click "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Export options pop-up" />

3. Wait for the file to convert and download. This may take a few minutes.

## Converting STEP to glTF (.glb) {#converting-step-to-gltf}

1. Download [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). This free application is able to convert between many 3D formats, including STEP and glTF (`.glb`).

2. Open CAD Assistant and select the STEP file to convert:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Opening STEP file in CAD Assistant" />

3. Wait for the STEP file to import. This may take a few minutes.

4. Click the "Save" icon:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clicking the &quot;Save&quot; icon" />

5. Choose a save location, then use the drop-down to switch the export format to "glb" (binary glTF):

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Switching the export format" />

6. Click the gear icon, then enable "Merge faces within the same part":

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Enabling &quot;Merge faces within the same part&quot;" />

7. Click the "Save" icon and wait for the export to finish:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clicking the &quot;Save&quot; icon" />

Once exported, rename the `.glb` file (such as `model.glb`) and add it to your custom asset folder as described on the [Custom Assets](/more-features/custom-assets) page.
