---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 अनऑफिशियल REV-कम्पैटिबल लॉगर (URCL) {#unofficial-rev-compatible-logger}

:::info
2026 में नया, REVLib में Spark Max और Spark Flex से डेटा को REV CAN लॉग (`.revlog`) में सहेजने के लिए एक आधिकारिक लॉगिंग समाधान शामिल है। विवरण के लिए [यहाँ](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) देखें। इन फ़ाइलों को सीधे AdvantageScope में खोला जा सकता है, लेकिन इन्हें अन्य डेटा स्रोतों के साथ सटीक रूप से सिंक्रनाइज़ नहीं किया जा सकता है।

AdvantageScope का _अनऑफिशियल_ REV-कम्पैटिबल लॉगर (URCL) भी 2026 में टीमों के लिए उपलब्ध रहेगा ताकि एक सहज संक्रमण सुनिश्चित हो सके और पिछले सीज़न के साथ फीचर समानता प्रदान की जा सके। 2027 और उसके बाद के लॉगिंग विकल्पों के बारे में साझा करने के लिए हमारे पास बाद में अधिक विवरण होंगे।
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) Java, C++, और Python के लिए उपलब्ध एक लॉगिंग लाइब्रेरी है जो Spark Max और Spark Flex से डेटा को स्वचालित रूप से रिकॉर्ड करती है। यह CTRE के [Tuner X प्लॉटिंग फीचर](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) और [Phoenix 6 सिग्नल लॉगर](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) के समान सभी उपकरणों की लाइव प्लॉटिंग और लॉगिंग को सक्षम बनाता है।

सेटअप के बाद, सभी Spark Max और Spark Flex उपकरणों से आवधिक CAN फ्रेम NetworkTables या DataLog पर पब्लिश किए जाते हैं। NetworkTables का उपयोग करते समय, WPILib के [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) का उपयोग डेटा को लॉग फ़ाइल में कैप्चर करने के लिए किया जा सकता है। ये फ्रेम AdvantageScope में देखने योग्य हैं ([लॉग फ़ाइलें प्रबंधित करना](/overview/log-files) और [लाइव स्रोतों से कनेक्ट करना](/overview/live-sources) देखें)।

- **सभी सिग्नल** स्वचालित रूप से कैप्चर किए जाते हैं, **नए उपकरणों के लिए कोई मैन्युअल सेटअप नहीं**।
- **प्रत्येक फ्रेम कैप्चर किया जाता है**, तब भी जब स्थिति फ्रेम अवधि रोबोट लूप चक्र से तेज हो।
- फ़्रेम **CAN RX समय पर आधारित टाइमस्टैम्प्स** के साथ लॉग किए जाते हैं, जो उपयोगकर्ता कोड में पारंपरिक लॉगिंग की तुलना में [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) के साथ अधिक सटीक त्वरण लक्षण वर्णन को सक्षम करते हैं (नीचे "SysId उपयोग" देखें)।
- लॉगिंग **अत्यधिक कुशल** है; संचालन थ्रेडेड हैं और प्रति 20ms आवधिक चक्र में 80µs से कम समय के लिए चलते हैं, यहाँ तक कि बड़ी संख्या में उपकरणों को लॉग करते समय भी।
- **REVLib के सभी कार्य अप्रभावित हैं।**

