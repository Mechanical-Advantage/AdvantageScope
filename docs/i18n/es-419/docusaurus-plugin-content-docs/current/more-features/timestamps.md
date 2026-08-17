---
sidebar_position: 5
---

# ⏱️ Marcas de tiempo {#timestamps}

AdvantageScope admite opciones personalizables de visualización de marcas de tiempo en todas las vistas, incluida la línea de tiempo, el 📉 [Gráfico de líneas](/tab-reference/line-graph), la 🔢 [Tabla](/tab-reference/table) y la 💬 [Consola](/tab-reference/console).

## Modos de visualización {#display-modes}

El modo de visualización de marcas de tiempo se puede configurar en la ventana de preferencias:

- **Comenzar en cero (predeterminado):** Desplaza todas las marcas de tiempo para que los primeros datos en el registro comiencen en cero (`+0.0s`). Las marcas de tiempo mostradas en este modo tienen el prefijo `+` para indicar el tiempo transcurrido desde el inicio de los datos.
- **Original:** Muestra las marcas de tiempo utilizando sus valores numéricos originales tal como se registraron en el archivo de registro, coincidiendo con los valores exactos utilizados por el código del robot.

:::info
A partir de WPILib 2027, las marcas de tiempo se miden utilizando el tiempo desde el arranque del dispositivo en Systemcore y en simulación. Dado que las marcas de tiempo sin procesar pueden comenzar en números grandes arbitrarios, se proporciona **Comenzar en cero** como una opción de visualización más intuitiva.
:::

## Sincronización de múltiples registros {#multi-log-synchronization}

Cuando [se abren varios archivos de registro simultáneamente](/overview/log-files/#opening-logs), AdvantageScope sincroniza y alinea sus marcas de tiempo. En el modo **Comenzar en cero**, el punto cero se establece en la marca de tiempo más temprana de todos los archivos cargados. En el modo **Original**, las marcas de tiempo se muestran utilizando la base de tiempo del primer registro abierto, y cualquier registro adicional se desplaza para alinearse con él.

## Personalización {#customization}

Para cambiar el modo de visualización de marcas de tiempo, abre la ventana de preferencias haciendo clic en `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS), o presionando `Ctrl+,` / `Cmd+,`. Actualiza la opción **Marcas de tiempo** a la opción deseada.

<img src="/img/prefs_es-419.webp" alt="Diagrama de preferencias" height="450" />
