---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mecanismo

La pestaña del mecanismo muestra un mecanismo articulado creado con uno o más objetos [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.png" alt="Overview of mechanism tab" />

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo se utiliza para controlar la reproducción y la visualización. Al hacer clic en la línea de tiempo se selecciona un tiempo, y al hacer clic con el botón derecho se anula la selección. El tiempo seleccionado se sincroniza en todas las pestañas, lo que facilita la búsqueda rápida de esta ubicación en otras vistas.

Las secciones amarillas indican cuando el robot es autónomo, las secciones azules indican cuando el robot es teledirigido (teleop), y las secciones grises indican cuando el robot está en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y desplázate hacia arriba o hacia abajo. También se puede seleccionar un rango haciendo clic y arrastrando mientras se mantiene presionada la tecla `Shift`. Muévete hacia la izquierda y hacia la derecha desplazándose horizontalmente (en dispositivos compatibles) o haciendo clic y arrastrando en la línea de tiempo. Cuando estás conectado en vivo, desplazarte hacia la izquierda desbloquea del tiempo actual, y desplazarte hasta la derecha vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom al período en el que el robot está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Agregar mecanismos

Para comenzar, arrastra un `Mechanism2d` al panel de control. Elimina un mecanismo usando el botón X, u ocúltalo temporalmente haciendo clic en el ícono del ojo o haciendo doble clic en el nombre del campo. Para eliminar todos los mecanismos, haz clic en la papelera cerca del título del eje y luego en `Borrar todo`. Mecanismos pueden ser reorganizados en la lista haciendo clic y arrastrando.

## Publicación de datos

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Para publicar datos del mecanismo utilizando WPILib, envía un objeto `Mechanism2d` a NetworkTables (como se muestra a continuación). Si el registro de datos está habilitado, los mecanismos también se pueden ver en función del archivo WPILOG generado.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Para publicar datos de mecanismos utilizando AdvantageKit, registra un `Mechanism2d` como un campo de salida (como se muestra a continuación). Ten en cuenta que esta llamada solo registra el estado actual del `Mechanism2d`, por lo que se debe llamar a cada ciclo de bucle después de actualizar el objeto.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
