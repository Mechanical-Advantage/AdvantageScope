---
sidebar_position: 7
---

# 🎬 Vidéo

L'onglet vidéo permet de comparer côte à côte les données de journal avec une vidéo de match qui a été enregistrée séparément. Les étapes ci-dessous montrent comment charger une vidéo et la synchroniser avec le journal.

## Chargement de la vidéo

AdvantageScope propose trois options pour charger une vidéo :

1. **Fichier local :** Cliquez sur l'icône de fichier grise, puis choisissez le fichier vidéo à charger. La plupart des formats vidéo courants sont pris en charge.
2. **YouTube :** Copiez un lien YouTube dans le presse-papiers, puis cliquez sur l'icône de presse-papiers rouge. Après quelques secondes, le téléchargement de la vidéo commencera.
3. **The Blue Alliance :** Cliquez sur l'icône bleue TBA pour charger automatiquement la vidéo du match sur la base du fichier journal. Si plusieurs vidéos sont disponibles, choisissez la vidéo à télécharger dans le menu surgissant. Cette fonctionnalité nécessite une clé API pour TBA, qui doit être obtenue sur [thebluealliance.com/account](https://www.thebluealliance.com/account) et copiée dans la page des préférences d'AdvantageScope sous « Clé API TBA ».

<img src="/img/tab-reference/video-1.png" alt="Sélecteur de source" />

Après avoir choisi une vidéo, la chronologie en bas à droite commence à devenir bleue pour indiquer les images qui ont été mises en cache (cette étape est nécessaire pour une lecture fluide). Cette fonctionnalité est destinée uniquement aux vidéos de la durée d'un match en raison de la conversion d'images requise.

:::warning
Le téléchargement de vidéos YouTube et TBA peut échouer de manière inattendue en raison de modifications sur les serveurs de YouTube. En cas de problème, essayez de mettre à jour AdvantageScope ou d'utiliser un fichier vidéo local à la place.
:::

:::info
AdvantageScope nécessite [FFmpeg](https://ffmpeg.org) pour traiter les fichiers vidéo. Si une copie valide de FFmpeg n'est pas trouvée sur le PATH de votre système, AdvantageScope vous invitera à télécharger FFmpeg depuis Internet lors du premier chargement d'une vidéo. L'installation automatique de FFmpeg est uniquement prise en charge sur Windows et macOS; les utilisateurs de Linux devront peut-être installer manuellement FFmpeg et l'ajouter au PATH du système.
:::

## Navigation dans la vidéo

Lorsqu'une vidéo est initialement chargée et n'a pas encore été synchronisée avec les données du journal, les contrôles de lecture pour la vidéo et le journal sont encore indépendants. Utilisez la chronologie et les boutons en bas à droite pour contrôler la lecture de la vidéo. Les raccourcis clavier suivants sont également pris en charge :

- / = activer ou désactiver la lecture
- → = avancer d'une image
- ← = reculer d'une image
- \> = avancer de cinq secondes
- < = reculer de cinq secondes

<img src="/img/tab-reference/video-2.png" alt="Contrôles vidéo" />

## Synchronisation automatique

La plupart des vidéos de match seront synchronisées automatiquement avec le journal peu de temps après le chargement des images de la période autonome du match. Aucune action n'est requise; si la synchronisation réussit, les contrôles vidéo seront verrouillés automatiquement (voir « Lecture » ci-dessous).

:::warning
La synchronisation automatique fonctionne uniquement sur les vidéos de match qui incluent des superpositions de scores et peut ne pas réussir dans tous les cas. Si les contrôles vidéo ne sont pas verrouillés automatiquement une fois toutes les images chargées, une synchronisation manuelle est requise.
:::

## Synchronisation manuelle

Tout d'abord, utilisez les contrôles vidéo pour naviguer vers un emplacement connu du match comme le début de l'auto. Ensuite, sélectionnez l'heure dans le fichier journal qui s'aligne avec l'image actuelle de la vidéo.

:::tip
Le curseur sur la chronologie s'aimante au début et à la fin des périodes de match, ce qui permet de sélectionner plus facilement et plus précisément le début du match.
:::

Une fois la vidéo et le journal alignés, cliquez sur l'icône de cadenas à côté de la chronologie vidéo (ou appuyez sur **↑ ou ↓**). Les contrôles vidéo sont maintenant désactivés. Cliquez à nouveau sur l'icône de cadenas pour déverrouiller la lecture vidéo.

<img src="/img/tab-reference/video-3.png" alt="Bouton de verrouillage" />

## Lecture

Une fois verrouillée, la lecture vidéo reste alignée avec l'heure sélectionnée dans le journal. Notez que la lecture du son n'est pas prise en charge car la vidéo d'origine est convertie en une représentation image par image pour prendre en charge la synchronisation du journal.

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie est utilisée pour contrôler la lecture et la visualisation. Cliquer sur la chronologie sélectionne un moment, et faire un clic droit le désélectionne. L'heure sélectionnée est synchronisée sur tous les onglets, ce qui permet de trouver rapidement cet emplacement dans d'autres vues.

Les sections jaunes indiquent quand le robot est en mode autonome, les sections bleues indiquent quand le robot est en mode téléopéré et les sections grises indiquent quand le robot est en mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Une plage peut également être sélectionnée en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche et la droite en faisant défiler horizontalement (sur les appareils pris en charge), ou en cliquant et en faisant glisser sur la chronologie. Lors d'une connexion en direct, le défilement vers la gauche déverrouille à partir de l'heure actuelle, et le défilement tout à fait vers la droite verrouille à nouveau à l'heure actuelle. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.png" alt="Chronologie" />

</details>

:::tip
Si vous le souhaitez, le champ de vision de la caméra peut être ajusté dans la vue du terrain 3D pour correspondre à l'apparence de la vidéo. Pour plus de détails, consultez « Options de caméra » sur la page 👀 [Terrain 3D](/tab-reference/3d-field).
:::

<img src="/img/tab-reference/video-4.png" alt="Instantane vidéo avec odométrie" />
