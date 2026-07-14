# Conversión de archivos Onshape y STEP a glTF

La vista 3D de AdvantageScope acepta modelos personalizados para campos y robots, que se pueden instalar mediante el proceso descrito [aquí](/more-features/custom-assets). Todos los modelos deben usar el formato de archivo [glTF](https://www.khronos.org/gltf/), elegido por su eficiencia al almacenar y cargar modelos. Ten en cuenta que AdvantageScope usa la forma binaria (.glb), que incluye todos los recursos en un solo archivo, en lugar de la forma JSON pura (.gltf).

## Conversión de Onshape a STEP

Si bien Onshape incluye una opción de exportación para glTF, esto a menudo produce archivos muy grandes que son difíciles de manejar. En su lugar, se recomienda exportar desde Onshape a STEP, luego sigue las instrucciones de la siguiente sección para convertir a glTF.

1. Después de abrir el archivo de Onshape, haz clic derecho en el ensamblaje principal y elige "Exportar...":

<img src="/img/more-features/custom-assets/gltf-convert-1.png" alt="Selección de la opción &quot;Exportar...&quot;" />

2. En la ventana emergente de opciones, asegúrate de que el formato de exportación sea "STEP" y haz clic en "Exportar":

<img src="/img/more-features/custom-assets/gltf-convert-2.png" alt="Ventana emergente de opciones de exportación" />

3. Espera a que el archivo se convierta y se descargue. Esto puede tardar unos minutos.

## Conversión de STEP a glTF

1. Descarga [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Esta aplicación gratuita puede convertir entre muchos formatos 3D, incluidos STEP y glTF.

2. Abre CAD Assistant y selecciona el archivo STEP a convertir:

<img src="/img/more-features/custom-assets/gltf-convert-3.png" alt="Apertura del archivo STEP en CAD Assistant" />

3. Espera a que se importe el archivo STEP. Esto puede tardar unos minutos.

4. Haz clic en el ícono de "Guardar":

<img src="/img/more-features/custom-assets/gltf-convert-4.png" alt="Hacer clic en el ícono &quot;Guardar&quot;" />

5. Elige una ubicación para guardar, luego usa el menú desplegable para cambiar el formato de exportación a "glb":

<img src="/img/more-features/custom-assets/gltf-convert-5.png" alt="Cambiar el formato de exportación" />

6. Haz clic en el ícono del engranaje, luego habilita "Fusionar caras dentro de la misma pieza" (Merge faces within the same part):

<img src="/img/more-features/custom-assets/gltf-convert-6.png" alt="Habilitar &quot;Fusionar caras dentro de la misma pieza&quot;" />

7. Haz clic en el ícono de "Guardar" y espera a que finalice la exportación:

<img src="/img/more-features/custom-assets/gltf-convert-7.png" alt="Hacer clic en el ícono &quot;Guardar&quot;" />
