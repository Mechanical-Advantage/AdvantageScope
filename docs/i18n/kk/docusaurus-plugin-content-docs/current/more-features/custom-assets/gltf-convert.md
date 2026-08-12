# Onshape және STEP файлдарын glTF пішіміне түрлендіру {#converting-onshape-and-step-files-to-gltf}

AdvantageScope 3D көрінісі алаңдар мен роботтар үшін таңдамалы үлгілерді қабылдайды, оларды [осында](/more-features/custom-assets) сипатталған процесс арқылы орнатуға болады. Барлық үлгілер үлгілерді сақтау және жүктеу кезіндегі тиімділігі үшін таңдалған [glTF](https://www.khronos.org/gltf/) файл пішімін пайдалануы керек. AdvantageScope таза JSON пішімінің (.gltf) орнына барлық ресурстарды бір файлға біріктіретін бинарлық пішімді (.glb) пайдаланатынын ескеріңіз.

## Onshape файлын STEP пішіміне түрлендіру {#converting-onshape-to-step}

Onshape ішінде glTF үшін экспорттау опциясы болса да, бұл көбінесе басқару қиын өте үлкен файлдарды тудырады. Оның орнына Onshape қолданбасынан STEP пішіміне экспорттау, содан кейін glTF пішініне түрлендіру үшін келесі бөлімдегі нұсқауларды орындау ұсынылады.

1. Onshape файлын ашқаннан кейін, негізгі торапты (main assembly) тінтуірдің оң жақ түймесімен басып, «Export...» тармағын таңдаңыз:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="«Export...» опциясын таңдау" />

2. Опциялардың қалқымалы терезесінде экспорттау пішімі «STEP» екеніне көз жеткізіп, «Export» басыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Экспорттау опцияларының қалқымалы терезесі" />

3. Файл түрлендіріліп, жүктеп алынғанша күтіңіз. Бұл бірнеше минут алуы мүмкін.

## STEP файлын glTF пішіміне түрлендіру {#converting-step-to-gltf}

1. [CAD Assistant](https://www.opencascade.com/products/cad-assistant/) бағдарламасын жүктеп алыңыз. Бұл тегін қолданба көптеген 3D пішімдері, соның ішінде STEP және glTF арасында түрлендіруге мүмкіндік береді.

2. CAD Assistant бағдарламасын ашып, түрлендірілетін STEP файлын таңдаңыз:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="STEP файлын CAD Assistant бағдарламасында ашу" />

3. STEP файлы импортталғанша күтіңіз. Бұл бірнеше минут алуы мүмкін.

4. «Save» белгішесін басыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="«Сақтау» белгішесіن басу" />

5. Сақтау орнын таңдаңыз, содан кейін ашылмалы тізімді пайдаланып, экспорттау пішімін «glb» күйіне ауыстырыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Экспорттау форматын ауыстыру" />

6. Тісті дөңгелек белгішесін басып, «Merge faces within the same part» опциясын қосыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="«Merge faces within the same part» параметрін қосу" />

7. «Save» белгішесін басып, экспорттаудың аяқталуын күтіңіз:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="«Сақтау» белгішесіن басу" />
