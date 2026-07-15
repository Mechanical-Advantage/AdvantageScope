# ⚙️ Recursos personalizados

AdvantageScope usa un conjunto predeterminado de imágenes planas de campo, modelos de campo, modelos de robot y configuraciones de joysticks. Los recursos simples (por ejemplo, los campos de hoja perenne) se incluyen en la instalación inicial. Los recursos detallados (por ejemplo, campos específicos de la temporada) se descargan automáticamente en segundo plano cuando AdvantageScope está conectado a Internet. Para verificar el estado de estas descargas, haz clic en `Aplicación`/`AdvantageScope` > `Estado de descarga de recursos...`. El conjunto de recursos se puede personalizar para agregar más opciones si se desea. Para abrir la carpeta de recursos del usuario, haz clic en `Aplicación`/`AdvantageScope` > `Mostrar carpeta de recursos`. Los formatos esperados para los recursos se definen a continuación. Consulta el conjunto predeterminado de [recursos detallados](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) y [recursos agrupados](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) como referencia.

:::tip
Para cargar recursos desde una ubicación alternativa, haz clic en `Aplicación`/`AdvantageScope` > `Usar carpeta de recursos personalizada`. La carpeta seleccionada debe ser la _carpeta principal_ donde se podrían colocar múltiples recursos en subcarpetas separadas. Esta función permite almacenar recursos personalizados bajo control de versiones junto con el código del robot.
:::

## Formato general

Todos los recursos se almacenan en carpetas con la convención de nomenclatura "TIPO_NOMBRE". El NOMBRE utilizado para la carpeta no es mostrado por AdvantageScope. Los posibles tipos de recursos son:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Ejemplos de nombres de carpetas serían "Field2d_2023Field", "Joystick_OperatorButtons" o "Robot_Dozer".
:::

Esta carpeta debe contener un archivo llamado "config.json" y uno o más archivos de recursos, como se describe a continuación. El archivo de configuración siempre incluye el nombre del recurso que AdvantageScope mostrará. Este nombre debe ser único para cada tipo de recurso.

```json
{
  "name": string // Nombre único, requerido para todos los tipos de recursos
  ... // Configuración dependiente del tipo, descrita a continuación
}
```

## Modelos de robots 3D

### Tutorial en video

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Descripción general

Se debe incluir un modelo en la carpeta con el nombre "model.glb". Los archivos CAD deben convertirse a glTF; consulta [esta página](gltf-convert) para obtener más detalles. El archivo de configuración debe tener el siguiente formato:

```json
{
  "name": string // Nombre único, requerido para todos los tipos de recursos
  "isFTC": boolean // Si el modelo está destinado a usarse en campos de FTC en lugar de campos de FRC (predeterminado "false")
  "disableSimplification": boolean // Si se debe deshabilitar la simplificación del modelo, opcional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones a lo largo de los ejes x, y, y z
  "position": [number, number, number] // Desplazamiento de posición en metros, aplicado después de la rotación
  "cameras": [ // Posiciones fijas de la cámara, puede estar vacío
    {
      "name": string // Nombre de la cámara
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones a lo largo de los ejes x, y, y z
      "position": [number, number, number] // Desplazamiento de posición en metros relativo al robot, aplicado después de la rotación
      "resolution": [number, number] // Resolución en píxeles, utilizada para establecer la relación de aspecto fija
      "fov": number // Campo de visión horizontal en grados
    }
  ],
  "components": [...] // Consulta "Componentes articulados"
}
```

La forma más sencilla de determinar los valores de posición y rotación adecuados es por ensayo y error. Recomendamos ajustar la rotación antes que la posición, ya que las transformaciones se aplican en este orden.

