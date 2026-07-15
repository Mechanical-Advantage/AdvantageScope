---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL

:::info
Nuevo en 2026, REVLib incluye una solución de registro oficial para guardar datos del Spark Max y Spark Flex a un log de REV CAN (`.revlog`). Consulta [aquí](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) para obtener más detalles. Estos archivos se pueden abrir directamente en AdvantageScope, pero no se pueden sincronizar con precisión con otras fuentes de datos.

El Registrador no oficial compatible con REV (URCL) de AdvantageScope también permanecerá disponible para los equipos en 2026 para garantizar una transición sin problemas y proporcionar paridad de funciones con las temporadas anteriores. Tendremos más detalles para compartir sobre las opciones de registro en 2027 y más allá en una fecha posterior.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) es una biblioteca de registro disponible para Java, C++ y Python que registra datos automáticamente de los dispositivos Spark Max y Spark Flex. Esto permite la creación de gráficos en vivo y el registro de todos los dispositivos de manera similar a la [función de gráficos Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) de CTRE y el [registrador de señales de Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html).

Después de la configuración, las tramas de CAN periódicas de todos los dispositivos Spark Max y Spark Flex se publican en NetworkTables o DataLog. Al usar NetworkTables, se puede usar el [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) de WPILib para capturar los datos en un archivo de registro. Estas tramas se pueden ver en AdvantageScope (consulta [Administración de archivos de registro](/overview/log-files) y [Conexión a fuentes en vivo](/overview/live-sources)).

- **Todas las señales** se capturan automáticamente, **sin configuración manual para nuevos dispositivos**.
- **Cada trama es capturada**, incluso cuando el período de la trama de estado es más rápido que el ciclo del bucle del robot.
- Las tramas se registran con **marcas de tiempo basadas en el tiempo de recepción de CAN (RX time)**, lo que permite una caracterización de aceleración más precisa con [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) en comparación con el registro tradicional en el código del usuario (consulta "Uso de SysId" a continuación).
- El registro es **altamente eficiente**; las operaciones son subprocesadas y se ejecutan en menos de 80µs por ciclo periódico de 20ms, incluso cuando se registra una gran cantidad de dispositivos.
- **Todas las funciones de REVLib no se ven afectadas.**

:::info
Como esta biblioteca no es una herramienta oficial de REV, las consultas de soporte deben dirigirse a la [página de issues](https://github.com/Mechanical-Advantage/URCL/issues) de URCL o a software@team6328.org en lugar del contacto de soporte de REV.
:::

## Configuración

Instala la dependencia de proveedor (vendordep) de URCL siguiendo las instrucciones para instalar [bibliotecas de terceros](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) utilizando el administrador de dependencias en VSCode. Alternativamente, puedes usar la siguiente URL JSON de proveedor:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL publica en NetworkTables de manera predeterminada, donde los datos se pueden guardar en un archivo de registro habilitando el DataLogManager de WPILib. Alternativamente, URCL puede registrar directamente en un DataLog. El registrador debe iniciarse en `robotInit`, como se muestra a continuación.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // Si se publica en NetworkTables y DataLog
  DataLogManager.start();
  URCL.start();

  // Si solo se registra en DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // Si se publica en NetworkTables y DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // Si solo se registra en DataLog
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
        # Si se publica en NetworkTables y DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # Si solo se registra en DataLog
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
La compatibilidad de URCL con AdvantageKit se proporciona solo por conveniencia; los datos guardados en el archivo de registro NO están disponibles en la reproducción. **Los controladores de motores REV aún deben ser parte de una implementación de IO con entradas definidas para soportar la reproducción**.
:::

</TabItem>
</Tabs>

Para identificar más fácilmente los dispositivos en el registro, los ID de CAN se pueden asignar a alias pasando un objeto de mapa al método `start()` o `startExternal()`. Las claves son los ID de CAN y los valores son cadenas de texto para los nombres a usar en el registro. A cualquier dispositivo al que no se le asigne un alias se registrará usando sus nombres predeterminados.

:::warning
Para minimizar el uso de CAN, la mayoría de las tramas de estado para los dispositivos Spark están **deshabilitadas por defecto** hasta que se llama al método captador (getter) asociado. Cualquier dato incluido en estas tramas de estado deshabilitadas no estará disponible en el registro de URCL.

Para obtener más detalles, consulta la [documentación de REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). Recomendamos usar el [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) al configurar el Spark para habilitar manualmente cualquier señal que desees incluir en el archivo de registro.
:::

## Uso de SysId

1. Después de configurar URCL como se muestra arriba, configura la rutina SysId usando `null` para el consumidor del registro del mecanismo. A continuación se muestra un ejemplo para Java. Esta configuración se puede realizar dentro de la clase del subsistema.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Crea la rutina SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Sin consumidor de registro, ya que los datos son registrados por URCL
    subsystem
  )
);

// Los métodos a continuación devuelven objetos Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Crea la rutina SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Sin consumidor de registro, ya que los datos son registrados por URCL
    subsystem
  )
);

// Los métodos a continuación devuelven objetos Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Ejecuta la rutina SysId en el robot. Los comandos SysId se pueden configurar como rutinas autónomas o conectarse a un activador de botón (trigger).

3. Descarga el archivo de registro y ábrelo en AdvantageScope. En la barra de menú, ve a `Archivo` > `Exportar datos...`. Establece el formato en "WPILOG" y el conjunto de campos en "Incluir generados". Haz clic en el ícono de guardar y elige una ubicación para guardar el registro.

:::warning
El archivo de registro del robot debe abrirse y exportarse por AdvantageScope _antes de abrirlo usando el analizador SysId_. Esto es necesario para convertir los datos CAN registrados por URCL a un formato compatible con SysId.
:::

4. Abre el analizador SysId buscando "WPILib: Start Tool" en la paleta de comandos de VSCode y eligiendo "SysId" (o usando el lanzador de escritorio en Windows). Abre el archivo de registro exportado haciendo clic en "Open data log file..."

5. Elige los siguientes campos a continuación para ejecutar el análisis usando el codificador predeterminado. También se pueden utilizar los datos de posición y velocidad de codificadores secundarios (alternativos, externos, analógicos, absolutos, etc.).

   - Posición (Position) = "NT:/URCL/&lt;Dispositivo&gt;/MotorPositionRotations"
   - Velocidad (Velocity) = "NT:/URCL/&lt;Dispositivo&gt;/MotorVelocityRPM"
   - Voltaje (Voltage) = "NT:/URCL/&lt;Dispositivo&gt;/AppliedOutputVoltage"

:::tip
Las ganancias producidas por SysId utilizarán las unidades que el Spark Max/Flex está configurado para informar (utilizando [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) y [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). De forma predeterminada, estas son rotaciones y RPM sin engranajes aplicados. Si las unidades utilizadas al registrar datos no coinciden con las unidades deseadas, la escala se puede ajustar en SysId durante el análisis.
:::
