---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadados {#metadata}

A guia Metadados mostra os valores publicados na tabela oculta "/Metadata" ou pelo AdvantageKit. As chaves de metadados ficam à esquerda, e as colunas separam os dados de diferentes fontes (como execução real e repetição no AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Visão geral da guia de metadados" />

_A interface em inglês é exibida acima._

O exemplo abaixo mostra como registrar metadados em Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Na WPILib, use a classe `Telemetry` para registrar valores em string na tabela "/Metadata".

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

No AdvantageKit, chame o método abaixo antes de iniciar o logger. Os metadados são salvos separadamente no modo real e na repetição para facilitar a comparação.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
