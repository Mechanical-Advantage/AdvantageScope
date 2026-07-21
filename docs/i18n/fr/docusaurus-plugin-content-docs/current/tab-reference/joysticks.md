---
sidebar_position: 8
---

# 🎮 Manettes

L'onglet manettes montre l'état de jusqu'à six manettes connectées. L'image ci-dessous montre un exemple de disposition, avec deux manettes Xbox et une manette générique. Chaque bouton est mis en surbrillance lorsqu'il est enfoncé, et les états des joysticks et des autres axes sont affichés.

<img src="/img/tab-reference/joysticks-1.png" alt="Aperçu de l'onglet manettes" />

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie est utilisée pour contrôler la lecture et la visualisation. Cliquer sur la chronologie sélectionne un moment, et faire un clic droit le désélectionne. L'heure sélectionnée est synchronisée sur tous les onglets, ce qui permet de trouver rapidement cet emplacement dans d'autres vues.

Les sections jaunes indiquent quand le robot est en mode autonome, les sections bleues indiquent quand le robot est en mode téléopéré et les sections grises indiquent quand le robot est en mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Une plage peut également être sélectionnée en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche et la droite en faisant défiler horizontalement (sur les appareils pris en charge), ou en cliquant et en faisant glisser sur la chronologie. Lors d'une connexion en direct, le défilement vers la gauche déverrouille à partir de l'heure actuelle, et le défilement tout à fait vers la droite verrouille à nouveau à l'heure actuelle. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.png" alt="Chronologie" />

</details>

## Panneau de contrôle

Sélectionnez les types de manettes dans le tableau au bas de l'onglet. Les identifiants de manette vont de 0 à 5 et correspondent aux identifiants dans la console de pilotage et WPILib. Plus d'informations sur les manettes se trouvent dans la [documentation WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html).

AdvantageScope comprend un ensemble de manettes courantes, y compris une « Manette générique » avec tous les boutons, axes et POV dans un format de grille (visible ci-dessus). Pour ajouter une manette personnalisée, voir [Ressources personnalisées](/more-features/custom-assets).

:::warning
**Les données de manette ne sont PAS disponibles via une connexion NetworkTables avec WPILib de base.** Les fichiers journaux WPILib (avec la [journalisation des manettes activée](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), les journaux AdvantageKit et la diffusion en direct AdvantageKit sont pris en charge.
:::
