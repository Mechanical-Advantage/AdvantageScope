---
sidebar_position: 2
---

# Diagnósticos do Phoenix {#phoenix-diagnostics}

O AdvantageScope suporta transmissão ao vivo de sinais de dispositivos Phoenix 6 **sem nenhuma configuração no código do usuário**. Isso permite fácil depuração e ajuste de dispositivos Phoenix usando a interface familiar e o poder total do AdvantageScope:

- Opções de visualização flexíveis, incluindo suporte a múltiplos eixos e campos discretos
- Suporte completo a gráficos conscientes de unidades, incluindo conversão de unidades implícita e com um clique ([docs](/tab-reference/line-graph/units))
- Pré-visualização ao vivo de todos os valores na barra lateral para fácil navegação
- Suporte para plotagem e pré-visualização de sinais de múltiplos dispositivos simultaneamente
- Decodificação de valores enum como strings legíveis por humanos (modos de controle, status de ponte, estado do ímã do CANcoder, etc.)
- Dicas de ferramentas integradas na barra lateral com descrições e unidades para cada sinal
- Organização hierárquica de sinais, agrupados por barramento CAN, dispositivo e tipo de sinal
- Análise de dados avançada com opções de integração e diferenciação integradas ([docs](/tab-reference/line-graph/#adjusting-axes))

:::tip
Para conectar, selecione "Diagnósticos do Phoenix" ao se conectar ao robô ou simulador na barra de menus.
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="Captura de tela do gráfico de linhas" />

A guia 📊 [Estatísticas](/tab-reference/statistics) do AdvantageScope também permite análise avançada de sinais do Phoenix, com suporte para histogramas, intervalos personalizados e campos derivados para medições de erro relativo e absoluto:

<img src="/img/overview/live-sources/phoenix-2.webp" alt="Captura de tela de estatísticas" />

:::note
Este recurso pode ocasionalmente apresentar problemas como resultado de atualizações do Phoenix. Recomendamos usar a versão mais recente do AdvantageScope para minimizar problemas. Caso contrário, por favor [abra um problema](https://github.com/Mechanical-Advantage/AdvantageScope/issues) para nos informar sobre quaisquer problemas.
:::
