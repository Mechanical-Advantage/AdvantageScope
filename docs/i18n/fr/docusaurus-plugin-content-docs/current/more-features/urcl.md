---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL (Enregistreur non officiel compatible REV) {#unofficial-rev-compatible-logger}

:::info
Nouveauté 2026 : REVLib inclut désormais une solution de journalisation officielle pour enregistrer les données des contrôleurs Spark Max et Spark Flex dans un journal REV CAN (`.revlog`). Consultez [cette documentation](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) pour en savoir plus. Vous pouvez ouvrir ces fichiers directement dans AdvantageScope, mais il n'est pas possible de les synchroniser avec précision avec d'autres sources de données.

L'enregistreur non officiel compatible REV d'AdvantageScope (URCL, pour _Unofficial REV-Compatible Logger_) reste également disponible en 2026 afin d'assurer une transition en douceur et de conserver les mêmes fonctionnalités que les saisons précédentes. Nous communiquerons ultérieurement plus de détails sur les options de journalisation pour 2027 et les années suivantes.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) est une bibliothèque de journalisation pour Java, C++ et Python qui enregistre automatiquement les données des contrôleurs Spark Max et Spark Flex. Elle permet ainsi de tracer des graphiques en direct et d'enregistrer les données de tous vos contrôleurs, à l'image de l'[outil de tracé Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) et de l'[enregistreur de signaux Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) de CTRE.

Une fois configuré, URCL publie les trames CAN périodiques de tous vos Spark Max et Spark Flex vers NetworkTables ou DataLog. Si vous passez par NetworkTables, vous pouvez utiliser le [DataLogManager](https://docs.wpilib.org/fr/stable/docs/software/telemetry/datalog.html) de WPILib pour sauvegarder ces données dans un fichier journal. Vous pourrez ensuite visualiser ces trames dans AdvantageScope (voir [Gestion des fichiers journaux](/overview/log-files) et [Connexion à des sources en direct](/overview/live-sources)).

- **Tous les signaux** sont capturés automatiquement, **sans aucune configuration manuelle lors de l'ajout de nouveaux appareils**.
- **Chaque trame est enregistrée**, même lorsque sa période d'envoi est plus rapide que le cycle de la boucle du robot.
- Les trames sont horodatées **à partir de l'heure de réception CAN (RX)**, ce qui offre une caractérisation de l'accélération plus précise avec [SysId](https://docs.wpilib.org/fr/stable/docs/software/pathplanning/system-identification/introduction.html) qu'une journalisation classique dans le code utilisateur (voir « Utilisation de SysId » ci-dessous).
- La journalisation est **très performante** : les opérations s'exécutent dans un thread séparé et consomment moins de 80 µs par cycle périodique de 20 ms, même avec un grand nombre d'appareils.
- **Aucune fonction de REVLib n'est affectée.**

:::info
Comme cette bibliothèque n'est pas un outil officiel de REV, veuillez adresser vos demandes d'assistance sur la [page des problèmes GitHub](https://github.com/Mechanical-Advantage/URCL/issues) d'URCL ou par courriel à software@team6328.org plutôt qu'au support technique de REV.
:::

## Configuration {#setup}

Installez la dépendance _vendordep_ URCL en suivant la procédure d'installation des [bibliothèques tierces](https://docs.wpilib.org/fr/stable/docs/software/vscode-overview/3rd-party-libraries.html) depuis le gestionnaire de dépendances de VSCode. Vous pouvez aussi utiliser directement l'URL JSON suivante :

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

Par défaut, URCL publie les données sur NetworkTables, et vous pouvez les enregistrer dans un fichier journal en activant le `DataLogManager` de WPILib. URCL peut également écrire directement dans un `DataLog`. Dans tous les cas, démarrez l'enregistreur dans `robotInit`, comme indiqué ci-dessous.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // En cas de publication sur NetworkTables et DataLog
  DataLogManager.start();
  URCL.start();

  // En cas d'enregistrement uniquement dans le DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // En cas de publication sur NetworkTables et DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // En cas d'enregistrement uniquement dans le DataLog
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
        # En cas de publication sur NetworkTables et DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # En cas d'enregistrement uniquement dans le DataLog
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
La compatibilité d'URCL avec AdvantageKit est fournie uniquement à titre pratique; les données enregistrées dans le journal ne sont PAS disponibles en relecture. **Pour prendre en charge la relecture, vos contrôleurs de moteur REV doivent impérativement être intégrés dans une implémentation d'E/S avec des entrées définies.**
:::

</TabItem>
</Tabs>

Pour repérer plus facilement vos appareils dans le journal, vous pouvez associer des alias aux identifiants CAN en passant un dictionnaire (_map_) à la méthode `start()` ou `startExternal()`. Les clés correspondent aux identifiants CAN, et les valeurs aux noms à afficher dans le journal. Les appareils sans alias conserveront leur nom par défaut.

:::warning
Pour limiter la charge sur le bus CAN, la plupart des trames d'état des appareils Spark sont **désactivées par défaut** tant qu'une méthode _getter_ associée n'est pas appelée. Les données des trames désactivées n'apparaîtront donc pas dans le journal URCL.

Pour en savoir plus, consultez la [documentation REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). Nous vous recommandons d'utiliser [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) lors de la configuration du Spark afin d'activer manuellement les signaux que vous souhaitez enregistrer.
:::

## Utilisation de SysId {#sysid-usage}

1. Après avoir configuré URCL comme décrit ci-dessus, configurez votre routine SysId en passant `null` comme consommateur de journal du mécanisme (_mechanism log consumer_). Voici un exemple en Java, à placer par exemple dans la classe du sous-système.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Créer la routine SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Aucun consommateur de journal, car les données sont enregistrées par URCL
    subsystem
  )
);

// Les méthodes ci-dessous retournent des objets Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Créer la routine SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Aucun consommateur de journal, car les données sont enregistrées par URCL
    subsystem
  )
);

