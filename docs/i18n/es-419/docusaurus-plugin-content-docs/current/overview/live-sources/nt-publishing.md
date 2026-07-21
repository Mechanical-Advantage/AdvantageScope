---
sidebar_position: 3
---

# Publicación de datos de NetworkTables

AdvantageScope admite la publicación de datos de NetworkTables almacenados en un archivo de registro de vuelta a un servidor NetworkTables como un simulador o un robot. Los posibles casos de uso incluyen:

- Repetición de partidos en simulación para depuración.
- Imitación de datos de un coprocesador en un robot real.
- Depuración de aplicaciones de panel de control (dashboard) de conductores utilizando datos de partidos realistas.

Esta función requiere un archivo de registro con una captura completa de datos de NetworkTables, que se puede generar utilizando el [registrador de datos incorporado](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) de WPILib. Ten en cuenta que AdvantageKit no admite esta función, ya que permite una reproducción determinista más completa en la simulación.

## Empezando

Para comenzar a publicar, debe haber un archivo de registro abierto que contenga datos de NetworkTables. Luego, sigue estos pasos:

- **Publicar en robot:** Haz clic en `Archivo` > `Publicar datos NT` > `Conectarse a robot`.
- **Publicar en simulador:** Haz clic en `Archivo` > `Publicar datos NT` > `Conectarse al simulador`.

La parte superior de la ventana muestra el texto "Buscando" (Searching) o "Publicando" (Publishing) para indicar el estado de publicación de los datos. AdvantageScope intenta volver a conectarse automáticamente usando la misma configuración después de una desconexión.

Todos los campos se publicarán utilizando sus valores almacenados en la _marca de tiempo seleccionada_ utilizada por muchas pestañas de AdvantageScope. Esto permite la reproducción de red en tiempo real a través del mismo mecanismo que la reproducción dentro de AdvantageScope. Consulta [Navegación en la aplicación](/overview/navigation) para obtener más detalles. Si no se selecciona ninguna marca de tiempo, los campos se publican utilizando sus valores almacenados en la _marca de tiempo sobre la que se pasa el cursor_ (hovered timestamp).

Para dejar de publicar, haz clic en `Archivo` > `Publicar datos NT` > `Detener publicación`.

## Filtrado de campos

Por defecto, AdvantageScope publica todos los campos de NetworkTables almacenados en el archivo de registro (excepto los temas meta publicados por el servidor). Algunos casos de uso, como imitar un coprocesador, requieren solo publicar un conjunto limitado de campos o subtablas.

Para ajustar el conjunto de prefijos de campos permitidos, abre la ventana de preferencias haciendo clic en `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS). La opción "Prefijos de publicación de NT" establece los prefijos permitidos para los campos publicados en NetworkTables. Si se deja en blanco, se incluirán todos los campos. De lo contrario, se puede proporcionar una lista de prefijos o campos separados por comas. A continuación se muestran algunos ejemplos.

- "_SmartDashboard_": Incluye todos los campos en la tabla "SmartDashboard".
- "_SmartDashboard/Auto Selector_": Incluye solo la tabla "SmartDashboard/Auto Selector".
- "_limelight/tx,limelight/ty_": Incluye solo los campos "limelight/tx" y "limelight/ty".

## Limitaciones

:::warning

- Los campos se publican cada 20 ms, por lo que los datos de NetworkTables originalmente publicados a una frecuencia más alta omitirán muestras.
- Las marcas de tiempo de las muestras publicadas no se conservan. Esto sería imposible al desplazarse hacia adelante y hacia atrás en el tiempo o al reproducir a diferentes velocidades.
  :::
