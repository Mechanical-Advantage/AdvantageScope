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

Na WPILib, os valores devem ser registrados na tabela "/Metadata" como strings.

```java
// NetworkTables (também salvo no DataLog por padrão)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (não publicado no NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

No AdvantageKit, chame o método abaixo antes de iniciar o logger. Os metadados são armazenados separadamente ao executar em modo real e repetição para fácil comparação.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
