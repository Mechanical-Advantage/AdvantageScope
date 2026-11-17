---
sidebar_position: 1
---

# 📦 التثبيت {#installation}

يتوفر الإصدار المدعوم رسميًا من AdvantageScope مباشرةً من الفريق 6328 أو عبر أداة تثبيت WPILib، كما تتوفر عدة توزيعات غير رسمية.

## الفريق 6328 {#team-6328}

### التنزيلات: [مستقر](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest)، [إصدار تجريبي](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

يوفر لك تنزيل AdvantageScope مباشرةً من الفريق 6328 ما يلي:

- أحدث الميزات وإصلاحات الأخطاء قبل توفرها عبر القنوات الأخرى.
- تنبيهات داخل التطبيق عند توفر إصدار جديد للتنزيل.
- مجموعة مدمجة من نماذج روبوتات 6328 الحديثة للاستخدام في علامة تبويب 👀 [ملعب ثلاثي الأبعاد](/tab-reference/3d-field).

:::note
قبل تشغيل بناءات AppImage على Ubuntu 23.10 أو أحدث، يجب تنزيل ملف تعريف AppArmor من صفحة الإصدارات ونسخه إلى `/etc/apparmor.d`.
:::

:::info
يصدر كل إصدار رئيسي من AdvantageScope في شهر يناير قبل انطلاق موسم FRC، برقم إصدار يطابق السنة (فعلى سبيل المثال، صدر الإصدار v26.0.0 في يناير 2026). وقد تتوفر إصدارات بيتا وألفا من AdvantageScope في الأشهر التي تسبق كل إصدار، للفرق التي ترغب في تجربة الميزات الجديدة وتقديم الملاحظات. **وعلى الفرق التي تستخدم هذه الإصدارات التجريبية أن تتوقع مواجهة مشكلات وأخطاء غير موجودة في الإصدارات المستقرة.**
:::

## WPILib {#wpilib}

### التثبيت: [وثائق WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

تتضمن أداة تثبيت WPILib إصدارًا حديثًا من AdvantageScope، ولكنها قد تتأخر عن أحدث إصدار متاح للتنزيل المباشر. يمكنك العثور على وثائق تشغيل AdvantageScope من إصدار WPILib لـ VSCode [هنا](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## التوزيعات غير الرسمية {#unofficial-distributions}

تتوفر توزيعات غير رسمية لـ AdvantageScope من عدة مصادر، وهي غير مدعومة رسميًا من مطوّري AdvantageScope أو WPILib، وقد تتأخر عن أحدث إصدار متاح من المصادر الرسمية. يُرجى التواصل مع المشرفين على تلك التوزيعات مباشرةً في حال مواجهة أي مشكلات.

- [**AdvantageScope Lite لنظام التحكم REV:**](https://github.com/j5155/AdvantageScope-Lite-FTC) تعديل لـ [AdvantageScope Lite](/more-features/advantagescope-lite) للاستخدام على نظام تحكم FTC الحالي (قبل Systemcore).
- [**أداة تثبيت Homebrew:**](https://formulae.brew.sh/cask/advantagescope) صيغة Homebrew cask لتثبيت AdvantageScope من سطر الأوامر على macOS.
- [**مستودع مستخدمي Arch:**](https://aur.archlinux.org/packages/advantagescope) طريقة توزيع بديلة للاستخدام مع مدير الحزم pacman (توزيعة Arch رسمية لـ AdvantageScope متاحة [هنا](#6328-downloads)).
