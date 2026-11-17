---
sidebar_position: 7
---

# 🎬 Vidéo {#video}

L'onglet Vidéo permet de comparer côte à côte les données du journal et une vidéo de match enregistrée séparément. Les étapes ci-dessous expliquent comment charger une vidéo et la synchroniser avec votre journal.

## Chargement de la vidéo {#loading-the-video}

AdvantageScope propose trois façons de charger une vidéo :

1. **Fichier local :** cliquez sur l'icône de fichier grise, puis sélectionnez votre fichier vidéo. La plupart des formats courants sont pris en charge.
2. **YouTube :** copiez un lien YouTube dans le presse-papiers, puis cliquez sur l'icône rouge du presse-papiers. Après quelques secondes, le téléchargement démarre.
3. **The Blue Alliance :** cliquez sur l'icône bleue TBA pour charger automatiquement la vidéo du match correspondant au fichier journal. Si plusieurs vidéos sont disponibles, choisissez celle à télécharger dans le menu qui s'affiche. Cette option nécessite une clé API TBA, à récupérer sur [thebluealliance.com/account](https://www.thebluealliance.com/account) puis à coller dans les préférences d'AdvantageScope sous « Clé API TBA ».

<img src="/img/tab-reference/video-1.webp" alt="Sélecteur de source" />

Une fois la vidéo choisie, la chronologie en bas à droite devient progressivement bleue pour indiquer les images mises en cache (cette étape garantit une lecture fluide). En raison de cette conversion image par image, cette fonctionnalité est pensée uniquement pour des vidéos de la durée d'un match.

:::warning
Le téléchargement depuis YouTube et TBA peut échouer de manière imprévue suite à des modifications sur les serveurs de YouTube. En cas de souci, essayez de mettre à jour AdvantageScope ou utilisez plutôt un fichier vidéo local.
:::

:::info
AdvantageScope s'appuie sur [FFmpeg](https://ffmpeg.org) pour traiter les fichiers vidéo. Si aucune installation valide de FFmpeg n'est détectée dans le PATH de votre système, AdvantageScope vous proposera de le télécharger lors du premier chargement d'une vidéo. L'installation automatique n'est prise en charge que sous Windows et macOS; sous Linux, vous devrez peut-être installer FFmpeg manuellement et l'ajouter au PATH.
:::

## Navigation dans la vidéo {#navigating-the-video}

Lorsqu'une vidéo vient d'être chargée et n'est pas encore synchronisée avec le journal, ses commandes de lecture restent indépendantes. Utilisez la chronologie et les boutons en bas à droite pour contrôler la lecture, ou les raccourcis clavier suivants :

- / = lancer ou mettre en pause la lecture
- → = avancer d'une image
- ← = reculer d'une image
- \> = avancer de cinq secondes
- < = reculer de cinq secondes

<img src="/img/tab-reference/video-2.webp" alt="Commandes vidéo" />

## Synchronisation automatique {#automatic-synchronization}

La plupart des vidéos de match se synchronisent automatiquement avec le journal peu après le chargement des images de la période autonome. Vous n'avez rien à faire : si la synchronisation réussit, les commandes vidéo sont verrouillées automatiquement (voir « Lecture » ci-dessous).

:::warning
La synchronisation automatique ne fonctionne que sur les vidéos de match affichant les scores en surimpression et peut parfois échouer. Si les commandes vidéo ne se verrouillent pas automatiquement une fois toutes les images chargées, vous devrez synchroniser la vidéo manuellement.
:::

## Synchronisation manuelle {#manual-synchronization}

Commencez par utiliser les commandes vidéo pour vous placer à un repère connu du match, comme le début de la période autonome. Sélectionnez ensuite dans le fichier journal l'instant qui correspond exactement à cette image.

:::tip
Le curseur sur la chronologie s'aimante au début et à la fin de chaque phase du match, ce qui facilite grandement la sélection précise du coup d'envoi.
:::

Une fois la vidéo et le journal alignés, cliquez sur l'icône de cadenas à côté de la chronologie vidéo (ou appuyez sur **↑** ou **↓**). Les commandes vidéo sont alors désactivées. Cliquez à nouveau sur le cadenas pour déverrouiller la lecture vidéo.

<img src="/img/tab-reference/video-3.webp" alt="Bouton de verrouillage" />

## Lecture {#playback}

Une fois verrouillée, la lecture vidéo reste calée sur l'instant sélectionné dans le journal. Notez que le son n'est pas pris en charge, car la vidéo d'origine est convertie image par image pour permettre cette synchronisation précise.

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie sert à piloter la lecture et la visualisation. Cliquer dessus sélectionne un instant précis, et un clic droit le désélectionne. Comme l'heure sélectionnée est synchronisée entre tous les onglets, vous pouvez retrouver ce même moment en un coup d'œil dans les autres vues.

Les zones jaunes indiquent les phases en mode autonome, les zones bleues le mode téléopéré, et les zones grises le mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Vous pouvez aussi sélectionner une plage en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Pour vous déplacer vers la gauche ou la droite, faites défiler horizontalement (sur les appareils compatibles) ou cliquez et faites glisser sur la chronologie. En mode en direct, faire défiler vers la gauche déverrouille la vue de l'heure actuelle, tandis que faire défiler complètement vers la droite la verrouille à nouveau. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.webp" alt="Chronologie" />

</details>

:::tip
Si vous le souhaitez, vous pouvez ajuster le champ de vision de la caméra dans la vue Terrain 3D pour qu'il corresponde à l'angle de la vidéo. Consultez la section « Options de caméra » sur la page 👀 [Terrain 3D](/tab-reference/3d-field) pour en savoir plus.
:::

<img src="/img/tab-reference/video-4.webp" alt="Instantané vidéo avec odométrie" />
