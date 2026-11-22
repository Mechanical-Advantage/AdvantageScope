---
sidebar_position: 2
---

# 🤖 Para o campo: visualização do robô

Agora que você já tem telemetria básica funcionando, é hora de visualizar seu robô! O AdvantageScope oferece poderosos visualizadores de campo 2D e 3D que dão vida à odometria, estimativas de visão, trajetórias e mecanismos articulados em modelos de campo da FRC e FTC.

Neste tutorial, você aprenderá a:

- Publicar dados estruturados de pose usando a **API Telemetry**.
- Usar as guias **🗺️ Campo 2D** e **👀 Campo 3D** para visualizar a movimentação do robô.
- Publicar e renderizar um mecanismo tanto em 2D quanto em 3D.

## 1. Publicando poses

Na WPILib, objetos de geometria como `Pose2d`, `Pose3d` e `Translation2d` são usados para representar a localização do robô e dos elementos do campo. Com a **API Telemetry**, você pode registrar poses/translações e arrays (como trajetórias planejadas ou alvos de visão) diretamente com uma única chamada de método:

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

<details>
<summary>OpMode de exemplo</summary>

Quer experimentar os recursos de visualização do AdvantageScope sem um projeto completo de robô? Copie o OpMode abaixo, que publica várias poses 2D e 3D para demonstração em um modelo de campo da FRC. Consulte 👋 [Olá, telemetria!](/tutorials/hello-telemetry) para detalhes sobre como criar um novo projeto WPILib e configurá-lo para telemetria.

```java
@Teleop
public class ExampleTeleop implements OpMode {
  @Override
  public void periodic() {
    double t = Timer.getTimestamp();

    // Gera uma trajetória circular de exemplo
    double x = 2.0 * Math.cos(t * 0.5);
    double y = 2.0 * Math.sin(t * 0.5);
    Rotation2d rotation = Rotation2d.fromRadians(t * 0.5 + Math.PI / 2.0);
    Pose2d robotPose2d = new Pose2d(x, y, rotation);

    // Cria uma pose 3D de exemplo (por exemplo, de localização por visão ou pitch/roll do giroscópio)
    Pose3d robotPose3d = new Pose3d(x, y, 0.0, new Rotation3d(0.0, 0.0, rotation.getRadians()));

    // Cria uma trajetória de exemplo (um array de objetos Pose2d)
    Pose2d[] trajectory = new Pose2d[] {
        new Pose2d(8.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 6.0, Rotation2d.CW_PI_2)
    };

    // Registra poses 2D e 3D individuais
    Telemetry.log("Field/RobotPose2d", robotPose2d);
    Telemetry.log("Field/RobotPose3d", robotPose3d);

    // Registra um array de poses (por exemplo, trajetória ou poses de AprilTags)
    Telemetry.log("Field/Trajectory", trajectory);
  }
}
```

</details>

No AdvantageScope, os valores de geometria na barra lateral são rotulados com seu tipo. Você também pode expandir cada campo para examinar os componentes individuais da pose, como os valores de X, Y e rotação:

<img src="/img/tutorials/to-the-field-1.webp" alt="Visualizando dados de pose na barra lateral do AdvantageScope." />

_A interface em inglês é exibida acima._

## 2. Visualizando dados em 2D

A guia 🗺️ [Campo 2D](/tab-reference/2d-field) exibe uma vista superior do seu robô sobreposta à arena de competição.

1. No AdvantageScope, clique no botão **+** na barra de guias e selecione **Campo 2D** (ou selecione uma guia Campo 2D existente).
2. No menu suspenso "Campo" no painel de controle inferior, selecione a temporada atual ou um campo permanente.
3. Na árvore da barra lateral, localize `NT:/Telemetry/Field/RobotPose2d` e arraste-o para a lista "Poses" no painel de controle.
4. Seu robô aparecerá no campo!
5. Clique no ícone ao lado da pose no painel de controle para alterar a cor do robô.

:::info Controles da câmera

Clique com o botão direito em qualquer lugar da área do campo para escolher entre **Desbloqueado**, **Travado no robô** (move-se junto com o robô) ou **Travado no robô e na rotação** (gira o campo para que seu robô sempre aponte para cima). Clique nos botões em "Orientação" para ajustar a rotação.
:::

<img src="/img/tutorials/to-the-field-2.webp" alt="Visualização do robô no campo da FRC 2026." />

_A interface em inglês é exibida acima._

## 3. Alternando tipos de objeto

O AdvantageScope suporta muitos tipos de objetos visuais além de poses simples do robô, incluindo fantasmas (robôs translúcidos), trajetórias, alvos de visão, mapas de calor, AprilTags, peças do jogo e muito mais! Para explorar quais tipos de objetos o AdvantageScope pode renderizar:

1. Clique no ícone `?` (Ajuda) localizado no painel de controle.
2. Uma janela será aberta listando todos os tipos visuais suportados, seus tipos de dados esperados (por exemplo, `Pose2d`, `Pose3d[]`, `Translation2d`) e se podem ser adicionados como itens independentes ou como filhos anexados a outro objeto.

Clique no ícone ao lado de cada pose no painel de controle para alterar o tipo de objeto. Experimente mudar a pose do robô para outro tipo de objeto, como um fantasma, seta ou mapa de calor!

<img src="/img/tutorials/to-the-field-3.webp" alt="Janela de ajuda integrada para o campo 2D." height="500" />

_A interface em inglês é exibida acima._

