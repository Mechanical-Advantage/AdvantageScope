# Conversión de archivos Onshape y STEP a glTF {#converting-onshape-and-step-files-to-gltf}

En la vista 3D de AdvantageScope puedes cargar modelos personalizados de campos y robots siguiendo el proceso descrito [aquí](/more-features/custom-assets). Todos los modelos deben estar en formato [glTF](https://www.khronos.org/gltf/), elegido por su eficiencia al guardar y cargar gráficos 3D. Ten en cuenta que AdvantageScope usa la versión binaria (`.glb`), que agrupa todos los recursos en un solo archivo, en lugar del formato JSON puro (`.gltf`).

## Conversión de Onshape a STEP {#converting-onshape-to-step}

Aunque Onshape tiene una opción para exportar directo a glTF, suele generar archivos enormes y difíciles de manejar. Por eso, conviene exportar primero a STEP desde Onshape y luego convertir ese archivo a glTF con los pasos de la siguiente sección.

1. Abre tu archivo en Onshape, haz clic derecho sobre el ensamblaje principal y elige "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selección de la opción &quot;Export...&quot;" />

2. En la ventana de opciones, asegúrate de que el formato sea "STEP" y haz clic en "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Ventana emergente de opciones de exportación" />

3. Espera a que el archivo se convierta y se descargue; puede tardar unos minutos.

## Conversión de STEP a glTF {#converting-step-to-gltf}

1. Descarga [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Esta aplicación gratuita convierte entre muchos formatos 3D, incluidos STEP y glTF.

2. Abre CAD Assistant y selecciona el archivo STEP que quieres convertir:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Apertura de archivo STEP en CAD Assistant" />

3. Espera a que termine de importarse; puede tomar unos minutos.

4. Haz clic en el ícono de guardar ("Save"):

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clic en el ícono &quot;Save&quot;" />

5. Elige dónde guardar el archivo y cambia el formato de exportación a "glb" en el menú desplegable:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Cambio del formato de exportación" />

6. Haz clic en el ícono del engranaje y activa "Merge faces within the same part":

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Habilitación de &quot;Merge faces within the same part&quot;" />

7. Haz clic en el ícono de guardar ("Save") y espera a que termine la exportación:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clic en el ícono &quot;Save&quot;" />
