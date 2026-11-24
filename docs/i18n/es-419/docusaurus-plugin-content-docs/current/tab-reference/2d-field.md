---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 Campo 2D {#2d-field}

La pestaña **Campo 2D** te muestra una vista superior del robot sobre el mapa de la cancha. También sirve para ver datos extra, como el estado de los objetivos de visión y poses de referencia.

<img src="/img/tab-reference/2d-field-1.webp" alt="Descripción general de la pestaña Campo 2D" />

_En la imagen de arriba se muestra la interfaz en inglés._

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo controla la reproducción y te ayuda a explorar el registro. Haz clic en cualquier punto para seleccionar un instante y clic derecho para quitar la selección. Ese instante se sincroniza en todas las pestañas, así que puedes ubicar el mismo momento al instante en otras vistas.

Las franjas amarillas marcan cuándo el robot está en modo autónomo; las azules, en teledirigido (teleop); y las grises, en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y mueve la rueda del mouse (o desliza) hacia arriba o hacia abajo. También puedes seleccionar un tramo específico haciendo clic y arrastrando mientras mantienes presionada la tecla `Shift`. Para moverte a izquierda o derecha, desplázate horizontalmente (si tu dispositivo lo permite) o haz clic y arrastra sobre la línea de tiempo. Cuando estés conectado en vivo, moverte hacia la izquierda desbloquea la vista del tiempo actual, y llegar hasta el extremo derecho la vuelve a fijar en tiempo real. Presiona `Ctrl+\` para hacer zoom automáticamente al período en que el robot está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Línea de tiempo" />

</details>

## Controles de la cámara {#camera-controls}

Usa la rueda del mouse sobre el campo para acercar o alejar la vista, y haz clic y arrastra para moverte por el mapa. Si haces clic derecho en cualquier parte del campo, abrirás el menú de la cámara con estas opciones:

- **Desbloqueado**: Tú controlas el desplazamiento y el zoom manualmente.
- **Bloqueado al robot**: La cámara sigue al robot automáticamente mientras se mueve.
- **Bloqueado al robot y rotación**: La cámara sigue al robot y además gira con él.

Incluso en los modos bloqueados, puedes arrastrar la vista para alejarte del robot cuando quieras. También puedes usar los botones de orientación en el panel de control para rotar el campo en cualquier modo.

## Agregar objetos {#adding-objects}

Para empezar, arrastra un campo a la sección **Poses**. Puedes quitar un objeto con el botón X, u ocultarlo temporalmente haciendo clic en el ícono del ojo o dando doble clic en su nombre. Si quieres limpiar todo de una vez, haz clic en el ícono de la papelera junto al título del eje y elige `Borrar todo`. También puedes reordenar los objetos de la lista arrastrándolos.

**Para personalizar un objeto, haz clic en su ícono de color o haz clic derecho sobre su nombre.** AdvantageScope ofrece muchos tipos de objetos, y varios se pueden ajustar (por ejemplo, cambiarles el color). Ten en cuenta que algunos objetos deben agregarse como elementos secundarios (hijos) dentro de otro objeto existente.

:::tip
Haz clic en el ícono `?` para ver la lista completa de tipos de objetos disponibles. Ahí también verás qué tipos de datos acepta cada uno y si necesita ir dentro de otro objeto.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="Campo 2D con objetos" />

## Formato de datos {#data-format}

Los datos geométricos deben publicarse en formato `struct` o `protobuf` codificado en bytes. Se admiten varios tipos 2D y 3D, como `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d`, entre otros.

Varias bibliotecas ya admiten `struct`, incluidas WPILib y AdvantageKit. En el ejemplo de abajo puedes ver cómo registrar una pose 2D en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

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
// Este protocolo no admite el formato struct moderno, pero puedes publicar
// los valores de pose usando campos separados con los sufijos
// "x", "y" y "heading" (como se muestra abajo):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Pulgadas
packet.put("Pose y", 2.8); // Pulgadas
packet.put("Pose heading", 3.14); // Radianes

// También puedes publicar la orientación (heading) en grados
packet.put("Pose heading (deg)", 180.0); // Grados

// Agrega aquí otros valores de telemetría...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// O usa MultipleTelemetry junto con la telemetría estándar del SDK:
// Durante OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// Durante Loop:
telemetry.addData("Pose x", 6.3); // Pulgadas
telemetry.addData("Pose y", 2.8); // Pulgadas
telemetry.addData("Pose heading", 3.14); // Radianes

// o...
telemetry.addData("Pose heading (deg)", 180.0); // Grados

// Agrega aquí otros valores de telemetría...
telemetry.update();
```

</TabItem>
</Tabs>

## Configuración {#configuration}

- **Campo:** La imagen de la cancha que quieres usar. Están incluidos todos los juegos recientes de FRC y FTC. Si quieres subir una imagen propia, revisa [Recursos personalizados](/more-features/custom-assets).
- **Orientación:** Cómo se orienta la imagen del campo dentro del panel del visor.
- **Tamaño:** El largo del lado del robot (30, 27 o 24 pulg. para FRC; 18, 16 o 14 pulg. para FTC).

:::info
Puedes cambiar el sistema de coordenadas que usa esta pestaña. Consulta la página de [sistemas de coordenadas](/more-features/coordinate-systems) para ver cómo hacerlo.
:::
