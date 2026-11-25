---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Puntos {#points}

La pestaña de puntos te muestra una visualización en 2D de puntos arbitrarios. Es una herramienta muy versátil para crear visualizaciones personalizadas de datos o pipelines de visión, estados de mecanismos y más.

<img src="/img/tab-reference/points-1.webp" alt="Ejemplo de pestaña de puntos" />

_En la imagen de arriba se muestra la interfaz en inglés._

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo controla la reproducción y la visualización. Haz clic sobre ella para seleccionar un instante de tiempo, y haz clic derecho para quitar la selección. El tiempo seleccionado se sincroniza en todas las pestañas, así que podrás ubicar ese mismo instante rápidamente en otras vistas.

Las franjas amarillas marcan cuándo el robot está en modo autónomo; las azules, en teledirigido (teleop); y las grises, en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y gira la rueda del mouse hacia arriba o hacia abajo. También puedes seleccionar un rango haciendo clic y arrastrando mientras mantienes presionada la tecla `Shift`. Para moverte a izquierda o derecha, desplázate horizontalmente (si tu dispositivo lo permite) o haz clic y arrastra sobre la línea de tiempo. Cuando estés conectado en vivo, desplazarte hacia la izquierda desbloquea la vista del tiempo actual, y desplazarte hasta el extremo derecho la vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom directamente al período en que el robot está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Línea de tiempo" />

</details>

## Cómo agregar fuentes {#adding-sources}

Para empezar, arrastra un campo a la sección "Fuentes". Puedes quitar una fuente con el botón X, u ocultarla temporalmente haciendo clic en el ícono del ojo o doble clic en su nombre. Si quieres quitar todos los elementos, haz clic en el ícono de papelera junto al título del eje y elige `Borrar todo`.

Puedes reordenar las fuentes en la lista arrastrándolas. **Para personalizar una fuente, haz clic en su ícono de color o haz clic derecho sobre su nombre**; allí podrás cambiar su símbolo, color y tamaño.

:::tip
Para ver la lista completa de tipos de fuentes y datos compatibles, haz clic en el ícono `?`.
:::

## Formato de datos {#data-format}

Debes publicar los datos de puntos como un struct o protobuf codificado en bytes usando el tipo `Translation2d[]`. Muchas bibliotecas admiten este formato, incluidas WPILib y AdvantageKit. El siguiente ejemplo muestra cómo registrar datos de puntos.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Telemetry.log("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::telemetry::Log("MyTranslations", std::vector{
  wpi::math::Translation2d{0_m, 1_m},
  wpi::math::Translation2d{2_m, 3_m}
});
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import Translation2d
import telemetry

telemetry.log(
    "MyTranslations",
    [
        Translation2d(0.0, 1.0),
        Translation2d(2.0, 3.0),
    ],
    element_type=Translation2d,
)
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

## Configuración {#configuration}

Tienes disponibles las siguientes opciones de configuración:

- **Dimensiones:** El tamaño del área de visualización, en cualquier unidad que coincida con los puntos publicados. Al mostrar datos de visión, corresponde a la resolución de la cámara.
- **Orientación:** El sistema de coordenadas que se usará (orientación de los ejes X e Y).
- **Origen:** La ubicación del origen dentro del sistema de coordenadas.
