---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ मैकेनिज्म {#mechanism}

मैकेनिज्म टैब में एक या अधिक [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) ऑब्जेक्ट्स से बना एक जॉइंटेड (jointed) मैकेनिज्म दिखता है।

<img src="/img/tab-reference/mechanism-1.webp" alt="Overview of mechanism tab" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

<details>
<summary>टाइमलाइन कंट्रोल्स (Timeline Controls)</summary>

टाइमलाइन का उपयोग प्लेबैक और विज़ुअलाइज़ेशन को कंट्रोल करने के लिए किया जाता है। टाइमलाइन पर क्लिक करके आप किसी समय को चुन सकते हैं, और राइट-क्लिक करके उसे अनसेलेक्ट कर सकते हैं। चुना गया समय सभी टैब्स में सिंक्रनाइज़ रहता है, जिससे दूसरे व्यू में भी उसी जगह पर पहुँचना आसान हो जाता है।

पीले हिस्से दिखाते हैं कि रोबोट कब ऑटोनोमस मोड में है, नीले हिस्से टेलीऑपरेटेड मोड को और ग्रे हिस्से यूटिलिटी मोड को दिखाते हैं।

ज़ूम करने के लिए कर्सर को टाइमलाइन पर ले जाएँ और ऊपर या नीचे स्क्रॉल करें। `Shift` दबाए रखकर क्लिक और ड्रैग करने से भी एक रेंज चुनी जा सकती है। बाएँ और दाएँ जाने के लिए हॉरिज़ॉन्टल स्क्रॉल करें (समर्थित डिवाइस पर) या टाइमलाइन पर क्लिक करके ड्रैग करें। लाइव कनेक्ट होने पर बाईं ओर स्क्रॉल करने से टाइमलाइन करंट टाइम से अनलॉक हो जाती है, और पूरी तरह दाईं ओर स्क्रॉल करने पर फिर से करंट टाइम पर लॉक हो जाती है। रोबोट के इनेबल होने की अवधि पर ज़ूम करने के लिए `Ctrl+\` दबाएँ।

<img src="/img/tab-reference/timeline.webp" alt="Timeline" />

</details>

## मैकेनिज्म जोड़ना {#adding-mechanisms}

शुरू करने के लिए, कंट्रोल पेन में एक `Mechanism2d` को ड्रैग करें। X बटन से किसी मैकेनिज्म को हटाया जा सकता है, या आँख वाले आइकन पर क्लिक करके या फील्ड के नाम पर डबल-क्लिक करके उसे कुछ समय के लिए छिपाया जा सकता है। सभी मैकेनिज्म को हटाने के लिए, एक्सिस टाइटल के पास मौजूद ट्रैश आइकन पर क्लिक करें और फिर `सभी साफ़ करें` चुनें। सूची में क्लिक और ड्रैग करके मैकेनिज्म का क्रम बदला जा सकता है।

## डेटा पब्लिश करना {#publishing-data}

मैकेनिज्म डेटा पब्लिश करने के लिए, समय-समय पर `Mechanism2d` ऑब्जेक्ट को लॉग करें (जैसा नीचे दिखाया गया है)। ध्यान दें कि यह कॉल केवल `Mechanism2d` की मौजूदा स्थिति को रिकॉर्ड करता है, इसलिए ऑब्जेक्ट अपडेट होने के बाद इसे हर लूप साइकिल में कॉल करना ज़रूरी है।

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::Mechanism2d mechanism{3, 3};

void Periodic() {
  wpi::telemetry::Log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import wpilib
import telemetry

mechanism = wpilib.Mechanism2d(3, 3)

def periodic():
    telemetry.log("MyMechanism", mechanism)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
`Logger.recordOutput` को कॉल किए बिना हर लूप साइकिल में मैकेनिज्म की स्थिति को अपने-आप लॉग करने के लिए AdvantageKit के [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) एनोटेशन का उपयोग किया जा सकता है।
:::

</TabItem>
</Tabs>
