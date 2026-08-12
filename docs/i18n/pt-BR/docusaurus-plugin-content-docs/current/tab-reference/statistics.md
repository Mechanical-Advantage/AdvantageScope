---
sidebar_position: 6
---

# 📊 Estatísticas {#statistics}

A guia de estatísticas permite uma análise estatística profunda de campos numéricos, analisando tendências gerais em vez de mudanças ao longo do tempo. Os campos selecionados são analisados usando um histograma e uma variedade de medidas estatísticas padrão.

<img src="/img/tab-reference/statistics-1.webp" alt="Visão geral da aba de estatísticas" />

## Painel de controle {#control-pane}

Para começar, arraste um campo para a seção "Medições". Exclua um campo usando o botão X ou oculte-o temporariamente clicando no ícone de olho ou dando um duplo clique no nome do campo. Para remover todos os campos, clique nos três pontos perto do título do eixo e depois em `Limpar tudo`. Os campos podem ser reorganizados na lista clicando e arrastando.

Para analisar a diferença entre campos, altere um campo para o modo "Referência" e adicione outros campos adicionais como filhos. Os filhos podem ser alternados entre os modos "Erro relativo" e "Erro absoluto".

:::info
A cor de cada campo pode ser personalizada clicando no ícone colorido ou clicando com o botão direito no nome do campo.
:::

### Configuração {#configuration}

A opção **Intervalo de tempo** seleciona quais partes do log são usadas para análise:

- _Intervalo visível:_ Analisa o intervalo de tempo visível na linha do tempo.
- _Log completo:_ Analisa todo o intervalo do arquivo de log.
- _Habilitado:_ Analisa os intervalos de tempo em que o robô está habilitado.
- _Autônomo:_ Analisa os intervalos de tempo em que o robô está em autônomo.
- _Teleoperado:_ Analisa os intervalos de tempo em que o robô está teleoperado.
- _Ao vivo: 30 segundos:_ Analisa os 30 segundos mais recentes (quando conectado a uma fonte ao vivo).
- _Ao vivo: 10 segundos:_ Analisa os 10 segundos mais recentes (quando conectado a uma fonte ao vivo).

A opção **Intervalo de dados** seleciona os valores mínimo e máximo a serem exibidos no histograma. Dados fora desse intervalo não são exibidos, mas continuam sendo usados para as medidas estatísticas.

A opção **Tamanho do passo** seleciona o tamanho de cada barra do histograma. Valores menores produzem gráficos mais detalhados, mas também revelam mais ruído.

## Painel de visualização {#viewer-pane}

### Histograma {#histogram}

O histograma mostra o número de amostras que caem em cada barra, dentro do intervalo específico. Observe que os dados fora do intervalo especificado são descartados (em vez de serem agrupados em uma barra separada).

### Medidas estatísticas {#statistical-measures}

A tabela de medidas estatísticas mostra os valores calculados de cada medida para os campos fornecidos. Mais informações sobre cada medida são fornecidas abaixo.

#### Resumo {#summary}

- **Contagem:** O número de amostras discretas geradas.
- **Mínimo:** O menor valor nos dados.
- **Máximo:** O maior valor nos dados.

#### Centro {#center}

- [**Média:**](https://pt.wikipedia.org/wiki/M%C3%A9dia_aritm%C3%A9tica) A média aritmética (média simples) dos dados.
- [**Mediana:**](<https://pt.wikipedia.org/wiki/Mediana_(estat%C3%ADstica)>) O valor "central" dos dados, ou o percentil 50%.
- [**Moda:**](<https://pt.wikipedia.org/wiki/Moda_(estat%C3%ADstica)>) O valor mais comum nos dados.
- [**Média geométrica:**](https://pt.wikipedia.org/wiki/M%C3%A9dia_geom%C3%A9trica) Uma medida de centro calculada usando o produto dos valores em vez da soma. Aplicável ao medir _taxas de crescimento exponencial_ (como porcentagem de alteração entre ciclos).
- [**Média harmônica:**](https://pt.wikipedia.org/wiki/M%C3%A9dia_harm%C3%B4nica) Uma medida de centro calculada usando a soma dos inversos dos valores. Aplicável ao medir _taxas ou velocidades_.
- [**Média quadrática:**](https://pt.wikipedia.org/wiki/Valor_eficaz) Uma medida de centro calculada usando os quadrados dos valores. Aplicável ao medir dados com _valores positivos e negativos_, como movimento periódico.

#### Dispersão {#spread}

- [**Desvio padrão:**](https://pt.wikipedia.org/wiki/Desvio_padr%C3%A3o) A medida estatística de variação mais comum, onde um valor menor indica menor variação. 68% dos dados caem dentro de um desvio padrão da média.
- [**Desvio absoluto mediano:**](https://en.wikipedia.org/wiki/Average_absolute_deviation) A distância média entre cada valor e a média. Esta é uma alternativa ao desvio padrão.
- [**Intervalo interquartil:**](https://pt.wikipedia.org/wiki/Amplitude_interquartil) A diferença entre o terceiro e o primeiro quartil (percentil 75 e percentil 25), menos afetado por valores discrepantes (outliers) do que o desvio padrão ou o desvio absoluto mediano.
- [**Assimetria:**](<https://pt.wikipedia.org/wiki/Assimetria_(estat%C3%ADstica)>) Uma medida da assimetria dos dados. Um valor negativo indica uma cauda para a esquerda, um valor positivo indica uma cauda para a direita e um valor zero sugere uma distribuição simétrica.

#### Percentis {#percentiles}

Os [percentis](https://pt.wikipedia.org/wiki/Percentil) medem os valores abaixo dos quais cai a porcentagem fornecida de outros valores. Por exemplo, 10% dos valores caem abaixo do percentil 10. Os seguintes percentis também são conhecidos como:

- Percentil 25 = 1º quartil (Q1)
- Percentil 50 = 2º quartil (Q2) = mediana
- Percentil 75 = 3º quartil (Q3)
