# 📉 Gráfico de líneas {#line-graph}

El gráfico de líneas es la vista predeterminada de AdvantageScope y funciona tanto con campos continuos (numéricos) como discretos.

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="Demostración de gráfico de líneas" />

_En la imagen de arriba se muestra la interfaz en inglés._

## Panel del visor {#viewer-pane}

Para hacer zoom, coloca el cursor sobre el gráfico principal y usa la rueda del mouse hacia arriba o hacia abajo. También puedes seleccionar un rango haciendo clic y arrastrando mientras mantienes presionada la tecla `Shift`. Para moverte hacia la izquierda o hacia la derecha, desplázate horizontalmente (si tu dispositivo lo permite) o haz clic y arrastra sobre el gráfico. Cuando estés conectado en vivo, desplazarte hacia la izquierda desbloquea la vista del tiempo actual, y desplazarte hasta el extremo derecho la vuelve a bloquear al tiempo actual.

Haz clic en el gráfico para seleccionar un instante de tiempo, y haz clic derecho para quitar la selección. La leyenda mostrará el valor de cada campo en ese momento. El tiempo seleccionado se sincroniza en todas las pestañas, así que podrás ubicar ese mismo instante rápidamente en otras vistas.

:::tip
Al pasar el cursor sobre el gráfico, verás superpuesta la diferencia de tiempo entre el instante seleccionado y la posición del cursor, lo que facilita medir intervalos. Las marcas de tiempo siguen el formato configurado en la preferencia [Marcas de tiempo](/more-features/timestamps).
:::

## Panel de control {#control-pane}

Para empezar, arrastra un campo hacia una de las tres secciones (izquierda, derecha o discretos). Puedes quitar un campo con el botón X, u ocultarlo temporalmente haciendo clic en el ícono del ojo o doble clic en su nombre. Si quieres quitar todos los campos de un eje, haz clic en los tres puntos junto al título del eje y elige `Borrar todo`.

Puedes reordenar los campos en la lista arrastrándolos. Para personalizar el color y el estilo de línea de cada campo, haz clic en su ícono de color o haz clic derecho sobre su nombre.

También puedes visualizar los datos de la API de [alertas persistentes](https://docs.wpilib.org/es/latest/docs/software/telemetry/persistent-alerts.html) de WPILib agregando el grupo de alertas como campo discreto. Abajo tienes un ejemplo de cómo se ve.

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="Visualización de alertas" />

:::tip
Para superponer el modo del robot (autónomo, teleoperado o utilidad), haz clic en los tres puntos junto a "Campos discretos" y selecciona "Mostrar modo del robot".

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Superposición del modo del robot" />

_En la imagen de arriba se muestra la interfaz en inglés._
:::

### Ajuste de ejes {#adjusting-axes}

Por defecto, cada eje ajusta su escala automáticamente según los datos visibles. Si quieres desactivar el ajuste automático y fijar el rango mínimo y máximo actual, haz clic en los tres puntos junto al título del eje y elige `Bloquear eje`. Para definir el rango manualmente, selecciona `Editar rango...` e ingresa los valores que necesites.

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="Edición del rango del eje" height="250" />

_En la imagen de arriba se muestra la interfaz en inglés._

### Integración y diferenciación {#integration-and-differentiation}

AdvantageScope puede integrar o diferenciar valores automáticamente (el delta de tiempo siempre se mide en segundos). Para hacerlo, haz clic en los tres puntos junto al título del eje y selecciona `Diferenciar` o `Integrar`.

:::info
Las derivadas se calculan mediante la [diferencia finita](https://es.wikipedia.org/wiki/Diferencia_finita) entre muestras adyacentes, y las integrales mediante la [regla del trapecio](https://es.wikipedia.org/wiki/Regla_del_trapecio).
:::
