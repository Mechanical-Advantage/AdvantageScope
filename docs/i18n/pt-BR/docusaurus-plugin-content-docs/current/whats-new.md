---
title: O que há de novo em 2026?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

A versão 2026 do AdvantageScope já está disponível! Confira a [documentação de instalação](/overview/installation) e o [changelog completo](https://github.com/Mechanical-Advantage/AdvantageScope/releases) para ver todos os detalhes. Este lançamento traz vários recursos novos de peso e melhorias por todo o aplicativo. Boa parte das novidades foi pensada para melhorar a experiência nos sistemas de controle atuais, ao mesmo tempo em que prepara uma transição tranquila para o [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) nas próximas temporadas.

**Sua opinião faz toda a diferença! Sugestões, pedidos de recursos e relatos de bugs são sempre bem-vindos na [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Experimental: Suporte ao FTC {#ftc-support}

Já se preparando para o suporte completo ao Systemcore na temporada 2027-2028, esta versão traz vários recursos para melhorar a compatibilidade com o sistema de controle atual do FIRST Tech Challenge:

- Campos do FTC e modelos de robôs no 🗺️ [Campo 2D](/tab-reference/2d-field) e no 👀 [Campo 3D](/tab-reference/3d-field)
- Novas opções de [sistema de coordenadas](/more-features/coordinate-systems) compatíveis com as [coordenadas padrão do FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Suporte a arquivos de log do [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- Suporte ao formato de transmissão ao vivo do [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Equipes de FTC devem ter cautela ao usar software experimental durante a temporada oficial. O suporte ao FTC no AdvantageScope ainda está em desenvolvimento ativo.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

Várias bibliotecas de log e telemetria de terceiros para FTC também oferecem outros formatos compatíveis com o AdvantageScope, como WPILOG e RLOG. Você encontra a documentação dessas bibliotecas nos respectivos projetos; os desenvolvedores do AdvantageScope não recomendam nem endossam nenhuma solução específica de log do FTC.

:::info
O AdvantageScope foi projetado para entregar a melhor experiência possível quando usado com o framework WPILib e suas ferramentas de log. Você pode enfrentar problemas de compatibilidade ou limitações ao usar soluções de log não oficiais.

Todos os recursos do AdvantageScope terão suporte oficial no FTC após a transição para o Systemcore na temporada 2027-2028.
:::

## 🧮 Gráficos cientes de unidade {#unit-aware-graphing}

A guia 📉 [Gráfico de linha](/tab-reference/line-graph/) foi reformulada para ser totalmente ciente de unidade. Isso libera vários recursos novos ao plotar campos numéricos:

- Rótulos precisos nos eixos Y e na exibição dos valores
- Conversão rápida para unidades compatíveis (sem janelas pop-up)
- Conversão automática entre tipos de unidades compatíveis em um mesmo eixo
- Exibição correta de unidades [integradas e diferenciadas](/tab-reference/line-graph/#integration-and-differentiation)

A captura de tela abaixo mostra tudo isso funcionando na prática. Repare que o eixo esquerdo reúne campos com diferentes unidades de velocidade angular, enquanto o eixo direito mostra valores diferenciados e exibidos em uma unidade não nativa (graus). Escolher unidades também ficou muito mais fácil, com as opções compatíveis integradas direto no menu de controle de cada eixo.

_Você encontra mais detalhes sobre o suporte a unidades na [documentação](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Gráficos cientes de unidade" />

_A interface em inglês é exibida acima._

## 🏁 Downloads de logs mais rápidos {#faster-log-downloads}

[Baixar logs do roboRIO](/overview/log-files/#downloading-from-the-robot) agora está **2 a 4x mais rápido** do que nas versões anteriores. Isso foi possível com a troca para um novo protocolo (FTP), que permite ao roboRIO transferir os dados de log exigindo bem menos da CPU.

A tabela abaixo compara a velocidade de transferência medida nas versões 2025 e 2026 do AdvantageScope via cabo Ethernet (largura de banda máxima de 100 Mb/s). Repare como o desempenho da versão 2025 cai bastante quando a CPU do roboRIO está carregada.

|                                                           | 2025 (SFTP) | 2026 (FTP) | Ganho                                            |
| --------------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Alta carga de CPU<br /><sub>Código de robô complexo</sub> | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3,2x**</span> |
| Carga de CPU média<br /><sub>Código de robô normal</sub>  | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2,3x**</span> |
| Carga de CPU mínima<br /><sub>Sem código de robô</sub>    | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1,1x**</span> |

## 📁 Baixar logs de subpastas {#download-logs-from-subfolders}

A janela de download agora permite salvar logs guardados dentro de subpastas. Cada subpasta pode ser baixada de uma vez como um grupo, o que facilita muito o download dos logs gerados pela versão 2026 do [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) da CTRE (que usa subpastas para contornar a limitação de não gravar tudo em um único arquivo de log).

<img src="/img/whats-new/subfolders.webp" alt="Baixando subpastas de log" height="450" />

## 🌈 Novas opções de visualização {#new-visualization-options}

O 🗺️ [Campo 2D](/tab-reference/2d-field) e o 👀 [Campo 3D](/tab-reference/3d-field) ganharam várias opções novas de visualização:

- Agora há muito mais cores disponíveis para os bumpers do robô no campo 2D, e você pode escolher uma cor diferente para cada objeto. Isso dá mais liberdade ao combinar fantasmas com vários objetos de robô.
- Ao [visualizar mecanismos 2D no campo 3D](/tab-reference/3d-field/#2d-mechanisms), além do plano XZ, agora você também pode posicionar os mecanismos no plano YZ. Assim fica bem mais fácil enxergar mecanismos complexos que se movem em múltiplos eixos.
- O campo 3D agora conta com antialiasing opcional para deixar as bordas renderizadas mais suaves.

<img src="/img/whats-new/field-viz.jpg" alt="Novas visualizações de campo" />

## 🪵 Suporte a logs de CAN da REV Robotics {#rev-robotics-can-log-support}

Agora você pode abrir arquivos `.revlog` gerados pelo [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) da REV Robotics diretamente no AdvantageScope. Esses arquivos registram sinais de CAN dos dispositivos Spark Max e Spark Flex, oferecendo uma alternativa oficial à biblioteca [URCL](/more-features/urcl) do AdvantageScope.

Tanto a URCL quanto o `StatusLogger` oficial continuarão disponíveis durante a temporada 2026 para garantir uma transição tranquila e manter os mesmos recursos das temporadas anteriores. Mais adiante, compartilharemos mais detalhes sobre as opções de log para 2027 em diante.

<img src="/img/whats-new/revlog.webp" alt="Visualização do REVLOG" />

## 💿 Importação de arquivos CSV {#csv-file-imports}

Para dar mais flexibilidade na visualização de dados gerados fora dos frameworks de log de robôs, o AdvantageScope agora tem suporte básico à importação de arquivos CSV. Confira a [documentação](/overview/log-files/#csv-formatting) para ver os formatos aceitos e outras limitações.

<img src="/img/overview/log-files/export-2.webp" alt="Dados CSV" />

## 🤩 Melhorias visuais {#aesthetic-improvements}

A interface do AdvantageScope no Windows 11 foi atualizada para trazer a barra lateral translúcida, que antes só existia no macOS. Também há um novo ícone do aplicativo para o macOS Tahoe, baseado no estilo Liquid Glass da Apple.

<img src="/img/whats-new/windows-ui.webp" alt="Interface do usuário no Windows" />

## 📋 Menus simplificados {#streamlined-menus}

A barra de menus e os controles relacionados foram simplificados e reorganizados para ficarem mais acessíveis e consistentes em todas as plataformas. Entre os destaques:

- Troca mais rápida entre fontes ao vivo (como NetworkTables e [Diagnósticos do Phoenix](/overview/live-sources/phoenix-diagnostics)), sem precisar abrir a janela de preferências.
- Clique com o botão direito na barra lateral para copiar rapidamente o nome de um campo (ou a chave completa do campo).
- Janela de preferências reorganizada para você encontrar cada opção com mais rapidez.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_pt-BR.webp" />
</div>

## 🐛 Melhorias de estabilidade {#stability-improvements}

Esta versão traz várias correções de bugs e melhorias de estabilidade em todo o aplicativo. A lista completa está no [changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases) da versão, mas alguns destaques incluem:

- Grande melhoria de desempenho ao transmitir dados ao vivo por longos períodos, especialmente na guia de gráfico de linha.
- Maior tolerância a dados de log fora do comum, incluindo arquivos muito grandes e campos com valores extensos.
- Correção de várias falhas visuais ao navegar pelos dados do log, principalmente ao usar filtros na guia de gráfico de linha.
- Correção na ordenação dos arquivos de log do AdvantageKit na janela de download: logs sem timestamps agora ficam no final da lista, como nos demais formatos.
- Na guia de campo 3D, câmeras do robô com rotação diferente de zero no eixo de rolagem (roll) agora são exibidas corretamente.
- Melhoria na estabilidade do AdvantageScope XR, especialmente no iOS/iPadOS 26. Para instalações offline, confira se há atualizações disponíveis na App Store.
