---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Métadonnées {#metadata}

L'onglet Métadonnées affiche les valeurs publiées dans la table cachée `/Metadata` ou via AdvantageKit. Les clés de métadonnées apparaissent à gauche, et les colonnes séparent les données selon leur provenance (par ex. exécution réelle et relecture avec AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Aperçu de l'onglet Métadonnées" />

_L'interface en anglais est illustrée ci-dessus._

L'exemple ci-dessous montre comment enregistrer des métadonnées.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

Dans WPILib, enregistrez vos valeurs sous forme de chaînes de caractères dans la table `/Metadata` à l'aide de la classe `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

Dans WPILib, enregistrez vos valeurs sous forme de chaînes de caractères dans la table `/Metadata` à l'aide de la classe `Telemetry`.

```cpp
wpi::telemetry::TelemetryTable& metadata = wpi::telemetry::GetTable("Metadata");
metadata.Log("RobotName", "Darwin");
metadata.Log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

Dans WPILib, enregistrez vos valeurs sous forme de chaînes de caractères dans la table `/Metadata` à l'aide du module `telemetry`.

```python
import telemetry

metadata = telemetry.get_table("Metadata")
metadata.log("RobotName", "Darwin")
metadata.log("Platform", "macOS")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Dans AdvantageKit, appelez la méthode ci-dessous avant de démarrer l'enregistreur. Les métadonnées sont stockées séparément entre le robot réel et la relecture pour faciliter la comparaison.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
