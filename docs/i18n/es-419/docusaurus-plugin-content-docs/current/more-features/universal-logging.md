---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 Registro universal con WPILOG

WPILOG es el formato de registro abierto estándar usado en todo el ecosistema de WPILib. Con AdvantageScope, WPILOG puede funcionar como un contenedor universal para múltiples archivos y formatos de registro. Esto significa que un solo archivo `.wpilog` puede contener múltiples flujos de datos codificados en cualquier formato compatible con AdvantageScope, incluidos CSV, registros específicos de fabricantes o archivos WPILOG adicionales.

Esta función está diseñada para simplificar el diagnóstico al recopilar **todos los datos de diagnóstico de un robot en un solo archivo de registro universal**; no es necesario descargar, asociar ni sincronizar varios archivos de registro de un mismo partido, incluso al recopilar datos de bibliotecas de terceros o servicios externos. Por ejemplo, un solo archivo WPILOG puede contener:

- Telemetría estándar del robot publicada mediante la API `Telemetry` de WPILib o NetworkTables.
- Señales de dispositivos de alta frecuencia registradas por bibliotecas de fabricantes.
- Datos de estado de coprocesadores y servicios externos registrados en CSV o WPILOG.
- ¡...y más!

Todos estos datos aparecen en un único árbol unificado en AdvantageScope, como se muestra abajo con un WPILOG que contiene señales de dispositivos capturadas por varios fabricantes.

