---
sidebar_position: 6
---

# 📊 Estadísticas {#statistics}

La pestaña de estadísticas te permite hacer un análisis estadístico detallado de campos numéricos, examinando tendencias generales en lugar de cambios instante a instante. Los campos que agregues se analizan con un histograma y varias medidas estadísticas estándar.

<img src="/img/tab-reference/statistics-1.webp" alt="Descripción general de la pestaña de estadísticas" />

_En la imagen de arriba se muestra la interfaz en inglés._

## Panel de control {#control-pane}

Para empezar, arrastra un campo a la sección "Mediciones". Puedes quitar un campo con el botón X, u ocultarlo temporalmente haciendo clic en el ícono del ojo o doble clic en su nombre. Si quieres quitar todos los campos, haz clic en el ícono de papelera junto al título del eje y elige `Borrar todo`. Puedes reordenar los campos en la lista arrastrándolos.

Para analizar la diferencia entre campos, cambia un campo al modo "Referencia" y agrega otros campos como elementos secundarios. En cada elemento secundario puedes alternar entre los modos "Error relativo" y "Error absoluto".

:::info
Puedes personalizar el color de cada campo haciendo clic en su ícono de color o haciendo clic derecho sobre su nombre.
:::

### Configuración {#configuration}

La opción **Rango de tiempo** define qué partes del registro se incluyen en el análisis:

- _Rango visible:_ Analiza el tramo de tiempo visible en la línea de tiempo.
- _Registro completo:_ Analiza todo el archivo de registro.
- _Habilitado:_ Analiza solo los tramos en que el robot estuvo habilitado.
- _Auto:_ Analiza solo los tramos en que el robot estuvo en modo autónomo.
- _Teleop:_ Analiza solo los tramos en que el robot estuvo en modo teleoperado.
- _En vivo: 30 segundos:_ Analiza los últimos 30 segundos (cuando estás conectado a una fuente en vivo).
- _En vivo: 10 segundos:_ Analiza los últimos 10 segundos (cuando estás conectado a una fuente en vivo).

La opción **Rango de datos** define los valores mínimo y máximo que se muestran en el histograma. Los datos fuera de este rango no se grafican, aunque siguen contándose en las medidas estadísticas.

La opción **Tamaño de paso** define el ancho de cada barra (intervalo) del histograma. Valores más pequeños dan gráficos más detallados, pero también muestran más ruido.

## Panel del visor {#viewer-pane}

### Histograma {#histogram}

El histograma muestra cuántas muestras caen dentro de cada intervalo dentro del rango indicado. Ten en cuenta que los datos fuera del rango se descartan en el gráfico (no se agrupan en una barra aparte).

### Medidas estadísticas {#statistical-measures}

La tabla de medidas estadísticas muestra los valores calculados para cada campo. A continuación tienes el detalle de cada medida.

#### Resumen {#summary}

- **Recuento:** La cantidad de muestras discretas registradas.
- **Mín:** El valor más bajo de los datos.
- **Máx:** El valor más alto de los datos.

#### Centro {#center}

- **[Media](https://es.wikipedia.org/wiki/Media_aritm%C3%A9tica):** La media aritmética (promedio simple) de los datos.
- **[Mediana](<https://es.wikipedia.org/wiki/Mediana_(estad%C3%ADstica)>):** El valor central de los datos, equivalente al percentil 50.
- **[Moda](<https://es.wikipedia.org/wiki/Moda_(estad%C3%ADstica)>):** El valor que más se repite en los datos.
- **[Media geométrica](https://es.wikipedia.org/wiki/Media_geom%C3%A9trica):** Medida de centro calculada con el producto de los valores en vez de la suma. Sirve cuando mides _tasas de crecimiento exponencial_ (como el cambio porcentual entre ciclos).
- **[Media armónica](https://es.wikipedia.org/wiki/Media_arm%C3%B3nica):** Medida de centro calculada con la suma de los recíprocos de los valores. Sirve cuando mides _tasas o velocidades_.
- **[Media cuadrática](https://es.wikipedia.org/wiki/Media_cuadr%C3%A1tica):** Medida de centro calculada a partir de los cuadrados de los valores. Sirve cuando mides datos con _valores positivos y negativos_, como un movimiento periódico.

#### Dispersión {#spread}

- **[Desviación estándar](https://es.wikipedia.org/wiki/Desviaci%C3%B3n_t%C3%ADpica):** La medida más común de variación: un valor más bajo indica menor dispersión. En una distribución normal, cerca del 68 % de los datos cae dentro de una desviación estándar de la media.
- **[Desviación absoluta de la mediana](https://es.wikipedia.org/wiki/Desviaci%C3%B3n_absoluta_mediana):** La mediana de las desviaciones absolutas respecto a la mediana. Es una medida de dispersión más resistente a valores atípicos que la desviación estándar.
- **[Rango intercuartílico](https://es.wikipedia.org/wiki/Rango_intercuart%C3%ADlico):** La diferencia entre el tercer y el primer cuartil (percentil 75 y percentil 25); también resiste mejor los valores atípicos que la desviación estándar.
- **[Asimetría](https://es.wikipedia.org/wiki/Asimetr%C3%ADa_estad%C3%ADstica):** Mide qué tan sesgada es la distribución. Un valor negativo indica una cola hacia la izquierda, uno positivo hacia la derecha y cero sugiere una distribución simétrica.

#### Percentiles {#percentiles}

Los [percentiles](https://es.wikipedia.org/wiki/Percentil) indican el valor por debajo del cual queda un porcentaje determinado de los datos (por ejemplo, el 10 % de los valores está por debajo del percentil 10). Algunos percentiles tienen nombres propios:

- Percentil 25 = primer cuartil (Q1)
- Percentil 50 = segundo cuartil (Q2) = mediana
- Percentil 75 = tercer cuartil (Q3)
