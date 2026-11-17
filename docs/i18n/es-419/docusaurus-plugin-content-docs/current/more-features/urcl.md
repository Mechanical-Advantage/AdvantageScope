---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL {#unofficial-rev-compatible-logger}

:::info
Como novedad en 2026, REVLib incluye una solución oficial de registro para guardar datos de Spark Max y Spark Flex en un registro de REV CAN (`.revlog`). Puedes ver los detalles [aquí](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger). AdvantageScope puede abrir estos archivos directamente, pero no los puede sincronizar con precisión con otras fuentes de datos.

El Registrador no oficial compatible con REV (URCL) de AdvantageScope también seguirá disponible durante 2026 para facilitar la transición y mantener las mismas funciones de temporadas anteriores. Más adelante compartiremos más detalles sobre las opciones de registro para 2027 en adelante.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) es una biblioteca de registro para Java, C++ y Python que guarda automáticamente los datos de los Spark Max y Spark Flex. Así puedes graficar en vivo y registrar todos tus dispositivos, de forma muy similar a la [función de gráficos de Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) de CTRE y al [registrador de señales de Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html).

Una vez configurado, las tramas CAN periódicas de todos los dispositivos Spark Max y Spark Flex se publican en NetworkTables o DataLog. Si usas NetworkTables, puedes activar [DataLogManager](https://docs.wpilib.org/es/stable/docs/software/telemetry/datalog.html) de WPILib para guardar esos datos en un archivo de registro y verlos en AdvantageScope (consulta [Administración de archivos de registro](/overview/log-files) y [Conexión a fuentes en vivo](/overview/live-sources)).

- **Todas las señales** se capturan automáticamente, **sin configuración manual para dispositivos nuevos**.
- **Se captura cada trama**, incluso cuando el período de la trama de estado es más rápido que el ciclo principal del robot.
- Las tramas se guardan con **marcas de tiempo basadas en el momento de recepción CAN (RX time)**, lo que te da una caracterización de aceleración más precisa en [SysId](https://docs.wpilib.org/es/stable/docs/software/pathplanning/system-identification/introduction.html) que el registro tradicional en código de usuario (mira "Uso de SysId" más abajo).
- El registro es **muy eficiente**: corre en un hilo separado y toma menos de 80 µs por ciclo periódico de 20 ms, incluso con muchos dispositivos.
- **Todas las funciones de REVLib siguen operando sin cambios.**

:::info
Como esta biblioteca no es una herramienta oficial de REV, envía tus dudas o reportes a la [página de issues](https://github.com/Mechanical-Advantage/URCL/issues) de URCL o a software@team6328.org en lugar de contactar al soporte de REV.
:::

## Configuración {#setup}

Instala la vendordep de URCL siguiendo los pasos para [bibliotecas de terceros](https://docs.wpilib.org/es/stable/docs/software/vscode-overview/3rd-party-libraries.html) desde el administrador de dependencias de VSCode, o usa directamente esta URL del archivo JSON:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL publica en NetworkTables de forma predeterminada, donde puedes guardar los datos activando `DataLogManager` de WPILib. También puede registrar directo en un `DataLog`. Inicia el registrador en `robotInit`, como se muestra abajo:

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // Si publicas en NetworkTables y DataLog
  DataLogManager.start();
  URCL.start();

  // Si solo registras en DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // Si publicas en NetworkTables y DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // Si solo registras en DataLog
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # Si publicas en NetworkTables y DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # Si solo registras en DataLog
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
La compatibilidad de URCL con AdvantageKit es solo por comodidad; los datos guardados no están disponibles en la reproducción (replay). **Los controladores de motores REV deben seguir formando parte de una implementación IO con entradas definidas para soportar reproducción.**
:::

</TabItem>
</Tabs>

Para identificar cada dispositivo más fácil en el registro, puedes asignar alias a los ID de CAN pasando un objeto de mapa (`Map`) al método `start()` o `startExternal()`. Las claves son los ID de CAN y los valores son los nombres que quieres ver en el registro. Los dispositivos sin alias usarán su nombre predeterminado.

:::warning
Para reducir el uso del bus CAN, la mayoría de las tramas de estado de los dispositivos Spark vienen **deshabilitadas de forma predeterminada** hasta que llamas al método getter correspondiente. Los datos de esas tramas deshabilitadas no aparecerán en el registro de URCL.

Consulta la [documentación de REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) para más detalles. Te recomendamos usar [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) al configurar cada Spark para habilitar manualmente todas las señales que quieras incluir en el registro.
:::

## Uso de SysId {#sysid-usage}

1. Tras configurar URCL como se explicó arriba, configura la rutina de SysId pasando `null` como consumidor de registro del mecanismo. Aquí tienes un ejemplo en Java que puedes poner dentro de la clase del subsistema.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Crea la rutina de SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Sin consumidor de registro, porque URCL ya guarda los datos
    subsystem
  )
);

// Estos métodos devuelven objetos Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Crea la rutina de SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Sin consumidor de registro, porque URCL ya guarda los datos
    subsystem
  )
);

// Estos métodos devuelven objetos Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Ejecuta la rutina de SysId en el robot. Puedes configurar los comandos de SysId como rutinas autónomas o asignarlos a un botón (trigger).

3. Descarga el archivo de registro y ábrelo en AdvantageScope. En la barra de menú, ve a `Archivo` > `Exportar datos...`. Elige el formato "WPILOG" y selecciona "Incluir generados" en el conjunto de campos. Haz clic en el ícono de guardar y elige dónde guardar el archivo.

:::warning
Primero debes abrir y exportar el archivo de registro en AdvantageScope _antes de cargarlo en el analizador de SysId_. Este paso convierte los datos CAN de URCL a un formato que SysId puede leer.
:::

4. Abre el analizador de SysId buscando "WPILib: Start Tool" en la paleta de comandos de VSCode y eligiendo "SysId" (o desde el lanzador de escritorio en Windows). Luego haz clic en "Open data log file..." para abrir el archivo exportado.

5. Selecciona estos campos para hacer el análisis con el codificador predeterminado (también puedes usar la posición y velocidad de codificadores secundarios: alternativos, externos, analógicos, absolutos, etc.):

   - Posición (Position) = "NT:/URCL/&lt;Dispositivo&gt;/MotorPositionRotations"
   - Velocidad (Velocity) = "NT:/URCL/&lt;Dispositivo&gt;/MotorVelocityRPM"
   - Voltaje (Voltage) = "NT:/URCL/&lt;Dispositivo&gt;/AppliedOutputVoltage"

:::tip
Las ganancias que calcule SysId usarán las mismas unidades que tenga configuradas el Spark Max/Flex mediante [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) y [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>). Por defecto son rotaciones y RPM sin relación de transmisión. Si las unidades del registro no coinciden con las que necesitas, puedes ajustar la escala dentro de SysId durante el análisis.
:::
