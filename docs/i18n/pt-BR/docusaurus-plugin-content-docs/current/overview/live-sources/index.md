# 🛜 Fontes ao vivo

Todas as visualizações no AdvantageScope foram projetadas para receber dados ao vivo de um robô ou simulador, além de arquivos de log. Esta seção descreve como se conectar a fontes de dados em tempo real. As seguintes fontes de dados ao vivo são suportadas pelo AdvantageScope:

- **NetworkTables:** Este é o protocolo de rede principal da WPILib. Consulte a [documentação da WPILib](https://docs.wpilib.org/pt/stable/docs/software/networktables/index.html) para mais detalhes.
- **NetworkTables (AdvantageKit):** Este modo é projetado para uso com código de robô executando o AdvantageKit, que publica na tabela `AdvantageKit` no NetworkTables.
- **Diagnósticos do Systemcore:** Este modo conecta-se ao servidor NetworkTables integrado usado pelo Systemcore OS, que inclui dados de diagnóstico como o estado do robô e E/S de dispositivos.
- **Diagnósticos do Phoenix:** Este modo usa HTTP para se conectar a um [servidor de diagnósticos](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) do Phoenix, o que permite a transmissão de dados de dispositivos CAN da CTRE com o [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). Isso é semelhante ao [recurso de plotagem](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) no Phoenix Tuner. Consulte [esta página](/overview/live-sources/phoenix-diagnostics) para mais informações.
- **Servidor RLOG:** Este protocolo é suportado pelo AdvantageKit como uma alternativa ao NetworkTables. A conexão é iniciada na porta 5800 por padrão.
- **FTC Dashboard:** Este modo integra-se com robôs do FTC que publicam dados no [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
O AdvantageScope pode se conectar à Driver Station da FIRST para visualizar dados de diagnóstico ao ser executado no mesmo dispositivo que o aplicativo da DS. Nenhuma configuração é necessária (consulte as instruções abaixo).
:::

## Iniciando a conexão

Para iniciar a conexão ao vivo, siga estas etapas:

- **Robô:** Clique em `Arquivo` > `Conectar ao robô` > `Padrão` ou uma fonte ao vivo específica
- **Simulador:** Clique em `Arquivo` > `Conectar ao simulador` > `Padrão` ou uma fonte ao vivo específica
- **Driver Station:** Clique em `Arquivo` > `Conectar à Driver Station`

O título da janela exibe o endereço IP e o texto "Buscando" até que o alvo esteja conectado. O AdvantageScope tenta reconectar automaticamente usando as mesmas configurações após uma desconexão.

## Visualizando dados ao vivo

Quando conectado a uma fonte ao vivo, o AdvantageScope bloqueia todas as guias no horário atual por padrão. Visualizações como o 📉 [Gráfico de linha](/tab-reference/line-graph) e a 🔢 [Tabela](/tab-reference/table) rolam automaticamente, e visualizações como campo e joysticks exibem os valores atuais de cada campo. Clicar no botão de seta vermelha na barra de navegação alterna este bloqueio, permitindo a visualização e reprodução de dados passados.

<img src="/img/overview/live-sources/open-live-1.png" alt="Live lock/unlock button" />

:::tip
Rolar para a esquerda no gráfico de linha ou na linha do tempo desbloqueia do horário atual, e rolar totalmente para a direita bloqueia no horário atual novamente.
:::

## Configuração

Abra a janela de preferências clicando em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS).

<img src="/img/prefs.png" alt="Diagram of preferences" height="350" />

### Endereço do robô

Insira o endereço do robô usando um endereço IP 10.TE.AM.2 conforme descrito na [documentação da WPILib](https://docs.wpilib.org/pt/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Ao se conectar ao Systemcore via USB ou pelo ponto de acesso Wi-Fi integrado, clique em `Arquivo` > `Usar endereço USB do Systemcore`/`Usar endereço Wi-Fi do Systemcore` para usar temporariamente o endereço IP estático correto.

### Modo ao vivo

Quando o NetworkTables é usado como fonte ao vivo, os seguintes modos ao vivo podem ser selecionados:

- **Baixa largura de banda (Padrão):** O AdvantageScope solicita dados do servidor apenas para campos que estão sendo ativamente usados. Dados publicados antes de um campo ser selecionado não estarão disponíveis. Este modo é **altamente recomendado** ao ser executado em um ambiente com largura de banda de rede limitada, ou quando um grande número de campos está sendo publicado.
- **Logging:** O AdvantageScope solicita dados para todos os campos, independentemente de estarem sendo ativamente usados ou não. Isso significa que os campos podem ser visualizados retroativamente pausando a transmissão de dados ao vivo (veja abaixo). Este modo é frequentemente útil durante o desenvolvimento, mas **NÃO deve ser usado quando a largura de banda for limitada**.

### Descartar dados ao vivo

Durante uma conexão ao vivo, os dados são armazenados localmente para permitir a reprodução de dados passados (veja "Visualizando dados ao vivo" abaixo). Para evitar um uso de memória muito alto, os dados são descartados após 20 minutos por padrão. Um período mais curto pode ser selecionado para reduzir o uso de memória, ou "Nunca" pode ser selecionado para armazenar dados ao vivo indefinidamente.
