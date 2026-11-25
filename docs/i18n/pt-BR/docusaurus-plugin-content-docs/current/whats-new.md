---
title: O que há de novo em 2027?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

A versão 2027 do AdvantageScope já está disponível, trazendo suporte completo ao Systemcore junto com mais de **100 novos recursos e atualizações** em todo o aplicativo. Confira a [documentação de instalação](/overview/installation) e o [registro de alterações completo](https://github.com/Mechanical-Advantage/AdvantageScope/releases) para mais detalhes. Esta página destaca as principais novidades e melhorias desta versão.

**Valorizamos o seu feedback! Comentários, solicitações de recursos e relatos de bugs são bem-vindos na [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Compatibilidade com o Systemcore {#systemcore-compatibility}

O AdvantageScope 2027 foi desenvolvido para funcionar perfeitamente com o novo controlador de robô Systemcore e a WPILib 2027:

- O endereço padrão do robô agora é `robot.local`, permitindo conectar ao vivo ou baixar logs sem configurar um número de equipe. Os endereços USB e Wi-Fi do Systemcore também podem ser selecionados na barra de menus.
- O [download de logs](/overview/log-files#downloading-from-the-robot) agora oferece suporte a SFTP para o Systemcore, além do download de logs legado do roboRIO.
- Adicionado o sistema de coordenadas [Centro/vermelho](/more-features/coordinate-systems#center-red) usado pelos campos da FRC a partir de 2027 e campos da FTC a partir de 2027-2028.
- Adicionado suporte às APIs `Telemetry` e `Tunables` da WPILib 2027, cores de alerta atualizadas e uma nova [preferência de exibição de timestamp](/more-features/timestamps) para manter os timestamps do Systemcore fáceis de ler.
- Um novo modo ao vivo [Diagnósticos do Systemcore](/overview/live-sources) conecta-se diretamente ao servidor NetworkTables integrado do Systemcore para monitorar o estado do robô e a E/S de hardware sem necessidade de código do usuário.

## 💡 AdvantageScope Lite {#advantagescope-lite}

O [AdvantageScope Lite](/more-features/advantagescope-lite) leva as ferramentas de visualização e análise do AdvantageScope diretamente para o seu navegador. Ele pode ser acessado tanto pela interface web do Systemcore quanto dentro da FIRST Driver Station, **sem necessidade de instalação**.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="Demonstração do AdvantageScope Lite" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

O AdvantageScope integra-se perfeitamente com a nova [FIRST Driver Station](https://docs.wpilib.org/pt/latest/docs/software/firstdriverstation) para agilizar o diagnóstico de partidas:

- O [AdvantageScope Lite](/more-features/advantagescope-lite) pode ser acessado diretamente no menu de configurações da FIRST Driver Station para analisar arquivos WPILOG produzidos pela DS.
- Use o aplicativo para desktop para transmitir em tempo real o estado da partida, métricas de comunicação, tensão da bateria e entradas de joysticks de uma Driver Station local sem nenhuma configuração.
- Ao abrir um arquivo `.wpilog` da Driver Station no desktop, o AdvantageScope pergunta se você deseja abrir uma janela dedicada pré-configurada com guias para saída do console, métricas de comunicação, energia, uso de CPU e joysticks ([documentação](/overview/log-files#driver-station-layout)). Esse layout também é usado por padrão no AdvantageScope Lite para a Driver Station.
- Visualize logs de console da Driver Station na guia 💬 [Console](/tab-reference/console) com destaque automático de avisos/erros e suporte completo a [sequências de escape ANSI](/tab-reference/console#ansi-formatting) (cores e estilos de texto).

<img src="/img/tutorials/taking-control-1.webp" alt="Abrindo o AdvantageScope Lite a partir da FIRST Driver Station" />

_A interface em inglês é exibida acima._

## 🌐 Suporte a idiomas {#language-support}

O AdvantageScope agora está disponível em **14 idiomas** no aplicativo para desktop, no site de documentação, nos aplicativos móveis e no AdvantageScope Lite: inglês (EUA), espanhol (América Latina), francês, holandês, português (Brasil), romeno, turco, russo, cazaque, hebraico, árabe, hindi, chinês simplificado e chinês tradicional.

:::info
As traduções são um trabalho em andamento criado com o apoio de inteligência artificial e colaboradores da comunidade, e **podem incluir frases pouco naturais ou imprecisões**. Obrigado às equipes que já ajudaram a revisar e aprimorar essas traduções! Consulte a página 🌐 [Suporte a idiomas](/overview/language-support) para obter detalhes sobre nosso processo de tradução e como enviar feedback.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="Guia Gráfico de linha em chinês simplificado" />

## 📖 Novos tutoriais e documentação {#new-tutorials-and-documentation}

A documentação foi ampliada com uma nova [série de tutoriais](/category/tutorials) em três partes, projetada para ajudar as equipes a começar com a WPILib 2027 e o AdvantageScope:

1. **👋 [Olá, telemetria!](/tutorials/hello-telemetry):** Configurando o `DataLogManager` e a API `Telemetry`, conectando ao vivo e analisando dados com gráficos de linha, tabelas e estatísticas.
2. **🤖 [Para o campo: visualização do robô](/tutorials/to-the-field):** Publicando poses 2D/3D, trajetórias e objetos `Mechanism2d` em campos da FRC e FTC.
3. **🕹️ [Assumindo o controle: DS e joysticks](/tutorials/taking-control):** Transmitindo diagnósticos ao vivo da Driver Station, sincronizando logs do robô e da DS, visualizando a saída do console e exibindo entradas de controles.

Os exemplos de código em toda a documentação também foram atualizados com cobertura completa da API `Telemetry` da WPILib em várias linguagens de programação.

<img src="/img/tutorials/to-the-field-4.webp" alt="Visualização do campo 3D do tutorial Para o campo" />

_A interface em inglês é exibida acima._

## 📱 AdvantageTune {#advantagetune}

O AdvantageTune é um novo aplicativo independente para iPhone e iPad que oferece uma experiência leve de ajuste móvel para complementar o AdvantageScope. Você pode visualizar e modificar tópicos do [NetworkTables](https://docs.wpilib.org/pt/stable/docs/software/networktables/index.html) ao vivo (incluindo primitivos, arrays, structs da WPILib e Protobufs) diretamente do seu celular, facilitando a participação de todos no ajuste do código do robô.

Tanto o AdvantageTune quanto o AdvantageScope simplificam o processo de exportar valores ajustados de volta para o código do robô, com botões para salvar todos os valores ajustados em um arquivo de texto para facilitar o compartilhamento ([documentação](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store_pt-BR.svg" alt="App Store" />](https://apps.apple.com/br/app/advantagetune/id6811453643)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="Visualização de navegação do AdvantageTune" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="Edição de tópicos no AdvantageTune" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="Edição de structs no AdvantageTune" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="Lista de valores ajustados no AdvantageTune" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="Busca e filtro no AdvantageTune" />
</div>

_A interface em inglês é exibida acima._

## 🪐 Logging universal com WPILOG {#wpilog-universal-logging}

Com o [logging universal](/more-features/universal-logging), um único arquivo WPILOG agora pode servir como um contêiner universal para vários fluxos e formatos de log, incluindo logs de dispositivos específicos de fabricantes, dados CSV e arquivos WPILOG filhos. O logging universal substitui o URCL por uma abordagem flexível e independente de fabricante: os dados de cada fonte são sincronizados automaticamente e mesclados em uma única árvore unificada na barra lateral. Consulte a [documentação do logging universal](/more-features/universal-logging#experimental-vendor-logging) para obter detalhes sobre a captura de logs de fabricantes no AdvantageKit e na WPILib (em breve).

<img src="/img/more-features/universal-logging-1.webp" alt="Um arquivo WPILOG mostrando vários logs de fabricantes na barra lateral" />

_A interface em inglês é exibida acima._

## 🗺️ Melhorias nas guias de campo {#field-tab-improvements}

Várias melhorias de usabilidade foram adicionadas às guias 🗺️ [Campo 2D](/tab-reference/2d-field) e 👀 [Campo 3D](/tab-reference/3d-field):

- Mova e dê zoom pelo campo 2D, ou clique com o botão direito para travar a câmera seguindo a posição e a rotação do robô ([documentação](/tab-reference/2d-field#camera-controls)).
- Adicionada uma opção para esmaecer fantasmas 2D e 3D quando os campos não forem atualizados recentemente (útil para renderização de poses de visão).
- Adicionadas linhas de grade de placas nos campos FTC 2D e 3D para facilitar a referência espacial.
- O AdvantageScope agora lembra se um campo FRC ou FTC foi usado por último ao abrir novas guias de campo 2D ou 3D.

<img src="/img/tab-reference/2d-field-1.webp" alt="Visão geral da guia Campo 2D" />

_A interface em inglês é exibida acima._

## 📉 Melhorias no gráfico de linha {#line-graph-improvements}

O 📉 [Gráfico de linha](/tab-reference/line-graph) e a linha do tempo incluem vários refinamentos visuais para uma análise mais clara:

- Ativar "Mostrar modo do robô" agora exibe uma barra codificada por cores para os períodos autônomo, teleoperado, utility e desabilitado.
- Gráficos no estilo de pontos dimensionam automaticamente o tamanho dos pontos para melhor visibilidade em qualquer nível de zoom.
- Dicas úteis aparecem no gráfico de linha e na linha do tempo para orientar novos usuários sobre gestos de rolagem e zoom.
- Melhorada a renderização e legibilidade de valores grandes de timestamp na linha do tempo e nos eixos do gráfico de linha.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Sobreposição do modo do robô codificada por cores no gráfico de linha" />

_A interface em inglês é exibida acima._

## 🤝 Melhorias de acessibilidade {#accessibility-enhancements}

O AdvantageScope 2027 inclui várias atualizações para tornar o aplicativo mais acessível:

- Adicionada navegação por teclado com Tab para todas as entradas e dicas de ferramentas descritivas para todos os controles do aplicativo.
- O AdvantageScope agora respeita as configurações do sistema operacional para "reduzir transparência" e "reduzir movimento".
- Indicadores booleanos na barra lateral agora distinguem estados sem depender apenas da cor.

## 🥔 Novos tipos de unidades {#new-unit-types}

Os [gráficos cientes de unidade](/tab-reference/line-graph/units) do AdvantageScope foram expandidos com tipos de unidades e opções de análise adicionais:

- Potência (watts, cavalos de potência, etc.)
- Razões (adimensional, porcentagem)
- Temperatura em Kelvin
- Energia de batata
- Ortografia de unidades em inglês britânico (por exemplo, `metres`)
- Sufixos para a biblioteca de unidades da WPILib

## 🧱 Melhorias de estabilidade {#stability-improvements}

Esta versão inclui inúmeras correções de bugs, otimizações de desempenho e melhorias de estabilidade em todo o aplicativo. A lista completa pode ser encontrada no [registro de alterações](https://github.com/Mechanical-Advantage/AdvantageScope/releases), com destaques abaixo:

- Os lançamentos oficiais para Windows agora são assinados digitalmente, reduzindo a frequência de avisos do SmartScreen durante a instalação.
- Desempenho de carregamento e plotagem de logs significativamente aprimorado, especialmente ao trabalhar com logs Hoot (`.hoot`) e grandes arrays de structs.
- Corrigido o tratamento de timestamps ao visualizar logs do AdvantageKit junto com fontes de dados de alta frequência.
- Melhorado o algoritmo de sincronização de timestamps de múltiplos logs ao alinhar logs de várias fontes.
- Melhorada a confiabilidade de conexão para [Diagnósticos do Phoenix](/overview/live-sources/phoenix-diagnostics).
- Corrigidos problemas de interface na barra de menus em janelas destacadas e no pop-up de gravação do [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- Refinados textos e redação da interface em todo o aplicativo para maior clareza.
