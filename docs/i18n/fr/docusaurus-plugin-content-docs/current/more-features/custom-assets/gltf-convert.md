# Conversion de fichiers Onshape et STEP en glTF

La vue 3D d'AdvantageScope accepte des modèles personnalisés pour les terrains et les robots, qui peuvent être installés en utilisant la procédure décrite [ici](/more-features/custom-assets). Tous les modèles doivent utiliser le format de fichier [glTF](https://www.khronos.org/gltf/), choisi pour son efficacité lors du stockage et du chargement des modèles. Notez qu'AdvantageScope utilise la forme binaire (.glb), qui comprend toutes les ressources dans un seul fichier, plutôt que la forme JSON pure (.gltf).

## Conversion d'Onshape en STEP

Bien qu'Onshape comprenne une option d'exportation pour glTF, cela produit souvent de très grands fichiers difficiles à gérer. Au lieu de cela, il est recommandé d'exporter depuis Onshape vers STEP, puis de suivre les instructions de la section suivante pour convertir en glTF.

1. Après avoir ouvert le fichier Onshape, faites un clic droit sur l'assemblage principal et choisissez « Exporter... » :

<img src="/img/more-features/custom-assets/gltf-convert-1.png" alt="Sélection de l'option « Exporter... »" />

2. Dans la fenêtre surgissante des options, assurez-vous que le format d'exportation est « STEP » et cliquez sur « Exporter » :

<img src="/img/more-features/custom-assets/gltf-convert-2.png" alt="Fenêtre surgissante des options d'exportation" />

3. Attendez que le fichier se convertisse et se télécharge. Cela peut prendre quelques minutes.

## Conversion de STEP en glTF

1. Téléchargez [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Cette application gratuite est capable de convertir entre de nombreux formats 3D, notamment STEP et glTF.

2. Ouvrez CAD Assistant et sélectionnez le fichier STEP à convertir :

<img src="/img/more-features/custom-assets/gltf-convert-3.png" alt="Ouverture d'un fichier STEP dans CAD Assistant" />

3. Attendez que le fichier STEP soit importé. Cela peut prendre quelques minutes.

4. Cliquez sur l'icône « Enregistrer » :

<img src="/img/more-features/custom-assets/gltf-convert-4.png" alt="Clic sur l'icône « Enregistrer »" />

5. Choisissez un emplacement d'enregistrement, puis utilisez le menu déroulant pour passer le format d'exportation à « glb » :

<img src="/img/more-features/custom-assets/gltf-convert-5.png" alt="Changement du format d'exportation" />

6. Cliquez sur l'icône d'engrenage, puis activez « Merge faces within the same part » :

<img src="/img/more-features/custom-assets/gltf-convert-6.png" alt="Activation de « Merge faces within the same part »" />

7. Cliquez sur l'icône « Enregistrer » et attendez que l'exportation se termine :

<img src="/img/more-features/custom-assets/gltf-convert-7.png" alt="Clic sur l'icône « Enregistrer »" />
