---
sidebar_position: 8
---

# 🎮 Joysticks {#joysticks}

A guia Joysticks mostra o estado de até seis controles conectados ao mesmo tempo. Na imagem abaixo, você vê um exemplo de layout com dois controles de Xbox e um joystick genérico: cada botão acende quando é pressionado, e a posição dos analógicos, gatilhos e demais eixos aparece em tempo real.

<img src="/img/tab-reference/joysticks-1.webp" alt="Visão geral da guia Joysticks" />

_A interface em inglês é exibida acima._

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo serve para controlar a reprodução e navegar pelo log. Clique em qualquer ponto dela para selecionar um instante específico, ou clique com o botão direito para desmarcar. O momento escolhido fica sincronizado em todas as guias, facilitando encontrar exatamente o mesmo instante em outras visualizações.

As faixas coloridas mostram o estado do robô: amarelo para o período autônomo, azul para o teleoperado e cinza para o modo utility.

Para dar zoom, coloque o cursor sobre a linha do tempo e role para cima ou para baixo. Você também pode selecionar um trecho segurando `Shift` enquanto clica e arrasta. Para andar para os lados, use a rolagem horizontal (em dispositivos compatíveis) ou clique e arraste na própria linha do tempo. Quando estiver conectado ao vivo, rolar para a esquerda destrava a visualização do momento atual, e rolar tudo para a direita trava no tempo real de novo. Pressione `Ctrl+\` para ajustar o zoom exatamente para o período em que o robô ficou habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

## Painel de controle {#control-pane}

Escolha o tipo de cada controle na tabela que fica na parte de baixo da guia. Os IDs vão de 0 a 5 e correspondem exatamente às portas da Driver Station e da WPILib. Se quiser saber mais sobre como eles funcionam, confira a [documentação da WPILib](https://docs.wpilib.org/pt/stable/docs/software/basic-programming/joystick.html).

O AdvantageScope já traz vários modelos prontos de controles, além da opção "Joystick genérico", que exibe todos os botões, eixos e POVs em uma grade (como mostrado acima). Para adicionar um modelo próprio de controle, veja a página de [Recursos personalizados](/more-features/custom-assets).

:::warning
**Dados de joystick NÃO ficam disponíveis por NetworkTables na WPILib padrão.** Para visualizá-los aqui, você precisa usar arquivos de log da WPILib (com o [registro de joysticks ativado](https://docs.wpilib.org/pt/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), logs do AdvantageKit, transmissão ao vivo pelo AdvantageKit ou dados da FIRST Driver Station.
:::
