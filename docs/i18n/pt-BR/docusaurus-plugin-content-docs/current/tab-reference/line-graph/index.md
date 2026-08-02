# 📉 Gráfico de linha

O gráfico de linha é a visualização padrão no AdvantageScope. Ele suporta tanto campos contínuos (numéricos) quanto discretos.

<img src="/img/tab-reference/line-graph/line-graph-1.png" alt="Line graph demo" />

## Painel de visualização

Para dar zoom, posicione o cursor sobre o gráfico principal e role para cima ou para baixo. Um intervalo também pode ser selecionado clicando e arrastando enquanto mantém `Shift` pressionado. Mova para a esquerda e para a direita rolando horizontalmente (em dispositivos suportados) ou clicando e arrastando no gráfico. Quando conectado ao vivo, rolar para a esquerda desbloqueia do tempo atual, e rolar totalmente para a direita bloqueia no tempo atual novamente.

Clicar no gráfico seleciona um tempo, e clicar com o botão direito desmarca. O valor de cada campo naquele tempo é exibido na legenda. O tempo selecionado é sincronizado em todas as guias, tornando fácil encontrar rapidamente esse local em outras visualizações.

:::tip
A variação (delta) entre o tempo selecionado e o tempo sob o ponteiro é exibida como uma sobreposição no gráfico, tornando fácil medir intervalos de tempo.
:::

## Painel de controle

Para começar, arraste um campo para uma das três seções (esquerdo, direito ou discreto). Exclua um campo usando o botão X ou oculte-o temporariamente clicando no ícone de olho ou dando um duplo clique no nome do campo. Para remover todos os campos, clique nos três pontos perto do título do eixo e depois em `Limpar tudo`. Os campos podem ser reorganizados na lista clicando e arrastando.

A cor e o estilo da linha de cada campo podem ser personalizados clicando no ícone colorido ou clicando com o botão direito no nome do campo. Dados da API de [alertas persistentes](https://docs.wpilib.org/en/latest/docs/software/telemetry/persistent-alerts.html) da WPILib podem ser visualizados adicionando o grupo de alertas como um campo discreto. Um exemplo de visualização é mostrado abaixo.

<img src="/img/tab-reference/line-graph/line-graph-2.png" alt="Alerts visualization" />

:::tip
Para sobrepor o modo do robô (autônomo, teleoperado ou utility), clique nos três pontos ao lado de "Campos discretos" e clique em "Mostrar modo do robô".

<img src="/img/tab-reference/line-graph/line-graph-3.png" alt="Robot mode overlay" />
:::

### Ajustando eixos {#adjusting-axes}

Por padrão, cada eixo ajusta seu intervalo com base nos dados visíveis. Para desativar o ajuste automático de escala e bloquear o intervalo em seus mínimo e máximo atuais, clique nos três pontos perto do título do eixo e depois em `Bloquear eixo`. Para ajustar manualmente o intervalo, escolha `Editar intervalo...` e insira os valores desejados.

<img src="/img/tab-reference/line-graph/line-graph-4.png" alt="Editing axis range" height="250" />

### Integração e diferenciação {#integration--differentiation}

Valores podem ser integrados ou diferenciados automaticamente pelo AdvantageScope. O tempo delta é sempre medido em segundos. Clique nos três pontos perto do título do eixo e selecione `Diferenciar` ou `Integrar`.

:::info
As derivadas são calculadas usando a [diferença finita](https://pt.wikipedia.org/wiki/Operador_de_diferen%C3%A7a) de amostras adjacentes. As integrais são calculadas usando [integração trapezoidal](https://en.wikipedia.org/wiki/Trapezoidal_rule).
:::
