# Soporte de unidades

La pestaña de gráfico de líneas tiene reconocimiento de unidades, lo que significa que los valores numéricos se pueden convertir fácilmente entre tipos de unidades compatibles. Cuando la información de la unidad está disponible, todos los valores numéricos también se etiquetan con precisión cuando se muestran en los ejes o leyendas. Consulta [aquí](#supported-formats) para obtener más información sobre la publicación de información sobre unidades. AdvantageScope proporciona varias herramientas para convertir rápidamente entre unidades:

- Al agregar **campos en el mismo eje con tipos de unidades compatibles**, AdvantageScope convierte automáticamente ambos campos a la misma unidad. Esto se refleja en el etiquetado del eje Y y la leyenda.
- Haz clic en los tres puntos cerca del título del eje para **cambiar rápidamente a unidades alternativas**. Esta lista incluye las unidades más comunes que son compatibles con los campos seleccionados.
- Habilita **la integración o diferenciación** ([documentación](/tab-reference/line-graph/#integration--differentiation)) para ver las unidades precisas de la integral o derivada. La unidad base se puede ajustar utilizando el menú para admitir el filtrado en unidades no nativas.

<img src="/img/tab-reference/line-graph/units-1.png" alt="Unit-aware graphing" />

## Formatos compatibles {#supported-formats}

AdvantageScope admite varios métodos para proporcionar información sobre la unidad para cada campo. Se admiten las unidades más comunes; para obtener una lista completa, consulta el menú emergente al configurar la [conversión manual](#manual-conversion).

Para (2) y (3), los tipos de unidades se analizan mediante cadenas de texto. AdvantageScope admite múltiples nombres para cada unidad, incluyendo abreviaturas comunes (por ejemplo, `ft` y `feet` están bien). Ten en cuenta que los nombres de las unidades se deben proporcionar utilizando símbolos SI o inglés estadounidense, independientemente del idioma seleccionado en AdvantageScope. Si un nombre de unidad no se analiza como se esperaba, por favor [abre un issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
¿No estás seguro de si las unidades se están analizando correctamente? Comprueba si se muestra un tipo de unidad en el eje Y al agregar un campo al gráfico de líneas.
:::

### 🥇 Unidades struct

AdvantageScope utiliza automáticamente las unidades nativas para los tipos de datos estructurados comunes como `Rotation2d` y `Translation3d`. La publicación de valores aplicables utilizando estos formatos es **siempre la mejor manera de publicar datos** y garantiza la máxima compatibilidad al visualizar datos de geometría.

### 🥈 Metadatos de campo

Los formatos WPILOG y NetworkTables admiten la publicación de "metadatos" adicionales para cada campo. AdvantageScope busca campos JSON con el nombre "unit" o "units" que contengan un nombre de cadena de texto para el tipo de unidad (usando espacios, camel-case, pascal-case o snake-case). Para comprobar los metadatos de cada campo, pasa el cursor sobre el nombre del campo en la barra lateral.

:::tip
AdvantageKit incluye soporte para metadatos de unidades al registrar entradas y salidas, incluido el registro de anotaciones. Consulta la documentación [aquí](https://docs.advantagekit.org/data-flow/supported-types#units) para obtener detalles.
:::

### 🥉 Denominación de campos

Como respaldo, AdvantageScope intenta determinar el tipo de unidad correcto analizando el nombre de cada campo. **El tipo de unidad debe incluirse como sufijo.** AdvantageScope admite una variedad de esquemas de nombres. Algunas opciones válidas se enumeran a continuación:

- **Camel/pascal-case**, como `PositionMeters`, `velocityRadPerSec`, y `TimestampS`
- **Snake-case**, como `position_meters`, `velocity_rad_per_sec`, y `timestamp_s`
- **Separadores de espacio**, como `position meters`, `velocity rad per sec`, y `timestamp s`

La denominación _not_ distingue entre mayúsculas y minúsculas cuando se usa snake-case o separadores de espacio.

:::tip
Si las unidades se analizan incorrectamente, haz clic en `Unidades manuales` > `Deshabilitar unidades automáticas` para ignorar la información de la unidad. La conversión manual se puede utilizar luego para cambiar a unidades alternativas.
:::

## Conversión manual {#manual-conversion}

Cuando los metadatos de las unidades no están disponibles o son inexactos, los ejes también se pueden configurar manualmente para convertir entre unidades (o ignorar los metadatos de las unidades por completo).

Para configurar la conversión manual, haz clic en los tres puntos cerca del título del eje y luego en `Unidades manuales` > `Editar conversión...`. Selecciona el tipo de unidad, la unidad de origen y la unidad de destino. Cada valor también se multiplica por el "Factor extra", lo que permite conversiones personalizadas (como relaciones de transmisión, conversiones angulares a lineales u otras unidades no proporcionadas por AdvantageScope). El factor también se puede ingresar usando una expresión matemática como `1.5*pi`.

:::tip
Para habilitar o deshabilitar rápidamente la conversión de unidades, haz clic en los tres puntos cerca del título del eje y elige `Ajustes preestablecidos recientes` o `Restablecer unidades`.
:::

<img src="/img/tab-reference/line-graph/units-2.png" alt="Editing unit conversion" height="250" />
