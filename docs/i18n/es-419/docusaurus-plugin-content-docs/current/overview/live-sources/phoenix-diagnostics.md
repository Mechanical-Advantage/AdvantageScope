---
sidebar_position: 2
---

# Diagnósticos de Phoenix {#phoenix-diagnostics}

AdvantageScope permite transmitir en vivo las señales de dispositivos Phoenix 6 **sin necesidad de configurar nada en el código del robot**. Así puedes depurar y ajustar tus dispositivos Phoenix usando la interfaz que ya conoces y todas las herramientas de AdvantageScope:

- Opciones flexibles de visualización, incluidas tablas y análisis estadístico
- Soporte completo para gráficos con reconocimiento de unidades, con conversión implícita y en un clic ([documentación](/tab-reference/line-graph/units))
- Decodificación de valores *enum* a texto legible (modos de control, estado del puente, estado del imán del CANcoder, etc.)
- Descripciones emergentes en la barra lateral con la explicación y las unidades de cada señal
- Organización jerárquica de las señales, agrupadas por bus CAN, dispositivo y tipo de señal
- Análisis avanzado con opciones integradas de integración y diferenciación ([documentación](/tab-reference/line-graph/#adjusting-axes))

:::tip
Para conectarte, elige "Diagnósticos de Phoenix" cuando te conectes al robot o al simulador desde la barra de menú.
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="Captura de pantalla de gráfico de líneas" />

La pestaña 📊 [Estadísticas](/tab-reference/statistics) de AdvantageScope también te permite analizar a fondo las señales de Phoenix, con histogramas, rangos personalizados y campos derivados para medir errores relativos y absolutos:

<img src="/img/overview/live-sources/phoenix-2.webp" alt="Captura de pantalla de estadísticas" />

_La imagen de arriba muestra la interfaz en inglés._

:::note
A veces esta función puede presentar fallas tras una actualización de Phoenix. Te recomendamos usar siempre la última versión de AdvantageScope para evitar inconvenientes; si el problema persiste, [abre un issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) para avisarnos.
:::
