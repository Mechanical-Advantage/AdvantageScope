---
sidebar_position: 1
---

# 📦 التثبيت

الإصدار المدعوم رسمياً من AdvantageScope متاح مباشرة من الفريق 6328 أو من خلال أداة تثبيت WPILib. تتوفر أيضاً عدة توزيعات غير رسمية.

## الفريق 6328 {#team-6328}

### التنزيلات: [مستقر](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest)، [إصدار تجريبي](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

تنزيل AdvantageScope مباشرة من الفريق 6328 يوفر:

- أحدث الميزات وإصلاحات الأخطاء قبل تفرها من خلال القنوات الأخرى.
- تنبيهات داخل التطبيق عند توفر إصدار جديد للتنزيل.
- مجموعة مدمجة من نماذج روبوتات 6328 الحديثة للاستخدام في علامة تبويب 👀 [ملعب ثلاثي الأبعاد](/tab-reference/3d-field).

:::note
قبل تشغيل بناءات AppImage على Ubuntu 23.10 أو أحدث، يجب تنزيل ملف تعريف AppArmor من صفحة الإصدارات ونسخه إلى /etc/apparmor.d.
:::

:::info
يتم إصدار كل إصدار رئيسي من AdvantageScope في شهر يناير قبل انطلاق موسم FRC، مع رقم إصدار يطابق السنة (على سبيل المثال، سيتم إصدار v26.0.0 في يناير 2026). قد تتوفر إصدارات بيتا وألفا من AdvantageScope في الأشهر السابقة لكل إصدار، للفرق التي ترغب في تجربة الميزات الجديدة تقديم الملاحظات. **يجب على الفرق التي تستخدم هذه الإصدارات التجريبية أن تتوقع رؤية مشكلات وأخطاء غير موجودة في الإصدارات المستقرة.**
:::

## WPILib

### التثبيت: [وثائق WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

تتضمن أداة تثبيت WPILib إصداراً حديثاً من AdvantageScope، ولكنها قد تتأخر عن أحدث إصدار متاح للتنزيل المباشر. يمكن العثور على الوثائق الخاصة بتشغيل AdvantageScope من إصدار WPILib لـ VSCode [هنا](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## التوزيعات غير الرسمية

تتوفر توزيعات غير رسمية لـ AdvantageScope من مصادر متعددة، وهي غير مدعومة رسمياً من قبل مطوري AdvantageScope/WPILib. قد تتأخر هذه التوزيعات عن أحدث إصدار من AdvantageScope متاح من المصادر الرسمية. يرجى الاتصال بالمحافظين مباشرة في حالة وجود مشكلات.

- [**AdvantageScope Lite لنظام التحكم REV:**](https://github.com/j5155/AdvantageScope-Lite-FTC) تعديل لـ [AdvantageScope Lite](/more-features/advantagescope-lite) للاستخدام على نظام تحكم FTC الحالي (قبل Systemcore).
- [**أداة تثبيت Homebrew:**](https://formulae.brew.sh/cask/advantagescope) صيغة Homebrew cask لتثبيت AdvantageScope من سطر الأوامر على macOS.
- [**مستودع مستخدمي Arch:**](https://aur.archlinux.org/packages/advantagescope) طريقة توزيع بديلة للاستخدام مع مدير الحزم pacman (توزيعة Arch رسمية لـ AdvantageScope متاحة [هنا](#6328-downloads)).
