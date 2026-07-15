---
sidebar_position: 5
---

# 💬 Consola

La vista de la consola está diseñada para ver un solo campo de cadena con datos de la consola. Algunos campos sugeridos se enumeran a continuación.

- **DS:/Dscomm/Console** - Guardado por la FIRST Driver Station.
- **messages** - Guardado por el registro incorporado de WPILib basado en llamadas al método [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Guardado por AdvantageKit automáticamente durante el funcionamiento del robot (usa `System.out.println` de forma normal).
- **/ReplayOutputs/Console** - Guardado por AdvantageKit automáticamente durante la reproducción del registro (usa `System.out.println` de forma normal).

Arrastra el campo deseado a la vista principal para comenzar. Cada fila representa una actualización del campo. Para los registros de WPILib, se crea una nueva fila por cada línea guardada. Para los registros de AdvantageKit, se crea una nueva fila por cada ciclo de bucle.

<img src="/img/tab-reference/console-1.png" alt="Vista de la consola" />

:::info
Haz clic en el icono de la paleta de colores para alternar el resaltado de los mensajes de advertencia y error. Para los registros de WPILib y AdvantageKit, los mensajes se resaltan si contienen el texto "warning" o "error".
:::

Los controles son similares a los de la pestaña 🔢 [Tabla](../tab-reference/table). El tiempo seleccionado se sincroniza en todas las pestañas. Haz clic en una fila para seleccionarla, o desplaza el cursor sobre una fila para ver una vista previa en cualquier ventana emergente visible. Al hacer clic en el botón ↓, se salta al tiempo seleccionado (o al tiempo ingresado en el cuadro).

Ingresa texto en la entrada "Filtro" para mostrar solo las filas que contienen el texto del filtro. Presiona `Ctrl+F` para seleccionar rápidamente la entrada "Filtro". Agrega un "!" al comienzo del texto del filtro para _excluir_ los mensajes coincidentes de la vista principal.

:::tip
Haz clic en el ícono de guardar para exportar los datos de la consola a un archivo de texto.
:::
