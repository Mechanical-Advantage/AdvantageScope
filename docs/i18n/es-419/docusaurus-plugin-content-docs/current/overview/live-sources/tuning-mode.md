---
sidebar_position: 1
---

# Modo de ajuste

Algunas fuentes en vivo admiten el ajuste en vivo de valores numéricos y booleanos. Por ejemplo, esta función se puede usar para [ajustar ganancias del controlador](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) cuando está conectado a una fuente de NetworkTables. Ten en cuenta que el código del robot debe admitir la recepción de ganancias a través de NetworkTables.

Por defecto, todos los valores en AdvantageScope son de solo lectura. Para activar y desactivar el modo de ajuste, **haz clic en el ícono del control deslizante** a la derecha de la barra de búsqueda cuando estés conectado a una fuente en vivo compatible. Cuando el icono es violeta, el modo de ajuste está activo y la edición de campos está habilitada.

- Para editar un **campo numérico**, ingresa un nuevo valor utilizando el cuadro de texto a la derecha del campo en la barra lateral. El valor se publica después de anular la selección de la entrada o presionar la tecla "Enter". Deja el cuadro de texto en blanco para usar el valor publicado por el robot.
- Para alternar un **campo booleano**, haz clic en el círculo rojo o verde a la derecha del campo en la barra lateral.

:::warning
Esta función no está destinada a controlar el robot en el campo. No se admiten las entradas de estilo de panel (dashboard) como selectores, botones de activación, etc.
:::

## Ajuste con AdvantageKit

Los campos publicados por AdvantageKit en la subtabla `AdvantageKit` son de solo salida y no se pueden editar. Sin embargo, los usuarios pueden publicar campos del código del usuario que sean ajustables desde AdvantageScope. **Cualquier campo publicado en la tabla "/Tuning" en NetworkTables aparecerá bajo la tabla "Tuning" cuando se use la fuente en vivo "NetworkTables (AdvantageKit)".**

Por ejemplo, un número ajustable se puede publicar usando la clase [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
La subtabla `NetworkInputs` **no se puede editar**, ya que AdvantageKit la utiliza para registrar los valores de red para su registro y reproducción. Usa la tabla `Tuning` para interactuar con las entradas de la red en tiempo real.
:::
