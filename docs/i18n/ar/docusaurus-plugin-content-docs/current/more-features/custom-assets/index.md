# ⚙️ الأصول المخصصة {#custom-assets}

يستخدم AdvantageScope مجموعة افتراضية من صور الملاعب المسطحة ونماذج الملاعب ونماذج الروبوتات وتكوينات أذرع التحكم. وتتضمن عملية التثبيت الأولي الأصول البسيطة (مثل الملاعب الدائمة)، بينما يُنزّل AdvantageScope الأصول التفصيلية (مثل ملاعب المواسم المحددة) تلقائيًا في الخلفية عند اتصاله بالإنترنت. وللتحقق من حالة هذه التنزيلات، انقر على `التطبيق`/`AdvantageScope` > `حالة تنزيل الأصول...`.

يمكنك تخصيص مجموعة الأصول لإضافة المزيد من الخيارات إذا رغبت في ذلك. ولفتح مجلد أصول المستخدم، انقر على `التطبيق`/`AdvantageScope` > `إظهار مجلد الأصول`. وتجد أدناه التنسيقات المتوقعة للأصول، كما يمكنك الرجوع إلى المجموعة الافتراضية من [الأصول التفصيلية](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) و[الأصول المضمنة](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) للاستعانة بها.

:::tip
لتحميل الأصول من موقع بديل، انقر على `التطبيق`/`AdvantageScope` > `استخدام مجلد أصول مخصص`. يجب أن يكون المجلد المحدد هو _المجلد الأب_ الذي يمكنك وضع أصول متعددة داخله في مجلدات فرعية منفصلة. وتتيح لك هذه الميزة تخزين الأصول المخصصة ضمن نظام التحكم في الإصدارات جنبًا إلى جنب مع كود الروبوت.
:::

## التنسيق العام {#general-format}

تُخزَّن جميع الأصول في مجلدات تتبع اتفاقية التسمية `TYPE_NAME`، ولا يعرض AdvantageScope الجزء `NAME` المستخدم في اسم المجلد. وتشمل أنواع الأصول الممكنة ما يلي:

- «Field2d»
- «Field3d»
- «Robot»
- «Joystick»

:::info
من أمثلة أسماء المجلدات: «Field2d_2023Field»، أو «Joystick_OperatorButtons»، أو «Robot_Dozer».
:::

يجب أن يحتوي هذا المجلد على ملف باسم `config.json` وملف أصل واحد أو أكثر، كما هو موضح أدناه. ويتضمن ملف التكوين دائمًا اسم الأصل الذي سيعرضه AdvantageScope، ويجب أن يكون هذا الاسم فريدًا لكل نوع أصل. كما يمكن للأصول أن تتضمن اختياريًا كائن `locales` يربط مفاتيح اللغات (مثل `es-419` و`fr` و`zh-CN`) بالأسماء المترجمة؛ ويُعتمد `name` على مستوى الجذر اسمًا افتراضيًا إذا لم تتوفر اللغة المحددة أو إذا حُذف `locales`.

```json
{
  "name": string, // اسم افتراضي فريد، مطلوب لجميع أنواع الأصول
  "locales": { [locale: string]: string } // أسماء مترجمة اختيارية تربط رموز اللغات (مثل "en-US" و"fr") بالترجمات
  ... // إعدادات تعتمد على النوع، موضحة أدناه
}
```

## نماذج الروبوت ثلاثية الأبعاد {#3d-robot-models}

### فيديو تعليمي {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### نظرة عامة {#overview}

