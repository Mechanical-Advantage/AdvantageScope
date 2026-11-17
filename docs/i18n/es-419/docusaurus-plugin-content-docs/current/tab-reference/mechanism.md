---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mecanismo {#mechanism}

La pestaña **Mecanismo** te permite visualizar un mecanismo articulado creado con uno o más objetos [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.webp" alt="Descripción general de la pestaña Mecanismo" />

_En la imagen de arriba se muestra la interfaz en inglés._

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo controla la reproducción y te ayuda a explorar el registro. Haz clic en cualquier punto para seleccionar un instante y clic derecho para quitar la selección. Ese instante se sincroniza en todas las pestañas, así que puedes ubicar el mismo momento al instante en otras vistas.

Las franjas amarillas marcan cuándo el robot está en modo autónomo; las azules, en teledirigido (teleop); y las grises, en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y mueve la rueda del mouse (o desliza) hacia arriba o hacia abajo. También puedes seleccionar un tramo específico haciendo clic y arrastrando mientras mantienes presionada la tecla `Shift`. Para moverte a izquierda o derecha, desplázate horizontalmente (si tu dispositivo lo permite) o haz clic y arrastra sobre la línea de tiempo. Cuando estés conectado en vivo, moverte hacia la izquierda desbloquea la vista del tiempo actual, y llegar hasta el extremo derecho la vuelve a fijar en tiempo real. Presiona `Ctrl+\` para hacer zoom automáticamente al período en que el robot está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Línea de tiempo" />

</details>

## Agregar mecanismos {#adding-mechanisms}

Para empezar, arrastra un `Mechanism2d` hacia el panel de control. Puedes quitar un mecanismo con el botón X, u ocultarlo temporalmente haciendo clic en el ícono del ojo o dando doble clic en su nombre. Si quieres limpiar todo de una vez, haz clic en el ícono de la papelera junto al título del eje y elige `Borrar todo`. También puedes reordenar los mecanismos en la lista arrastrándolos.

## Publicación de datos {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Para publicar datos de un mecanismo con WPILib, registra tu objeto `Mechanism2d` de forma periódica usando `Telemetry` (como en el ejemplo). Ten en cuenta que esta llamada guarda una foto del estado actual del `Mechanism2d`, así que debes llamarla en cada ciclo después de actualizar el objeto.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Para publicar datos de un mecanismo con AdvantageKit, registra tu `Mechanism2d` de forma periódica como un campo de salida (como en el ejemplo). Ten en cuenta que esta llamada guarda una foto del estado actual del `Mechanism2d`, así que debes llamarla en cada ciclo después de actualizar el objeto.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
Puedes usar la anotación [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) de AdvantageKit para registrar automáticamente el estado del mecanismo en cada ciclo sin tener que llamar a `Logger.recordOutput`.
:::

</TabItem>
</Tabs>
