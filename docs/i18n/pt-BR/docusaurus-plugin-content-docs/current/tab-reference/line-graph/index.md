# 📉 Gráfico de linha {#line-graph}

O gráfico de linha é a visualização padrão do AdvantageScope e funciona tanto com campos contínuos (numéricos) quanto com campos discretos.

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="Demonstração de gráfico de linhas" />

_A interface em inglês é exibida acima._

## Painel de visualização {#viewer-pane}

Para dar zoom, posicione o cursor sobre o gráfico principal e role para cima ou para baixo. Você também pode selecionar um intervalo clicando e arrastando com a tecla `Shift` pressionada. Para navegar para a esquerda e para a direita, role horizontalmente (em dispositivos compatíveis) ou clique e arraste o gráfico. Quando estiver conectado ao vivo, rolar para a esquerda destrava o acompanhamento do tempo atual, e rolar tudo para a direita trava novamente no tempo atual.

Clique no gráfico para selecionar um instante e clique com o botão direito para desmarcar. A legenda mostra o valor de cada campo naquele momento. O instante selecionado fica sincronizado em todas as guias, facilitando encontrar o mesmo ponto em outras visualizações.

:::tip
O gráfico mostra a diferença (delta) entre o instante selecionado e o ponto sob o cursor, facilitando a medição de intervalos de tempo. Os timestamps seguem o formato configurado na preferência [Timestamps](/more-features/timestamps).
:::

## Painel de controle {#control-pane}

Para começar, arraste um campo para uma das três seções (eixo esquerdo, eixo direito ou campos discretos). Para excluir um campo, clique no botão X; se quiser apenas ocultá-lo temporariamente, clique no ícone de olho ou dê um duplo clique no nome dele. Para remover todos os campos de uma vez, clique nos três pontinhos ao lado do título do eixo e selecione `Limpar tudo`. Você também pode reorganizar a lista clicando e arrastando os campos.

Personalize a cor e o estilo da linha de cada campo clicando no ícone colorido ou clicando com o botão direito no nome do campo. Também é possível visualizar dados da API de [alertas persistentes](https://docs.wpilib.org/pt/latest/docs/software/telemetry/persistent-alerts.html) da WPILib adicionando o grupo de alertas como um campo discreto, como no exemplo abaixo.

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="Visualização de alertas" />

:::tip
Para sobrepor o modo do robô (autônomo, teleoperado ou utility), clique nos três pontinhos ao lado de "Campos discretos" e selecione `Mostrar modo do robô`.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Sobreposição do modo do robô" />

_A interface em inglês é exibida acima._
:::

### Ajustando eixos {#adjusting-axes}

Por padrão, cada eixo ajusta sua escala automaticamente com base nos dados visíveis. Para desativar o ajuste automático e travar a escala nos valores mínimo e máximo atuais, clique nos três pontinhos ao lado do título do eixo e selecione `Bloquear eixo`. Para definir os limites manualmente, escolha `Editar intervalo...` e digite os valores desejados.

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="Editando o intervalo do eixo" height="250" />

_A interface em inglês é exibida acima._

### Integração e diferenciação {#integration-and-differentiation}

O AdvantageScope também calcula integrais e derivadas automaticamente, sempre medindo o delta de tempo em segundos. Clique nos três pontinhos ao lado do título do eixo e selecione `Diferenciar` ou `Integrar`.

:::info
As derivadas são calculadas pela [diferença finita](https://pt.wikipedia.org/wiki/Operador_de_diferen%C3%A7a) entre amostras adjacentes, e as integrais usam a [regra dos trapézios](https://en.wikipedia.org/wiki/Trapezoidal_rule).
:::
