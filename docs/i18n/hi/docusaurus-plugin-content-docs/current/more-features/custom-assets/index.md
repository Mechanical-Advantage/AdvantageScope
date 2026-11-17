# ⚙️ कस्टम एसेट्स {#custom-assets}

AdvantageScope डिफ़ॉल्ट रूप से फ्लैट फील्ड इमेजेज़, फील्ड मॉडल, रोबोट मॉडल और जॉयस्टिक कॉन्फ़िगरेशन का एक सेट इस्तेमाल करता है। सरल एसेट्स (जैसे एवरग्रीन फील्ड्स) शुरुआती इंस्टॉलेशन में ही शामिल होते हैं। विस्तृत एसेट्स (जैसे सीज़न-विशिष्ट फील्ड्स) AdvantageScope के इंटरनेट से कनेक्ट होने पर बैकग्राउंड में अपने आप डाउनलोड हो जाते हैं। इन डाउनलोड्स की स्थिति देखने के लिए, `ऐप`/`AdvantageScope` > `एसेट डाउनलोड स्थिति...` पर क्लिक करें।

अगर आप चाहें तो और विकल्प जोड़ने के लिए एसेट्स के इस सेट को कस्टमाइज़ कर सकते हैं। यूज़र एसेट्स फ़ोल्डर खोलने के लिए, `ऐप`/`AdvantageScope` > `एसेट्स फ़ोल्डर दिखाएँ` पर क्लिक करें। एसेट्स के लिए अपेक्षित फ़ॉर्मेट नीचे दिए गए हैं। उदाहरण के लिए आप [विस्तृत एसेट्स](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) और [बंडल किए गए एसेट्स](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) का डिफ़ॉल्ट सेट देख सकते हैं।

:::tip
किसी दूसरे स्थान से एसेट्स लोड करने के लिए, `ऐप`/`AdvantageScope` > `कस्टम एसेट्स फ़ोल्डर का उपयोग करें` पर क्लिक करें। चुना गया फ़ोल्डर वह _पैरेंट फ़ोल्डर_ होना चाहिए जहाँ अलग-अलग सबफ़ोल्डर्स में कई एसेट्स रखे जा सकें। इस फीचर की मदद से आप कस्टम एसेट्स को रोबोट कोड के साथ वर्ज़न कंट्रोल (version control) में रख सकते हैं।
:::

## सामान्य फ़ॉर्मेट {#general-format}

सभी एसेट्स को `TYPE_NAME` नेमिंग पैटर्न वाले फ़ोल्डरों में रखा जाता है। फ़ोल्डर के लिए इस्तेमाल किया जाने वाला `NAME` AdvantageScope में नहीं दिखाया जाता। संभावित एसेट प्रकार ये हैं:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
उदाहरण के लिए फ़ोल्डर के नाम "Field2d_2023Field", "Joystick_OperatorButtons", या "Robot_Dozer" हो सकते हैं।
:::

इस फ़ोल्डर में "config.json" नाम की एक फ़ाइल और नीचे बताई गई एक या अधिक एसेट फ़ाइलें होनी चाहिए। कॉन्फ़िग फ़ाइल में हमेशा उस एसेट का नाम होता है जिसे AdvantageScope में दिखाया जाएगा। यह नाम हर एसेट प्रकार के लिए यूनिक होना चाहिए। एसेट्स में वैकल्पिक रूप से एक "locales" ऑब्जेक्ट भी जोड़ा जा सकता है जो लोकेल कुंजियों (जैसे "es-419", "fr", "zh-CN") को अनुवादित नामों से मैप करता है। यदि चुने गए लोकेल के लिए नाम नहीं दिया गया है या "locales" मौजूद नहीं है, तो रूट-लेवल का "name" ही डिफ़ॉल्ट नाम माना जाता है।

```json
{
  "name": string, // Unique default name, required for all asset types
  "locales": { [locale: string]: string } // Optional localized names mapping language codes (e.g. "es-419", "fr") to translations
  ... // Type-dependent configuration, described below
}
```

## 3D रोबोट मॉडल {#3d-robot-models}

### वीडियो ट्यूटोरियल {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### अवलोकन {#overview}

