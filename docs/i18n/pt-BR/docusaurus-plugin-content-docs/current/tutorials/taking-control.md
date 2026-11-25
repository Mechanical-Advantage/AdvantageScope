---
sidebar_position: 3
---

# 🕹️ Assumindo o controle: DS e joysticks

Entender as entradas do piloto e a integridade da comunicação é fundamental ao depurar problemas em campo. O AdvantageScope oferece integração direta com a [FIRST Driver Station](https://docs.wpilib.org/pt/latest/docs/software/firstdriverstation), permitindo monitorar diagnósticos ao vivo, inspecionar logs da Driver Station e visualizar entradas de controles.

Neste tutorial, você aprenderá a:

- Acessar o AdvantageScope diretamente pela **FIRST Driver Station**.
- Conectar-se aos diagnósticos ao vivo da Driver Station.
- Comparar e sincronizar **logs do robô** com **logs da Driver Station**.
- Visualizar saídas de console e mensagens de erro na guia **💬 Console**.
- Visualizar entradas de joysticks e layouts de controles na guia **🎮 Joysticks**.

## 1. Acessando o AdvantageScope pela FIRST Driver Station

O 💡 [AdvantageScope Lite](/more-features/advantagescope-lite) está integrado diretamente na FIRST Driver Station. Ele pode ser acessado clicando no ícone ⚙️ e depois em "Open Log Viewer in Browser".

<img src="/img/tutorials/taking-control-1.webp" alt="O botão &quot;Open Log Viewer In Browser&quot; na FIRST Driver Station" />

_A interface em inglês é exibida acima._

## 2. Conectando-se à Driver Station ao vivo

Quando executado no mesmo notebook que a FIRST Driver Station, o aplicativo para desktop do AdvantageScope também pode transmitir telemetria e diagnósticos ao vivo sobre o estado da Driver Station:

1. Abra a FIRST Driver Station e o AdvantageScope.
2. No menu superior, selecione `Arquivo` > `Conectar à Driver Station`.
3. O AdvantageScope se conectará ao serviço local da Driver Station para transmitir em tempo real o estado da partida, tensão da bateria, estados dos joysticks, etc.
4. Abra a guia 📉 [Gráfico de linha](/tab-reference/line-graph) ou 🔢 [Tabela](/tab-reference/table) para visualizar diagnósticos ao vivo da DS.

:::tip
Você também pode usar o atalho de teclado `Ctrl+Option+Shift+K` (macOS) ou `Ctrl+Alt+Shift+K` (Windows/Linux) para se conectar rapidamente à Driver Station como fonte ao vivo.
:::

## 3. Logs da Driver Station vs. logs do robô

Ao diagnosticar o comportamento do robô após uma partida ou sessão de treino, há dois tipos principais de log a considerar:

| Tipo de log                | Fonte                           | Dados gravados                                                                                                                                                                                     |
| :------------------------- | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Logs do robô**           | Systemcore via `DataLogManager` | Telemetria de alta frequência (50+ Hz), estado do robô, estado dos joysticks, leituras de sensores, correntes de motores, estados de controladores PID, estimativas de pose e dados de mecanismos. |
| **Logs da Driver Station** | Notebook da Driver Station      | Tempo de ida e volta na rede (latência), % de perda de pacotes, ping do rádio, tensão da bateria, % de CPU do controlador do robô, dados do console, estado do robô e estado dos joysticks.        |

:::important Logs do robô são geralmente preferíveis
Como os **logs do robô** gravam telemetria rica e de alta frequência diretamente na origem, eles são geralmente preferíveis para investigar o comportamento do robô, malhas de controle e trajetórias autônomas. No entanto, os **logs da DS** capturam eventos externos críticos de rede e de partida que o robô não consegue medir sozinho.

Os dados de joystick são capturados em **ambos os logs**, conforme mostrado [abaixo](#6-visualizing-joysticks).
:::

## 4. Mesclando e sincronizando múltiplos logs

O AdvantageScope permite abrir e sincronizar logs de múltiplas fontes em uma única linha do tempo:

1. Abra o arquivo de log do seu robô usando `Arquivo` > `Abrir log(s)...` (ou arraste o arquivo `.wpilog` diretamente para o AdvantageScope).
2. Na barra de menus, selecione `Arquivo` > `Adicionar novo(s) log(s)...` e escolha o log correspondente da Driver Station.
3. O AdvantageScope alinhará automaticamente ambos os logs em uma linha do tempo sincronizada! Os campos de cada log ficam organizados em tabelas distintas (por exemplo, `Log0` e `Log1`).
4. Agora você pode sobrepor telemetria do robô (como corrente de motor ou estimativas de pose) diretamente aos sinais da Driver Station (como perda de pacotes ou tensão da bateria) no 📉 [Gráfico de linha](/tab-reference/line-graph) para ver se um comportamento inesperado do robô coincidiu com uma queda de rádio ou brownout.

<img src="/img/overview/log-files/open-file-1.webp" alt="Abrindo arquivos de log salvos no AdvantageScope." />

_A interface em inglês é exibida acima._

## 5. Visualizando dados do console

A guia 💬 [Console](/tab-reference/console) permite visualizar saídas de texto e logs de erro impressos pelo robô ou pela Driver Station. Os dados do console podem ser salvos em qualquer um dos arquivos de log:

- **Logs do robô:** O `DataLogManager` da WPILib grava automaticamente a saída de console do robô.
- **Logs da Driver Station:** Na DS, a saída de console e as mensagens de eventos do sistema são salvas no campo `DS:/Dscomm/Console`.

Para visualizar os dados do console:

1. Clique no botão **+** na barra de guias e selecione **Console**.
2. Na barra lateral, arraste o campo do console (`DS:/Dscomm/Console` ou `messages`) para a visualização principal.
3. Cada linha representa uma mensagem de log com seu timestamp. Clique em qualquer mensagem para fazer a linha do tempo sincronizada em todas as guias abertas saltar para aquele momento exato!
4. Use a caixa "Filtrar" (ou pressione `Ctrl+F` / `Cmd+F`) para buscar mensagens específicas, ou clique no ícone de paleta de cores para alternar o destaque para avisos e erros.

<img src="/img/tab-reference/console-1.webp" alt="Guia Console exibindo mensagens de log." />

_A interface em inglês é exibida acima._

## 6. Visualizando joysticks {#6-visualizing-joysticks}

A guia 🎮 [Joysticks](/tab-reference/joysticks) oferece uma representação visual em tempo real de até 6 controles, exibindo movimentos de eixos, gatilhos, POVs e pressionamentos de botões em layouts realistas de controles. Para garantir que as entradas dos joysticks sejam gravadas no arquivo de log do robô, inicialize `DriverStation.startDataLog()` no construtor `Robot` junto com o `DataLogManager`, conforme mostrado em 👋 [Olá, telemetria!](/tutorials/hello-telemetry).

1. Clique no botão **+** na barra de guias superior e selecione **Joysticks**.
2. Na tabela na parte inferior da guia, associe cada ID de joystick (0 a 5) ao layout apropriado (por exemplo, **Controle Xbox**, **Controle PS4** ou **Joystick genérico**).
3. Ao percorrer um arquivo de log ou transmitir dados ao vivo da Driver Station, os botões acenderão e os analógicos se moverão em sincronia com as ações do piloto!

<img src="/img/tab-reference/joysticks-1.webp" alt="Guia Joysticks exibindo pressionamentos ativos de botões do controle e posições dos analógicos." />

_A interface em inglês é exibida acima._

## O que vem a seguir?

Parabéns! Você concluiu a série principal de tutoriais do AdvantageScope. Agora você sabe como:

- Configurar telemetria, conectar-se a fluxos ao vivo e visualizar gráficos e tabelas em **👋 [Olá, telemetria!](/tutorials/hello-telemetry)**.
- Visualizar odometria 2D/3D, trajetórias e mecanismos em **🤖 [Para o campo](/tutorials/to-the-field)**.
- Transmitir diagnósticos da Driver Station, mesclar logs de múltiplas fontes e reproduzir entradas de joysticks em **🕹️ [Assumindo o controle](/tutorials/taking-control)**.

Continue explorando as ferramentas e recursos avançados do AdvantageScope:

- **📂 [Arquivos de log](/overview/log-files):** Saiba mais sobre formatos de log suportados, exportação de dados e downloads em lote.
- **🛜 [Fontes ao vivo](/overview/live-sources):** Guia detalhado sobre como conectar a fontes ao vivo, incluindo o modo de ajuste.
- **[Referência de guias](/category/tab-reference):** Guias de referência sobre os recursos de cada tipo de visualização.
- **[Mais recursos](/category/more-features):** Documentação e teoria sobre recursos adicionais do AdvantageScope.
