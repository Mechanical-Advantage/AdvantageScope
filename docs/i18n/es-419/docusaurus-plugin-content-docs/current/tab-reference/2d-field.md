---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 Campo 2D

La pestaña de campo 2D muestra una visualización 2D del robot superpuesta en un mapa del campo. También puede mostrar datos adicionales, como el estado de puntería de visión y poses de referencia.

<img src="/img/tab-reference/2d-field-1.png" alt="Overview of 2D field tab" />

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo se utiliza para controlar la reproducción y la visualización. Al hacer clic en la línea de tiempo se selecciona un tiempo, y al hacer clic con el botón derecho se anula la selección. El tiempo seleccionado se sincroniza en todas las pestañas, lo que facilita la búsqueda rápida de esta ubicación en otras vistas.

Las secciones amarillas indican cuando el robot es autónomo, las secciones azules indican cuando el robot es teledirigido (teleop), y las secciones grises indican cuando el robot está en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y desplázate hacia arriba o hacia abajo. También se puede seleccionar un rango haciendo clic y arrastrando mientras se mantiene presionada la tecla `Shift`. Muévete hacia la izquierda y hacia la derecha desplazándote horizontalmente (en dispositivos compatibles) o haciendo clic y arrastrando en la línea de tiempo. Cuando estás conectado en vivo, desplazarte hacia la izquierda desbloquea del tiempo actual, y desplazarte hasta la derecha vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom al período en el que el robot está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Agregar objetos

Para comenzar, arrastra un campo a la sección "Poses". Elimina un objeto con el botón X, u ocúltalo temporalmente haciendo clic en el ícono del ojo o haciendo doble clic en el nombre del campo. Para eliminar todos los objetos, haz clic en la papelera cerca del título del eje y luego en `Borrar todo`.

Los objetos se pueden reorganizar en la lista haciendo clic y arrastrando. **Para personalizar cada objeto, haz clic en el ícono de color o haz clic con el botón derecho en el nombre del campo.** AdvantageScope admite una gran cantidad de tipos de objetos, muchos de los cuales se pueden personalizar (como cambiar de color). Algunos objetos deben agregarse como elementos secundarios (children) a un objeto existente.

:::tip
Para ver una lista completa de tipos de objetos compatibles, haz clic en el ícono `?`. Esta lista también incluye los tipos de datos compatibles y si los objetos deben agregarse como elementos secundarios.
:::

<img src="/img/tab-reference/2d-field-2.png" alt="2D field with objects" />

## Formato de datos

Los datos de geometría deben publicarse como un struct o protobuf codificado en bytes. Se admiten varios tipos de geometría 2D y 3D, incluidos `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` y más.

Muchas bibliotecas admiten el formato struct, incluidas WPILib y AdvantageKit. El código de ejemplo a continuación muestra cómo registrar datos de pose 2D en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
La clase [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) de WPILib también se puede utilizar para registrar varios conjuntos de datos de pose 2D juntos.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// Este protocolo no admite el formato struct moderno, pero los valores
// de pose se pueden publicar utilizando campos separados que incluyen
// los sufijos "x", "y", y "heading" (como se muestra a continuación):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Pulgadas
packet.put("Pose y", 2.8); // Pulgadas
packet.put("Pose heading", 3.14); // Radianes

// Alternativamente, los encabezados (headings) se pueden publicar en grados
packet.put("Pose heading (deg)", 180.0); // Grados

// Agrega otros valores de telemetría aquí...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Alternativamente, usa MultipleTelemetry y la telemetría del SDK estándar:
// Durante OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// Durante Loop:
telemetry.addData("Pose x", 6.3); // Pulgadas
telemetry.addData("Pose y", 2.8); // Pulgadas
telemetry.addData("Pose heading", 3.14); // Radianes

// o...
telemetry.addData("Pose heading (deg)", 180.0); // Grados

// Agrega otros valores de telemetría aquí...
telemetry.update();
```

</TabItem>
</Tabs>

## Configuración

- **Campo:** La imagen del campo a usar. Se admiten todos los juegos recientes de FRC y FTC. Para agregar una imagen de campo personalizada, consulta [Recursos personalizados](/more-features/custom-assets).
- **Orientación:** La orientación de la imagen del campo en el panel del visor.
- **Tamaño:** La longitud del lado del robot (30/27/24 pulgadas para FRC, 18/16/14 pulgadas para FTC).

:::info
El sistema de coordenadas utilizado en esta pestaña es personalizable. Consulta la página de [sistemas de coordenadas](/more-features/coordinate-systems) para obtener detalles.
:::
