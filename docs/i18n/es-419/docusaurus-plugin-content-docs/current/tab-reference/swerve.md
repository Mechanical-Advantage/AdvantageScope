---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve

La pestaña swerve muestra el estado de cuatro módulos swerve, incluidos los vectores de velocidad, las posiciones de inactividad, la rotación del robot y las velocidades del chasis.

<img src="/img/tab-reference/swerve-1.png" alt="Resumen de la pestaña swerve" />

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo se utiliza para controlar la reproducción y la visualización. Al hacer clic en la línea de tiempo se selecciona un tiempo, y al hacer clic con el botón derecho se anula la selección. El tiempo seleccionado se sincroniza en todas las pestañas, lo que facilita la búsqueda rápida de esta ubicación en otras vistas.

Las secciones amarillas indican cuando el robot es autónomo, las secciones azules indican cuando el robot es teledirigido (teleop), y las secciones grises indican cuando el robot está en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y desplázate hacia arriba o hacia abajo. También se puede seleccionar un rango haciendo clic y arrastrando mientras se mantiene presionada la tecla `Shift`. Muévete hacia la izquierda y hacia la derecha desplazándote horizontalmente (en dispositivos compatibles) o haciendo clic y arrastrando en la línea de tiempo. Cuando estás conectado en vivo, desplazarte hacia la izquierda desbloquea del tiempo actual, y desplazarte hasta la derecha vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom al período en el que el robot está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Línea de tiempo" />

</details>

## Agregar fuentes

Para comenzar, arrastra un campo a la sección "Fuentes" (Sources). Elimina una fuente usando el botón X, u ocúltala temporalmente haciendo clic en el ícono del ojo o haciendo doble clic en el nombre del campo. Para eliminar todas las fuentes, haz clic en la papelera cerca del título del eje y luego en `Borrar todo`.

Las fuentes se pueden reorganizar en la lista haciendo clic y arrastrando. **Para personalizar cada fuente, haz clic en el ícono de color o haz clic derecho en el nombre del campo.** AdvantageScope admite tres tipos de fuentes:

- **Velocidades del módulo:** Un conjunto de cuatro estados de módulo swerve, mostrados como vectores en el diagrama.
- **Velocidades del robot:** Velocidades lineales y angulares mostradas en el centro del diagrama.
- **Rotación:** Posición angular utilizada para rotar el diagrama.

## Formato de datos

Los datos deben publicarse como un struct o protobuf codificado en bytes, utilizando los tipos `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` o `Rotation3d`.

Muchas bibliotecas admiten el formato struct, incluidas WPILib y AdvantageKit. El código de ejemplo a continuación muestra cómo registrar estados de módulos swerve en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

## Configuración

Las siguientes opciones de configuración están disponibles:

- **Velocidad máxima:** La velocidad máxima alcanzable de los módulos, utilizada para ajustar el tamaño de los vectores.
- **Tamaño del chasis:** Las distancias entre los módulos swerve de izquierda a derecha y de adelante hacia atrás. Cambia la relación de aspecto del diagrama del robot.
- **Orientación:** Ajusta la dirección hacia la que apunta el diagrama del robot. Esta opción suele ser útil para alinearse con los datos de pose o los videos de partidos.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
