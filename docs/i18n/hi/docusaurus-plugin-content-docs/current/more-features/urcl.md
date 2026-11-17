---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 अनऑफिशियल REV-कम्पैटिबल लॉगर (URCL) {#unofficial-rev-compatible-logger}

:::info
2026 में नया: REVLib में अब Spark Max और Spark Flex से डेटा को REV CAN लॉग (`.revlog`) में सेव करने के लिए एक आधिकारिक लॉगिंग समाधान शामिल है। विवरण के लिए [यहाँ](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) देखें। इन फ़ाइलों को सीधे AdvantageScope में खोला जा सकता है, लेकिन इन्हें अन्य डेटा स्रोतों के साथ सटीक रूप से सिंक नहीं किया जा सकता।

एक सहज ट्रांज़िशन और पिछले सीज़न के बराबर फ़ीचर्स बनाए रखने के लिए AdvantageScope का _अनऑफिशियल_ REV-कम्पैटिबल लॉगर (URCL) भी 2026 में टीमों के लिए उपलब्ध रहेगा। 2027 और उसके बाद के लॉगिंग विकल्पों के बारे में हम बाद में अधिक जानकारी साझा करेंगे।
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) Java, C++ और Python के लिए उपलब्ध एक लॉगिंग लाइब्रेरी है जो Spark Max और Spark Flex से डेटा को अपने आप रिकॉर्ड करती है। इसकी मदद से CTRE के [Tuner X प्लॉटिंग फ़ीचर](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) और [Phoenix 6 सिग्नल लॉगर](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) की तरह सभी उपकरणों की लाइव प्लॉटिंग और लॉगिंग की जा सकती है।

सेटअप के बाद, सभी Spark Max और Spark Flex उपकरणों से पीरियोडिक CAN फ्रेम NetworkTables या DataLog पर पब्लिश किए जाते हैं। NetworkTables का उपयोग करते समय, WPILib के [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) का उपयोग डेटा को लॉग फ़ाइल में कैप्चर करने के लिए किया जा सकता है। ये फ्रेम AdvantageScope में देखे जा सकते हैं ([लॉग फ़ाइलें प्रबंधित करना](/overview/log-files) और [लाइव स्रोतों से कनेक्ट करना](/overview/live-sources) देखें)।

- **सभी सिग्नल** अपने आप कैप्चर हो जाते हैं, और **नए उपकरणों के लिए कोई मैन्युअल सेटअप नहीं करना पड़ता**।
- **हर फ्रेम कैप्चर किया जाता है**, भले ही स्टेटस फ्रेम की अवधि रोबोट लूप साइकिल से तेज़ हो।
- फ्रेम **CAN RX समय पर आधारित टाइमस्टैम्प्स** के साथ लॉग किए जाते हैं, जिससे यूज़र कोड में पारंपरिक लॉगिंग की तुलना में [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) के साथ ज़्यादा सटीक एक्सीलरेशन कैरेक्टराइज़ेशन संभव होता है (नीचे "SysId उपयोग" देखें)।
- लॉगिंग **बेहद कुशल** है; इसके ऑपरेशंस थ्रेडेड हैं और बड़ी संख्या में उपकरणों को लॉग करते समय भी हर 20 ms पीरियोडिक साइकिल में 80 µs से कम समय लेते हैं।
- **REVLib के सभी फंक्शन्स पर इसका कोई असर नहीं पड़ता।**

