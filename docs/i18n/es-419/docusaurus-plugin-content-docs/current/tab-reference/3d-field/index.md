import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 Campo 3D {#3d-field}

La pestaña **Campo 3D** te muestra una visualización tridimensional del robot y de la cancha. Funciona muy bien con poses 2D normales, pero brilla especialmente cuando trabajas con cálculos 3D (como localización con AprilTags). Puedes elegir entre varias vistas de cámara —relativas al campo, relativas al robot o fijas— e incluso llevar la vista a realidad aumentada con [AdvantageScope XR](advantagescope-xr). La línea de tiempo te indica cuándo estuvo habilitado el robot y te permite recorrer los datos del registro.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="Ejemplo de pestaña Campo 3D" />

_En la imagen de arriba se muestra la interfaz en inglés._

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo controla la reproducción y te ayuda a explorar el registro. Haz clic en cualquier punto para seleccionar un instante y clic derecho para quitar la selección. Ese instante se sincroniza en todas las pestañas, así que puedes ubicar el mismo momento al instante en otras vistas.

Las franjas amarillas marcan cuándo el robot está en modo autónomo; las azules, en teledirigido (teleop); y las grises, en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y mueve la rueda del mouse (o desliza) hacia arriba o hacia abajo. También puedes seleccionar un tramo específico haciendo clic y arrastrando mientras mantienes presionada la tecla `Shift`. Para moverte a izquierda o derecha, desplázate horizontalmente (si tu dispositivo lo permite) o haz clic y arrastra sobre la línea de tiempo. Cuando estés conectado en vivo, moverte hacia la izquierda desbloquea la vista del tiempo actual, y llegar hasta el extremo derecho la vuelve a fijar en tiempo real. Presiona `Ctrl+\` para hacer zoom automáticamente al período en que el robot está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Línea de tiempo" />

</details>

:::warning Campo de FTC 2026-2027
El modelo del campo de FTC 2026-2027 no trae AprilTags integrados porque se espera que la ubicación de las etiquetas en la colmena cambie durante el partido. Los equipos pueden publicar un `Pose3d[]` y un `number[]` para agregar objetos AprilTag dinámicos en el campo. El tamaño correcto del AprilTag para esta cancha es de **3.25 pulg.**
:::

:::warning Campo de FRC 2026
El modelo del campo de FRC 2026 coincide con la distribución de AprilTags del campo **soldado** (_welded_). Aunque las diferencias entre el campo soldado y el de AndyMark son mínimas, podrías notar pequeños desfases (~0.5 pulg.) al visualizar poses de AprilTags basadas en el diseño de AndyMark.
:::

## Agregar objetos {#adding-objects}

Para empezar, arrastra un campo a la sección **Poses**. Puedes quitar un objeto con el botón X, u ocultarlo temporalmente haciendo clic en el ícono del ojo o dando doble clic en su nombre. Si quieres limpiar todo de una vez, haz clic en el ícono de la papelera junto al título del eje y elige `Borrar todo`. También puedes reordenar los objetos de la lista arrastrándolos.

**Para personalizar un objeto, haz clic en su ícono de color o haz clic derecho sobre su nombre.** AdvantageScope ofrece muchos tipos de objetos, y varios se pueden ajustar (por ejemplo, cambiarles el color o el modelo del robot). Ten en cuenta que algunos objetos deben agregarse como elementos secundarios (hijos) dentro de otro objeto existente.

:::tip
Haz clic en el ícono `?` para ver la lista completa de tipos de objetos disponibles. Ahí también verás qué tipos de datos acepta cada uno y si necesita ir dentro de otro objeto.
:::

:::info
AdvantageScope admite varios tamaños de AprilTags para los campos de FTC. El tamaño se mide tomando el **largo del lado de la parte negra del AprilTag**, sin contar el borde blanco exterior.
:::

## Formato de datos {#data-format}

Los datos geométricos deben publicarse en formato `struct` o `protobuf` codificado en bytes. Se admiten varios tipos 2D y 3D, como `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d`, entre otros.

Varias bibliotecas ya admiten `struct`, incluidas WPILib y AdvantageKit. En el ejemplo de abajo puedes ver cómo registrar una pose 3D en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose3d[] {poseA, poseB});
```

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
// Este protocolo no admite el formato struct moderno, pero puedes publicar
// los valores de pose usando campos separados con los sufijos
// "x", "y" y "heading" (como se muestra abajo):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Pulgadas
packet.put("Pose y", 2.8); // Pulgadas
packet.put("Pose heading", 3.14); // Radianes

// También puedes publicar la orientación (heading) en grados
packet.put("Pose heading (deg)", 180.0); // Grados
```

</TabItem>
</Tabs>

## Mecanismos y componentes {#mechanisms-and-components}

Puedes visualizar mecanismos en 3D usando mecanismos 2D proyectados o componentes 3D articulados.

### Mecanismos 2D {#2d-mechanisms}

Para ver los datos registrados con un [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html), arrastra el campo del mecanismo sobre un objeto Robot o Fantasma que ya tengas en la lista. El mecanismo se proyecta sobre el plano XZ o YZ del robot usando rectángulos simples, como se ve abajo. Haz clic en el ícono de engranaje o haz clic derecho en el nombre del campo para cambiar entre los planos XZ y YZ. El origen del robot queda centrado en el borde inferior del mecanismo.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="Mecanismo 2D" />

### Componentes 3D {#3d-components}

:::warning
Configurar componentes 3D puede ser complejo y llevar bastante tiempo. Si prefieres algo más rápido y directo, te conviene usar el soporte de `Mechanism2d` que explicamos arriba para ver tus mecanismos en el campo 3D.
:::

Si quieres visualizar mecanismos con piezas articuladas en 3D, registra un arreglo de poses 3D que representen la posición de cada componente respecto al robot. Agrega ese campo a un objeto Robot o Fantasma y selecciona el tipo de objeto **Componente**.

Cada pieza puede moverse por separado (como el carro de un elevador, un brazo o una garra). Si usas AdvantageKit, puedes aprovechar el método [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) para convertir un `Mechanism2d` en un arreglo de objetos `Pose3d`. Para aprender a configurar robots con componentes articulados, consulta [Recursos personalizados](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="Mecanismo 3D" />

## Objetos de elementos de juego {#game-piece-objects}

Cada cancha incluye tipos de objetos propios para sus elementos de juego, lo que te permite dibujarlos en cualquier parte del campo según los datos que publique tu código. Esto resulta muy útil para:

- Ver en acción tus rutinas autónomas simuladas con animaciones sencillas
- Mostrar dónde detectó la cámara los elementos de juego en la cancha
- Indicar cuándo y dónde hay un elemento de juego dentro del robot
- Visualizar trayectorias de disparo calculadas con física

Otro uso súper práctico es reflejar el estado de los sensores del robot. Por ejemplo, en un robot de la temporada 2024, un sensor óptico (_beam break_) en el recorrido de la nota puede hacer que aparezca una nota dentro del robot en cuanto la detecta (como se ve en la imagen).

<details>
<summary>Ejemplo de código</summary>

El proyecto de ejemplo KitBot 2024 de AdvantageKit incluye un [comando](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) sencillo que anima una nota viajando desde el robot hacia el _speaker_. Ese comando se integra en la [secuencia de lanzamiento](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) estándar y dispara la animación cada vez que se suelta una nota. En [este video](https://youtube.com/shorts/-HxfDo9f19U?feature=share) puedes ver cómo se usan estas animaciones para visualizar rutinas autónomas de varios juegos distintos.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="Visualización de la nota de KitBot 2024" />

## Opciones de cámara {#camera-options}

Para cambiar el modo de cámara, haz clic derecho sobre la vista del campo. Cada ventana separada controla su propia cámara y posición de forma independiente, así que puedes armar fácilmente vistas multicámara.

:::info
Haz clic derecho en la vista del campo y selecciona "Establecer FOV..." para ajustar el campo de visión de las cámaras orbitales y de la Driver Station.
:::

### Orbitar campo {#orbit-field}

Es el modo predeterminado: la cámara se mueve libremente respecto al campo. **Clic izquierdo + arrastrar** gira la cámara, **clic derecho + arrastrar** la desplaza (paneo) y la **rueda del mouse** acerca o aleja la vista.

:::tip
También puedes mover la cámara con el teclado: **WASD** para desplazarte horizontalmente, **IJKL** para rotar y **E** / **Q** para subir o bajar.
:::

### Orbitar robot {#orbit-robot}

Tiene los mismos controles que **Orbitar campo**, pero la posición de la cámara queda fija respecto al robot. Es ideal para hacer tomas de seguimiento mientras se mueve.

### Driver Station {#driver-station}

Este modo coloca la cámara detrás de una de las estaciones del conductor, a la altura aproximada de los ojos. En el menú **Driver Station**, puedes elegir una estación específica manualmente o dejarlo en **Automático** para que use la alianza y el número de estación guardados en el registro.

:::warning
La selección automática del número de estación puede fallar al abrir registros generados con AdvantageKit 2023 o versiones anteriores.
:::

### Cámara fija {#fixed-camera}

Cada modelo de robot incluye cámaras fijas preconfiguradas, como cámaras de visión o de conducción, con su propia posición, relación de aspecto y FOV. Son muy útiles para revisar qué ve la cámara de visión o simular la vista del conductor. Abajo tienes un ejemplo de una cámara de conductor.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Cámara fija" />

Si agregas una pose con el tipo **Anulación de cámara**, esta reemplazará la posición predeterminada de todas las cámaras fijas, manteniendo sus FOV y relaciones de aspecto. Así tu código puede enviar la ubicación de una cámara móvil, como una montada en una torreta o en la capucha de un disparador.

:::info
Al igual que el resto de las poses, la pose de **Anulación de cámara** debe ser _relativa al campo_, no relativa al robot.
:::

## Configuración {#configuration}

Elige el modelo de campo desde el menú desplegable; están incluidos todos los juegos recientes de FRC y FTC. Si tu computadora tiene pocos recursos gráficos, te recomendamos usar los campos "Perenne". Los campos "Ejes" (_Axes_) muestran únicamente los ejes XYZ en el origen junto con el contorno de la cancha para dar referencia de escala.

:::info
Puedes personalizar el sistema de coordenadas de esta pestaña. Consulta la página de [sistemas de coordenadas](/more-features/coordinate-systems) para ver los detalles.
:::

### Modos de renderizado {#rendering-modes}

El campo 3D ofrece tres modos de renderizado:

- **Cinemático (izquierda):** Incluye sombras, iluminación, reflejos y modelos 3D muy detallados para lograr un aspecto realista. Requiere una GPU con buena potencia.
- **Estándar (centro):** Es el modo predeterminado; usa iluminación mínima y modelos 3D simplificados. Funciona bien en la mayoría de las computadoras.
- **Baja potencia (derecha):** Reduce la tasa de fotogramas, la resolución y el nivel de detalle para ahorrar batería y ofrecer un rendimiento más fluido en equipos modestos.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="Comparación de modos de renderizado" />

Para cambiar el modo de renderizado, abre las preferencias desde `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS). La opción **Modo 3D (batería)** te permite elegir un modo distinto cuando la laptop no está conectada a la corriente, algo muy útil para cuidar la batería durante la competencia.

<img src="/img/prefs_es-419.webp" alt="Diagrama de preferencias" height="450" />
