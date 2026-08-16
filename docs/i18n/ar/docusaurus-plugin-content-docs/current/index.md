---
sidebar_position: 1
title: مرحبًا
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-rtl.webp" alt="AdvantageScope" />

AdvantageScope هو تطبيق لتشخيص الروبوت، ومراجعة/تحليل السجلات، وعرض البيانات مخصص لفرق FIRST تم تطويره بواسطة [فريق 6328](https://littletonrobotics.org). يقرأ التطبيق السجلات بتنسيقات WPILOG، و Hoot (CTRE)، و REVLOG (REV Robotics)، و Road Runner، و CSV، وسجل NI DS، و RLOG، بالإضافة إلى عرض بيانات الروبوت المباشرة باستخدام بث NT4، أو Phoenix، أو RLOG، أو FTC Dashboard. يمكن استخدام AdvantageScope مع أي مشروع WPILib، ولكنه محسّن أيضًا للاستخدام مع إطار عمل إعادة تشغيل السجلات [AdvantageKit](https://docs.advantagekit.org). يرجى ملاحظة أن **AdvantageKit ليس مطلوبًا لاستخدام AdvantageScope**.

<DocCardList
items={[
{
type: "category",
label: "نظرة عامة",
href: "/category/overview"
},
{
type: "category",
label: "مرجع علامات التبويب",
href: "/category/tab-reference"
},
{
type: "category",
label: "ميزات إضافية",
href: "/category/more-features"
},
{
type: "link",
label: "مؤتمر البطولة",
href: "/overview/champs-conference"
}
]}
/>

يتضمن AdvantageScope الأدوات التالية:

- مجموعة واسعة من الرسوم البيانية والمخططات المرنة
- تصورات الملعب ثنائية وثلاثية الأبعاد لبيانات الوضعيات (poses)، مع روبوتات قابلة للتخصيص مستندة إلى نماذج CAD
- تشغيل فيديو متزامن من فيديو مباراة تم تحميله بشكل منفصل
- عرض أذرع التحكم (Joystick)، لإظهار إجراءات السائق على تمثيلات وحدات تحكم قابلة للتخصيص
- شاشات عرض متجهات موديولات سويرف (Swerve)
- مراجعة رسائل وحدة التحكم (Console)
- تحليل إحصائيات السجل
- خيارات تصدير مرنة، مع دعم لـ CSV و WPILOG

<Button
label="الانتقال إلى التنزيلات"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

نرحب بالملاحظات، وطلبات الميزات، وتقارير الأخطاء على [صفحة المشكلات (issues)](https://github.com/Mechanical-Advantage/AdvantageScope/issues). راجع [صفحة المساهمة](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) لمزيد من المعلومات حول المساهمة في AdvantageScope. للاستفسارات غير العامة، يرجى إرسال رسالة إلى software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-light.webp" className="dark-only" />
