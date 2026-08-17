---
sidebar_position: 8
---

# 🎮 Joysticks {#joysticks}

A guia de joysticks mostra o estado de até seis controles conectados. A imagem abaixo mostra um exemplo de layout, com dois controles de Xbox e um joystick genérico. Cada botão é destacado quando pressionado, e os estados dos joysticks e outros eixos são exibidos.

<img src="/img/tab-reference/joysticks-1.webp" alt="Visão geral da aba de joysticks" />

_A interface em inglês é exibida acima._

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo é usada para controlar a reprodução e a visualização. Clicar na linha do tempo seleciona um tempo, e clicar com o botão direito desmarca. O tempo selecionado é sincronizado em todas as guias, tornando fácil encontrar rapidamente esse local em outras visualizações.

Seções amarelas indicam quando o robô está em autônomo, seções azuis indicam quando o robô está teleoperado e seções cinzas indicam quando o robô está no modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Um intervalo também pode ser selecionado clicando e arrastando enquanto mantém `Shift` pressionado. Mova para a esquerda e para a direita rolando horizontalmente (em dispositivos suportados) ou clicando e arrastando na linha do tempo. Quando conectado ao vivo, rolar para a esquerda desbloqueia do tempo atual, e rolar totalmente para a direita bloqueia no tempo atual novamente. Pressione `Ctrl+\` para dar zoom no período em que o robô está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

## Painel de controle {#control-pane}

Selecione os tipos de joysticks na tabela na parte inferior da guia. Os IDs de joystick variam de 0 a 5 e correspondem aos IDs na Driver Station e na WPILib. Mais informações sobre joysticks podem ser encontradas na [documentação da WPILib](https://docs.wpilib.org/pt/stable/docs/software/basic-programming/joystick.html).

O AdvantageScope inclui um conjunto de joysticks comuns, incluindo um "Joystick genérico" com todos os botões, eixos e POVs em formato de grade (visto acima). Para adicionar um joystick personalizado, consulte [Recursos personalizados](/more-features/custom-assets).

:::warning
**Dados de joystick NÃO estão disponíveis via conexão NetworkTables com a WPILib padrão.** Arquivos de log da WPILib (com [logging de joystick habilitado](https://docs.wpilib.org/pt/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), logs do AdvantageKit e transmissão do AdvantageKit são suportados.
:::
