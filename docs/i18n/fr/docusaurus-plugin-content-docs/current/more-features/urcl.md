---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Unofficial REV-Compatible Logger

:::info
Nouveauté 2026, REVLib inclut une solution de journalisation officielle pour enregistrer des données du Spark Max et du Spark Flex dans un journal REV CAN (`.revlog`). Voir [ici](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) pour plus de détails. Ces fichiers peuvent être ouverts directement dans AdvantageScope, mais ne peuvent pas être synchronisés avec précision avec d'autres sources de données.

L'enrégistreur non officiel compatible REV (_Unofficial_ REV-Compatible Logger ou URCL) d'AdvantageScope restera également disponible pour les équipes en 2026 afin d'assurer une transition en douceur et d'offrir une parité de fonctionnalités avec les saisons précédentes. Nous aurons plus de détails à partager sur les options de journalisation en 2027 et au-delà à une date ultérieure.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) est une bibliothèque de journalisation disponible pour Java, C++ et Python qui enregistre automatiquement les données du Spark Max et du Spark Flex. Cela permet le tracé en direct et la journalisation de tous les appareils de manière similaire à la [fonctionnalité de tracé Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) et au [signal logger Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) de CTRE.

Après la configuration, les trames CAN périodiques de tous les appareils Spark Max et Spark Flex sont publiées sur NetworkTables ou DataLog. Lors de l'utilisation de NetworkTables, le [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) de WPILib peut être utilisé pour capturer les données dans un fichier journal. Ces trames sont visualisables dans AdvantageScope (voir [Gestion des fichiers journaux](/overview/log-files) et [Connexion à des sources en direct](/overview/live-sources)).

- **Tous les signaux** sont capturés automatiquement, avec **aucune configuration manuelle pour les nouveaux appareils**.
- **Chaque trame est capturée**, même lorsque la période de trame d'état est plus rapide que le cycle de boucle du robot.
- Les trames sont enregistrées avec des **horodatages basés sur l'heure de réception CAN RX**, ce qui permet une caractérisation de l'accélération plus précise avec [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) par rapport à la journalisation traditionnelle dans le code utilisateur (voir « Utilisation de SysId » ci-dessous).
- La journalisation est **hautement efficace**; les opérations sont exécutées sur des threads séparés pour moins de 80 µs par cycle périodique de 20 ms, même lors de la journalisation d'un grand nombre d'appareils.
- **Toutes les fonctions de REVLib ne sont pas affectées.**

:::info
Comme cette bibliothèque n'est pas un outil officiel de REV, les demandes d'assistance doivent être adressées à la [page des problèmes](https://github.com/Mechanical-Advantage/URCL/issues) d'URCL ou à software@team6328.org plutôt qu'au contact d'assistance de REV.
:::

## Configuration

Installez la dépendance vendordep URCL en suivant les instructions d'installation des [bibliothèques tierces](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) à l'aide du gestionnaire de dépendances dans VSCode. Alternativement, vous pouvez utiliser l'URL JSON du fournisseur suivante :

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL publie sur NetworkTables par défaut, où les données peuvent être enregistrées dans un fichier journal en activant DataLogManager de WPILib. Alternativement, URCL peut enregistrer directement dans un DataLog. L'enregistreur doit être démarré dans `robotInit`, comme illustré ci-dessous.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // If publishing to NetworkTables and DataLog
  DataLogManager.start();
  URCL.start();

  // If logging only to DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // If publishing to NetworkTables and DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // If logging only to DataLog
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
        # If publishing to NetworkTables and DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # If logging only to DataLog
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
La compatibilité d'URCL avec AdvantageKit est fournie uniquement par commodité; les données enregistrées dans le journal ne sont PAS disponibles en relecture. **Les contrôleurs de moteur REV doivent toujours faire partie d'une implémentation d'E/S avec des entrées définies pour prendre en charge la relecture**.
:::

</TabItem>
</Tabs>

Pour identifier plus facilement les appareils dans le journal, les identifiants CAN peuvent être attribués à des alias en passant un objet map à la méthode `start()` ou `startExternal()`. Les clés sont des identifiants CAN et les valeurs sont des chaînes de caractères pour les noms à utiliser dans le journal. Tous les appareils auxquels aucun alias n'est attribué seront enregistrés sous leurs noms par défaut.

:::warning
Pour minimiser l'utilisation du bus CAN, la plupart des trames d'état pour les appareils Spark sont **désactivées par défaut** jusqu'à ce qu'une méthode getter associée soit appelée. Toutes les données incluses dans ces trames d'état désactivées ne seront pas disponibles dans le journal URCL.

Pour plus de détails, consultez la [documentation REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). Nous recommandons d'utiliser la [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) lors de la configuration du Spark pour activer manuellement les signaux que vous souhaitez inclure dans le fichier journal.
:::

## Utilisation de SysId

1. Après avoir configuré URCL comme illustré ci-dessus, configurez la routine SysId en utilisant `null` pour le consommateur de journal de mécanisme. Un exemple est illustré ci-dessous pour Java. Cette configuration peut être effectuée dans la classe de sous-système.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Exécutez la routine SysId sur le robot. Les commandes SysId peuvent être configurées comme des routines autonomes ou connectées à un déclencheur de bouton.

3. Téléchargez le fichier journal et ouvrez-le dans AdvantageScope. Dans la barre de menu, allez dans `Fichier` > `Exporter les données...`. Définissez le format sur « WPILOG » et l'ensemble de champs sur « Inclure les champs générés ». Cliquez sur l'icône d'enregistrement et choisissez un emplacement pour enregistrer le journal.

:::warning
Le fichier journal du robot doit être ouvert et exporté par AdvantageScope _avant de l'ouvrir à l'aide de l'analyseur SysId_. Cela est nécessaire pour convertir les données CAN enregistrées par URCL dans un format compatible avec SysId.
:::

4. Ouvrez l'analyseur SysId en recherchant « WPILib: Start Tool » dans la palette de commandes VSCode et en choisissant « SysId » (ou en utilisant le lanceur de bureau sur Windows). Ouvrez le fichier journal exporté en cliquant sur « Open data log file... »

5. Choisissez les champs suivants ci-dessous pour exécuter l'analyse à l'aide de l'encodeur par défaut. Les données de position et de vitesse des encodeurs secondaires peuvent également être utilisées (alternatif, externe, analogique, absolu, etc.).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
Les gains produits par SysId utiliseront les unités que le Spark Max/Flex est configuré pour rapporter (en utilisant [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) et [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). Par défaut, il s'agit de rotations et de tr/min sans démultiplication appliquée. Si les unités utilisées lors de l'enregistrement des données ne correspondent pas aux unités souhaitées, l'échelle peut être ajustée dans SysId pendant l'analyse.
:::