يجب تضمين نموذج في المجلد باسم `model.glb`، كما يجب تحويل ملفات CAD إلى glTF الثنائي (`.glb`)؛ راجع [هذه الصفحة](gltf-convert) للتفاصيل. ويجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // اسم فريد، مطلوب لجميع أنواع الأصول
  "locales": { [locale: string]: string } // ترجمات اختيارية لاسم الأصل
  "isFTC": boolean // ما إذا كان النموذج مخصصًا لملاعب FTC بدلًا من ملاعب FRC (الافتراضي "false")
  "disableSimplification": boolean // ما إذا كان يجب تعطيل تبسيط النموذج، اختياري
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // تسلسل الدورات حول المحاور x وy وz
  "position": [number, number, number] // إزاحة الموضع بالأمتار، تُطبَّق بعد الدوران
  "cameras": [ // مواضع الكاميرا الثابتة، يمكن أن تكون فارغة
    {
      "name": string // اسم الكاميرا
      "locales": { [locale: string]: string } // ترجمات اختيارية لاسم الكاميرا
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // تسلسل الدورات حول المحاور x وy وz
      "position": [number, number, number] // إزاحة الموضع بالأمتار بالنسبة للروبوت، تُطبَّق بعد الدوران
      "resolution": [number, number] // الدقة بالبكسل، تُستخدم لتعيين نسبة العرض إلى الارتفاع الثابتة
      "fov": number // مجال الرؤية الأفقي بالدرجات
    }
  ],
  "components": [...] // راجع "المكونات المفصلية"
}
```

أبسط طريقة لتحديد قيم الموضع والدوران المناسبة هي التجربة والخطأ. ونوصي بضبط الدوران قبل الموضع لأن التحويلات تُطبَّق بهذا الترتيب.

:::info
يبسّط AdvantageScope هندسة النموذج تلقائيًا لتحسين الأداء، حيث يعتمد مستوى التفاصيل على [وضع العرض](/tab-reference/3d-field#rendering-modes) المحدد. وفي الحالات التي يُحدث فيها تبسيط النموذج تأثيرات غير مرغوب فيها مع الأصول المخصصة، يمكنك استخدام أحد حلَّين:

- لتعطيل الإزالة التلقائية لشبكة معينة (mesh)، أدرج النص `NOSIMPLIFY` في اسم الشبكة.
- لتعطيل تبسيط النموذج لنموذج روبوت كامل، اضبط الخيار `disableSimplification` في ملف التكوين على `true`.

:::

### المكونات المفصلية {#articulated-components}

:::warning
قد يكون إعداد المكونات المفصلية معقدًا ويستغرق وقتًا طويلًا. فكّر في استخدام [دعم `Mechanism2d` ثلاثي الأبعاد](/tab-reference/3d-field#2d-mechanisms) في AdvantageScope، الذي يوفر نهجًا أكثر سلاسة **لعرض الآليات على الملعب ثلاثي الأبعاد**.
:::

يمكن أن تحتوي نماذج الروبوت على مكونات مفصلية لعرض بيانات الآليات (راجع [هذه الصفحة](/tab-reference/3d-field) للتفاصيل). ويجب ألا يحتوي نموذج glTF (`.glb`) الأساسي على أي مكونات، بل يُصدَّر كل مكون كنموذج glTF (`.glb`) منفصل. وتتبع نماذج المكونات اتفاقية التسمية `model_INDEX.glb`، لذا سيكون اسم المكون المفصلي الأول `model_0.glb`.

يُضاف تكوين المكونات في ملف تكوين الروبوت؛ إذ يجب توفير مصفوفة من المكونات تحت المفتاح `components`. وعندما لا يوفّر المستخدم وضعيات للمكونات في AdvantageScope، تُوضَع نماذج المكونات باستخدام الدورات والموضع الافتراضيين للروبوت (انظر أعلاه). أمّا عند توفير وضعيات المكونات، فتُطبَّق الدورات والموضع «المُصفَّران» بدلًا من ذلك لإرجاع كل مكون إلى نقطة أصل الروبوت، ثم تُطبَّق وضعيات المستخدم لنقل كل مكون إلى موقعه الصحيح على الروبوت.

:::tip
عند تحديد موقع المكونات ثلاثية الأبعاد بالنسبة للروبوت، تطابق نقطة أصل نظام الإحداثيات الوضعية المنشورة للروبوت. ولاحظ أن هذه الوضعية تستخدم عمومًا ارتفاعًا صفريًا، أي مستوى الأرضية وليس لوح القاعدة السفلي (bellypan) للروبوت (في حركة الروبوت ثنائية الأبعاد المعتادة).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // تسلسل الدورات حول المحاور x وy وz
    "zeroedPosition": [number, number, number] // إزاحة الموضع بالأمتار بالنسبة للروبوت، تُطبَّق بعد الدوران
  }
]
```

#### عملية الإعداد {#setup-process}

لمعايرة مواضع المكونات المفصلية، نوصي باتباع الخطوات التالية:

