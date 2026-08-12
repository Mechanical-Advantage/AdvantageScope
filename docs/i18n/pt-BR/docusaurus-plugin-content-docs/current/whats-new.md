---
title: O que há de novo em 2026?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-light.png" className="light-only" />
<img src="/img/whats-new/banner-dark.png" className="dark-only" />

A versão 2026 do AdvantageScope já está disponível! Verifique a [documentação de instalação](/overview/installation) e o [histórico de alterações completo](https://github.com/Mechanical-Advantage/AdvantageScope/releases) para mais detalhes. Este lançamento inclui vários novos recursos principais e inúmeras melhorias em todo o aplicativo. Muitos dos recursos desta versão foram projetados para melhorar a experiência em sistemas de controle existentes, enquanto preparam uma transição suave para o [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) em temporadas futuras.

**Valorizamos seu feedback! Feedback, solicitações de recursos e relatórios de problemas são bem-vindos na [página de problemas](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Experimental: Suporte ao FTC {#ftc-support}

Em preparação para o suporte completo ao Systemcore na temporada 2027-2028, esta versão adiciona vários recursos para melhorar a compatibilidade com o sistema de controle existente do FIRST Tech Challenge:

- Campos do FTC e modelos de robôs no 🗺️ [Campo 2D](/tab-reference/2d-field) e 👀 [Campo 3D](/tab-reference/3d-field)
- Novas opções de [sistema de coordenadas](/more-features/coordinate-systems) para compatibilidade com [coordenadas padrão do FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Suporte para arquivos de log do [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- Suporte para o formato de transmissão ao vivo do [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Equipes do FTC devem ter cuidado ao usar software experimental durante a temporada oficial. O suporte ao FTC para o AdvantageScope ainda está em desenvolvimento ativo.
:::

<div className="image-gallery">
  <img src="/img/whats-new/ftc-1.jpg" />
  <img src="/img/whats-new/ftc-2.jpg" />
  <img src="/img/whats-new/ftc-3.png" />
  <img src="/img/whats-new/ftc-4.png" />
  <img src="/img/whats-new/ftc-5.png" />
</div>

Várias bibliotecas de log/telemetria do FTC de terceiros suportam outros formatos compatíveis com o AdvantageScope, como WPILOG e RLOG. A documentação dessas bibliotecas pode ser encontrada nos respectivos projetos; os desenvolvedores do AdvantageScope não endossam/recomendam nenhuma solução de log do FTC em particular para uso com o AdvantageScope.

:::info
O AdvantageScope foi projetado para fornecer a melhor experiência quando usado junto com a estrutura WPILib e ferramentas de log associadas. Você pode encontrar problemas de compatibilidade ou recursos limitados ao usar soluções de log não oficiais.

Todos os recursos do AdvantageScope serão oficialmente suportados no FTC após a transição para o Systemcore para a temporada 2027-2028.
:::

## 🧮 Gráficos conscientes de unidades {#unit-aware-graphing}

A guia 📉 [Gráfico de linha](/tab-reference/line-graph/) foi redesenhada para ser totalmente consciente de unidades. Isso habilita vários novos recursos ao criar gráficos de campos numéricos:

- Rotulagem precisa dos eixos Y e exibições de valores
- Conversão rápida para unidades compatíveis (sem janelas pop-up)
- Conversão implícita de tipos de unidades compatíveis em um único eixo
- Exibição precisa de unidades [integradas e diferenciadas](/tab-reference/line-graph/#integration-and-differentiation)

A captura de tela abaixo mostra todos esses recursos em ação. Observe que o eixo esquerdo inclui campos com diferentes unidades de velocidade angular, e o eixo direito inclui valores que são diferenciados e exibidos em uma unidade não nativa (graus). Selecionar unidades também é mais fácil do que nunca, com opções de unidades compatíveis integradas diretamente no menu de controle de cada eixo.

_Mais informações sobre o suporte a unidades podem ser encontradas na [documentação](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.png" alt="Gráficos cientes de unidade" />

## 🏁 Downloads de logs mais rápidos {#faster-log-downloads}

O [download de logs do roboRIO](/overview/log-files/#downloading-from-the-robot) agora é **2 a 4x mais rápido** do que em versões anteriores. Isso é alcançado mudando para um novo protocolo (FTP) que permite ao roboRIO transferir dados de log com menor uso de CPU.

A tabela abaixo mostra a velocidade de transferência medida nas versões 2025 e 2026 do AdvantageScope enquanto conectado via Ethernet (largura de banda máxima de 100 Mb/s). Observe que o desempenho da versão 2025 é severamente impactado pela carga de CPU no roboRIO.

|                                                           | 2025 (SFTP) | 2026 (FTP) | Aceleração                                       |
| --------------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Alta carga de CPU<br /><sub>Código de robô complexo</sub> | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3,2x**</span> |
| Carga de CPU média<br /><sub>Código de robô normal</sub>  | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2,3x**</span> |
| Carga de CPU mínima<br /><sub>Sem código de robô</sub>    | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1,1x**</span> |

## 📁 Baixar logs de subpastas {#download-logs-from-subfolders}

A janela de download agora suporta o salvamento de logs armazenados em subpastas. Cada subpasta de logs pode ser baixada como um grupo, fornecendo uma abordagem simplificada para baixar logs gerados pela versão 2026 do [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) da CTRE (que usa subpastas como alternativa para não conseguir armazenar dados em um único arquivo de log).

<img src="/img/whats-new/subfolders.png" alt="Baixando subpastas de log" />

## 🌈 Novas opções de visualização {#new-visualization-options}

Várias novas opções de visualização são suportadas no 🗺️ [Campo 2D](/tab-reference/2d-field) e 👀 [Campo 3D](/tab-reference/3d-field):

- Uma variedade maior de cores de bumpers do robô agora está disponível no campo 2D, e cada objeto pode ser configurado com sua própria cor. Isso permite maior flexibilidade ao combinar fantasmas com múltiplos objetos de robô.
- Ao [visualizar mecanismos 2D no campo 3D](/tab-reference/3d-field/#2d-mechanisms), os mecanismos agora podem ser posicionados no plano YZ além do plano XZ. Isso permite uma visualização mais fácil de mecanismos complexos com movimento em múltiplos eixos.
- O campo 3D agora suporta antialiasing opcional para melhorar a qualidade das bordas renderizadas.

<img src="/img/whats-new/field-viz.jpg" alt="Novas visualizaciones de campo" />

## 🪵 Suporte a logs de CAN da REV Robotics {#rev-robotics-can-log-support}

Agora você pode abrir arquivos `.revlog` produzidos pelo [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) da REV Robotics diretamente no AdvantageScope. Esses arquivos registram sinais de CAN de dispositivos Spark Max e Spark Flex, oferecendo uma alternativa oficial à biblioteca [URCL](/more-features/urcl) do AdvantageScope.

Tanto o URCL quanto o `StatusLogger` oficial permanecerão disponíveis durante a temporada 2026 para garantir uma transição suave e fornecer paridade de recursos com as temporadas anteriores. Teremos mais detalhes a compartilhar sobre opções de log em 2027 e além em uma data posterior.

<img src="/img/whats-new/revlog.png" alt="Visualização do REVLOG" />

## 💿 Importação de arquivos CSV {#csv-file-imports}

Para uma visualização mais flexível de dados produzidos fora das estruturas de log de robôs, o AdvantageScope agora inclui suporte básico para importação de arquivos CSV. Verifique a [documentação](/overview/log-files/#csv-formatting) para mais detalhes sobre os formatos suportados e outras limitações.

<img src="/img/overview/log-files/export-2.png" alt="Dados CSV" />

## 🤩 Melhorias estéticas {#aesthetic-improvements}

A interface do AdvantageScope no Windows 11 foi atualizada para suportar uma barra lateral translúcida, que anteriormente era exclusiva das versões para macOS. Um ícone de aplicativo atualizado também está disponível para o macOS Tahoe com base no material Liquid Glass da Apple.

<img src="/img/whats-new/windows-ui.png" alt="Interface do usuário do Windows" />

## 📋 Menus simplificados {#streamlined-menus}

A barra de menus e os controles relacionados foram simplificados e reorganizados para tornar os controles mais acessíveis e consistentes em todas as plataformas. Recursos notáveis incluem:

- Alternância mais rápida entre fontes ao vivo (por exemplo, NetworkTables e [Diagnósticos do Phoenix](/overview/live-sources/phoenix-diagnostics)), sem a necessidade de abrir a janela de preferências.
- Clique com o botão direito na barra lateral para copiar rapidamente o nome de um campo (ou a chave completa do campo).
- Reorganização da janela de preferências, tornando as opções mais fáceis de encontrar rapidamente.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.png" />
  <img src="/img/whats-new/menus-2.png" />
  <img src="/img/prefs.png" />
</div>

## 🐛 Melhorias de estabilidade {#stability-improvements}

Esta versão inclui uma variedade de correções de erros e melhorias de estabilidade em todo o aplicativo. A lista completa pode ser encontrada no [histórico de alterações](https://github.com/Mechanical-Advantage/AdvantageScope/releases) da versão, mas algumas correções notáveis estão listadas abaixo:

- O desempenho do AdvantageScope ao transmitir dados por longos períodos foi consideravelmente melhorado, especialmente ao usar a guia de gráfico de linha.
- O AdvantageScope agora é mais tolerante a dados de log incomuns, incluindo arquivos de log grandes e valores de campo grandes.
- Várias falhas visuais foram corrigidas ao navegar pelos dados de log, especialmente ao usar filtros na guia de gráfico de linha.
- A ordenação de arquivos de log do AdvantageKit na janela de download foi corrigida; logs sem timestamps agora ficam na parte inferior da lista, semelhante a outros formatos.
- Na guia de campo 3D, as câmeras do robô com rotação diferente de zero no eixo de rolamento (roll) agora são visualizadas corretamente.
- A estabilidade do AdvantageScope XR foi melhorada, especialmente ao ser executado no iOS/iPadOS 26. Para instalações offline, verifique a App Store para atualizações disponíveis.
