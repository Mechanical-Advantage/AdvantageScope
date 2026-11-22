---
sidebar_position: 1
---

# 👋 Olá, telemetria!

Bem-vindo ao AdvantageScope! Telemetria e registro de dados são recursos poderosos que podem aprimorar sua capacidade de entender o código do robô, diagnosticar problemas e implementar soluções dentro e fora da arena. Estes tutoriais foram criados para ajudar você a começar com telemetria e aproveitar ao máximo todos os recursos do AdvantageScope.

Neste tutorial, você aprenderá a:

- Configurar telemetria básica do robô em um projeto Java da WPILib.
- Conectar-se a fluxos de dados ao vivo no AdvantageScope.
- Gravar dados em arquivos de log para acesso posterior.
- Visualizar dados de telemetria usando o AdvantageScope.

:::tip Procurando outra coisa?

- **Equipes de FTC:** Se você estiver usando o sistema de controle atual da FIRST Tech Challenge, confira o guia ✴️ [Compatibilidade com FTC](/more-features/ftc-compatibility).
- **Interface web:** Uma versão para navegador do AdvantageScope está disponível diretamente na FIRST Driver Station e na interface web do Systemcore. Consulte 💡 [AdvantageScope Lite](/more-features/advantagescope-lite) para mais detalhes.
- **AdvantageKit:** Um framework de logging avançado projetado para replay determinístico em simulação. Consulte a [documentação](https://docs.advantagekit.org) para detalhes. Recomendamos começar com a API de telemetria integrada da WPILib, descrita abaixo.
  :::

## 1. Crie um novo projeto WPILib

Para começar, crie um novo projeto Java da WPILib no VS Code:

1. Abra o VS Code.
2. Clique no ícone da WPILib no canto superior direito (ou pressione `Ctrl+Shift+P` / `Cmd+Shift+P` e digite **WPILib: Create a new project**).
3. Selecione **Template** > **Java** > **Command v3 Robot** (ou **Command v2 Robot**).
4. Escolha uma pasta, dê um nome ao seu projeto (por exemplo, `HelloTelemetry`) e informe o número da sua equipe.
5. Marque **Enable Desktop Support** e clique em **Create Project**.

<img src="/img/tutorials/hello-telemetry-1.webp" alt="Criando um novo projeto Java da WPILib no VS Code usando o WPILib Project Creator." />

_A interface em inglês é exibida acima._

## 2. Inicialize o registro de dados

A WPILib oferece registro de dados integrado por meio do `DataLogManager`. Quando iniciado, ele grava automaticamente toda a telemetria, entradas do NetworkTables e entradas da Driver Station em arquivos `.wpilog`.

:::info Recomendação
Embora os logs possam ser salvos no armazenamento interno do Systemcore, a memória flash interna é limitada. Recomendamos fortemente conectar um **pen drive USB padrão formatado em FAT32** em uma das portas USB do Systemcore. O `DataLogManager` detectará a unidade e gravará todos os logs diretamente no pen drive USB de forma automática.
:::

Abra `src/main/java/first/robot/Robot.java` e inicialize o `DataLogManager` dentro do construtor `Robot()`:

```java
public class Robot extends OpModeRobot {
  // ...

  public Robot() {
    // Inicia o DataLogManager para gravar toda a telemetria em um arquivo .wpilog no pen drive USB
    DataLogManager.start();

    // Também registra dados da Driver Station (joysticks, OpMode, estado de habilitação)
    DriverStation.startDataLog(DataLogManager.getLog());
  }

  // ...
}
```

## 3. Publique dados de telemetria

A classe `Telemetry` da WPILib permite publicar dados com uma única linha de código, organizando os campos em tabelas hierárquicas. Essa API oferece suporte a uma grande variedade de tipos de dados, incluindo valores numéricos, booleanos, strings, arrays e [tipos geométricos](https://docs.wpilib.org/pt/stable/docs/software/advanced-controls/geometry/index.html) da WPILib.

:::info
A classe `Telemetry` na WPILib é diferente da classe `Telemetry` no SDK da FTC. A classe `Telemetry` da WPILib envia informações do programa do robô para dashboards, ferramentas de depuração ou arquivos de log. Para atualizar a tela integrada da Driver Station, use a classe `DriverStationDisplay` da WPILib.
:::

Atualize `src/main/java/first/robot/ExampleTeleop.java`:

```java
@Teleop
public class ExampleTeleop implements OpMode {
  // ...

  @Override
  public void periodic() {
    double currentTime = Timer.getTimestamp();
    double sineWave = Math.sin(currentTime * 2.0);

    // Publica valores de telemetria usando a API Telemetry
    Telemetry.log("Time", currentTime);
    Telemetry.log("SineWave/Value", sineWave);
    Telemetry.log("SineWave/Low", sineWave < 0.5);
  }
}
```

Faça o deploy do código para o robô (ou execute `WPILib: Simulate Robot Code` no VS Code). Na simulação, clique em `Teleoperated` > `ExampleTeleop` > `Enable`.

<img src="/img/tutorials/hello-telemetry-2.webp" alt="Habilitando o OpMode ExampleTeleop na interface do simulador." height="200" />

_A interface em inglês é exibida acima._

:::tip
Novos dados de telemetria só são publicados quando `Telemetry.log` é chamado. Métodos periódicos na classe `Robot`, OpModes, subsistemas e mecanismos podem ficar ativos em condições diferentes; consulte a documentação da API com atenção ao decidir onde colocar as chamadas de registro.
:::

## 4. Conecte o AdvantageScope ao vivo

Abra o aplicativo para desktop do AdvantageScope. No menu superior, selecione `Arquivo` > `Conectar ao robô` > `NetworkTables` (ou `Arquivo` > `Conectar ao simulador` se estiver simulando). Após conectar, a barra lateral esquerda será preenchida com os campos publicados em `NT:/Telemetry`.

:::tip Atalhos de teclado
Pressione `Ctrl+K` / `Cmd+K` para conectar rapidamente ao robô, ou `Ctrl+Shift+K` / `Cmd+Shift+K` para conectar ao simulador.
:::

<img src="/img/tutorials/hello-telemetry-3.webp" alt="AdvantageScope conectado ao fluxo ao vivo do robô com os campos listados na árvore da barra lateral." />

_A interface em inglês é exibida acima._

## 5. Visualize dados de telemetria

### Gráfico de linha

O 📉 [Gráfico de linha](/tab-reference/line-graph) é a guia padrão do AdvantageScope e oferece plotagem em tempo real de valores numéricos e discretos.

1. Olhe na barra lateral esquerda em `Telemetry` > `SineWave`.
2. Arraste `Value` para a área "Eixo esquerdo" do painel de controle.
3. Arraste `Low` para a área "Campos discretos" do painel de controle.
4. Clique nos três pontos ao lado de "Campos discretos" e depois em "Mostrar modo do robô".

Você verá a onda senoidal e o estado do robô serem atualizados em tempo real conforme os dados chegam!

:::info Interagindo com o gráfico

- **Pausar / Percorrer:** Role horizontalmente ou clique e arraste sobre o gráfico para ver dados anteriores. A seta vermelha no canto superior direito indica que a rolagem automática ao vivo está pausada. Clique na seta ou pressione `L` para alternar a rolagem automática ao vivo.
- **Zoom:** Role para cima/baixo sobre o gráfico, ou segure `Shift` enquanto arrasta para dar zoom em uma janela de tempo específica.
- **Inspecionar valores:** Clique em qualquer ponto do gráfico para posicionar um cursor de tempo e ver os valores exatos na legenda.
  :::

<img src="/img/tutorials/hello-telemetry-4.webp" alt="Gráfico de linha plotando o sinal de onda senoidal." />

_A interface em inglês é exibida acima._

### Tabela

A guia 🔢 [Tabela](/tab-reference/table) exibe uma planilha cronológica de mudanças de estado e valor, ideal para diagnosticar transições e sequências de eventos.

1. Clique no botão **+** na barra de guias superior e escolha **Tabela**.
2. Na barra lateral, arraste `NT:/Telemetry/SineWave/Value` e `NT:/Telemetry/Low` para a visualização da tabela.
3. Uma nova linha é adicionada automaticamente sempre que qualquer campo exibido muda de valor.
4. Clique em qualquer linha para fazer todas as guias abertas saltarem imediatamente para aquele instante exato no tempo!

:::tip
As guias podem ser reorganizadas e renomeadas na barra de guias. Clique no botão de janela na barra de título para abrir uma guia em uma janela destacada e visualizar várias guias lado a lado.
:::

<img src="/img/tutorials/hello-telemetry-5.webp" alt="Guia Tabela exibindo dados da onda senoidal." />

_A interface em inglês é exibida acima._

### Estatísticas

A guia 📊 [Estatísticas](/tab-reference/statistics) exibe um histograma de valores numéricos, oferecendo uma visão detalhada dos dados de um ou mais campos.

1. Clique no botão **+** na barra de guias superior e escolha **Estatísticas**.
2. Na barra lateral, arraste `NT:/Telemetry/SineWave/Value` para a seção "Medições".
3. Defina "Intervalo de dados" como `-1` e `1`, e defina "Largura do intervalo" como `0,1`.
4. Visualize os dados usando o histograma e as estatísticas resumidas.
5. Role a linha do tempo na parte superior para ajustar o intervalo de dados a incluir.

<img src="/img/tutorials/hello-telemetry-6.webp" alt="Guia Estatísticas exibindo dados da onda senoidal." />

_A interface em inglês é exibida acima._

## 6. Baixe e abra arquivos de log

Após testes ou uma partida, você pode baixar os arquivos `.wpilog` do robô para analisar os dados depois:

1. Na barra de menus, selecione `Arquivo` > `Baixar logs...`.
2. O AdvantageScope conecta-se ao robô e lista todos os arquivos de log gravados (os mais recentes no topo).
3. Selecione o(s) arquivo(s) de log que deseja inspecionar, clique no ícone de download (↓) e escolha uma pasta no computador.
4. Abra o arquivo baixado usando `Arquivo` > `Abrir log(s)...` ou arrastando o arquivo `.wpilog` diretamente para o AdvantageScope.

<img src="/img/overview/log-files/open-file-2.webp" alt="A janela de download exibindo os arquivos WPILOG disponíveis no armazenamento do robô." height="350" />

_A interface em inglês é exibida acima._

## O que vem a seguir?

Agora que você já tem telemetria e logging básicos funcionando, leve sua visualização para o próximo nível:

- **🤖 [Para o campo: visualização do robô](/tutorials/to-the-field):** Aprenda a visualizar posições 2D/3D do robô, trajetórias e mecanismos em modelos de campo da FRC e FTC.
- **[Visão geral](/category/overview):** Um guia completo sobre gerenciamento de arquivos, atalhos de navegação e opções de transmissão ao vivo.
- **[Suporte a unidades](/tab-reference/line-graph/units):** Como integrar metadados de unidades aos seus logs para uma visualização mais precisa.
- **💬 [Console](/tab-reference/console):** Visualize logs de texto salvos pelo `DataLogManager` da WPILib.
- **🔍 [Metadados](/tab-reference/metadata):** Salve informações adicionais para identificar e categorizar arquivos de log.
- **[Epilogue](https://docs.wpilib.org/pt/stable/docs/software/telemetry/robot-telemetry-with-annotations.html):** Registre telemetria em Java usando anotações.
