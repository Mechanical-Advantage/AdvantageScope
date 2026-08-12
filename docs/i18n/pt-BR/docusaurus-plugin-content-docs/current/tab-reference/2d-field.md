---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 Campo 2D {#2d-field}

A guia de campo 2D mostra uma visualização 2D do robô sobreposta em um mapa do campo. Ela também pode mostrar dados extras, como status de alvos de visão e poses de referência.

<img src="/img/tab-reference/2d-field-1.png" alt="Visão geral da aba de campo 2D" />

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo é usada para controlar a reprodução e a visualização. Clicar na linha do tempo seleciona um tempo, e clicar com o botão direito desmarca. O tempo selecionado é sincronizado em todas as guias, tornando fácil encontrar rapidamente esse local em outras visualizações.

Seções amarelas indicam quando o robô está em autônomo, seções azuis indicam quando o robô está teleoperado e seções cinzas indicam quando o robô está no modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Um intervalo também pode ser selecionado clicando e arrastando enquanto mantém `Shift` pressionado. Mova para a esquerda e para a direita rolando horizontalmente (em dispositivos suportados) ou clicando e arrastando na linha do tempo. Quando conectado ao vivo, rolar para a esquerda desbloqueia do tempo atual, e rolar totalmente para a direita bloqueia no tempo atual novamente. Pressione `Ctrl+\` para dar zoom no período em que o robô está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Linha do tempo" />

</details>

## Adicionando objetos {#adding-objects}

Para começar, arraste um campo para a seção "Poses". Exclua um objeto usando o botão X ou oculte-o temporariamente clicando no ícone de olho ou dando um duplo clique no nome do campo. Para remover todos os objetos, clique na lixeira perto do título do eixo e depois em `Limpar tudo`. Os objetos podem ser reorganizados na lista clicando e arrastando.

**Para personalizar cada objeto, clique no ícone colorido ou clique com o botão direito no nome do campo.** O AdvantageScope suporta um grande número de tipos de objetos, muitos dos quais podem ser personalizados (como alterar cores). Alguns objetos devem ser adicionados como filhos de um objeto existente.

:::tip
Para ver uma lista completa de tipos de objetos suportados, clique no ícone `?`. Esta lista também inclui os tipos de dados suportados e se os objetos devem ser adicionados como filhos.
:::

<img src="/img/tab-reference/2d-field-2.png" alt="Campo 2D com objetos" />

## Formato dos dados {#data-format}

Os dados de geometria devem ser publicados como um struct ou protobuf codificado em bytes. Vários tipos de geometria 2D e 3D são suportados, incluindo `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` e mais.

Muitas bibliotecas suportam o formato struct, incluindo WPILib e AdvantageKit. O código de exemplo abaixo mostra como registrar dados de pose 2D em Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
A classe [`Field2d`](https://docs.wpilib.org/pt/stable/docs/software/dashboards/glass/field2d-widget.html) da WPILib também pode ser usada para registrar vários conjuntos de dados de pose 2D juntos.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// Este protocolo não suporta o formato struct moderno, mas os valores
// de pose podem ser publicados usando campos separados que incluem os
// sufixos "x", "y" e "heading" (como mostrado abaixo):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Polegadas
packet.put("Pose y", 2.8); // Polegadas
packet.put("Pose heading", 3.14); // Radianos

// Alternativamente, os ângulos de orientação (heading) podem ser publicados em graus
packet.put("Pose heading (deg)", 180.0); // Graus

// Adicione outros valores de telemetria aqui...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Alternativamente, use MultipleTelemetry e a telemetria padrão do SDK:
// Durante o OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// Durante o Loop:
telemetry.addData("Pose x", 6.3); // Polegadas
telemetry.addData("Pose y", 2.8); // Polegadas
telemetry.addData("Pose heading", 3.14); // Radianos

// ou...
telemetry.addData("Pose heading (deg)", 180.0); // Graus

// Adicione outros valores de telemetria aqui...
telemetry.update();
```

</TabItem>
</Tabs>

## Configuração {#configuration}

- **Campo:** A imagem do campo a ser usada. Todos os jogos recentes da FRC e do FTC são suportados. Para adicionar uma imagem de campo personalizada, consulte [Recursos personalizados](/more-features/custom-assets).
- **Orientação:** A orientação da imagem do campo no painel de visualização.
- **Tamanho:** O comprimento lateral do robô (30/27/24 polegadas para FRC, 18/16/14 polegadas para FTC).

:::info
O sistema de coordenadas usado nesta guia é personalizável. Consulte a página do [sistema de coordenadas](/more-features/coordinate-systems) para obter detalhes.
:::
