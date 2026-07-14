---
sidebar_position: 8
---

# 🎮 Joysticks

La pestaña de joysticks muestra el estado de hasta seis controladores conectados. La siguiente imagen muestra un diseño de ejemplo, con dos controladores de Xbox y un joystick genérico. Cada botón se resalta cuando se presiona, y se muestran los estados de los joysticks y otros ejes.

<img src="/img/tab-reference/joysticks-1.png" alt="Overview of joystick tab" />

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo se utiliza para controlar la reproducción y la visualización. Al hacer clic en la línea de tiempo se selecciona un tiempo, y al hacer clic con el botón derecho se anula la selección. El tiempo seleccionado se sincroniza en todas las pestañas, lo que facilita la búsqueda rápida de esta ubicación en otras vistas.

Las secciones amarillas indican cuando el robot es autónomo, las secciones azules indican cuando el robot es teledirigido (teleop), y las secciones grises indican cuando el robot está en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y desplázate hacia arriba o hacia abajo. También se puede seleccionar un rango haciendo clic y arrastrando mientras se mantiene presionada la tecla `Shift`. Muévete hacia la izquierda y hacia la derecha desplazándote horizontalmente (en dispositivos compatibles) o haciendo clic y arrastrando en la línea de tiempo. Cuando estás conectado en vivo, desplazarte hacia la izquierda desbloquea del tiempo actual, y desplazarte hasta la derecha vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom al período en el que el robot está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Panel de control

Selecciona los tipos de joysticks en la tabla en la parte inferior de la pestaña. Los ID de los joysticks varían de 0 a 5, y coinciden con los ID en la Driver Station y WPILib. Puedes encontrar más información sobre joysticks en la [documentación de WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html).

AdvantageScope incluye un conjunto de joysticks comunes, que incluye un "Joystick genérico" con todos los botones, ejes y POV en formato de cuadrícula (como se ve arriba). Para agregar un joystick personalizado, consulta [Recursos personalizados](/more-features/custom-assets).

:::warning
**Los datos de los joysticks NO están disponibles a través de una conexión NetworkTables con WPILib estándar.** Se admiten los archivos de registro de WPILib (con el [registro de joysticks habilitado](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), los registros de AdvantageKit y la transmisión de AdvantageKit.
:::
