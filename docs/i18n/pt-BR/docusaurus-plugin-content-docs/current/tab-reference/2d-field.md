---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 Campo 2D {#2d-field}

A guia Campo 2D mostra o robô visto de cima sobre um mapa da arena. Além da posição do robô, você também pode visualizar dados extras, como o status dos alvos de visão e poses de referência.

<img src="/img/tab-reference/2d-field-1.webp" alt="Visão geral da guia Campo 2D" />

_A interface em inglês é exibida acima._

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo serve para controlar a reprodução e navegar pelo log. Clique em qualquer ponto dela para selecionar um instante específico, ou clique com o botão direito para desmarcar. O momento escolhido fica sincronizado em todas as guias, facilitando encontrar exatamente o mesmo instante em outras visualizações.

As faixas coloridas mostram o estado do robô: amarelo para o período autônomo, azul para o teleoperado e cinza para o modo utility.

Para dar zoom, coloque o cursor sobre a linha do tempo e role para cima ou para baixo. Você também pode selecionar um trecho segurando `Shift` enquanto clica e arrasta. Para andar para os lados, use a rolagem horizontal (em dispositivos compatíveis) ou clique e arraste na própria linha do tempo. Quando estiver conectado ao vivo, rolar para a esquerda destrava a visualização do momento atual, e rolar tudo para a direita trava no tempo real de novo. Pressione `Ctrl+\` para ajustar o zoom exatamente para o período em que o robô ficou habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

## Controles da câmera {#camera-controls}

Role o mouse para cima ou para baixo sobre o campo para aproximar e afastar o zoom, e clique e arraste para mover a visualização. Se clicar com o botão direito em qualquer lugar do campo, você abre o menu da câmera com três opções:

- **Desbloqueado**: Você controla o zoom e o deslocamento manualmente.
- **Travado no robô**: A câmera acompanha o movimento do robô automaticamente.
- **Travado no robô e na rotação**: Além de acompanhar o robô, a câmera gira junto com ele.

Mesmo nos modos bloqueados, você ainda pode arrastar a câmera livremente para longe do robô se precisar olhar outra parte da arena. Os botões de orientação no painel de controle também permitem girar o campo em qualquer modo.

## Adicionando objetos {#adding-objects}

Para começar, arraste um campo da barra lateral para a seção "Poses". Se quiser remover um objeto, clique no botão X; para apenas escondê-lo temporariamente, clique no ícone de olho ou dê um duplo clique no nome dele. Para apagar tudo de uma vez, clique na lixeira ao lado do título e depois em `Limpar tudo`. Você também pode clicar e arrastar os itens para mudar a ordem na lista.

**Para personalizar cada objeto, clique no ícone colorido ao lado dele ou clique com o botão direito no nome do campo.** O AdvantageScope conta com vários tipos de objetos e opções de ajuste (como trocar cores). Alguns objetos precisam ser adicionados dentro de um objeto já existente, como filhos.

:::tip
Quer ver todos os tipos de objetos disponíveis? Clique no ícone `?`. A lista também mostra quais tipos de dados cada objeto aceita e se ele precisa ser colocado como filho de outro item.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="Campo 2D com objetos" />

## Formato dos dados {#data-format}

Os dados de geometria precisam ser publicados como `struct` ou `protobuf` codificados em bytes. Vários tipos 2D e 3D são aceitos, como `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` e outros.

Diversas bibliotecas já dão suporte ao formato `struct`, incluindo a WPILib e o AdvantageKit. Veja nos exemplos abaixo como registrar poses 2D em Java:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

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
// Esse protocolo não suporta o formato struct moderno, mas você pode
// publicar valores de pose usando campos separados com os sufixos
// "x", "y" e "heading" (como no exemplo abaixo):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Polegadas
packet.put("Pose y", 2.8); // Polegadas
packet.put("Pose heading", 3.14); // Radianos

// Se preferir, o ângulo de orientação (heading) pode ir em graus
packet.put("Pose heading (deg)", 180.0); // Graus

// Adicione outros valores de telemetria aqui...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Outra opção é usar MultipleTelemetry com a telemetria padrão do SDK:
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

- **Campo:** Escolhe a imagem da arena. Todos os jogos recentes da FRC e da FTC já vêm incluídos. Se quiser usar uma imagem personalizada, veja a página de [Recursos personalizados](/more-features/custom-assets).
- **Orientação:** Define a rotação da imagem do campo no painel de visualização.
- **Tamanho:** Ajusta o tamanho do lado do robô (30, 27 ou 24 polegadas para FRC; 18, 16 ou 14 polegadas para FTC).

:::info
O sistema de coordenadas usado nesta guia pode ser personalizado. Confira a página de [Sistema de coordenadas](/more-features/coordinate-systems) para ver os detalhes.
:::
