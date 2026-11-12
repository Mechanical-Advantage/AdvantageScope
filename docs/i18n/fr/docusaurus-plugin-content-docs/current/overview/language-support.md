---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Prise en charge des langues {#language-support}

AdvantageScope prend en charge plusieurs langues pour offrir une expérience localisée aux équipes du monde entier. Les langues suivantes sont actuellement disponibles et prises en charge par la documentation d'AdvantageScope, l'application de bureau, les applications mobiles (AdvantageScope XR et AdvantageTune) et AdvantageScope Lite (sur Systemcore et dans la FIRST Driver Station) :

- Anglais (États-Unis)
- Espagnol (Amérique latine)
- Français
- Néerlandais
- Portugais (Brésil)
- Roumain
- Turc
- Russe
- Kazakh
- Hébreu
- Arabe
- Hindi
- Chinois simplifié
- Chinois traditionnel

## Configuration {#configuration}

Pour modifier la langue d'affichage dans AdvantageScope, ouvrez la fenêtre des préférences en cliquant sur `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS). Sous le paramètre « Langue », vous pouvez choisir parmi la liste des langues prises en charge ou sélectionner « Valeur par défaut du système » pour correspondre automatiquement à la langue de votre système d'exploitation.

<img src="/img/prefs_fr.webp" alt="Diagramme des préférences" height="450" />

## Clés de journalisation {#logging-keys}

Tous les formats pris en charge par AdvantageScope intègrent une compatibilité Unicode complète lors de la définition des clés de journal. Cela signifie que vous pouvez enregistrer des données dans votre langue préférée (y compris avec des accents, des caractères spéciaux et des alphabets non latins) et qu'elles seront correctement enregistrées et affichées dans AdvantageScope.

Voici un exemple d'enregistrement d'une chaîne avec une clé en français :

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("Entraînement/Vitesse du moteur droit", "Rapide");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Entraînement/Vitesse du moteur droit", "Rapide");
```

</TabItem>
</Tabs>

:::tip Prise en charge des unités
Consultez la page sur la [prise en charge des unités](/tab-reference/line-graph/units) pour plus de détails sur la transmission des métadonnées d'unité. Les noms d'unités doivent être fournis à l'aide de symboles SI ou en anglais (orthographe américaine ou britannique), quelle que soit la langue sélectionnée dans AdvantageScope.
:::

## Développement {#development}

La localisation d'AdvantageScope est créée avec une combinaison d'intelligence artificielle et de collaboration communautaire. Comme AdvantageScope est un projet qui évolue rapidement, l'utilisation de l'IA est essentielle pour maintenir synchronisées l'application traduite et la documentation dans chaque langue. Cela signifie que les nouvelles fonctionnalités et mises à jour sont toujours disponibles simultanément, quelle que soit la langue choisie.

Notre processus est conçu pour correspondre au vocabulaire spécifique, aux emprunts linguistiques et aux translittérations familiers aux équipes locales. Cependant, les traductions par IA comportent souvent des tournures peu naturelles ou d'autres inexactitudes. Vos retours sont les bienvenus; vous pouvez faire part de vos commentaires sur les traductions en cliquant sur l'icône violette dans l'application (lorsqu'elle est configurée dans une autre langue que l'anglais).
