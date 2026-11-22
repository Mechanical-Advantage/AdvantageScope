---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 भाषा समर्थन {#language-support}

AdvantageScope दुनिया भर की टीमों को स्थानीय भाषा में अनुभव देने के लिए कई भाषाओं को सपोर्ट करता है। ये भाषाएँ वर्तमान में AdvantageScope के डॉक्यूमेंटेशन, डेस्कटॉप ऐप, मोबाइल ऐप्स (AdvantageScope XR और AdvantageTune), और AdvantageScope लाइट (Systemcore और FIRST ड्राइवर स्टेशन पर) में उपलब्ध और समर्थित हैं:

- English (US)
- Spanish (Latin America)
- French
- Dutch
- Portuguese (Brazil)
- Romanian
- Turkish
- Russian
- Kazakh
- Hebrew
- Arabic
- Hindi
- Simplified Chinese
- Traditional Chinese

AdvantageScope अनुवादों की समीक्षा और सुधार करने में मदद करने के लिए निम्नलिखित योगदानकर्ताओं का धन्यवाद!

- FRC Team 4400 Cerbotics
- FRC Team 6907 The G.O.A.T.
- Ata Baber

## कॉन्फ़िगरेशन {#configuration}

AdvantageScope में डिस्प्ले भाषा बदलने के लिए, `ऐप` > `प्राथमिकताएं दिखाएँ...` (Windows/Linux) या `AdvantageScope` > `सेटिंग्स...` (macOS) पर क्लिक करके प्राथमिकताएं विंडो खोलें। "भाषा" सेटिंग के तहत, आप समर्थित भाषाओं की सूची में से अपनी भाषा चुन सकते हैं या अपने ऑपरेटिंग सिस्टम की भाषा से अपने-आप मेल खाने के लिए "सिस्टम डिफ़ॉल्ट" चुन सकते हैं।

<img src="/img/prefs_hi.webp" alt="Diagram of preferences" height="450" />

## लॉगिंग कुंजियाँ {#logging-keys}

AdvantageScope द्वारा समर्थित सभी फ़ॉर्मेट लॉग कीज़ (keys) को परिभाषित करते समय पूर्ण यूनिकोड सपोर्ट देते हैं। इसका मतलब है कि आप अपनी पसंदीदा भाषा (एक्सेंट्स, विशेष कैरेक्टर्स और गैर-लैटिन लिपियों सहित) में डेटा लॉग कर सकते हैं और यह AdvantageScope में सही ढंग से रिकॉर्ड और प्रदर्शित होगा।

यहाँ हिंदी की के साथ एक स्ट्रिंग लॉग करने का उदाहरण दिया गया है:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Telemetry.log("ड्राइव/दायां मोटर वेग", "तेज़");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::telemetry::Log("ड्राइव/दायां मोटर वेग", "तेज़");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import telemetry

telemetry.log("ड्राइव/दायां मोटर वेग", "तेज़")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("ड्राइव/दायां मोटर वेग", "तेज़");
```

</TabItem>
</Tabs>

:::tip इकाई सपोर्ट
इकाई मेटाडेटा भेजने के बारे में अधिक जानकारी के लिए [इकाई सपोर्ट](/tab-reference/line-graph/units) पेज देखें। AdvantageScope में चुनी गई भाषा चाहे जो भी हो, इकाई के नाम SI प्रतीकों या अंग्रेज़ी (अमेरिकी या ब्रिटिश स्पेलिंग) में ही दिए जाने चाहिए।
:::

## विकास {#development}

AdvantageScope का स्थानीयकरण (localization) आर्टिफिशियल इंटेलिजेंस (AI) और कम्युनिटी के सहयोग से तैयार किया गया है। चूंकि AdvantageScope तेज़ी से विकसित हो रहा प्रोजेक्ट है, इसलिए हर भाषा में अनुवादित ऐप और डॉक्यूमेंटेशन को सिंक में रखने के लिए AI का उपयोग ज़रूरी है। इसका मतलब है कि आप चाहे कोई भी भाषा चुनें, नए फ़ीचर्स और अपडेट हमेशा एक साथ उपलब्ध होते हैं।

हमारी प्रक्रिया को उन खास शब्दों, प्रचलित अंग्रेज़ी शब्दों (loanwords) और लिप्यंतरण से मेल खाने के लिए डिज़ाइन किया गया है जिनसे स्थानीय टीमें परिचित हैं। हालांकि, **AI अनुवादों में कई बार अस्वाभाविक वाक्य या अन्य अशुद्धियाँ हो सकती हैं**। हम आपके फ़ीडबैक का स्वागत करते हैं; आप ऐप में बैंगनी आइकन पर क्लिक करके (जब अंग्रेज़ी के अलावा कोई अन्य भाषा चुनी गई हो) या डॉक्यूमेंटेशन टाइटल बार में फ़ीडबैक लिंक के माध्यम से अनुवादों पर फ़ीडबैक दे सकते हैं।
