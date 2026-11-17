# Onshape- en STEP-bestanden converteren naar glTF {#converting-onshape-and-step-files-to-gltf}

In de 3D-weergave van AdvantageScope kun je eigen modellen gebruiken voor velden en robots; hoe je die installeert lees je [hier](/more-features/custom-assets). Alle modellen moeten het bestandsformaat [glTF](https://www.khronos.org/gltf/) hebben, omdat dat formaat bestanden compact opslaat en snel laadt. Let op: AdvantageScope gebruikt de binaire variant (.glb), waarin alles in één bestand zit, en niet de losse JSON-variant (.gltf).

## Onshape converteren naar STEP {#converting-onshape-to-step}

Onshape heeft wel een exportoptie voor glTF, maar die levert vaak enorme bestanden op die lastig te gebruiken zijn. Daarom kun je beter vanuit Onshape eerst naar STEP exporteren en dat bestand daarna omzetten naar glTF met de stappen hieronder.

1. Open je bestand in Onshape, klik met de rechtermuisknop op de hoofdsamenstelling (main assembly) en kies "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="De optie &quot;Export...&quot; selecteren" />

2. Controleer in het pop-upvenster of het formaat op "STEP" staat en klik op "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Pop-upvenster met exportopties" />

3. Wacht tot het bestand is omgezet en gedownload. Dit kan een paar minuten duren.

## STEP converteren naar glTF {#converting-step-to-gltf}

1. Download [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Met dit gratis programma zet je allerlei 3D-formaten om, waaronder STEP naar glTF.

2. Open CAD Assistant en kies het STEP-bestand dat je wilt omzetten:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="STEP-bestand openen in CAD Assistant" />

3. Wacht tot het STEP-bestand is geladen. Dit kan een paar minuten duren.

4. Klik op het pictogram "Save":

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Op het pictogram &quot;Save&quot; klikken" />

5. Kies waar je het bestand wilt opslaan en verander het exportformaat in het dropdownmenu naar "glb":

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Het exportformaat wijzigen" />

6. Klik op het tandwielpictogram en vink "Merge faces within the same part" aan:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="&quot;Merge faces within the same part&quot; inschakelen" />

7. Klik op het pictogram "Save" en wacht tot de export klaar is:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Op het pictogram &quot;Save&quot; klikken" />
