# Conversia fișierelor Onshape & STEP în glTF {#converting-onshape-and-step-files-to-gltf}

Vizualizarea 3D a AdvantageScope acceptă modele personalizate pentru terenuri și roboți, care pot fi instalate folosind procesul descris [aici](/more-features/custom-assets). Toate modelele trebuie să utilizeze formatul de fișier [glTF](https://www.khronos.org/gltf/), ales pentru eficiența sa la stocarea și încărcarea modelelor. Rețineți că AdvantageScope utilizează forma binară (.glb), care include toate resursele într-un singur fișier, mai degrabă decât forma JSON pură (.gltf).

## Conversia Onshape în STEP {#converting-onshape-to-step}

Deși Onshape include o opțiune de export pentru glTF, aceasta produce adesea fișiere foarte mari care sunt dificil de gestionat. În schimb, se recomandă să exportați din Onshape în STEP, apoi să urmați instrucțiunile din secțiunea următoare pentru a converti în glTF.

1. După deschiderea fișierului Onshape, dați clic dreapta pe ansamblul principal și alegeți „Export...”:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selectarea opțiunii „Export...”" />

2. În fereastra pop-up cu opțiuni, asigurați-vă că formatul de export este „STEP” și dați clic pe „Export”:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Fereastră pop-up cu opțiuni de export" />

3. Așteptați ca fișierul să se convertească și să se descarce. Acest lucru poate dura câteva minute.

## Conversia STEP în glTF {#converting-step-to-gltf}

1. Descărcați [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Această aplicație gratuită poate converti între multe formate 3D, inclusiv STEP și glTF.

2. Deschideți CAD Assistant și selectați fișierul STEP de convertit:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Deschiderea fișierului STEP în CAD Assistant" />

3. Așteptați ca fișierul STEP să se importe. Acest lucru poate dura câteva minute.

4. Dați clic pe pictograma „Save”:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clic pe pictograma „Salvare”" />

5. Alegeți o locație de salvare, apoi utilizați meniul derulant pentru a schimba formatul de export la „glb”:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Schimbarea formatului de export" />

6. Dați clic pe pictograma rotiță, apoi activați „Merge faces within the same part”:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Activarea „Merge faces within the same part”" />

7. Dați clic pe pictograma „Save” și așteptați ca exportul să se termine:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clic pe pictograma „Salvare”" />
