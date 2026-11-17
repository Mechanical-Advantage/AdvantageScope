---
sidebar_position: 1
---

# ✴️ التوافق مع FTC {#ftc-compatibility}

يوفر AdvantageScope ميزات تمنحك تجربة سلسة على نظام التحكم الحالي في FIRST Tech Challenge، مع التمهيد للانتقال إلى [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) في المواسم القادمة. وستحظى جميع ميزات AdvantageScope بدعم رسمي كامل في FTC بعد الانتقال إلى Systemcore بدءًا من موسم 2027-2028.

## الملاعب والروبوتات {#fields-and-robots}

يدعم AdvantageScope ملاعب FTC ونماذج روبوتاتها دعمًا كاملًا ومباشرًا.

- **نماذج الملاعب والروبوتات:** اختر ملاعب FTC ونماذج روبوتاتها في علامتي التبويب 🗺️ [الملعب ثنائي الأبعاد](/tab-reference/2d-field) و👀 [الملعب ثلاثي الأبعاد](/tab-reference/3d-field) مباشرةً من القوائم المنسدلة. وتتوافق جميع الملاعب مع [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **أنظمة الإحداثيات:** اضبط [نظام الإحداثيات](/more-features/coordinate-systems) ليتوافق مع [إحداثيات FTC القياسية](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) على أي ملعب، علمًا بأنّ هذا النظام هو المستخدم افتراضيًا في ملاعب FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## التنسيقات المدعومة {#supported-formats}

يدعم AdvantageScope أصلًا تنسيق البث المباشر الخاص بـ **FTC Dashboard** وملفات `.log` من **Road Runner**، بالإضافة إلى التنسيقات المتوافقة مع WPILib مثل WPILOG وNetworkTables.

كما تُنتج العديد من مكتبات التسجيل والقياس عن بُعد التابعة لجهات خارجية في FTC بياناتٍ بتنسيقات متوافقة مع AdvantageScope. ولا يوصي مطورو AdvantageScope بأي حلٍّ بعينه لتسجيل بيانات FTC أو يزكّونه، وقد تواجه بعض القيود في الإمكانات عند استخدام بعض هذه الحلول.

تقدّم القائمة أدناه نقطة انطلاق، لكنها ليست شاملة:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): يُنشئ ملفات سجل لتصحيح أخطاء منطق تخطيط المسار.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): يبث بيانات قياس عن بُعد مباشرةً متوافقة مع لوحة التحكم الخاصة به ومع AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): يتيح تسجيل البيانات المخصصة بتنسيقات متعددة، بما في ذلك ملفات السجل والبث المباشر.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): يحفظ البيانات بتنسيق WPILOG باستخدام التعليقات التوضيحية (annotations).
- **PsiKit**: إطار عمل لتسجيل البيانات وإعادة تشغيلها في FTC مستوحى من AdvantageKit.

:::warning
يجب على الفرق الحرص على الالتزام بالقاعدة R704 أثناء المنافسات؛ إذ يُحظر استخدام خدمات القياس عن بُعد التابعة لجهات خارجية مثل FTC Dashboard عند الاتصال عبر Wi-Fi في المسابقات.
:::

### AdvantageScope Lite لـ FTC {#advantagescope-lite-for-ftc}

يتوفر توزيع غير رسمي من [AdvantageScope Lite](/more-features/advantagescope-lite) مُحسَّن لـ FTC باسم [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). هذا التوزيع غير رسمي ولا يدعمه مطورو AdvantageScope.

فبينما صُمّم تطبيق الويب [AdvantageScope Lite](/more-features/advantagescope-lite) القياسي للعمل على Systemcore ومحطة السائق (FIRST Driver Station)، عُدِّل التوزيع غير الرسمي لـ FTC خصيصًا ليعمل مباشرةً على نظام التحكم الحالي لـ FTC، وهو يدعم أصلًا عرض البيانات المباشرة عبر بروتوكول FTC Dashboard دون الحاجة إلى برامج إضافية.
