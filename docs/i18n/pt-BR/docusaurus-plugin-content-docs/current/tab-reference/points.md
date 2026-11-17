---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Pontos {#points}

A guia Pontos mostra uma visualização 2D de pontos arbitrários. Ela é bem flexível e serve para criar visualizações personalizadas de dados e pipelines de visão, estados de mecanismos e muito mais.

<img src="/img/tab-reference/points-1.webp" alt="Exemplo de guia de pontos" />

_A interface em inglês é exibida acima._

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo controla a reprodução e a visualização. Clique na linha do tempo para selecionar um instante e clique com o botão direito para desmarcar. O instante selecionado fica sincronizado em todas as guias, facilitando encontrar o mesmo ponto em outras visualizações.

Faixas amarelas indicam o período autônomo; faixas azuis, o teleoperado; e faixas cinzas, o modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Você também pode selecionar um intervalo clicando e arrastando com a tecla `Shift` pressionada. Para navegar para a esquerda e para a direita, role horizontalmente (em dispositivos compatíveis) ou clique e arraste a linha do tempo. Quando estiver conectado ao vivo, rolar para a esquerda destrava o acompanhamento do tempo atual, e rolar tudo para a direita trava novamente no tempo atual. Pressione `Ctrl+\` para dar zoom no trecho em que o robô está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

## Adicionando fontes {#adding-sources}

Para começar, arraste um campo para a seção "Fontes". Para excluir uma fonte, clique no botão X; se quiser apenas ocultá-la temporariamente, clique no ícone de olho ou dê um duplo clique no nome dela. Para remover todos os objetos de uma vez, clique na lixeira ao lado do título do eixo e selecione `Limpar tudo`. Você também pode reorganizar a lista clicando e arrastando as fontes.

**Para personalizar cada fonte, clique no ícone colorido ou clique com o botão direito no nome do campo.** Você pode ajustar o símbolo, a cor e o tamanho de cada fonte.

:::tip
Para ver a lista completa dos tipos de fonte suportados, clique no ícone `?`. A lista também mostra os tipos de dados compatíveis.
:::

## Formato dos dados {#data-format}

Os dados de pontos devem ser publicados como struct ou protobuf codificado em bytes, usando o tipo `Translation2d[]`. Várias bibliotecas suportam esse formato, incluindo WPILib e AdvantageKit. O exemplo abaixo mostra como registrar dados de pontos em Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
Logger.recordOutput("MyTranslations",
  new Translation2d(0.0, 1.0),
  new Translation2d(2.0, 3.0)
);
```

</TabItem>
</Tabs>

## Configuração {#configuration}

As seguintes opções de configuração estão disponíveis:

- **Dimensões:** O tamanho da área de exibição, em qualquer unidade que combine com os pontos publicados. Ao exibir dados de visão, esse valor corresponde à resolução da câmera.
- **Orientação:** O sistema de coordenadas usado (orientação dos eixos X e Y).
- **Origem:** A posição da origem no sistema de coordenadas.
