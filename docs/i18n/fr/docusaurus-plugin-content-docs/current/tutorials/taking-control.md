---
sidebar_position: 3
---

# 🕹️ Prendre le contrôle : DS et manettes

Comprendre les commandes des pilotes et l'état de la communication est essentiel lors du débogage des problèmes sur le terrain. AdvantageScope offre une intégration transparente avec la [FIRST Driver Station](https://docs.wpilib.org/fr/latest/docs/software/firstdriverstation), vous permettant de suivre les diagnostics en direct, d'inspecter les journaux de la console de pilotage et de visualiser les entrées des manettes.

Dans ce tutoriel, vous apprendrez à :

- Accéder à AdvantageScope directement depuis la **FIRST Driver Station**.
- Vous connecter aux diagnostics en direct de la Driver Station.
- Comparer et synchroniser les **journaux du robot** avec les **journaux de la Driver Station**.
- Consulter la sortie console et les messages d'erreur dans l'onglet **💬 Console**.
- Visualiser les entrées des manettes et les dispositions de contrôleurs dans l'onglet **🎮 Manettes**.

## 1. Accéder à AdvantageScope depuis la FIRST Driver Station

💡 [AdvantageScope Lite](/more-features/advantagescope-lite) est intégré directement à la FIRST Driver Station. Il est accessible en cliquant sur l'icône ⚙️ puis sur « Open Log Viewer in Browser ».

<img src="/img/tutorials/taking-control-1.webp" alt="Le bouton « Open Log Viewer In Browser » dans la FIRST Driver Station" />

_L'interface en anglais est illustrée ci-dessus._

## 2. Se connecter à la Driver Station en direct

Lorsqu'elle fonctionne sur le même ordinateur portable que la FIRST Driver Station, l'application de bureau AdvantageScope peut également diffuser en temps réel la télémétrie et les diagnostics sur l'état de la Driver Station :

1. Lancez la FIRST Driver Station et AdvantageScope.
2. Dans le menu supérieur, sélectionnez `Fichier` > `Se connecter à la console de pilotage`.
3. AdvantageScope se connecte au service local de la Driver Station pour diffuser en temps réel l'état du match, la tension de la batterie, l'état des manettes, etc.
4. Ouvrez l'onglet 📉 [Graphique linéaire](/tab-reference/line-graph) ou 🔢 [Tableau](/tab-reference/table) pour consulter les diagnostics en direct de la DS.

:::tip
Vous pouvez également utiliser le raccourci clavier `Ctrl+Option+Maj+K` (macOS) ou `Ctrl+Alt+Maj+K` (Windows/Linux) pour vous connecter rapidement à la console de pilotage comme source en direct.
:::

## 3. Journaux de la Driver Station vs journaux du robot

Lorsqu'on diagnostique le comportement du robot après un match ou une séance d'entraînement, deux principaux types de journaux sont à prendre en compte :

| Type de journal                   | Source                          | Données enregistrées                                                                                                                                                                    |
| :-------------------------------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Journaux du robot**             | Systemcore via `DataLogManager` | Télémétrie haute fréquence (50+ Hz), état du robot, état des manettes, mesures de capteurs, courants moteurs, états des contrôleurs PID, estimations de pose et données des mécanismes. |
| **Journaux de la Driver Station** | Ordinateur de la Driver Station | Temps d'aller-retour réseau (latence), % de perte de paquets, ping radio, tension de la batterie, % CPU du contrôleur du robot, données de console, état du robot et état des manettes. |

:::important Les journaux du robot sont généralement préférés
Comme les **journaux du robot** enregistrent une télémétrie riche et à haute fréquence directement à la source, ils sont généralement préférables pour analyser le comportement du robot, les boucles de contrôle et les trajectoires autonomes. Cependant, les **journaux de la DS** capturent des événements réseau et de match externes essentiels que le robot ne peut pas mesurer lui-même.

