---
sidebar_position: 1
title: Boas-vindas
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner.webp" alt="AdvantageScope" />

O AdvantageScope é um aplicativo de diagnóstico de robô, revisão/análise de logs e visualização de dados para equipes da FIRST desenvolvido pela [Equipe 6328](https://littletonrobotics.org). Ele lê logs nos formatos de arquivo WPILOG, log da DS, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV e RLOG, além de visualização de dados do robô ao vivo usando transmissão NT4, Phoenix, RLOG ou FTC Dashboard. O AdvantageScope pode ser usado com qualquer projeto WPILib, mas também é otimizado para uso com nossa estrutura de reprodução de logs [AdvantageKit](https://docs.advantagekit.org). Observe que **o AdvantageKit não é necessário para usar o AdvantageScope**.

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
label: "Conferência do Campeonato",
href: "/overview/champs-conference"
}
]}
/>

O AdvantageScope inclui as seguintes ferramentas:

- Uma ampla seleção de gráficos flexíveis
- Visualizações de campo 2D e 3D de dados de pose, com robôs baseados em CAD personalizáveis
- Reprodução de vídeo sincronizada a partir de um vídeo de partida carregado separadamente
- Visualização de joystick, mostrando as ações do piloto em representações de controles personalizáveis
- Exibições de vetores de módulos Swerve
- Revisão de mensagens do console
- Análise de estatísticas de log
- Opções de exportação flexíveis, com suporte para CSV e WPILOG

<Button
label="Ir para Downloads"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Feedback, solicitações de recursos e relatórios de problemas são bem-vindos na [página de problemas](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Consulte a [página de contribuição](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) para obter mais informações sobre como contribuir para o AdvantageScope. Para consultas não públicas, envie uma mensagem para software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-light.webp" className="dark-only" />
