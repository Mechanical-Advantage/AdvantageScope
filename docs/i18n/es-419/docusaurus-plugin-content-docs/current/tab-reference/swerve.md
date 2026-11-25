---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

La pestaña swerve muestra el estado de los cuatro módulos swerve: sus vectores de velocidad, posiciones en reposo, la rotación del robot y las velocidades del chasis.

<img src="/img/tab-reference/swerve-1.webp" alt="Descripción general de la pestaña de swerve" />

_En la imagen de arriba se muestra la interfaz en inglés._

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo controla la reproducción y la visualización. Haz clic sobre ella para seleccionar un instante de tiempo, y haz clic derecho para quitar la selección. El tiempo seleccionado se sincroniza en todas las pestañas, así que podrás ubicar ese mismo instante rápidamente en otras vistas.

Las franjas amarillas marcan cuándo el robot está en modo autónomo; las azules, en teledirigido (teleop); y las grises, en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y gira la rueda del mouse hacia arriba o hacia abajo. También puedes seleccionar un rango haciendo clic y arrastrando mientras mantienes presionada la tecla `Shift`. Para moverte a izquierda o derecha, desplázate horizontalmente (si tu dispositivo lo permite) o haz clic y arrastra sobre la línea de tiempo. Cuando estés conectado en vivo, desplazarte hacia la izquierda desbloquea la vista del tiempo actual, y desplazarte hasta el extremo derecho la vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom directamente al período en que el robot está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Línea de tiempo" />

</details>

## Cómo agregar fuentes {#adding-sources}

Para empezar, arrastra un campo a la sección "Fuentes". Puedes quitar una fuente con el botón X, u ocultarla temporalmente haciendo clic en el ícono del ojo o doble clic en su nombre. Si quieres quitar todas las fuentes, haz clic en el ícono de papelera junto al título del eje y elige `Borrar todo`.

Puedes reordenar las fuentes en la lista arrastrándolas. **Para personalizar una fuente, haz clic en su ícono de color o haz clic derecho sobre su nombre.** AdvantageScope admite tres tipos de fuentes:

- **Velocidades del módulo:** Un conjunto de cuatro estados de módulo swerve, que se muestran como vectores en el diagrama.
- **Velocidades del robot:** Velocidades lineales y angular mostradas en el centro del diagrama.
- **Rotación:** Posición angular usada para rotar el diagrama.

:::tip
Los estados de los módulos swerve también se pueden visualizar en las pestañas 🗺️ [Campo 2D](/tab-reference/2d-field) y 👀 [Campo 3D](/tab-reference/3d-field).
:::

## Formato de datos {#data-format}

Debes publicar los datos como un struct o protobuf codificado en bytes usando los tipos `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` o `Rotation3d`.

Muchas bibliotecas admiten el formato struct, incluidas WPILib y AdvantageKit. El siguiente ejemplo muestra cómo registrar los estados de los módulos swerve.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
std::array<wpi::math::SwerveModuleVelocity, 4> states{
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{}
};

wpi::telemetry::Log("MyStates", states);
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import SwerveModuleVelocity
import telemetry

states = [
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
]

telemetry.log("MyStates", states, element_type=SwerveModuleVelocity)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
En 2027, esta estructura de datos cambió de nombre de `SwerveModuleState` a `SwerveModuleVelocity`.
Si trabajas con archivos de registro anteriores a WPILib 2027 y Systemcore, el tipo anterior `SwerveModuleState` sigue siendo compatible para visualizarse.
:::

## Configuración {#configuration}

Tienes disponibles las siguientes opciones de configuración:

- **Velocidad máxima:** La velocidad máxima que alcanzan los módulos; se usa para escalar el tamaño de los vectores.
- **Tamaño del chasis:** La distancia entre los módulos de izquierda a derecha y de adelante hacia atrás. Cambia la proporción del diagrama del robot.
- **Orientación:** Ajusta hacia dónde apunta el diagrama del robot, algo muy útil para alinearlo con los datos de pose o con los videos de partidos.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
