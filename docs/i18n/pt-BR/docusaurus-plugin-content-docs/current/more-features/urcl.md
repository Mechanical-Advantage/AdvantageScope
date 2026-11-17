---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Logger não oficial compatível com REV {#unofficial-rev-compatible-logger}

:::info
Novidade de 2026: a REVLib passou a incluir uma solução oficial de logging para salvar dados do Spark Max e do Spark Flex em um log de CAN da REV (`.revlog`). Veja os detalhes [aqui](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger). Você pode abrir esses arquivos diretamente no AdvantageScope, mas eles não podem ser sincronizados com precisão com outras fontes de dados.

O Logger _não oficial_ compatível com REV (URCL) do AdvantageScope continua disponível para as equipes em 2026, garantindo uma transição tranquila e mantendo os mesmos recursos das temporadas anteriores. Compartilharemos mais detalhes sobre as opções de logging para 2027 em diante no futuro.
:::

O URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) é uma biblioteca de logging para Java, C++ e Python que grava automaticamente os dados do Spark Max e do Spark Flex. Com ele, você consegue plotar gráficos ao vivo e registrar todos os dispositivos de forma parecida com o [recurso de plotagem do Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) e o [logger de sinais do Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) da CTRE.

Depois de configurado, os quadros CAN periódicos de todos os Spark Max e Spark Flex passam a ser publicados no NetworkTables ou no DataLog. Se usar o NetworkTables, você pode ativar o [DataLogManager](https://docs.wpilib.org/pt/stable/docs/software/telemetry/datalog.html) da WPILib para gravar esses dados em um arquivo de log. Todos esses quadros podem ser visualizados no AdvantageScope (confira [Gerenciando arquivos de log](/overview/log-files) e [Conectando a fontes ao vivo](/overview/live-sources)).

- **Todos os sinais** são capturados automaticamente, **sem precisar configurar novos dispositivos manualmente**.
- **Nenhum quadro se perde**, mesmo quando o período do quadro de status é mais rápido que o ciclo de loop do robô.
- Os quadros são gravados com **timestamps baseados no momento de recepção CAN (RX)**, o que deixa a caracterização de aceleração com o [SysId](https://docs.wpilib.org/pt/stable/docs/software/pathplanning/system-identification/introduction.html) bem mais precisa do que o logging tradicional no código do usuário (veja "Uso do SysId" abaixo).
- O logging é **muito eficiente**: as operações rodam em threads separadas e consomem menos de 80 µs por ciclo periódico de 20 ms, mesmo com muitos dispositivos.
- **Nenhuma função da REVLib é afetada.**

:::info
Como essa biblioteca não é uma ferramenta oficial da REV, se precisar de suporte, abra uma issue na [página de issues do URCL](https://github.com/Mechanical-Advantage/URCL/issues) ou escreva para software@team6328.org, em vez de entrar em contato com o suporte da REV.
:::

## Configuração {#setup}

Instale a vendordep do URCL seguindo as instruções para [bibliotecas de terceiros](https://docs.wpilib.org/pt/stable/docs/software/vscode-overview/3rd-party-libraries.html) pelo gerenciador de dependências do VSCode. Se preferir, cole diretamente a URL do JSON da vendordep:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

Por padrão, o URCL publica no NetworkTables, onde você pode salvar os dados em um arquivo de log ativando o DataLogManager da WPILib. Outra opção é gravar diretamente no DataLog. Inicie o logger em `robotInit`, como nos exemplos abaixo:

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // Para publicar no NetworkTables e no DataLog
  DataLogManager.start();
  URCL.start();

  // Para gravar apenas no DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // Para publicar no NetworkTables e no DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // Para gravar apenas no DataLog
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # Para publicar no NetworkTables e no DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # Para gravar apenas no DataLog
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
A compatibilidade do URCL com o AdvantageKit existe apenas por conveniência; os dados gravados no log NÃO ficam disponíveis no replay. **Para ter suporte a replay, os controladores de motor da REV ainda precisam fazer parte de uma implementação de IO com entradas definidas.**
:::

</TabItem>
</Tabs>

Para identificar os dispositivos com mais facilidade no log, você pode dar apelidos (aliases) aos IDs CAN passando um mapa para o método `start()` ou `startExternal()`. As chaves são os IDs CAN e os valores são os nomes que aparecerão no log. Os dispositivos sem apelido serão registrados com seus nomes padrão.

:::warning
Para economizar largura de banda na rede CAN, a maioria dos quadros de status dos dispositivos Spark vem **desabilitada por padrão** até que o código chame algum método getter correspondente. Qualquer dado que esteja em um quadro de status desabilitado não vai aparecer no log do URCL.

Para saber mais, consulte a [documentação da REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). Recomendamos usar o [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) ao configurar o Spark para ativar manualmente todos os sinais que você quer incluir no arquivo de log.
:::

## Uso do SysId {#sysid-usage}

1. Depois de configurar o URCL como mostrado acima, configure a rotina do SysId passando `null` como o consumidor de log do mecanismo. Veja o exemplo em Java abaixo — você pode fazer essa configuração dentro da própria classe do subsistema.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Cria a rotina do SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Sem consumidor de log, pois os dados são gravados pelo URCL
    subsystem
  )
);

// Os métodos abaixo retornam objetos Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Cria a rotina do SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Sem consumidor de log, pois os dados são gravados pelo URCL
    subsystem
  )
);

// Os métodos abaixo retornam objetos Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Execute a rotina do SysId no robô. Você pode rodar os comandos do SysId como rotinas autônomas ou associá-los a botões do controle.

3. Baixe o arquivo de log e abra-o no AdvantageScope. Na barra de menus, clique em `Arquivo` > `Exportar dados...`. Defina o formato como "WPILOG" e o conjunto de campos como "Incluir gerados". Clique no ícone de salvar e escolha onde salvar o log.

:::warning
Você precisa abrir e exportar o arquivo de log pelo AdvantageScope _antes de carregá-lo no analisador do SysId_. Esse passo é obrigatório para converter os dados CAN gravados pelo URCL para um formato que o SysId entenda.
:::

4. Abra o analisador do SysId procurando por "WPILib: Start Tool" na paleta de comandos do VSCode e escolhendo "SysId" (ou pelo atalho da área de trabalho no Windows). Carregue o arquivo de log exportado clicando em "Open data log file..."

5. Selecione os campos abaixo para rodar a análise usando o encoder padrão. Também é possível usar dados de posição e velocidade de encoders secundários (alternativo, externo, analógico, absoluto, etc.).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
Os ganhos calculados pelo SysId vão usar as mesmas unidades que o Spark Max/Flex estiver configurado para reportar (via [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) e [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). Por padrão, são rotações e RPM sem nenhuma redução aplicada. Se as unidades gravadas não forem as que você quer usar, você pode ajustar a escala dentro do próprio SysId durante a análise.
:::
