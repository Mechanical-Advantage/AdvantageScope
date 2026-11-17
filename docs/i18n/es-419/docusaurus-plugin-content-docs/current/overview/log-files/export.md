# Exportación de datos de registro {#exporting-log-data}

AdvantageScope cuenta con un sistema flexible para exportar los datos de un registro en formato CSV, WPILOG o MCAP. La exportación funciona tanto cuando tienes abierto un archivo de registro como cuando estás conectado a una fuente en vivo. Algunos usos comunes son:

- Convertir un archivo WPILOG a CSV o MCAP para analizarlo en otras aplicaciones.
- Exportar un archivo WPILOG a partir de datos de NetworkTables para revisarlo más tarde.
- Guardar un WPILOG con solo ciertos campos (y sin valores duplicados) para reducir el tamaño del archivo.

Para ver las opciones de exportación, haz clic en `Archivo` > `Exportar datos...`.

<img src="/img/overview/log-files/export-1.webp" alt="Opciones de exportación" />

_La imagen de arriba muestra la interfaz en inglés._

:::tip
Además de exportar el registro completo como se explica aquí, en la pestaña 💬 [Consola](/tab-reference/console) puedes exportar los mensajes de la consola a un archivo de texto.
:::

:::warning
**Exportación de datos para SysId**

No recomendamos usar esta herramienta para exportar datos **generados en simulación** con el fin de usarlos en [SysId](https://docs.wpilib.org/es/stable/docs/software/advanced-controls/system-identification/introduction.html), ya que SysId necesita información adicional de marcas de tiempo que no coincide con las opciones de exportación predeterminadas de AdvantageScope. En cambio, los datos **generados _fuera_ de la simulación** sí pueden exportarse para SysId con una pérdida mínima de datos (aunque siempre obtendrás la máxima precisión usando el archivo de registro _original_ directamente en SysId).

_Esta advertencia **no aplica** a los registros creados por AdvantageKit, que pueden exportarse sin pérdida de datos seleccionando la opción "Ciclos de AdvantageKit". Consulta [esta página](https://docs.advantagekit.org/data-flow/sysid-compatibility) para ver los detalles._
:::

## Opciones {#options}

Al exportar dispones de las siguientes opciones:

- **Formato:** Define el formato del archivo exportado. Tienes estas opciones:
  - _CSV (Tabla):_ Valores separados por comas, donde cada fila corresponde a una marca de tiempo distinta y cada columna a un campo (más una columna para la marca de tiempo). Así, una sola fila puede incluir valores de varios campos.
  - _CSV (Lista):_ Valores separados por comas, donde cada fila representa un único valor de un campo, con columnas para la marca de tiempo, la clave y el valor.
  - _WPILOG:_ Archivo WPILOG estándar que puedes volver a abrir en AdvantageScope.
  - _MCAP:_ Archivo [MCAP](https://mcap.dev) estándar compatible con [Foxglove](https://foxglove.dev).
- **Marcas de tiempo:** Disponible solo para "CSV (Tabla)". Define cómo se crean las filas nuevas:
  - _Todos los cambios:_ Agrega una nueva fila únicamente cuando cambia el valor de algún campo, lo que reduce al mínimo el tamaño del archivo.
  - _Período fijo:_ Agrega una fila a intervalos regulares, útil para registros sin marcas de tiempo sincronizadas (cuando muchos campos se guardan con marcas de tiempo parecidas, pero no idénticas). Ten en cuenta que se incluyen todos los valores en cada intervalo, hayan cambiado o no.
  - _Ciclos de AdvantageKit:_ Agrega una fila por cada ciclo sincronizado de AdvantageKit. Al igual que en el modo anterior, se incluyen todos los valores en cada ciclo, hayan cambiado o no.
- **Período:** Disponible solo al elegir "Período fijo". Define el intervalo en milisegundos entre cada muestra. Por lo general, conviene que coincida con el período del ciclo principal del código del robot.
- **Prefijos:** Si lo dejas en blanco, se incluyen todos los campos. Si escribes prefijos (separados por comas), solo se exportarán los campos que coincidan con ellos. Por ejemplo:
  - "_/DriverStation/Joystick0_": Incluye todos los campos que empiezan con "/DriverStation/Joystick0" (los datos del primer joystick).
  - "_Flywheels,DS:enabled_": Incluye todos los campos que empiezan con "/Flywheels" o "DS:enabled" (todos los datos de los volantes, más el estado de habilitación del robot).
  - "_Drive/LeftPosition,Drive/RightPosition_": Incluye únicamente los campos "/Drive/LeftPosition" y "/Drive/RightPosition".
- **Conjunto de campos:** Los campos generados son creados por AdvantageScope para desglosar tipos de datos complejos y aparecen en gris en la barra lateral (por ejemplo, los elementos individuales de arreglos, _structs_ y otros esquemas).
  - _Incluir generados:_ Exporta todos los campos visibles, incluidos los generados. Es la mejor opción si vas a abrir el archivo en un programa que no sabe interpretar tipos complejos.
  - _Solo originales:_ Exporta únicamente los campos que venían en el registro original, excluyendo los generados. Es lo recomendable si vas a abrir el archivo en AdvantageScope o en otra herramienta que sí interprete tipos complejos.

Abajo puedes ver un ejemplo de archivo CSV exportado desde AdvantageScope en formato "CSV (Tabla)" con las marcas de tiempo configuradas en "Todos los cambios":

<img src="/img/overview/log-files/export-2.webp" alt="Tabla CSV" />
