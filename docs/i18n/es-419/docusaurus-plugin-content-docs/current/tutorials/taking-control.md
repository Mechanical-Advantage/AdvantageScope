---
sidebar_position: 3
---

# 🕹️ Tomando el control: DS y joysticks

Entender las entradas del conductor y el estado de la comunicación es fundamental al depurar problemas en la cancha. AdvantageScope ofrece integración directa con la [FIRST Driver Station](https://docs.wpilib.org/es/latest/docs/software/firstdriverstation), lo que te permite monitorear diagnósticos en vivo, inspeccionar registros de la Driver Station y visualizar entradas de controles.

En este tutorial aprenderás a:

- Acceder a AdvantageScope directamente desde la **FIRST Driver Station**.
- Conectarte a diagnósticos en vivo de la Driver Station.
- Comparar y sincronizar **registros del robot** con **registros de la Driver Station**.
- Ver salidas de consola y mensajes de error en la pestaña **💬 Consola**.
- Visualizar entradas de joysticks y diseños de controles en la pestaña **🎮 Joysticks**.

## 1. Accede a AdvantageScope desde la FIRST Driver Station

💡 [AdvantageScope Lite](/more-features/advantagescope-lite) está integrado directamente en la FIRST Driver Station. Puedes acceder haciendo clic en el ícono ⚙️ y luego en "Open Log Viewer in Browser".

<img src="/img/tutorials/taking-control-1.webp" alt="El botón &quot;Open Log Viewer In Browser&quot; en la FIRST Driver Station" />

_La imagen de arriba muestra la interfaz en inglés._

## 2. Conéctate a la Driver Station en vivo

Cuando se ejecuta en la misma laptop que la FIRST Driver Station, la aplicación de escritorio AdvantageScope también puede transmitir telemetría y diagnósticos en vivo sobre el estado de la Driver Station:

1. Abre tanto la FIRST Driver Station como AdvantageScope.
2. En el menú superior, selecciona `Archivo` > `Conectar a la Driver Station`.
3. AdvantageScope se conectará al servicio local de la Driver Station para transmitir en tiempo real el estado del partido, voltaje de la batería, estados de los joysticks, etc.
4. Abre la pestaña 📉 [Gráfico de líneas](/tab-reference/line-graph) o 🔢 [Tabla](/tab-reference/table) para ver los diagnósticos en vivo de la DS.

:::tip
También puedes usar el atajo de teclado `Ctrl+Option+Shift+K` (macOS) o `Ctrl+Alt+Shift+K` (Windows/Linux) para conectarte rápidamente a la Driver Station como fuente en vivo.
:::

## 3. Registros de la Driver Station vs. registros del robot

Al diagnosticar el comportamiento del robot después de un partido o sesión de práctica, hay dos tipos principales de registros a considerar:

| Tipo de registro                   | Fuente                               | Datos grabados                                                                                                                                                                                          |
| :--------------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Registros del robot**            | Systemcore mediante `DataLogManager` | Telemetría de alta frecuencia (50+ Hz), estado del robot, estado de joysticks, mediciones de sensores, corrientes de motores, estados de controladores PID, estimaciones de pose y datos de mecanismos. |
| **Registros de la Driver Station** | Laptop de la Driver Station          | Tiempo de ida y vuelta de red (latencia), % de pérdida de paquetes, ping del radio, voltaje de batería, % de CPU del controlador del robot, datos de consola, estado del robot y estado de joysticks.   |

:::important Por lo general se prefieren los registros del robot
Como los **registros del robot** graban telemetría detallada de alta frecuencia directamente en el origen, por lo general son preferibles para investigar el comportamiento del robot, los lazos de control y las rutas autónomas. Sin embargo, los **registros de la DS** capturan eventos externos críticos de red y del partido que el robot no puede medir por sí solo.

Los datos de joysticks se capturan en **ambos registros**, como se muestra [abajo](#6-visualizing-joysticks).
:::

## 4. Combina y sincroniza múltiples registros

AdvantageScope te permite abrir y sincronizar registros de múltiples fuentes en una sola línea de tiempo:

1. Abre el archivo de registro de tu robot usando `Archivo` > `Abrir registro(s)...` (o arrastra el archivo `.wpilog` directamente dentro de AdvantageScope).
2. En la barra de menú, selecciona `Archivo` > `Agregar nuevo(s) registro(s)...` y elige el registro correspondiente de la Driver Station.
3. ¡AdvantageScope alineará automáticamente ambos registros en una línea de tiempo sincronizada! Los campos de cada registro se organizan bajo tablas separadas (por ejemplo, `Log0` y `Log1`).
4. Ahora puedes superponer telemetría del robot (como corriente de motor o estimaciones de pose) directamente junto a señales de la Driver Station (como pérdida de paquetes o voltaje de batería) en el 📉 [Gráfico de líneas](/tab-reference/line-graph) para ver si un comportamiento inesperado del robot coincidió con una caída de radio o un brownout.

<img src="/img/overview/log-files/open-file-1.webp" alt="Apertura de archivos de registro guardados en AdvantageScope." />

_La imagen de arriba muestra la interfaz en inglés._

## 5. Visualiza datos de la consola

La pestaña 💬 [Consola](/tab-reference/console) te permite ver la salida de texto y los registros de errores impresos por el robot o la Driver Station. Los datos de consola pueden guardarse en cualquiera de los dos archivos de registro:

- **Registros del robot:** `DataLogManager` de WPILib graba automáticamente la salida de consola del robot.
- **Registros de la Driver Station:** En la DS, la salida de consola y los mensajes de eventos del sistema se guardan en el campo `DS:/Dscomm/Console`.

Para ver los datos de la consola:

1. Haz clic en el botón **+** en la barra de pestañas y selecciona **Consola**.
2. Desde la barra lateral, arrastra el campo de consola (`DS:/Dscomm/Console` o `messages`) hacia la vista principal.
3. Cada fila representa un mensaje de registro con su marca de tiempo. ¡Haz clic en cualquier mensaje para saltar la línea de tiempo sincronizada en todas las pestañas abiertas a ese momento exacto!
4. Usa el cuadro "Filtrar" (o presiona `Ctrl+F` / `Cmd+F`) para buscar mensajes específicos, o haz clic en el ícono de paleta de colores para activar o desactivar el resaltado de advertencias y errores.

<img src="/img/tab-reference/console-1.webp" alt="Pestaña Consola mostrando mensajes de registro." />

_La imagen de arriba muestra la interfaz en inglés._

## 6. Visualiza los joysticks {#6-visualizing-joysticks}

La pestaña 🎮 [Joysticks](/tab-reference/joysticks) ofrece una representación visual en tiempo real de hasta 6 controles, mostrando movimientos de ejes, gatillos, crucetas (POV) y botones presionados sobre diseños realistas de controles. Para asegurarte de que las entradas de los joysticks se graben en el archivo de registro de tu robot, inicializa `DriverStation.startDataLog()` en el constructor de `Robot` junto con `DataLogManager`, como se muestra en 👋 [¡Hola, telemetría!](/tutorials/hello-telemetry).

1. Haz clic en el botón **+** en la barra de pestañas superior y selecciona **Joysticks**.
2. En la tabla de la parte inferior de la pestaña, asigna a cada ID de joystick (0 a 5) el diseño correspondiente (por ejemplo, **Control de Xbox**, **Control de PS4** o **Joystick genérico**).
3. Al desplazarte por un archivo de registro o transmitir datos en vivo desde la Driver Station, ¡los botones se iluminarán y las palancas analógicas se moverán en sincronía con las acciones del conductor!

<img src="/img/tab-reference/joysticks-1.webp" alt="Pestaña Joysticks mostrando pulsaciones activas de botones del control y posiciones de las palancas analógicas." />

_La imagen de arriba muestra la interfaz en inglés._

## ¿Qué sigue?

¡Felicidades! Has completado la serie principal de tutoriales de AdvantageScope. Ahora sabes cómo:

- Configurar telemetría, conectarte a flujos en vivo y ver gráficos y tablas en **👋 [¡Hola, telemetría!](/tutorials/hello-telemetry)**.
- Visualizar odometría 2D/3D, trayectorias y mecanismos en **🤖 [Al campo](/tutorials/to-the-field)**.
- Transmitir diagnósticos de la Driver Station, combinar registros de múltiples fuentes y reproducir entradas de joysticks en **🕹️ [Tomando el control](/tutorials/taking-control)**.

Sigue explorando las herramientas y funciones avanzadas de AdvantageScope:

- **📂 [Archivos de registro](/overview/log-files):** Aprende sobre formatos de registro compatibles, exportación de datos y descarga por lotes.
- **🛜 [Fuentes en vivo](/overview/live-sources):** Guía detallada sobre cómo conectarse a fuentes en vivo, incluido el modo de ajuste.
- **[Referencia de pestañas](/category/tab-reference):** Guías de referencia sobre las funciones de cada tipo de visualización.
- **[Más funciones](/category/more-features):** Documentación y teoría sobre funciones adicionales de AdvantageScope.
