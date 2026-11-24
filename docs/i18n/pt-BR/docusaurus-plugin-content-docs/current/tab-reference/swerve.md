---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

A guia Swerve mostra o estado dos quatro módulos swerve, incluindo vetores de velocidade, posições de repouso, rotação do robô e velocidades do chassi.

<img src="/img/tab-reference/swerve-1.webp" alt="Visão geral da guia Swerve" />

_A interface em inglês é exibida acima._

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo controla a reprodução e a visualização. Clique na linha do tempo para selecionar um instante e clique com o botão direito para desmarcar. O instante selecionado fica sincronizado em todas as guias, facilitando encontrar o mesmo ponto em outras visualizações.

Faixas amarelas indicam o período autônomo; faixas azuis, o teleoperado; e faixas cinzas, o modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Você também pode selecionar um intervalo clicando e arrastando com a tecla `Shift` pressionada. Para navegar para a esquerda e para a direita, role horizontalmente (em dispositivos compatíveis) ou clique e arraste a linha do tempo. Quando estiver conectado ao vivo, rolar para a esquerda destrava o acompanhamento do tempo atual, e rolar tudo para a direita trava novamente no tempo atual. Pressione `Ctrl+\` para dar zoom no trecho em que o robô está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

## Adicionando fontes {#adding-sources}

Para começar, arraste um campo para a seção "Fontes". Para excluir uma fonte, clique no botão X; se quiser apenas ocultá-la temporariamente, clique no ícone de olho ou dê um duplo clique no nome dela. Para remover todas as fontes de uma vez, clique na lixeira ao lado do título do eixo e selecione `Limpar tudo`. Você também pode reorganizar a lista clicando e arrastando as fontes.

**Para personalizar cada fonte, clique no ícone colorido ou clique com o botão direito no nome do campo.** O AdvantageScope suporta três tipos de fonte:

- **Velocidades dos módulos:** Um conjunto de quatro estados de módulos swerve, exibidos como vetores no diagrama.
- **Velocidades do robô:** Velocidades lineares e angulares exibidas no centro do diagrama.
- **Rotação:** Posição angular usada para girar o diagrama.

## Formato dos dados {#data-format}

Os dados devem ser publicados como struct ou protobuf codificado em bytes, usando os tipos `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` ou `Rotation3d`.

Várias bibliotecas suportam o formato struct, incluindo WPILib e AdvantageKit. O exemplo abaixo mostra como registrar estados de módulos swerve em Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
Em 2027, essa estrutura de dados foi renomeada de `SwerveModuleState` para `SwerveModuleVelocity`.
Para arquivos de log criados antes da WPILib 2027 e do Systemcore, o tipo legado `SwerveModuleState` continua funcionando normalmente na visualização.
:::

## Configuração {#configuration}

As seguintes opções de configuração estão disponíveis:

- **Velocidade máxima:** A velocidade máxima que os módulos atingem, usada para dimensionar o tamanho dos vetores.
- **Tamanho do chassi:** As distâncias entre os módulos swerve da esquerda para a direita e da frente para trás, ajustando a proporção do diagrama do robô.
- **Orientação:** Ajusta para que lado o diagrama do robô aponta — bem útil para alinhar o desenho com dados de pose ou vídeos da partida.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
