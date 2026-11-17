---
sidebar_position: 1
---

# ✴️ Compatibilidade com FTC {#ftc-compatibility}

O AdvantageScope traz recursos pensados para oferecer uma experiência fluida no sistema de controle atual do FIRST Tech Challenge, ao mesmo tempo em que prepara o terreno para a transição ao [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) nas próximas temporadas. A partir da temporada 2027-2028, com a chegada oficial do Systemcore, todos os recursos do AdvantageScope passarão a ter suporte oficial na FTC.

## Campos e robôs {#fields-and-robots}

O AdvantageScope oferece suporte nativo completo para campos e modelos de robôs da FTC.

- **Modelos de campo e robô:** Escolha campos e modelos de robôs da FTC diretamente nos menus suspensos das guias 🗺️ [Campo 2D](/tab-reference/2d-field) e 👀 [Campo 3D](/tab-reference/3d-field). Todos os campos também funcionam com o [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Sistemas de coordenadas:** Configure o [sistema de coordenadas](/more-features/coordinate-systems) para ficar compatível com as [coordenadas padrão da FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) em qualquer campo. Nos campos da FTC, esse sistema já vem selecionado por padrão.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Formatos suportados {#supported-formats}

O AdvantageScope tem suporte nativo para transmissão ao vivo no formato do **FTC Dashboard** e para arquivos `.log` do **Road Runner**, além de formatos compatíveis com a WPILib, como WPILOG e NetworkTables.

Várias bibliotecas de telemetria e logging de terceiros para FTC também geram dados em formatos que o AdvantageScope consegue ler. Os desenvolvedores do AdvantageScope não endossam nem recomendam nenhuma solução específica, e você pode notar algumas limitações dependendo da biblioteca escolhida.

A lista abaixo serve como ponto de partida, mas não reúne todas as opções existentes:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Gera arquivos de log para ajudar a depurar o planejamento de trajetórias.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Transmite telemetria ao vivo compatível tanto com o próprio dashboard quanto com o AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Permite gravar dados personalizados em vários formatos, incluindo arquivos de log e transmissão ao vivo.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Salva dados no formato WPILOG usando anotações.
- **PsiKit**: Um framework de logging e replay para FTC inspirado no AdvantageKit.

:::warning
Fique atento à regra R704 durante as competições! Serviços de telemetria de terceiros, como o FTC Dashboard, são proibidos via Wi-Fi nos torneios.
:::

### AdvantageScope Lite para FTC {#advantagescope-lite-for-ftc}

Existe uma distribuição não oficial do [AdvantageScope Lite](/more-features/advantagescope-lite) otimizada para a FTC: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Vale lembrar que essa versão não é oficial e não conta com suporte dos desenvolvedores do AdvantageScope.

Enquanto o [AdvantageScope Lite](/more-features/advantagescope-lite) padrão é um aplicativo web feito para rodar no Systemcore e na Driver Station da FIRST, essa distribuição não oficial foi adaptada para rodar diretamente no sistema de controle atual da FTC. Com ela, você consegue acompanhar dados ao vivo pelo protocolo do FTC Dashboard nativamente, sem precisar instalar nenhum software extra.
