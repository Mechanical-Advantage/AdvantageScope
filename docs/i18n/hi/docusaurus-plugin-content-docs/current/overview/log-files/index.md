# 📂 लॉग फ़ाइलें {#log-files}

## समर्थित प्रारूप {#supported-formats}

- **WPILOG (.wpilog)** - WPILib की [अंतर्निहित डेटा लॉगिंग](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) और AdvantageKit द्वारा निर्मित। REV मोटर नियंत्रकों से संकेतों को WPILOG फ़ाइल में कैप्चर करने के लिए [URCL](/more-features/urcl) का उपयोग किया जा सकता है।
- **Hoot (.hoot)** - CTRE के Phoenix 6 [सिग्नल लॉगर](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) द्वारा निर्मित।
- **REVLOG (.revlog)** - REV Robotics के [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) द्वारा निर्मित।
- **Road Runner (.log)** - FTC के लिए [Road Runner](https://github.com/acmerobotics/road-runner) लाइब्रेरी द्वारा निर्मित।
- **CSV (.csv)** - अल्पविराम से अलग किए गए मान (Comma separated values), "CSV (टेबल)" या "CSV (लिस्ट)" मोड में AdvantageScope द्वारा [एक्सपोर्ट किए गए](/overview/log-files/export) प्रारूप से मेल खाते हैं। विवरण के लिए [यहाँ](#csv-formatting) देखें।
- **NI Driver Station लॉग्स (.dslog और .dsevents)** - लेगेसी, NI [FRC ड्राइवर स्टेशन](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) (2010-2026) द्वारा निर्मित। AdvantageScope किसी भी लॉग प्रकार को खोलते समय स्वचालित रूप से संबंधित लॉग फ़ाइल की खोज करता है।
- **RLOG (.rlog)** - लेगेसी, AdvantageKit 2022 द्वारा निर्मित।

:::info
Hoot लॉग फ़ाइलें केवल CTRE के [एंड यूज़र लाइसेंस एग्रीमेंट](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) से सहमत होने के बाद ही खोली जा सकती हैं। पहली बार Hoot लॉग फ़ाइल खोलते समय AdvantageScope इन शर्तों के समझौते की पुष्टि करने के लिए एक संकेत प्रदर्शित करता है।
:::

## लॉग खोलना {#opening-logs}

मेनू बार में, `फ़ाइल` > `लॉग खोलें...` पर क्लिक करें, फिर स्थानीय डिस्क से एक या अधिक लॉग फ़ाइलें चुनें। सिस्टम फ़ाइल ब्राउज़र से किसी लॉग फ़ाइल को AdvantageScope आइकन या विंडो पर खींचने से भी वह खुल जाती है।

:::info
यदि एक साथ कई फ़ाइलें खोली जाती हैं, तो टाइमस्टैम्प स्वचालित रूप से संरेखित हो जाएंगे। यह कई स्रोतों से लॉग फ़ाइलों की आसान तुलना को सक्षम बनाता है। टाइमस्टैम्प प्रदर्शन विकल्पों के विवरण के लिए [टाइमस्टैम्प्स](/more-features/timestamps) पृष्ठ देखें।
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Opening a saved log" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## नए लॉग जोड़ना {#adding-new-logs}

लॉग फ़ाइल खोलने के बाद, विज़ुअलाइज़ेशन में आसानी से अतिरिक्त लॉग जोड़े जा सकते हैं। मौजूदा डेटा के साथ सिंक्रनाइज़ करने के लिए टाइमस्टैम्प स्वचालित रूप से फिर से संरेखित किए जाएंगे।

मेनू बार में, `फ़ाइल` > `नए लॉग जोड़ें...` पर क्लिक करें, फिर वर्तमान विज़ुअलाइज़ेशन में जोड़ने के लिए एक या अधिक लॉग फ़ाइलें चुनें। प्रत्येक लॉग के फील्ड्स को `Log0`, `Log1`, आदि नाम की तालिकाओं के तहत रिकॉर्ड किया जाएगा।

## रोबोट से डाउनलोड करना {#downloading-from-the-robot}

<details>
<summary>कॉन्फ़िगरेशन</summary>

`ऐप` > `प्राथमिकताएं दिखाएँ...` (Windows/Linux) या `AdvantageScope` > `सेटिंग्स...` (macOS) पर क्लिक करके प्राथमिकताएं विंडो खोलें। रोबोट का पता और लॉग फ़ोल्डर अपडेट करें।

<img src="/img/prefs_hi.webp" alt="Diagram of preferences" height="450" />
</details>

डाउनलोड विंडो खोलने के लिए `फ़ाइल` > `लॉग्स डाउनलोड करें...` पर क्लिक करें। लॉग डाउनलोडिंग Systemcore और roboRIO पर समर्थित है। रोबोट से कनेक्ट होने के बाद, उपलब्ध लॉग्स शीर्ष पर नवीनतम के साथ दिखाए जाते हैं। डाउनलोड करने के लिए एक या अधिक लॉग फ़ाइलें चुनें (एक सीमा का चयन करने के लिए shift-क्लिक करें या सभी का चयन करने के लिए **cmd/ctrl + A**)। फिर ↓ प्रतीक पर क्लिक करें और एक सेव स्थान चुनें।

:::info
CTRE का [सिग्नल लॉगर](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) एक गैर-मानक प्रारूप का उपयोग करता है जो लॉग्स को सबफ़ोल्डर्स में समूहित करता है। लॉग फ़ाइलों को एक समूह के रूप में डाउनलोड करने के लिए सूची में एक या अधिक फ़ोल्डर चुनें।
:::

:::tip
एकाधिक फ़ाइलें डाउनलोड करते समय, AdvantageScope गंतव्य फ़ोल्डर में पहले से मौजूद किसी भी फ़ाइल को छोड़ देता है।
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Downloading log files" height="350" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## CSV फ़ॉर्मेटिंग {#csv-formatting}

CSV कॉलम के नाम या तो "Timestamp, Key, Value" या "Timestamp, (Key), (Key), etc" होने चाहिए। टाइमस्टैम्प मान सेकंड में हैं। नीचे दी गई सूची सामान्य मान प्रकारों का अपेक्षित प्रारूप दिखाती है। ध्यान दें कि लॉग डेटा को CSV के रूप में एक्सपोर्ट और री-इम्पोर्ट करना _हानिकारक (lossy)_ है, क्योंकि CSV जटिल फील्ड प्रकारों का समर्थन नहीं करता है।

- **बूलियन:** `true` या `false`
- **स्ट्रिंग्स:** `"(value)"`
  - उदाहरण: `"Hello world"`
- **एरेज़:** `[(value); (value); (value)]`
  - उदाहरण: `[1; 2; 3]`
- **बाइट्स:** हेक्साडेसिमल, `-` द्वारा अलग किए गए
  - उदाहरण: `4d-41-36-33-32-38`
