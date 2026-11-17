---
sidebar_position: 8
---

# 🎮 Manettes {#joysticks}

L'onglet Manettes affiche l'état de jusqu'à six manettes connectées. L'image ci-dessous montre un exemple avec deux manettes Xbox et une manette générique. Chaque bouton s'allume lorsqu'il est pressé, et la position des joysticks ainsi que des autres axes s'affiche en direct.

<img src="/img/tab-reference/joysticks-1.webp" alt="Aperçu de l'onglet Manettes" />

_L'interface en anglais est illustrée ci-dessus._

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie sert à piloter la lecture et la visualisation. Cliquez dessus pour sélectionner un instant précis, et faites un clic droit pour le désélectionner. L'instant choisi est synchronisé dans tous les onglets, ce qui vous permet de retrouver facilement ce moment dans d'autres vues.

Les zones jaunes correspondent au mode autonome, les zones bleues au mode téléopéré et les zones grises au mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et utilisez la molette vers le haut ou vers le bas. Vous pouvez aussi sélectionner une plage en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche ou la droite par défilement horizontal (sur les appareils compatibles) ou en cliquant-glissant sur la chronologie. Lors d'une connexion en direct, faire défiler vers la gauche déverrouille le suivi de l'instant actuel, et revenir complètement à droite le verrouille à nouveau. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.webp" alt="Chronologie" />

</details>

## Panneau de contrôle {#control-pane}

Choisissez le type de chaque manette dans le tableau au bas de l'onglet. Les identifiants vont de 0 à 5 et correspondent aux ports de la console de pilotage et de WPILib. Pour en savoir plus sur la gestion des manettes, consultez la [documentation WPILib](https://docs.wpilib.org/fr/stable/docs/software/basic-programming/joystick.html).

AdvantageScope inclut plusieurs modèles courants, ainsi qu'une « Manette générique » présentant tous les boutons, axes et croix directionnelles (POV) sous forme de grille (comme ci-dessus). Pour ajouter votre propre disposition de manette, consultez [Ressources personnalisées](/more-features/custom-assets).

:::warning
**Les données des manettes ne sont PAS disponibles via NetworkTables avec WPILib standard.** Vous devez utiliser des fichiers journaux WPILib (avec la [journalisation des manettes activée](https://docs.wpilib.org/fr/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), des journaux AdvantageKit ou la diffusion en direct AdvantageKit.
:::
