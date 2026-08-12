# تحويل ملفات Onshape و STEP إلى glTF {#converting-onshape-and-step-files-to-gltf}

يقبل العرض ثلاثي الأبعاد لـ AdvantageScope نماذج مخصصة للملاعب والروبوتات، والتي يمكن تثبيتها باستخدام العملية المشروحة [هنا](/more-features/custom-assets). يجب أن تستخدم جميع النماذج تنسيق ملفات [glTF](https://www.khronos.org/gltf/)، والذي تم اختياره لكفاءته عند تخزين النماذج وتحميلها. لاحظ أن AdvantageScope يستخدم الشكل الثنائي (.glb)، الذي يتضمن جميع الموارد في ملف واحد، بدلاً من الشكل الخالص لـ JSON (.gltf).

## تحويل Onshape إلى STEP {#converting-onshape-to-step}

بينما يتضمن Onshape خيار تصدير لـ glTF، فغالباً ما ينتج عن ذلك ملفات كبيرة جداً يصعب إدارتها. بدلاً من ذلك، يُوصى بالتصدير من Onshape إلى STEP، ثم اتباع التعليمات في القسم التالي للتحويل إلى glTF.

1. بعد فتح ملف Onshape، انقر بزر الماوس الأيمن على التجميع الرئيسي واختر "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="تحديد الخيار «Export...»" />

2. في النافذة المنبثقة للخيارات، تأكد من أن تنسيق التصدير هو "STEP« وانقر فوق »Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="نافذة خيارات التصدير المنبثقة" />

3. انتظر حتى يتم تحويل الملف وتنزيله. قد يستغرق هذا بضع دقائق.

## تحويل STEP إلى glTF {#converting-step-to-gltf}

1. قم بتنزيل [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). هذا التطبيق المجاني قادر على التحويل بين العديد من التنسيقات ثلاثية الأبعاد، بما في ذلك STEP و glTF.

2. افتح CAD Assistant وحدد ملف STEP للتحويل:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="فتح ملف STEP في CAD Assistant" />

3. انتظر حتى يتم استيراد ملف STEP. قد يستغرق هذا بضع دقائق.

4. انقر فوق أيقونة «الحفظ» (Save):

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="النقر على أيقونة «حفظ»" />

5. اختر موقع الحفظ، ثم استخدم القائمة المنسدلة لتبديل تنسيق التصدير إلى "glb":

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="تبديل صيغة التصدير" />

6. انقر فوق أيقونة الترس، ثم مَكّن "Merge faces within the same part":

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="تمكين «Merge faces within the same part»" />

7. انقر فوق أيقونة «الحفظ» (Save) وانتظر حتى ينتهي التصدير:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="النقر على أيقونة «حفظ»" />
