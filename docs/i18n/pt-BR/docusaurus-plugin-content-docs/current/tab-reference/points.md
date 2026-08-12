---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Pontos {#points}

A guia de pontos mostra uma visualização 2D de pontos arbitrários. Esta é uma ferramenta muito flexível, permitindo visualizações personalizadas de dados/pipelines de visão, estados de mecanismos, etc.

<img src="/img/tab-reference/points-1.webp" alt="Exemplo de aba de pontos" />

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo é usada para controlar a reprodução e a visualização. Clicar na linha do tempo seleciona um tempo, e clicar com o botão direito desmarca. O tempo selecionado é sincronizado em todas as guias, tornando fácil encontrar rapidamente esse local em outras visualizações.

Seções amarelas indicam quando o robô está em autônomo, seções azuis indicam quando o robô está teleoperado e seções cinzas indicam quando o robô está no modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Um intervalo também pode ser selecionado clicando e arrastando enquanto mantém `Shift` pressionado. Mova para a esquerda e para a direita rolando horizontalmente (em dispositivos suportados) ou clicando e arrastando na linha do tempo. Quando conectado ao vivo, rolar para a esquerda desbloqueia do tempo atual, e rolar totalmente para a direita bloqueia no tempo atual novamente. Pressione `Ctrl+\` para dar zoom no período em que o robô está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

## Adicionando fontes {#adding-sources}

Para começar, arraste um campo para a seção "Fontes". Exclua uma fonte usando o botão X ou oculte-a temporariamente clicando no ícone de olho ou dando um duplo clique no nome do campo. Para remover todos os objetos, clique na lixeira perto do título do eixo e depois em `Limpar tudo`. As fontes podem ser reorganizadas na lista clicando e arrastando.

**Para personalizar cada fonte, clique no ícone colorido ou clique com o botão direito no nome do campo.** O símbolo, a cor e o tamanho de cada fonte podem ser ajustados.

:::tip
Para ver uma lista completa de tipos de fontes suportadas, clique no ícone `?`. Esta lista também inclui os tipos de dados suportados.
:::

## Formato dos dados {#data-format}

Os dados de pontos devem ser publicados como um struct ou protobuf codificado em bytes, usando o tipo `Translation2d[]`. Muitas bibliotecas suportam este formato, incluindo WPILib e AdvantageKit. O código de exemplo abaixo mostra como registrar dados de pontos em Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
StructArrayPublisher<Translation2d> publisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyTranslations", Translation2d.struct).publish();

periodic() {
  publisher.set(new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
  publisher.set(
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  );
}
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

- **Dimensões:** O tamanho da área de exibição. Isso pode usar quaisquer unidades que correspondam aos pontos publicados. Ao exibir dados de visão, esta é a resolução da câmera.
- **Orientação:** O sistema de coordenadas a ser usado (orientação dos eixos X e Y).
- **Origem:** A posição da origem no sistema de coordenadas.
