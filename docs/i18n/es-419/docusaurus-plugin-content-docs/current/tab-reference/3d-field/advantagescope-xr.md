# AdvantageScope XR

AdvantageScope XR le da vida a la vista 👀 [Campo 3D](/tab-reference/3d-field) en realidad aumentada, lo que te permite visualizar datos de formas totalmente nuevas. ¡Mira un auto simulado en tamaño real, revisa la estrategia del partido con un modelo de campo de mesa, superpón información de diagnóstico en un robot real y mucho más! El siguiente video demuestra varios casos de uso para esta función:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Requisitos

- **Host:** La aplicación de escritorio AdvantageScope en Windows, macOS o Linux (v4.1.0 o posterior). Cualquier firewall en el dispositivo debe estar [deshabilitado](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Cliente:** Un iPhone o iPad con iOS/iPadOS 16 o posterior. No se requiere instalación de la aplicación.
- **Red:** Ambos dispositivos deben estar conectados a la misma red (Wi-Fi, conexión USB, etc.). Sujeto al requisito a continuación, esta red no necesita estar conectada a Internet.
- **Internet:** Si AdvantageScope XR no se ha utilizado recientemente, el dispositivo móvil debe tener una conexión a Internet (por ejemplo, datos móviles). Para eliminar este requisito, verifica la sección [uso sin conexión](#offline-usage) a continuación.

:::tip
AdvantageScope XR es compatible con muchos modelos de iPhone y iPad, pero es más estable para dispositivos con un **sensor LiDAR**. Esto incluye el iPhone Pro (a partir del iPhone 12 Pro) y el iPad Pro (primavera de 2020 o posterior).
:::

<details>
<summary>¿Qué pasa con otras plataformas?</summary>

AdvantageScope XR solo es compatible con iOS y iPadOS. No hay planes inmediatos para admitir plataformas alternativas. La aplicación del cliente requiere una estrecha integración con las API nativas para realidad aumentada, grabación de video, renderizado web y más. iOS y iPadOS reciben prioridad para el desarrollo y el soporte por varias razones:

- **Consistencia:** AdvantageScope XR es una aplicación exigente. Si bien los dispositivos Android varían ampliamente en potencia de procesamiento y funciones, el iPhone y el iPad brindan una experiencia de desarrollo constante en todas las generaciones. Todos los dispositivos iOS y iPadOS recientes son lo suficientemente potentes para ejecutar AdvantageScope XR, y los dispositivos más nuevos admiten funciones adicionales que AdvantageScope puede utilizar (como LiDAR).

- **Disponibilidad:** El iPhone sigue siendo el teléfono inteligente más común que es probable que posean los estudiantes de los Estados Unidos o que tengan fácilmente accesible a través de sus compañeros, y está más disponible que cualquier modelo de auriculares VR o de realidad mixta. Apoyar a iOS maximiza la cantidad de usuarios que tienen fácil acceso a AdvantageScope XR.

- **Soporte para tabletas:** Los usuarios pueden aprovechar la ejecución de AdvantageScope XR en una tableta, ya que las tabletas brindan una pantalla más grande que es más fácil de ver para varias personas a la vez. El iPad es la tableta más utilizada en todo el mundo, por lo que la compatibilidad con iPadOS hace que la experiencia de la tableta sea lo más accesible posible.

</details>

## Configuración

1. En el sistema host, **haz clic en el botón "XR"** en cualquier pestaña de campo 3D. Solo una sesión de host de XR puede estar activa al mismo tiempo, por lo que hacer clic en este botón interrumpirá cualquier otra sesión activa.

<img src="/img/tab-reference/3d-field/xr-1.png" alt="XR button" height="450" />

2. Se abrirá la **ventana de controles de XR**, con un código QR y [opciones](#options) para personalizar la experiencia de realidad aumentada. Para cancelar la sesión de XR y desconectar cualquier cliente, cierra la ventana de controles.

<img src="/img/tab-reference/3d-field/xr-2.png" alt="XR window" height="350" />

3. Escanea el código QR utilizando la **aplicación de cámara integrada** en el dispositivo cliente. No se requiere instalación de la aplicación.
4. Toca "AdvantageScope XR" y luego "Abrir" para **iniciar la experiencia** y conectarte al host. Si se te solicita, permite que AdvantageScope XR acceda a la **cámara y red local**.
5. Sigue las instrucciones en el dispositivo para **calibrar y posicionar el modelo de campo**.
6. Controla el modelo de campo de forma normal usando el dispositivo host, incluyendo **reproducción de registros y transmisión en vivo**. El estado del modelo de campo se muestra en vivo en el dispositivo cliente.
7. To **grabar un video** rápidamente, toca el ícono "Grabar" en la parte superior de la pantalla. Tócalo de nuevo para detener la grabación, luego edita y guarda el clip.

:::warning
Los mapas de calor y las velocidades del módulo swerve aún no están disponibles en XR. Se admiten todos los demás tipos de objetos.
:::

:::tip
AdvantageScope XR es una aplicación exigente y puede experimentar problemas de rendimiento según la complejidad de la escena 3D. Considera utilizar modelos de robot más simples o menos objetos si es necesario.
:::

## Opciones {#options}

La ventana de controles XR presenta varias opciones que controlan cómo se muestra el modelo en la realidad aumentada:

- **Calibración:**
  - Elige _Miniature_ para visualizar una versión reducida del campo, adecuada para uso de mesa.
  - Elige _Tamaño completo_ para visualizar el campo con una escala precisa, posicionado en base a una barrera de campo real. Cambiar entre la _Alianza azul_ y la _Alianza roja_ controla qué lado del campo se usa para la calibración, pero se visualiza el campo completo en todos los casos.
- **Transmisión:**
  - Elige _Fluida_ para aplicaciones donde cierta latencia es aceptable a cambio de una transmisión más confiable, como simular rutinas automáticas o reproducir archivos de registro.
  - Elige _Baja latencia_ para aplicaciones en tiempo real donde cierto salto (jitter) es aceptable, como la superposición de datos en un robot real o conducir un robot simulado en teleop.
- **Mostrar piso:** Muestra el modelo plano de alfombra/baldosa debajo del campo en lugar de superponerlo en una superficie real.
- **Mostrar campo:** Muestra el modelo del campo, incluyendo la barrera del campo y los elementos específicos del juego. Los [objetos de elementos de juego](/tab-reference/3d-field#game-piece-objects) personalizados siempre se muestran.
- **Mostrar robots:** Muestra los modelos del robot, se puede deshabilitar cuando se superponen datos en un robot real (como objetivos de visión o mecanismos 2D).

## Uso sin conexión {#offline-usage}

AdvantageScope XR no requiere una conexión a Internet. Para asegurarse de que la aplicación esté disponible sin conexión, descarga AdvantageScope XR desde la App Store utilizando el enlace a continuación. Para conectarse a la aplicación de escritorio AdvantageScope, escanea el código QR usando la aplicación de cámara iOS o toca el botón "Escanear" en la aplicación AdvantageScope XR.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Even cuando se ejecuta sin conexión a Internet, los dispositivos host y cliente **deben estar conectados a la misma red** (como un robot, una red Wi-Fi personalizada o mediante conexión compartida USB).
:::