1. صدّر النموذج الأساسي والمكونات في مواضعها «الافتراضية» الصحيحة، وهي الحالة التي ينبغي أن تظهر بها إذا لم تُوفَّر وضعيات مكونات في AdvantageScope.

2. انشر وضعية ثنائية الأبعاد مصفّرة من كود الروبوت، ثم اخترها كوضعية الروبوت في AdvantageScope. بعد ذلك، انتقل إلى ملعب «المحاور» (Axes) ثلاثي الأبعاد الذي يظهر نقطة أصل الملعب.

3. اضبط الدورات الإجمالية للروبوت (وليس المكونات) حتى يتّجه الروبوت بالكامل بشكل صحيح، ثم اضبط الموضع الإجمالي لإحضار الروبوت بالكامل إلى نقطة الأصل. وينبغي أن تظل المكونات معروضة في مواضعها الافتراضية نفسها طوال هذه العملية.

4. انشر مصفوفة من الوضعيات ثلاثية الأبعاد المصفّرة من كود الروبوت مطابقة لعدد المكونات في النموذج، ثم اخترها كمجموعة وضعيات المكونات في AdvantageScope.

5. اضبط الدورات، ثم المواضع، لكل مكون حتى يتحاذى مع نقطة الأصل. فعلى سبيل المثال، يُحاذى جزء الذراع بحيث يكون مفصله عند نقطة الأصل مع اتجاهه للأمام على طول المحور `X`.

6. انشر وضعيات المكونات الفعلية من كود الروبوت، والتي ستستند إلى نقاط الأصل المُعرَّفة حديثًا لكل مكون. فعلى سبيل المثال، ستكون وضعية جزء الذراع عند مفصل الذراع متجهةً في اتجاه ذلك الجزء.

## أذرع التحكم {#joysticks}

