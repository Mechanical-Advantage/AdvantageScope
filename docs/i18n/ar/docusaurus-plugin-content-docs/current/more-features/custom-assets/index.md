# ⚙️ الأصول المخصصة {#custom-assets}

يستخدم AdvantageScope مجموعة افتراضية من صور الملاعب المسطحة، ونماذج الملاعب، ونماذج الروبوتات، وتكوينات أذرع التحكم. تتضمن عملية التثبيت الأولى الأصول البسيطة (مثل الملاعب الدائمة). يتم تنزيل الأصول التفصيلية (مثل ملاعب المواسم المحددة) تلقائياً في الخلفية عند اتصال AdvantageScope بالإنترنت. للتحقق من حالة هذه التنزيلات، انقر فوق `التطبيق`/`AdvantageScope` > `حالة تنزيل الأصول...`.

يمكن تخصيص مجموعة الأصول لإضافة المزيد من الخيارات إذا رغبت في ذلك. لفتح مجلد أصول المستخدم، انقر فوق `التطبيق`/`AdvantageScope` > `إظهار مجلد الأصول`. التنسيقات المتوقعة للأصول محددة أدناه. راجع المجموعة الافتراضية لـ [الأصول التفصيلية](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) و [الأصول المضمنة](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) للمرجعية.

:::tip
لتحميل الأصول من موقع بديل، انقر فوق `التطبيق`/`AdvantageScope` > `استخدام مجلد أصول مخصص`. يجب أن يكون المجلد المحدد هو _المجلد الأب_ الذي يمكن وضع أصول متعددة فيه في مجلدات فرعية منفصلة. تتيح هذه الميزة تخزين الأصول المخصصة تحت التحكم في الإصدار جنبًا إلى جنب مع كود الروبوت.
:::

## التنسيق العام {#general-format}

تخزن جميع الأصول في مجلدات باتباع اتفاقية التسمية "TYPE_NAME". لا يتم عرض NAME المستخدم للمجلد بواسطة AdvantageScope. أنواع الأصول الممكنة هي:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
أمثلة لأسماء المجلدات ستكون "Field2d_2023Field«، أو »Joystick_OperatorButtons«، أو »Robot_Dozer".
:::

يجب أن يحتوي هذا المجلد على ملف باسم "config.json" وملف أصل واحد أو أكثر، كما هو موضح أدناه. يتضمن ملف التكوين دائمًا اسم الأصل الذي سيتم عرضه بواسطة AdvantageScope. يجب أن يكون هذا الاسم فريدًا لكل نوع أصل.

```json
{
  "name": string // Unique name, required for all asset types
  ... // Type-dependent configuration, described below
}
```

## نماذج الروبوت ثلاثية الأبعاد {#3d-robot-models}

### فيديو تعليمي {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### نظرة عامة {#overview}

