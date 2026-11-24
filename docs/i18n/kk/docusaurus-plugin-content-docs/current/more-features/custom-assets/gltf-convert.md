# Onshape және STEP файлдарын glTF пішіміне түрлендіру {#converting-onshape-and-step-files-to-gltf}

AdvantageScope бағдарламасының 3D көрінісінде [осында](/more-features/custom-assets) сипатталған тәртіппен орнатуға болатын алаңдар мен роботтардың таңдамалы үлгілерін пайдалануға болады. Барлық үлгі сақтау мен жүктеу тиімділігі үшін таңдалған [glTF](https://www.khronos.org/gltf/) файл пішімінде болуы керек. AdvantageScope таза JSON пішімін (.gltf) емес, барлық ресурсты бір файлға біріктіретін бинарлық пішімді (.glb) пайдаланатынын ескеріңіз.

## Onshape файлын STEP пішіміне түрлендіру {#converting-onshape-to-step}

Onshape жүйесінде glTF пішіміне экспорттау мүмкіндігі болғанымен, ол көбіне өңдеуге қиын, өте үлкен файлдар жасайды. Оның орнына үлгіні Onshape жүйесінен алдымен STEP пішіміне экспорттап, содан кейін келесі бөлімдегі нұсқаулар бойынша glTF пішіміне түрлендіру ұсынылады.

1. Onshape файлын ашқаннан кейін негізгі құрастыруды (main assembly) тінтуірдің оң жақ батырмасымен басып, «Export...» тармағын таңдаңыз:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="«Export...» опциясын таңдау" />

2. Ашылған опциялар терезесінде экспорттау пішімі «STEP» екеніне көз жеткізіп, «Export» батырмасын басыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Экспорттау опцияларының қалқымалы терезесі" />

3. Файл түрлендіріліп, жүктеп алынғанша күтіңіз. Бұл бірнеше минутқа созылуы мүмкін.

## STEP файлын glTF пішіміне түрлендіру {#converting-step-to-gltf}

1. [CAD Assistant](https://www.opencascade.com/products/cad-assistant/) бағдарламасын жүктеп алыңыз. Бұл тегін қолданба көптеген 3D пішімдерінің, соның ішінде STEP пен glTF пішімдерінің арасында түрлендіруге мүмкіндік береді.

2. CAD Assistant бағдарламасын ашып, түрлендірілетін STEP файлын таңдаңыз:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="STEP файлын CAD Assistant бағдарламасында ашу" />

3. STEP файлы импортталғанша күтіңіз. Бұл бірнеше минутқа созылуы мүмкін.

4. «Save» белгішесін басыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="«Save» белгішесін басу" />

5. Сақтау орнын таңдаңыз, содан кейін ашылмалы тізімді пайдаланып, экспорттау пішімін «glb» күйіне ауыстырыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Экспорттау пішімін ауыстыру" />

6. Тісті дөңгелек белгішесін басып, «Merge faces within the same part» опциясын қосыңыз:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="«Merge faces within the same part» параметрін қосу" />

7. «Save» белгішесін басып, экспорттаудың аяқталуын күтіңіз:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="«Save» белгішесін басу" />
