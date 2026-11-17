---
sidebar_position: 6
---

# 📊 Estatísticas {#statistics}

A guia Estatísticas permite fazer uma análise estatística completa de campos numéricos, avaliando tendências gerais em vez de mudanças ao longo do tempo. Os campos escolhidos são analisados por meio de um histograma e de várias medidas estatísticas padrão.

<img src="/img/tab-reference/statistics-1.webp" alt="Visão geral da guia de estatísticas" />

_A interface em inglês é exibida acima._

## Painel de controle {#control-pane}

Para começar, arraste um campo para a seção "Medições". Para excluir um campo, clique no botão X; se quiser apenas ocultá-lo temporariamente, clique no ícone de olho ou dê um duplo clique no nome dele. Para remover todos os campos de uma vez, clique na lixeira ao lado do título do eixo e selecione `Limpar tudo`. Você também pode reorganizar a lista clicando e arrastando os campos.

Para analisar a diferença entre campos, mude um campo para o modo "Referência" e adicione outros campos como filhos dele. Nos campos filhos, você pode alternar entre os modos "Erro relativo" e "Erro absoluto".

:::info
Para personalizar a cor de cada campo, clique no ícone colorido ou clique com o botão direito no nome do campo.
:::

### Configuração {#configuration}

A opção **Intervalo de tempo** define quais trechos do log entram na análise:

- _Intervalo visível:_ Analisa apenas o trecho de tempo visível na linha do tempo.
- _Log completo:_ Analisa toda a duração do arquivo de log.
- _Habilitado:_ Analisa apenas os momentos em que o robô está habilitado.
- _Autônomo:_ Analisa apenas o período autônomo.
- _Teleoperado:_ Analisa apenas o período teleoperado.
- _Ao vivo: 30 segundos:_ Analisa os últimos 30 segundos (ao conectar a uma fonte ao vivo).
- _Ao vivo: 10 segundos:_ Analisa os últimos 10 segundos (ao conectar a uma fonte ao vivo).

A opção **Intervalo de dados** define os valores mínimo e máximo exibidos no histograma. Os valores fora dessa faixa não aparecem no gráfico, mas continuam entrando no cálculo das medidas estatísticas.

A opção **Tamanho do passo** define a largura de cada barra do histograma. Valores menores geram gráficos mais detalhados, mas também deixam o ruído mais evidente.

## Painel de visualização {#viewer-pane}

### Histograma {#histogram}

O histograma mostra quantas amostras caem em cada barra dentro do intervalo configurado. Vale notar que os dados fora desse intervalo são descartados do gráfico (em vez de serem agrupados em uma barra separada).

### Medidas estatísticas {#statistical-measures}

A tabela de medidas estatísticas mostra os valores calculados para cada campo adicionado. Veja abaixo o significado de cada medida.

#### Resumo {#summary}

- **Contagem:** Quantidade total de amostras discretas analisadas.
- **Mínimo:** O menor valor encontrado nos dados.
- **Máximo:** O maior valor encontrado nos dados.

#### Centro {#center}

- [**Média:**](https://pt.wikipedia.org/wiki/M%C3%A9dia_aritm%C3%A9tica) A média aritmética (média simples) dos dados.
- [**Mediana:**](<https://pt.wikipedia.org/wiki/Mediana_(estat%C3%ADstica)>) O valor "central" dos dados, equivalente ao percentil 50%.
- [**Moda:**](<https://pt.wikipedia.org/wiki/Moda_(estat%C3%ADstica)>) O valor que mais se repete nos dados.
- [**Média geométrica:**](https://pt.wikipedia.org/wiki/M%C3%A9dia_geom%C3%A9trica) Uma medida de centro calculada com o produto dos valores em vez da soma. Útil para medir _taxas de crescimento exponencial_ (como variação percentual entre ciclos).
- [**Média harmônica:**](https://pt.wikipedia.org/wiki/M%C3%A9dia_harm%C3%B4nica) Uma medida de centro calculada com a soma dos inversos dos valores. Útil para medir _taxas ou velocidades_.
- [**Média quadrática:**](https://pt.wikipedia.org/wiki/Valor_eficaz) Uma medida de centro calculada com os quadrados dos valores. Útil para dados que alternam entre _valores positivos e negativos_, como movimentos periódicos.

#### Dispersão {#spread}

- [**Desvio padrão:**](https://pt.wikipedia.org/wiki/Desvio_padr%C3%A3o) A medida mais comum de variação dos dados, em que valores menores indicam menos variação. Em uma distribuição normal, cerca de 68% dos dados ficam dentro de um desvio padrão da média.
- [**Desvio absoluto mediano:**](https://pt.wikipedia.org/wiki/Desvio_absoluto_mediano) A mediana dos desvios absolutos em relação à mediana dos dados. É uma medida de dispersão menos sensível a valores extremos (outliers) do que o desvio padrão.
- [**Intervalo interquartil:**](https://pt.wikipedia.org/wiki/Amplitude_interquartil) A diferença entre o terceiro e o primeiro quartil (percentil 75 e percentil 25), também menos afetada por valores extremos (outliers) do que o desvio padrão.
- [**Assimetria:**](<https://pt.wikipedia.org/wiki/Assimetria_(estat%C3%ADstica)>) Mede o quanto a distribuição dos dados é assimétrica. Um valor negativo indica uma cauda para a esquerda, um valor positivo indica uma cauda para a direita e um valor próximo de zero sugere uma distribuição simétrica.

#### Percentis {#percentiles}

Os [percentis](https://pt.wikipedia.org/wiki/Percentil) indicam o valor abaixo do qual fica uma determinada porcentagem das amostras. Por exemplo, 10% dos valores ficam abaixo do percentil 10. Alguns percentis também são conhecidos como:

- Percentil 25 = 1º quartil (Q1)
- Percentil 50 = 2º quartil (Q2) = mediana
- Percentil 75 = 3º quartil (Q3)
