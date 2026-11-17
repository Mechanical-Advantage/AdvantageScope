---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D फील्ड {#2d-field}

2D फील्ड टैब में फील्ड के मैप के ऊपर रोबोट का 2D विज़ुअलाइज़ेशन दिखता है। इसमें विज़न टारगेटिंग स्टेटस और रेफरेंस पोज़ जैसा अतिरिक्त डेटा भी देखा जा सकता है।

<img src="/img/tab-reference/2d-field-1.webp" alt="Overview of 2D field tab" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

<details>
<summary>टाइमलाइन कंट्रोल्स (Timeline Controls)</summary>

टाइमलाइन का उपयोग प्लेबैक और विज़ुअलाइज़ेशन को कंट्रोल करने के लिए किया जाता है। टाइमलाइन पर क्लिक करके आप किसी समय को चुन सकते हैं, और राइट-क्लिक करके उसे अनसेलेक्ट कर सकते हैं। चुना गया समय सभी टैब्स में सिंक्रनाइज़ रहता है, जिससे दूसरे व्यू में भी उसी जगह पर पहुँचना आसान हो जाता है।

पीले हिस्से दिखाते हैं कि रोबोट कब ऑटोनोमस मोड में है, नीले हिस्से टेलीऑपरेटेड मोड को और ग्रे हिस्से यूटिलिटी मोड को दिखाते हैं।

ज़ूम करने के लिए कर्सर को टाइमलाइन पर ले जाएँ और ऊपर या नीचे स्क्रॉल करें। `Shift` दबाए रखकर क्लिक और ड्रैग करने से भी एक रेंज चुनी जा सकती है। बाएँ और दाएँ जाने के लिए हॉरिज़ॉन्टल स्क्रॉल करें (समर्थित डिवाइस पर) या टाइमलाइन पर क्लिक करके ड्रैग करें। लाइव कनेक्ट होने पर बाईं ओर स्क्रॉल करने से टाइमलाइन करंट टाइम से अनलॉक हो जाती है, और पूरी तरह दाईं ओर स्क्रॉल करने पर फिर से करंट टाइम पर लॉक हो जाती है। रोबोट के इनेबल होने की अवधि पर ज़ूम करने के लिए `Ctrl+\` दबाएँ।

<img src="/img/tab-reference/timeline.webp" alt="Timeline" />

</details>

## कैमरा कंट्रोल्स {#camera-controls}

फील्ड पर ऊपर या नीचे स्क्रॉल करके ज़ूम इन और ज़ूम आउट करें। फील्ड में पैन करने के लिए क्लिक करके ड्रैग करें। फील्ड पर कहीं भी राइट-क्लिक करने पर कैमरा मेनू खुलता है, जिसमें ये विकल्प मिलते हैं:

- **अनलॉक्ड:** पैन और ज़ूम मैन्युअल रहते हैं।
- **लॉक्ड (रोबोट):** कैमरा रोबोट को ट्रैक करने के लिए अपने-आप पैन होता है।
- **लॉक्ड (रोबोट और रोटेशन):** कैमरा रोबोट और उसके रोटेशन को ट्रैक करने के लिए अपने-आप पैन और रोटेट होता है।

दोनों लॉक्ड मोड में भी आप कैमरे को रोबोट से दूर आसानी से पैन कर सकते हैं। किसी भी मोड में कैमरे को रोटेट करने के लिए कंट्रोल पेन में मौजूद ओरिएंटेशन बटनों का उपयोग किया जा सकता है।

## ऑब्जेक्ट्स जोड़ना {#adding-objects}

शुरू करने के लिए, किसी फील्ड को "पोज़ेस" सेक्शन में ड्रैग करें। X बटन से किसी ऑब्जेक्ट को हटाया जा सकता है, या आँख वाले आइकन पर क्लिक करके या फील्ड के नाम पर डबल-क्लिक करके उसे कुछ समय के लिए छिपाया जा सकता है। सभी ऑब्जेक्ट्स को हटाने के लिए, एक्सिस टाइटल के पास मौजूद ट्रैश आइकन पर क्लिक करें और फिर `सभी साफ़ करें` चुनें। सूची में क्लिक और ड्रैग करके ऑब्जेक्ट्स का क्रम बदला जा सकता है।

**प्रत्येक ऑब्जेक्ट को कस्टमाइज़ करने के लिए, रंगीन आइकन पर क्लिक करें या फील्ड के नाम पर राइट-क्लिक करें।** AdvantageScope कई तरह के ऑब्जेक्ट टाइप्स सपोर्ट करता है, जिनमें से कई को कस्टमाइज़ किया जा सकता है (जैसे रंग बदलना)। कुछ ऑब्जेक्ट्स को किसी मौजूदा ऑब्जेक्ट के चाइल्ड के रूप में जोड़ना ज़रूरी होता है।

:::tip
सपोर्टेड ऑब्जेक्ट टाइप्स की पूरी लिस्ट देखने के लिए `?` आइकन पर क्लिक करें। इस लिस्ट में सपोर्टेड डेटा टाइप्स और यह भी बताया गया है कि किन ऑब्जेक्ट्स को चाइल्ड के रूप में जोड़ना होता है।
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="2D field with objects" />

## डेटा फॉर्मेट {#data-format}

ज्योमेट्री डेटा को बाइट-एन्कोडेड struct या protobuf के रूप में पब्लिश किया जाना चाहिए। `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` आदि सहित कई 2D और 3D ज्योमेट्री टाइप्स सपोर्टेड हैं।

WPILib और AdvantageKit सहित कई लाइब्रेरी struct फॉर्मेट को सपोर्ट करती हैं। नीचे दिए गए उदाहरण कोड में दिखाया गया है कि Java में 2D पोज़ डेटा कैसे लॉग किया जाता है।

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
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

- **फील्ड (Field):** उपयोग की जाने वाली फील्ड इमेज। सभी हालिया FRC और FTC गेम्स सपोर्टेड हैं। कस्टम फील्ड इमेज जोड़ने के लिए [कस्टम एसेट्स](/more-features/custom-assets) देखें।
- **ओरिएंटेशन (Orientation):** व्यूअर पेन में फील्ड इमेज का ओरिएंटेशन।
- **साइज़ (Size):** रोबोट की साइड की लंबाई (FRC के लिए 30/27/24 इंच, FTC के लिए 18/16/14 इंच)।

:::info
इस टैब में उपयोग किया जाने वाला कोऑर्डिनेट सिस्टम कस्टमाइज़ेबल है। विवरण के लिए [कोऑर्डिनेट सिस्टम](/more-features/coordinate-systems) पेज देखें।
:::
