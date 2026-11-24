# تحويل ملفات Onshape وSTEP إلى glTF {#converting-onshape-and-step-files-to-gltf}

يتيح العرض ثلاثي الأبعاد في AdvantageScope استخدام نماذج مخصصة للملاعب والروبوتات، ويمكنك تثبيتها باتباع الخطوات الموضحة [هنا](/more-features/custom-assets). ويجب أن تستخدم جميع النماذج تنسيق الملفات [glTF](https://www.khronos.org/gltf/)، الذي وقع الاختيار عليه لكفاءته في تخزين النماذج وتحميلها. ولاحظ أن AdvantageScope يستخدم الصيغة الثنائية (`.glb`) التي تجمع جميع الموارد في ملف واحد، بدلًا من صيغة JSON الخالصة (`.gltf`).

## تحويل Onshape إلى STEP {#converting-onshape-to-step}

على الرغم من أن Onshape يتضمن خيارًا لتصدير glTF، فإنه غالبًا ما يُنتج ملفات كبيرة جدًا يصعب التعامل معها. وبدلًا من ذلك، نوصي بالتصدير من Onshape إلى تنسيق STEP، ثم اتباع التعليمات في القسم التالي للتحويل إلى glTF.

1. بعد فتح ملف Onshape، انقر بزر الفأرة الأيمن على التجميع الرئيسي واختر «Export...»:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="تحديد الخيار «Export...»" />

2. في النافذة المنبثقة للخيارات، تأكد من أن تنسيق التصدير هو «STEP» وانقر على «Export»:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="نافذة خيارات التصدير المنبثقة" />

3. انتظر حتى يكتمل تحويل الملف وتنزيله؛ قد يستغرق ذلك بضع دقائق.

## تحويل STEP إلى glTF {#converting-step-to-gltf}

1. نزّل تطبيق [CAD Assistant](https://www.opencascade.com/products/cad-assistant/) المجاني، الذي يتيح التحويل بين العديد من التنسيقات ثلاثية الأبعاد، بما في ذلك STEP وglTF.

2. افتح CAD Assistant وحدد ملف STEP المراد تحويله:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="فتح ملف STEP في CAD Assistant" />

3. انتظر حتى يكتمل استيراد ملف STEP؛ قد يستغرق ذلك بضع دقائق.

4. انقر على أيقونة «حفظ» (Save):

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="النقر على أيقونة «حفظ»" />

5. اختر موقع الحفظ، ثم استخدم القائمة المنسدلة لتغيير تنسيق التصدير إلى «glb»:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="تبديل صيغة التصدير" />

6. انقر على أيقونة الترس، ثم فعّل خيار «Merge faces within the same part»:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="تمكين «Merge faces within the same part»" />

7. انقر على أيقونة «حفظ» (Save) وانتظر حتى يكتمل التصدير:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="النقر على أيقونة «حفظ»" />
