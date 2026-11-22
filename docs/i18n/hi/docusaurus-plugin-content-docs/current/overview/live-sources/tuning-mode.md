---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ट्यूनिंग मोड {#tuning-mode}

कुछ लाइव स्रोत न्यूमेरिक और बूलियन मानों की लाइव ट्यूनिंग को सपोर्ट करते हैं। उदाहरण के लिए, NetworkTables स्रोत से कनेक्ट होने पर इस फ़ीचर का उपयोग [कंट्रोलर गेन्स (controller gains) ट्यून करने](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) के लिए किया जा सकता है। ध्यान दें कि आपका रोबोट कोड NetworkTables के ज़रिए गेन्स स्वीकार करने के लिए तैयार होना चाहिए।

डिफ़ॉल्ट रूप से, AdvantageScope में सभी मान रीड-ओनली (read-only) होते हैं। ट्यूनिंग मोड को टॉगल करने के लिए, किसी समर्थित लाइव स्रोत से कनेक्ट होने पर सर्च बार के दाईं ओर **स्लाइडर आइकन पर क्लिक करें**। जब आइकन बैंगनी हो जाता है, तो ट्यूनिंग मोड चालू हो जाता है और फील्ड को एडिट किया जा सकता है।

- किसी **न्यूमेरिक फील्ड** को बदलने के लिए, साइडबार में फील्ड के दाईं ओर मौजूद टेक्स्ट बॉक्स में नया मान दर्ज करें। इनपुट को डीसिलेक्ट करने या "Enter" की दबाने पर मान पब्लिश हो जाता है। रोबोट द्वारा पब्लिश किए गए मान का उपयोग करने के लिए टेक्स्ट बॉक्स को खाली छोड़ दें।
- किसी **बूलियन फील्ड** को टॉगल करने के लिए, साइडबार में फील्ड के दाईं ओर लाल या हरे गोले पर क्लिक करें।
- सभी पब्लिश किए गए मानों को क्लिपबोर्ड पर कॉपी करने के लिए, **स्लाइडर आइकन पर राइट-क्लिक करें** और **"ट्यून किए गए मान कॉपी करें"** चुनें।

:::tip
iPhone और iPad यूज़र्स के लिए, **AdvantageTune** मोबाइल डिवाइस से NetworkTables मान ट्यून करने के लिए AdvantageScope डेवलपर्स द्वारा बनाया गया एक वैकल्पिक विकल्प है।

[<img src="/img/app-store_hi.svg" alt="App Store" />](https://apps.apple.com/in/app/advantagetune/id6811453643?l=hi)
:::

## WPILib ट्यूनेबल्स {#wpilib-tunables}

WPILib में, Tunable API का उपयोग करके संख्याओं और बूलियन जैसे मानों को कॉन्फ़िगर किया जा सकता है, जिससे उन्हें AdvantageScope से रीयल टाइम में एडजस्ट किया जा सके। ट्यूनेबल मान एक बार रजिस्टर किए जाते हैं और रोबोट कोड में समय-समय पर पढ़े जा सकते हैं:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// मानों को समय-समय पर पढ़ें
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// मानों को समय-समय पर पढ़ें
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# मानों को समय-समय पर पढ़ें
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## AdvantageKit के साथ ट्यूनिंग {#tuning-with-advantagekit}

AdvantageKit द्वारा `AdvantageKit` सब-टेबल में पब्लिश किए गए फील्ड केवल आउटपुट होते हैं और इन्हें बदला नहीं जा सकता। हालांकि, आप अपने कोड से ऐसे फील्ड पब्लिश कर सकते हैं जिन्हें AdvantageScope से ट्यून किया जा सके। **NetworkTables पर "/Tuning" टेबल में पब्लिश किया गया कोई भी फील्ड, "NetworkTables (AdvantageKit)" लाइव स्रोत का उपयोग करते समय "Tuning" टेबल के अंतर्गत दिखाई देगा।**

उदाहरण के लिए, [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) क्लास का उपयोग करके एक ट्यून करने योग्य संख्या पब्लिश की जा सकती है:

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` सब-टेबल को **बदला नहीं जा सकता**, क्योंकि AdvantageKit इसका उपयोग लॉगिंग और रीप्ले के लिए नेटवर्क मान रिकॉर्ड करने में करता है। रीयल-टाइम में नेटवर्क इनपुट्स के साथ काम करने के लिए `Tuning` टेबल का उपयोग करें।
:::
