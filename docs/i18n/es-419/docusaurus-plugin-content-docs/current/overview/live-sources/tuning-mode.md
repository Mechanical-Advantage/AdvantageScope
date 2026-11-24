---
sidebar_position: 1
---

# Modo de ajuste {#tuning-mode}

Algunas fuentes en vivo permiten modificar valores numéricos y booleanos sobre la marcha. Por ejemplo, puedes usar esta función para [ajustar las ganancias de un controlador](https://docs.wpilib.org/es/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) mientras estás conectado por NetworkTables (siempre que el código del robot esté preparado para recibir esas ganancias por NetworkTables).

Por defecto, todos los valores en AdvantageScope son de solo lectura. Para activar el modo de ajuste, **haz clic en el ícono del control deslizante** a la derecha de la barra de búsqueda mientras estés conectado a una fuente compatible. Cuando el ícono se ponga morado, el modo de ajuste estará activo y podrás editar los campos.

- Para editar un **campo numérico**, escribe el nuevo valor en el cuadro de texto a la derecha del campo en la barra lateral. El valor se publica en cuanto sales del cuadro o presionas "Enter". Si dejas el cuadro vacío, se volverá a usar el valor que publica el robot.
- Para cambiar un **campo booleano**, haz clic en el círculo rojo o verde a la derecha del campo en la barra lateral.
- Para copiar todos los valores que ajustaste al portapapeles, **haz clic derecho en el ícono del control deslizante** y elige **"Copiar valores ajustados"**.

:::warning
Esta función no está pensada para manejar el robot en la cancha. No admite controles típicos de un dashboard, como selectores o botones de acción.
:::

## Ajuste con AdvantageKit {#tuning-with-advantagekit}

Los campos que AdvantageKit publica en la subtabla `AdvantageKit` son de solo salida y no se pueden editar. Sin embargo, sí puedes publicar desde tu código campos pensados para ajustarse desde AdvantageScope. **Todo campo que publiques en la tabla "/Tuning" de NetworkTables aparecerá bajo la tabla "Tuning" al usar la fuente en vivo "NetworkTables (AdvantageKit)".**

Por ejemplo, puedes publicar un número ajustable con la clase [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
La subtabla `NetworkInputs` **no se puede editar**, ya que AdvantageKit la usa para guardar las entradas de red y poder reproducirlas después. Usa la tabla `Tuning` para interactuar con entradas en tiempo real.
:::
