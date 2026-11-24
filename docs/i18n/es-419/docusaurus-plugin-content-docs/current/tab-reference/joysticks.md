---
sidebar_position: 8
---

# 🎮 Joysticks {#joysticks}

La pestaña **Joysticks** muestra el estado de hasta seis controles conectados. En la imagen de abajo ves un ejemplo con dos controles de Xbox y un joystick genérico: cada botón se ilumina al presionarlo y también puedes ver la posición de las palancas y demás ejes.

<img src="/img/tab-reference/joysticks-1.webp" alt="Descripción general de la pestaña Joysticks" />

_En la imagen de arriba se muestra la interfaz en inglés._

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo controla la reproducción y te ayuda a explorar el registro. Haz clic en cualquier punto para seleccionar un instante y clic derecho para quitar la selección. Ese instante se sincroniza en todas las pestañas, así que puedes ubicar el mismo momento al instante en otras vistas.

Las franjas amarillas marcan cuándo el robot está en modo autónomo; las azules, en teledirigido (teleop); y las grises, en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y mueve la rueda del mouse (o desliza) hacia arriba o hacia abajo. También puedes seleccionar un tramo específico haciendo clic y arrastrando mientras mantienes presionada la tecla `Shift`. Para moverte a izquierda o derecha, desplázate horizontalmente (si tu dispositivo lo permite) o haz clic y arrastra sobre la línea de tiempo. Cuando estés conectado en vivo, moverte hacia la izquierda desbloquea la vista del tiempo actual, y llegar hasta el extremo derecho la vuelve a fijar en tiempo real. Presiona `Ctrl+\` para hacer zoom automáticamente al período en que el robot está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Línea de tiempo" />

</details>

## Panel de control {#control-pane}

Elige el tipo de cada control en la tabla de la parte inferior de la pestaña. Los ID van del 0 al 5 y coinciden con los de la Driver Station y WPILib. Si quieres profundizar en cómo funcionan, consulta la [documentación de WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html).

AdvantageScope ya trae varios modelos comunes, incluido un **Joystick genérico** que muestra todos los botones, ejes y crucetas (POV) en forma de cuadrícula, como en la imagen de arriba. Si quieres agregar tu propio diseño de control, revisa [Recursos personalizados](/more-features/custom-assets).

:::warning
**Los datos de joysticks NO están disponibles por NetworkTables con WPILib estándar.** Sí puedes verlos desde archivos de registro de WPILib (con el [registro de joysticks habilitado](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), archivos de registro de AdvantageKit y transmisión en vivo de AdvantageKit.
:::
