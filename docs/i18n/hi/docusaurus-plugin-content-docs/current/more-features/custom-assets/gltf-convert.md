# Onshape और STEP फ़ाइलों को glTF में कनवर्ट करना {#converting-onshape-and-step-files-to-gltf}

AdvantageScope का 3D व्यू फील्ड और रोबोट के लिए कस्टम मॉडल सपोर्ट करता है, जिन्हें आप [यहाँ](/more-features/custom-assets) बताई गई प्रक्रिया से इंस्टॉल कर सकते हैं। सभी मॉडलों का बाइनरी [glTF](https://www.khronos.org/gltf/) फ़ाइल फ़ॉर्मेट (`.glb`) में होना ज़रूरी है, जिसे इसके छोटे फ़ाइल साइज़ और तेज़ लोडिंग परफ़ॉर्मेंस के कारण चुना गया है।

:::info
glTF फ़ाइलें दो फ़ॉर्मेट में आती हैं: JSON (`.gltf`) और बाइनरी (`.glb`)। AdvantageScope को बाइनरी **`.glb`** फ़ॉर्मेट की ज़रूरत होती है, जो मॉडल का पूरा डेटा एक ही फ़ाइल में पैक कर देता है।
:::

## Onshape को STEP में कनवर्ट करना {#converting-onshape-to-step}

हालाँकि Onshape में glTF एक्सपोर्ट का विकल्प मौजूद है, लेकिन इससे अक्सर बहुत बड़ी फ़ाइलें बन जाती हैं जिन्हें संभालना मुश्किल होता है। इसके बजाय, पहले Onshape से STEP में एक्सपोर्ट करने और फिर अगले सेक्शन में दिए गए निर्देशों से बाइनरी glTF (`.glb`) में कनवर्ट करने की सलाह दी जाती है।

1. Onshape फ़ाइल खोलने के बाद, मुख्य असेंबली पर राइट-क्लिक करें और "Export..." चुनें:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selecting the &quot;Export...&quot; option" />

2. पॉप-अप में जांच लें कि एक्सपोर्ट फ़ॉर्मेट "STEP" चुना हुआ है, और "Export" पर क्लिक करें:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Export options pop-up" />

3. फ़ाइल के कनवर्ट और डाउनलोड होने का इंतज़ार करें। इसमें कुछ मिनट लग सकते हैं।

## STEP को glTF (.glb) में कनवर्ट करना {#converting-step-to-gltf}

1. [CAD Assistant](https://www.opencascade.com/products/cad-assistant/) डाउनलोड करें। यह मुफ़्त एप्लिकेशन STEP और glTF (`.glb`) समेत कई 3D फ़ॉर्मेट्स के बीच कनवर्ज़न कर सकता है।

2. CAD Assistant खोलें और कनवर्ट करने के लिए STEP फ़ाइल चुनें:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Opening STEP file in CAD Assistant" />

3. STEP फ़ाइल के इम्पोर्ट होने का इंतज़ार करें। इसमें कुछ मिनट लग सकते हैं।

4. "Save" आइकन पर क्लिक करें:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clicking the &quot;Save&quot; icon" />

5. फ़ाइल सेव करने की लोकेशन चुनें, फिर ड्रॉप-डाउन से एक्सपोर्ट फ़ॉर्मेट को बदलकर "glb" (बाइनरी glTF) कर दें:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Switching the export format" />

6. गियर आइकन पर क्लिक करें, फिर "Merge faces within the same part" को इनेबल करें:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Enabling &quot;Merge faces within the same part&quot;" />

7. "Save" आइकन पर क्लिक करें और एक्सपोर्ट पूरा होने का इंतज़ार करें:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clicking the &quot;Save&quot; icon" />

एक्सपोर्ट हो जाने के बाद, `.glb` फ़ाइल का नाम बदलें (जैसे `model.glb`) और इसे [कस्टम एसेट्स](/more-features/custom-assets) पेज पर बताए अनुसार अपने कस्टम एसेट फ़ोल्डर में जोड़ें।
