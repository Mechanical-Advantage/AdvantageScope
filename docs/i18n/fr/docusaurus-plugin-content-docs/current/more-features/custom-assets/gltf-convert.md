# Conversion de fichiers Onshape et STEP en glTF {#converting-onshape-and-step-files-to-gltf}

La vue 3D d'AdvantageScope prend en charge des modèles personnalisés pour les terrains et les robots, que vous pouvez installer en suivant la procédure décrite [ici](/more-features/custom-assets). Tous les modèles doivent être au format [glTF](https://www.khronos.org/gltf/), choisi pour sa rapidité de chargement et sa légèreté. Notez qu'AdvantageScope utilise la variante binaire (`.glb`), qui regroupe toutes les ressources dans un seul fichier, plutôt que le format JSON pur (`.gltf`).

## Conversion d'Onshape en STEP {#converting-onshape-to-step}

Bien qu'Onshape propose une option d'exportation directe vers glTF, celle-ci génère souvent des fichiers très lourds et difficiles à manipuler. Il est plutôt recommandé d'exporter d'abord votre modèle d'Onshape au format STEP, puis de suivre les étapes ci-dessous pour le convertir en glTF.

1. Ouvrez votre document dans Onshape, faites un clic droit sur l'assemblage principal et choisissez « Exporter... » :

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Sélection de l'option « Export... »" />

2. Dans la fenêtre d'options qui s'ouvre, vérifiez que le format d'exportation est bien « STEP » et cliquez sur « Exporter » :

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Fenêtre des options d'exportation" />

3. Patientez pendant la conversion et le téléchargement du fichier. Cela peut prendre quelques minutes.

## Conversion de STEP en glTF {#converting-step-to-gltf}

1. Téléchargez [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Cette application gratuite permet de convertir de nombreux formats 3D, notamment STEP et glTF.

2. Ouvrez CAD Assistant et sélectionnez le fichier STEP à convertir :

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Ouverture du fichier STEP dans CAD Assistant" />

3. Patientez pendant l'importation du fichier STEP. Cela peut prendre quelques minutes.

4. Cliquez sur l'icône « Enregistrer » :

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clic sur l'icône « Enregistrer »" />

5. Choisissez un emplacement de sauvegarde, puis utilisez le menu déroulant pour passer le format d'exportation à « glb » :

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Changement du format d'exportation" />

6. Cliquez sur l'icône d'engrenage, puis activez « Merge faces within the same part » :

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Activation de « Merge faces within the same part »" />

7. Cliquez sur l'icône « Enregistrer » et attendez la fin de l'exportation :

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clic sur l'icône « Enregistrer »" />
