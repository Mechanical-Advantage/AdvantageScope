---
sidebar_position: 4
---

# 📐 Sistemas de coordenadas {#coordinate-systems}

O AdvantageScope oferece suporte a vários sistemas de coordenadas comuns nas guias [🗺️ Campo 2D](/tab-reference/2d-field) e [👀 Campo 3D](/tab-reference/3d-field). Se quiser se aprofundar nas convenções de eixos e rotação usadas pelo aplicativo, consulte a [documentação do sistema de coordenadas da WPILib](https://docs.wpilib.org/pt/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system).

### Personalização {#customization}

Por padrão, o AdvantageScope escolhe o sistema de coordenadas automaticamente de acordo com a imagem ou o modelo de campo selecionado. Se você quiser usar outro sistema de coordenadas em todos os campos, abra a janela de preferências em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS) e altere a opção "Sistema de coordenadas".

:::tip
Todas as opções de sistema de coordenadas funcionam tanto com campos da FRC quanto com campos da FTC.
:::

## Centro/vermelho (Systemcore) {#center-red}

A origem fica no centro do campo, com o eixo +X apontando no sentido oposto à parede da aliança vermelha, como mostra a imagem abaixo. **Esse é o sistema de coordenadas padrão para campos da FRC a partir de 2027 e campos da FTC a partir da temporada 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Sistema de coordenadas centro/vermelho" />

## Parede azul {#blue-wall}

A origem fica no canto mais à direita da parede da aliança azul, com o eixo +X apontando para a parede da aliança vermelha, como mostra a imagem abaixo. **Esse é o sistema de coordenadas padrão para campos da FRC de 2023 a 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Sistema de coordenadas parede azul" />

## Parede da aliança {#alliance-wall}

A origem fica no canto mais à direita da parede da aliança correspondente à _aliança atual do robô_, com o eixo +X apontando para a parede da aliança oposta, como mostra a imagem abaixo. **Esse é o sistema de coordenadas padrão para a FRC em 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Sistema de coordenadas parede da aliança" />

## Centro/rotacionado {#center-rotated}

A origem fica no centro do campo, com o eixo +X apontando para a direita sob a perspectiva da parede da aliança vermelha, como mostra a imagem abaixo. **Esse é o sistema de coordenadas padrão para campos da FTC de 2024-2025 a 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Sistema de coordenadas centro/rotacionado" height="400" />
