import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 Campo 3D

El campo 3D muestra una visualización 3D del robot y del campo. Se puede utilizar con poses 2D regulares, pero es especialmente útil cuando se trabaja con cálculos 3D (como localizar con AprilTags). Hay varias vistas de cámara disponibles, relativas al campo, relativas al robot y fijas. [AdvantageScope XR](advantagescope-xr) permite visualizar esta pestaña mediante realidad aumentada. La línea de tiempo muestra cuándo el robot está habilitado y se puede utilizar para navegar a través de los datos del registro.

<img src="/img/tab-reference/3d-field/3d-field-1.png" alt="Ejemplo de pestaña de campo 3D" />

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo se utiliza para controlar la reproducción y la visualización. Al hacer clic en la línea de tiempo se selecciona un tiempo, y al hacer clic con el botón derecho se anula la selección. El tiempo seleccionado se sincroniza en todas las pestañas, lo que facilita la búsqueda rápida de esta ubicación en otras vistas.

Las secciones amarillas indican cuando el robot es autónomo, las secciones azules indican cuando el robot es teledirigido (teleop), y las secciones grises indican cuando el robot está en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y desplázate hacia arriba o hacia abajo. También se puede seleccionar un rango haciendo clic y arrastrando mientras se mantiene presionada la tecla `Shift`. Muévete hacia la izquierda y hacia la derecha desplazándose horizontalmente (en dispositivos compatibles) o haciendo clic y arrastrando en la línea de tiempo. Cuando estás conectado en vivo, desplazarte hacia la izquierda desbloquea del tiempo actual, y desplazarte hasta la derecha vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom al período en el que el robot está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Línea de tiempo" />

</details>

:::warning
El modelo de campo de FRC 2026 es consistente con el diseño de AprilTag para el campo **soldado**. Las diferencias entre los campos soldados y los campos de AndyMark son muy menores, pero puede haber pequeñas desalineaciones (~0.5 pulgadas) al visualizar poses de AprilTag basadas en el diseño del campo de AndyMark.
:::

## Agregar objetos

Para comenzar, arrastra un campo a la sección "Poses". Elimina un objeto con el botón X, u ocúltalo temporalmente haciendo clic en el ícono del ojo o haciendo doble clic en el nombre del campo. Para eliminar todos los objetos, haz clic en la papelera cerca del título del eje y luego en `Borrar todo`.

Los objetos se pueden reorganizar en la lista haciendo clic y arrastrando. **Para personalizar cada objeto, haz clic en el ícono de color o haz clic con el botón derecho en el nombre del campo.** AdvantageScope admite una gran cantidad de tipos de objetos, muchos de los cuales se pueden personalizar (como cambiar colores y modelos de robot). Algunos objetos deben agregarse como elementos secundarios a un objeto existente.

:::tip
Para ver una lista completa de tipos de objetos compatibles, haz clic en el ícono `?`. Esta lista también incluye los tipos de datos compatibles y si los objetos deben agregarse como elementos secundarios.
:::

:::info
AdvantageScope admite varios tamaños de AprilTags para campos de FTC. Los tamaños se miden como la **longitud del lado de la sección negra del AprilTag**, sin incluir el borde blanco requerido.
:::

## Formato de datos

Los datos de geometría deben publicarse como un struct o protobuf codificado en bytes. Se admiten varios tipos de geometría 2D y 3D, incluidos `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` y más. Muchas bibliotecas admiten el formato struct, incluidas WPILib y AdvantageKit. El código de ejemplo a continuación muestra cómo registrar datos de pose 3D en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

StructPublisher<Pose3d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose3d.struct).publish();
StructArrayPublisher<Pose3d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose3d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose3d[] {poseA, poseB});
}
```

:::tip
La clase [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) de WPILib también se puede utilizar para registrar varios conjuntos de datos de pose 2D juntos.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
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
```

</TabItem>
</Tabs>

## Mecanismos y componentes

Los datos de los mecanismos se pueden visualizar utilizando mecanismos 2D o componentes 3D articulados.

### Mecanismos 2D {#2d-mechanisms}

Para visualizar los datos del mecanismo registrados utilizando un [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html), agrega el campo del mecanismo a un objeto de robot o fantasma existente. El mecanismo se proyecta en el plano XZ o YZ del robot utilizando cuadros simples, como se muestra a continuación. Haz clic en el icono de engranaje o haz clic derecho en el nombre del campo para cambiar entre los planos XZ e YZ. El origen del robot está centrado en el borde inferior del mecanismo.

<img src="/img/tab-reference/3d-field/3d-field-2.png" alt="Mecanismo 2D" />

### Componentes 3D

:::warning
Configurar componentes 3D puede ser complejo y llevar mucho tiempo. Considera utilizar el soporte `Mechanism2d` de AdvantageScope como se describe anteriormente, que ofrece un enfoque más simplificado para visualizar mecanismos en el campo 3D.
:::

Los mecanismos se pueden visualizar con componentes articulados registrando un conjunto de poses 3D que representan las ubicaciones relativas al robot de cada componente. Agrega las poses a un objeto de robot o fantasma existente y establece el tipo de objeto en "Componente".

