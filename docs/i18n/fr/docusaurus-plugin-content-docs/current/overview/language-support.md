---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Prise en charge des langues {#language-support}

AdvantageScope est disponible en plusieurs langues pour offrir une interface adaptée aux équipes du monde entier. Les langues suivantes sont actuellement prises en charge dans la documentation, l'application de bureau, les applications mobiles (AdvantageScope XR et AdvantageTune) ainsi que dans AdvantageScope Lite (sur Systemcore et dans la FIRST Driver Station) :

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

Pour changer la langue d'affichage dans AdvantageScope, ouvrez les préférences en cliquant sur `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS). Sous le paramètre « Langue », choisissez une langue dans la liste ou sélectionnez « Par défaut du système » pour utiliser automatiquement la langue de votre système d'exploitation.

<img src="/img/prefs_fr.webp" alt="Fenêtre des préférences" height="450" />

## Clés de journalisation {#logging-keys}

Tous les formats pris en charge par AdvantageScope gèrent entièrement l'Unicode pour les clés de journal. Vous pouvez donc enregistrer vos données dans votre langue (avec accents, caractères spéciaux ou alphabets non latins) et elles s'afficheront correctement dans AdvantageScope.

Voici un exemple d'enregistrement d'une chaîne avec une clé en français :

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("Châssis/Vitesse moteur droit", "Rapide");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Châssis/Vitesse moteur droit", "Rapide");
```

</TabItem>
</Tabs>

:::tip Prise en charge des unités
Consultez la page sur la [prise en charge des unités](/tab-reference/line-graph/units) pour savoir comment transmettre les métadonnées d'unité. Les noms d'unités doivent toujours utiliser les symboles SI ou l'anglais (orthographe américaine ou britannique), quelle que soit la langue choisie dans AdvantageScope.
:::

## Développement {#development}

La traduction d'AdvantageScope repose sur l'intelligence artificielle et sur les contributions de la communauté. Comme AdvantageScope évolue très vite, l'IA est indispensable pour garder l'application et sa documentation à jour dans toutes les langues. Les nouveautés et mises à jour sont ainsi disponibles en même temps, quelle que soit la langue que vous utilisez.

Nous veillons à employer le vocabulaire, les anglicismes courants et les termes que les équipes utilisent réellement au quotidien. Malgré tout, les traductions automatiques laissent parfois passer des tournures maladroites ou des imprécisions. Vos retours nous aident beaucoup : vous pouvez signaler toute erreur de traduction en cliquant sur l'icône violette dans l'application (dès qu'une autre langue que l'anglais est sélectionnée).
