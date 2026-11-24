---
sidebar_position: 3
---

# Publicación de datos de NetworkTables {#publishing-networktables-data}

AdvantageScope te permite tomar los datos de NetworkTables guardados en un archivo de registro y volver a publicarlos en un servidor NetworkTables, como un simulador o un robot. Esto resulta muy útil para:

- Reproducir partidos en simulación para depurar el código.
- Simular los datos de un coprocesador en un robot real.
- Probar paneles de control (_dashboards_) para conductores usando datos reales de partidos.

Para usar esta función necesitas un archivo de registro que haya capturado por completo los datos de NetworkTables, algo que puedes generar con el [registrador de datos integrado](https://docs.wpilib.org/es/stable/docs/software/telemetry/datalog.html) de WPILib. Ten en cuenta que AdvantageKit no admite esta función porque ofrece una reproducción determinista mucho más completa en simulación.

## Primeros pasos {#getting-started}

Para empezar a publicar, primero abre un archivo de registro que contenga datos de NetworkTables y luego sigue estos pasos:

- **Publicar en el robot:** Haz clic en `Archivo` > `Publicar datos de NT` > `Conectar con el robot`.
- **Publicar en el simulador:** Haz clic en `Archivo` > `Publicar datos de NT` > `Conectar con el simulador`.

En la parte superior de la ventana verás el texto "Buscando" o "Publicando" para indicar el estado de la publicación. Si la conexión se corta, AdvantageScope intentará reconectarse automáticamente usando la misma configuración.

Todos los campos se publican con los valores correspondientes a la _marca de tiempo seleccionada_ que usan varias pestañas de AdvantageScope. Así puedes reproducir los datos por la red en tiempo real con los mismos controles que usas dentro de la aplicación (consulta [Navegación en la aplicación](/overview/navigation) para más detalles). Si no hay ninguna marca de tiempo seleccionada, se publican los valores del punto donde tengas el cursor.

Para detener la publicación, haz clic en `Archivo` > `Publicar datos de NT` > `Detener publicación`.

## Filtrado de campos {#filtering-fields}

Por defecto, AdvantageScope publica todos los campos de NetworkTables guardados en el archivo de registro (excepto los metatemas propios del servidor). Sin embargo, en casos como simular un coprocesador, quizá solo quieras publicar un grupo específico de campos o subtablas.

Para definir qué prefijos están permitidos, abre la ventana de preferencias haciendo clic en `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS). La opción "Prefijos de publicación de NT" controla qué campos se envían a NetworkTables: si la dejas en blanco, se incluirán todos; si prefieres filtrarlos, escribe una lista de prefijos o campos separados por comas, como en estos ejemplos:

- "_Telemetry_": Incluye todos los campos dentro de la tabla "Telemetry".
- "_Telemetry/Drive_": Incluye únicamente la tabla "Telemetry/Drive".
- "_limelight/tx,limelight/ty_": Incluye solo los campos "limelight/tx" y "limelight/ty".

## Limitaciones {#limitations}

:::warning

- Los campos se publican cada 20 ms, así que si los datos originales de NetworkTables se enviaron a mayor frecuencia, se omitirán muestras intermedias.
- No se conservan las marcas de tiempo originales de cada muestra, ya que sería imposible mantenerlas al adelantar, retroceder o cambiar la velocidad de reproducción.
  :::