يجب تضمين نموذج في المجلد باسم "model.glb". يجب تحويل ملفات CAD إلى glTF؛ راجع [هذه الصفحة](gltf-convert) للحصول على التفاصيل. يجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // Unique name, required for all asset types
  "isFTC": boolean // Whether the model is intended for use on FTC fields instead of FRC fields (default "false")
  "disableSimplification": boolean // Whether to disable model simplification, optional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "position": [number, number, number] // Position offset in meters, applied after rotation
  "cameras": [ // Fixed camera positions, can be empty
    {
      "name": string // Camera name
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
      "position": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
      "resolution": [number, number] // Resolution in pixels, used to set the fixed aspect ratio
      "fov": number // Horizontal field of view in degrees
    }
  ],
  "components": [...] // See "Articulated Components"
}
```

أبسط طريقة لتحديد قيم الموضع والدوران المناسبة هي عبر التجربة والخطأ. نوصي بضبط الدوران قبل الموضع نظرًا لأن التحويلات تُطبق بهذا الترتيب.

:::info
يقوم AdvantageScope بتسيط هندسة النموذج تلقائياً لتحسين الأداء، حيث يعتمد مستوى التفاصيل على [وضع العرض](/tab-reference/3d-field#rendering-modes) المحدد. في الحالات التي ينتج فيها تبسيط النموذج تأثيرات غير مرغوب فيها مع الأصول المخصصة، يمكن استخدام حلين:

- لتعطيل الإزالة التلقائية لشبكة معينة (mesh)، قم بتضمين النص `NOSIMPLIFY` في اسم الشبكة.
- لتعطيل تبسيط النموذج لنموذج روبوت بكامله، اضبط الخيار `disableSimplification` في التكوين على `true`.

:::

### المكونات المفصلية {#articulated-components}

:::warning
قد يكون إعداد المكونات المفصلية معقدًا ومستغرقًا للوقت. فكر في استخدام [دعم `Mechanism2d` ثلاثي الأبعاد](/tab-reference/3d-field#2d-mechanisms) في AdvantageScope، والذي يقدم نهجًا أكثر تبسيطاً لـ **عرض الآليات على الملعب ثلاثي الأبعاد**.
:::

يمكن أن تحتوي نماذج الروبوت على مكونات مفصلية لعرض بيانات الآليات (راجع [هنا](/tab-reference/3d-field) للحصول على التفاصيل). يجب ألا يحتوي نموذج glTF الأساسي على أي مكونات، ثم يتم تصدير كل مكون كنموذج glTF منفصل. تتبع نماذج المكونات اتفاقية التسمية "model_INDEX.glb«، وبالتالي سيكون المكون المفصلي الأول »model_0.glb"

يتم توفير تكوين المكونات في ملف تكوين الروبوت. يجب توفير مصفوفة من المكونات تحت المفتاح "components". عندما لا يتم توفير أي وضعيات مكونات بواسطة المستخدم في AdvantageScope، سيتم وضع نماذج المكونات باستخدام دورات وموضع الروبوت الافتراضي (راجع أعلاه). عندما يتم توفير وضعيات المكونات بواسطة المستخدم، يتم تطبيق الدورات والموضع «الُمصفّرة» بدلاً من ذلك لإحضار كل مكون إلى أصل الروبوت. ثم تًطبق وضعيات المستخدم لنقل كل مكون إلى الموقع الصحيح على الروبوت.

:::tip
عند تحديد موقع المكونات ثلاثية الأبعاد بالنسبة للروبوت، يطابق أصل نظام الإحداثيات الوضعية المنشورة للروبوت. لاحظ أن هذه الوضعية تستخدم بشكل عام ارتفاعاً صفرياً، وهو مستوى الأرض وليس لوحة بطن الروبوت (لحركة الروبوت ثنائية الأبعاد النموذجية).
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

لمعايرة مواضع المكونات المفصلية، نوصي بالعملية التالية:

1. قم بتصدير النموذج الأساسي والمكونات في مواضعها «الافتراضية» الصحيحة. هذا هو كيفية تقديمها إذا لم يتم توفير وضعيات مكونات في AdvantageScope.

2. انشر وضعية ثنائية الأبعاد مصفّرة من كود الروبوت، ثم حددها كوضعية الروبوت في AdvantageScope. انتقل إلى ملعب «المحاور» ثلاثي الأبعاد، والذي يظهر أصل الملعب.

3. اضبط الدورات الإجمالية للروبوت (وليس المكونات) حتى يتم توجيه الروبوت بالكامل بشكل صحيح. بعد ذلك، اضبط الموضع الإجمالي لإحضار الروبوت بالكامل إلى الأصل. يجب عرض المكونات في نفس المواضع الافتراضية طوال هذه العملية.

4. انشر مصفوفة من الوضعيات ثلاثية الأبعاد المصفّرة من كود الروبوت لتمثيل عدد المكونات في النموذج، ثم حددها كمجموعة وضعيات المكونات في AdvantageScope.

5. اضبط الدورات، متبوعة بالمواضع، لكل مكون حتى يتم محاذاتها مع الأصل. على سبيل المثال، سيتم محاذاة جزء الذراع مع المفاصل عند الأصل بينما يشير إلى الأمام على طول المحور X.

6. انشر وضعيات المكونات الحقيقية من كود الروبوت، والتي ستستند إلى الأصول المحددة حديثًا لكل مكون. على سبيل المثال، سيتم وضع وضعية جزء الذراع عند مفصل الذراع الموجه في اتجاه الجزء.

## أذرع التحكم {#joysticks}

يجب تضمين صورة في المجلد باسم "image.png". يجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // Unique name, required for all asset types
  "components": [...] // Array of component configurations, see below
}
```

:::info
تدعم الأزرار وأذرع التحكم وقيم المحاور تعيينات كل من [SDL](https://www.libsdl.org) (المستخدمة بواسطة FIRST Driver Station الحالي) وتعيينات NI (المستخدمة بواسطة NI FRC Driver Station القديم). يجب توفير مجموعة واحدة على الأقل من التعيينات لكل مكون.

بالنسبة لتعيينات NI، يتوافق AdvantageScope بشكل عكسي مع مفاتيح التكوين القديمة غير المسبوقة ببادئة (مثل `sourceIndex`). **يجب أن تستخدم جميع أذرع التحكم الجديدة تعيينات SDL صريحة (مثل `sdlSourceIndex`) للتوافق مع FIRST Driver Station الحالي.**
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

يجب تضمين صورة في المجلد باسم "image.png". يجب توجيهها بحيث يكون التحالف الأحمر على اليسار. يجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // Unique name, required for all asset types
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

يجب تضمين نموذج في المجلد باسم "model.glb". بعد تطبيق جميع الدورات، يجب توجيه الملعب بحيث يكون التحالف الأحمر على اليسار. يجب تحويل ملفات CAD إلى glTF؛ راجع [هذه الصفحة](gltf-convert) للحصول على التفاصيل. تتبع نماذج قطع اللعبة اتفاقية التسمية "model_INDEX.glb« بناءً على الترتيب الذي تظهر به في مصفوفة »gamePieces". يتم وضع AprilTags المعلنة هنا دائمًا باستخدام نظام إحداثيات [مركز/أحمر](/more-features/coordinate-systems#center-red)، بغض النظر عن أي خيارات تكوين أخرى.

يجب أن يكون ملف التكوين بالتنسيق التالي:

```json
{
  "name": string // Unique name, required for all asset types
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
