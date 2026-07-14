---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Puntos

La pestaña de puntos muestra una visualización 2D de puntos arbitrarios. Esta es una herramienta muy flexible, que permite visualizaciones personalizadas de datos/pipelines de visión, estados de mecanismos, etc.

<img src="/img/tab-reference/points-1.png" alt="Point tab example" />

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo se utiliza para controlar la reproducción y la visualización. Al hacer clic en la línea de tiempo se selecciona un tiempo, y al hacer clic con el botón derecho se anula la selección. El tiempo seleccionado se sincroniza en todas las pestañas, lo que facilita la búsqueda rápida de esta ubicación en otras vistas.

Las secciones amarillas indican cuando el robot es autónomo, las secciones azules indican cuando el robot es teledirigido (teleop), y las secciones grises indican cuando el robot está en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y desplázate hacia arriba o hacia abajo. También se puede seleccionar un rango haciendo clic y arrastrando mientras se mantiene presionada la tecla `Shift`. Muévete hacia la izquierda y hacia la derecha desplazándote horizontalmente (en dispositivos compatibles) o haciendo clic y arrastrando en la línea de tiempo. Cuando estás conectado en vivo, desplazarte hacia la izquierda desbloquea del tiempo actual, y desplazarte hasta la derecha vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom al período en el que el robot está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Agregar fuentes

Para comenzar, arrastra un campo a la sección "Fuentes" (Sources). Elimina una fuente usando el botón X, u ocúltala temporalmente haciendo clic en el ícono del ojo o haciendo doble clic en el nombre del campo. Para eliminar todos los objetos, haz clic en la papelera cerca del título del eje y luego en `Borrar todo`.

Las fuentes se pueden reorganizar en la lista haciendo clic y arrastrando. **Para personalizar cada fuente, haz clic en el ícono de color o haz clic derecho en el nombre del campo.** El símbolo, el color y el tamaño de cada fuente se pueden ajustar.

:::tip
Para ver una lista completa de tipos de fuentes admitidas, haz clic en el ícono `?`. Esta lista también incluye los tipos de datos compatibles.
:::

## Formato de datos

Los datos de puntos deben publicarse como un struct o protobuf codificado en bytes, utilizando el tipo `Translation2d[]`. Muchas bibliotecas admiten este formato, incluidas WPILib y AdvantageKit. El código de ejemplo a continuación muestra cómo registrar datos de puntos en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
StructArrayPublisher<Translation2d> publisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyTranslations", Translation2d.struct).publish();

periodic() {
  publisher.set(new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
  publisher.set(
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  );
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
Logger.recordOutput("MyTranslations",
  new Translation2d(0.0, 1.0),
  new Translation2d(2.0, 3.0)
);
```

</TabItem>
</Tabs>

## Configuración

Las siguientes opciones de configuración están disponibles:

- **Dimensiones:** El tamaño del área de visualización. Puede usar cualquier unidad que coincida con los puntos publicados. Cuando se muestran datos de visión, esta es la resolución de la cámara.
- **Orientación:** El sistema de coordenadas a utilizar (orientación de los ejes X e Y).
- **Origen:** La posición del origen en el sistema de coordenadas.
