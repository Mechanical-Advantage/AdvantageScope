---
title: ¿Qué hay de nuevo en 2026?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-light.png" className="light-only" />
<img src="/img/whats-new/banner-dark.png" className="dark-only" />

¡La versión 2026 de AdvantageScope ya está disponible! Consulta los [documentos de instalación](/overview/installation) y el [registro de cambios completo](https://github.com/Mechanical-Advantage/AdvantageScope/releases) para obtener detalles. Esta versión incluye varias funciones nuevas e importantes, además de numerosas mejoras en toda la aplicación. Muchas de las funciones de esta versión están diseñadas para mejorar la experiencia en los sistemas de control existentes y, al mismo tiempo, establecer una transición fluida a [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) en temporadas futuras.

**¡Valoramos tus comentarios! Los comentarios, las solicitudes de funciones y los informes de errores son bienvenidos en la [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Experimental: Soporte de FTC {#ftc-support}

En preparación para el soporte completo con Systemcore en la temporada 2027-2028, este lanzamiento agrega varias características para mejorar la compatibilidad con el sistema de control existente de Reto Tecnológico FIRST (FTC):

- Campos de FTC y modelos de robots en el 🗺️ [Campo 2D](/tab-reference/2d-field) y 👀 [Campo 3D](/tab-reference/3d-field)
- Nuevas opciones de [sistemas de coordenadas](/more-features/coordinate-systems) para compatibilidad con [coordenadas estándar de FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Soporte para archivos de registro de [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- Soporte para el formato de transmisión en vivo de [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Los equipos de FTC deben tener precaución al utilizar software experimental durante la temporada oficial. El soporte de FTC para AdvantageScope todavía está en desarrollo activo.
:::

<div className="image-gallery">
  <img src="/img/whats-new/ftc-1.jpg" />
  <img src="/img/whats-new/ftc-2.jpg" />
  <img src="/img/whats-new/ftc-3.png" />
  <img src="/img/whats-new/ftc-4.png" />
  <img src="/img/whats-new/ftc-5.png" />
</div>

Varias bibliotecas de telemetría/registro de FTC de terceros admiten otros formatos compatibles con AdvantageScope, como WPILOG y RLOG. La documentación de estas bibliotecas se puede encontrar en los proyectos respectivos; los desarrolladores de AdvantageScope no avalan/recomiendan ninguna solución de registro particular de FTC para su uso con AdvantageScope.

:::info
AdvantageScope está diseñado para proporcionar la mejor experiencia cuando se usa junto con el marco de trabajo WPILib y las herramientas de registro asociadas. Puedes encontrar problemas de compatibilidad o capacidades limitadas al utilizar soluciones de registro no oficiales.

Todas las funciones de AdvantageScope serán oficialmente compatibles con FTC después de la transición a Systemcore para la temporada 2027-2028.
:::

## 🧮 Gráficos con reconocimiento de unidades {#unit-aware-graphing}

La pestaña del 📉 [Gráfico de líneas](/tab-reference/line-graph/) ha sido rediseñada para ser completamente consciente de las unidades (unit-aware). Esto permite varias funciones nuevas al graficar campos numéricos:

- Etiquetado preciso de los ejes Y y pantallas de valores
- Conversión rápida a unidades compatibles (sin ventanas emergentes)
- Conversión implícita de tipos de unidades compatibles dentro de un solo eje
- Visualización precisa de unidades [integradas y diferenciadas](/tab-reference/line-graph/#integration--differentiation)

La siguiente captura de pantalla muestra todas estas características en acción. Ten en cuenta que el eje izquierdo incluye campos con diferentes unidades de velocidad angular, y el eje derecho incluye valores que están diferenciados y se muestran en una unidad no nativa (grados). Seleccionar unidades también es más fácil que nunca, con opciones de unidades compatibles integradas directamente en el menú de control para cada eje.

_Se puede encontrar más información sobre el soporte de unidades en la [documentación](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.png" alt="Gráficos con reconocimiento de unidades" />

## 🏁 Descargas de registros más rápidas {#faster-log-downloads}

[La descarga de registros del roboRIO](/overview/log-files/#downloading-from-the-robot) ahora es **2-4 veces más rápida** que las versiones anteriores. Esto se logra cambiando a un nuevo protocolo (FTP) que permite al roboRIO transferir datos de registro con menos sobrecarga de CPU.

La siguiente tabla muestra la velocidad de transferencia medida en los lanzamientos de 2025 y 2026 de AdvantageScope mientras está conectado a través de Ethernet (ancho de banda máximo de 100 Mb/s). Ten en cuenta que el rendimiento de la versión de 2025 se ve gravemente afectado por la carga de la CPU en el roboRIO.

|                                                              | 2025 (SFTP) | 2026 (FTP) | Aceleración                                      |
| ------------------------------------------------------------ | ----------- | ---------- | ------------------------------------------------ |
| Carga alta de CPU<br /><sub>Código de robot complejo</sub>   | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| Carga promedio de CPU<br /><sub>Código de robot normal</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| Carga mínima de CPU<br /><sub>Sin código de robot</sub>      | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 Descargar registros de subcarpetas {#download-logs-from-subfolders}

La ventana de descarga ahora admite guardar registros que están almacenados en subcarpetas. Cada subcarpeta de registros se puede descargar como grupo, lo que proporciona un enfoque simplificado para descargar registros generados por la versión 2026 del [registrador de señales](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de CTRE (que usa subcarpetas como solución alternativa por no poder almacenar datos en un solo archivo de registro).

<img src="/img/whats-new/subfolders.png" alt="Descargando subcarpetas de registro" height="450" />

## 🌈 Nuevas opciones de visualización {#new-visualization-options}

Se admiten varias opciones nuevas de visualización en el 🗺️ [Campo 2D](/tab-reference/2d-field) y el 👀 [Campo 3D](/tab-reference/3d-field):

- Ahora está disponible una variedad más amplia de colores de parachoques de robots en el campo 2D, y cada objeto se puede configurar con su propio color. Esto permite una mayor flexibilidad al combinar fantasmas con múltiples objetos de robot.
- Al [visualizar mecanismos 2D en el campo 3D](/tab-reference/3d-field/#2d-mechanisms), los mecanismos ahora se pueden colocar en el plano YZ además del plano XZ. Esto permite una visualización más fácil de mecanismos complejos con movimiento en múltiples ejes.
- El campo 3D ahora admite anti-aliasing opcional para mejorar la calidad de los bordes renderizados.

<img src="/img/whats-new/field-viz.jpg" alt="Nuevas visualizaciones de campo" />

## 🪵 Soporte de Log de REV Robotics CAN {#rev-robotics-can-log-support}

Ahora puedes abrir archivos `.revlog` producidos por el [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de REV Robotics directamente en AdvantageScope. Estos archivos registran las señales CAN de los dispositivos Spark Max y Spark Flex, ofreciendo una alternativa oficial a la biblioteca [URCL](/more-features/urcl) de AdvantageScope.

Tanto URCL como el `StatusLogger` oficial permanecerán disponibles durante la temporada 2026 para garantizar una transición sin problemas y proporcionar paridad de funciones con las temporadas anteriores. Tendremos más detalles para compartir sobre las opciones de registro en 2027 y más allá en una fecha posterior.

<img src="/img/whats-new/revlog.png" alt="Visualización de REVLOG" />

## 💿 Importaciones de archivos CSV {#csv-file-imports}

Para una visualización más flexible de los datos producidos fuera de los marcos de registro del robot, AdvantageScope ahora incluye soporte básico para importar archivos CSV. Consulta la [documentación](/overview/log-files/#csv-formatting) para obtener más detalles sobre los formatos compatibles y otras limitaciones.

<img src="/img/overview/log-files/export-2.png" alt="Datos CSV" />

## 🤩 Mejoras estéticas {#aesthetic-improvements}

La interfaz de usuario de AdvantageScope en Windows 11 se ha actualizado para admitir una barra lateral translúcida, que antes era exclusiva para los lanzamientos de macOS. También hay un ícono de aplicación actualizado para macOS Tahoe basado en el material Liquid Glass de Apple.

<img src="/img/whats-new/windows-ui.png" alt="Interfaz de usuario de Windows" />

## 📋 Menús optimizados {#streamlined-menus}

La barra de menú y los controles relacionados se han optimizado y reorganizado para que los controles sean más accesibles y consistentes en todas las plataformas. Las características notables incluyen:

- Cambio más rápido entre fuentes en vivo (por ejemplo, NetworkTables y [Diagnósticos de Phoenix](/overview/live-sources/phoenix-diagnostics)), sin necesidad de abrir la ventana de preferencias.
- Haz clic con el botón derecho en la barra lateral para copiar rápidamente el nombre de un campo (o la clave de campo completa).
- Reorganización de la ventana de preferencias, facilitando la búsqueda rápida de opciones.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.png" />
  <img src="/img/whats-new/menus-2.png" />
  <img src="/img/prefs.png" />
</div>

## 🐛 Mejoras de estabilidad {#stability-improvements}

Esta versión incluye una variedad de correcciones de errores y mejoras de estabilidad en toda la aplicación. La lista completa se puede encontrar en el [registro de cambios](https://github.com/Mechanical-Advantage/AdvantageScope/releases) de la versión, pero algunas correcciones notables se enumeran a continuación:

- El rendimiento de AdvantageScope al transmitir datos durante períodos prolongados ha mejorado en gran medida, especialmente al usar la pestaña de gráfico de líneas.
- AdvantageScope ahora es más tolerante a datos de registro inusuales, incluyendo archivos de registro grandes y valores de campo grandes.
- Se han corregido varios problemas visuales al navegar por los datos del registro, especialmente al usar filtros en la pestaña del gráfico de líneas.
- Se ha corregido el orden de los archivos de registro de AdvantageKit en la ventana de descarga; los registros sin marcas de tiempo ahora están en la parte inferior de la lista, similar a otros formatos.
- En la pestaña del campo 3D, las cámaras de los robots con una rotación distinta de cero en el eje de balanceo ahora se visualizan correctamente.
- La estabilidad de AdvantageScope XR ha mejorado, especialmente cuando se ejecuta en iOS/iPadOS 26. Para instalaciones sin conexión, consulta la App Store para ver si hay actualizaciones disponibles.
