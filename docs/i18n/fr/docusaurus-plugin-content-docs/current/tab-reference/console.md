---
sidebar_position: 5
---

# 💬 Console

La vue console est conçue pour afficher un champ de chaîne de caractères unique contenant des données de console. Certains champs suggérés sont énumérés ci-dessous.

- **DS:/Dscomm/Console** - Enregistré par la console de pilotage FIRST.
- **messages** - Enregistré par la journalisation intégrée de WPILib sur la base des appels à la méthode [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Enregistré automatiquement par AdvantageKit pendant le fonctionnement du robot (utilisez `System.out.println` comme d'habitude).
- **/ReplayOutputs/Console** - Enregistré automatiquement par AdvantageKit pendant la relecture du journal (utilisez `System.out.println` comme d'habitude).

Faites glisser le champ souhaité vers la vue principale pour commencer. Chaque ligne représente une mise à jour du champ. Pour les journaux WPILib, une nouvelle ligne est créée pour chaque ligne enregistrée. Pour les journaux AdvantageKit, une nouvelle ligne est créée pour chaque cycle de boucle.

<img src="/img/tab-reference/console-1.png" alt="Vue console" />

:::info
Cliquez sur l'icône de palette de couleurs pour activer ou désactiver la mise en surbrillance des messages d'avertissement et d'erreur. Pour les journaux WPILib et AdvantageKit, les messages sont mis en surbrillance s'ils contiennent le texte « warning » ou « error ».
:::

Les contrôles sont similaires à l'onglet 🔢 [Tableau](../tab-reference/table). L'heure sélectionnée est synchronisée sur tous les onglets. Cliquez sur une ligne pour la sélectionner, ou survolez une ligne pour prévisualiser ce moment dans n'importe quelle fenêtre détachée visible. Cliquer sur le bouton ↓ permet d'aller à l'heure sélectionnée (ou à l'heure saisie dans la zone).

Saisissez du texte dans la zone « Filtrer » pour n'afficher que les lignes qui contiennent le texte du filtre. Appuyez sur `Ctrl+F` pour sélectionner rapidement la zone « Filtrer ». Ajoutez un « ! » au début du texte du filtre pour _exclure_ les messages correspondants de la vue principale.

:::tip
Cliquez sur l'icône d'enregistrement pour exporter les données de la console vers un fichier texte.
:::
