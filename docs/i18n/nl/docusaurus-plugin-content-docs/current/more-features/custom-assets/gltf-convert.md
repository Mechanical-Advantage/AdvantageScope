# Onshape- en STEP-bestanden converteren naar glTF {#converting-onshape-and-step-files-to-gltf}

De 3D-weergave van AdvantageScope accepteert aangepaste modellen voor velden en robots, die kunnen worden geïnstalleerd met behulp van het proces dat [hier](/more-features/custom-assets) wordt beschreven. Alle modellen moeten het bestandsformaat [glTF](https://www.khronos.org/gltf/) gebruiken, gekozen vanwege de efficiëntie bij het opslaan en laden van modellen. Merk op dat AdvantageScope de binaire vorm (.glb) gebruikt, die alle bronnen in één bestand bevat, in plaats van de pure JSON-vorm (.gltf).

## Onshape converteren naar STEP {#converting-onshape-to-step}

Hoewel Onshape een exportoptie voor glTF bevat, levert dit vaak zeer grote bestanden op die moeilijk te beheren zijn. In plaats daarvan wordt aanbevolen om vanuit Onshape naar STEP te exporteren en vervolgens de instructies in de volgende sectie te volgen om naar glTF te converteren.

1. Na het openen van het Onshape-bestand klik je met de rechtermuisknop op de hoofdsamenstelling en kies je "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="De optie &quot;Export...&quot; selecteren" />

2. Zorg er in het pop-upvenster met opties voor dat het exportformaat "STEP" is en klik op "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Pop-upvenster met exportopties" />

3. Wacht tot het bestand is geconverteerd en gedownload. Dit kan enkele minuten duren.

## STEP converteren naar glTF {#converting-step-to-gltf}

1. Download [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Deze gratis applicatie kan converteren tussen vele 3D-formaten, waaronder STEP en glTF.

2. Open CAD Assistant en selecteer het STEP-bestand dat je wilt converteren:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="STEP-bestand openen in CAD Assistant" />

3. Wacht tot het STEP-bestand is geïmporteerd. Dit kan enkele minuten duren.

4. Klik op het pictogram "Save":

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Op het pictogram &quot;Save&quot; klikken" />

5. Kies een opslaglocatie en gebruik vervolgens het vervolgkeuzemenu om het exportformaat te wijzigen naar "glb":

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Het exportformaat wijzigen" />

6. Klik op het tandwielpictogram en schakel vervolgens "Merge faces within the same part" in:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="&quot;Merge faces within the same part&quot; inschakelen" />

7. Klik op het pictogram "Save" en wacht tot de export is voltooid:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Op het pictogram &quot;Save&quot; klikken" />