يجب تضمين صورة في المجلد باسم `image.png`، وأن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // اسم فريد، مطلوب لجميع أنواع الأصول
  "locales": { [locale: string]: string } // ترجمات اختيارية لاسم الأصل
  "components": [...] // مصفوفة من تكوينات المكونات، راجع أدناه
}
```

:::info
تدعم الأزرار وأذرع التحكم وقيم المحاور تعيينات كلٍّ من [SDL](https://www.libsdl.org) (المستخدمة في FIRST Driver Station الحالي) وتعيينات NI (المستخدمة في NI FRC Driver Station القديم). ويجب توفير مجموعة واحدة على الأقل من التعيينات لكل مكون.

وبالنسبة لتعيينات NI، يحافظ AdvantageScope على التوافق العكسي مع مفاتيح التكوين القديمة غير المسبوقة ببادئة (مثل `sourceIndex`). **غير أنّه ينبغي أن تستخدم جميع أذرع التحكم الجديدة تعيينات SDL صريحة (مثل `sdlSourceIndex`) لضمان التوافق مع FIRST Driver Station الحالي.**
:::

### زر واحد / قيمة POV {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // اختياري، يمكن أن يكون "up" أو "right" أو "down" أو "left". إذا قُدِّم، فسيكون "sdlSourceIndex" هو فهرس POV المراد قراءته.

  // تعيينات بديلة لـ NI Driver Station (اختياري)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### ذراع تحكم ثنائي المحاور {#two-axis-joystick}

```json
{
  "type": "joystick" // ذراع تحكم يتحرك في بعدين
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // غير معكوس: اليمين = موجب
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // غير معكوس: الأعلى = موجب
  "sdlButtonSourceIndex": number // اختياري

  // تعيينات بديلة لـ NI Driver Station (اختياري)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### محور واحد {#single-axis}

```json
{
  "type": "axis" // قيمة محور واحد
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // الحد الأدنى أكبر من الحد الأقصى للعكس

  // تعيينات بديلة لـ NI Driver Station (اختياري)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### لوحة اللمس {#touchpad}

```json
{
  "type": "touchpad" // لوحة لمس
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## صور الملاعب المسطحة {#flat-field-images}

يجب تضمين صورة في المجلد باسم `image.png`، موجَّهة بحيث يكون التحالف الأحمر على اليسار. ويجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // اسم فريد، مطلوب لجميع أنواع الأصول
  "locales": { [locale: string]: string } // ترجمات اختيارية لاسم الأصل
  "isFTC": boolean // ما إذا كان هذا ملعب FTC بدلًا من ملعب FRC
  "coordinateSystem": // نظام الإحداثيات الافتراضي المستخدم (راجع أدناه)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC التقليدي
      "center-red"       // Systemcore
  "useGrid": boolean // ما إذا كان يجب رسم خطوط الشبكة إذا كان هذا الملعب من نوع FTC (الافتراضي "true")
  "sourceUrl": string // رابط إلى الملف الأصلي، اختياري
  "topLeft": [number, number] // إحداثي البكسل (نقطة الأصل في الزاوية العلوية اليسرى)
  "bottomRight": [number, number] // إحداثي البكسل (نقطة الأصل في الزاوية العلوية اليسرى)
  "widthInches": number // العرض الحقيقي للملعب (الضلع الطويل)
  "heightInches": number // الارتفاع الحقيقي للملعب (الضلع القصير)
}
```

## نماذج الملاعب ثلاثية الأبعاد {#3d-field-models}

يجب تضمين نموذج في المجلد باسم `model.glb`، وبعد تطبيق جميع الدورات، ينبغي أن يكون الملعب موجّهًا بحيث يكون التحالف الأحمر على اليسار. ويجب تحويل ملفات CAD إلى glTF الثنائي (`.glb`)؛ راجع [هذه الصفحة](gltf-convert) للتفاصيل. وتتبع نماذج قطع اللعبة اتفاقية التسمية `model_INDEX.glb` بناءً على ترتيب ظهورها في مصفوفة `gamePieces`. أمّا علامات AprilTags المُعلنة هنا فتُوضَع دائمًا باستخدام نظام إحداثيات [المركز/أحمر](/more-features/coordinate-systems#center-red)، بغض النظر عن أي خيارات تكوين أخرى.

يجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // اسم فريد، مطلوب لجميع أنواع الأصول
  "locales": { [locale: string]: string } // ترجمات اختيارية لاسم الأصل
  "isFTC": boolean // ما إذا كان هذا ملعب FTC بدلًا من ملعب FRC
  "coordinateSystem": // نظام الإحداثيات الافتراضي المستخدم (راجع أدناه)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC التقليدي
      "center-red"       // Systemcore
  "useGrid": boolean // ما إذا كان يجب رسم خطوط الشبكة إذا كان هذا الملعب من نوع FTC (الافتراضي "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // تسلسل الدورات حول المحاور x وy وz
  "widthInches": number // العرض الحقيقي للملعب (الضلع الطويل)
  "heightInches": number // الارتفاع الحقيقي للملعب (الضلع القصير)
  "defaultOrigin": "auto" | "blue" | "red" // موقع نقطة الأصل الافتراضية، "auto" إذا لم يُحدَّد
  "driverStations": [
    [number, number] // مواضع محطات السائق (X وY بالأمتار بالنسبة لمركز الملعب)
    ...              // لـ FRC، 6 عناصر بالترتيب [B1, B2, B3, R1, R2, R3]. لـ FTC، 4 عناصر بالترتيب [BL, BR, RL, RR].
  ]
  "gamePieces": [ // قائمة بأنواع قطع اللعبة
    {
      "name": string // اسم قطعة اللعبة
      "locales": { [locale: string]: string } // ترجمات اختيارية لاسم قطعة اللعبة
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // تسلسل الدورات حول المحاور x وy وz
      "position": [number, number, number] // إزاحة الموضع بالأمتار، تُطبَّق بعد الدوران
      "stagedObjects": string[] // أسماء كائنات قطع اللعبة الموضوعة مسبقًا، لإخفائها عند توفير وضعيات المستخدم
    },
    ...
  ],
  "aprilTags": [ // قائمة بنماذج AprilTag التكميلية (إذا لم تكن جزءًا من نموذج الملعب)
    "variant": string // بالتنسيق "FAMILY-SIZEin" حيث "FAMILY" هي "36h11" أو "16h5" و"SIZE" هو طول الجزء الأسود
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // تسلسل الدورات حول المحاور x وy وz
    "position": [number, number, number] // إزاحة الموضع بالأمتار، تُطبَّق بعد الدوران
  ]
}
```
