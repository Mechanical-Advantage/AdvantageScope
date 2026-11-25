---
title: ¿Qué hay de nuevo en 2027?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

¡Ya está disponible la versión 2027 de AdvantageScope, con soporte completo para Systemcore y más de **100 nuevas funciones y actualizaciones** en toda la aplicación! Consulta la [documentación de instalación](/overview/installation) y el [registro de cambios completo](https://github.com/Mechanical-Advantage/AdvantageScope/releases) para ver los detalles. Esta página destaca las principales novedades y mejoras de esta versión.

**¡Valoramos tus comentarios! Tus sugerencias, solicitudes de funciones y reportes de errores son bienvenidos en la [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Compatibilidad con Systemcore {#systemcore-compatibility}

AdvantageScope 2027 está diseñado para funcionar sin problemas con el nuevo controlador de robot Systemcore y WPILib 2027:

- La dirección predeterminada del robot ahora es `robot.local`, lo que te permite conectarte en vivo o descargar registros sin configurar un número de equipo. Las direcciones USB y Wi-Fi de Systemcore también se pueden seleccionar desde la barra de menú.
- La [descarga de registros](/overview/log-files#downloading-from-the-robot) ahora admite SFTP para Systemcore junto con la descarga de registros heredada de roboRIO.
- Se agregó el sistema de coordenadas [Centro/rojo](/more-features/coordinate-systems#center-red) utilizado por los campos de FRC a partir de 2027 y los campos de FTC a partir de 2027-2028.
- Se agregó soporte para las API `Telemetry` y `Tunables` de WPILib 2027, colores de alerta actualizados y una nueva [preferencia de visualización de marcas de tiempo](/more-features/timestamps) para que las marcas de tiempo de Systemcore sean fáciles de leer.
- Un nuevo modo en vivo [Diagnósticos de Systemcore](/overview/live-sources) se conecta directamente al servidor NetworkTables integrado de Systemcore para monitorear el estado del robot y la E/S de hardware sin necesidad de código de usuario.

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite) lleva las herramientas de visualización y análisis de AdvantageScope directamente a tu navegador web. Es accesible tanto desde la interfaz web de Systemcore como dentro de la Driver Station de FIRST **sin necesidad de instalación**.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="Demostración de AdvantageScope Lite" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope se integra estrechamente con la nueva [FIRST Driver Station](https://docs.wpilib.org/es/latest/docs/software/firstdriverstation) para agilizar el diagnóstico de partidos:

- Se puede acceder a [AdvantageScope Lite](/more-features/advantagescope-lite) directamente desde el menú de configuración de la FIRST Driver Station para analizar archivos WPILOG generados por la DS.
- Usa la aplicación de escritorio para transmitir en tiempo real el estado del partido, métricas de comunicación, voltaje de la batería y entradas de joysticks desde una Driver Station local sin configuración adicional.
- Al abrir un archivo `.wpilog` de la Driver Station en la versión de escritorio, AdvantageScope pregunta si deseas abrir una ventana dedicada preconfigurada con pestañas para salida de consola, métricas de comunicación, energía, uso de CPU y joysticks ([documentación](/overview/log-files#driver-station-layout)). Esta disposición también se usa de forma predeterminada en AdvantageScope Lite para la Driver Station.
- Visualiza los registros de consola de la Driver Station en la pestaña 💬 [Consola](/tab-reference/console) con resaltado automático de advertencias/errores y soporte completo para [secuencias de escape ANSI](/tab-reference/console#ansi-formatting) (colores y estilos de texto).

<img src="/img/tutorials/taking-control-1.webp" alt="Apertura de AdvantageScope Lite desde la FIRST Driver Station" />

_La imagen de arriba muestra la interfaz en inglés._

## 🌐 Soporte de idiomas {#language-support}

AdvantageScope ahora está disponible en **14 idiomas** en la aplicación de escritorio, el sitio de documentación, las aplicaciones móviles y AdvantageScope Lite: inglés (EE. UU.), español (Latinoamérica), francés, neerlandés, portugués (Brasil), rumano, turco, ruso, kazajo, hebreo, árabe, hindi, chino simplificado y chino tradicional.

:::info
Las traducciones son un trabajo en progreso creado con el apoyo de inteligencia artificial y colaboradores de la comunidad, y **pueden incluir frases poco naturales o imprecisiones**. ¡Gracias a los equipos que ya han ayudado a revisar y perfeccionar estas traducciones! Consulta la página 🌐 [Soporte de idiomas](/overview/language-support) para conocer los detalles de nuestro proceso de traducción y cómo enviar comentarios.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="Pestaña de gráfico de líneas en chino simplificado" />

## 📖 Nuevos tutoriales y documentación {#new-tutorials-and-documentation}

La documentación se ha ampliado con una nueva [serie de tutoriales](/category/tutorials) de tres partes diseñada para ayudar a los equipos a comenzar con WPILib 2027 y AdvantageScope:

1. **👋 [¡Hola, telemetría!](/tutorials/hello-telemetry):** Configurar `DataLogManager` y la API `Telemetry`, conectarse en vivo y analizar datos con gráficos de líneas, tablas y estadísticas.
2. **🤖 [Al campo: visualización del robot](/tutorials/to-the-field):** Publicar poses 2D/3D, trayectorias y objetos `Mechanism2d` en campos de FRC y FTC.
3. **🕹️ [Tomando el control: DS y joysticks](/tutorials/taking-control):** Transmitir diagnósticos en vivo de la Driver Station, sincronizar registros del robot y de la DS, ver la salida de la consola y visualizar entradas de controles.

Los ejemplos de código en toda la documentación también se han actualizado con cobertura completa para la API `Telemetry` de WPILib en varios lenguajes.

<img src="/img/tutorials/to-the-field-4.webp" alt="Visualización de campo 3D del tutorial Al campo" />

_La imagen de arriba muestra la interfaz en inglés._

## 📱 AdvantageTune {#advantagetune}

AdvantageTune es una nueva aplicación independiente para iPhone y iPad que ofrece una experiencia ligera de ajuste móvil para complementar a AdvantageScope. Puedes ver y modificar topics de [NetworkTables](https://docs.wpilib.org/es/stable/docs/software/networktables/index.html) en vivo (incluidos tipos primitivos, arreglos, structs de WPILib y Protobufs) directamente desde tu teléfono, facilitando que todo el equipo participe en el ajuste del código del robot.

Tanto AdvantageTune como AdvantageScope simplifican el proceso de exportar valores ajustados de vuelta al código del robot con botones para guardar todos los valores ajustados en un archivo de texto y compartirlos fácilmente ([documentación](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store_es-419.svg" alt="App Store" />](https://apps.apple.com/mx/app/advantagetune/id6811453643)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="Vista de exploración de AdvantageTune" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="Edición de topics en AdvantageTune" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="Edición de structs en AdvantageTune" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="Lista de valores ajustados en AdvantageTune" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="Búsqueda y filtro en AdvantageTune" />
</div>

_La imagen de arriba muestra la interfaz en inglés._

## 🪐 Registro universal con WPILOG {#wpilog-universal-logging}

Con el [registro universal](/more-features/universal-logging), un solo archivo WPILOG ahora puede servir como un contenedor universal para múltiples flujos y formatos de registro, incluidos registros de dispositivos específicos de fabricantes, datos CSV y archivos WPILOG secundarios. El registro universal reemplaza a URCL con un enfoque flexible e independiente del fabricante: los datos de cada fuente se sincronizan automáticamente y se fusionan en un único árbol unificado en la barra lateral. Consulta la [documentación de registro universal](/more-features/universal-logging#experimental-vendor-logging) para ver los detalles de la captura de registros de fabricantes en AdvantageKit y WPILib (próximamente).

<img src="/img/more-features/universal-logging-1.webp" alt="Un archivo WPILOG que muestra varios registros de fabricantes en la barra lateral" />

_La imagen de arriba muestra la interfaz en inglés._

## 🗺️ Mejoras en las pestañas de campo {#field-tab-improvements}

Se han agregado varias mejoras de usabilidad a las pestañas 🗺️ [Campo 2D](/tab-reference/2d-field) y 👀 [Campo 3D](/tab-reference/3d-field):

- Desplázate y haz zoom por el campo 2D, o haz clic derecho para fijar la cámara y seguir la posición y rotación del robot ([documentación](/tab-reference/2d-field#camera-controls)).
- Se agregó una opción para desvanecer los fantasmas 2D y 3D cuando los campos no se han actualizado recientemente (útil para renderizar poses de visión).
- Se agregaron líneas de cuadrícula de losetas en los campos FTC 2D y 3D para facilitar la referencia espacial.
- AdvantageScope ahora recuerda si se usó por última vez un campo FRC o FTC al abrir nuevas pestañas de campo 2D o 3D.

<img src="/img/tab-reference/2d-field-1.webp" alt="Vista general de la pestaña Campo 2D" />

_La imagen de arriba muestra la interfaz en inglés._

## 📉 Mejoras en el gráfico de líneas {#line-graph-improvements}

El 📉 [Gráfico de líneas](/tab-reference/line-graph) y la línea de tiempo incluyen varias mejoras visuales para un análisis más claro:

- Al habilitar "Mostrar modo del robot", ahora se muestra una barra codificada por colores para los períodos autónomo, teledirigido, utilidad y deshabilitado.
- Los gráficos de estilo de puntos escalan automáticamente el tamaño de los puntos para una mejor visibilidad en cualquier nivel de zoom.
- Aparecen sugerencias útiles en el gráfico de líneas y la línea de tiempo para guiar a los nuevos usuarios sobre los gestos de desplazamiento y zoom.
- Se mejoró el renderizado y la legibilidad de valores grandes de marcas de tiempo en los ejes de la línea de tiempo y del gráfico de líneas.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Superposición del modo del robot codificado por colores en el gráfico de líneas" />

_La imagen de arriba muestra la interfaz en inglés._

## 🤝 Mejoras de accesibilidad {#accessibility-enhancements}

AdvantageScope 2027 incluye varias actualizaciones para hacer la aplicación más accesible:

- Se agregó navegación por teclado con Tab para todas las entradas e información sobre herramientas descriptiva para todos los controles de la aplicación.
- AdvantageScope ahora respeta la configuración del sistema operativo para "reducir la transparencia" y "reducir el movimiento".
- Los indicadores booleanos en la barra lateral ahora distinguen estados sin depender únicamente del color.

## 🥔 Nuevos tipos de unidades {#new-unit-types}

Los [gráficos con reconocimiento de unidades](/tab-reference/line-graph/units) de AdvantageScope se han ampliado con tipos de unidades y opciones de análisis adicionales:

- Potencia (vatios, caballos de fuerza, etc.)
- Relaciones (adimensional, porcentaje)
- Temperatura en Kelvin
- Energía de papa
- Ortografía de unidades en inglés británico (por ejemplo, `metres`)
- Sufijos para la biblioteca de unidades de WPILib

## 🧱 Mejoras de estabilidad {#stability-improvements}

Esta versión incluye numerosas correcciones de errores, optimizaciones de rendimiento y mejoras de estabilidad en toda la aplicación. La lista completa se encuentra en el [registro de cambios](https://github.com/Mechanical-Advantage/AdvantageScope/releases) de la versión, con aspectos destacados a continuación:

- Las versiones oficiales de Windows ahora están firmadas digitalmente, lo que reduce la frecuencia de advertencias de SmartScreen durante la instalación.
- Se mejoró significativamente el rendimiento de carga y graficación de registros, especialmente al trabajar con registros Hoot (`.hoot`) y arreglos de structs grandes.
- Se corrigió el manejo de marcas de tiempo al ver registros de AdvantageKit junto con fuentes de datos de alta frecuencia.
- Se mejoró el algoritmo de sincronización de marcas de tiempo de múltiples registros al alinear registros de distintas fuentes.
- Se mejoró la confiabilidad de conexión para [Diagnósticos de Phoenix](/overview/live-sources/phoenix-diagnostics).
- Se corrigieron problemas de interfaz con la barra de menú en ventanas separadas y la ventana emergente de grabación en [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- Se refinó el texto y la redacción de la interfaz en toda la aplicación para mejorar la claridad.
