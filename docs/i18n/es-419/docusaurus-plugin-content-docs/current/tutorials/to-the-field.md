---
sidebar_position: 2
---

# 🤖 Al campo: visualización del robot

Ahora que ya tienes telemetría básica funcionando, ¡es momento de visualizar tu robot! AdvantageScope ofrece potentes visores de campo 2D y 3D que dan vida a la odometría, estimaciones de visión, trayectorias y mecanismos articulados sobre modelos de campo de FRC y FTC.

En este tutorial aprenderás a:

- Publicar datos estructurados de poses usando la **API Telemetry**.
- Usar las pestañas **🗺️ Campo 2D** y **👀 Campo 3D** para visualizar el movimiento del robot.
- Publicar y renderizar un mecanismo tanto en 2D como en 3D.

## 1. Publica poses

En WPILib, los objetos geométricos como `Pose2d`, `Pose3d` y `Translation2d` se usan para representar la ubicación del robot y de los elementos del campo. Con la **API Telemetry**, puedes registrar poses/traslaciones y arreglos (como rutas planeadas u objetivos de visión) directamente con una sola llamada a un método:

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

<details>
<summary>OpMode de ejemplo</summary>

¿Quieres probar las funciones de visualización de AdvantageScope sin un proyecto completo de robot? Copia el OpMode de abajo, que publica varias poses 2D y 3D de demostración sobre un modelo de campo de FRC. Consulta 👋 [¡Hola, telemetría!](/tutorials/hello-telemetry) para ver cómo crear un nuevo proyecto WPILib y configurarlo para telemetría.

```java
@Teleop
public class ExampleTeleop implements OpMode {
  @Override
  public void periodic() {
    double t = Timer.getTimestamp();

    // Genera una trayectoria circular de ejemplo
    double x = 2.0 * Math.cos(t * 0.5);
    double y = 2.0 * Math.sin(t * 0.5);
    Rotation2d rotation = Rotation2d.fromRadians(t * 0.5 + Math.PI / 2.0);
    Pose2d robotPose2d = new Pose2d(x, y, rotation);

    // Crea una pose 3D de ejemplo (por ejemplo, de localización por visión o cabeceo/alabeo del giroscopio)
    Pose3d robotPose3d = new Pose3d(x, y, 0.0, new Rotation3d(0.0, 0.0, rotation.getRadians()));

    // Crea una trayectoria de ejemplo (un arreglo de objetos Pose2d)
    Pose2d[] trajectory = new Pose2d[] {
        new Pose2d(8.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 6.0, Rotation2d.CW_PI_2)
    };

    // Registra poses individuales en 2D y 3D
    Telemetry.log("Field/RobotPose2d", robotPose2d);
    Telemetry.log("Field/RobotPose3d", robotPose3d);

    // Registra un arreglo de poses (por ejemplo, trayectoria o poses de AprilTags)
    Telemetry.log("Field/Trajectory", trajectory);
  }
}
```

</details>

En AdvantageScope, los valores geométricos en la barra lateral aparecen etiquetados con su tipo. También puedes expandir cada campo para examinar los componentes individuales de la pose, como los valores de X, Y y rotación:

<img src="/img/tutorials/to-the-field-1.webp" alt="Visualización de datos de poses en la barra lateral de AdvantageScope." />

_La imagen de arriba muestra la interfaz en inglés._

## 2. Visualiza datos en 2D

La pestaña 🗺️ [Campo 2D](/tab-reference/2d-field) muestra una vista superior de tu robot superpuesta sobre el campo de competencia.

1. En AdvantageScope, haz clic en el botón **+** en la barra de pestañas y selecciona **Campo 2D** (o selecciona una pestaña de Campo 2D existente).
2. En el menú desplegable "Campo" del panel de control inferior, selecciona la temporada de juego actual o un campo permanente.
3. En el árbol de la barra lateral, busca `NT:/Telemetry/Field/RobotPose2d` y arrástralo a la lista "Poses" en el panel de control.
4. ¡Tu robot aparecerá en el campo!
5. Haz clic en el ícono junto a la pose en el panel de control para cambiar el color del robot.

:::info Controles de cámara

Haz clic derecho en cualquier lugar del lienzo del campo para elegir entre **Desbloqueado**, **Bloqueado al robot** (se desplaza con el robot) o **Bloqueado al robot y rotación** (rota el campo para que tu robot siempre apunte hacia arriba). Haz clic en los botones bajo "Orientación" para ajustar la rotación.
:::

<img src="/img/tutorials/to-the-field-2.webp" alt="Visualización del robot en el campo de FRC 2026." />

_La imagen de arriba muestra la interfaz en inglés._

## 3. Cambia el tipo de objeto

AdvantageScope admite muchos tipos de objetos visuales además de simples poses del robot, incluidos fantasmas (robots translúcidos), trayectorias, objetivos de visión, mapas de calor, AprilTags, elementos de juego ¡y más! Para explorar qué tipos de objetos puede renderizar AdvantageScope:

1. Haz clic en el ícono `?` (Ayuda) ubicado en el panel de control.
2. Se abrirá una ventana con la lista de todos los tipos visuales compatibles, los tipos de datos esperados (por ejemplo, `Pose2d`, `Pose3d[]`, `Translation2d`) y si se pueden agregar como elementos independientes o como elementos secundarios adjuntos a otro objeto.

Haz clic en el ícono junto a cada pose en el panel de control para cambiar el tipo de objeto. ¡Prueba cambiar la pose del robot a otro tipo de objeto como un fantasma, una flecha o un mapa de calor!

<img src="/img/tutorials/to-the-field-3.webp" alt="Ventana de ayuda integrada para el campo 2D." height="500" />

