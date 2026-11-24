---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Modo de ajuste {#tuning-mode}

Algunas fuentes en vivo permiten modificar valores numéricos y booleanos sobre la marcha. Por ejemplo, puedes usar esta función para [ajustar las ganancias de un controlador](https://docs.wpilib.org/es/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) mientras estás conectado por NetworkTables (siempre que el código del robot esté preparado para recibir esas ganancias por NetworkTables).

Por defecto, todos los valores en AdvantageScope son de solo lectura. Para activar el modo de ajuste, **haz clic en el ícono del control deslizante** a la derecha de la barra de búsqueda mientras estés conectado a una fuente compatible. Cuando el ícono se ponga morado, el modo de ajuste estará activo y podrás editar los campos.

- Para editar un **campo numérico**, escribe el nuevo valor en el cuadro de texto a la derecha del campo en la barra lateral. El valor se publica en cuanto sales del cuadro o presionas "Enter". Si dejas el cuadro vacío, se volverá a usar el valor que publica el robot.
- Para cambiar un **campo booleano**, haz clic en el círculo rojo o verde a la derecha del campo en la barra lateral.
- Para copiar todos los valores que ajustaste al portapapeles, **haz clic derecho en el ícono del control deslizante** y elige **"Copiar valores ajustados"**.

:::tip
Para usuarios de iPhone y iPad, **AdvantageTune** es una opción alternativa creada por los desarrolladores de AdvantageScope para ajustar valores de NetworkTables desde dispositivos móviles.

[<img src="/img/app-store_es-419.svg" alt="App Store" />](https://apps.apple.com/mx/app/advantagetune/id6811453643)
:::

## Tunables de WPILib {#wpilib-tunables}

En WPILib, valores como números y booleanos se pueden configurar mediante la API de Tunable, lo que permite ajustarlos desde AdvantageScope en tiempo real. Los valores ajustables se registran una vez y se pueden leer periódicamente en el código del robot:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// Leer los valores periódicamente
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// Leer los valores periódicamente
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# Leer los valores periódicamente
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## Ajuste con AdvantageKit {#tuning-with-advantagekit}

Los campos que AdvantageKit publica en la subtabla `AdvantageKit` son de solo salida y no se pueden editar. Sin embargo, sí puedes publicar desde tu código campos pensados para ajustarse desde AdvantageScope. **Todo campo que publiques en la tabla "/Tuning" de NetworkTables aparecerá bajo la tabla "Tuning" al usar la fuente en vivo "NetworkTables (AdvantageKit)".**

Por ejemplo, puedes publicar un número ajustable con la clase [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::note
Ten en cuenta que las claves deben incluir la barra inicial (por ejemplo, `/Tuning/MyTunableNumber`, no `Tuning/MyTunableNumber`).
:::

:::warning
La subtabla `NetworkInputs` **no se puede editar**, ya que AdvantageKit la usa para guardar las entradas de red y poder reproducirlas después. Usa la tabla `Tuning` para interactuar con entradas en tiempo real.
:::
