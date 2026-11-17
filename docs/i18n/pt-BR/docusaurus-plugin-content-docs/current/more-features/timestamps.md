---
sidebar_position: 5
---

# ⏱️ Timestamps {#timestamps}

O AdvantageScope permite personalizar como os timestamps (marcas de tempo) aparecem em todas as visualizações, incluindo a linha do tempo, o 📉 [Gráfico de linha](/tab-reference/line-graph), a 🔢 [Tabela](/tab-reference/table) e o 💬 [Console](/tab-reference/console).

## Modos de exibição {#display-modes}

Você pode escolher o modo de exibição dos timestamps na janela de preferências:

- **Iniciar no zero (padrão):** Desloca todos os timestamps para que o primeiro registro do log comece em zero (`+0,0s`). Nesse modo, os valores vêm com um sinal `+` na frente para mostrar o tempo decorrido desde o início dos dados.
- **Original:** Mostra os timestamps exatamente com os valores numéricos gravados no arquivo de log, iguais aos usados pelo código do robô.

:::info
A partir da WPILib 2027, os timestamps passam a ser medidos pelo tempo desde a inicialização do Systemcore e da simulação. Como os timestamps brutos podem começar em números muito altos e difíceis de acompanhar, o modo **Iniciar no zero** torna a visualização bem mais intuitiva.
:::

## Sincronização de múltiplos logs {#multi-log-synchronization}

Quando você [abre vários arquivos de log ao mesmo tempo](/overview/log-files/#opening-logs), o AdvantageScope sincroniza e alinha os timestamps automaticamente. No modo **Iniciar no zero**, o ponto zero é definido pelo registro mais antigo entre todos os arquivos carregados. Já no modo **Original**, os timestamps seguem a base de tempo do primeiro log aberto, e os demais arquivos são deslocados para se alinharem a ele.

## Personalização {#customization}

Para mudar o modo de exibição dos timestamps, abra a janela de preferências em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS), ou use o atalho `Ctrl+,` / `Cmd+,`. Depois, altere a opção **Timestamps** para o modo que preferir.

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="450" />
