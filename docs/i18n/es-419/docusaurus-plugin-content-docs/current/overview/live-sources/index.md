# 🛜 Fuentes en vivo

Todas las visualizaciones en AdvantageScope están diseñadas para recibir datos en vivo de un robot o simulador, además de archivos de registro. Esta sección describe cómo conectarse a fuentes de datos en tiempo real. AdvantageScope admite las siguientes fuentes de datos en vivo:

- **NetworkTables:** Este es el protocolo de red principal de WPILib. Consulta la [documentación de WPILib](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) para obtener más detalles.
- **NetworkTables (AdvantageKit):** Este modo está diseñado para su uso con código de robot que ejecuta AdvantageKit, que publica en la tabla `AdvantageKit` en NetworkTables.
- **Diagnósticos de Systemcore:** Este modo se conecta al servidor NetworkTables incorporado utilizado por el sistema operativo Systemcore, que incluye datos de diagnóstico como el estado del robot y el IO del dispositivo.
- **Diagnósticos de Phoenix:** Este modo utiliza HTTP para conectarse a un [servidor de diagnóstico](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) de Phoenix, lo que permite la transmisión de datos desde dispositivos CAN de CTRE con [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). Esto es similar a la [función de gráficos](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) en Phoenix Tuner. Consulta [esta página](/overview/live-sources/phoenix-diagnostics) para obtener más información.
- **Servidor RLOG:** Este protocolo es compatible con AdvantageKit como alternativa a NetworkTables. La conexión se inicia en el puerto 5800 de manera predeterminada.
- **FTC Dashboard:** Este modo se integra con los robots de FTC que publican datos en [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
AdvantageScope puede conectarse a la FIRST Driver Station para ver datos de diagnóstico cuando se ejecuta en el mismo dispositivo que la aplicación DS. No se requiere configuración (consulta las instrucciones a continuación).
:::

## Iniciar la conexión

Para iniciar la conexión en vivo, sigue estos pasos:

- **Robot:** Haz clic en `Archivo` > `Conectar con el robot` > `Predeterminado` o una fuente en vivo específica
- **Simulador:** Haz clic en `Archivo` > `Conectar con el simulador` > `Predeterminado` o una fuente en vivo específica
- **Driver Station:** Haz clic en `Archivo` > `Conectar a la Driver Station`

El título de la ventana muestra la dirección IP y el texto "Buscando" (Searching) hasta que el objetivo se conecte. AdvantageScope intenta volver a conectarse automáticamente usando la misma configuración después de una desconexión.

## Visualización de datos en vivo

Cuando se conecta a una fuente en vivo, AdvantageScope bloquea todas las pestañas a la hora actual de forma predeterminada. Las vistas como el 📉 [Gráfico de líneas](/tab-reference/line-graph) y la 🔢 [Tabla](/tab-reference/table) se desplazan automáticamente, y las vistas como el campo y los joysticks muestran los valores actuales de cada campo. Al hacer clic en el botón de flecha roja en la barra de navegación se alterna este bloqueo, lo que permite ver y reproducir datos pasados.

<img src="/img/overview/live-sources/open-live-1.png" alt="Live lock/unlock button" />

:::tip
Desplazarse hacia la izquierda en el gráfico de líneas o en la línea de tiempo desbloquea la vista del tiempo actual, y desplazarse completamente hacia la derecha la vuelve a bloquear al tiempo actual.
:::

## Configuración

Abre la ventana de preferencias haciendo clic en `Aplicación` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS).

<img src="/img/prefs.png" alt="Diagram of preferences" height="350" />

### Dirección del robot

Ingresa la dirección del robot usando una dirección IP 10.TE.AM.2 como se describe en la [documentación de WPILib](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Cuando te conectes a Systemcore por USB o al punto de acceso Wi-Fi incorporado, haz clic en `Archivo` > `Usar dirección USB de Systemcore`/`Usar dirección Wi-Fi de Systemcore` para usar temporalmente la dirección IP estática correcta.

### Modo en vivo

Cuando se utiliza NetworkTables como fuente en vivo, se pueden seleccionar los siguientes modos en vivo:

- **Bajo ancho de banda (Predeterminado):** AdvantageScope solo solicita datos del servidor para los campos que se están utilizando activamente. Los datos publicados antes de que se seleccionara un campo no estarán disponibles. Este modo es **muy recomendado** cuando se ejecuta en un entorno con ancho de banda de red limitado o cuando se publica una gran cantidad de campos.
- **Registro:** AdvantageScope solicita datos para todos los campos independientemente de si se están utilizando activamente. Esto significa que los campos se pueden ver de forma retroactiva pausando el flujo de datos en vivo (ver a continuación). Este modo suele ser útil durante el desarrollo, pero **NO debe utilizarse cuando el ancho de banda es limitado**.

### Descartar datos en vivo

Durante una conexión en vivo, los datos se almacenan localmente para permitir la reproducción de datos pasados (consulta "Visualización de datos en vivo" a continuación). Para evitar un uso de memoria muy alto, los datos se descartan después de 20 minutos de forma predeterminada. Se puede seleccionar un período más corto para reducir el uso de la memoria, o se puede seleccionar "Nunca" (Never) para almacenar datos en vivo de forma indefinida.
