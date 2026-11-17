---
sidebar_position: 5
---

# 💬 Console {#console}

La vue Console sert à afficher un champ de type chaîne de caractères contenant des messages de console. Voici les champs les plus courants :

- **DS:/Dscomm/Console** : enregistré par la console de pilotage FIRST.
- **messages** : enregistré par la journalisation intégrée de WPILib via les appels à [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** : enregistré automatiquement par AdvantageKit pendant le fonctionnement du robot (utilisez `System.out.println` comme d'habitude).
- **/ReplayOutputs/Console** : enregistré automatiquement par AdvantageKit pendant la relecture d'un journal (utilisez `System.out.println` comme d'habitude).

Pour commencer, faites glisser le champ souhaité dans la vue principale. Chaque ligne correspond à une mise à jour du champ : avec les journaux WPILib, une ligne apparaît pour chaque texte enregistré ; avec AdvantageKit, une ligne est créée à chaque cycle de boucle.

<img src="/img/tab-reference/console-1.webp" alt="Vue de la console" />

_L'interface en anglais est illustrée ci-dessus._

:::info
Cliquez sur l'icône de palette de couleurs pour activer ou désactiver la mise en surbrillance des avertissements et des erreurs. Dans les journaux WPILib et AdvantageKit, les messages contenant « warning » ou « error » sont automatiquement mis en évidence.
:::

Les contrôles fonctionnent comme dans l'onglet 🔢 [Tableau](../tab-reference/table). L'instant sélectionné est synchronisé dans tous les onglets : cliquez sur une ligne pour la sélectionner, ou survolez-la pour prévisualiser ce moment dans les fenêtres détachées ouvertes. Le bouton ↓ permet de sauter directement à l'instant sélectionné (ou à celui saisi dans le champ). Le format des horodatages et des saisies dépend de votre préférence [Horodatages](/more-features/timestamps).

Tapez du texte dans le champ « Filtrer » pour n'afficher que les lignes qui le contiennent. Appuyez sur `Ctrl+F` pour placer rapidement le curseur dans ce champ. Ajoutez un `!` au début du filtre pour _exclure_ les messages correspondants.

## Formatage ANSI {#ansi-formatting}

La console prend en charge la mise en forme et les couleurs via les séquences d'échappement ANSI standard :

- **Styles de texte :** gras, atténué, italique et souligné
- **Couleurs de texte et d'arrière-plan :** les 16 couleurs standard (normales et haute intensité)
- **Couleurs 8 bits et 24 bits :** palette de 256 couleurs et RVB 24 bits
- **Réinitialisations ciblées :** remise à zéro de certains styles ou couleurs tout en conservant les autres

:::tip
Cliquez sur l'icône d'enregistrement pour exporter les messages de la console dans un fichier texte.
:::
