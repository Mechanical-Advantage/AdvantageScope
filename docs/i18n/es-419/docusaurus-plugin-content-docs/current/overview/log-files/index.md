# 📂 Archivos de registro {#log-files}

## Formatos compatibles {#supported-formats}

- **WPILOG (.wpilog)** - Generado por el [registro de datos integrado](https://docs.wpilib.org/es/stable/docs/software/telemetry/datalog.html) de WPILib y por AdvantageKit. También puedes usar [URCL](/more-features/urcl) para guardar señales de controladores de motores REV en un archivo WPILOG.
- **Hoot (.hoot)** - Generado por el [Signal Logger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) de Phoenix 6 de CTRE.
- **REVLOG (.revlog)** - Generado por [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de REV Robotics.
- **Road Runner (.log)** - Generado por la biblioteca [Road Runner](https://github.com/acmerobotics/road-runner) para FTC.
- **CSV (.csv)** - Valores separados por comas que siguen el mismo formato [exportado](/overview/log-files/export) por AdvantageScope en los modos "CSV (Tabla)" o "CSV (Lista)". Consulta [esta sección](#csv-formatting) para ver los detalles.
- **Registros de NI Driver Station (.dslog y .dsevents)** - Formato heredado generado por la [Driver Station de FRC](https://docs.wpilib.org/es/stable/docs/software/driverstation/driver-station.html) de NI (2010-2026). Al abrir cualquiera de los dos archivos, AdvantageScope busca automáticamente su archivo compañero.
- **RLOG (.rlog)** - Formato heredado generado por AdvantageKit 2022.

:::info
Para poder abrir archivos Hoot primero debes aceptar el [acuerdo de licencia de usuario final](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) de CTRE. La primera vez que abras un archivo Hoot, AdvantageScope te mostrará un aviso para confirmar que aceptas los términos.
:::

## Apertura de registros {#opening-logs}

En la barra de menú, haz clic en `Archivo` > `Abrir registro(s)...` y elige uno o más archivos de registro en tu computadora. También puedes arrastrar un archivo desde el explorador de archivos directamente sobre el ícono o la ventana de AdvantageScope.

:::info
Si abres varios archivos a la vez, sus marcas de tiempo se alinearán automáticamente para que puedas comparar registros de distintas fuentes sin esfuerzo. Revisa la página de [Marcas de tiempo](/more-features/timestamps) para ver las opciones de visualización.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Apertura de un registro guardado" />

_La imagen de arriba muestra la interfaz en inglés._

## Agregar nuevos registros {#adding-new-logs}

Una vez que ya tienes un registro abierto, puedes sumar otros archivos a la misma visualización; sus marcas de tiempo se ajustarán automáticamente para sincronizarse con los datos actuales.

Haz clic en `Archivo` > `Agregar nuevo(s) registro(s)...` en la barra de menú y selecciona los archivos que quieras incorporar. Los campos de cada archivo nuevo aparecerán agrupados en tablas llamadas `Log0`, `Log1`, etc.

## Descarga desde el robot {#downloading-from-the-robot}

<details>
<summary>Configuración</summary>

Abre la ventana de preferencias haciendo clic en `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS), y actualiza la dirección del robot y la ruta de registros del robot.

<img src="/img/prefs_es-419.webp" alt="Diagrama de preferencias" height="450" />
</details>

Haz clic en `Archivo` > `Descargar registros...` para abrir la ventana de descarga. La descarga de registros funciona tanto con Systemcore como con el roboRIO. Al conectarse al robot, verás los registros disponibles ordenados del más reciente al más antiguo. Selecciona los archivos o carpetas que quieras bajar (usa Shift + clic para elegir un rango o **cmd/ctrl + A** para seleccionarlos todos), haz clic en el ícono ↓ y elige dónde guardarlos.

:::tip
Cuando descargas varios archivos, AdvantageScope omite automáticamente los que ya existen en la carpeta de destino.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Descarga de archivos de registro" height="350" />

_La imagen de arriba muestra la interfaz en inglés._

## Formato CSV {#csv-formatting}

Los encabezados de las columnas CSV deben ser "Timestamp, Key, Value" o "Timestamp, (Key), (Key), etc", con los valores de tiempo expresados en segundos. A continuación tienes el formato esperado para los tipos de datos más comunes. Ten en cuenta que exportar y volver a importar un registro en CSV implica _pérdida de información_, ya que CSV no admite tipos de campos complejos.

- **Booleanos:** `true` o `false`
- **Cadenas de texto (Strings):** `"(valor)"`
  - Ejemplo: `"Hola mundo"`
- **Arreglos:** `[(valor); (valor); (valor)]`
  - Ejemplo: `[1; 2; 3]`
- **Bytes:** hexadecimal, separados por `-`
  - Ejemplo: `4d-41-36-33-32-38`