// Les méthodes ci-dessous retournent des objets Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Exécutez la routine SysId sur le robot. Vous pouvez configurer les commandes SysId comme routines autonomes ou les associer à des boutons de manette.

3. Téléchargez le fichier journal et ouvrez-le dans AdvantageScope. Dans la barre de menus, sélectionnez `Fichier` > `Exporter les données...`. Choisissez le format « WPILOG » et sélectionnez « Inclure les champs générés » pour l'ensemble de champs. Cliquez ensuite sur l'icône d'enregistrement et choisissez où sauvegarder le fichier.

:::warning
Vous devez impérativement ouvrir puis exporter le fichier journal avec AdvantageScope _avant de le charger dans l'analyseur SysId_. Cette étape convertit les données CAN enregistrées par URCL dans un format compréhensible par SysId.
:::

4. Ouvrez l'analyseur SysId en recherchant « WPILib: Start Tool » dans la palette de commandes de VSCode puis en choisissant « SysId » (ou via le raccourci sur le bureau sous Windows). Ouvrez le fichier journal exporté en cliquant sur « Open data log file... ».

5. Sélectionnez les champs suivants pour lancer l'analyse avec l'encodeur par défaut. Vous pouvez aussi utiliser les données de position et de vitesse d'encodeurs secondaires (alternatif, externe, analogique, absolu, etc.).

   - Position = « NT:/URCL/&lt;Device&gt;/MotorPositionRotations »
   - Velocity = « NT:/URCL/&lt;Device&gt;/MotorVelocityRPM »
   - Voltage = « NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage »

:::tip
Les gains calculés par SysId utilisent les unités configurées sur le Spark Max/Flex (via [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) et [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). Par défaut, il s'agit des rotations et des tr/min, sans rapport de réduction appliqué. Si les unités enregistrées ne correspondent pas à celles souhaitées, vous pouvez ajuster l'échelle directement dans SysId lors de l'analyse.
:::
