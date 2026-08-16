---
sidebar_position: 1
---

# ✴️ Compatibilidade com FTC {#ftc-compatibility}

O AdvantageScope inclui recursos para fornecer uma experiência fluida no sistema de controle atual do FIRST Tech Challenge, enquanto prepara a transição para o [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) em temporadas futuras. Todos os recursos do AdvantageScope serão oficialmente suportados no FTC após a transição para o Systemcore a partir da temporada 2027-2028.

## Campos e robôs {#fields-and-robots}

Campos e modelos de robôs do FTC são totalmente suportados nativamente.

- **Modelos de campo e robô:** Selecione campos e modelos de robôs do FTC nas guias 🗺️ [Campo 2D](/tab-reference/2d-field) e 👀 [Campo 3D](/tab-reference/3d-field) diretamente dos menus suspensos. Todos os campos são compatíveis com o [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Sistemas de coordenadas:** Configure o [sistema de coordenadas](/more-features/coordinate-systems) para compatibilidade com as [coordenadas padrão do FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) em qualquer campo. Este sistema de coordenadas é usado por padrão em campos do FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Formatos suportados {#supported-formats}

O AdvantageScope inclui suporte nativo para o formato de transmissão ao vivo do **FTC Dashboard** e arquivos `.log` do **Road Runner**, além de formatos compatíveis com WPILib como WPILOG e NetworkTables.

Várias bibliotecas de telemetria e log de terceiros para FTC produzem dados em formatos compatíveis com o AdvantageScope. Os desenvolvedores do AdvantageScope não endossam nem recomendam nenhuma solução de log específica para FTC, e você pode encontrar recursos limitados ao usar algumas soluções de log.

A lista abaixo fornece um ponto de partida, mas não é exaustiva:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Gera arquivos de log para depurar a lógica de planejamento de trajetórias.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Transmite telemetria ao vivo compatível tanto com seu próprio painel quanto com o AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Permite o registro personalizado de dados para múltiplos formatos, incluindo arquivos de log e transmissão ao vivo.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Salva dados no formato WPILOG usando anotações.
- **PsiKit**: Uma estrutura de logging e replay para FTC inspirada no AdvantageKit.

:::warning
As equipes devem ter cuidado para cumprir a regra R704 durante as competições. Serviços de telemetria de terceiros, como o FTC Dashboard, são proibidos quando conectados via Wi-Fi nas competições.
:::

### AdvantageScope Lite para FTC {#advantagescope-lite-for-ftc}

Uma distribuição não oficial do [AdvantageScope Lite](/more-features/advantagescope-lite) otimizada para FTC está disponível: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Esta distribuição não é oficial e não é suportada pelos desenvolvedores do AdvantageScope.

Enquanto o [AdvantageScope Lite](/more-features/advantagescope-lite) padrão é um aplicativo web projetado para uso no Systemcore e na Driver Station da FIRST, a distribuição não oficial para FTC é especificamente modificada para uso direto no sistema de controle atual do FTC. Ele suporta nativamente a visualização de dados ao vivo pelo protocolo FTC Dashboard sem a necessidade de software adicional.
