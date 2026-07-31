---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve

A guia Swerve mostra o estado de quatro módulos Swerve, incluindo os vetores de velocidade, posições de repouso, rotação do robô e velocidades do chassi.

<img src="/img/tab-reference/swerve-1.png" alt="Overview of swerve tab" />

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo é usada para controlar a reprodução e a visualização. Clicar na linha do tempo seleciona um tempo, e clicar com o botão direito desmarca. O tempo selecionado é sincronizado em todas as guias, tornando fácil encontrar rapidamente esse local em outras visualizações.

Seções amarelas indicam quando o robô está em autônomo, seções azuis indicam quando o robô está teleoperado e seções cinzas indicam quando o robô está no modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Um intervalo também pode ser selecionado clicando e arrastando enquanto mantém `Shift` pressionado. Mova para a esquerda e para a direita rolando horizontalmente (em dispositivos suportados) ou clicando e arrastando na linha do tempo. Quando conectado ao vivo, rolar para a esquerda desbloqueia do tempo atual, e rolar totalmente para a direita bloqueia no tempo atual novamente. Pressione `Ctrl+\` para dar zoom no período em que o robô está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Adicionando fontes

Para começar, arraste um campo para a seção "Fontes". Exclua uma fonte usando o botão X ou oculte-a temporariamente clicando no ícone de olho ou dando um duplo clique no nome do campo. Para remover todas as fontes, clique na lixeira perto do título do eixo e depois em `Limpar tudo`. As fontes podem ser reorganizadas na lista clicando e arrastando.

**Para personalizar cada fonte, clique no ícone colorido ou clique com o botão direito no nome do campo.** O AdvantageScope suporta três tipos de fontes:

- **Velocidades dos módulos:** Um conjunto de quatro estados de módulos Swerve, exibidos como vetores no diagrama.
- **Velocidades do robô:** Velocidades lineares e angulares exibidas no centro do diagrama.
- **Rotação:** Posição angular usada para rotacionar o diagrama.

## Formato dos dados

Os dados devem ser publicados como um struct ou protobuf codificado em bytes, usando os tipos `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` ou `Rotation3d`.

Muitas bibliotecas suportam o formato struct, incluindo WPILib e AdvantageKit. O código de exemplo abaixo mostra como registrar estados de módulos Swerve em Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

## Configuração

As seguintes opções de configuração estão disponíveis:

- **Velocidade máxima:** A velocidade máxima atingível dos módulos, usada para ajustar o tamanho dos vetores.
- **Tamanho do chassi:** As distâncias entre os módulos Swerve esquerdo-direito e frente-trás. Altera a proporção da imagem (aspect ratio) do diagrama do robô.
- **Orientação:** Ajusta a direção para a qual o diagrama do robô está apontado. Esta opção é frequentemente útil para se alinhar com dados de pose ou vídeos de partidas.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
