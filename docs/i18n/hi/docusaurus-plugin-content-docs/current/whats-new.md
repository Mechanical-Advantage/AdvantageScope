---
title: 2027 में नया क्या है?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

AdvantageScope का 2027 संस्करण अब उपलब्ध है! विवरण के लिए [इंस्टॉलेशन डॉक्स](/overview/installation) और [पूरा चेंजलॉग](https://github.com/Mechanical-Advantage/AdvantageScope/releases) देखें। इस रिलीज़ में कई प्रमुख नए फ़ीचर्स और पूरे एप्लिकेशन में अनेक सुधार शामिल हैं। यह Systemcore के पूर्ण समर्थन वाला AdvantageScope का पहला संस्करण भी है।

**हम आपके फ़ीडबैक को महत्व देते हैं! [इश्यूज़ पेज](https://github.com/Mechanical-Advantage/AdvantageScope/issues) पर फ़ीडबैक, फ़ीचर अनुरोध और बग रिपोर्ट का स्वागत है।**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Systemcore संगतता {#systemcore-compatibility}

AdvantageScope 2027 नए Systemcore रोबोट कंट्रोलर और WPILib 2027 के साथ सहज संचालन के लिए बनाया गया है:

- डिफ़ॉल्ट रोबोट पता अब `robot.local` है, जिससे आप टीम नंबर कॉन्फ़िगर किए बिना लाइव कनेक्ट कर सकते हैं या लॉग डाउनलोड कर सकते हैं। मेनू बार से Systemcore USB और Wi-Fi पते भी चुने जा सकते हैं।
- [लॉग डाउनलोडिंग](/overview/log-files#downloading-from-the-robot) अब लेगेसी roboRIO लॉग डाउनलोड के साथ-साथ Systemcore के लिए SFTP का समर्थन करती है।
- 2027 से FRC फ़ील्ड्स और 2027–2028 से FTC फ़ील्ड्स द्वारा उपयोग की जाने वाली [सेंटर/रेड](/more-features/coordinate-systems#center-red) कोऑर्डिनेट सिस्टम जोड़ी गई।
- WPILib 2027 के `Telemetry` और `Tunables` API के लिए समर्थन, अपडेटेड अलर्ट रंग, और Systemcore टाइमस्टैम्प्स को पढ़ने में आसान बनाने के लिए एक नई [टाइमस्टैम्प डिस्प्ले प्राथमिकता](/more-features/timestamps) जोड़ी गई।
- एक नया [Systemcore डायग्नोस्टिक्स](/overview/live-sources) लाइव मोड बिना किसी उपयोगकर्ता कोड के रोबोट स्थिति और हार्डवेयर IO की निगरानी के लिए Systemcore के बिल्ट-इन NetworkTables सर्वर से सीधे जुड़ता है।

## 💡 AdvantageScope लाइट {#advantagescope-lite}

[AdvantageScope लाइट](/more-features/advantagescope-lite) AdvantageScope के विज़ुअलाइज़ेशन और विश्लेषण टूल्स को सीधे आपके वेब ब्राउज़र में लाता है। यह Systemcore वेब इंटरफ़ेस और FIRST ड्राइवर स्टेशन के अंदर से **बिना किसी इंस्टॉलेशन** के उपलब्ध है।

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST ड्राइवर स्टेशन {#first-driver-station}

मैच डायग्नोस्टिक्स को सुव्यवस्थित करने के लिए AdvantageScope नए [FIRST ड्राइवर स्टेशन](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) के साथ गहराई से एकीकृत होता है:

- DS द्वारा बनाई गई WPILOG फ़ाइलों का विश्लेषण करने के लिए [AdvantageScope लाइट](/more-features/advantagescope-lite) सीधे FIRST ड्राइवर स्टेशन सेटिंग्स मेनू से उपलब्ध है।
- बिना किसी कॉन्फ़िगरेशन के लोकल ड्राइवर स्टेशन से रीयल-टाइम मैच स्टेट, कॉम्स मेट्रिक्स, बैटरी वोल्टेज और जॉयस्टिक इनपुट स्ट्रीम करने के लिए डेस्कटॉप ऐप का उपयोग करें।
- डेस्कटॉप पर ड्राइवर स्टेशन `.wpilog` फ़ाइल खोलने पर कंसोल आउटपुट, संचार मेट्रिक्स, पावर, CPU उपयोग और जॉयस्टिक टैब्स के साथ पहले से कॉन्फ़िगर की गई एक समर्पित विंडो खोलने का प्रॉम्प्ट आता है ([डॉक्स](/overview/log-files#driver-station-layout))। यह लेआउट ड्राइवर स्टेशन के लिए AdvantageScope लाइट में भी डिफ़ॉल्ट रूप से उपयोग होता है।
- स्वचालित चेतावनी/त्रुटि हाइलाइटिंग और [ANSI एस्केप सीक्वेंस](/tab-reference/console#ansi-formatting) (रंग और टेक्स्ट शैलियाँ) के पूर्ण समर्थन के साथ 💬 [कंसोल](/tab-reference/console) टैब पर ड्राइवर स्टेशन कंसोल लॉग देखें।

<img src="/img/tutorials/taking-control-1.webp" alt="FIRST ड्राइवर स्टेशन से AdvantageScope लाइट खोलना" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## 🌐 बहु-भाषा समर्थन {#language-support}

AdvantageScope अब डेस्कटॉप एप्लिकेशन, डॉक्यूमेंटेशन साइट, मोबाइल ऐप्स और AdvantageScope लाइट में **14 भाषाओं** में उपलब्ध है: English (US), Spanish (Latin America), French, Dutch, Portuguese (Brazil), Romanian, Turkish, Russian, Kazakh, Hebrew, Arabic, Hindi, Simplified Chinese, और Traditional Chinese।

:::info
अनुवाद एक सतत प्रक्रिया है जो AI और कम्युनिटी योगदानकर्ताओं के सहयोग से तैयार किए गए हैं, और **इनमें अस्वाभाविक वाक्य या अशुद्धियाँ हो सकती हैं**। उन टीमों का धन्यवाद जिन्होंने पहले ही इन अनुवादों की समीक्षा और सुधार करने में मदद की है! हमारी अनुवाद प्रक्रिया और फ़ीडबैक सबमिट करने के तरीके के विवरण के लिए 🌐 [भाषा समर्थन](/overview/language-support) पेज देखें।
:::

<img src="/img/whats-new/multi-language-1.webp" alt="Simplified Chinese में लाइन ग्राफ टैब" />

## 📖 नए ट्यूटोरियल और डॉक्यूमेंटेशन {#new-tutorials-and-documentation}

टीमों को WPILib 2027 और AdvantageScope के साथ शुरुआत करने में मदद करने के लिए डॉक्यूमेंटेशन को एक नई तीन-भागों वाली [ट्यूटोरियल श्रृंखला](/category/tutorials) के साथ विस्तारित किया गया है:

1. **👋 [हैलो, टेलीमेट्री!](/tutorials/hello-telemetry):** `DataLogManager` और `Telemetry` API सेट अप करना, लाइव कनेक्ट करना, और लाइन ग्राफ, टेबल तथा आंकड़ों के साथ डेटा का विश्लेषण करना।
2. **🤖 [फील्ड पर चलें: रोबोट विज़ुअलाइज़ेशन](/tutorials/to-the-field):** FRC और FTC फ़ील्ड्स पर 2D/3D पोज़, ट्रैजेक्टरी और `Mechanism2d` ऑब्जेक्ट्स पब्लिश करना।
3. **🕹️ [नियंत्रण लें: DS और जॉयस्टिक्स](/tutorials/taking-control):** लाइव ड्राइवर स्टेशन डायग्नोस्टिक्स स्ट्रीम करना, रोबोट और DS लॉग सिंक्रनाइज़ करना, कंसोल आउटपुट देखना और कंट्रोलर इनपुट विज़ुअलाइज़ करना।

कई भाषाओं में WPILib के टेलीमेट्री API के पूर्ण कवरेज के साथ पूरे डॉक्यूमेंटेशन में कोड उदाहरण भी अपडेट किए गए हैं।

<img src="/img/tutorials/to-the-field-4.webp" alt="फील्ड पर चलें ट्यूटोरियल से 3D फील्ड विज़ुअलाइज़ेशन" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## 📱 AdvantageTune {#advantagetune}

AdvantageTune एक नया स्टैंडअलोन iPhone और iPad एप्लिकेशन है जो AdvantageScope के पूरक के रूप में एक हल्का मोबाइल ट्यूनिंग अनुभव प्रदान करता है। आप सीधे अपने फ़ोन से लाइव [NetworkTables](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) टॉपिक्स (प्रिमिटिव्स, एरेज़, WPILib structs और Protobufs सहित) देख और संशोधित कर सकते हैं, जिससे हर किसी के लिए रोबोट कोड ट्यूनिंग में शामिल होना आसान हो जाता है।

AdvantageTune और AdvantageScope दोनों साझा करने के लिए सभी ट्यून किए गए मानों को एक सूची में सहेजने के बटन के साथ ट्यून किए गए मानों को वापस रोबोट कोड में एक्सपोर्ट करने की प्रक्रिया को सुव्यवस्थित करते हैं ([डॉक्स](/overview/live-sources/tuning-mode))।

[<img src="/img/app-store_hi.svg" alt="App Store" />](https://apps.apple.com/in/app/advantagetune/id6811453643?l=hi)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="AdvantageTune ब्राउज़ व्यू" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="AdvantageTune टॉपिक एडिटिंग" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="AdvantageTune struct एडिटिंग" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="AdvantageTune ट्यून किए गए मानों की सूची" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="AdvantageTune सर्च और फ़िल्टर" />
</div>

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## 🪐 WPILOG यूनिवर्सल लॉगिंग {#wpilog-universal-logging}

[यूनिवर्सल लॉगिंग](/more-features/universal-logging) के साथ, एक एकल WPILOG फ़ाइल अब वेंडर-विशिष्ट डिवाइस लॉग, CSV डेटा और चाइल्ड WPILOG फ़ाइलों सहित कई लॉग स्ट्रीम्स और फ़ॉर्मेट्स के लिए एक यूनिवर्सल कंटेनर के रूप में कार्य कर सकती है। यूनिवर्सल लॉगिंग एक लचीले, वेंडर-स्वतंत्र दृष्टिकोण के साथ URCL की जगह लेता है: हर स्रोत का डेटा स्वचालित रूप से सिंक्रनाइज़ होकर एक एकीकृत साइडबार ट्री में मर्ज हो जाता है। WPILib (Java, C++, और Python) और AdvantageKit में वेंडर लॉग कैप्चर के विवरण के लिए [यूनिवर्सल लॉगिंग डॉक्यूमेंटेशन](/more-features/universal-logging#experimental-vendor-logging) देखें।

<img src="/img/more-features/universal-logging-1.webp" alt="साइडबार में कई वेंडर लॉग दिखाती एक WPILOG फ़ाइल" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## 🗺️ फील्ड टैब सुधार {#field-tab-improvements}

🗺️ [2D फील्ड](/tab-reference/2d-field) और 👀 [3D फील्ड](/tab-reference/3d-field) टैब्स में कई उपयोगिता सुधार जोड़े गए हैं:

- 2D फ़ील्ड पर पैन और ज़ूम करें, या रोबोट की स्थिति और रोटेशन का अनुसरण करने के लिए कैमरे को लॉक करने हेतु दायाँ-क्लिक करें ([डॉक्स](/tab-reference/2d-field#camera-controls))।
- आसान स्थानिक संदर्भ के लिए 2D और 3D FTC फ़ील्ड्स पर टाइल ग्रिड लाइनें जोड़ी गईं।
- नए 2D या 3D फ़ील्ड टैब खोलते समय AdvantageScope अब याद रखता है कि पिछली बार FRC या FTC फ़ील्ड का उपयोग किया गया था।

<img src="/img/tab-reference/2d-field-1.webp" alt="2D फील्ड टैब अवलोकन" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## 📉 लाइन ग्राफ सुधार {#line-graph-improvements}

📉 [लाइन ग्राफ](/tab-reference/line-graph) और टाइमलाइन में स्पष्ट विश्लेषण के लिए कई विज़ुअल सुधार शामिल हैं:

- "रोबोट मोड दिखाएँ" सक्षम करने पर अब ऑटोनोमस, टेलीऑपरेटेड, यूटिलिटी और डिसेबल्ड अवधियों के लिए एक रंग-कोडित बार रेंडर होता है।
- पॉइंट-शैली के ग्राफ ज़ूम के किसी भी स्तर पर बेहतर दृश्यता के लिए पॉइंट का आकार स्वचालित रूप से स्केल करते हैं।
- नए उपयोगकर्ताओं को स्क्रॉलिंग और ज़ूमिंग जेस्चर पर मार्गदर्शन करने के लिए लाइन ग्राफ और टाइमलाइन पर उपयोगी संकेत दिखाई देते हैं।
- टाइमलाइन और लाइन ग्राफ एक्सिस पर बड़े टाइमस्टैम्प मानों की रेंडरिंग और पठनीयता में सुधार किया गया।

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="लाइन ग्राफ पर रंग-कोडित रोबोट मोड ओवरले" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## 🤝 एक्सेसिबिलिटी संवर्द्धन {#accessibility-enhancements}

AdvantageScope 2027 में एप्लिकेशन को अधिक सुलभ बनाने के लिए कई अपडेट शामिल हैं:

- सभी इनपुट्स के लिए कीबोर्ड टैब नेविगेशन और पूरे ऐप में सभी कंट्रोल्स के लिए वर्णनात्मक टूलटिप्स जोड़े गए।
- AdvantageScope अब OS-स्तरीय reduce transparency और reduce motion सेटिंग्स का सम्मान करता है।
- साइडबार में बूलियन संकेतक अब केवल रंग पर निर्भर हुए बिना स्थितियों में अंतर करते हैं।

## 🥔 नए यूनिट प्रकार {#new-unit-types}

AdvantageScope की [यूनिट-अवेयर ग्राफिंग](/tab-reference/line-graph/units) को अतिरिक्त यूनिट प्रकारों और पार्सिंग विकल्पों के साथ विस्तारित किया गया है:

- पावर (वाट, हॉर्सपावर, आदि)
- अनुपात (विमाहीन, प्रतिशत)
- केल्विन में तापमान
- पोटैटो एनर्जी (Potato energy)
- ब्रिटिश अंग्रेज़ी यूनिट स्पेलिंग (जैसे `metres`)
- WPILib की यूनिट लाइब्रेरी के लिए प्रत्यय (Suffixes)

## 🧱 स्थिरता सुधार {#stability-improvements}

इस रिलीज़ में पूरे एप्लिकेशन में अनेक बग फिक्स, परफॉर्मेंस ऑप्टिमाइज़ेशन और स्थिरता सुधार शामिल हैं। पूरी सूची रिलीज़ [चेंजलॉग](https://github.com/Mechanical-Advantage/AdvantageScope/releases) में देखी जा सकती है, जिसमें प्रमुख बिंदु नीचे दिए गए हैं:

- आधिकारिक Windows रिलीज़ अब कोड-साइन की गई हैं, जिससे इंस्टॉलेशन के दौरान SmartScreen चेतावनियों की आवृत्ति कम हो गई है।
- लॉग लोडिंग और ग्राफिंग परफॉर्मेंस में उल्लेखनीय सुधार हुआ है, विशेष रूप से Hoot (`.hoot`) लॉग्स के साथ काम करते समय।
- कई स्रोतों से लॉग्स को अलाइन करते समय मल्टी-लॉग टाइमस्टैम्प सिंक्रनाइज़ेशन एल्गोरिदम में सुधार किया गया।
- [Phoenix डायग्नोस्टिक्स](/overview/live-sources/phoenix-diagnostics) के लिए कनेक्शन विश्वसनीयता में सुधार किया गया।
- पॉप-आउट विंडो पर मेनू बार और [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) में रिकॉर्डिंग पॉपअप से जुड़े UI मुद्दों को ठीक किया गया।
- स्पष्टता बढ़ाने के लिए पूरे एप्लिकेशन में UI टेक्स्ट और वाक्यांशों को परिष्कृत किया गया।
