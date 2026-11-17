# ⚙️ Recursos personalizados {#custom-assets}

AdvantageScope viene con un paquete predeterminado de imágenes planas de campos, modelos 3D de campos y robots, y diseños de joysticks. Los recursos básicos (como los campos "Perenne") ya vienen incluidos en la instalación, mientras que los más detallados (como los campos de cada temporada) se descargan automáticamente en segundo plano cuando tienes conexión a Internet. Puedes revisar cómo va esa descarga en `App`/`AdvantageScope` > `Estado de descarga de recursos...`.

Si quieres agregar tus propios recursos, puedes personalizar el paquete. Para abrir la carpeta de recursos del usuario, ve a `App`/`AdvantageScope` > `Mostrar carpeta de recursos`. Más abajo encontrarás el formato que espera AdvantageScope. También puedes tomar como referencia los [recursos detallados](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) y los [recursos incluidos](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) predeterminados.

:::tip
Si prefieres cargar recursos desde otra ubicación, ve a `App`/`AdvantageScope` > `Usar carpeta de recursos personalizada` y selecciona la _carpeta raíz_ donde tengas las subcarpetas de cada recurso. Esto es muy útil para guardar tus recursos personalizados bajo control de versiones junto con el código del robot.
:::

## Formato general {#general-format}

Todos los recursos van dentro de carpetas nombradas con el formato `"TIPO_NOMBRE"`. AdvantageScope no muestra el `NOMBRE` de la carpeta en la interfaz. Los tipos válidos son:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Algunos ejemplos de nombres de carpeta son "Field2d_2023Field", "Joystick_OperatorButtons" o "Robot_Dozer".
:::

Cada carpeta debe incluir un archivo `config.json` y uno o más archivos de recursos, según el tipo. El archivo de configuración siempre define el nombre que mostrará AdvantageScope, y ese nombre debe ser único dentro de su tipo. De forma opcional, puedes agregar un objeto `"locales"` que asocie códigos de idioma (como `"es-419"`, `"fr"` o `"zh-CN"`) con nombres traducidos. Si no se encuentra el idioma activo o se omite `"locales"`, se usará el `"name"` principal como nombre predeterminado.

```json
{
  "name": string, // Nombre predeterminado único, obligatorio para todos los tipos de recursos
  "locales": { [locale: string]: string } // Nombres localizados opcionales que asocian códigos de idioma (p. ej., "es-419", "fr") con traducciones
  ... // Configuración según el tipo de recurso, explicada abajo
}
```

## Modelos de robots 3D {#3d-robot-models}

### Tutorial en video {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Descripción general {#overview}

La carpeta debe contener el modelo con el nombre `"model.glb"`. Si partes de un archivo CAD, primero debes convertirlo a glTF; revisa [esta página](gltf-convert) para ver cómo hacerlo. El archivo `config.json` debe seguir este formato:

```json
{
  "name": string // Nombre único, obligatorio para todos los tipos de recursos
  "locales": { [locale: string]: string } // Traducciones opcionales para el nombre del recurso
  "isFTC": boolean // Indica si el modelo es para campos de FTC en lugar de FRC (predeterminado "false")
  "disableSimplification": boolean // Desactiva la simplificación del modelo (opcional)
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones en los ejes X, Y y Z
  "position": [number, number, number] // Desplazamiento de posición en metros, aplicado después de la rotación
  "cameras": [ // Posiciones fijas de cámaras (puede quedar vacío)
    {
      "name": string // Nombre de la cámara
      "locales": { [locale: string]: string } // Traducciones opcionales para el nombre de la cámara
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones en los ejes X, Y y Z
      "position": [number, number, number] // Desplazamiento de posición en metros respecto al robot, aplicado después de la rotación
      "resolution": [number, number] // Resolución en píxeles, usada para definir la relación de aspecto fija
      "fov": number // Campo de visión horizontal en grados
    }
  ],
  "components": [...] // Consulta "Componentes articulados"
}
```

Para encontrar los valores correctos de posición y rotación, lo más práctico es probar y ajustar. Te recomendamos ajustar primero las rotaciones y luego la posición, ya que las transformaciones se aplican en ese orden.

