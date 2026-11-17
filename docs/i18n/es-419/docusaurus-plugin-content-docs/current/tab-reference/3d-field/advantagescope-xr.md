# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR lleva la vista 👀 [Campo 3D](/tab-reference/3d-field) a la realidad aumentada para que explores tus datos de formas completamente nuevas. Puedes ver un autónomo simulado en tamaño real, planear la estrategia del partido con una maqueta del campo sobre la mesa, superponer diagnósticos encima de tu robot real y mucho más. En este video puedes ver varios ejemplos de lo que logra:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Requisitos {#requirements}

- **Host:** La aplicación de escritorio de AdvantageScope en Windows, macOS o Linux (v4.1.0 o posterior). Debes [desactivar](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall) cualquier firewall en esa computadora.
- **Cliente:** Un iPhone o iPad con iOS/iPadOS 16 o posterior. No hace falta instalar ninguna app.
- **Red:** Ambos dispositivos deben estar en la misma red (Wi-Fi, conexión compartida por USB, etc.). Salvo por el punto siguiente, esta red no necesita tener acceso a Internet.
- **Internet:** Si no has usado AdvantageScope XR hace poco, el dispositivo móvil necesitará conexión a Internet (por ejemplo, datos móviles) la primera vez. Si quieres evitar este requisito, revisa la sección de [uso sin conexión](#offline-usage) más abajo.

:::tip
AdvantageScope XR funciona en muchos modelos de iPhone y iPad, pero es mucho más estable en dispositivos con **sensor LiDAR**, como el iPhone Pro (desde el iPhone 12 Pro en adelante) y el iPad Pro (primavera de 2020 o posterior).
:::

<details>
<summary>¿Qué pasa con otras plataformas?</summary>

AdvantageScope XR solo está disponible para iOS y iPadOS, y por ahora no hay planes inmediatos de llevarlo a otras plataformas. La app del cliente requiere integrarse muy de cerca con las API nativas de realidad aumentada, grabación de video, renderizado web y más. Se prioriza iOS y iPadOS por varias razones:

- **Consistencia:** AdvantageScope XR exige bastante hardware. Mientras que los teléfonos Android varían muchísimo en potencia y capacidades, los iPhone y iPad ofrecen un rendimiento muy parejo entre generaciones. Todos los dispositivos recientes con iOS o iPadOS tienen potencia suficiente para correr AdvantageScope XR, y los más nuevos suman funciones extra muy útiles (como el sensor LiDAR).

- **Disponibilidad:** En Estados Unidos, el iPhone sigue siendo el teléfono más común entre los estudiantes o el más fácil de conseguir prestado, y está mucho más al alcance que cualquier visor de realidad virtual o mixta. Dar soporte a iOS permite que la mayor cantidad posible de usuarios pueda usar AdvantageScope XR sin complicaciones.

- **Soporte para tabletas:** Usar AdvantageScope XR en una tableta tiene la gran ventaja de contar con una pantalla más grande, ideal para que varias personas vean lo mismo al mismo tiempo. Como el iPad es la tableta más usada en el mundo, darle soporte a iPadOS hace que esa experiencia sea lo más accesible posible.

</details>

## Configuración {#setup}

1. En tu computadora (host), **haz clic en el botón "XR"** dentro de cualquier pestaña de Campo 3D. Solo puede haber una sesión de XR activa a la vez, así que al hacer clic se cerrará cualquier otra sesión anterior.

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="Botón XR" height="450" />

_En la imagen de arriba se muestra la interfaz en inglés._

2. Se abrirá la **ventana de controles XR**, con un código QR y [opciones](#options) para ajustar la experiencia de realidad aumentada. Si quieres terminar la sesión y desconectar los dispositivos, simplemente cierra esa ventana.

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="Ventana XR" height="350" />

_En la imagen de arriba se muestra la interfaz en inglés._

3. Escanea el código QR con la **app de cámara nativa** de tu iPhone o iPad. No necesitas instalar nada.
4. Toca "AdvantageScope XR" y luego "Abrir" para **iniciar la experiencia** y conectarte al host. Si el sistema te lo pide, dale permiso para usar la **cámara y la red local**.
5. Sigue las instrucciones en pantalla para **calibrar y ubicar el modelo del campo**.
6. Controla el campo desde la computadora como siempre, ya sea **reproduciendo un registro o transmitiendo en vivo**. Todo lo que hagas se reflejará en tiempo real en tu teléfono o tableta.
7. Si quieres **grabar un video** rápido, toca el ícono "Grabar" en la parte superior de la pantalla. Tócalo de nuevo para detener la grabación y luego edita y guarda el clip.

:::warning
Los mapas de calor y las velocidades de los módulos swerve todavía no están disponibles en XR. Todos los demás tipos de objetos sí funcionan.
:::

:::tip
AdvantageScope XR consume bastantes recursos, así que el rendimiento puede bajar si la escena 3D es muy pesada. Si notas lentitud, prueba usar modelos de robot más simples o mostrar menos objetos.
:::

## Opciones {#options}

La ventana de controles XR incluye varias opciones para personalizar cómo se ve el modelo en realidad aumentada:

- **Calibración:**
  - Elige _Miniatura_ para ver una versión a escala reducida del campo, ideal para ponerla sobre una mesa.
  - Elige _Tamaño completo_ para ver el campo a escala real, alineado con una barrera física del campo. Cambiar entre _Alianza azul_ y _Alianza roja_ solo define qué lado usas para calibrar, pero en ambos casos se muestra el campo entero.
- **Transmisión:**
  - Elige _Fluida_ cuando prefieras una transmisión más estable aunque tenga un poco de latencia, por ejemplo al simular rutinas autónomas o reproducir archivos de registro.
  - Elige _Baja latencia_ cuando necesites respuesta inmediata y no te moleste algún pequeño salto (jitter), como al superponer datos sobre un robot real o manejar un robot simulado en teleop.
- **Mostrar piso:** Muestra el modelo plano del tapete o piso debajo del campo en lugar de superponerlo sobre una superficie real.
- **Mostrar campo:** Muestra el modelo del campo, incluidas las barreras y los elementos del juego. Los [objetos de elementos de juego](/tab-reference/3d-field#game-piece-objects) personalizados se muestran siempre.
- **Mostrar robots:** Muestra los modelos del robot. Puedes desactivarlo si estás superponiendo datos (como objetivos de visión o mecanismos 2D) directamente sobre un robot físico.

## Uso sin conexión {#offline-usage}

AdvantageScope XR funciona sin conexión a Internet. Para asegurarte de tenerlo siempre listo offline, descarga la app AdvantageScope XR desde la App Store con el enlace de abajo. Para conectarte a la versión de escritorio, escanea el código QR con la cámara de iOS o toca el botón "Escanear" dentro de la app AdvantageScope XR.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Aunque no necesites Internet, tanto la computadora (host) como el dispositivo móvil (cliente) **deben estar conectados a la misma red** (por ejemplo, la red del robot, un router Wi-Fi dedicado o conexión compartida por USB).
:::
