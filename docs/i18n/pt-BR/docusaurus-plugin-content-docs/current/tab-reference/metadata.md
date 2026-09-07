---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadados {#metadata}

A guia de metadados mostra valores publicados na tabela oculta "/Metadata" ou através do AdvantageKit. As chaves de metadados são exibidas à esquerda, e as colunas separam dados de diferentes fontes (por exemplo, real e repetição ao usar o AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Visão geral da aba de metadados" />

_A interface em inglês é exibida acima._

O código de exemplo abaixo mostra como registrar metadados usando Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Na WPILib, registre valores na tabela "/Metadata" como strings usando a classe `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

No AdvantageKit, chame o método abaixo antes de iniciar o logger. Os metadados são armazenados separadamente ao executar em modo real e repetição para fácil comparação.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
