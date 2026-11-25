---
sidebar_position: 1
---

# 👋 ¡Hola, telemetría!

¡Bienvenido a AdvantageScope! La telemetría y el registro de datos son capacidades poderosas que pueden mejorar tu capacidad para entender el código del robot, diagnosticar problemas e implementar soluciones dentro y fuera de la cancha. Estos tutoriales están diseñados para ayudarte a comenzar con la telemetría y aprovechar al máximo todas las capacidades de AdvantageScope.

En este tutorial aprenderás a:

- Configurar telemetría básica del robot en un proyecto Java de WPILib.
- Conectarte a flujos de datos en vivo en AdvantageScope.
- Grabar datos en archivos de registro para revisarlos después.
- Visualizar datos de telemetría usando AdvantageScope.

:::tip ¿Buscas algo más?

- **Equipos de FTC:** Si estás usando el sistema de control actual de FIRST Tech Challenge, consulta la guía de ✴️ [Compatibilidad con FTC](/more-features/ftc-compatibility).
- **Interfaz web:** Hay una versión de AdvantageScope para navegador disponible directamente dentro de la FIRST Driver Station y la interfaz web de Systemcore. Consulta 💡 [AdvantageScope Lite](/more-features/advantagescope-lite) para más detalles.
- **AdvantageKit:** Un framework de registro avanzado diseñado para reproducción determinista en simulación. Consulta la [documentación](https://docs.advantagekit.org) para más detalles. Recomendamos comenzar con la API de telemetría integrada de WPILib, descrita a continuación.
  :::

## 1. Crea un nuevo proyecto de WPILib

Para comenzar, crea un nuevo proyecto Java de WPILib en VS Code:

1. Abre VS Code.
2. Haz clic en el ícono de WPILib en la esquina superior derecha (o presiona `Ctrl+Shift+P` / `Cmd+Shift+P` y escribe **WPILib: Create a new project**).
3. Selecciona **Template** > **Java** > **Command v3 Robot** (o **Command v2 Robot**).
4. Elige una carpeta, ponle nombre a tu proyecto (por ejemplo, `HelloTelemetry`) e ingresa tu número de equipo.
5. Marca **Enable Desktop Support** y haz clic en **Create Project**.

<img src="/img/tutorials/hello-telemetry-1.webp" alt="Creación de un nuevo proyecto Java de WPILib en VS Code usando el Creador de proyectos de WPILib." />

_La imagen de arriba muestra la interfaz en inglés._

## 2. Inicializa el registro de datos

WPILib ofrece registro de datos integrado mediante `DataLogManager`. Cuando se inicia, graba automáticamente toda la telemetría, las entradas de NetworkTables y las entradas de la Driver Station en archivos `.wpilog`.

:::info Recomendación
Aunque los registros se pueden guardar en el almacenamiento interno de Systemcore, la memoria flash interna es limitada. Recomendamos enfáticamente conectar una **memoria USB estándar con formato FAT32** en uno de los puertos USB de Systemcore. `DataLogManager` detectará la unidad y escribirá todos los registros directamente en la memoria USB de forma automática.
:::

Abre `src/main/java/first/robot/Robot.java` e inicializa `DataLogManager` dentro del constructor `Robot()`:

```java
public class Robot extends OpModeRobot {
  // ...

  public Robot() {
    // Inicia DataLogManager para grabar toda la telemetría en un archivo .wpilog en la memoria USB
    DataLogManager.start();

    // También registra los datos de la Driver Station (joysticks, OpMode, estado de habilitación)
    DriverStation.startDataLog(DataLogManager.getLog());
  }

  // ...
}
```

## 3. Publica datos de telemetría

La clase `Telemetry` de WPILib te permite publicar datos con una sola línea de código, organizando los campos en tablas jerárquicas. Esta API admite una amplia variedad de tipos de datos, incluidos valores numéricos, booleanos, cadenas de texto, arreglos y [tipos geométricos](https://docs.wpilib.org/es/stable/docs/software/advanced-controls/geometry/index.html) de WPILib.

:::info
La clase `Telemetry` de WPILib es diferente de la clase `Telemetry` del SDK de FTC. La clase `Telemetry` de WPILib envía información desde el programa del robot hacia dashboards, herramientas de depuración o archivos de registro. Para actualizar la pantalla integrada de la Driver Station, usa la clase `DriverStationDisplay` de WPILib.
:::

Actualiza `src/main/java/first/robot/ExampleTeleop.java`:

```java
@Teleop
public class ExampleTeleop implements OpMode {
  // ...

  @Override
  public void periodic() {
    double currentTime = Timer.getTimestamp();
    double sineWave = Math.sin(currentTime * 2.0);

    // Publica valores de telemetría usando la API Telemetry
    Telemetry.log("Time", currentTime);
    Telemetry.log("SineWave/Value", sineWave);
    Telemetry.log("SineWave/Low", sineWave < 0.5);
  }
}
```

Despliega el código a tu robot (o ejecuta `WPILib: Simulate Robot Code` desde VS Code). En simulación, haz clic en `Teleoperated` > `ExampleTeleop` > `Enable`.

<img src="/img/tutorials/hello-telemetry-2.webp" alt="Habilitación del OpMode ExampleTeleop en la interfaz del simulador." height="200" />

_La imagen de arriba muestra la interfaz en inglés._

:::tip
Los nuevos datos de telemetría solo se publican cuando se llama a `Telemetry.log`. Los métodos periódicos en la clase `Robot`, los OpModes, los subsistemas y los mecanismos pueden estar activos bajo diferentes condiciones; revisa con atención la documentación de la API al decidir dónde colocar las llamadas de registro.
:::

## 4. Conecta AdvantageScope en vivo

Abre la aplicación de escritorio AdvantageScope. En el menú superior, selecciona `Archivo` > `Conectar con el robot` > `NetworkTables` (o `Archivo` > `Conectar con el simulador` si estás simulando). Una vez conectado, la barra lateral izquierda se llenará con los campos publicados bajo `NT:/Telemetry`.

:::tip Atajos de teclado
Presiona `Ctrl+K` / `Cmd+K` para conectarte rápidamente al robot, o `Ctrl+Shift+K` / `Cmd+Shift+K` para conectarte al simulador.
:::

<img src="/img/tutorials/hello-telemetry-3.webp" alt="AdvantageScope conectado al flujo en vivo del robot con los campos listados en el árbol de la barra lateral." />

_La imagen de arriba muestra la interfaz en inglés._

## 5. Visualiza los datos de telemetría

### Gráfico de líneas

El 📉 [Gráfico de líneas](/tab-reference/line-graph) es la pestaña predeterminada en AdvantageScope y ofrece graficación en tiempo real de valores numéricos y discretos.

1. Mira en la barra lateral izquierda bajo `Telemetry` > `SineWave`.
2. Arrastra `Value` al área "Eje izquierdo" del panel de control.
3. Arrastra `Low` al área "Campos discretos" del panel de control.
4. Haz clic en los tres puntos junto a "Campos discretos" y luego en "Mostrar modo del robot".

¡Verás la onda sinusoidal y el estado del robot actualizarse en tiempo real a medida que llegan los datos!

:::info Interacción con el gráfico

- **Pausar / Desplazar:** Desplázate horizontalmente o haz clic y arrastra sobre el gráfico para ver datos pasados. La flecha roja en la esquina superior derecha indica que el desplazamiento automático en vivo está pausado. Haz clic en la flecha o presiona `L` para alternar el desplazamiento automático en vivo.
- **Zoom:** Desplázate arriba/abajo sobre el gráfico, o mantén presionado `Shift` mientras arrastras para hacer zoom en una ventana de tiempo específica.
- **Inspeccionar valores:** Haz clic en cualquier parte del gráfico para colocar un cursor de tiempo y ver los valores exactos en la leyenda.
  :::

<img src="/img/tutorials/hello-telemetry-4.webp" alt="Gráfico de líneas trazando la señal de onda sinusoidal." />

_La imagen de arriba muestra la interfaz en inglés._

### Tabla

La pestaña 🔢 [Tabla](/tab-reference/table) muestra una hoja de cálculo cronológica de los cambios de estado y valor, ideal para diagnosticar transiciones y secuencias de eventos.

1. Haz clic en el botón **+** en la barra de pestañas superior y elige **Tabla**.
2. Desde la barra lateral, arrastra `NT:/Telemetry/SineWave/Value` y `NT:/Telemetry/Low` a la vista de tabla.
3. Se agrega una nueva fila automáticamente cada vez que cambia el valor de cualquiera de los campos mostrados.
4. ¡Haz clic en cualquier fila para saltar de inmediato en todas las pestañas abiertas a ese momento exacto en el tiempo!

:::tip
Las pestañas se pueden reorganizar y renombrar desde la barra de pestañas. Haz clic en el botón de ventana en la barra de título para abrir una pestaña en una ventana separada y ver varias pestañas lado a lado.
:::

<img src="/img/tutorials/hello-telemetry-5.webp" alt="Pestaña Tabla mostrando datos de la onda sinusoidal." />

_La imagen de arriba muestra la interfaz en inglés._

### Estadísticas

La pestaña 📊 [Estadísticas](/tab-reference/statistics) muestra un histograma de valores numéricos, ofreciendo una vista detallada de los datos de uno o más campos.

1. Haz clic en el botón **+** en la barra de pestañas superior y elige **Estadísticas**.
2. Desde la barra lateral, arrastra `NT:/Telemetry/SineWave/Value` a la sección "Mediciones".
3. Configura el "Rango de datos" en `-1` y `1`, y configura el "Tamaño de paso" en `0.1`.
4. Visualiza los datos usando el histograma y las estadísticas de resumen.
5. Desplaza la línea de tiempo en la parte superior para ajustar el rango de datos a incluir.

<img src="/img/tutorials/hello-telemetry-6.webp" alt="Pestaña Estadísticas mostrando datos de la onda sinusoidal." />

_La imagen de arriba muestra la interfaz en inglés._

## 6. Descarga y abre archivos de registro

Después de hacer pruebas o jugar un partido, puedes descargar los archivos `.wpilog` del robot para revisar los datos posteriormente:

1. En la barra de menú, selecciona `Archivo` > `Descargar registros...`.
2. AdvantageScope se conecta al robot y muestra todos los archivos de registro grabados (los más recientes arriba).
3. Selecciona el archivo o los archivos de registro que quieras inspeccionar, haz clic en el ícono de descarga (↓) y elige una carpeta en tu computadora.
4. Abre el archivo descargado usando `Archivo` > `Abrir registro(s)...` o arrastrando el archivo `.wpilog` directamente dentro de AdvantageScope.

<img src="/img/overview/log-files/open-file-2.webp" alt="El cuadro de diálogo de descarga mostrando los archivos WPILOG disponibles en el almacenamiento del robot." height="350" />

_La imagen de arriba muestra la interfaz en inglés._

## ¿Qué sigue?

Ahora que ya tienes telemetría y registro básicos funcionando, lleva tu visualización al siguiente nivel:

- **🤖 [Al campo: visualización del robot](/tutorials/to-the-field):** Aprende a visualizar posiciones del robot en 2D/3D, trayectorias y mecanismos en modelos de campo de FRC y FTC.
- **[Descripción general](/category/overview):** Una guía completa sobre gestión de archivos, atajos de navegación y opciones de transmisión en vivo.
- **[Soporte de unidades](/tab-reference/line-graph/units):** Cómo integrar metadatos de unidades en tus registros para una visualización más precisa.
- **💬 [Consola](/tab-reference/console):** Visualiza registros de texto guardados por `DataLogManager` de WPILib.
- **🔍 [Metadatos](/tab-reference/metadata):** Guarda información adicional para identificar y categorizar archivos de registro.
- **[Epilogue](https://docs.wpilib.org/es/stable/docs/software/telemetry/robot-telemetry-with-annotations.html):** Registra telemetría en Java usando anotaciones.
