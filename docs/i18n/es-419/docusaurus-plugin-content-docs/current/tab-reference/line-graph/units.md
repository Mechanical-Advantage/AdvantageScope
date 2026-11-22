# Soporte de unidades {#unit-support}

La pestaña de gráfico de líneas reconoce unidades, lo que te permite convertir valores numéricos fácilmente entre unidades compatibles. Cuando un campo incluye información de unidad, sus valores también aparecen correctamente etiquetados en los ejes y en la leyenda. Consulta [Formatos compatibles](#supported-formats) para ver cómo publicar esta información. AdvantageScope te ofrece varias formas rápidas de trabajar con unidades:

- Si agregas **campos con unidades compatibles en el mismo eje**, AdvantageScope convierte ambos automáticamente a la misma unidad, y lo refleja en las etiquetas del eje Y y la leyenda.
- Haz clic en los tres puntos junto al título del eje para **cambiar rápidamente a otra unidad**. La lista muestra las unidades más comunes compatibles con los campos seleccionados.
- Activa **la integración o diferenciación** ([documentación](/tab-reference/line-graph/#integration-and-differentiation)) para ver las unidades resultantes de la integral o derivada. También puedes cambiar la unidad base desde el menú si necesitas filtrar usando unidades distintas a las originales.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Gráficos con reconocimiento de unidades" />

_En la imagen de arriba se muestra la interfaz en inglés._

## Formatos compatibles {#supported-formats}

AdvantageScope ofrece varios métodos para indicar la unidad de cada campo. La mayoría de las unidades comunes están incluidas; para ver la lista completa, abre el menú emergente al configurar la [conversión manual](#manual-conversion).

En los métodos (2) y (3), las unidades se interpretan a partir de texto. AdvantageScope reconoce distintos nombres para cada unidad, incluidas abreviaturas comunes (por ejemplo, tanto `ft` como `feet` funcionan) y variantes de inglés estadounidense o británico (como `meters` y `metres`). Ten en cuenta que los nombres deben escribirse usando símbolos del SI o en inglés, sin importar el idioma que tengas configurado en AdvantageScope. Si algún nombre de unidad no se reconoce como esperabas, [abre un issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) en GitHub.

:::tip
¿No estás seguro de si AdvantageScope está reconociendo bien las unidades? Al agregar el campo al gráfico, revisa si aparece la unidad junto al eje Y.
:::

### 🥇 Unidades de struct {#struct-units}

AdvantageScope usa automáticamente las unidades nativas de los tipos de datos estructurados comunes, como `Rotation2d` y `Translation3d`. Publicar tus datos con estos formatos es **siempre la mejor opción** y garantiza la máxima compatibilidad al visualizar geometría.

### 🥈 Metadatos del campo {#field-metadata}

Tanto WPILOG como NetworkTables permiten adjuntar "metadatos" a cada campo. AdvantageScope busca campos JSON llamados `"unit"` o `"units"` que contengan el nombre de la unidad en texto (con espacios, camel-case, pascal-case o snake-case). Para revisar los metadatos de un campo, pasa el cursor sobre su nombre en la barra lateral.

:::tip
En WPILib, al registrar objetos `Measure` con `Telemetry.log()`, los metadatos de unidad se adjuntan automáticamente. También puedes configurarlos de forma explícita con `Telemetry.setProperty("fieldName", "unit", "\"volts\"")`.

AdvantageKit también admite metadatos de unidades al registrar entradas y salidas (consulta [la documentación de AdvantageKit](https://docs.advantagekit.org/data-flow/supported-types#units) para más detalles).
:::

### 🥉 Nombre del campo {#field-naming}

Si no hay metadatos ni struct, AdvantageScope intenta deducir la unidad analizando el nombre del campo. **La unidad debe ir al final, como sufijo.** Se admiten varios estilos de escritura, por ejemplo:

- **Camel/pascal-case**: `PositionMeters`, `velocityRadPerSec`, `TimestampS`
- **Snake-case**: `position_meters`, `velocity_rad_per_sec`, `timestamp_s`
- **Separado por espacios**: `position meters`, `velocity rad per sec`, `timestamp s`

Cuando usas snake-case o espacios, no importa si escribes en mayúsculas o minúsculas.

:::tip
Si una unidad se interpreta mal, haz clic en `Unidades manuales` > `Deshabilitar unidades automáticas` para ignorar la detección automática. Luego podrás usar la conversión manual para elegir la unidad correcta.
:::

## Conversión manual {#manual-conversion}

Cuando no tienes metadatos de unidades o estos son incorrectos, puedes configurar un eje manualmente para convertir entre unidades (o ignorar los metadatos por completo).

Para hacerlo, haz clic en los tres puntos junto al título del eje y selecciona `Unidades manuales` > `Editar conversión...`. Elige el tipo de unidad, la unidad de origen y la unidad de destino. Cada valor también se multiplica por el "Factor adicional", lo que resulta útil para conversiones personalizadas (como relaciones de transmisión, pasar de angular a lineal u otras unidades que no vengan en AdvantageScope). Incluso puedes escribir el factor como una expresión matemática, por ejemplo `1.5*pi`.

:::tip
Para activar o desactivar rápidamente una conversión de unidades, haz clic en los tres puntos junto al título del eje y elige `Preajustes recientes` o `Restablecer unidades`.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Edición de conversión de unidades" height="250" />

_En la imagen de arriba se muestra la interfaz en inglés._
