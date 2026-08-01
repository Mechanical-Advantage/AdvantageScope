# Conversia fișierelor Onshape & STEP în glTF

Vizualizarea 3D a AdvantageScope acceptă modele personalizate pentru terenuri și roboți, care pot fi instalate folosind procesul descris [aici](/more-features/custom-assets). Toate modelele trebuie să utilizeze formatul de fișier [glTF](https://www.khronos.org/gltf/), ales pentru eficiența sa la stocarea și încărcarea modelelor. Rețineți că AdvantageScope utilizează forma binară (.glb), care include toate resursele într-un singur fișier, mai degrabă decât forma JSON pură (.gltf).

## Conversia Onshape în STEP

Deși Onshape include o opțiune de export pentru glTF, aceasta produce adesea fișiere foarte mari care sunt dificil de gestionat. În schimb, se recomandă să exportați din Onshape în STEP, apoi să urmați instrucțiunile din secțiunea următoare pentru a converti în glTF.

1. După deschiderea fișierului Onshape, dați clic dreapta pe ansamblul principal și alegeți „Export...”:

<img src="/img/more-features/custom-assets/gltf-convert-1.png" alt="Selecting the &quot;Export...&quot; option" />

2. În fereastra pop-up cu opțiuni, asigurați-vă că formatul de export este „STEP” și dați clic pe „Export”:

<img src="/img/more-features/custom-assets/gltf-convert-2.png" alt="Export options pop-up" />

3. Așteptați ca fișierul să se convertească și să se descarce. Acest lucru poate dura câteva minute.

## Conversia STEP în glTF

1. Descărcați [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Această aplicație gratuită poate converti între multe formate 3D, inclusiv STEP și glTF.

2. Deschideți CAD Assistant și selectați fișierul STEP de convertit:

<img src="/img/more-features/custom-assets/gltf-convert-3.png" alt="Opening STEP file in CAD Assistant" />

3. Așteptați ca fișierul STEP să se importe. Acest lucru poate dura câteva minute.

4. Dați clic pe pictograma „Save”:

<img src="/img/more-features/custom-assets/gltf-convert-4.png" alt="Clicking the &quot;Save&quot; icon" />

5. Alegeți o locație de salvare, apoi utilizați meniul derulant pentru a schimba formatul de export la „glb”:

<img src="/img/more-features/custom-assets/gltf-convert-5.png" alt="Switching the export format" />

6. Dați clic pe pictograma rotiță, apoi activați „Merge faces within the same part”:

<img src="/img/more-features/custom-assets/gltf-convert-6.png" alt="Enabling &quot;Merge faces within the same part&quot;" />

7. Dați clic pe pictograma „Save” și așteptați ca exportul să se termine:

<img src="/img/more-features/custom-assets/gltf-convert-7.png" alt="Clicking the &quot;Save&quot; icon" />
