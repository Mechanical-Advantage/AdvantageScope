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
  "name": string, // Unique default name, required for all asset types
  "locales": { [locale: string]: string } // Optional localized names mapping language codes (e.g. "en-US", "fr") to translations
  ... // Type-dependent configuration, described below
}
```

## نماذج الروبوت ثلاثية الأبعاد {#3d-robot-models}

### فيديو تعليمي {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### نظرة عامة {#overview}

يجب تضمين نموذج في المجلد باسم `model.glb`، كما يجب تحويل ملفات CAD إلى glTF؛ راجع [هذه الصفحة](gltf-convert) للتفاصيل. ويجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for the asset name
  "isFTC": boolean // Whether the model is intended for use on FTC fields instead of FRC fields (default "false")
  "disableSimplification": boolean // Whether to disable model simplification, optional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "position": [number, number, number] // Position offset in meters, applied after rotation
  "cameras": [ // Fixed camera positions, can be empty
    {
      "name": string // Camera name
      "locales": { [locale: string]: string } // Optional translations for the camera name
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
      "position": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
      "resolution": [number, number] // Resolution in pixels, used to set the fixed aspect ratio
      "fov": number // Horizontal field of view in degrees
    }
  ],
  "components": [...] // See "Articulated Components"
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

يمكن أن تحتوي نماذج الروبوت على مكونات مفصلية لعرض بيانات الآليات (راجع [هذه الصفحة](/tab-reference/3d-field) للتفاصيل). ويجب ألا يحتوي نموذج glTF الأساسي على أي مكونات، بل يُصدَّر كل مكون كنموذج glTF منفصل. وتتبع نماذج المكونات اتفاقية التسمية `model_INDEX.glb`، لذا سيكون اسم المكون المفصلي الأول `model_0.glb`.

يُضاف تكوين المكونات في ملف تكوين الروبوت؛ إذ يجب توفير مصفوفة من المكونات تحت المفتاح `components`. وعندما لا يوفّر المستخدم وضعيات للمكونات في AdvantageScope، تُوضَع نماذج المكونات باستخدام الدورات والموضع الافتراضيين للروبوت (انظر أعلاه). أمّا عند توفير وضعيات المكونات، فتُطبَّق الدورات والموضع «المُصفَّران» بدلًا من ذلك لإرجاع كل مكون إلى نقطة أصل الروبوت، ثم تُطبَّق وضعيات المستخدم لنقل كل مكون إلى موقعه الصحيح على الروبوت.

:::tip
عند تحديد موقع المكونات ثلاثية الأبعاد بالنسبة للروبوت، تطابق نقطة أصل نظام الإحداثيات الوضعية المنشورة للروبوت. ولاحظ أن هذه الوضعية تستخدم عمومًا ارتفاعًا صفريًا، أي مستوى الأرضية وليس لوح القاعدة السفلي (bellypan) للروبوت (في حركة الروبوت ثنائية الأبعاد المعتادة).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
    "zeroedPosition": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
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
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for the asset name
  "components": [...] // Array of component configurations, see below
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
  "sdlSourcePov": string // Optional, can be "up", "right", "down", or "left". If provided, the "sdlSourceIndex" will be the index of the POV to read.

  // Alternative bindings for the NI Driver Station (optional)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### ذراع تحكم ثنائي المحاور {#two-axis-joystick}

```json
{
  "type": "joystick" // A joystick that moves in two dimensions
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Not inverted: right = positive
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Not inverted: up = positive
  "sdlButtonSourceIndex": number // Optional

  // Alternative bindings for the NI Driver Station (optional)
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
  "type": "axis" // A single axis value
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Min greater than max to invert

  // Alternative bindings for the NI Driver Station (optional)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### لوحة اللمس {#touchpad}

```json
{
  "type": "touchpad" // A touchpad
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
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for the asset name
  "isFTC": boolean // Whether this is an FTC field instead of an FRC field
  "coordinateSystem": // The default coordinate system to use (see below)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditional
      "center-red"       // Systemcore
  "useGrid": boolean // Whether to render grid lines if this field is an FTC one (default "true")
  "sourceUrl": string // Link to the original file, optional
  "topLeft": [number, number] // Pixel coordinate (origin at upper left)
  "bottomRight": [number, number] // Pixel coordinate (origin at upper left)
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}
```

## نماذج الملاعب ثلاثية الأبعاد {#3d-field-models}

يجب تضمين نموذج في المجلد باسم `model.glb`، وبعد تطبيق جميع الدورات، ينبغي أن يكون الملعب موجّهًا بحيث يكون التحالف الأحمر على اليسار. ويجب تحويل ملفات CAD إلى glTF؛ راجع [هذه الصفحة](gltf-convert) للتفاصيل. وتتبع نماذج قطع اللعبة اتفاقية التسمية `model_INDEX.glb` بناءً على ترتيب ظهورها في مصفوفة `gamePieces`. أمّا علامات AprilTags المُعلنة هنا فتُوضَع دائمًا باستخدام نظام إحداثيات [المركز/أحمر](/more-features/coordinate-systems#center-red)، بغض النظر عن أي خيارات تكوين أخرى.

يجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for the asset name
  "isFTC": boolean // Whether this is an FTC field instead of an FRC field
  "coordinateSystem": // The default coordinate system to use (see below)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditional
      "center-red"       // Systemcore
  "useGrid": boolean // Whether to render grid lines if this field is an FTC one (default "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
  "defaultOrigin": "auto" | "blue" | "red" // Default origin location, "auto" if unspecified
  "driverStations": [
    [number, number] // Driver station positions (X & Y in meters relative to the center of the field)
    ...              // For FRC, 6 elements ordered [B1, B2, B3, R1, R2, R3]. For FTC, 4 elements ordered [BL, BR, RL, RR].
  ]
  "gamePieces": [ // List of game piece types
    {
      "name": string // Game piece name
      "locales": { [locale: string]: string } // Optional translations for the game piece name
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
      "position": [number, number, number] // Position offset in meters, applied after rotation
      "stagedObjects": string[] // Names of staged game piece objects, to hide if user poses are supplied
    },
    ...
  ],
  "aprilTags": [ // List of supplemental AprilTag models (if not part of field model)
    "variant": string // Format as "FAMILY-SIZEin" where "FAMILY" is "36h11" or "16h5" and "SIZE" is the length of the black section
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
    "position": [number, number, number] // Position offset in meters, applied after rotation
  ]
}
```
