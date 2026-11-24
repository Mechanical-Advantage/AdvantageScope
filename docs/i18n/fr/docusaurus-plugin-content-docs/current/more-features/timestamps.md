---
sidebar_position: 5
---

# ⏱️ Horodatages {#timestamps}

AdvantageScope permet de personnaliser l'affichage des horodatages dans toutes les vues, notamment la chronologie, le 📉 [Graphique linéaire](/tab-reference/line-graph), le 🔢 [Tableau](/tab-reference/table) et la 💬 [Console](/tab-reference/console).

## Modes d'affichage {#display-modes}

Vous pouvez choisir le mode d'affichage des horodatages dans la fenêtre des préférences :

- **Commencer à zéro (par défaut) :** décale tous les horodatages pour que les premières données du journal démarrent à zéro (`+0,0 s`). Les horodatages sont alors précédés du signe `+` afin d'indiquer le temps écoulé depuis le début des données.
- **Original :** affiche les horodatages bruts tels qu'ils ont été enregistrés dans le fichier journal, ce qui correspond exactement aux valeurs utilisées par le code du robot.

:::info
À partir de WPILib 2027, les horodatages mesurent le temps écoulé depuis le démarrage de l'appareil sur Systemcore et en simulation. Comme ces valeurs brutes peuvent démarrer à de très grands nombres, l'option **Commencer à zéro** offre une lecture bien plus intuitive.
:::

## Synchronisation multi-journaux {#multi-log-synchronization}

Lorsque vous [ouvrez plusieurs fichiers journaux simultanément](/overview/log-files/#opening-logs), AdvantageScope synchronise et aligne leurs horodatages. En mode **Commencer à zéro**, le point zéro correspond à l'horodatage le plus ancien parmi tous les fichiers chargés. En mode **Original**, la base de temps utilisée est celle du premier journal ouvert, et les autres journaux sont décalés pour s'y aligner.

## Personnalisation {#customization}

Pour changer le mode d'affichage des horodatages, ouvrez les préférences via `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS), ou utilisez le raccourci `Ctrl+,` / `Cmd+,`. Modifiez ensuite le paramètre **Horodatages** selon votre préférence.

<img src="/img/prefs_fr.webp" alt="Fenêtre des préférences" height="450" />
