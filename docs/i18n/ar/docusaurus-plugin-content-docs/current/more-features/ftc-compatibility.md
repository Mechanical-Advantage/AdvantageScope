---
sidebar_position: 1
---

# ✴️ التوافق مع FTC {#ftc-compatibility}

يتضمن AdvantageScope ميزات لتوفير تجربة سلسة على نظام التحكم الحالي لـ FIRST Tech Challenge، مع إعداد الانتقال إلى [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) في المواسم القادمة. سيتم دعم جميع ميزات AdvantageScope رسميًا في FTC بعد الانتقال إلى Systemcore بدءًا من موسم 2027-2028.

## الملاعب والروبوتات {#fields-and-robots}

يتم دعم ملاعب ونماذج روبوتات FTC بشكل كامل وتلقائي.

- **نماذج الملاعب والروبوتات:** حدد ملاعب ونماذج روبوتات FTC في علامتي التبويب 🗺️ [الملعب ثنائي الأبعاد](/tab-reference/2d-field) و 👀 [الملعب ثلاثي الأبعاد](/tab-reference/3d-field) مباشرة من القوائم المنسدلة. جميع الملاعب متوافقة مع [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **أنظمة الإحداثيات:** قم بتهيئة [نظام الإحداثيات](/more-features/coordinate-systems) للتوافق مع [إحداثيات FTC القياسية](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) في أي ملعب. يتم استخدام نظام الإحداثيات هذا بشكل افتراضي في ملاعب FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## التنسيقات المدعومة {#supported-formats}

يتضمن AdvantageScope دعمًا أصليًا لتنسيق البث المباشر لـ **FTC Dashboard** وملفات `.log` الخاصة بـ **Road Runner**، بالإضافة إلى التنسيقات المتوافقة مع WPILib مثل WPILOG و NetworkTables.

تنتج العديد من مكتبات التسجيل والقياس عن بُعد التابعة لجهات خارجية لـ FTC بيانات بتنسيقات متوافقة مع AdvantageScope. لا يوصي مطورو AdvantageScope بأي حل معين لتسجيل بيانات FTC، وقد تواجه إمكانيات محدودة عند استخدام بعض حلول التسجيل.

توفر القائمة أدناه نقطة بداية ولكنها ليست شاملة:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): يُنشئ ملفات سجل لتصحيح أخطاء منطق تخطيط المسار.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): يبث بيانات قياس عن بُعد مباشرة متوافقة مع لوحة التحكم الخاصة به ومع AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): يتيح تسجيل البيانات المخصصة إلى تنسيقات متعددة بما في ذلك ملفات السجل والبث المباشر.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): يحفظ البيانات بتنسيق WPILOG باستخدام التعليقات التوضيحية (annotations).
- **PsiKit**: إطار عمل لتسجيل وإعادة تشغيل البيانات لـ FTC مستوحى من AdvantageKit.

:::warning
يجب على الفرق التأكد من الالتزام بالقاعدة R704 أثناء المنافسات. يُحظر استخدام خدمات القياس عن بُعد التابعة لجهات خارجية مثل FTC Dashboard عند الاتصال عبر Wi-Fi في المسابقات.
:::

### AdvantageScope Lite لـ FTC {#advantagescope-lite-for-ftc}

يتوفر توزيع غير رسمي لـ [AdvantageScope Lite](/more-features/advantagescope-lite) محسّن لـ FTC: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). هذا التوزيع غير رسمي ولا يتم دعمه من قبل مطوري AdvantageScope.

بينما يُعد [AdvantageScope Lite](/more-features/advantagescope-lite) القياسي تطبيق ويب مصممًا للاستخدام على Systemcore ومحطة السائق لـ FIRST، فقد تم تعديل التوزيع غير الرسمي لـ FTC خصيصًا للاستخدام المباشر على نظام التحكم الحالي لـ FTC. وهو يدعم أصلاً عرض البيانات المباشرة عبر بروتوكول FTC Dashboard دون الحاجة إلى برامج إضافية.
