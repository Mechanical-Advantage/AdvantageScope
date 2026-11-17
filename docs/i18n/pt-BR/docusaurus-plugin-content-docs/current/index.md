---
sidebar_position: 1
title: Boas-vindas
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-ltr-light.webp" className="light-only" />
<img src="/img/banner-ltr-dark.webp" className="dark-only" />

O AdvantageScope é um aplicativo desenvolvido pela [Equipe 6328](https://littletonrobotics.org) para equipes da FIRST fazerem diagnóstico de robôs, análise de logs e visualização de dados. Ele abre arquivos de log nos formatos WPILOG, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV, log da NI DS e RLOG, além de exibir dados do robô ao vivo via NT4, Phoenix, RLOG ou FTC Dashboard. Você pode usar o AdvantageScope com qualquer projeto WPILib, embora ele também seja otimizado para o nosso framework de log replay [AdvantageKit](https://docs.advantagekit.org). Vale lembrar que **você não precisa do AdvantageKit para usar o AdvantageScope**.

<DocCardList
items={[
{
type: "category",
label: "Visão geral",
href: "/category/overview"
},
{
type: "category",
label: "Referência de guias",
href: "/category/tab-reference"
},
{
type: "category",
label: "Mais recursos",
href: "/category/more-features"
},
{
type: "link",
label: "Conferência do campeonato",
href: "/overview/champs-conference"
}
]}
/>

O AdvantageScope inclui as seguintes ferramentas:

- Uma grande variedade de gráficos flexíveis
- Visualizações de campo em 2D e 3D para dados de pose, com modelos de robôs em CAD personalizáveis
- Reprodução de vídeo sincronizada com o vídeo da partida carregado separadamente
- Visualização de joysticks, mostrando as ações do piloto em controles personalizáveis
- Exibição dos vetores dos módulos Swerve
- Análise das mensagens do console
- Análise estatística dos dados do log
- Opções flexíveis de exportação, com suporte a CSV e WPILOG

<Button
label="Ir para downloads"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Sugestões, pedidos de novos recursos e relatos de bugs são sempre bem-vindos na [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Para saber como contribuir com o projeto, confira a [página de contribuição](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md). Para assuntos que não possam ser públicos, envie uma mensagem para software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />
