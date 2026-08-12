import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 Campo 3D {#3d-field}

O campo 3D mostra uma visualização 3D do robô e do campo. Ele pode ser usado com poses 2D regulares, mas é especialmente útil ao trabalhar com cálculos 3D (como localização com AprilTags). Múltiplas visualizações de câmera estão disponíveis, incluindo relativas ao campo, relativas ao robô e fixas. O [AdvantageScope XR](advantagescope-xr) permite que esta guia seja visualizada usando realidade aumentada. A linha do tempo mostra quando o robô está habilitado e pode ser usada para navegar pelos dados do log.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="Exemplo de aba de campo 3D" />

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo é usada para controlar a reprodução e a visualização. Clicar na linha do tempo seleciona um tempo, e clicar com o botão direito desmarca. O tempo selecionado é sincronizado em todas as guias, tornando fácil encontrar rapidamente esse local em outras visualizações.

Seções amarelas indicam quando o robô está em autônomo, seções azuis indicam quando o robô está teleoperado e seções cinzas indicam quando o robô está no modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Um intervalo também pode ser selecionado clicando e arrastando enquanto mantém `Shift` pressionado. Mova para a esquerda e para a direita rolando horizontalmente (em dispositivos suportados) ou clicando e arrastando na linha do tempo. Quando conectado ao vivo, rolar para a esquerda desbloqueia do tempo atual, e rolar totalmente para a direita bloqueia no tempo atual novamente. Pressione `Ctrl+\` para dar zoom no período em que o robô está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

:::warning
O modelo de campo da FRC 2026 é consistente com o layout de AprilTags para o campo **soldado (welded)**. As diferenças entre os campos soldado e AndyMark são muito pequenas, mas pode haver pequenos desalinhamentos (~0,5 polegada) ao visualizar poses de AprilTag com base no layout do campo AndyMark.
:::

## Adicionando objetos {#adding-objects}

Para começar, arraste um campo para a seção "Poses". Exclua um objeto usando o botão X ou oculte-o temporariamente clicando no ícone de olho ou dando um duplo clique no nome do campo. Para remover todos os objetos, clique na lixeira perto do título do eixo e depois em `Limpar tudo`. Os objetos podem ser reorganizados na lista clicando e arrastando.

**Para personalizar cada objeto, clique no ícone colorido ou clique com o botão direito no nome do campo.** O AdvantageScope suporta um grande número de tipos de objetos, muitos dos quais podem ser personalizados (como alterar cores e modelos de robôs). Alguns objetos devem ser adicionados como filhos de um objeto existente.

:::tip
Para ver uma lista completa de tipos de objetos suportados, clique no ícone `?`. Esta lista também inclui os tipos de dados suportados e se os objetos devem ser adicionados como filhos.
:::

:::info
O AdvantageScope suporta vários tamanhos de AprilTags para campos do FTC. Os tamanhos são medidos como o **comprimento lateral da seção preta da AprilTag**, sem incluir a borda branca exigida.
:::

## Formato dos dados {#data-format}

Os dados de geometria devem ser publicados como um struct ou protobuf codificado em bytes. Vários tipos de geometria 2D e 3D são suportados, incluindo `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` e mais.

Muitas bibliotecas suportam o formato struct, incluindo WPILib e AdvantageKit. O código de exemplo abaixo mostra como registrar dados de pose 3D em Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

StructPublisher<Pose3d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose3d.struct).publish();
StructArrayPublisher<Pose3d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose3d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose3d[] {poseA, poseB});
}
```

:::tip
A classe [`Field2d`](https://docs.wpilib.org/pt/stable/docs/software/dashboards/glass/field2d-widget.html) da WPILib também pode ser usada para registrar vários conjuntos de dados de pose 2D juntos.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
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
```

</TabItem>
</Tabs>

## Mecanismos e componentes {#mechanisms-and-components}

Dados de mecanismos podem ser visualizados usando mecanismos 2D ou componentes 3D articulados.

### Mecanismos 2D {#2d-mechanisms}

Para visualizar dados de mecanismo registrados usando um [`Mechanism2d`](https://docs.wpilib.org/pt/stable/docs/software/dashboards/glass/mech2d-widget.html), adicione o campo de mecanismo a um objeto de robô ou fantasma existente. O mecanismo é projetado no plano XZ ou YZ do robô usando caixas simples, como mostrado abaixo. Clique no ícone de engrenagem ou clique com o botão direito no nome do campo para alternar entre os planos XZ e YZ. A origem do robô é centralizada na borda inferior do mecanismo.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="Mecanismo 2D" />

### Componentes 3D {#3d-components}

:::warning
A configuração de componentes 3D pode ser complexa e demorada. Considere utilizar o suporte a `Mechanism2d` do AdvantageScope conforme descrito acima, que oferece uma abordagem mais simplificada para visualizar mecanismos no campo 3D.
:::

Mecanismos podem ser visualizados com componentes articulados registrando um conjunto de poses 3D que representam as localizações relativas ao robô de cada componente. Adicione as poses a um objeto de robô ou fantasma existente e defina o tipo de objeto para "Componente".

Cada componente pode ser movido independentemente (como um carrinho de elevador, braço ou efetuador final). Usuários do AdvantageKit devem considerar o uso do método [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) para converter um Mechanism2d em um array de objetos Pose3d. Para mais informações sobre a configuração de robôs com componentes, consulte [Recursos personalizados](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="Mecanismo 3D" />

## Objetos de peças do jogo {#game-piece-objects}

Cada campo inclui um conjunto de tipos de objetos de peças do jogo, permitindo que peças do jogo sejam renderizadas em qualquer posição do campo usando dados publicados pelo código do robô. Isso possui uma variedade de aplicações, incluindo:

- Visualizar as ações de rotinas autônomas simuladas usando animações simples
- Mostrar as localizações detectadas de peças do jogo no campo
- Indicar onde as peças do jogo estão localizadas dentro do robô
- Visualizar trajetórias de disparos com base em cálculos de física

Outro caso de uso simples é mostrar o estado das peças do jogo dentro do robô com base em dados de sensores. Por exemplo, um sensor de quebra de feixe (beam break) no caminho da nota para um robô de 2024 poderia fazer com que uma nota aparecesse (como mostrado abaixo).

<details>
<summary>Exemplo de código</summary>

O projeto de exemplo KitBot 2024 do AdvantageKit inclui um exemplo simples de um [comando](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) que anima uma nota viajando do robô até o speaker. Este comando é incorporado à [sequência de lançamento](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) padrão, disparando a animação sempre que uma nota é liberada. [Este vídeo](https://youtube.com/shorts/-HxfDo9f19U?feature=share) mostra como as animações de peças do jogo podem ser usadas para visualizar rotinas autônomas para vários jogos diferentes.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="Visualização da nota do KitBot 2024" />

## Opções de câmera {#camera-options}

Para alternar o modo de câmera selecionado, clique com o botão direito na visualização do campo renderizada. O modo e a posição da câmera são controlados independentemente para cada janela pop-up, permitindo a criação fácil de visualizações com múltiplas câmeras.

:::info
Clique com o botão direito na visualização do campo renderizada e clique em "Definir FOV..." para ajustar o FOV das câmeras de órbita e da Driver Station.
:::

### Orbitar campo {#orbit-field}

Este é o modo de câmera padrão, onde a câmera pode ser movida livremente em relação ao campo. **Clique esquerdo + arrastar** rotaciona a câmera e **clique direito + arrastar** desloca a câmera. **Role** para aproximar ou afastar o zoom.

:::tip
A câmera também pode ser controlada usando o teclado. As teclas **WASD** são usadas para transladar, as teclas **IJKL** são usadas para rotacionar e as teclas **E** e **Q** são usadas para transladar verticalmente.
:::

### Orbitar robô {#orbit-robot}

Este modo possui os mesmos controles do modo "Orbitar campo", mas a posição da câmera fica bloqueada em relação ao robô. Isso permite tomadas de "rastreamento" do movimento do robô.

### Driver Station {#driver-station}

Este modo bloqueia a câmera atrás de uma das estações de piloto na altura típica dos olhos. Escolha manualmente a estação a ser visualizada ou escolha "Autônomo" para usar a aliança e o número da estação armazenados nos dados do log.

:::warning
A seleção automática do número da estação pode ser imprecisa ao visualizar dados de log produzidos pelo AdvantageKit 2023 ou anterior.
:::

### Câmera fixa {#fixed-camera}

Cada modelo de robô é configurado com um conjunto de câmeras fixas, como câmeras de visão e do piloto. Essas câmeras possuem posições, proporções de imagem e FOVs fixos. Essas visualizações são frequentemente úteis para verificar dados de visão ou simular a visualização de uma câmera do piloto. No exemplo abaixo, uma câmera do piloto é exibida.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Câmera fixa" />

Se uma pose de "Substituição de câmera" for fornecida, ela substituirá as poses padrão de todas as câmeras fixas enquanto mantém seus FOVs e proporções de imagem configurados. Isso permite que o código do robô forneça a posição de uma câmera móvel, como uma montada em uma torreta ou capô do lançador.

:::info
Consistente com outros dados de pose, a pose de "Substituição de câmera" deve ser _relativa ao campo_, não relativa ao robô.
:::

## Configuração {#configuration}

O modelo do campo pode ser configurado usando o menu suspenso. Todos os jogos recentes da FRC e do FTC são suportados. Recomendamos o uso dos campos "Evergreen" para dispositivos com desempenho gráfico limitado. Os campos "Eixos" exibem apenas os eixos XYZ na origem com um contorno de campo para escala.

:::info
O sistema de coordenadas usado nesta guia é personalizável. Consulte a página do [sistema de coordenadas](/more-features/coordinate-systems) para obter detalhes.
:::

### Modos de renderização {#rendering-modes}

O campo 3D suporta três modos de renderização:

- **Cinematográfico:** Renderiza usando sombras, iluminação, reflexos e modelos 3D de alto detalhamento para uma aparência mais realista. Requer uma GPU razoavelmente potente.
- **Padrão (Padrão):** Renderiza com iluminação mínima e modelos 3D simplificados. Executa bem na maioria dos dispositivos.
- **Baixo consumo:** Reduz a taxa de quadros, a resolução e o detalhamento do modelo para reduzir o consumo de bateria e fornecer um desempenho mais consistente em dispositivos de ponta baixa.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="Comparação de modos de renderização" />

Para configurar o modo de renderização, abra a janela de preferências clicando em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS). A configuração "Modo 3D (na bateria)" pode ser alterada a partir do padrão para sobrescrever o modo de renderização usado em um notebook quando não estiver carregando. Por exemplo, isso pode ser usado para preservar a bateria durante competições.

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="350" />
