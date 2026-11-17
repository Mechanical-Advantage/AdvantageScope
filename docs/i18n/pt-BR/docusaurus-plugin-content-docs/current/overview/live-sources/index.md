# 🛜 Fontes ao vivo {#live-sources}

Todas as visualizações do AdvantageScope foram feitas para receber dados ao vivo de um robô ou simulador, além de abrir arquivos de log. Esta seção explica como se conectar a fontes de dados em tempo real. O AdvantageScope oferece suporte às seguintes fontes ao vivo:

- **NetworkTables:** É o protocolo de rede principal da WPILib. Veja mais detalhes na [documentação da WPILib](https://docs.wpilib.org/pt/stable/docs/software/networktables/index.html).
- **NetworkTables (AdvantageKit):** Modo voltado para códigos de robô que usam o AdvantageKit, publicando na tabela `AdvantageKit` do NetworkTables.
- **Diagnósticos do Systemcore:** Conecta-se ao servidor NetworkTables integrado do Systemcore OS, trazendo dados de diagnóstico como o estado do robô e I/O dos dispositivos.
- **Diagnósticos do Phoenix:** Usa HTTP para se conectar a um [servidor de diagnósticos](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) do Phoenix, permitindo transmitir dados de dispositivos CAN da CTRE com [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). É parecido com o [recurso de plotagem](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) do Phoenix Tuner. Veja [esta página](/overview/live-sources/phoenix-diagnostics) para saber mais.
- **Servidor RLOG:** Protocolo suportado pelo AdvantageKit como alternativa ao NetworkTables. Por padrão, a conexão usa a porta 5800.
- **FTC Dashboard:** Integra-se a robôs de FTC que publicam dados no [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
O AdvantageScope também pode se conectar à FIRST Driver Station para exibir dados de diagnóstico quando estiver rodando no mesmo computador que o aplicativo da DS. Nenhuma configuração extra é necessária (veja as instruções abaixo).
:::

## Iniciando a conexão {#starting-the-connection}

Para iniciar a conexão ao vivo, escolha uma das opções abaixo:

- **Robô:** Clique em `Arquivo` > `Conectar ao robô` > `Padrão` ou selecione uma fonte ao vivo específica
- **Simulador:** Clique em `Arquivo` > `Conectar ao simulador` > `Padrão` ou selecione uma fonte ao vivo específica
- **Driver Station:** Clique em `Arquivo` > `Conectar à Driver Station`

O título da janela mostra o endereço IP e o texto "Buscando" até a conexão ser estabelecida. Se a conexão cair, o AdvantageScope tenta reconectar automaticamente usando as mesmas configurações.

## Visualizando dados ao vivo {#viewing-live-data}

Quando você se conecta a uma fonte ao vivo, o AdvantageScope trava todas as guias no instante atual por padrão. Visualizações como o 📉 [Gráfico de linha](/tab-reference/line-graph) e a 🔢 [Tabela](/tab-reference/table) rolam automaticamente, enquanto outras, como o campo e os joysticks, exibem os valores atuais de cada campo. Clicar no botão da seta vermelha na barra de navegação ativa ou desativa essa trava, permitindo voltar no tempo e rever dados passados.

<img src="/img/overview/live-sources/open-live-1.webp" alt="Botão de bloquear/desbloquear ao vivo" />

:::tip
Rolar para a esquerda no gráfico de linha ou na linha do tempo destrava a visualização do instante atual, e rolar tudo para a direita trava novamente.
:::

## Configuração {#configuration}

Abra a janela de preferências clicando em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS).

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="450" />

### Endereço do robô {#robot-address}

Informe o endereço do robô usando um nome de host (ex.: `robot.local`) ou um endereço IP (ex.: `10.TE.AM.2`), conforme descrito na [documentação da WPILib](https://docs.wpilib.org/pt/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Ao se conectar ao Systemcore via USB ou pelo ponto de acesso Wi-Fi integrado, clique em `Arquivo` > `Usar endereço USB do Systemcore`/`Usar endereço Wi-Fi do Systemcore` para usar temporariamente o endereço IP estático correto.

### Modo ao vivo {#live-mode}

Quando o NetworkTables for a fonte ao vivo, você pode escolher entre dois modos:

- **Baixa largura de banda (Padrão):** O AdvantageScope pede ao servidor apenas os dados dos campos que estão sendo usados no momento. Dados publicados antes de você selecionar um campo não ficam disponíveis. Esse modo é **altamente recomendado** em redes com pouca largura de banda ou quando há muitos campos sendo publicados.
- **Logging:** O AdvantageScope pede os dados de todos os campos, estejam eles sendo usados ou não. Assim, você pode pausar a transmissão ao vivo e consultar outros campos retroativamente. Esse modo ajuda bastante durante o desenvolvimento, mas **NÃO deve ser usado quando a largura de banda for limitada**.

### Descartar dados ao vivo {#discard-live-data}

Durante uma conexão ao vivo, os dados ficam salvos localmente para que você possa rever instantes anteriores (veja "Visualizando dados ao vivo" acima). Para evitar consumo excessivo de memória, esses dados são descartados após 20 minutos por padrão. Você pode escolher um intervalo menor para economizar memória ou selecionar "Nunca" para guardar os dados ao vivo por tempo indeterminado.