Les données des manettes sont enregistrées dans **les deux journaux**, comme indiqué [ci-dessous](#6-visualizing-joysticks).
:::

## 4. Fusionner et synchroniser plusieurs journaux

AdvantageScope vous permet d'ouvrir et de synchroniser des journaux provenant de plusieurs sources sur une seule chronologie :

1. Ouvrez le fichier journal de votre robot via `Fichier` > `Ouvrir un ou plusieurs journaux...` (ou glissez-déposez le fichier `.wpilog` directement dans AdvantageScope).
2. Dans la barre de menus, sélectionnez `Fichier` > `Ajouter de nouveaux journaux...` et sélectionnez le journal de la Driver Station correspondant.
3. AdvantageScope alignera automatiquement les deux journaux sur une chronologie synchronisée ! Les champs de chaque journal sont classés dans des tables distinctes (par exemple `Log0` et `Log1`).
4. Vous pouvez maintenant superposer la télémétrie du robot (comme le courant moteur ou les estimations de pose) directement avec les signaux de la Driver Station (comme la perte de paquets ou la tension de la batterie) dans le 📉 [Graphique linéaire](/tab-reference/line-graph) pour voir si un comportement inattendu du robot a coïncidé avec une perte radio ou une chute de tension.

<img src="/img/overview/log-files/open-file-1.webp" alt="Ouverture de fichiers journaux enregistrés dans AdvantageScope." />

_L'interface en anglais est illustrée ci-dessus._

## 5. Consulter les données de la console

L'onglet 💬 [Console](/tab-reference/console) permet d'afficher la sortie texte et les journaux d'erreurs imprimés par le robot ou la Driver Station. Les données de console peuvent être enregistrées dans l'un ou l'autre des fichiers journaux :

- **Journaux du robot :** `DataLogManager` de WPILib enregistre automatiquement la sortie console du robot.
- **Journaux de la Driver Station :** Dans la DS, la sortie console et les messages d'événements système sont enregistrés dans le champ `DS:/Dscomm/Console`.

Pour consulter les données de la console :

1. Cliquez sur le bouton **+** dans la barre d'onglets et sélectionnez **Console**.
2. Depuis la barre latérale, faites glisser le champ de console (`DS:/Dscomm/Console` ou `messages`) dans la vue principale.
3. Chaque ligne représente un message du journal avec son horodatage. Cliquez sur n'importe quel message pour positionner la chronologie synchronisée sur tous les onglets ouverts à cet instant précis !
4. Utilisez la zone « Filtrer » (ou appuyez sur `Ctrl+F` / `Cmd+F`) pour rechercher des messages spécifiques, ou cliquez sur l'icône de palette de couleurs pour activer/désactiver la mise en évidence des avertissements et des erreurs.

<img src="/img/tab-reference/console-1.webp" alt="Onglet Console affichant des messages de journal." />

_L'interface en anglais est illustrée ci-dessus._

## 6. Visualiser les manettes {#6-visualizing-joysticks}

L'onglet 🎮 [Manettes](/tab-reference/joysticks) offre une représentation visuelle en temps réel de jusqu'à 6 manettes de jeu, affichant les mouvements d'axes, les gâchettes, les croix directionnelles (POV) et les pressions sur les boutons sur des schémas de contrôleurs réalistes. Pour vous assurer que les entrées des manettes sont enregistrées dans le fichier journal de votre robot, initialisez `DriverStation.startDataLog()` dans votre constructeur `Robot` aux côtés de `DataLogManager`, comme illustré dans 👋 [Bonjour, télémétrie !](/tutorials/hello-telemetry).

1. Cliquez sur le bouton **+** dans la barre d'onglets supérieure et sélectionnez **Manettes**.
2. Dans le tableau au bas de l'onglet, associez chaque identifiant de manette (0 à 5) à la disposition appropriée (par exemple **Manette Xbox**, **Manette PS4** ou **Manette générique**).
3. Lorsque vous parcourez un fichier journal ou diffusez des données en direct depuis la Driver Station, les boutons s'allument et les joysticks analogiques bougent en synchronisation avec les actions du pilote !

<img src="/img/tab-reference/joysticks-1.webp" alt="Onglet Manettes affichant les pressions actives sur les boutons et les positions des sticks analogiques." />

_L'interface en anglais est illustrée ci-dessus._

## Et ensuite ?

Félicitations ! Vous avez terminé la série principale de tutoriels d'AdvantageScope. Vous savez maintenant comment :

- Configurer la télémétrie, vous connecter aux flux en direct et consulter les graphiques et tableaux dans **👋 [Bonjour, télémétrie !](/tutorials/hello-telemetry)**.
- Visualiser l'odométrie 2D/3D, les trajectoires et les mécanismes dans **🤖 [Sur le terrain](/tutorials/to-the-field)**.
- Diffuser les diagnostics de la Driver Station, fusionner des journaux multi-sources et rejouer les entrées des manettes dans **🕹️ [Prendre le contrôle](/tutorials/taking-control)**.

Poursuivez votre découverte des outils et fonctionnalités avancées d'AdvantageScope :

- **📂 [Fichiers journaux](/overview/log-files) :** Découvrez les formats de journaux pris en charge, l'exportation de données et les téléchargements groupés.
- **🛜 [Sources en direct](/overview/live-sources) :** Guide détaillé sur la connexion aux sources en direct, y compris le mode de réglage.
- **[Référence des onglets](/category/tab-reference) :** Guides de référence sur les fonctionnalités de chaque type de visualisation.
- **[Plus de fonctionnalités](/category/more-features) :** Documentation et théorie sur les fonctionnalités supplémentaires d'AdvantageScope.
