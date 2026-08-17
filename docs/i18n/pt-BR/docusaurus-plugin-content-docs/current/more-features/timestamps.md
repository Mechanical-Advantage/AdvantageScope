---
sidebar_position: 5
---

# ⏱️ Timestamps {#timestamps}

O AdvantageScope suporta opções personalizáveis de exibição de timestamps (carimbos de data/hora) em todas as visualizações, incluindo a linha do tempo, o 📉 [Gráfico de linha](/tab-reference/line-graph), a 🔢 [Tabela](/tab-reference/table) e o 💬 [Console](/tab-reference/console).

## Modos de exibição {#display-modes}

O modo de exibição de timestamps pode ser configurado na janela de preferências:

- **Iniciar no zero (Padrão):** Desloca todos os timestamps para que os dados mais antigos do log comecem no zero (`+0.0s`). Os timestamps exibidos neste modo são prefixados com um símbolo `+` para indicar o tempo decorrido desde o início dos dados.
- **Original:** Exibe os timestamps usando seus valores numéricos originais conforme registrados no arquivo de log, correspondendo aos valores exatos usados pelo código do robô.

:::info
A partir do WPILib 2027, os timestamps são medidos usando o tempo desde a inicialização do dispositivo no Systemcore e na simulação. Como os timestamps brutos podem começar em números arbitrariamente grandes, a opção **Iniciar no zero** é fornecida como uma alternativa de visualização mais intuitiva.
:::

## Sincronização de múltiplos logs {#multi-log-synchronization}

Quando [vários arquivos de log são abertos simultaneamente](/overview/log-files/#opening-logs), o AdvantageScope sincroniza e alinha seus timestamps. No modo **Iniciar no zero**, o ponto zero é definido para o timestamp mais antigo entre todos os arquivos carregados. No modo **Original**, os timestamps são exibidos usando a base de tempo do primeiro log aberto, com quaisquer logs adicionais deslocados para se alinharem a ele.

## Personalização {#customization}

Para alterar o modo de exibição de timestamps, abra a janela de preferências clicando em `App` > `Mostrar Preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS), ou pressionando `Ctrl+,` / `Cmd+,`. Atualize a configuração **Timestamps** para a opção desejada.

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="350" />