:::info
चूँकि यह लाइब्रेरी एक आधिकारिक REV उपकरण नहीं है, समर्थन प्रश्नों को REV के समर्थन संपर्क के बजाय URCL [समस्या पृष्ठ](https://github.com/Mechanical-Advantage/URCL/issues) या software@team6328.org पर निर्देशित किया जाना चाहिए।
:::

## सेटअप {#setup}

VSCode में निर्भरता प्रबंधक का उपयोग करके [तृतीय पक्ष लाइब्रेरी](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) स्थापित करने के निर्देशों का पालन करके URCL vendordep स्थापित करें। वैकल्पिक रूप से, आप निम्न विक्रेता JSON URL का उपयोग कर सकते हैं:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL डिफ़ॉल्ट रूप से NetworkTables पर पब्लिश करता है, जहाँ WPILib के DataLogManager को सक्षम करके डेटा को लॉग फ़ाइल में सहेजा जा सकता है। वैकल्पिक रूप से, URCL सीधे DataLog में लॉग कर सकता है। लॉगर को `robotInit` में शुरू किया जाना चाहिए, जैसा कि नीचे दिखाया गया है।

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
AdvantageKit के साथ URCL संगतता केवल सुविधा के लिए प्रदान की गई है; लॉग में रिकॉर्ड किया गया डेटा रीप्ले में उपलब्ध नहीं है। **रीप्ले का समर्थन करने के लिए परिभाषित इनपुट के साथ REV मोटर नियंत्रक अभी भी एक IO कार्यान्वयन का हिस्सा होने चाहिए**।
:::

</TabItem>
</Tabs>

लॉग में उपकरणों को अधिक आसानी से पहचानने के लिए, `start()` या `startExternal()` विधि में एक मैप ऑब्जेक्ट पास करके CAN ID को उपनाम (aliases) सौंपे जा सकते हैं। कुंजियाँ CAN ID हैं और मान लॉग में उपयोग करने के लिए नामों के लिए स्ट्रिंग्स हैं। जिन उपकरणों को कोई उपनाम नहीं सौंपा गया है, उन्हें उनके डिफ़ॉल्ट नामों का उपयोग करके लॉग किया जाएगा।

:::warning
CAN उपयोग को कम करने के लिए, स्पार्क उपकरणों के लिए अधिकांश स्थिति फ्रेम **डिफ़ॉल्ट रूप से अक्षम** होते हैं जब तक कि संबंधित गेट्टर विधि को कॉल नहीं किया जाता है। इन अक्षम स्थिति फ़्रेमों में शामिल कोई भी डेटा URCL लॉग में उपलब्ध नहीं होगा।

अधिक विवरण के लिए, [REVLib दस्तावेज़](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) देखें। हम स्पार्क को कॉन्फ़िगर करते समय [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) का उपयोग करने की अनुशंसा करते हैं ताकि आप लॉग फ़ाइल में शामिल करने के लिए इच्छित किसी भी सिग्नल को मैन्युअल रूप से सक्षम कर सकें।
:::

## SysId उपयोग {#sysid-usage}

1. ऊपर दिखाए अनुसार URCL स्थापित करने के बाद, मैकेनिज्म लॉग उपभोक्ता के लिए `null` का उपयोग करके SysId रूटीन को कॉन्फ़िगर करें। Java के लिए नीचे एक उदाहरण दिखाया गया है। यह कॉन्फ़िगरेशन सबसिस्टम वर्ग के भीतर किया जा सकता है।

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

2. रोबोट पर SysId रूटीन चलाएँ। SysId कमांड को ऑटो रूटीन के रूप में कॉन्फ़िगर किया जा सकता है या बटन ट्रिगर से जोड़ा जा सकता है।

3. लॉग फ़ाइल डाउनलोड करें और इसे AdvantageScope में खोलें। मेनू बार में, `फ़ाइल` > `डेटा एक्सपोर्ट करें...` पर जाएँ। प्रारूप को "WPILOG" पर और फील्ड सेट को "जनरेट किए गए शामिल करें" पर सेट करें। सेव आइकन पर क्लिक करें और लॉग को सेव करने के लिए एक स्थान चुनें।

:::warning
_SysId विश्लेषक का उपयोग करके खोलने से पहले_ रोबोट से लॉग फ़ाइल को AdvantageScope द्वारा खोला और एक्सपोर्ट किया जाना चाहिए। SysId के साथ संगत प्रारूप में URCL द्वारा रिकॉर्ड किए गए CAN डेटा को परिवर्तित करने के लिए यह आवश्यक है।
:::

4. VSCode कमांड पैलेट में "WPILib: Start Tool" खोजकर और "SysId" चुनकर (या Windows पर डेस्कटॉप लॉन्चर का उपयोग करके) SysId विश्लेषक खोलें। "Open data log file..." पर क्लिक करके एक्सपोर्ट की गई लॉग फ़ाइल खोलें।

5. डिफ़ॉल्ट एनकोडर का उपयोग करके विश्लेषण चलाने के लिए नीचे दिए गए फील्ड चुनें। माध्यमिक एनकोडर (वैकल्पिक, बाहरी, एनालॉग, निरपेक्ष, आदि) से स्थिति और वेग डेटा का भी उपयोग किया जा सकता है।

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId द्वारा उत्पादित लाभ उन इकाइयों का उपयोग करेंगे जिन्हें रिपोर्ट करने के लिए Spark Max/Flex को कॉन्फ़िगर किया गया है ([`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) और [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>) का उपयोग करके)। डिफ़ॉल्ट रूप से, ये बिना किसी गियरिंग के रोटेशन और RPM हैं। यदि डेटा रिकॉर्ड करते समय उपयोग की जाने वाली इकाइयाँ वांछित इकाइयों से मेल नहीं खाती हैं, तो विश्लेषण के दौरान SysId में स्केलिंग को समायोजित किया जा सकता है।
:::
