---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Métadonnées {#metadata}

L'onglet métadonnées montre les valeurs publiées dans la table cachée « /Metadata » ou via AdvantageKit. Les clés de métadonnées sont affichées à gauche, et les colonnes séparent les données provenant de différentes sources (par ex. réel et relecture lors de l'utilisation d'AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Aperçu de l'onglet métadonnées" />

_L'interface en anglais est illustrée ci-dessus._

L'exemple de code ci-dessous montre comment enregistrer des métadonnées en utilisant Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Dans WPILib, enregistrez les valeurs dans la table « /Metadata » sous forme de chaînes de caractères à l'aide de la classe `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Dans AdvantageKit, appelez la méthode ci-dessous avant de démarrer l'enregistreur. Les métadonnées sont stockées séparément lors de l'exécution en réel et en relecture pour une comparaison facile.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
