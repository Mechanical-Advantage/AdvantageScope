---
sidebar_position: 2
---

# Diagnósticos do Phoenix {#phoenix-diagnostics}

O AdvantageScope permite acompanhar ao vivo os sinais de dispositivos Phoenix 6 **sem precisar configurar nada no código do robô**. Assim, você pode depurar e ajustar dispositivos Phoenix com praticidade, usando a interface familiar e todos os recursos do AdvantageScope:

- Opções flexíveis de visualização, incluindo suporte a tabelas e análise estatística
- Suporte completo a gráficos com reconhecimento de unidades, com conversão implícita ou com um clique ([docs](/tab-reference/line-graph/units))
- Decodificação de valores enum para texto legível (modos de controle, status da ponte, estado do ímã do CANcoder, etc.)
- Tooltips integrados na barra lateral com a descrição e a unidade de cada sinal
- Organização hierárquica dos sinais, agrupados por barramento CAN, dispositivo e tipo de sinal
- Análise avançada com opções integradas de integração e diferenciação ([docs](/tab-reference/line-graph/#adjusting-axes))

:::tip
Para conectar, selecione "Diagnósticos do Phoenix" ao se conectar ao robô ou ao simulador pela barra de menus.
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="Captura de tela do gráfico de linha" />

A guia 📊 [Estatísticas](/tab-reference/statistics) do AdvantageScope também permite fazer análises avançadas dos sinais do Phoenix, com suporte a histogramas, intervalos personalizados e campos derivados para medições de erro relativo e absoluto:

<img src="/img/overview/live-sources/phoenix-2.webp" alt="Captura de tela de estatísticas" />

_A interface em inglês é exibida acima._

:::note
Este recurso pode apresentar problemas ocasionais após atualizações do Phoenix. Recomendamos manter o AdvantageScope na versão mais recente para evitar imprevistos. Se encontrar algum erro, [abra uma issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) para nos avisar.
:::
