# 📂 Archivos de registro

## Formatos compatibles

- **WPILOG (.wpilog)** - Producido por el [registro de datos integrado](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) de WPILib y AdvantageKit. [URCL](/more-features/urcl) se puede utilizar para capturar señales de los controladores de motores REV a un archivo WPILOG.
- **Registros de Driver Station (.dslog y .dsevents)** - Producido por la [Driver Station de FRC](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html). AdvantageScope busca automáticamente el archivo de registro correspondiente al abrir cualquier tipo de registro.
- **Hoot (.hoot)** - Producido por el [registrador de señales](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) Phoenix 6 de CTRE.
- **REVLOG (.revlog)** - Producido por el [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de REV Robotics.
- **Road Runner (.log)** - Producido por la biblioteca [Road Runner](https://github.com/acmerobotics/road-runner) para FTC.
- **CSV (.csv)** - Valores separados por comas, que coinciden con el formato [exportado](/overview/log-files/export) por AdvantageScope en los modos "CSV (Tabla)" o "CSV (Lista)". Consulta [aquí](#csv-formatting) para obtener más detalles.
- **RLOG (.rlog)** - Heredado, producido por AdvantageKit 2022.

:::info
Los archivos de registro de Hoot solo se pueden abrir después de aceptar el [acuerdo de licencia de usuario final](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) de CTRE. AdvantageScope muestra un mensaje para confirmar la aceptación de estos términos al abrir un archivo de registro de Hoot por primera vez.
:::

## Apertura de registros

En la barra de menú, haz clic en `Archivo` > `Abrir registro(s)...` (File > Open Log(s)...), luego elige uno o más archivos de registro del disco local. Arrastrar un archivo de registro desde el explorador de archivos del sistema al ícono o a la ventana de AdvantageScope también hace que se abra.

:::info
Si se abren varios archivos simultáneamente, las marcas de tiempo se alinearán automáticamente. Esto permite una fácil comparación de archivos de registro de múltiples fuentes.
:::

<img src="/img/overview/log-files/open-file-1.png" alt="Opening a saved log" />

## Agregar nuevos registros

Después de abrir un archivo de registro, se pueden agregar fácilmente registros adicionales a la visualización. Las marcas de tiempo se realinearán automáticamente para sincronizarse con los datos existentes.

En la barra de menú, haz clic en `Archivo` > `Agregar nuevo(s) registro(s)...`, luego elige uno o más archivos de registro para agregar a la visualización actual. Los campos de cada registro se registrarán en tablas denominadas `Log0`, `Log1`, etc.

## Descarga desde el robot {#downloading-from-the-robot}

<details>
<summary>Configuración</summary>

Abre la ventana de preferencias haciendo clic en `Aplicación` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS). Actualiza la dirección del robot y la carpeta de registro.

<img src="/img/prefs.png" alt="Diagram of preferences" height="350" />
</details>

Haz clic en `Archivo` > `Descargar registros...` para abrir la ventana de descarga. Una vez conectado al robot, los registros disponibles se muestran con el más reciente en la parte superior. Selecciona uno o más archivos de registro para descargar (haz clic y presiona shift para seleccionar un rango o **cmd/ctrl + A** para seleccionar todos). Luego haz clic en el símbolo ↓ y selecciona una ubicación de guardado.

:::info
El [registrador de señales](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de CTRE utiliza un formato no estándar que agrupa los registros en subcarpetas. Selecciona una o más carpetas en la lista para descargar los archivos de registro como grupo.
:::

:::tip
Al descargar varios archivos, AdvantageScope omite cualquiera que ya exista en la carpeta de destino.
:::

<img src="/img/overview/log-files/open-file-2.png" alt="Downloading log files" height="350" />

## Formato CSV {#csv-formatting}

Los nombres de las columnas CSV deben ser "Timestamp, Key, Value" o "Timestamp, (Key), (Key), etc". Los valores de las marcas de tiempo están en segundos. La lista a continuación muestra el formato esperado de los tipos de valores comunes. Ten en cuenta que exportar y volver a importar datos de registro como CSV es _con pérdida_, ya que CSV no admite tipos de campos complejos.

- **Booleanos:** `true` o `false`
- **Cadenas de texto (Strings):** `"(valor)"`
  - Ejemplo: `"Hola mundo"`
- **Arreglos:** `[(valor); (valor); (valor)]`
  - Ejemplo: `[1; 2; 3]`
- **Bytes:** hexadecimal, separados por `-`
  - Ejemplo: `4d-41-36-33-32-38`
