---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Logger não oficial compatível com REV

:::info
Novidade em 2026, a REVLib inclui uma solução oficial de logging para salvar dados do Spark Max e Spark Flex em um log CAN da REV (`.revlog`). Veja [aqui](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) para mais detalhes. Esses arquivos podem ser abertos diretamente no AdvantageScope, mas não podem ser precisamente sincronizados com outras fontes de dados.

O Logger _não oficial_ compatível com REV (URCL) do AdvantageScope também permanecerá disponível para as equipes em 2026 para garantir uma transição suave e fornecer paridade de recursos com as temporadas anteriores. Teremos mais detalhes a compartilhar sobre opções de log em 2027 e além em uma data posterior.
:::

O URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) é uma biblioteca de logging disponível para Java, C++ e Python que grava automaticamente dados do Spark Max e Spark Flex. Isso habilita a plotagem ao vivo e o registro de todos os dispositivos de forma semelhante ao [recurso de plotagem do Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) e ao [logger de sinais do Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) da CTRE.

Após a configuração, os quadros CAN periódicos de todos os dispositivos Spark Max e Spark Flex são publicados no NetworkTables ou DataLog. Ao usar o NetworkTables, o [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) da WPILib pode ser usado para capturar os dados em um arquivo de log. Esses quadros podem ser visualizados no AdvantageScope (consulte [Gerenciando arquivos de log](/overview/log-files) e [Conectando a fontes ao vivo](/overview/live-sources)).

- **Todos os sinais** são capturados automaticamente, **sem configuração manual para novos dispositivos**.
- **Cada quadro é capturado**, mesmo quando o período do quadro de status for mais rápido do que o ciclo de loop do robô.
- Os quadros são registrados com **timestamps baseados no horário de recepção CAN (RX)**, permitindo uma caracterização de aceleração mais precisa com o [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) em comparação com o logging tradicional no código do usuário (veja "Uso do SysId" abaixo).
- O logging é **altamente eficiente**; as operações usam threads e são executadas em menos de 80 µs por ciclo periódico de 20 ms, mesmo ao registrar um grande número de dispositivos.
- **Todas as funções da REVLib permanecem inalteradas.**

:::info
Como esta biblioteca não é uma ferramenta oficial da REV, dúvidas de suporte devem ser direcionadas à [página de problemas do URCL](https://github.com/Mechanical-Advantage/URCL/issues) ou para software@team6328.org em vez do contato de suporte da REV.
:::

## Configuração

Instale o vendordep do URCL seguindo as instruções para instalar [bibliotecas de terceiros](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) usando o gerenciador de dependências no VSCode. Alternativamente, você pode usar o seguinte URL JSON do fornecedor:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

O URCL publica no NetworkTables por padrão, onde os dados podem ser salvos em um arquivo de log habilitando o DataLogManager da WPILib. Alternativamente, o URCL pode registrar diretamente em um DataLog. O logger deve ser iniciado em `robotInit`, como mostrado abaixo.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // Se estiver publicando no NetworkTables e no DataLog
  DataLogManager.start();
  URCL.start();

  // Se estiver registrando apenas no DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // Se estiver publicando no NetworkTables e no DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // Se estiver registrando apenas no DataLog
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
        # Se estiver publicando no NetworkTables e no DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # Se estiver registrando apenas no DataLog
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
A compatibilidade do URCL com o AdvantageKit é fornecida apenas por conveniência; os dados registrados no log NÃO estão disponíveis na reprodução (replay). **Os controladores de motor da REV ainda devem fazer parte de uma implementação de E/S com entradas definidas para suportar a reprodução.**
:::

</TabItem>
</Tabs>

Para identificar dispositivos no log com mais facilidade, os IDs CAN podem ser atribuídos a aliases passando um objeto de mapa para o método `start()` ou `startExternal()`. As chaves são IDs CAN e os valores são strings com os nomes a serem usados no log. Quaisquer dispositivos aos quais não for atribuído um alias serão registrados usando seus nomes padrão.

:::warning
Para minimizar o uso da rede CAN, a maioria dos quadros de status para dispositivos Spark fica **desabilitada por padrão** até que um método getter associado seja chamado. Quaisquer dados incluídos nesses quadros de status desabilitados não estarão disponíveis no log do URCL.

Para mais detalhes, consulte a [documentação da REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). Recomendamos o uso de [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) ao configurar o Spark para habilitar manualmente quaisquer sinais que você deseja incluir no arquivo de log.
:::

## Uso do SysId

1. Após configurar o URCL conforme mostrado acima, configure a rotina do SysId usando `null` para o consumidor de log de mecanismo. Um exemplo é mostrado abaixo para Java. Esta configuração pode ser realizada dentro da classe de subsistema.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Cria a rotina do SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Sem consumidor de log, pois os dados são registrados pelo URCL
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
    null, // Sem consumidor de log, pois os dados são registrados pelo URCL
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

2. Execute a rotina do SysId no robô. Os comandos do SysId podem ser configurados como rotinas autônomas ou conectados a um gatilho de botão.

3. Baixe o arquivo de log e abra-o no AdvantageScope. Na barra de menus, vá em `Arquivo` > `Exportar dados...`. Defina o formato como "WPILOG" e o conjunto de campos como "Incluir gerados". Clique no ícone de salvar e escolha um local para salvar o log.

:::warning
O arquivo de log do robô deve ser aberto e exportado pelo AdvantageScope _antes de abri-lo usando o analisador do SysId_. Isso é necessário para converter os dados CAN registrados pelo URCL para um formato compatível com o SysId.
:::

4. Abra o analisador do SysId pesquisando por "WPILib: Start Tool" na paleta de comandos do VSCode e escolhendo "SysId" (ou usando o inicializador da área de trabalho no Windows). Abra o arquivo de log exportado clicando em "Open data log file..."

5. Escolha os campos abaixo para executar a análise usando o encoder padrão. Dados de posição e velocidade de encoders secundários também podem ser usados (alternativo, externo, analógico, absoluto, etc).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
Os ganhos produzidos pelo SysId usarão as unidades que o Spark Max/Flex estiver configurado para relatar (usando [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) e [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). Por padrão, estas são rotações e RPM sem redução aplicada. Se as unidades usadas ao registrar os dados não corresponderem às unidades desejadas, a escala poderá ser ajustada no SysId durante a análise.
:::
