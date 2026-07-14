---
sidebar_position: 2
---

# Diagnósticos de Phoenix

AdvantageScope admite la transmisión en vivo de señales desde dispositivos Phoenix 6 con **cero configuración en el código de usuario**. Esto permite una fácil depuración y ajuste de los dispositivos Phoenix utilizando la interfaz familiar y todo el poder de AdvantageScope:

- Opciones de visualización flexibles, incluido el soporte para múltiples ejes y campos discretos
- Soporte completo para gráficos con reconocimiento de unidades, incluida la conversión de unidades implícita y con un solo clic ([documentación](/tab-reference/line-graph/units))
- Vista previa en vivo de todos los valores en la barra lateral para una fácil navegación
- Soporte para trazar y obtener vistas previas de señales de múltiples dispositivos simultáneamente
- Decodificación de valores enum como cadenas legibles por humanos (modos de control, estado del puente, estado del imán del CANcoder, etc.)
- Descripciones emergentes integradas en la barra lateral con descripciones y unidades para cada señal
- Organización jerárquica de señales, agrupadas por bus CAN, dispositivo y tipo de señal
- Análisis avanzado de datos con opciones integradas de integración y diferenciación ([documentación](/tab-reference/line-graph/#adjusting-axes))

:::tip
Para conectarte, selecciona "Diagnósticos de Phoenix" (Phoenix Diagnostics) cuando te conectes al robot o simulador desde la barra de menú.
:::

<img src="/img/overview/live-sources/phoenix-1.png" alt="Line graph screenshot" />

La pestaña 📊 [Estadísticas](/tab-reference/statistics) de AdvantageScope también permite el análisis avanzado de señales de Phoenix, con soporte para histogramas, rangos personalizados y campos derivados para mediciones de error relativo y absoluto:

<img src="/img/overview/live-sources/phoenix-2.png" alt="Statistics screenshot" />

:::note
Esta función puede experimentar ocasionalmente problemas como resultado de las actualizaciones de Phoenix. Recomendamos usar la última versión de AdvantageScope para minimizar los problemas. De lo contrario, [abre un issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) para informarnos de cualquier problema.
:::
