# Onshape और STEP फ़ाइलों को glTF में कनवर्ट करना {#converting-onshape-and-step-files-to-gltf}

AdvantageScope का 3D दृश्य फील्ड और रोबोट के लिए कस्टम मॉडल स्वीकार करता है, जिसे [यहाँ](/more-features/custom-assets) वर्णित प्रक्रिया का उपयोग करके स्थापित किया जा सकता है। सभी मॉडलों को मॉडल संग्रहीत करने और लोड करने में इसकी दक्षता के लिए चुने गए [glTF](https://www.khronos.org/gltf/) फ़ाइल प्रारूप का उपयोग करना चाहिए। ध्यान दें कि AdvantageScope शुद्ध JSON फॉर्म (.gltf) के बजाय बाइनरी फॉर्म (.glb) का उपयोग करता है, जिसमें एक ही फ़ाइल में सभी संसाधन शामिल होते हैं।

## Onshape को STEP में कनवर्ट करना {#converting-onshape-to-step}

यद्यपि Onshape में glTF के लिए एक एक्सपोर्ट विकल्प शामिल है, यह अक्सर बहुत बड़ी फ़ाइलें उत्पन्न करता है जिन्हें प्रबंधित करना कठिन होता है। इसके बजाय, Onshape से STEP में एक्सपोर्ट करने की अनुशंसा की जाती है, फिर glTF में कनवर्ट करने के लिए अगले भाग में दिए गए निर्देशों का पालन करें।

1. Onshape फ़ाइल खोलने के बाद, मुख्य असेंबली पर राइट-क्लिक करें और "Export..." चुनें:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selecting the &quot;Export...&quot; option" />

2. विकल्प पॉप-अप में, सुनिश्चित करें कि एक्सपोर्ट प्रारूप "STEP" है और "Export" पर क्लिक करें:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Export options pop-up" />

3. फ़ाइल के कनवर्ट होने और डाउनलोड होने की प्रतीक्षा करें। इसमें कुछ मिनट लग सकते हैं।

## STEP को glTF में कनवर्ट करना {#converting-step-to-gltf}

1. [CAD Assistant](https://www.opencascade.com/products/cad-assistant/) डाउनलोड करें। यह मुफ़्त एप्लिकेशन STEP और glTF सहित कई 3D प्रारूपों के बीच कनवर्ट करने में सक्षम है।

2. CAD Assistant खोलें और कनवर्ट करने के लिए STEP फ़ाइल चुनें:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Opening STEP file in CAD Assistant" />

3. STEP फ़ाइल के इम्पोर्ट होने की प्रतीक्षा करें। इसमें कुछ मिनट लग सकते हैं।

4. "Save" आइकन पर क्लिक करें:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clicking the &quot;Save&quot; icon" />

5. एक सेव स्थान चुनें, फिर एक्सपोर्ट प्रारूप को "glb" पर बदलने के लिए ड्रॉप-डाउन का उपयोग करें:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Switching the export format" />

6. गियर आइकन पर क्लिक करें, फिर "Merge faces within the same part" सक्षम करें:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Enabling &quot;Merge faces within the same part&quot;" />

7. "Save" आइकन पर क्लिक करें और एक्सपोर्ट समाप्त होने की प्रतीक्षा करें:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clicking the &quot;Save&quot; icon" />
