---
sidebar_position: 6
---

# 📊 Estadísticas

La pestaña de estadísticas permite un análisis estadístico profundo de campos numéricos, analizando las tendencias generales en lugar de los cambios a lo largo del tiempo. Los campos seleccionados se analizan utilizando un histograma y una variedad de medidas estadísticas estándar.

<img src="/img/tab-reference/statistics-1.png" alt="Resumen de la pestaña de estadísticas" />

## Panel de control

Para comenzar, arrastra un campo a la sección "Mediciones". Elimina un campo usando el botón X, u ocúltalo temporalmente haciendo clic en el ícono del ojo o haciendo doble clic en el nombre del campo. Para eliminar todos los campos, haz clic en los tres puntos cerca del título del eje y luego en `Borrar todo`.

Los campos se pueden reorganizar en la lista haciendo clic y arrastrando. Para analizar la diferencia entre campos, cambia un campo al modo "Referencia" y agrega otros campos adicionales como secundarios (children). Los elementos secundarios se pueden cambiar entre los modos "Error relativo" y "Error absoluto".

:::info
El color de cada campo se puede personalizar haciendo clic en el icono de color o haciendo clic derecho en el nombre del campo.
:::

### Configuración

La opción **Rango de tiempo** selecciona qué partes del registro se usan para el análisis:

- _Rango visible:_ Analiza el rango de tiempo visible en la línea de tiempo.
- _Registro completo:_ Analiza el rango completo del archivo de registro.
- _Habilitado:_ Analiza los rangos de tiempo donde el robot está habilitado.
- _Auto:_ Analiza los rangos de tiempo donde el robot es autónomo.
- _Teleop:_ Analiza los rangos de tiempo donde el robot es teledirigido (teleop).
- _En vivo: 30 segundos:_ Analiza los 30 segundos más recientes (cuando está conectado a una fuente en vivo).
- _En vivo: 10 segundos:_ Analiza los 10 segundos más recientes (cuando está conectado a una fuente en vivo).

La opción **Rango de datos** selecciona los valores mínimos y máximos a mostrar en el histograma. Los datos fuera de este rango no se muestran, pero se siguen utilizando para las medidas estadísticas.

La opción **Tamaño de paso** selecciona el tamaño de cada contenedor (bin) del histograma. Los valores más pequeños producen gráficos más detallados, pero también revelan más ruido.

## Panel del visor

### Histograma

El histograma muestra el número de muestras que caen en cada contenedor, dentro del rango específico. Ten en cuenta que los datos fuera del rango especificado se descartan (en lugar de agruparse en un contenedor separado).

### Medidas estadísticas

La tabla de medidas estadísticas muestra los valores calculados de cada medida para los campos proporcionados. A continuación se proporciona más información sobre cada medida.

#### Resumen

- **Recuento (Count):** El número de muestras discretas generadas.
- **Mín (Min):** El valor más pequeño en los datos.
- **Máx (Max):** El valor más grande en los datos.

#### Centro

- **[Media](https://es.wikipedia.org/wiki/Media_aritm%C3%A9tica):** La media aritmética (promedio simple) de los datos.
- **[Mediana](<https://es.wikipedia.org/wiki/Mediana_(estad%C3%ADstica)>):** El valor "medio" de los datos, o el percentil 50%.
- **[Moda](<https://es.wikipedia.org/wiki/Moda_(estad%C3%ADstica)>):** El valor más común en los datos.
- **[Media geométrica](https://es.wikipedia.org/wiki/Media_geom%C3%A9trica):** Una medida de centro calculada usando el producto de los valores en lugar de la suma. Aplicable al medir _tasas de crecimiento exponencial_ (como el cambio porcentual entre ciclos).
- **[Media armónica](https://es.wikipedia.org/wiki/Media_arm%C3%B3nica):** Una medida de centro calculada usando la suma de los recíprocos de los valores. Aplicable al medir _tasas o velocidades_.
- **[Media cuadrática](https://es.wikipedia.org/wiki/Media_cuadr%C3%A1tica):** Una medida de centro calculada usando los cuadrados de los valores. Aplicable al medir datos con _valores tanto positivos como negativos_, como el movimiento periódico.

#### Dispersión

- **[Desviación estándar](https://es.wikipedia.org/wiki/Desviaci%C3%B3n_t%C3%ADpica):** La medida estadística de variación más común, donde un valor más bajo indica menos variación. El 68% de los datos se encuentra dentro de una desviación estándar de la media.
- **[Desviación absoluta media](https://es.wikipedia.org/wiki/Desviaci%C3%B3n_media):** La distancia promedio entre cada valor y la media. Esta es una alternativa a la desviación estándar.
- **[Rango intercuartílico](https://es.wikipedia.org/wiki/Rango_intercuart%C3%ADlico):** La diferencia entre el tercer y primer cuartil (percentil 75 y percentil 25), menos afectada por valores atípicos que la desviación estándar o la desviación absoluta media.
- **[Asimetría](https://es.wikipedia.org/wiki/Asimetr%C3%ADa_estad%C3%ADstica):** Una medida del sesgo asimétrico de los datos. Un valor negativo indica una cola a la izquierda, un valor positivo indica una cola a la derecha y un valor cero sugiere una distribución simétrica.

#### Percentiles

Los [percentiles](https://es.wikipedia.org/wiki/Percentil) miden los valores por debajo de los cuales cae el porcentaje dado de otros valores. Por ejemplo, el 10% de los valores caen por debajo del percentil 10. Los siguientes percentiles también se conocen como:

- Percentil 25 = 1er cuartil (Q1)
- Percentil 50 = 2do cuartil (Q2) = mediana
- Percentil 75 = 3er cuartil (Q3)
