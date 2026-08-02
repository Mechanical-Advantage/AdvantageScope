# Onshape және STEP файлдарын glTF пішіміне түрлендіру {#converting-onshape-and-step-files-to-gltf}

AdvantageScope 3D көрінісі алаңдар мен роботтар үшін таңдамалы үлгілерді қабылдайды, оларды [осында](/more-features/custom-assets) сипатталған процесс арқылы орнатуға болады. Барлық үлгілер үлгілерді сақтау және жүктеу кезіндегі тиімділігі үшін таңдалған [glTF](https://www.khronos.org/gltf/) файл пішімін пайдалануы керек. AdvantageScope таза JSON пішімінің (.gltf) орнына барлық ресурстарды бір файлға біріктіретін бинарлық пішімді (.glb) пайдаланатынын ескеріңіз.

## Onshape файлын STEP пішіміне түрлендіру {#converting-onshape-to-step}

Onshape ішінде glTF үшін экспорттау опциясы болса да, бұл көбінесе басқару қиын өте үлкен файлдарды тудырады. Оның орнына Onshape қолданбасынан STEP пішіміне экспорттау, содан кейін glTF пішініне түрлендіру үшін келесі бөлімдегі нұсқауларды орындау ұсынылады.

1. Onshape файлын ашқаннан кейін, негізгі торапты (main assembly) тінтуірдің оң жақ түймесімен басып, «Export...» тармағын таңдаңыз:

<img src="/img/more-features/custom-assets/gltf-convert-1.png" alt="Selecting the &quot;Export...&quot; option" />

2. Опциялардың қалқымалы терезесінде экспорттау пішімі «STEP» екеніне көз жеткізіп, «Export» басыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-2.png" alt="Export options pop-up" />

3. Файл түрлендіріліп, жүктеп алынғанша күтіңіз. Бұл бірнеше минут алуы мүмкін.

## STEP файлын glTF пішіміне түрлендіру {#converting-step-to-gltf}

1. [CAD Assistant](https://www.opencascade.com/products/cad-assistant/) бағдарламасын жүктеп алыңыз. Бұл тегін қолданба көптеген 3D пішімдері, соның ішінде STEP және glTF арасында түрлендіруге мүмкіндік береді.

2. CAD Assistant бағдарламасын ашып, түрлендірілетін STEP файлын таңдаңыз:

<img src="/img/more-features/custom-assets/gltf-convert-3.png" alt="Opening STEP file in CAD Assistant" />

3. STEP файлы импортталғанша күтіңіз. Бұл бірнеше минут алуы мүмкін.

4. «Save» белгішесін басыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-4.png" alt="Clicking the &quot;Save&quot; icon" />

5. Сақтау орнын таңдаңыз, содан кейін ашылмалы тізімді пайдаланып, экспорттау пішімін «glb» күйіне ауыстырыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-5.png" alt="Switching the export format" />

6. Тісті дөңгелек белгішесін басып, «Merge faces within the same part» опциясын қосыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-6.png" alt="Enabling &quot;Merge faces within the same part&quot;" />

7. «Save» белгішесін басып, экспорттаудың аяқталуын күтіңіз:

<img src="/img/more-features/custom-assets/gltf-convert-7.png" alt="Clicking the &quot;Save&quot; icon" />
