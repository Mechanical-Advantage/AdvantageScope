---
sidebar_position: 3
---

# 📐 أنظمة الإحداثيات

يتضمن AdvantageScope دمجاً لعديد أنظمة الإحداثيات الشائعة في علامتي التبويب [🗺️ ملعب ثنائي الأبعاد](/tab-reference/2d-field) و [👀 ملعب ثلاثي الأبعاد](/tab-reference/3d-field). يرجى الرجوع إلى [وثائق نظام الإحداثيات لـ WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) لمزيد من المعلومات حول اتفاقيات المحاور والدوران المستخدمة بواسطة AdvantageScope.

### التخصيص

بشكل افتراضي، يتم تحديد نظام الإحداثيات تلقائياً استناداً إلى صورة/نموذج الملعب المحدد. لتحديد نظام إحداثيات مختلف للاستخدام في جميع الملاعب، افتح نافذة التفضيلات بالنقر فوق `التطبيق` > `إظهار التفضيلات...` (Windows/Linux) أو `AdvantageScope` > `الإعدادات...` (macOS) وغير خيار «نظام الإحداثيات».

:::tip
جميع خيارات أنظمة الإحداثيات متوافقة مع كل من ملاعب FRC و FTC.
:::

## المركز/أحمر (Systemcore) {#centerred-systemcore}

يكون نقطة الأصل في مركز الملعب مع توجيه المحور X+ بعيداً عن جدار التحالف الأحمر، كما هو موضح أدناه. **هذا هو نظام الإحداثيات الافتراضي لملاعب FRC بدءاً من عام 2027 وملاعب FTC بدءاً من موسم 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.png" alt="Center/red coordinate system" />

## الجدار الأزرق

تكون نقطة الأصل في أقصى الزاوية اليمنى لجدار التحالف الأزرق مع توجيه المحور X+ نحو جدار التحالف الأحمر، كما هو موضح أدناه. **هذا هو نظام الإحداثيات الافتراضي لملاعب FRC من 2023 إلى 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.png" alt="Blue wall coordinate system" />

## جدار التحالف

تكون نقطة الأصل في أقصى الزاوية اليمنى لجدار التحالف لـ _التحالف الحالي للروبوت_ مع توجيه المحور X+ نحو جدار التحالف المقابل، كما هو موضح أدناه. **هذا هو نظام الإحداثيات الافتراضي لـ FRC في عام 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.png" alt="Alliance wall coordinate system" />

## المركز/مُدار

تكون نقطة الأصل في مركز الملعب مع توجيه المحور X+ إلى اليمين من منظور جدار التحالف الأحمر، كما هو موضح أدناه. **هذا هو نظام الإحداثيات الافتراضي لملاعب FTC من موسم 2024-2025 إلى 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.png" alt="Center/rotated coordinate system" height="400" />