:::info
AdvantageScope simplifica la geometría del modelo automáticamente para mejorar el rendimiento, donde el nivel de detalle depende del [modo de renderizado](/tab-reference/3d-field#rendering-modes) seleccionado. En los casos en que la simplificación del modelo produce efectos no deseados con recursos personalizados, se pueden usar dos soluciones:

- Para deshabilitar la eliminación automática de una malla en particular, incluye la cadena `NOSIMPLIFY` en el nombre de la malla.
- Para deshabilitar la simplificación del modelo para todo un modelo de robot, establece la opción `disableSimplification` en la configuración a `true`.

:::

### Componentes articulados

:::warning
Configurar componentes articulados puede ser complejo y llevar mucho tiempo. Considera utilizar el soporte 3D [`Mechanism2d`](/tab-reference/3d-field#2d-mechanisms) de AdvantageScope, que ofrece un enfoque más simplificado para **visualizar mecanismos en el campo 3D**.
:::

Los modelos de robots pueden contener componentes articulados para visualizar datos de mecanismos (consulta [aquí](/tab-reference/3d-field) para obtener detalles). El modelo glTF base no debe incluir componentes, y luego cada componente debe exportarse como un modelo glTF separado. Los modelos de componentes siguen la convención de nomenclatura "model_INDEX.glb", por lo que el primer componente articulado sería "model_0.glb"

La configuración del componente se proporciona en el archivo de configuración del robot. Se debe proporcionar un arreglo de componentes bajo la clave "components". Cuando el usuario no proporciona poses de componentes en AdvantageScope, los modelos de componentes se posicionarán utilizando las rotaciones y la posición predeterminadas del robot (ver arriba). Cuando el usuario proporciona poses de componentes, se aplican las rotaciones y la posición "puestas a cero" para llevar cada componente al origen del robot. Luego, se aplican las poses del usuario para mover cada componente a la ubicación correcta en el robot.

:::tip
Al colocar componentes 3D relativos al robot, el origen del sistema de coordenadas coincide con la pose publicada del robot. Ten en cuenta que esta pose generalmente usa una altura de cero, que es el plano del piso y NO la placa base del robot (para el movimiento típico del robot 2D).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones a lo largo de los ejes x, y, y z
    "zeroedPosition": [number, number, number] // Desplazamiento de posición en metros relativo al robot, aplicado después de la rotación
  }
]
```

#### Proceso de configuración

Para calibrar las posiciones de los componentes articulados, recomendamos el siguiente proceso:

1. Exporta el modelo base y los componentes en sus posiciones "predeterminadas" correctas. Así es como deben renderizarse si no se proporcionan poses de componentes en AdvantageScope.
2. Publica una pose 2D puesta a cero desde el código del robot, luego selecciónala como la pose del robot en AdvantageScope. Cambia al campo 3D "Ejes", que muestra el origen del campo.
3. Ajusta las rotaciones generales del robot (no de los componentes) hasta que el robot completo esté orientado correctamente. Luego, ajusta la posición general para llevar el robot completo al origen. Los componentes deben renderizarse en las mismas posiciones predeterminadas durante todo este proceso.
4. Publica un arreglo de poses 3D puestas a cero desde el código del robot que coincida con la cantidad de componentes en el modelo, luego selecciónalo como el conjunto de poses de componentes en AdvantageScope.
5. Ajusta las rotaciones, seguidas de las posiciones, para cada componente hasta que estén alineados con el origen. Por ejemplo, un segmento de brazo se alinearía con el pivote en el origen mientras apunta hacia adelante a lo largo del eje X.
6. Publica las poses de los componentes reales desde el código del robot, que se basarán en los orígenes recién definidos para cada componente. Por ejemplo, la pose para un segmento de brazo se colocaría en la articulación del brazo apuntando en la dirección del segmento.

## Joysticks

Se debe incluir una imagen en la carpeta con el nombre "image.png". El archivo de configuración debe tener el siguiente formato:

```json
{
  "name": string // Nombre único, requerido para todos los tipos de recursos
  "components": [...] // Arreglo de configuraciones de componentes, ver a continuación
}
```

:::info
Los botones, joysticks y valores de los ejes son compatibles tanto con las vinculaciones de [SDL](https://www.libsdl.org) (usadas por la FIRST Driver Station actual) como con las vinculaciones de NI (usadas por la antigua NI FRC Driver Station). Se debe proporcionar al menos un conjunto de vinculaciones para cada componente. Para las vinculaciones de NI, AdvantageScope es compatible con versiones anteriores de las claves de configuración antiguas sin prefijo (por ejemplo, `sourceIndex`). **Todos los nuevos joysticks deben usar vinculaciones SDL explícitas (por ejemplo, `sdlSourceIndex`) para compatibilidad con la FIRST Driver Station actual.**
:::

### Un solo botón / valor de POV

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // Opcional, puede ser "up", "right", "down", o "left". Si se proporciona, "sdlSourceIndex" será el índice del POV a leer.

  // Vinculaciones alternativas para la NI Driver Station (opcional)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### Joystick de dos ejes

```json
{
  "type": "joystick" // Un joystick que se mueve en dos dimensiones
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // No invertido: derecha = positivo
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // No invertido: arriba = positivo
  "sdlButtonSourceIndex": number // Opcional

  // Vinculaciones alternativas para la NI Driver Station (opcional)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### Un solo eje

```json
{
  "type": "axis" // Un valor de un solo eje
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Mínimo mayor que máximo para invertir

  // Vinculaciones alternativas para la NI Driver Station (opcional)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### Panel táctil

```json
{
  "type": "touchpad" // Un panel táctil
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## Imágenes planas del campo

Se debe incluir una imagen en la carpeta con el nombre "image.png". Debe orientarse con la alianza roja a la izquierda. El archivo de configuración debe tener el siguiente formato:

```json
{
  "name": string // Nombre único, requerido para todos los tipos de recursos
  "isFTC": boolean // Si este es un campo de FTC en lugar de un campo de FRC
  "coordinateSystem": // El sistema de coordenadas predeterminado a utilizar (ver a continuación)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC tradicional
      "center-red"       // Systemcore
  "useGrid": boolean // Si se deben renderizar líneas de cuadrícula si este campo es uno de FTC (predeterminado "true")
  "sourceUrl": string // Enlace al archivo original, opcional
  "topLeft": [number, number] // Coordenada de píxel (origen en la parte superior izquierda)
  "bottomRight": [number, number] // Coordenada de píxel (origen en la parte superior izquierda)
  "widthInches": number // Ancho real del campo (lado largo)
  "heightInches": number // Altura real del campo (lado corto)
}
```

## Modelos de campos 3D

Se debe incluir un modelo en la carpeta con el nombre "model.glb". Después de aplicar todas las rotaciones, el campo debe orientarse con la alianza roja a la izquierda. Los archivos CAD deben convertirse a glTF; consulta [esta página](gltf-convert) para obtener más detalles. Los modelos de elementos de juego siguen la convención de nomenclatura "model_INDEX.glb" según el orden en que aparecen en el arreglo "gamePieces". Las AprilTags declaradas aquí siempre se colocan utilizando un sistema de coordenadas [centro/rojo](/more-features/coordinate-systems#centerred-systemcore), independientemente de cualquier otra opción de configuración. El archivo de configuración debe tener el siguiente formato:

```json
{
  "name": string // Nombre único, requerido para todos los tipos de recursos
  "isFTC": boolean // Si este es un campo de FTC en lugar de un campo de FRC
  "coordinateSystem": // El sistema de coordenadas predeterminado a utilizar (ver a continuación)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC tradicional
      "center-red"       // Systemcore
  "useGrid": boolean // Si se deben renderizar líneas de cuadrícula si este campo es uno de FTC (predeterminado "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones a lo largo de los ejes x, y, y z
  "widthInches": number // Ancho real del campo (lado largo)
  "heightInches": number // Altura real del campo (lado corto)
  "defaultOrigin": "auto" | "blue" | "red" // Ubicación de origen predeterminada, "auto" si no se especifica
  "driverStations": [
    [number, number] // Posiciones de la estación del conductor (X e Y en metros relativos al centro del campo)
    ...              // Para FRC, 6 elementos ordenados [B1, B2, B3, R1, R2, R3]. Para FTC, 4 elementos ordenados [BL, BR, RL, RR].
  ]
  "gamePieces": [ // Lista de tipos de elementos de juego
    {
      "name": string // Nombre del elemento de juego
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones a lo largo de los ejes x, y, y z
      "position": [number, number, number] // Desplazamiento de posición en metros, aplicado después de la rotación
      "stagedObjects": string[] // Nombres de los objetos de elementos de juego posicionados en el campo, para ocultar si se suministran poses de usuario
    },
    ...
  ],
  "aprilTags": [ // Lista de modelos suplementarios de AprilTag (si no forman parte del modelo de campo)
    "variant": string // Formato como "FAMILY-SIZEin" donde "FAMILY" es "36h11" o "16h5" y "SIZE" es la longitud de la sección negra
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones a lo largo de los ejes x, y, y z
    "position": [number, number, number] // Desplazamiento de posición en metros, aplicado después de la rotación
  ]
}
```