:::info
चूँकि यह लाइब्रेरी कोई आधिकारिक REV टूल नहीं है, इसलिए सहायता से जुड़े प्रश्न REV सपोर्ट के बजाय URCL [इश्यूज़ पेज](https://github.com/Mechanical-Advantage/URCL/issues) या software@team6328.org पर भेजें।
:::

## सेटअप {#setup}

VSCode में डिपेंडेंसी मैनेजर का उपयोग करके [थर्ड-पार्टी लाइब्रेरीज़](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) इंस्टॉल करने के निर्देशों का पालन करते हुए URCL vendordep इंस्टॉल करें। वैकल्पिक रूप से, आप नीचे दिए गए वेंडर JSON URL का उपयोग कर सकते हैं:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL डिफ़ॉल्ट रूप से NetworkTables पर पब्लिश करता है, जहाँ से WPILib के DataLogManager को इनेबल करके डेटा को लॉग फ़ाइल में सेव किया जा सकता है। इसके अलावा, URCL सीधे DataLog में भी लॉग कर सकता है। लॉगर को `robotInit` में शुरू किया जाना चाहिए, जैसा नीचे दिखाया गया है।

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // If publishing to NetworkTables and DataLog
  DataLogManager.start();
  URCL.start();

  // If logging only to DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // If publishing to NetworkTables and DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // If logging only to DataLog
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # If publishing to NetworkTables and DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # If logging only to DataLog
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
AdvantageKit के साथ URCL कम्पैटिबिलिटी केवल सुविधा के लिए दी गई है; लॉग में रिकॉर्ड किया गया डेटा रीप्ले में उपलब्ध नहीं होता। **रीप्ले को सपोर्ट करने के लिए REV मोटर कंट्रोलर्स को अभी भी डिफाइंड इनपुट्स वाले IO इम्प्लीमेंटेशन का हिस्सा होना ज़रूरी है**।
:::

</TabItem>
</Tabs>

लॉग में उपकरणों को आसानी से पहचानने के लिए, `start()` या `startExternal()` मेथड में एक मैप ऑब्जेक्ट पास करके CAN ID को एलियास (aliases) दिए जा सकते हैं। इसकी कीज़ (keys) CAN ID होती हैं और वैल्यूज़ वे स्ट्रिंग्स होती हैं जिन्हें आप लॉग में नाम के तौर पर उपयोग करना चाहते हैं। जिन उपकरणों को कोई एलियास नहीं दिया गया है, वे अपने डिफ़ॉल्ट नाम से लॉग होंगे।

:::warning
CAN उपयोग को कम रखने के लिए, Spark उपकरणों के ज़्यादातर स्टेटस फ्रेम **डिफ़ॉल्ट रूप से बंद** होते हैं जब तक कि उनसे जुड़ा गेटर मेथड कॉल न किया जाए। इन बंद स्टेटस फ्रेम का कोई भी डेटा URCL लॉग में उपलब्ध नहीं होगा।

अधिक जानकारी के लिए, [REVLib डॉक्यूमेंटेशन](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) देखें। हम सलाह देते हैं कि Spark को कॉन्फ़िगर करते समय [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) का उपयोग करें, ताकि आप उन सभी सिग्नल्स को मैन्युअल रूप से इनेबल कर सकें जिन्हें आप लॉग फ़ाइल में शामिल करना चाहते हैं।
:::

## SysId उपयोग {#sysid-usage}

1. ऊपर बताए गए तरीके से URCL सेटअप करने के बाद, मैकेनिज्म लॉग कंज्यूमर के लिए `null` देकर SysId रूटीन को कॉन्फ़िगर करें। नीचे Java के लिए एक उदाहरण दिखाया गया है। यह कॉन्फ़िगरेशन सबसिस्टम क्लास के अंदर किया जा सकता है।

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. रोबोट पर SysId रूटीन चलाएँ। आप SysId कमांड्स को ऑटो रूटीन के रूप में सेटअप कर सकते हैं या किसी बटन ट्रिगर से जोड़ सकते हैं।

3. लॉग फ़ाइल डाउनलोड करें और उसे AdvantageScope में खोलें। मेनू बार में, `फ़ाइल` > `डेटा एक्सपोर्ट करें...` पर जाएँ। फ़ॉर्मेट को "WPILOG" और फील्ड सेट को "जनरेट किए गए शामिल करें" पर सेट करें। सेव आइकन पर क्लिक करें और लॉग सेव करने के लिए लोकेशन चुनें।

:::warning
_SysId एनालाइज़र में खोलने से पहले_ रोबोट से मिली लॉग फ़ाइल को AdvantageScope में खोलकर एक्सपोर्ट करना ज़रूरी है। URCL द्वारा रिकॉर्ड किए गए CAN डेटा को SysId के अनुकूल फ़ॉर्मेट में बदलने के लिए यह आवश्यक है।
:::

4. VSCode कमांड पैलेट में "WPILib: Start Tool" खोजकर और "SysId" चुनकर (या Windows पर डेस्कटॉप लॉन्चर से) SysId एनालाइज़र खोलें। "Open data log file..." पर क्लिक करके एक्सपोर्ट की गई लॉग फ़ाइल खोलें।

5. डिफ़ॉल्ट एनकोडर का उपयोग करके विश्लेषण चलाने के लिए नीचे दिए गए फील्ड्स चुनें। सेकेंडरी एनकोडर्स (जैसे alternate, external, analog, absolute आदि) के पोज़िशन और वेलोसिटी डेटा का भी उपयोग किया जा सकता है।

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId द्वारा जेनरेट किए गए गेन (gains) उन्हीं इकाइयों का उपयोग करेंगे जिन्हें रिपोर्ट करने के लिए Spark Max/Flex को कॉन्फ़िगर किया गया है ([`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) और [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>) का उपयोग करके)। डिफ़ॉल्ट रूप से, ये बिना किसी गियरिंग के रोटेशन और RPM होते हैं। यदि डेटा रिकॉर्ड करते समय उपयोग की गई इकाइयाँ आपकी मनचाही इकाइयों से मेल नहीं खाती हैं, तो विश्लेषण के दौरान SysId में स्केलिंग को एडजस्ट किया जा सकता है।
:::
