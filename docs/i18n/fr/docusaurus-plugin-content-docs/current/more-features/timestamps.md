---
sidebar_position: 5
---

# ⏱️ Horodatages {#timestamps}

AdvantageScope prend en charge des options d'affichage d'horodatage personnalisables dans toutes les vues, y compris la chronologie, le 📉 [Graphique linéaire](/tab-reference/line-graph), le 🔢 [Tableau](/tab-reference/table) et la 💬 [Console](/tab-reference/console).

## Modes d'affichage {#display-modes}

Le mode d'affichage des horodatages peut être configuré dans la fenêtre des préférences :

- **Commencer à zéro (Par défaut) :** Décale tous les horodatages afin que les premières données du journal commencent à zéro (`+0.0s`). Les horodatages affichés dans ce mode sont préfixés par le symbole `+` pour indiquer le temps écoulé depuis le début des données.
- **Original :** Affiche les horodatages en utilisant leurs valeurs numériques d'origine telles qu'enregistrées dans le fichier journal, correspondant aux valeurs exactes utilisées par le code du robot.

:::info
À partir de WPILib 2027, les horodatages sont mesurés à l'aide du temps écoulé depuis le démarrage de l'appareil sur Systemcore et en simulation. Comme les horodatages bruts peuvent commencer par de grands nombres arbitraires, **Commencer à zéro** est proposé comme une option de visualisation plus intuitive.
:::

## Synchronisation multi-journaux {#multi-log-synchronization}

Lorsque [plusieurs fichiers journaux sont ouverts simultanément](/overview/log-files/#opening-logs), AdvantageScope synchronise et aligne leurs horodatages. En mode **Commencer à zéro**, le point zéro est défini sur l'horodatage le plus ancien de tous les fichiers chargés. En mode **Original**, les horodatages sont affichés en utilisant la base de temps du premier journal ouvert, les journaux supplémentaires étant décalés pour s'aligner sur celui-ci.

## Personnalisation {#customization}

Pour modifier le mode d'affichage des horodatages, ouvrez la fenêtre des préférences en cliquant sur `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS), ou en appuyant sur `Ctrl+,` / `Cmd+,`. Mettez à jour le paramètre **Horodatages** vers l'option souhaitée.

<img src="/img/prefs_fr.webp" alt="Diagramme des préférences" height="350" />