Cada componente se puede mover de forma independiente (como un carro elevador, un brazo o un actuador final). Los usuarios de AdvantageKit deben considerar el uso del método [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) para convertir un Mechanism2d en una matriz de objetos Pose3d. Para obtener más información sobre la configuración de robots con componentes, consulta [Recursos personalizados](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.png" alt="Mecanismo 3D" />

## Objetos de elementos de juego {#game-piece-objects}

Cada campo incluye un conjunto de tipos de objetos de elementos de juego, lo que permite renderizar los elementos de juego en cualquier posición del campo utilizando datos publicados por el código del robot. Esto tiene una variedad de aplicaciones, que incluyen:

- Visualización de las acciones de rutinas autónomas simuladas utilizando animaciones simples
- Mostrar las ubicaciones detectadas de los elementos de juego en el campo
- Indicar dónde se encuentran los elementos de juego dentro de un robot
- Ver las trayectorias de los disparos basadas en cálculos físicos

Otro caso de uso simple es mostrar el estado de los elementos de juego dentro del robot en función de los datos del sensor. Por ejemplo, un sensor de haz (beam break sensor) dentro de la ruta de la nota para un robot 2024 podría hacer que aparezca una nota (como se muestra a continuación).

<details>
<summary>Ejemplo de código</summary>

El proyecto de ejemplo KitBot 2024 de AdvantageKit incluye un ejemplo simple de un [comando](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) que anima una nota viajando desde el robot hasta el altavoz. Este comando se incorpora a la [secuencia de lanzamiento](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) estándar, activando la animación cada vez que se suelta una nota. [Este video](https://youtube.com/shorts/-HxfDo9f19U?feature=share) muestra cómo las animaciones de elementos de juego se pueden utilizar para visualizar rutinas autónomas para varios juegos diferentes.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.png" alt="Visualización de la nota del KitBot 2024" />

## Opciones de cámara

Para cambiar el modo de cámara seleccionado, haz clic derecho en la vista del campo renderizado. El modo de cámara y la posición se controlan de forma independiente para cada ventana emergente, lo que permite la fácil creación de vistas multicámara.

:::info
Haz clic derecho en la vista de campo renderizada y haz clic en "Establecer FOV..." para ajustar el campo de visión de las cámaras en órbita y de la Driver Station.
:::

### Orbitar campo

Este es el modo de cámara predeterminado, donde la cámara se puede mover libremente en relación con el campo. **Hacer clic izquierdo + arrastrar** gira la cámara, y **hacer clic derecho + arrastrar** mueve la cámara (paneo). **Desplázate (scroll)** para acercar y alejar.

:::tip
La cámara también se puede controlar utilizando el teclado. Las teclas **WASD** se utilizan para trasladar, las teclas **IJKL** se utilizan para rotar y las teclas **E** y **Q** se utilizan para la traslación vertical.
:::

### Orbitar robot

Este modo tiene los mismos controles que el modo "Orbitar campo", pero la posición de la cámara está bloqueada en relación con el robot. Esto permite tomas de "seguimiento" del movimiento del robot.

### Estación del conductor

Este modo bloquea la cámara detrás de una de las estaciones de control a la altura típica de los ojos. Elige manualmente la estación a visualizar o elige "Automático" para usar la alianza y el número de estación almacenados en los datos de registro.

:::warning
La selección automática del número de estación puede ser inexacta cuando se visualizan datos de registro producidos por AdvantageKit 2023 o anterior.
:::

### Cámara fija

Cada modelo de robot está configurado con un conjunto de cámaras fijas, como cámaras de visión y de conductor. Estas cámaras tienen posiciones, relaciones de aspecto y FOV fijos. Estas vistas suelen ser útiles para comprobar los datos de visión o para simular la vista de cámara del conductor. En el siguiente ejemplo, se muestra una cámara de conductor.

<img src="/img/tab-reference/3d-field/3d-field-5.png" alt="Cámara fija" />

Si se proporciona una pose de "Anulación de cámara", reemplaza las poses predeterminadas de todas las cámaras fijas y conserva sus FOV y relaciones de aspecto configurados. Esto permite que el código del robot proporcione la posición de una cámara en movimiento, como una montada en una torreta o capota del disparador.

:::info
De acuerdo con otros datos de poses, la pose "Anulación de cámara" debe ser _relativa al campo_, no relativa al robot.
:::

## Configuración

El modelo de campo se puede configurar utilizando el menú desplegable. Se admiten todos los juegos recientes de FRC y FTC. Recomendamos usar los campos "Evergreen" (hoja perenne) para dispositivos con rendimiento gráfico limitado. Los campos "Ejes" muestran solo los ejes XYZ en el origen con un contorno de campo para la escala.

:::info
El sistema de coordenadas utilizado en esta pestaña es personalizable. Consulta la página de [sistemas de coordenadas](/more-features/coordinate-systems) para obtener detalles.
:::

### Modos de renderizado {#rendering-modes}

El campo 3D admite tres modos de renderizado:

- **Cinemático:** Renderiza usando sombras, iluminación, reflejos y modelos 3D de gran detalle para un aspecto más realista. Requiere una GPU decentemente potente.
- **Estándar:** Renderiza con iluminación mínima y modelos 3D simplificados. Funciona bien en la mayoría de los dispositivos.
- **Bajo consumo:** Reduce la velocidad de fotogramas, la resolución y el detalle del modelo para reducir el consumo de la batería y proporcionar un rendimiento más consistente en dispositivos de gama baja.

<img src="/img/tab-reference/3d-field/3d-field-6.png" alt="Comparación de modos de renderizado" />

Para configurar el modo de renderizado, abre la ventana de preferencias haciendo clic en `Aplicación` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS). La configuración "Modo 3D (batería)" se puede cambiar desde la predeterminada para anular el modo de renderizado utilizado en una computadora portátil cuando no se está cargando. Por ejemplo, esto se puede usar para preservar la batería durante la competencia.

<img src="/img/prefs.png" alt="Diagram of preferences" height="350" />
