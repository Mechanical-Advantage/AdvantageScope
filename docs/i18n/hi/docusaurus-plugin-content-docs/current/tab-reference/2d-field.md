---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D फील्ड {#2d-field}

2D फील्ड टैब फील्ड के मानचित्र पर रोबोट का 2D विज़ुअलाइज़ेशन दिखाता है। यह विज़न लक्ष्यीकरण स्थिति और संदर्भ पोज़ जैसे अतिरिक्त डेटा भी दिखा सकता है।

<img src="/img/tab-reference/2d-field-1.webp" alt="Overview of 2D field tab" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

<details>
<summary>टाइमलाइन नियंत्रण (Timeline Controls)</summary>

टाइमलाइन का उपयोग प्लेबैक और विज़ुअलाइज़ेशन को नियंत्रित करने के लिए किया जाता है। टाइमलाइन पर क्लिक करने से एक समय चुना जाता है, और राइट-क्लिक करने से यह अचयनित (deselect) हो जाता है। चयनित समय सभी टैब में सिंक्रनाइज़ होता है, जिससे अन्य दृश्यों में इस स्थान को जल्दी से खोजना आसान हो जाता है।

पीले भाग इंगित करते हैं कि रोबोट कब ऑटोनोमस है, नीले भाग इंगित करते हैं कि रोबोट कब टेलीऑपरेटेड है, और ग्रे भाग इंगित करते हैं कि रोबोट कब यूटिलिटी मोड में है।

ज़ूम करने के लिए, कर्सर को टाइमलाइन पर रखें और ऊपर या नीचे स्क्रॉल करें। `Shift` दबाए रखते हुए क्लिक और ड्रैग करके भी एक रेंज का चयन किया जा सकता है। क्षैतिज रूप से स्क्रॉल करके (समर्थित उपकरणों पर), या टाइमलाइन पर क्लिक और ड्रैग करके बाएँ और दाएँ जाएँ। लाइव कनेक्ट होने पर, बाईं ओर स्क्रॉल करने से वर्तमान समय से अनलॉक हो जाता है, और पूरी तरह से दाईं ओर स्क्रॉल करने से फिर से वर्तमान समय पर लॉक हो जाता है। रोबोट सक्षम होने की अवधि में ज़ूम करने के लिए `Ctrl+\` दबाएँ।

<img src="/img/tab-reference/timeline.webp" alt="Timeline" />

</details>

## ऑब्जेक्ट्स जोड़ना {#adding-objects}

आरंभ करने के लिए, किसी फील्ड को "पोज़ेस" अनुभाग में खींचें। X बटन का उपयोग करके किसी ऑब्जेक्ट को हटाएँ, या आँख के आइकन पर क्लिक करके या फील्ड के नाम पर डबल-क्लिक करके इसे अस्थायी रूप से छिपाएँ। सभी ऑब्जेक्ट्स को हटाने के लिए, अक्ष शीर्षक के पास रीसायकल बिन आइकन पर क्लिक करें और फिर `सभी साफ़ करें`। ऑब्जेक्ट्स को क्लिक करके और खींचकर सूची में पुनर्व्यवस्थित किया जा सकता है।

**प्रत्येक ऑब्जेक्ट को कस्टमाइज़ करने के लिए, रंगीन आइकन पर क्लिक करें या फील्ड नाम पर राइट-क्लिक करें।** AdvantageScope बड़ी संख्या में ऑब्जेक्ट प्रकारों का समर्थन करता है, जिनमें से कई को कस्टमाइज़ किया जा सकता है (जैसे रंग बदलना)। कुछ ऑब्जेक्ट्स को किसी मौजूदा ऑब्जेक्ट के चाइल्ड के रूप में जोड़ा जाना चाहिए।

:::tip
समर्थित ऑब्जेक्ट प्रकारों की पूरी सूची देखने के लिए, `?` आइकन पर क्लिक करें। इस सूची में समर्थित डेटा प्रकार और यह भी शामिल है कि क्या ऑब्जेक्ट्स को चाइल्ड के रूप में जोड़ा जाना चाहिए।
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="2D field with objects" />

## कैमरा नियंत्रण {#camera-controls}

आप फील्ड को पैन करने के लिए दृश्य को खींच सकते हैं और ज़ूम इन या आउट करने के लिए स्क्रॉल कर सकते हैं। कैमरा रीसेट करने के लिए `Escape` कुंजी दबाएँ या डबल-क्लिक करें। तीन लॉकिंग विकल्पों में से चुनने के लिए लॉक बटन पर क्लिक करें:

- **अनलॉक्ड:** कैमरा स्थिर रहता है और पूरे फील्ड को प्रदर्शित करता है।
- **लॉक्ड (रोबोट):** कैमरा प्राथमिक रोबोट पर केंद्रित रहता है क्योंकि यह फील्ड के चारों ओर घूमता है।
- **लॉक्ड (रोबोट और रोटेशन):** कैमरा प्राथमिक रोबोट पर केंद्रित रहता है और घूमता है ताकि रोबोट हमेशा ऊपर की ओर रहे।

## डेटा प्रारूप {#data-format}

ज्यामिति डेटा को बाइट-एन्कोडेड स्ट्रक्ट (struct) या प्रोटोबफ़ (protobuf) के रूप में पब्लिश किया जाना चाहिए। `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d`, और अन्य सहित विभिन्न 2D और 3D ज्यामिति प्रकार समर्थित हैं।

WPILib और AdvantageKit सहित कई लाइब्रेरी स्ट्रक्ट प्रारूप का समर्थन करती हैं। नीचे दिया गया उदाहरण कोड दिखाता है कि Java में 2D पोज़ डेटा कैसे लॉग किया जाए।

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", poseA, poseB);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC डैशबोर्ड">

```java
// This protocol does not support the modern struct format, but pose
// values can be published using separate fields that include the
// suffixes "x", "y", and "heading" (as shown below):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Inches
packet.put("Pose y", 2.8); // Inches
packet.put("Pose heading", 3.14); // Radians

// Alternatively, headings can be published in degrees
packet.put("Pose heading (deg)", 180.0); // Degrees

// Add other telemetry values here...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Alternately, use MultipleTelemetry and the standard SDK telemetry:
// During OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// During Loop:
telemetry.addData("Pose x", 6.3); // Inches
telemetry.addData("Pose y", 2.8); // Inches
telemetry.addData("Pose heading", 3.14); // Radians

// or...
telemetry.addData("Pose heading (deg)", 180.0); // Degrees

// Add other telemetry values here...
telemetry.update();
```

</TabItem>
</Tabs>

## कॉन्फ़िगरेशन {#configuration}

- **फील्ड (Field):** उपयोग करने के लिए फील्ड छवि। सभी हालिया FRC और FTC खेल समर्थित हैं। कस्टम फील्ड छवि जोड़ने के लिए, [कस्टम एसेट्स](/more-features/custom-assets) देखें।
- **अभिविन्यास (Orientation):** व्यूअर पेन में फील्ड छवि का अभिविन्यास।
- **आकार (Size):** रोबोट की भुजा की लंबाई (FRC के लिए 30/27/24 इंच, FTC के लिए 18/16/14 इंच)।

:::info
इस टैब पर उपयोग किया जाने वाला कोऑर्डिनेट सिस्टम अनुकूलन योग्य है। विवरण के लिए [कोऑर्डिनेट सिस्टम](/more-features/coordinate-systems) पृष्ठ देखें।
:::
