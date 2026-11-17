# 🛜 Fuentes en vivo {#live-sources}

Todas las visualizaciones de AdvantageScope están pensadas no solo para abrir archivos de registro, sino también para recibir datos en vivo desde un robot o simulador. En esta sección te explicamos cómo conectarte a fuentes de datos en tiempo real. AdvantageScope es compatible con las siguientes fuentes:

- **NetworkTables:** Es el protocolo de red principal de WPILib. Puedes ver más detalles en la [documentación de WPILib](https://docs.wpilib.org/es/stable/docs/software/networktables/index.html).
- **NetworkTables (AdvantageKit):** Modo pensado para proyectos que usan AdvantageKit, el cual publica sus datos en la tabla `AdvantageKit` de NetworkTables.
- **Diagnósticos de Systemcore:** Se conecta al servidor de NetworkTables integrado en el sistema operativo Systemcore, que incluye datos de diagnóstico como el estado del robot y la E/S de los dispositivos.
- **Diagnósticos de Phoenix:** Usa HTTP para conectarse a un [servidor de diagnóstico](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) de Phoenix y transmitir datos desde dispositivos CAN de CTRE con [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). Funciona de forma similar a la [función de gráficos](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) en Phoenix Tuner. Consulta [esta página](/overview/live-sources/phoenix-diagnostics) para más información.
- **Servidor RLOG:** Protocolo compatible con AdvantageKit como alternativa a NetworkTables. Por defecto, la conexión se inicia en el puerto 5800.
- **FTC Dashboard:** Se integra con robots de FTC que publican datos mediante [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
Si AdvantageScope se ejecuta en la misma computadora que la FIRST Driver Station, puedes conectarte directamente para ver sus datos de diagnóstico sin configurar nada adicional (sigue las instrucciones de abajo).
:::

## Iniciar la conexión {#starting-the-connection}

Para iniciar una conexión en vivo, sigue estos pasos según tu objetivo:

- **Robot:** Haz clic en `Archivo` > `Conectar con el robot` > `Predeterminado` o elige una fuente en vivo específica
- **Simulador:** Haz clic en `Archivo` > `Conectar con el simulador` > `Predeterminado` o elige una fuente en vivo específica
- **Driver Station:** Haz clic en `Archivo` > `Conectar a la Driver Station`

El título de la ventana mostrará la dirección IP y el texto "Buscando" hasta que se establezca la conexión. Si se pierde la conexión, AdvantageScope intentará reconectarse automáticamente usando la misma configuración.

## Visualización de datos en vivo {#viewing-live-data}

Al conectarte a una fuente en vivo, AdvantageScope bloquea por defecto todas las pestañas al tiempo actual. Vistas como el 📉 [Gráfico de líneas](/tab-reference/line-graph) y la 🔢 [Tabla](/tab-reference/table) avanzan automáticamente, mientras que el campo y los joysticks muestran los valores del momento. Si haces clic en el botón de flecha roja en la barra de navegación, desactivarás ese bloqueo para poder revisar y reproducir datos anteriores.

<img src="/img/overview/live-sources/open-live-1.webp" alt="Botón de bloqueo/desbloqueo en vivo" />

:::tip
Si te desplazas hacia la izquierda en el gráfico de líneas o en la línea de tiempo, desbloquearás la vista del tiempo actual; si vuelves hasta el extremo derecho, se bloqueará de nuevo.
:::

## Configuración {#configuration}

Abre la ventana de preferencias haciendo clic en `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS).

<img src="/img/prefs_es-419.webp" alt="Diagrama de preferencias" height="450" />

### Dirección del robot {#robot-address}

Ingresa la dirección del robot usando un nombre de host (por ejemplo, `robot.local`) o una dirección IP (por ejemplo, `10.TE.AM.2`), tal como se describe en la [documentación de WPILib](https://docs.wpilib.org/es/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Cuando te conectes a Systemcore por USB o mediante su punto de acceso Wi-Fi integrado, haz clic en `Archivo` > `Usar dirección USB de Systemcore` o `Usar dirección Wi-Fi de Systemcore` para usar temporalmente la dirección IP estática correcta.

### Modo en vivo {#live-mode}

Cuando usas NetworkTables como fuente en vivo, puedes elegir entre dos modos de funcionamiento:

- **Bajo ancho de banda (predeterminado):** AdvantageScope solo pide al servidor los datos de los campos que estás usando en ese momento. No tendrás disponibles los datos publicados antes de seleccionar un campo. Este modo es **muy recomendable** cuando trabajas con poco ancho de banda en la red o cuando el robot publica muchísimos campos.
- **Registro:** AdvantageScope solicita todos los campos del servidor, los estés usando o no. Esto te permite revisar cualquier campo de forma retroactiva al pausar la transmisión en vivo (como se explicó arriba). Es muy útil durante el desarrollo, pero **NO debes usarlo cuando el ancho de banda sea limitado**.

### Descartar datos en vivo {#discard-live-data}

Durante una conexión en vivo, AdvantageScope guarda los datos localmente para que puedas retroceder y revisar lo ocurrido (consulta "Visualización de datos en vivo" más arriba). Para evitar un consumo excesivo de memoria, los datos se descartan después de 20 minutos por defecto. Puedes elegir un período más corto para ahorrar memoria o seleccionar "Nunca" para conservarlos de forma indefinida.
