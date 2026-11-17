---
title: ¿Qué hay de nuevo en 2026?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

¡Ya está disponible la versión 2026 de AdvantageScope! Revisa la [guía de instalación](/overview/installation) y el [registro de cambios completo](https://github.com/Mechanical-Advantage/AdvantageScope/releases) para ver todos los detalles. Esta versión trae varias funciones importantes y muchas mejoras en toda la aplicación. Gran parte de estas novedades buscan mejorar tu experiencia en los sistemas de control actuales y, al mismo tiempo, preparar una transición fluida hacia [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) en las próximas temporadas.

**¡Tu opinión nos importa! Si tienes comentarios, sugerencias de funciones o reportes de errores, compártelos en la [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Experimental: Soporte de FTC {#ftc-support}

Como preparación para el soporte completo con Systemcore en la temporada 2027-2028, esta versión suma varias funciones para mejorar la compatibilidad con el sistema de control actual de Reto Tecnológico FIRST (FTC):

- Campos de FTC y modelos de robots en el 🗺️ [Campo 2D](/tab-reference/2d-field) y el 👀 [Campo 3D](/tab-reference/3d-field)
- Nuevas opciones de [sistemas de coordenadas](/more-features/coordinate-systems) compatibles con las [coordenadas estándar de FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Soporte para archivos de registro de [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- Soporte para el formato de transmisión en vivo de [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Si eres parte de un equipo de FTC, ten cuidado al usar software experimental durante la temporada oficial. El soporte de FTC en AdvantageScope sigue en desarrollo activo.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

Varias bibliotecas de telemetría y registro de terceros para FTC también generan formatos compatibles con AdvantageScope, como WPILOG y RLOG. Puedes consultar su documentación en cada proyecto; los desarrolladores de AdvantageScope no avalan ni recomiendan ninguna solución de registro de FTC en particular.

:::info
AdvantageScope ofrece la mejor experiencia cuando se usa junto con el framework WPILib y sus herramientas de registro. Si usas soluciones no oficiales, podrías encontrar problemas de compatibilidad o funciones limitadas.

Todas las funciones de AdvantageScope serán oficialmente compatibles con FTC tras la transición a Systemcore en la temporada 2027-2028.
:::

## 🧮 Gráficos con reconocimiento de unidades {#unit-aware-graphing}

Rediseñamos la pestaña 📉 [Gráfico de líneas](/tab-reference/line-graph/) para que reconozca unidades automáticamente (*unit-aware*). Esto te da varias ventajas nuevas al graficar campos numéricos:

- Etiquetado preciso en los ejes Y y en las vistas de valores
- Conversión rápida a unidades compatibles (sin ventanas emergentes)
- Conversión implícita de unidades compatibles dentro de un mismo eje
- Visualización precisa de unidades [integradas y diferenciadas](/tab-reference/line-graph/#integration-and-differentiation)

La captura de abajo muestra todas estas funciones en acción. Fíjate en que el eje izquierdo combina campos con distintas unidades de velocidad angular, mientras que el eje derecho muestra valores diferenciados en una unidad no nativa (grados). Elegir unidades también es más fácil que nunca, con opciones compatibles integradas directamente en el menú de control de cada eje.

_Puedes encontrar más información sobre el manejo de unidades en la [documentación](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Gráficos con reconocimiento de unidades" />

_La imagen de arriba muestra la interfaz en inglés._

## 🏁 Descargas de registros más rápidas {#faster-log-downloads}

[Descargar registros desde el roboRIO](/overview/log-files/#downloading-from-the-robot) ahora es **de 2 a 4 veces más rápido** que en versiones anteriores. Lo logramos cambiando a un nuevo protocolo (FTP) que permite al roboRIO transferir los datos con mucha menos carga de CPU.

La siguiente tabla compara las velocidades de transferencia medidas en las versiones 2025 y 2026 de AdvantageScope usando conexión por Ethernet (ancho de banda máximo de 100 Mb/s). Como ves, la carga de la CPU en el roboRIO afectaba bastante el rendimiento en la versión 2025.

|                                                              | 2025 (SFTP) | 2026 (FTP) | Mejora                                           |
| ------------------------------------------------------------ | ----------- | ---------- | ------------------------------------------------ |
| Carga alta de CPU<br /><sub>Código de robot complejo</sub>   | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| Carga promedio de CPU<br /><sub>Código de robot normal</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| Carga mínima de CPU<br /><sub>Sin código de robot</sub>      | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 Descargar registros desde subcarpetas {#download-logs-from-subfolders}

La ventana de descarga ahora te permite guardar registros almacenados dentro de subcarpetas. Puedes descargar cada subcarpeta completa como un grupo, lo que simplifica mucho la descarga de los registros generados por la versión 2026 de [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de CTRE (que recurre a subcarpetas porque no puede guardar todos los datos en un solo archivo).

<img src="/img/whats-new/subfolders.webp" alt="Descarga de subcarpetas de registro" height="450" />

## 🌈 Nuevas opciones de visualización {#new-visualization-options}

Agregamos varias opciones nuevas de visualización en el 🗺️ [Campo 2D](/tab-reference/2d-field) y el 👀 [Campo 3D](/tab-reference/3d-field):

- Ahora tienes más colores disponibles para los parachoques del robot en el campo 2D, y puedes configurar cada objeto con su propio color. Esto te da mucha más flexibilidad al combinar fantasmas con varios objetos de robot.
- Al [visualizar mecanismos 2D en el campo 3D](/tab-reference/3d-field/#2d-mechanisms), ahora puedes colocarlos en el plano YZ además del plano XZ, lo que facilita ver mecanismos complejos con movimiento en varios ejes.
- El campo 3D ahora incluye antialiasing opcional para suavizar los bordes renderizados.

<img src="/img/whats-new/field-viz.jpg" alt="Nuevas visualizaciones de campo" />

## 🪵 Soporte para registros CAN de REV Robotics {#rev-robotics-can-log-support}

Ahora puedes abrir directamente en AdvantageScope los archivos `.revlog` generados por [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de REV Robotics. Estos archivos registran las señales CAN de los controladores Spark Max y Spark Flex, y ofrecen una alternativa oficial a la biblioteca [URCL](/more-features/urcl) de AdvantageScope.

Tanto URCL como `StatusLogger` seguirán disponibles durante la temporada 2026 para asegurar una transición sin tropiezos y mantener las mismas funciones de temporadas anteriores. Más adelante compartiremos más detalles sobre las opciones de registro para 2027 y los años siguientes.

<img src="/img/whats-new/revlog.webp" alt="Visualización de REVLOG" />

## 💿 Importación de archivos CSV {#csv-file-imports}

Para visualizar con mayor flexibilidad datos que provienen de fuera de los sistemas de registro del robot, AdvantageScope ahora incluye soporte básico para importar archivos CSV. Revisa la [documentación](/overview/log-files/#csv-formatting) para conocer los formatos compatibles y sus limitaciones.

<img src="/img/overview/log-files/export-2.webp" alt="Datos CSV" />

## 🤩 Mejoras estéticas {#aesthetic-improvements}

Actualizamos la interfaz de AdvantageScope en Windows 11 para incluir una barra lateral translúcida, una función que antes solo estaba disponible en macOS. También estrenamos un ícono actualizado para macOS Tahoe basado en el material Liquid Glass de Apple.

<img src="/img/whats-new/windows-ui.webp" alt="Interfaz de usuario de Windows" />

## 📋 Menús optimizados {#streamlined-menus}

Simplificamos y reorganizamos la barra de menú y sus controles para que sean más accesibles y consistentes en todas las plataformas. Entre las mejoras principales están:

- Cambio más rápido entre fuentes en vivo (como NetworkTables y [Diagnósticos de Phoenix](/overview/live-sources/phoenix-diagnostics)), sin necesidad de abrir la ventana de preferencias.
- Clic derecho en la barra lateral para copiar rápidamente el nombre de un campo o su clave completa.
- Una ventana de preferencias reorganizada para que encuentres las opciones mucho más rápido.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_es-419.webp" />
</div>

## 🐛 Mejoras de estabilidad {#stability-improvements}

Esta versión incluye varias correcciones de errores y mejoras de estabilidad en toda la aplicación. Puedes consultar la lista completa en el [registro de cambios](https://github.com/Mechanical-Advantage/AdvantageScope/releases), pero aquí tienes algunas de las correcciones más destacadas:

- Mejoramos muchísimo el rendimiento de AdvantageScope al transmitir datos durante períodos largos, sobre todo en la pestaña Gráfico de líneas.
- Ahora AdvantageScope maneja mejor los datos de registro poco comunes, incluidos archivos muy grandes y campos con valores extensos.
- Corregimos varios errores visuales al explorar los datos de un registro, especialmente al aplicar filtros en la pestaña Gráfico de líneas.
- Corregimos el orden de los archivos de registro de AdvantageKit en la ventana de descarga: los registros sin marca de tiempo ahora aparecen al final de la lista, igual que en los demás formatos.
- En la pestaña Campo 3D, las cámaras del robot con rotación distinta de cero en el eje de alabeo ahora se muestran correctamente.
- Mejoramos la estabilidad de AdvantageScope XR, sobre todo en iOS/iPadOS 26. Si usas una instalación sin conexión, revisa la App Store para ver si hay actualizaciones disponibles.
