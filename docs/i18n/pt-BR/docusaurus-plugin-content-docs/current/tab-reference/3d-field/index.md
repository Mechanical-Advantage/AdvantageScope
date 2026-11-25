import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 Campo 3D {#3d-field}

A guia Campo 3D exibe o robô e a arena em três dimensões. Ela funciona muito bem com poses 2D comuns, mas brilha mesmo quando você precisa analisar cálculos em 3D (como localização com AprilTags). Você pode escolher entre vários modos de câmera — relativos ao campo, relativos ao robô ou fixos — e até usar o [AdvantageScope XR](advantagescope-xr) para ver tudo em realidade aumentada. A linha do tempo indica quando o robô esteve habilitado e permite navegar pelos dados do log.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="Exemplo da guia Campo 3D" />

_A interface em inglês é exibida acima._

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo serve para controlar a reprodução e navegar pelo log. Clique em qualquer ponto dela para selecionar um instante específico, ou clique com o botão direito para desmarcar. O momento escolhido fica sincronizado em todas as guias, facilitando encontrar exatamente o mesmo instante em outras visualizações.

As faixas coloridas mostram o estado do robô: amarelo para o período autônomo, azul para o teleoperado e cinza para o modo utility.

Para dar zoom, coloque o cursor sobre a linha do tempo e role para cima ou para baixo. Você também pode selecionar um trecho segurando `Shift` enquanto clica e arrasta. Para andar para os lados, use a rolagem horizontal (em dispositivos compatíveis) ou clique e arraste na própria linha do tempo. Quando estiver conectado ao vivo, rolar para a esquerda destrava a visualização do momento atual, e rolar tudo para a direita trava no tempo real de novo. Pressione `Ctrl+\` para ajustar o zoom exatamente para o período em que o robô ficou habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

:::warning Campo da FTC 2026-2027
O modelo da arena da FTC 2026-2027 não traz AprilTags fixas, já que a posição das tags na estrutura (hive) pode mudar durante a partida. Para exibi-las, sua equipe pode publicar um `Pose3d[]` e um `number[]` para criar objetos dinâmicos de AprilTag no campo. O tamanho correto da AprilTag para essa arena é de **3,25 polegadas**.
:::

:::warning Campo da FRC 2026
O modelo da arena da FRC 2026 segue o layout de AprilTags do campo **soldado (welded)**. As diferenças entre o campo soldado e o da AndyMark são mínimas, mas você pode notar pequenos desvios (cerca de 0,5 polegada) ao visualizar poses de AprilTag baseadas no layout da AndyMark.
:::

## Adicionando objetos {#adding-objects}

Para começar, arraste um campo da barra lateral para a seção "Poses". Se quiser remover um objeto, clique no botão X; para apenas escondê-lo temporariamente, clique no ícone de olho ou dê um duplo clique no nome dele. Para apagar tudo de uma vez, clique na lixeira ao lado do título e depois em `Limpar tudo`. Você também pode clicar e arrastar os itens para mudar a ordem na lista.

**Para personalizar cada objeto, clique no ícone colorido ao lado dele ou clique com o botão direito no nome do campo.** O AdvantageScope conta com vários tipos de objetos e opções de ajuste (como trocar cores e modelos de robô). Alguns objetos precisam ser adicionados dentro de um objeto já existente, como filhos.

:::tip
Quer ver todos os tipos de objetos disponíveis? Clique no ícone `?`. A lista também mostra quais tipos de dados cada objeto aceita e se ele precisa ser colocado como filho de outro item.
:::

:::info
O AdvantageScope aceita vários tamanhos de AprilTags para arenas da FTC. A medida corresponde ao **comprimento lateral da parte preta da AprilTag**, sem contar a borda branca ao redor.
:::

## Formato dos dados {#data-format}

Os dados de geometria precisam ser publicados como `struct` ou `protobuf` codificados em bytes. Vários tipos 2D e 3D são aceitos, como `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` e outros.

Diversas bibliotecas já dão suporte ao formato `struct`, incluindo a WPILib e o AdvantageKit. Veja nos exemplos abaixo como registrar poses 3D:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose3d[] {poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::math::Pose3d poseA;
wpi::math::Pose3d poseB;

wpi::telemetry::Log("MyPose", poseA);
wpi::telemetry::Log("MyPoseArray", std::vector{poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import Pose3d
import telemetry

pose_a = Pose3d()
pose_b = Pose3d()

telemetry.log("MyPose", pose_a)
telemetry.log("MyPoseArray", [pose_a, pose_b], element_type=Pose3d)
```

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
// Esse protocolo não suporta o formato struct moderno, mas você pode
// publicar valores de pose usando campos separados com os sufixos
// "x", "y" e "heading" (como no exemplo abaixo):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Polegadas
packet.put("Pose y", 2.8); // Polegadas
packet.put("Pose heading", 3.14); // Radianos

// Se preferir, o ângulo de orientação (heading) pode ir em graus
packet.put("Pose heading (deg)", 180.0); // Graus
```

</TabItem>
</Tabs>

## Mecanismos e componentes {#mechanisms-and-components}

Você pode visualizar o movimento de mecanismos usando mecanismos 2D ou componentes 3D articulados.

### Mecanismos 2D {#2d-mechanisms}

Para visualizar dados registrados com um [`Mechanism2d`](https://docs.wpilib.org/pt/stable/docs/software/dashboards/glass/mech2d-widget.html), arraste o campo do mecanismo para dentro de um objeto de robô ou fantasma que já esteja na lista. O mecanismo é projetado no plano XZ ou YZ do robô usando caixas simples, como na imagem abaixo. Clique no ícone de engrenagem ou clique com o botão direito no nome do campo para alternar entre os planos XZ e YZ. A origem do robô fica centralizada na borda inferior do mecanismo.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="Mecanismo 2D" />

### Componentes 3D {#3d-components}

:::warning
Configurar componentes 3D pode ser trabalhoso e demorar bastante. Vale a pena considerar o suporte a `Mechanism2d` explicado acima, que é bem mais prático para visualizar mecanismos no Campo 3D.
:::

Para animar mecanismos com componentes articulados em 3D, registre um conjunto de poses 3D que representem a posição de cada peça em relação ao robô. Adicione essas poses dentro de um objeto de robô ou fantasma e mude o tipo do objeto para "Componente".

Cada componente se move de forma independente (como o carro de um elevador, um braço ou um efetuador final). Se você usa o AdvantageKit, vale conferir o método [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only), que converte um `Mechanism2d` diretamente em um array de `Pose3d`. Para saber como configurar os arquivos 3D do robô com componentes, acesse [Recursos personalizados](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="Mecanismo 3D" />

## Objetos de peças do jogo {#game-piece-objects}

Cada arena já vem com tipos de objetos próprios para as peças do jogo, permitindo renderizar essas peças em qualquer lugar do campo a partir dos dados enviados pelo código do robô. Isso abre várias possibilidades:

- Animar de forma simples as ações de rotinas autônomas simuladas
- Mostrar onde a visão computacional detectou peças do jogo na arena
- Indicar quando e onde há uma peça dentro do robô
- Visualizar trajetórias de lançamento calculadas com física

Um uso bem prático é mostrar o estado das peças dentro do robô usando dados dos sensores. Por exemplo, um sensor de barreira óptica (beam break) no caminho da nota em um robô de 2024 pode fazer a nota aparecer no modelo (como abaixo).

<details>
<summary>Exemplo de código</summary>

O projeto de exemplo KitBot 2024 do AdvantageKit traz um [comando](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) simples que anima uma nota saindo do robô até o speaker. Esse comando é chamado na [sequência de lançamento](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) padrão, disparando a animação sempre que a nota é lançada. [Este vídeo](https://youtube.com/shorts/-HxfDo9f19U?feature=share) mostra como animações de peças do jogo ajudam a visualizar rotinas autônomas em vários jogos diferentes.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="Visualização da nota do KitBot 2024" />

## Opções de câmera {#camera-options}

Para trocar o modo de câmera, clique com o botão direito na área do campo 3D. Cada janela destacada controla seu próprio modo e posição de câmera de forma independente, o que facilita montar telas com vários ângulos ao mesmo tempo.

:::info
Clique com o botão direito no campo 3D e escolha "Definir FOV" para ajustar o campo de visão (FOV) das câmeras de órbita e da Driver Station.
:::

### Orbitar campo {#orbit-field}

É o modo padrão, em que você move a câmera livremente pela arena. Clique com o botão esquerdo e arraste para girar a câmera e **clique direito + arrastar** para deslocar a visualização. **Role** o mouse para aproximar ou afastar o zoom.

:::tip
Você também pode controlar a câmera pelo teclado: **WASD** move para frente, trás e lados; **IJKL** gira a câmera; e **E** e **Q** sobem e descem na vertical.
:::

### Orbitar robô {#orbit-robot}

Tem os mesmos controles do modo "Orbitar campo", mas a câmera fica presa à posição do robô — ótimo para acompanhar o robô em movimento.

### Driver Station {#driver-station}

Posiciona a câmera atrás de uma das estações de piloto, na altura aproximada dos olhos. Você pode escolher a estação manualmente ou deixar em "Automático" para usar a aliança e o número da estação salvos no log.

:::warning
A seleção automática da estação pode falhar ao abrir logs gravados com o AdvantageKit 2023 ou versões anteriores.
:::

### Câmera fixa {#fixed-camera}

Cada modelo de robô pode ter câmeras fixas configuradas, como câmeras de visão ou do piloto, com posição, proporção de tela e FOV já definidos. Elas são muito úteis para conferir o que a visão enxerga ou simular a câmera que o piloto vê na Driver Station. Abaixo, você vê um exemplo de câmera do piloto.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Câmera fixa" />

Se você fornecer uma pose de "Substituição de câmera", ela passa a definir a posição de todas as câmeras fixas, mantendo o FOV e a proporção originais. Assim, o código do robô pode informar a posição de uma câmera móvel, como uma montada em uma torreta ou no hood (defletor) de um lançador.

:::info
Assim como os outros dados de pose, a pose de "Substituição de câmera" precisa ser _relativa à arena_, e não relativa ao robô.
:::

## Configuração {#configuration}

Você pode escolher o modelo da arena no menu suspenso. Todos os jogos recentes da FRC e da FTC estão disponíveis. Se o computador tiver desempenho gráfico mais limitado, vale usar os campos "Perene". Já os campos "Eixos" mostram apenas os eixos XYZ na origem com o contorno da arena para dar noção de escala.

:::info
O sistema de coordenadas usado nesta guia pode ser personalizado. Confira a página de [Sistema de coordenadas](/more-features/coordinate-systems) para ver os detalhes.
:::

### Modos de renderização {#rendering-modes}

O Campo 3D oferece três modos de renderização:

- **Cinematográfico (esquerda):** Ativa sombras, iluminação avançada, reflexos e modelos 3D bem detalhados para um visual mais realista. Exige uma placa de vídeo (GPU) razoavelmente potente.
- **Normal (centro):** Modo padrão, com iluminação básica e modelos 3D simplificados. Roda bem na maioria dos computadores.
- **Baixo consumo (direita):** Reduz a taxa de quadros, a resolução e os detalhes dos modelos para economizar bateria e manter o desempenho estável em máquinas mais simples.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="Comparação de modos de renderização" />

Para trocar o modo de renderização, abra as preferências em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS). Você também pode mudar a opção "Modo 3D (na bateria)" para usar um modo mais leve automaticamente quando o notebook estiver fora da tomada — bem útil para poupar bateria no pit ou nas arquibancadas durante a competição.

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="450" />
