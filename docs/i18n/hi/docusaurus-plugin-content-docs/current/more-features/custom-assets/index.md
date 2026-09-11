# ⚙️ कस्टम एसेट्स {#custom-assets}

AdvantageScope फ्लैट फील्ड छवियों, फील्ड मॉडलों, रोबोट मॉडलों और जॉयस्टिक कॉन्फ़िगरेशन के डिफ़ॉल्ट सेट का उपयोग करता है। सरल एसेट्स (उदा. एवरग्रीन फील्ड) प्रारंभिक स्थापना में शामिल हैं। विस्तृत एसेट्स (उदा. सीज़न-विशिष्ट फील्ड) AdvantageScope के इंटरनेट से कनेक्ट होने पर पृष्ठभूमि में स्वचालित रूप से डाउनलोड हो जाते हैं। इन डाउनलोड की स्थिति जांचने के लिए, `ऐप`/`AdvantageScope` > `एसेट डाउनलोड स्थिति...` पर क्लिक करें।

यदि वांछित हो तो अधिक विकल्प जोड़ने के लिए एसेट्स के सेट को कस्टमाइज़ किया जा सकता है। उपयोगकर्ता एसेट फ़ोल्डर खोलने के लिए, `ऐप`/`AdvantageScope` > `एसेट्स फ़ोल्डर दिखाएँ` पर क्लिक करें। एसेट्स के लिए अपेक्षित प्रारूप नीचे परिभाषित किए गए हैं। संदर्भ के लिए [विस्तृत एसेट्स](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) और [बंडल किए गए एसेट्स](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) का डिफ़ॉल्ट सेट देखें।

:::tip
किसी वैकल्पिक स्थान से एसेट्स लोड करने के लिए, `ऐप`/`AdvantageScope` > `कस्टम एसेट्स फ़ोल्डर का उपयोग करें` पर क्लिक करें। चयनित फ़ोल्डर वह _पैरेंट फ़ोल्डर_ होना चाहिए जहाँ अलग-अलग सबफ़ोल्डर्स में कई एसेट्स रखे जा सकते हैं। यह सुविधा कस्टम एसेट्स को रोबोट कोड के साथ संस्करण नियंत्रण (version control) के तहत संग्रहीत करने की अनुमति देती है।
:::

## सामान्य प्रारूप {#general-format}

सभी एसेट्स नामकरण परंपरा "TYPE_NAME" वाले फ़ोल्डरों में संग्रहीत किए जाते हैं। फ़ोल्डर के लिए उपयोग किया जाने वाला NAME AdvantageScope द्वारा प्रदर्शित नहीं किया जाता है। संभावित एसेट प्रकार हैं:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
उदाहरण फ़ोल्डर नाम "Field2d_2023Field", "Joystick_OperatorButtons", या "Robot_Dozer" होंगे।
:::

इस फ़ोल्डर में "config.json" नाम की एक फ़ाइल और एक या अधिक एसेट फ़ाइलें होनी चाहिए, जैसा कि नीचे वर्णित है। कॉन्फ़िग फ़ाइल में हमेशा AdvantageScope द्वारा प्रदर्शित किए जाने वाले एसेट का नाम शामिल होता है। यह नाम प्रत्येक एसेट प्रकार के लिए अद्वितीय होना चाहिए। एसेट्स वैकल्पिक रूप से अनुवादित नामों में लोकेल कुंजियों (उदा. "en-US", "es-419", "fr") को मैप करने वाला एक "locales" ऑब्जेक्ट भी शामिल कर सकते हैं। यदि चयनित लोकेल प्रदान नहीं किया गया है या "locales" को छोड़ दिया गया है, तो रूट-स्तरीय "name" को डिफ़ॉल्ट नाम माना जाता है।

```json
{
  "name": string, // Unique default name, required for all asset types
  "locales": { [locale: string]: string } // Optional localized names mapping language codes (e.g. "en-US", "fr") to translations
  ... // Type-dependent configuration, described below
}
```

## 3D रोबोट मॉडल {#3d-robot-models}

### वीडियो ट्यूटोरियल {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### अवलोकन {#overview}

फ़ोल्डर में "model.glb" नाम का एक मॉडल शामिल होना चाहिए। CAD फ़ाइलों को glTF में परिवर्तित किया जाना चाहिए; विवरण के लिए [यह पृष्ठ](gltf-convert) देखें। कॉन्फ़िग फ़ाइल निम्नलिखित प्रारूप में होनी चाहिए:

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

