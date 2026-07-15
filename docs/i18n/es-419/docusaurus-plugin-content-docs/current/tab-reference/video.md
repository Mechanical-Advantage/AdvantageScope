---
sidebar_position: 7
---

# 🎬 Video

La pestaña de video permite que los datos del registro se comparen de lado a lado con un video del partido que se grabó por separado. Los pasos a continuación muestran cómo cargar un video y sincronizarlo con el registro.

## Cargar el video

AdvantageScope proporciona tres opciones para cargar un video:

1. **Archivo local:** Haz clic en el ícono de archivo gris, luego elige el archivo de video para cargar. Se admiten los formatos de video más comunes.
2. **YouTube:** Copia un enlace de YouTube al portapapeles, luego haz clic en el icono rojo del portapapeles. Después de unos segundos, el video comenzará a descargarse.
3. **The Blue Alliance:** Haz clic en el icono azul de TBA para cargar automáticamente el video del partido en función del archivo de registro. Si hay varios videos disponibles, elige el video a descargar en el menú emergente. Esta función requiere una clave API para TBA, que debe obtenerse en [thebluealliance.com/account](https://www.thebluealliance.com/account) y copiarse en la página de preferencias de AdvantageScope en "Clave API de TBA" (TBA API Key).

<img src="/img/tab-reference/video-1.png" alt="Selector de origen" />

Después de elegir un video, la línea de tiempo en la parte inferior derecha comienza a volverse azul para indicar los fotogramas que se han almacenado en caché (este paso es necesario para una reproducción fluida). Esta función está diseñada solo para videos de la longitud de un partido debido a la conversión de fotogramas requerida.

:::warning
La descarga de videos de YouTube y TBA puede fallar inesperadamente debido a cambios en los servidores de YouTube. En caso de problemas, intenta actualizar AdvantageScope o usar un archivo de video local en su lugar.
:::

:::info
AdvantageScope requiere [FFmpeg](https://ffmpeg.org) para procesar archivos de video. Si no se encuentra una copia válida de FFmpeg en el PATH de tu sistema, AdvantageScope te pedirá que descargues FFmpeg de Internet al cargar un video por primera vez. La instalación automática de FFmpeg solo se admite en Windows y macOS; es posible que los usuarios de Linux deban instalar FFmpeg manualmente y agregarlo al PATH del sistema.
:::

## Navegación del video

Cuando se carga un video por primera vez y aún no se ha sincronizado con los datos de registro, los controles de reproducción para el video y el registro siguen siendo independientes. Usa la línea de tiempo y los botones en la parte inferior derecha para controlar la reproducción de video. También se admiten los siguientes atajos de teclado:

- / = alternar la reproducción
- → = avanzar un fotograma
- ← = retroceder un fotograma
- \> = avanzar cinco segundos
- < = retroceder cinco segundos

<img src="/img/tab-reference/video-2.png" alt="Controles de video" />

## Sincronización automática

La mayoría de los videos de los partidos se sincronizarán automáticamente con el registro poco después de que se carguen los fotogramas para el período autónomo del partido. No se requiere ninguna acción; si la sincronización tiene éxito, los controles de video se bloquearán automáticamente (consulta "Reproducción" a continuación).

:::warning
La sincronización automática solo funciona en videos de partidos que incluyen superposiciones de puntuación y es posible que no tenga éxito en todos los casos. Si los controles de video no se bloquean automáticamente una vez que se cargan todos los fotogramas, se requiere sincronización manual.
:::

## Sincronización manual

Primero, usa los controles de video para navegar a una ubicación conocida en el partido, como el inicio del autónomo. Luego, selecciona el tiempo en el archivo de registro que se alinee con el fotograma actual del video.

:::tip
El cursor en la línea de tiempo se ajusta al inicio y al final de los períodos del partido, lo que facilita la selección precisa del inicio del partido.
:::

Una vez que el video y el registro estén alineados, haz clic en el ícono de candado junto a la línea de tiempo del video (o presiona **↑ o ↓**). Los controles de video ahora están deshabilitados. Vuelve a hacer clic en el ícono de candado para desbloquear la reproducción de video.

<img src="/img/tab-reference/video-3.png" alt="Botón de bloqueo" />

## Reproducción

Una vez bloqueada, la reproducción del video se mantiene alineada con la hora seleccionada en el registro. Ten en cuenta que no se admite la reproducción de sonido ya que el video original se convierte en una representación fotograma por fotograma para admitir la sincronización del registro.

<details>
<summary>Controles de la línea de tiempo</summary>

La línea de tiempo se utiliza para controlar la reproducción y la visualización. Al hacer clic en la línea de tiempo se selecciona un tiempo, y al hacer clic con el botón derecho se anula la selección. El tiempo seleccionado se sincroniza en todas las pestañas, lo que facilita la búsqueda rápida de esta ubicación en otras vistas.

Las secciones amarillas indican cuando el robot es autónomo, las secciones azules indican cuando el robot es teledirigido (teleop), y las secciones grises indican cuando el robot está en modo de utilidad.

Para hacer zoom, coloca el cursor sobre la línea de tiempo y desplázate hacia arriba o hacia abajo. También se puede seleccionar un rango haciendo clic y arrastrando mientras se mantiene presionada la tecla `Shift`. Muévete hacia la izquierda y hacia la derecha desplazándote horizontalmente (en dispositivos compatibles) o haciendo clic y arrastrando en la línea de tiempo. Cuando estás conectado en vivo, desplazarte hacia la izquierda desbloquea del tiempo actual, y desplazarte hasta la derecha vuelve a bloquear al tiempo actual. Presiona `Ctrl+\` para hacer zoom al período en el que el robot está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Línea de tiempo" />

</details>

:::tip
Si se desea, el FOV de la cámara se puede ajustar en la vista de campo 3D para que coincida con el aspecto del video. Para más detalles, consulta "Opciones de cámara" en la página 👀 [Campo 3D](/tab-reference/3d-field).
:::

<img src="/img/tab-reference/video-4.png" alt="Captura de pantalla de video con odometría" />
