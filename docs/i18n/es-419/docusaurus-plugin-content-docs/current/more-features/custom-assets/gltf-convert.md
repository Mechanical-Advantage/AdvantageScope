# Conversión de archivos Onshape y STEP a glTF {#converting-onshape-and-step-files-to-gltf}

En la vista 3D de AdvantageScope puedes cargar modelos personalizados de campos y robots siguiendo el proceso descrito [aquí](/more-features/custom-assets). Todos los modelos deben usar el formato binario de [glTF](https://www.khronos.org/gltf/) (`.glb`), elegido por el tamaño reducido de sus archivos y su carga rápida.

:::info
Los archivos glTF existen en dos formatos: JSON (`.gltf`) y binario (`.glb`). AdvantageScope requiere el formato binario **`.glb`**, que agrupa todos los datos del modelo en un solo archivo.
:::

## Conversión de Onshape a STEP {#converting-onshape-to-step}

Aunque Onshape tiene una opción para exportar directo a glTF, suele generar archivos enormes y difíciles de manejar. Por eso, conviene exportar primero a STEP desde Onshape y luego convertir ese archivo a glTF binario (`.glb`) con los pasos de la siguiente sección.

1. Abre tu archivo en Onshape, haz clic derecho sobre el ensamblaje principal y elige "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selección de la opción &quot;Export...&quot;" />

2. En la ventana de opciones, asegúrate de que el formato sea "STEP" y haz clic en "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Ventana emergente de opciones de exportación" />

3. Espera a que el archivo se convierta y se descargue; puede tardar unos minutos.

## Conversión de STEP a glTF (.glb) {#converting-step-to-gltf}

1. Descarga [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Esta aplicación gratuita convierte entre muchos formatos 3D, incluidos STEP y glTF (`.glb`).

2. Abre CAD Assistant y selecciona el archivo STEP que quieres convertir:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Apertura de archivo STEP en CAD Assistant" />

3. Espera a que termine de importarse; puede tomar unos minutos.

4. Haz clic en el ícono de guardar ("Save"):

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clic en el ícono &quot;Save&quot;" />

5. Elige dónde guardar el archivo y cambia el formato de exportación a "glb" (glTF binario) en el menú desplegable:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Cambio del formato de exportación" />

6. Haz clic en el ícono del engranaje y activa "Merge faces within the same part":

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Habilitación de &quot;Merge faces within the same part&quot;" />

7. Haz clic en el ícono de guardar ("Save") y espera a que termine la exportación:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clic en el ícono &quot;Save&quot;" />

Una vez exportado, renombra el archivo `.glb` (por ejemplo, `model.glb`) y agrégalo a tu carpeta de recursos personalizados tal como se explica en la página de [Recursos personalizados](/more-features/custom-assets).