फ़ोल्डर में "model.glb" नाम का एक मॉडल शामिल होना चाहिए। CAD फ़ाइलों को glTF में कनवर्ट करना ज़रूरी है; विवरण के लिए [यह पेज](gltf-convert) देखें। कॉन्फ़िग फ़ाइल इस फ़ॉर्मेट में होनी चाहिए:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for asset name
  "isFTC": boolean // Whether the model is intended for use on FTC fields instead of FRC fields (default "false")
  "disableSimplification": boolean // Whether to disable model simplification, optional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "position": [number, number, number] // Position offset in meters, applied after rotation
  "cameras": [ // Fixed camera positions, can be empty
    {
      "name": string // Camera name
      "locales": { [locale: string]: string } // Optional translations for camera name
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
      "position": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
      "resolution": [number, number] // Resolution in pixels, used to set the fixed aspect ratio
      "fov": number // Horizontal field of view in degrees
    }
  ],
  "components": [...] // See "Articulated Components"
}
```

सही पोज़िशन और रोटेशन मान तय करने का सबसे आसान तरीका ट्रायल एंड एरर (trial and error) है। हम पोज़िशन से पहले रोटेशन एडजस्ट करने की सलाह देते हैं क्योंकि ट्रांसफ़ॉर्म इसी क्रम में लागू होते हैं।

:::info
AdvantageScope परफॉर्मेंस बेहतर बनाने के लिए मॉडल की ज्योमेट्री को अपने आप सिम्प्लिफाई कर देता है, जहाँ डिटेल का स्तर चुने गए [रेंडरिंग मोड](/tab-reference/3d-field#rendering-modes) पर निर्भर करता है। यदि मॉडल सिम्प्लिफिकेशन से कस्टम एसेट्स पर अवांछित असर पड़ता है, तो आप दो तरीकों का उपयोग कर सकते हैं:

- किसी खास मेश को अपने आप हटने से रोकने के लिए, उस मेश के नाम में `NOSIMPLIFY` स्ट्रिंग जोड़ दें।
- पूरे रोबोट मॉडल के लिए मॉडल सिम्प्लिफिकेशन बंद करने के लिए, कॉन्फ़िगरेशन में `disableSimplification` विकल्प को `true` पर सेट करें।

:::

### आर्टिकुलेटेड कंपोनेंट्स {#articulated-components}

:::warning
आर्टिकुलेटेड कंपोनेंट्स को सेटअप करना थोड़ा जटिल और समय लेने वाला हो सकता है। इसके बजाय AdvantageScope के 3D [`Mechanism2d` सपोर्ट](/tab-reference/3d-field#2d-mechanisms) का उपयोग करने पर विचार करें, जो **3D फील्ड पर मैकेनिज्म को विज़ुअलाइज़ करने** का एक ज़्यादा आसान तरीका प्रदान करता है।
:::

मैकेनिज्म डेटा को विज़ुअलाइज़ करने के लिए रोबोट मॉडल में आर्टिकुलेटेड कंपोनेंट्स शामिल किए जा सकते हैं (विवरण के लिए [यहाँ](/tab-reference/3d-field) देखें)। बेस glTF मॉडल में कोई कंपोनेंट शामिल नहीं होना चाहिए; इसके बजाय हर कंपोनेंट को एक अलग glTF मॉडल के रूप में एक्सपोर्ट किया जाना चाहिए। कंपोनेंट मॉडल के नाम `model_INDEX.glb` पैटर्न के अनुसार होने चाहिए—जैसे पहला आर्टिकुलेटेड कंपोनेंट `model_0.glb` होगा।

कंपोनेंट कॉन्फ़िगरेशन रोबोट की कॉन्फ़िग फ़ाइल में दिया जाता है। `"components"` की (key) के तहत कंपोनेंट्स का एक ऐरे दिया जाना चाहिए। जब यूज़र AdvantageScope में कोई कंपोनेंट पोज़ नहीं देते हैं, तो कंपोनेंट मॉडल डिफ़ॉल्ट रोबोट रोटेशन और पोज़िशन का उपयोग करके रखे जाते हैं (ऊपर देखें)। जब यूज़र कंपोनेंट पोज़ देते हैं, तो हर कंपोनेंट को रोबोट के ओरिजिन पर लाने के लिए पहले "ज़ीरोड" (zeroed) रोटेशन और पोज़िशन लागू किए जाते हैं। इसके बाद यूज़र के पोज़ लागू करके हर कंपोनेंट को रोबोट पर उसकी सही जगह पर ले जाया जाता है।

:::tip
रोबोट के सापेक्ष 3D कंपोनेंट्स की पोज़िशन तय करते समय, कोऑर्डिनेट सिस्टम का ओरिजिन रोबोट के पब्लिश किए गए पोज़ से मेल खाता है। ध्यान दें कि सामान्य 2D रोबोट मूवमेंट के लिए यह पोज़ आमतौर पर ज़ीरो ऊँचाई का उपयोग करता है, जो फ़्लोर प्लेन होता है न कि रोबोट का बेलीपैन।
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
    "zeroedPosition": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
  }
]
```

#### सेटअप प्रक्रिया {#setup-process}

आर्टिकुलेटेड कंपोनेंट्स की पोज़िशन कैलिब्रेट करने के लिए, हम नीचे दी गई प्रक्रिया अपनाने की सलाह देते हैं:

1. बेस मॉडल और कंपोनेंट्स को उनकी सही "डिफ़ॉल्ट" पोज़िशन में एक्सपोर्ट करें। अगर AdvantageScope में कोई कंपोनेंट पोज़ न दिया जाए, तो इन्हें इसी तरह रेंडर होना चाहिए।

2. रोबोट कोड से एक ज़ीरो 2D पोज़ पब्लिश करें, फिर इसे AdvantageScope में रोबोट पोज़ के रूप में चुनें। "Axes" 3D फील्ड पर स्विच करें, जो फील्ड का ओरिजिन दिखाता है।

