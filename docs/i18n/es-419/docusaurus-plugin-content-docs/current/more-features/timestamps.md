---
sidebar_position: 5
---

# ⏱️ Marcas de tiempo {#timestamps}

En AdvantageScope puedes personalizar cómo se muestran las marcas de tiempo en todas las vistas, como la línea de tiempo, el 📉 [Gráfico de líneas](/tab-reference/line-graph), la 🔢 [Tabla](/tab-reference/table) y la 💬 [Consola](/tab-reference/console).

## Modos de visualización {#display-modes}

Puedes elegir el modo de visualización desde la ventana de preferencias:

- **Comenzar en cero (predeterminado):** Ajusta todas las marcas de tiempo para que el primer dato del registro arranque en cero (`+0.0s`). En este modo llevan el prefijo `+` para mostrar el tiempo transcurrido desde el inicio de los datos.
- **Original:** Muestra los valores numéricos exactos tal como quedaron guardados en el archivo de registro, coincidiendo con los que usa el código del robot.

:::info
A partir de WPILib 2027, las marcas de tiempo en Systemcore y en simulación miden el tiempo transcurrido desde que arrancó el dispositivo. Como estos valores pueden empezar en números muy grandes y poco intuitivos, el modo **Comenzar en cero** te ayuda a leerlos mucho más fácil.
:::

## Sincronización de múltiples registros {#multi-log-synchronization}

Cuando [abres varios archivos de registro al mismo tiempo](/overview/log-files/#opening-logs), AdvantageScope alinea y sincroniza sus marcas de tiempo automáticamente. En el modo **Comenzar en cero**, el punto cero se ubica en la marca de tiempo más antigua entre todos los archivos cargados. En el modo **Original**, se toma como referencia la base de tiempo del primer registro que abriste y los demás se ajustan para coincidir con ella.

## Personalización {#customization}

Para cambiar este ajuste, abre la ventana de preferencias en `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS), o presiona `Ctrl+,` / `Cmd+,`. Luego cambia la opción **Marcas de tiempo** al modo que prefieras.

<img src="/img/prefs_es-419.webp" alt="Diagrama de preferencias" height="450" />