_La imagen de arriba muestra la interfaz en inglés._

## 4. Visualiza datos en 3D

La pestaña 👀 [Campo 3D](/tab-reference/3d-field) renderiza un campo en 3D completo con elementos de juego, iluminación y modelos de robot personalizables.

1. Haz clic en **+** en la barra de pestañas y selecciona **Campo 3D** (o selecciona una pestaña de Campo 3D existente).
2. Selecciona el modelo de tu temporada de juego en el menú desplegable "Campo".
3. Arrastra `NT:/Telemetry/Field/RobotPose3d` o `NT:/Telemetry/Field/RobotPose2d` a la sección "Poses" (las poses 2D se colocan automáticamente sobre el piso del campo).
4. Arrastra `NT:/Telemetry/Field/Trajectory` a la lista "Poses" y cambia su tipo a **Trayectoria** para renderizar una ruta como una cinta sobre el campo.
5. Haz clic y arrastra con el **botón izquierdo del mouse** para rotar la cámara alrededor del campo. Arrastra con el **botón derecho del mouse** para desplazar la vista. Desplázate para hacer zoom.
6. Como alternativa, usa **WASD** para trasladarte, **IJKL** para rotar y **Q/E** para subir y bajar.
7. Haz clic derecho en la vista 3D para alternar entre **Orbitar robot**, **Driver Station** (ver el partido desde la perspectiva de tu alianza) y **Cámara fija** (ver desde cámaras de visión montadas en el robot).

<img src="/img/tutorials/to-the-field-4.webp" alt="Pestaña Campo 3D renderizando un modelo de robot 3D navegando por el campo con una cinta de trayectoria." />

_La imagen de arriba muestra la interfaz en inglés._

## 5. Publica datos de mecanismos

Si tu robot tiene estructuras articuladas como un elevador, un brazo o una muñeca, puedes visualizarlas usando `Mechanism2d` de WPILib. Consulta la [documentación](https://docs.wpilib.org/es/stable/docs/software/dashboards/glass/mech2d-widget.html) de WPILib para más detalles. Abajo se muestra un ejemplo para un brazo de una sola articulación.

```java
public class ExampleTeleop implements OpMode {
  // Crea un lienzo de mecanismo 2D (ancho 2 m, alto 2 m)
  private final Mechanism2d mechanism = new Mechanism2d(2.0, 2.0);
  private MechanismLigament2d arm;

  public ExampleTeleop(Robot robot) {
    // Crea un brazo con raíz en (1 m, 0.5 m)
    MechanismRoot2d root = mechanism.getRoot("ArmRoot", 1.0, 0.5);
    arm = root.append(new MechanismLigament2d("Arm", 0.8, 0.0, 6.0, new Color8Bit(255, 100, 0)));
  }

  @Override
  public void periodic() {
    // Anima el ángulo del brazo
    double angle = 45.0 + 45.0 * Math.sin(Timer.getTimestamp() * 2.0);
    arm.setAngle(angle);

    // Publica el estado del mecanismo en cada ciclo de ejecución
    Telemetry.log("Superstructure/Mechanism", mechanism);
  }
}
```

## 6. Visualiza mecanismos en 2D

La pestaña ⚙️ [Mecanismo](/tab-reference/mechanism) se puede usar para visualizar mecanismos en 2D.

1. Haz clic en **+** en la barra de pestañas y selecciona **Mecanismo**.
2. Arrastra `NT:/Telemetry/Superstructure/Mechanism` al panel de control. Verás moverse en tiempo real el brazo 2D animado.

<img src="/img/tutorials/to-the-field-5.webp" alt="La pestaña Mecanismo mostrando la visualización de un brazo articulado en 2D." />

_La imagen de arriba muestra la interfaz en inglés._

## 7. Visualiza mecanismos en 3D

¡Puedes proyectar este mismo `Mechanism2d` directamente sobre tu robot en la pestaña Campo 3D!

1. En la pestaña Campo 3D, asegúrate de que la pose de tu robot esté agregada a la lista "Poses".
2. Arrastra `NT:/Telemetry/Superstructure/Mechanism` **sobre la entrada de la pose del robot** en la lista de objetos (como un objeto secundario).
3. ¡El mecanismo 2D se proyecta en el espacio 3D sobre el chasis del robot! Haz clic en el ícono de engranaje junto al mecanismo para alternar entre los planos **XZ** (perfil lateral) y **YZ** (perfil frontal).

<img src="/img/tutorials/to-the-field-6.webp" alt="Pestaña Campo 3D mostrando un mecanismo proyectado sobre un modelo de robot 3D." />

_La imagen de arriba muestra la interfaz en inglés._

## ¿Qué sigue?

Ahora que ya puedes visualizar el movimiento y los mecanismos de tu robot en 2D y 3D:

- **🕹️ [Tomando el control: DS y joysticks](/tutorials/taking-control):** Aprende a integrarte con la FIRST Driver Station, trabajar con registros de la DS y visualizar entradas de controles.
- **👀 [Campo 3D](/tab-reference/3d-field):** Una guía completa de la pestaña Campo 3D, que incluye visualización de elementos de juego, opciones de cámara y modos de renderizado.
- **[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr):** Lleva la vista de campo 3D a la realidad aumentada en iPhone y iPad.
- **🎬 [Video](/tab-reference/video):** Compara tu visualización de campo lado a lado con grabaciones reales de partidos.
- **🦀 [Swerve](/tab-reference/swerve):** Visualiza el estado de mecanismos swerve, incluidas superposiciones en los campos 2D y 3D.
- **⚙️ [Recursos personalizados](/more-features/custom-assets):** Agrega modelos CAD personalizados, mecanismos articulados e imágenes o modelos de campo.
