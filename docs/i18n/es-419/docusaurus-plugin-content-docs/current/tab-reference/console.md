---
sidebar_position: 5
---

# 💬 Consola {#console}

La pestaña **Consola** sirve para leer un único campo de texto (`string`) con mensajes de consola. Aquí tienes algunos campos recomendados:

- **DS:/Dscomm/Console** - Guardado por la FIRST Driver Station.
- **messages** - Guardado por el registro integrado de WPILib a partir de llamadas al método [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Guardado automáticamente por AdvantageKit mientras corre el robot (solo usa `System.out.println` como de costumbre).
- **/ReplayOutputs/Console** - Guardado automáticamente por AdvantageKit al reproducir un registro (usa `System.out.println` como de costumbre).

Para empezar, arrastra el campo que quieras a la vista principal. Cada fila corresponde a una actualización del campo: en registros de WPILib aparece una fila por cada línea guardada, mientras que en AdvantageKit aparece una fila por cada ciclo de ejecución.

<img src="/img/tab-reference/console-1.webp" alt="Vista de Consola" />

_En la imagen de arriba se muestra la interfaz en inglés._

:::info
Haz clic en el ícono de la paleta de colores para activar o desactivar el resaltado de advertencias y errores. En registros de WPILib y AdvantageKit, se resaltan automáticamente los mensajes que incluyen el texto "warning" o "error".
:::

Los controles funcionan igual que en la pestaña 🔢 [Tabla](../tab-reference/table). El instante seleccionado se sincroniza en todas las pestañas: haz clic en una fila para seleccionarla o pasa el cursor encima para previsualizarla en cualquier ventana emergente abierta. El botón ↓ salta al instante seleccionado (o al tiempo que escribas en el cuadro). Tanto las marcas de tiempo como el campo de salto siguen el formato elegido en la preferencia [Marcas de tiempo](/more-features/timestamps).

Escribe en el cuadro **Filtrar** para mostrar únicamente las filas que contengan ese texto (puedes presionar `Ctrl+F` para ir directo al filtro). Si pones un `!` al inicio del texto, **excluirás** de la vista los mensajes que coincidan.

## Formato ANSI {#ansi-formatting}

El visor de consola interpreta códigos de color y estilo mediante secuencias de escape ANSI estándar:

- **Estilos de texto:** Negrita, atenuado, cursiva y subrayado
- **Colores de texto y fondo:** Los 16 colores estándar (normales y de alta intensidad)
- **Colores de 8 y 24 bits:** Paleta de 256 colores y RGB de 24 bits
- **Reinicios selectivos:** Restablecer solo ciertos estilos o colores sin afectar los demás

:::tip
Haz clic en el ícono de guardar para exportar todo el registro de la consola a un archivo de texto.
:::
