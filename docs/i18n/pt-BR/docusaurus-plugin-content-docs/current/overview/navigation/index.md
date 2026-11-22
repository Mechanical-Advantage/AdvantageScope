# 🧭 Navegação no aplicativo {#app-navigation}

A captura de tela abaixo mostra os principais elementos da janela do AdvantageScope. A aparência exata varia conforme o sistema operacional.

<img src="/img/overview/navigation/navigation-1.webp" alt="Diagrama de navegação" />

_A interface em inglês é exibida acima._

- A seção vermelha é a [barra lateral](#sidebar), que lista os campos disponíveis.
- A seção marrom é a [barra de guias](#tab-bar), que controla o aplicativo e permite alternar entre as visualizações.
- A seção azul é o [painel de visualização](#viewer-pane), onde os dados são exibidos.
- A seção verde é o [painel de controle](#control-pane), usado para configurar a visualização.

:::tip
Para abrir e comparar vários arquivos de log ao mesmo tempo em janelas separadas, clique em `Arquivo` > `Nova janela`.
:::

## Barra lateral {#sidebar}

À esquerda fica a barra lateral com a lista de tabelas e campos disponíveis. Os campos selecionáveis aparecem em _itálico_, e as tabelas integradas (da WPILib ou do AdvantageKit) aparecem <u>sublinhadas</u>. Clique na seta para expandir tabelas aninhadas. **Arraste um campo** para selecioná-lo ou **segure cmd/ctrl** e clique em vários campos para selecionar um grupo — depois, basta arrastar a seleção.

Para buscar um campo, comece a digitar na caixa de pesquisa. Uma lista suspensa com os resultados será exibida; ao escolher um campo, ele será destacado na barra lateral e levado até a área visível.

:::info
Clique e arraste a borda direita para redimensionar ou ocultar a barra lateral. Dê um duplo clique para mostrar ou ocultar a barra rapidamente.
:::

## Barra de guias {#tab-bar}

Use a barra de guias (azul) para alternar entre diferentes visualizações. Você pode abrir esta documentação a qualquer momento clicando no ícone 📖 à esquerda. Para exportar o layout atual das guias (junto com suas configurações), clique em `Arquivo` > `Exportar layout...`. Para importar um layout de um arquivo, clique em `Arquivo` > `Importar layout...`.

:::info
Você pode reorganizar as guias clicando e arrastando, ou renomeá-las clicando com o botão direito e selecionando `Renomear guia`.
:::

Os botões de navegação (verdes) na parte superior gerenciam as guias e controlam a reprodução:

- **Botão mais:** Abre um menu suspenso para criar uma nova guia.
- **Botão janela:** Cria uma nova janela destacada com a guia atual, permitindo acompanhar várias guias ao mesmo tempo.
- **Botão X:** Fecha a guia atual.
- **Botão reproduzir:** Inicia e pausa a reprodução em tempo real. _Clique com o botão direito para mudar a velocidade de reprodução ou ativar o loop._

## Painel de visualização {#viewer-pane}

O painel de visualização é onde os dados de cada tipo de guia são exibidos. Confira a documentação de referência de guias para ver os detalhes de cada uma. Você pode mover essa visualização para uma janela separada clicando no botão de destacar na barra de guias.

## Painel de controle {#control-pane}

O painel de controle serve para escolher os campos exibidos e ajustar outras opções da visualização. Confira a documentação de referência de guias para ver as opções disponíveis em cada guia.

:::info
Clique e arraste a borda superior para redimensionar ou ocultar o painel de controle. Dê um duplo clique para mostrar ou ocultar o painel rapidamente.
:::
