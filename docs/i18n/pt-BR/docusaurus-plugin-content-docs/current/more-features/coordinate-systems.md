---
sidebar_position: 4
---

# 📐 Sistemas de coordenadas {#coordinate-systems}

O AdvantageScope inclui suporte para vários sistemas de coordenadas comuns nas guias [🗺️ Campo 2D](/tab-reference/2d-field) e [👀 Campo 3D](/tab-reference/3d-field). Por favor, consulte a [documentação do sistema de coordenadas da WPILib](https://docs.wpilib.org/pt/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) para mais informações sobre as convenções de eixos e rotação usadas pelo AdvantageScope.

### Personalização {#customization}

Por padrão, o sistema de coordenadas é selecionado automaticamente com base na imagem/modelo de campo escolhido. Para selecionar um sistema de coordenadas diferente para uso em todos os campos, abra a janela de preferências clicando em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS) e altere a opção "Sistema de coordenadas".

:::tip
Todas as opções de sistema de coordenadas são compatíveis com os campos da FRC e do FTC.
:::

## Centro/vermelho (Systemcore) {#center-red}

A origem fica no centro do campo com o eixo +X apontando para longe da parede da aliança vermelha, como mostrado abaixo. **Este é o sistema de coordenadas padrão para campos da FRC a partir de 2027 e campos do FTC a partir de 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Sistema de coordenadas centro/vermelho" />

## Parede azul {#blue-wall}

A origem fica no canto mais à direita da parede da aliança azul com o eixo +X apontando para a parede da aliança vermelha, como mostrado abaixo. **Este é o sistema de coordenadas padrão para campos da FRC de 2023 a 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Sistema de coordenadas parede azul" />

## Parede da aliança {#alliance-wall}

A origem fica no canto mais à direita da parede da aliança para a _aliança atual do robô_ com o eixo +X apontando para a parede da aliança oposta, como mostrado abaixo. **Este é o sistema de coordenadas padrão para a FRC em 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Sistema de coordenadas parede da aliança" />

## Centro/rotacionado {#center-rotated}

A origem fica no centro do campo com o eixo +X apontando para a direita da perspectiva da parede da aliança vermelha, como mostrado abaixo. **Este é o sistema de coordenadas padrão para campos do FTC de 2024-2025 a 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Sistema de coordenadas centro/rotacionado" height="400" />
