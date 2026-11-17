---
sidebar_position: 7
---

# 🎬 Video {#video}

La pestaña de video te permite comparar lado a lado los datos del registro con un video del partido grabado por separado. A continuación verás cómo cargar un video y sincronizarlo con el registro.

## Cómo cargar el video {#loading-the-video}

AdvantageScope te ofrece tres formas de cargar un video:

1. **Archivo local:** Haz clic en el ícono gris de archivo y elige el video que quieras cargar. Se admiten los formatos de video más comunes.
2. **YouTube:** Copia un enlace de YouTube al portapapeles y haz clic en el ícono rojo del portapapeles. Después de unos segundos, el video empezará a descargarse.
3. **The Blue Alliance:** Haz clic en el ícono azul de TBA para buscar y cargar automáticamente el video del partido según tu archivo de registro. Si hay varios videos disponibles, elige cuál descargar en el menú emergente. Para usar esta opción necesitas una clave de API de TBA: puedes obtenerla en [thebluealliance.com/account](https://www.thebluealliance.com/account) y pegarla en las preferencias de AdvantageScope, bajo "Clave API de TBA".

<img src="/img/tab-reference/video-1.webp" alt="Selector de fuente" />

Al elegir un video, la barra inferior derecha empezará a ponerse azul a medida que se almacenan en caché los fotogramas (este paso es necesario para que la reproducción sea fluida). Por esa conversión de fotogramas, esta función está pensada solo para videos con la duración de un partido.

:::warning
La descarga de videos desde YouTube y TBA puede fallar sin previo aviso por cambios en los servidores de YouTube. Si te ocurre, prueba actualizar AdvantageScope o usar un archivo de video local.
:::

:::info
AdvantageScope necesita [FFmpeg](https://ffmpeg.org) para procesar videos. Si no encuentra una copia válida de FFmpeg en el `PATH` de tu sistema, te ofrecerá descargarlo de Internet la primera vez que cargues un video. La instalación automática solo está disponible en Windows y macOS; en Linux, es posible que debas instalar FFmpeg manualmente y agregarlo al `PATH` del sistema.
:::

## Cómo navegar por el video {#navigating-the-video}

Cuando recién cargas un video y todavía no está sincronizado con el registro, sus controles de reproducción son independientes de los del registro. Usa la línea de tiempo y los botones de la esquina inferior derecha para controlar el video, o usa estos atajos de teclado:

- / = reproducir o pausar
- → = avanzar un fotograma
- ← = retroceder un fotograma
- \> = avanzar cinco segundos
- < = retroceder cinco segundos

<img src="/img/tab-reference/video-2.webp" alt="Controles de video" />

## Sincronización automática {#automatic-synchronization}

La mayoría de los videos de partidos se sincronizan automáticamente con el registro poco después de cargar los fotogramas del período autónomo. No tienes que hacer nada: si la sincronización funciona, los controles del video se bloquearán solos (consulta "Reproducción" más abajo).

:::warning
La sincronización automática solo funciona en videos de partidos que incluyan el marcador superpuesto, y no siempre acierta. Si los controles del video no se bloquean solos cuando terminen de cargarse los fotogramas, tendrás que sincronizarlo manualmente.
:::

## Sincronización manual {#manual-synchronization}

Primero, usa los controles del video para ir a un punto conocido del partido, como el inicio del autónomo. Luego, selecciona en el archivo de registro el instante exacto que coincide con ese fotograma del video.

:::tip
El cursor en la línea de tiempo se imanta al inicio y al final de cada período del partido, lo que te ayuda a marcar con precisión el comienzo del partido.
:::

Cuando el video y el registro estén alineados, haz clic en el ícono de candado junto a la línea de tiempo del video (o presiona **↑ o ↓**). Los controles del video quedarán deshabilitados. Vuelve a hacer clic en el candado si necesitas desbloquear la reproducción del video.

<img src="/img/tab-reference/video-3.webp" alt="Botón de bloqueo" />

## Reproducción {#playback}

Una vez bloqueado, el video se mantiene sincronizado con el instante seleccionado en el registro. Ten en cuenta que no hay reproducción de audio, porque el video original se convierte a una secuencia de fotogramas para poder sincronizarlo con el registro.

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo controla la reproducción y la visualización. Haz clic sobre ella para seleccionar un instante de tiempo, y haz clic derecho para quitar la selección. El tiempo seleccionado se sincroniza en todas las pestañas, así que podrás ubicar ese mismo instante rápidamente en otras vistas.

Las franjas amarillas indican cuándo el robot está en modo autónomo, las azules cuándo está en modo teleoperado y las grises cuándo está en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y usa la rueda del mouse hacia arriba o hacia abajo. También puedes seleccionar un rango haciendo clic y arrastrando mientras mantienes presionada la tecla `Shift`. Para moverte a izquierda o derecha, desplázate horizontalmente (si tu dispositivo lo permite) o haz clic y arrastra sobre la línea de tiempo. Cuando estés conectado en vivo, desplazarte hacia la izquierda desbloquea la vista del tiempo actual, y desplazarte hasta el extremo derecho la vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom directamente al período en que el robot está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Línea de tiempo" />

</details>

:::tip
Si quieres, puedes ajustar el FOV de la cámara en la vista de Campo 3D para que coincida con la perspectiva del video. Consulta "Opciones de cámara" en la página 👀 [Campo 3D](/tab-reference/3d-field) para ver cómo hacerlo.
:::

<img src="/img/tab-reference/video-4.webp" alt="Captura de video con odometría" />