:::info
AdvantageScope simplifica automáticamente la geometría de los modelos para mejorar el rendimiento, ajustando el nivel de detalle según el [modo de renderizado](/tab-reference/3d-field#rendering-modes) elegido. Si esta simplificación causa problemas visuales en un recurso personalizado, tienes dos opciones:

- Para evitar que se elimine una malla específica, incluye el texto `NOSIMPLIFY` en el nombre de esa malla.
- Para desactivar la simplificación en todo el modelo del robot, pon `disableSimplification` en `true` dentro de la configuración.

:::

### Componentes articulados {#articulated-components}

:::warning
Configurar componentes articulados puede ser complejo y llevar bastante tiempo. Antes de hacerlo, evalúa usar el soporte 3D de [`Mechanism2d`](/tab-reference/3d-field#2d-mechanisms) de AdvantageScope, que ofrece una forma mucho más directa de **visualizar mecanismos en el campo 3D**.
:::

Los modelos de robots pueden incluir componentes articulados para animar mecanismos (consulta [aquí](/tab-reference/3d-field) para más detalles). El modelo glTF base no debe incluir estos componentes; cada parte móvil se exporta por separado siguiendo el nombre `"model_INDICE.glb"` (por ejemplo, el primer componente sería `"model_0.glb"`).

La configuración de cada componente va en el `config.json` del robot, dentro de un arreglo bajo la clave `"components"`. Si no proporcionas poses de componentes en AdvantageScope, cada pieza se ubicará usando las rotaciones y la posición predeterminadas del robot. En cambio, cuando sí envías poses de componentes, AdvantageScope aplica primero las rotaciones y la posición "en cero" (`zeroedRotations` y `zeroedPosition`) para llevar cada pieza al origen del robot, y luego aplica tus poses para moverla a su lugar real.

:::tip
Al ubicar componentes 3D relativos al robot, el origen del sistema de coordenadas coincide con la pose publicada del robot. Recuerda que, en movimientos 2D típicos, esa pose suele tener altura cero en el plano del piso, NO en la base del chasis (bellypan).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones en los ejes X, Y y Z
    "zeroedPosition": [number, number, number] // Desplazamiento de posición en metros respecto al robot, aplicado después de la rotación
  }
]
```

#### Proceso de configuración {#setup-process}

Para calibrar las posiciones de los componentes articulados, te recomendamos seguir estos pasos:

1. Exporta el modelo base y todos los componentes en sus posiciones "predeterminadas" correctas (así es como se verán cuando no envíes poses de componentes en AdvantageScope).

2. Publica una pose 2D en cero desde el código del robot y selecciónala como pose del robot en AdvantageScope. Cambia al campo 3D "Ejes" para ver claramente el origen del campo.

3. Ajusta las rotaciones generales del robot (no las de los componentes) hasta que quede bien orientado, y luego ajusta su posición general para centrarlo en el origen. Durante este paso, los componentes deben mantenerse en sus posiciones predeterminadas.

4. Publica desde el código del robot un arreglo de poses 3D en cero con la misma cantidad de elementos que componentes tenga tu modelo, y selecciónalo como conjunto de poses de componentes en AdvantageScope.

5. Ajusta primero las rotaciones y luego la posición de cada componente hasta alinearlo con el origen. Por ejemplo, el pivote de un brazo debe quedar en el origen con el brazo apuntando hacia adelante sobre el eje X.

6. Por último, publica las poses reales de los componentes desde el código del robot, tomando como referencia el origen que acabas de definir para cada uno. Siguiendo el ejemplo, la pose del brazo iría en su articulación apuntando en la dirección del segmento.

## Joysticks {#joysticks}

La carpeta debe incluir una imagen llamada `"image.png"`. El archivo `config.json` debe tener este formato:

```json
{
  "name": string // Nombre único, obligatorio para todos los tipos de recursos
  "locales": { [locale: string]: string } // Traducciones opcionales para el nombre del recurso
  "components": [...] // Arreglo con la configuración de cada componente (ver abajo)
}
```

:::info
Los botones, joysticks y ejes son compatibles tanto con las asignaciones de [SDL](https://www.libsdl.org) (que usa la FIRST Driver Station actual) como con las de NI (de la antigua NI FRC Driver Station). Cada componente debe tener al menos un conjunto de asignaciones.

Para las asignaciones de NI, AdvantageScope mantiene compatibilidad con las claves antiguas sin prefijo (como `sourceIndex`). **Todo joystick nuevo debe usar asignaciones SDL explícitas (como `sdlSourceIndex`) para funcionar bien con la FIRST Driver Station actual.**
:::

### Botón individual / valor de POV {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // Opcional, puede ser "up", "right", "down" o "left". Si se indica, "sdlSourceIndex" será el índice del POV que se leerá.

  // Asignaciones alternativas para la NI Driver Station (opcional)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### Joystick de dos ejes {#two-axis-joystick}

```json
{
  "type": "joystick" // Joystick con movimiento en dos dimensiones
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Sin invertir: derecha = positivo
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Sin invertir: arriba = positivo
  "sdlButtonSourceIndex": number // Opcional

  // Asignaciones alternativas para la NI Driver Station (opcional)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### Eje individual {#single-axis}

```json
{
  "type": "axis" // Valor de un solo eje
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Pon el mínimo mayor que el máximo para invertir

  // Asignaciones alternativas para la NI Driver Station (opcional)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### Panel táctil {#touchpad}

```json
{
  "type": "touchpad" // Panel táctil
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## Imágenes planas del campo {#flat-field-images}

La carpeta debe incluir una imagen llamada `"image.png"`, orientada con la alianza roja a la izquierda. El archivo `config.json` debe tener este formato:

```json
{
  "name": string // Nombre único, obligatorio para todos los tipos de recursos
  "locales": { [locale: string]: string } // Traducciones opcionales para el nombre del recurso
  "isFTC": boolean // Indica si es un campo de FTC en lugar de FRC
  "coordinateSystem": // Sistema de coordenadas predeterminado (ver abajo)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC tradicional
      "center-red"       // Systemcore
  "useGrid": boolean // Dibuja líneas de cuadrícula si el campo es de FTC (predeterminado "true")
  "sourceUrl": string // Enlace al archivo original (opcional)
  "topLeft": [number, number] // Coordenada en píxeles (origen arriba a la izquierda)
  "bottomRight": [number, number] // Coordenada en píxeles (origen arriba a la izquierda)
  "widthInches": number // Ancho real del campo (lado largo)
  "heightInches": number // Alto real del campo (lado corto)
}
```

## Modelos de campos 3D {#3d-field-models}

La carpeta debe incluir el modelo con el nombre `"model.glb"`. Una vez aplicadas todas las rotaciones, el campo debe quedar orientado con la alianza roja a la izquierda. Si partes de un archivo CAD, primero conviértelo a glTF como se explica [aquí](gltf-convert). Los modelos de elementos de juego se nombran `"model_INDICE.glb"` según el orden en que aparecen en el arreglo `"gamePieces"`. Los AprilTags definidos aquí siempre se ubican con el sistema de coordenadas [centro/rojo](/more-features/coordinate-systems#center-red), sin importar otras opciones de configuración.

El archivo `config.json` debe seguir este formato:

```json
{
  "name": string // Nombre único, obligatorio para todos los tipos de recursos
  "locales": { [locale: string]: string } // Traducciones opcionales para el nombre del recurso
  "isFTC": boolean // Indica si es un campo de FTC en lugar de FRC
  "coordinateSystem": // Sistema de coordenadas predeterminado (ver abajo)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC tradicional
      "center-red"       // Systemcore
  "useGrid": boolean // Dibuja líneas de cuadrícula si el campo es de FTC (predeterminado "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones en los ejes X, Y y Z
  "widthInches": number // Ancho real del campo (lado largo)
  "heightInches": number // Alto real del campo (lado corto)
  "defaultOrigin": "auto" | "blue" | "red" // Origen predeterminado; "auto" si no se especifica
  "driverStations": [
    [number, number] // Posiciones de la Driver Station (X e Y en metros respecto al centro del campo)
    ...              // En FRC, 6 elementos en orden [B1, B2, B3, R1, R2, R3]. En FTC, 4 elementos en orden [BL, BR, RL, RR].
  ]
  "gamePieces": [ // Lista de tipos de elementos de juego
    {
      "name": string // Nombre del elemento de juego
      "locales": { [locale: string]: string } // Traducciones opcionales para el nombre del elemento de juego
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones en los ejes X, Y y Z
      "position": [number, number, number] // Desplazamiento de posición en metros, aplicado después de la rotación
      "stagedObjects": string[] // Nombres de los objetos colocados en el campo que se ocultarán si envías poses desde el código
    },
    ...
  ],
  "aprilTags": [ // Lista de modelos adicionales de AprilTag (si no vienen incluidos en el modelo del campo)
    "variant": string // Formato "FAMILIA-TAMAÑOin", donde "FAMILIA" es "36h11" o "16h5" y "TAMAÑO" es el lado del cuadro negro
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Secuencia de rotaciones en los ejes X, Y y Z
    "position": [number, number, number] // Desplazamiento de posición en metros, aplicado después de la rotación
  ]
}
```