## 4. Visualizando dados em 3D

A guia 👀 [Campo 3D](/tab-reference/3d-field) renderiza um campo 3D completo com elementos do jogo, iluminação e modelos de robô personalizáveis.

1. Clique em **+** na barra de guias e selecione **Campo 3D** (ou selecione uma guia Campo 3D existente).
2. Selecione o modelo da sua temporada de jogo no menu suspenso "Campo".
3. Arraste `NT:/Telemetry/Field/RobotPose3d` ou `NT:/Telemetry/Field/RobotPose2d` para a seção "Poses" (poses 2D são colocadas automaticamente no piso do campo).
4. Arraste `NT:/Telemetry/Field/Trajectory` para a lista "Poses" e defina seu tipo como **Trajetória** para renderizar um caminho como uma fita sobre o campo.
5. Clique e arraste com o **botão esquerdo do mouse** para girar a câmera ao redor do campo. Arraste com o **botão direito do mouse** para mover a visualização. Role para dar zoom.
6. Como alternativa, use **WASD** para deslocar, **IJKL** para girar e **Q/E** para subir e descer.
7. Clique com o botão direito na área de visualização 3D para alternar entre **Orbitar robô**, **Driver Station** (ver a partida pela perspectiva da sua aliança) e **Câmera fixa** (ver pelas câmeras de visão embarcadas no robô).

<img src="/img/tutorials/to-the-field-4.webp" alt="Guia Campo 3D renderizando um modelo 3D de robô navegando pelo campo com uma fita de trajetória." />

_A interface em inglês é exibida acima._

## 5. Publicando dados de mecanismos

Se o seu robô tiver estruturas articuladas como um elevador, braço ou punho, você pode visualizá-las usando o `Mechanism2d` da WPILib. Confira a [documentação](https://docs.wpilib.org/pt/stable/docs/software/dashboards/glass/mech2d-widget.html) da WPILib para detalhes. Um exemplo é mostrado abaixo para um braço de uma única articulação.

```java
public class ExampleTeleop implements OpMode {
  // Cria uma tela de mecanismo 2D (largura 2 m, altura 2 m)
  private final Mechanism2d mechanism = new Mechanism2d(2.0, 2.0);
  private MechanismLigament2d arm;

  public ExampleTeleop(Robot robot) {
    // Cria um braço com raiz em (1 m, 0,5 m)
    MechanismRoot2d root = mechanism.getRoot("ArmRoot", 1.0, 0.5);
    arm = root.append(new MechanismLigament2d("Arm", 0.8, 0.0, 6.0, new Color8Bit(255, 100, 0)));
  }

  @Override
  public void periodic() {
    // Anima o ângulo do braço
    double angle = 45.0 + 45.0 * Math.sin(Timer.getTimestamp() * 2.0);
    arm.setAngle(angle);

    // Publica o estado do mecanismo a cada ciclo de loop
    Telemetry.log("Superstructure/Mechanism", mechanism);
  }
}
```

## 6. Visualizando mecanismos em 2D

A guia ⚙️ [Mecanismo](/tab-reference/mechanism) pode ser usada para visualizar mecanismos em 2D.

1. Clique em **+** na barra de guias e selecione **Mecanismo**.
2. Arraste `NT:/Telemetry/Superstructure/Mechanism` para o painel de controle. Você verá o braço 2D animado se mover em tempo real.

<img src="/img/tutorials/to-the-field-5.webp" alt="A guia Mecanismo exibindo uma visualização 2D de um braço articulado." />

_A interface em inglês é exibida acima._

## 7. Visualizando mecanismos em 3D

Você pode projetar esse mesmo `Mechanism2d` diretamente sobre o seu robô na guia Campo 3D!

1. Na guia Campo 3D, certifique-se de que a pose do seu robô esteja adicionada à lista "Poses".
2. Arraste `NT:/Telemetry/Superstructure/Mechanism` **sobre a entrada da pose do robô** na lista de objetos (como um objeto filho).
3. O mecanismo 2D é projetado no espaço 3D sobre o chassi do robô! Clique no ícone de engrenagem ao lado do mecanismo para alternar entre os planos **XZ** (perfil lateral) e **YZ** (perfil frontal).

<img src="/img/tutorials/to-the-field-6.webp" alt="Guia Campo 3D exibindo um mecanismo projetado em um modelo 3D de robô." />

_A interface em inglês é exibida acima._

## O que vem a seguir?

Agora que você já consegue visualizar a movimentação e os mecanismos do seu robô em 2D e 3D:

- **🕹️ [Assumindo o controle: DS e joysticks](/tutorials/taking-control):** Aprenda a integrar com a FIRST Driver Station, trabalhar com logs da DS e visualizar entradas de controles.
- **👀 [Campo 3D](/tab-reference/3d-field):** Um guia completo da guia Campo 3D, incluindo visualização de peças do jogo, opções de câmera e modos de renderização.
- **[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr):** Dê vida à visualização do campo 3D em realidade aumentada no iPhone e iPad.
- **🎬 [Vídeo](/tab-reference/video):** Compare sua visualização de campo lado a lado com gravações reais de partidas.
- **🦀 [Swerve](/tab-reference/swerve):** Visualize o estado dos módulos de tração swerve, incluindo sobreposições nos campos 2D e 3D.
- **⚙️ [Recursos personalizados](/more-features/custom-assets):** Adicione modelos CAD personalizados, mecanismos articulados e imagens/modelos de campo.