:::note
En Systemcore, [URCL](https://github.com/Mechanical-Advantage/URCL) fue reemplazado por el [status logger](https://docs.revrobotics.com/revlib/logs) oficial de REV. El registro universal con AdvantageScope permite que el status logger oficial grabe datos de todos los dispositivos REV en un solo archivo WPILOG (similar a URCL).
:::

<img src="/img/more-features/universal-logging-1.webp" alt="Un archivo WPILOG que muestra varios registros de fabricantes en la barra lateral." />

_La imagen de arriba muestra la interfaz en inglés._

:::tip
Los usuarios de AdvantageKit también pueden aprovechar la compresión XZ para reducir significativamente el tamaño de los registros de terceros almacenados dentro de un WPILOG. Consulta la documentación de AdvantageKit sobre receptores de datos de registro para más detalles.
:::

## Experimental: Registro de fabricantes {#experimental-vendor-logging}

Muchos proyectos de robot generan varios archivos de registro al mismo tiempo: un archivo WPILOG estándar para la telemetría de WPILib/AdvantageKit junto con archivos propietarios de bibliotecas de fabricantes. El registro universal elimina esta división al incrustar esos registros de fabricantes directamente en el `.wpilog` principal. Consulta las instrucciones abajo para WPILib y AdvantageKit.

:::warning
Como este enfoque no cuenta con soporte oficial de los fabricantes, las solicitudes de soporte deben dirigirse a la [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues) de AdvantageScope o a software@team6328.org. Consulta [Exportación de datos de fabricantes](#exporting-vendor-data) para saber cómo exportar los archivos de registro originales para diagnóstico.
:::

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

Descarga la clase [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) y colócala en el proyecto de tu robot. Esta clase captura automáticamente los datos de los registros de fabricantes en el `DataLog` activo y debe configurarse en el constructor de `Robot` como se muestra abajo. Debes seleccionar un directorio adecuado (recomendamos `/home/systemcore/logs/`) para almacenar temporalmente los registros de fabricantes durante la captura. Consulta la sección [Cómo funciona](#how-it-works) para más detalles.

```java
public Robot() {
  // Inicia DataLogManager de WPILib normalmente
  DataLogManager.start();

  // Habilita la captura de registros de fabricantes desde un directorio temporal
  // Recomendamos almacenar temporalmente los registros de fabricantes en el almacenamiento interno
  // incluso al usar una unidad USB (los registros de fabricantes no persisten después de la captura)
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // Inicia el registrador del fabricante DESPUÉS de habilitar la captura de registros
  // Si es configurable, el directorio de salida debe coincidir con la ruta anterior
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

Descarga los archivos [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) y [`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) y colócalos en el proyecto de tu robot. Esta clase captura automáticamente los datos de los registros de fabricantes en el `DataLog` activo y debe configurarse en el constructor de `Robot` como se muestra abajo. Debes seleccionar un directorio adecuado (recomendamos `/home/systemcore/logs/`) para almacenar temporalmente los registros de fabricantes durante la captura. Consulta la sección [Cómo funciona](#how-it-works) para más detalles.

```cpp
Robot::Robot() {
  // Inicia DataLogManager de WPILib normalmente
  wpi::DataLogManager::Start();

  // Habilita la captura de registros de fabricantes desde un directorio temporal
  // Recomendamos almacenar temporalmente los registros de fabricantes en el almacenamiento interno
  // incluso al usar una unidad USB (los registros de fabricantes no persisten después de la captura)
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // Inicia el registrador del fabricante DESPUÉS de habilitar la captura de registros
  // Si es configurable, el directorio de salida debe coincidir con la ruta anterior
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

Descarga el archivo [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) y colócalo en el proyecto de tu robot. Este asistente captura automáticamente los datos de los registros de fabricantes en el `DataLog` activo y debe configurarse en `robotInit` como se muestra abajo. Debes seleccionar un directorio adecuado (recomendamos `/home/systemcore/logs/`) para almacenar temporalmente los registros de fabricantes durante la captura. Consulta la sección [Cómo funciona](#how-it-works) para más detalles.

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # Inicia DataLogManager de WPILib normalmente
        wpilib.DataLogManager.start()

        # Habilita la captura de registros de fabricantes desde un directorio temporal
        # Recomendamos almacenar temporalmente los registros de fabricantes en el almacenamiento interno
        # incluso al usar una unidad USB (los registros de fabricantes no persisten después de la captura)
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # Inicia el registrador del fabricante DESPUÉS de habilitar la captura de registros
        # Si es configurable, el directorio de salida debe coincidir con la ruta anterior
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit (Próximamente)">

La captura de registros de fabricantes está integrada en AdvantageKit y se puede habilitar como se muestra abajo. Debes seleccionar un directorio adecuado (recomendamos `/home/systemcore/logs/`) para almacenar temporalmente los registros de fabricantes durante la captura. Consulta la sección [Cómo funciona](#how-it-works) para más detalles.

```java
public Robot() {
  // Habilita la captura de registros de fabricantes desde un directorio temporal
  // Recomendamos almacenar temporalmente los registros de fabricantes en el almacenamiento interno
  // incluso al usar una unidad USB (los registros de fabricantes no persisten después de la captura)
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // Inicia AdvantageKit normalmente
  Logger.start();

  // Inicia el registrador del fabricante DESPUÉS del registrador de AdvantageKit
  // Si es configurable, el directorio de salida debe coincidir con la ruta anterior
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
Independientemente de los receptores de datos de registro seleccionados, los registros de fabricantes solo se pueden ver descargando un archivo WPILOG. La transmisión en vivo no es compatible debido a la estructura de los datos de registro capturados.
:::

</TabItem>
</Tabs>

Ten en cuenta que algunos registradores de fabricantes comienzan a escribir datos _inmediatamente_ cuando se instancia la clase del dispositivo correspondiente (por ejemplo, `SparkMax`). Recomendamos esperar para instanciar los objetos de hardware hasta el final del constructor de `Robot` para asegurar que se capturen los registros.

### Cómo funciona {#how-it-works}

1. **Captura:** El programa del robot ejecuta el registro estándar de WPILib junto con los registradores de fabricantes. Un asistente ligero lee periódicamente los datos nuevos escritos por los registradores de fabricantes y empaqueta los fragmentos sin procesar directamente en el flujo activo de `DataLog`.
2. **Almacenamiento:** Todo el registro combinado se guarda en un solo archivo `.wpilog` (por ejemplo, en una memoria USB conectada a Systemcore). Los archivos temporales de registro de fabricantes creados en el robot no persisten entre reinicios, evitando que se llene el almacenamiento.
3. **Visualización:** Cuando AdvantageScope abre el archivo `.wpilog`, descubre automáticamente cualquier entrada de registro incrustada, decodifica su contenido y fusiona todos los campos en el árbol de la barra lateral junto con la telemetría estándar.
4. **Extracción:** Si necesitas abrir un registro de fabricante para soporte o diagnóstico avanzado, los archivos originales pueden extraerse sin pérdidas del `.wpilog` como se describe en [Exportación de datos de fabricantes](#exporting-vendor-data).

Los datos de registros externos se guardan en el formato WPILOG usando una entrada sin procesar cuyo tipo sigue la convención `log:<formato>`. Al analizar uno de estos campos, AdvantageScope concatena todos los registros binarios de esa entrada en orden cronológico y decodifica la carga resultante como un registro independiente en el formato especificado. Luego, las señales decodificadas se fusionan en el árbol principal de campos y se sincronizan automáticamente con los datos existentes.

:::tip
El registro universal con WPILOG no se limita a los registros de fabricantes; cualquier formato de registro compatible con AdvantageScope puede incrustarse dentro de un WPILOG usando la misma convención.
:::

### Exportación de datos de fabricantes {#exporting-vendor-data}

Aunque los datos de los registros de fabricantes se pueden explorar directamente en AdvantageScope, a veces puede ser necesario extraer el registro original tal como lo generó la biblioteca correspondiente (por ejemplo, para inspeccionarlo en utilidades específicas del fabricante).

Para exportar un registro secundario individual directamente desde AdvantageScope, haz clic derecho sobre la entrada del registro secundario en la barra lateral y selecciona **Exportar registro original...**.

Para extracción por lotes, también puedes usar el script de Python [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py), que busca en uno o más archivos `.wpilog` o `.wpilogxz` todos los registros de fabricantes integrados y los exporta a archivos separados:

```bash
pip3 install robotpy-wpiutil # Dependencia requerida
python3 extract_vendor_logs.py path/to/source.wpilog
```