3. रोबोट के समग्र रोटेशन (कंपोनेंट्स के नहीं) को तब तक एडजस्ट करें जब तक पूरा रोबोट सही दिशा में न आ जाए। फिर, पूरे रोबोट को ओरिजिन पर लाने के लिए समग्र पोज़िशन को एडजस्ट करें। इस पूरी प्रक्रिया के दौरान कंपोनेंट्स अपनी डिफ़ॉल्ट पोज़िशन में ही दिखने चाहिए।

4. मॉडल में मौजूद कंपोनेंट्स की संख्या के बराबर ज़ीरो 3D पोज़ का एक ऐरे रोबोट कोड से पब्लिश करें, फिर इसे AdvantageScope में कंपोनेंट पोज़ के सेट के रूप में चुनें।

5. हर कंपोनेंट के लिए पहले रोटेशन और फिर पोज़िशन को तब तक एडजस्ट करें जब तक वे ओरिजिन के साथ अलाइन न हो जाएँ। उदाहरण के लिए, एक आर्म सेगमेंट को इस तरह अलाइन किया जाएगा कि उसका पिवट ओरिजिन पर हो और वह X ऐक्सिस के साथ आगे की ओर इशारा कर रहा हो।

6. अब रोबोट कोड से असली कंपोनेंट पोज़ पब्लिश करें, जो हर कंपोनेंट के लिए नए तय किए गए ओरिजिन पर आधारित होंगे। उदाहरण के लिए, आर्म सेगमेंट का पोज़ आर्म के जॉइंट पर होगा और सेगमेंट की दिशा में इशारा करेगा।

## जॉयस्टिक्स {#joysticks}

फ़ोल्डर में "image.png" नाम की एक इमेज शामिल होनी चाहिए। कॉन्फ़िग फ़ाइल इस फ़ॉर्मेट में होनी चाहिए:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for asset name
  "components": [...] // Array of component configurations, see below
}
```

:::info
बटन, जॉयस्टिक और ऐक्सिस मान [SDL](https://www.libsdl.org) बाइंडिंग्स (जो वर्तमान FIRST ड्राइवर स्टेशन में उपयोग होती हैं) और NI बाइंडिंग्स (जो पुराने NI FRC ड्राइवर स्टेशन में उपयोग होती थीं) दोनों को सपोर्ट करते हैं। हर कंपोनेंट के लिए कम से कम एक सेट की बाइंडिंग्स देना ज़रूरी है।

NI बाइंडिंग्स के लिए AdvantageScope पुरानी बिना-प्रीफिक्स वाली कॉन्फ़िगरेशन कुंजियों (जैसे `sourceIndex`) के साथ बैकवर्ड कम्पैटिबल है। **सभी नए जॉयस्टिक्स को वर्तमान FIRST ड्राइवर स्टेशन के साथ कम्पैटिबिलिटी के लिए स्पष्ट SDL बाइंडिंग्स (जैसे `sdlSourceIndex`) का उपयोग करना चाहिए।**
:::

### सिंगल बटन / POV मान {#single-button-pov-value}

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

### टू-एक्सिस जॉयस्टिक {#two-axis-joystick}

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

### सिंगल एक्सिस {#single-axis}

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

### टचपैड {#touchpad}

```json
{
  "type": "touchpad" // A touchpad
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## फ्लैट फील्ड इमेजेज़ {#flat-field-images}

फ़ोल्डर में "image.png" नाम की एक इमेज शामिल होनी चाहिए। यह इमेज इस तरह ओरिएंटेड होनी चाहिए कि रेड एलायंस बाईं ओर हो। कॉन्फ़िग फ़ाइल इस फ़ॉर्मेट में होनी चाहिए:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for asset name
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

## 3D फील्ड मॉडल {#3d-field-models}

फ़ोल्डर में "model.glb" नाम का एक मॉडल शामिल होना चाहिए। सभी रोटेशन लागू होने के बाद, फील्ड इस तरह ओरिएंटेड होना चाहिए कि रेड एलायंस बाईं ओर हो। CAD फ़ाइलों को glTF में कनवर्ट करना ज़रूरी है; विवरण के लिए [यह पेज](gltf-convert) देखें। गेम पीस मॉडल `gamePieces` ऐरे में उनके आने के क्रम के आधार पर `model_INDEX.glb` नेमिंग पैटर्न का पालन करते हैं। यहाँ घोषित किए गए AprilTags हमेशा [सेंटर/रेड](/more-features/coordinate-systems#center-red) कोऑर्डिनेट सिस्टम का उपयोग करके पोज़िशन किए जाते हैं, चाहे अन्य कॉन्फ़िगरेशन विकल्प कुछ भी हों।

कॉन्फ़िग फ़ाइल इस फ़ॉर्मेट में होनी चाहिए:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for asset name
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
      "locales": { [locale: string]: string } // Optional translations for game piece name
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
