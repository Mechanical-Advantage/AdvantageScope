# Exportación de datos de registro

AdvantageScope incluye un sistema flexible para exportar datos de registro como un archivo CSV, WPILOG o MCAP. Las funciones de exportación funcionan cuando se visualiza un archivo de registro o cuando se conecta a una fuente de datos en vivo. Los posibles casos de uso incluyen:

- Conversión de un archivo WPILOG a CSV o MCAP para su análisis en otras aplicaciones.
- Exportación de un archivo WPILOG basado en datos de NetworkTables, para su posterior acceso.
- Guardar un WPILOG con un número limitado de campos (y valores duplicados eliminados) para reducir el tamaño del archivo.

Para ver opciones de exportación, haz clic en `Archivo` > `Exportar datos...`.

<img src="/img/overview/log-files/export-1.png" alt="Export options" height="250" />

:::tip
Además de la exportación del registro completo que se describe aquí, la pestaña 💬 [Consola](/tab-reference/console) permite que los datos de la consola se exporten a un archivo de texto.
:::

:::warning
**Exportación de datos para SysId**

No recomendamos el uso de esta función para exportar datos de registro **generados en simulación** para su uso en [SysId](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/introduction.html), ya que SysId requiere datos de marcas de tiempo adicionales incompatibles con las opciones de exportación predeterminadas de AdvantageScope. Ten en cuenta que los datos de registro **generados _fuera_ de la simulación** se pueden exportar para su uso en SysId con una pérdida mínima de datos (aunque la máxima precisión se puede lograr utilizando el registro de datos _original_ directamente en SysId).

_Esta advertencia **no se aplica** a los registros producidos por AdvantageKit, que se pueden exportar sin pérdida de datos seleccionando la opción "AdvantageKit Cycles". Consulta [esta página](https://docs.advantagekit.org/data-flow/sysid-compatibility) para obtener detalles._
:::

## Opciones

Se proporcionan las siguientes opciones al exportar:

- **Formato:** Establece el formato general del archivo exportado. Consulta las opciones a continuación.
  - _CSV (Tabla):_ Valores separados por comas, donde cada fila representa una marca de tiempo distinta y cada columna representa un campo (más una columna para el valor de la marca de tiempo). Cada fila puede representar un valor en múltiples campos.
  - _CSV (Lista):_ Valores separados por comas, donde cada fila representa un valor en un solo campo con columnas para marca de tiempo, clave y valor.
  - _WPILOG:_ Archivo WPILOG estándar que se puede volver a abrir en AdvantageScope.
  - _MCAP:_ Archivo [MCAP](https://mcap.dev) estándar que se puede abrir en [Foxglove](https://foxglove.dev).
- **Marcas de tiempo:** Solo para "CSV (Tabla)". Establece el método para crear nuevas filas. Consulta las opciones a continuación.
  - _Todos los cambios:_ Crea nuevas filas/entradas solo cuando se actualizan los valores de los campos. Minimiza el tamaño del archivo de la exportación.
  - _Período fijo:_ Crea nuevas filas/entradas en un intervalo fijo, útil para registros sin sincronización de marcas de tiempo (cuando muchos campos se registran con marcas de tiempo similares, pero no idénticas). Ten en cuenta que se incluyen todos los valores, independientemente de si hubo un cambio entre los puntos de muestra.
  - _Ciclos de AdvantageKit:_ Crea una nueva fila/entrada para cada ciclo de bucle sincronizado de AdvantageKit. Ten en cuenta que se incluyen todos los valores, independientemente de si hubo un cambio entre los ciclos de bucle.
- **Período:** Solo cuando se selecciona "Período fijo". Establece el período en milisegundos entre cada muestra. Normalmente, esto debería coincidir con el período del ciclo de bucle del código del robot.
- **Prefijos:** Si está en blanco, incluye todos los campos. De lo contrario, solo incluye los campos que coincidan con los prefijos proporcionados (separados por comas). Consulta los ejemplos a continuación.
  - "_/DriverStation/Joystick0_": Incluye todos los campos que comiencen con "/DriverStation/Joystick0" (datos del primer joystick).
  - "_Flywheels,DS:enabled_": Incluye todos los campos que comiencen con "/Flywheels" o "DS:enabled" (todos los datos del volante, más el estado habilitado del robot).
  - "_Drive/LeftPosition,Drive/RightPosition_": Solo incluye los campos "/Drive/LeftPosition" y "/Drive/RightPosition".
- **Conjunto de campos:** Consulta las opciones a continuación. Los campos generados son creados por AdvantageScope para desglosar tipos complejos y se muestran con texto gris en la barra lateral. Esto incluye los componentes individuales de arreglos, estructuras (structs) y otros esquemas.
  - _Incluir generados:_ Exporta todos los campos visualizables, lo que incluye los campos generados. Recomendado si los datos exportados se abrirán en una aplicación que no es capaz de analizar tipos complejos.
  - _Solo originales:_ Solo exporta campos que estaban presentes en el archivo de registro original, lo que excluye los campos generados. Recomendado si los datos exportados se abrirán en AdvantageScope u otra aplicación capaz de analizar tipos complejos.

A continuación se muestra un archivo CSV de ejemplo exportado desde AdvantageScope, en el formato "CSV (Tabla)" con marcas de tiempo configuradas en "Todos los cambios":

<img src="/img/overview/log-files/export-2.png" alt="CSV table" />
