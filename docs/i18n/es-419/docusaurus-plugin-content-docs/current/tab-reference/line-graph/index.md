# 📉 Gráfico de líneas

El gráfico de líneas es la vista predeterminada en AdvantageScope. Admite campos continuos (numéricos) y discretos.

<img src="/img/tab-reference/line-graph/line-graph-1.png" alt="Line graph demo" />

## Panel del visor

Para hacer zoom, coloca el cursor sobre el gráfico principal y desplázate hacia arriba o hacia abajo. También se puede seleccionar un rango haciendo clic y arrastrando mientras se mantiene presionada la tecla `Shift`. Muévete hacia la izquierda y hacia la derecha desplazándote horizontalmente (en dispositivos compatibles) o haciendo clic y arrastrando en el gráfico. Cuando estás conectado en vivo, desplazarte hacia la izquierda desbloquea del tiempo actual, y desplazarte hasta la derecha vuelve a bloquear al tiempo actual.

Al hacer clic en el gráfico se selecciona un tiempo, y al hacer clic derecho se anula la selección. El valor de cada campo en ese momento se muestra en la leyenda. El tiempo seleccionado se sincroniza en todas las pestañas, lo que facilita encontrar rápidamente esta ubicación en otras vistas.

:::tip
El delta entre los tiempos seleccionados y los tiempos en los que se encuentra el cursor se muestra como una superposición en el gráfico, lo que facilita la medición de rangos de tiempo.
:::

## Panel de control

Para comenzar, arrastra un campo a una de las tres secciones (izquierda, derecha o discreto). Elimina un campo usando el botón X, u ocúltalo temporalmente haciendo clic en el ícono del ojo o haciendo doble clic en el nombre del campo. Para eliminar todos los campos, haz clic en los tres puntos cerca del título del eje y luego en `Borrar todo`.

Los campos se pueden reorganizar en la lista haciendo clic y arrastrando. El color y el estilo de línea de cada campo se pueden personalizar haciendo clic en el icono de color o haciendo clic derecho en el nombre del campo.

Los datos de la API de [alertas persistentes](https://docs.wpilib.org/en/latest/docs/software/telemetry/persistent-alerts.html) de WPILib se pueden visualizar agregando el grupo de alertas como un campo discreto. A continuación se muestra un ejemplo de visualización.

<img src="/img/tab-reference/line-graph/line-graph-2.png" alt="Alerts visualization" />

:::tip
Para superponer el modo del robot (autónomo, teleop o utilidad), haz clic en los tres puntos al lado de "Campos discretos" y haz clic en "Mostrar modo del robot".

<img src="/img/tab-reference/line-graph/line-graph-3.png" alt="Robot mode overlay" />
:::

### Ajuste de ejes {#adjusting-axes}

Por defecto, cada eje ajusta su rango en función de los datos visibles. Para deshabilitar el rango automático y bloquear el rango a su mínimo y máximo actuales, haz clic en los tres puntos cerca del título del eje y luego en `Bloquear eje`. Para ajustar manualmente el rango, elige `Editar rango...` e ingresa los valores deseados.

<img src="/img/tab-reference/line-graph/line-graph-4.png" alt="Editing axis range" height="250" />

### Integración y diferenciación {#integration--differentiation}

Los valores se pueden integrar o diferenciar automáticamente en AdvantageScope. El tiempo delta siempre se mide en segundos. Haz clic en los tres puntos cerca del título del eje y luego selecciona `Diferenciar` o `Integrar`.

:::info
Las derivadas se calculan usando la [diferencia finita](https://en.wikipedia.org/wiki/Finite_difference) de muestras adyacentes. Las integrales se calculan usando la [integración trapezoidal](https://en.wikipedia.org/wiki/Trapezoidal_rule).
:::
