---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Métadonnées

L'onglet métadonnées montre les valeurs publiées dans la table cachée « /Metadata » ou via AdvantageKit. Les clés de métadonnées sont affichées à gauche, et les colonnes séparent les données provenant de différentes sources (par ex. réel et relecture lors de l'utilisation d'AdvantageKit).

<img src="/img/tab-reference/metadata-1.png" alt="Aperçu de l'onglet métadonnées" />

L'exemple de code ci-dessous montre comment enregistrer des métadonnées en utilisant Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Dans WPILib, les valeurs doivent être enregistrées dans la table « /Metadata » sous forme de chaînes de caractères.

```java
// NetworkTables (also saved to DataLog by default)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (not published to NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Dans AdvantageKit, appelez la méthode ci-dessous avant de démarrer l'enregistreur. Les métadonnées sont stockées séparément lors de l'exécution en réel et en relecture pour une comparaison facile.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