उपयुक्त स्थिति और घूर्णन मान निर्धारित करने का सबसे सरल तरीका परीक्षण और त्रुटि (trial and error) है। हम स्थिति से पहले घूर्णन को समायोजित करने की अनुशंसा करते हैं क्योंकि ट्रांसफ़ॉर्म इस क्रम में लागू होते हैं।

:::info
AdvantageScope प्रदर्शन में सुधार के लिए स्वचालित रूप से मॉडल ज्यामिति को सरल बनाता है, जहाँ विवरण का स्तर चयनित [रेंडरिंग मोड](/tab-reference/3d-field#rendering-modes) पर निर्भर करता है। ऐसे मामलों में जहाँ मॉडल सरलीकरण कस्टम एसेट्स के साथ अवांछित प्रभाव पैदा करता है, दो समाधानों का उपयोग किया जा सकता है:

- किसी विशेष मेश के स्वचालित निष्कासन को अक्षम करने के लिए, मेश नाम में `NOSIMPLIFY` स्ट्रिंग शामिल करें।
- पूरे रोबोट मॉडल के लिए मॉडल सरलीकरण को अक्षम करने के लिए, कॉन्फ़िगरेशन में `disableSimplification` विकल्प को `true` पर सेट करें।

:::

### आर्टिकुलेटेड कंपोनेंट्स {#articulated-components}

:::warning
आर्टिकुलेटेड कंपोनेंट्स की स्थापना जटिल और समय लेने वाली हो सकती है। AdvantageScope के 3D [`Mechanism2d` समर्थन](/tab-reference/3d-field#2d-mechanisms) का उपयोग करने पर विचार करें, जो **3D फील्ड पर मैकेनिज्म की कल्पना करने** के लिए अधिक सुव्यवस्थित दृष्टिकोण प्रदान करता है।
:::

रोबोट मॉडल में मैकेनिज्म डेटा की कल्पना करने के लिए आर्टिकुलेटेड कंपोनेंट्स हो सकते हैं (विवरण के लिए [यहाँ](/tab-reference/3d-field) देखें)। बेस glTF मॉडल में कोई घटक शामिल नहीं होना चाहिए, फिर प्रत्येक घटक को एक अलग glTF मॉडल के रूप में एक्सपोर्ट किया जाना चाहिए। कंपोनेंट मॉडल नामकरण परंपरा "model_INDEX.glb" का पालन करते हैं, इसलिए पहला आर्टिकुलेटेड कंपोनेंट "model_0.glb" होगा।

घटक कॉन्फ़िगरेशन रोबोट की कॉन्फ़िग फ़ाइल में प्रदान किया जाता है। "components" कुंजी के तहत घटकों का एक एरे प्रदान किया जाना चाहिए। जब AdvantageScope में उपयोगकर्ता द्वारा कोई घटक पोज़ प्रदान नहीं किया जाता है, तो घटक मॉडल डिफ़ॉल्ट रोबोट घूर्णन और स्थिति का उपयोग करके स्थित होंगे (ऊपर देखें)। जब उपयोगकर्ता द्वारा घटक पोज़ प्रदान किए जाते हैं, तो प्रत्येक घटक को रोबोट मूल पर लाने के लिए "शून्य" घूर्णन और स्थिति लागू की जाती है। फिर उपयोगकर्ता के पोज़ को रोबोट पर सही स्थान पर प्रत्येक घटक को स्थानांतरित करने के लिए लागू किया जाता है।

:::tip
रोबोट के सापेक्ष 3D घटकों को स्थान देते समय, कोऑर्डिनेट सिस्टम का मूल रोबोट के पब्लिश किए गए पोज़ से मेल खाता है। ध्यान दें कि यह पोज़ आम तौर पर शून्य की ऊँचाई का उपयोग करता है, जो कि फ़्लोर प्लेन है और रोबोट बेलीपैन नहीं है (विशिष्ट 2D रोबोट आंदोलन के लिए)।
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

आर्टिकुलेटेड कंपोनेंट्स के पदों को कैलिब्रेट करने के लिए, हम निम्नलिखित प्रक्रिया की अनुशंसा करते हैं:

1. बेस मॉडल और घटकों को उनकी सही "डिफ़ॉल्ट" स्थिति में एक्सपोर्ट करें। यदि AdvantageScope में कोई घटक पोज़ प्रदान नहीं किया गया है तो उन्हें इस तरह रेंडर किया जाना चाहिए।

2. रोबोट कोड से एक शून्य 2D पोज़ पब्लिश करें, फिर इसे AdvantageScope में रोबोट पोज़ के रूप में चुनें। "Axes" 3D फील्ड पर स्विच करें, जो फील्ड मूल दिखाता है।

3. रोबोट के समग्र घूर्णन (घटकों के नहीं) को तब तक समायोजित करें जब तक कि पूरा रोबोट सही ढंग से उन्मुख न हो जाए। फिर, पूरे रोबोट को मूल में लाने के लिए समग्र स्थिति को समायोजित करें। इस प्रक्रिया के दौरान घटकों को समान डिफ़ॉल्ट स्थितियों में रेंडर किया जाना चाहिए।

4. मॉडल में घटकों की संख्या से मेल खाने वाले रोबोट कोड से शून्य 3D पोज़ की एक सरणी पब्लिश करें, फिर इसे AdvantageScope में घटक पोज़ के सेट के रूप में चुनें।

5. प्रत्येक घटक के लिए घूर्णन और उसके बाद स्थितियों को तब तक समायोजित करें जब तक कि वे मूल के साथ संरेखित न हो जाएं। उदाहरण के लिए, एक हाथ का खंड (arm segment) X अक्ष के साथ आगे की ओर इंगित करते हुए मूल में पिवट के साथ संरेखित होगा।

6. रोबोट कोड से वास्तविक घटक पोज़ पब्लिश करें, जो प्रत्येक घटक के लिए नए-परिभाषित मूल पर आधारित होंगे। उदाहरण के लिए, एक आर्म सेगमेंट के लिए पोज़ सेगमेंट की दिशा में इंगित आर्म के जोड़ पर स्थित होगा।

## जॉयस्टिक्स {#joysticks}

फ़ोल्डर में "image.png" नाम की एक छवि शामिल होनी चाहिए। कॉन्फ़िग फ़ाइल निम्नलिखित प्रारूप में होनी चाहिए:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Optional translations for asset name
  "components": [...] // Array of component configurations, see below
}
```

:::info
बटन, जॉयस्टिक और अक्ष मान [SDL](https://www.libsdl.org) बाइंडिंग (वर्तमान FIRST ड्राइवर स्टेशन द्वारा उपयोग किया जाता है) और NI बाइंडिंग (पुराने NI FRC ड्राइवर स्टेशन द्वारा उपयोग किया जाता है) दोनों का समर्थन करते हैं। प्रत्येक घटक के लिए बाइंडिंग का कम से कम एक सेट प्रदान किया जाना चाहिए।

NI बाइंडिंग के लिए, AdvantageScope पुरानी गैर-उपसर्ग वाली कॉन्फ़िगरेशन कुंजियों (उदा. `sourceIndex`) के साथ पिछड़ा संगत (backwards compatible) है। **सभी नए जॉयस्टिक को वर्तमान FIRST ड्राइवर स्टेशन के साथ संगतता के लिए स्पष्ट SDL बाइंडिंग (उदा. `sdlSourceIndex`) का उपयोग करना चाहिए।**
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

## फ्लैट फील्ड छवियां {#flat-field-images}

फ़ोल्डर में "image.png" नाम की एक छवि शामिल होनी चाहिए। इसे बाईं ओर रेड एलायंस के साथ उन्मुख होना चाहिए। कॉन्फ़िग फ़ाइल निम्नलिखित प्रारूप में होनी चाहिए:

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

फ़ोल्डर में "model.glb" नाम का एक मॉडल शामिल होना चाहिए। सभी घूर्णन लागू होने के बाद, मैदान को बाईं ओर रेड एलायंस के साथ उन्मुख होना चाहिए। CAD फ़ाइलों को glTF में परिवर्तित किया जाना चाहिए; विवरण के लिए [यह पृष्ठ](gltf-convert) देखें। गेम पीस मॉडल "gamePieces" एरे में प्रदर्शित होने वाले क्रम के आधार पर "model_INDEX.glb" नामकरण परंपरा का पालन करते हैं। यहाँ घोषित AprilTags को किसी भी अन्य कॉन्फ़िगरेशन विकल्पों की परवाह किए बिना, हमेशा [सेंटर/रेड](/more-features/coordinate-systems#center-red) कोऑर्डिनेट सिस्टम का उपयोग करके स्थित किया जाता है।

कॉन्फ़िग फ़ाइल निम्नलिखित प्रारूप में होनी चाहिए:

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
