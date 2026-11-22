---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# وضع الضبط {#tuning-mode}

تدعم بعض المصادر المباشرة الضبط المباشر للقيم الرقمية والمنطقية (boolean). على سبيل المثال، يمكنك استخدام هذه الميزة لـ[ضبط معاملات وحدة التحكم](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) عند الاتصال بمصدر NetworkTables. لاحظ أنه يجب أن يدعم كود الروبوت استقبال هذه المعاملات عبر NetworkTables.

تكون جميع القيم في AdvantageScope للقراءة فقط افتراضيًا. لتبديل وضع الضبط، **انقر على أيقونة الشريط المنزلق** على يمين شريط البحث عند الاتصال بمصدر مباشر مدعوم. عندما تصبح الأيقونة بنفسجية، يكون وضع الضبط نشطًا ويتاح تعديل الحقول.

- لتعديل **حقل رقمي**، أدخل قيمة جديدة في مربع النص الموجود على يمين الحقل في الشريط الجانبي. تُنشَر القيمة بعد الخروج من مربع الإدخال أو الضغط على مفتاح «Enter». اترك مربع النص فارغًا لاستخدام القيمة التي ينشرها الروبوت.
- لتبديل **حقل منطقي**، انقر على الدائرة الحمراء أو الخضراء الموجودة على يمين الحقل في الشريط الجانبي.
- لنسخ جميع القيم المنشورة إلى الحافظة، **انقر بزر الماوس الأيمن على أيقونة الشريط المنزلق** وحدد **«نسخ القيم المضبوطة»**.

:::tip
لمستخدمي iPhone و iPad، يُعد تطبيق **AdvantageTune** خيارًا بديلًا أنشأه مطوّرو AdvantageScope لضبط قيم NetworkTables من الأجهزة المحمولة.

[<img src="/img/app-store_ar.svg" alt="App Store" />](https://apps.apple.com/ly/app/advantagetune/id6811453643?l=ar)
:::

## القيم القابلة للضبط (Tunables) في WPILib {#wpilib-tunables}

في WPILib، يمكن تهيئة قيم مثل الأرقام والقيم المنطقية باستخدام واجهة برمجة التطبيقات Tunable، مما يتيح ضبطها من AdvantageScope في الوقت الفعلي. تُسجَّل القيم القابلة للضبط مرة واحدة ويمكن قراءتها دوريًا في كود الروبوت:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// قراءة القيم دوريًا
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// قراءة القيم دوريًا
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# قراءة القيم دوريًا
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## الضبط باستخدام AdvantageKit {#tuning-with-advantagekit}

الحقول التي ينشرها AdvantageKit في الجدول الفرعي `AdvantageKit` هي للإخراج فقط ولا يمكن تعديلها. ومع ذلك، يمكنك نشر حقول من كود المستخدم قابلة للضبط من AdvantageScope. **أي حقول تُنشَر في جدول «/Tuning» على NetworkTables ستظهر ضمن جدول «Tuning» عند استخدام مصدر البيانات المباشر «NetworkTables (AdvantageKit)».**

على سبيل المثال، يمكنك نشر رقم قابل للضبط باستخدام فئة [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
**لا يمكن تعديل** الجدول الفرعي `NetworkInputs`، إذ يستخدمه AdvantageKit لتسجيل قيم الشبكة لأغراض التسجيل وإعادة التشغيل. استخدم جدول `Tuning` للتفاعل مع مدخلات الشبكة في الوقت الفعلي.
:::
