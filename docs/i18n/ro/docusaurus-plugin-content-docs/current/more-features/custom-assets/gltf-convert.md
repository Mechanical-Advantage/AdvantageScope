# Conversia fișierelor Onshape & STEP în glTF {#converting-onshape-and-step-files-to-gltf}

Vizualizarea 3D din AdvantageScope acceptă modele personalizate pentru terenuri și roboți, pe care le poți instala urmând pașii descriși [aici](/more-features/custom-assets). Toate modelele trebuie să fie în formatul [glTF](https://www.khronos.org/gltf/), ales deoarece este eficient atât la stocare, cât și la încărcare. Reține că AdvantageScope folosește formatul binar (.glb), care include toate resursele într-un singur fișier, nu varianta JSON pură (.gltf).

## Conversia Onshape în STEP {#converting-onshape-to-step}

Deși Onshape include o opțiune de export pentru glTF, aceasta produce adesea fișiere foarte mari, greu de gestionat. În schimb, îți recomandăm să exporți din Onshape în STEP, apoi să urmezi instrucțiunile din secțiunea următoare pentru a le converti în glTF.

1. După ce ai deschis fișierul Onshape, dă clic dreapta pe ansamblul principal și alege „Export...”:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selectarea opțiunii „Export...”" />

2. În fereastra pop-up cu opțiuni, asigură-te că formatul de export este „STEP” și dă clic pe „Export”:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Fereastră pop-up cu opțiuni de export" />

3. Așteaptă ca fișierul să se convertească și să se descarce. Acest pas poate dura câteva minute.

## Conversia STEP în glTF {#converting-step-to-gltf}

1. Descarcă [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Această aplicație gratuită poate converti între multe formate 3D, inclusiv STEP și glTF.

2. Deschide CAD Assistant și selectează fișierul STEP pe care vrei să îl convertești:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Deschiderea fișierului STEP în CAD Assistant" />

3. Așteaptă ca fișierul STEP să se importe. Acest pas poate dura câteva minute.

4. Dă clic pe pictograma „Save”:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clic pe pictograma „Save”" />

5. Alege o locație de salvare, apoi folosește meniul derulant pentru a schimba formatul de export în „glb”:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Schimbarea formatului de export" />

6. Dă clic pe pictograma rotiță, apoi activează „Merge faces within the same part”:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Activarea „Merge faces within the same part”" />

7. Dă clic pe pictograma „Save” și așteaptă ca exportul să se termine:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clic pe pictograma „Save”" />
