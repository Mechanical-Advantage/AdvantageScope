---
title: 2026 में नया क्या है?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

AdvantageScope का 2026 संस्करण अब उपलब्ध है! विवरण के लिए [इंस्टॉलेशन दस्तावेज़](/overview/installation) और [पूरा चेंजलॉग](https://github.com/Mechanical-Advantage/AdvantageScope/releases) देखें। यह रिलीज़ कई प्रमुख नए फीचर्स और पूरे ऐप में ढेरों सुधार लेकर आई है। इस रिलीज़ के कई फीचर्स मौजूदा कंट्रोल सिस्टम पर अनुभव बेहतर बनाने के लिए बनाए गए हैं, और साथ ही आने वाले सीज़न में [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) पर सहज शिफ्ट की तैयारी भी करते हैं।

**हम आपकी राय को महत्व देते हैं! [समस्या पृष्ठ (issues page)](https://github.com/Mechanical-Advantage/AdvantageScope/issues) पर फ़ीडबैक, फीचर अनुरोध और बग रिपोर्ट का स्वागत है।**

## ✴️ प्रायोगिक: FTC सपोर्ट {#ftc-support}

2027-2028 सीज़न में Systemcore के साथ पूर्ण सपोर्ट की तैयारी में, यह रिलीज़ मौजूदा FIRST Tech Challenge कंट्रोल सिस्टम के साथ कम्पैटिबिलिटी बेहतर करने के लिए कई फीचर्स जोड़ती है:

- 🗺️ [2D फील्ड](/tab-reference/2d-field) और 👀 [3D फील्ड](/tab-reference/3d-field) पर FTC फील्ड्स और रोबोट मॉडल
- [मानक FTC कोऑर्डिनेट्स](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) के साथ कम्पैटिबिलिटी के लिए नए [कोऑर्डिनेट सिस्टम](/more-features/coordinate-systems) विकल्प
- [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) लॉग फ़ाइलों के लिए सपोर्ट
- [FTC डैशबोर्ड](https://github.com/acmerobotics/ftc-dashboard) लाइव स्ट्रीमिंग फ़ॉर्मेट के लिए सपोर्ट

:::tip
FTC टीमों को आधिकारिक सीज़न के दौरान प्रायोगिक सॉफ़्टवेयर का उपयोग करते समय सावधानी बरतनी चाहिए। AdvantageScope के लिए FTC सपोर्ट अभी सक्रिय विकास में है।
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

कई थर्ड-पार्टी FTC लॉगिंग/टेलीमेट्री लाइब्रेरी AdvantageScope के साथ कम्पैटिबल अन्य फ़ॉर्मेट सपोर्ट करती हैं, जैसे कि WPILOG और RLOG। इन लाइब्रेरी का दस्तावेज़ संबंधित प्रोजेक्ट्स में मिल सकता है; AdvantageScope डेवलपर्स AdvantageScope के साथ उपयोग के लिए किसी विशेष FTC लॉगिंग समाधान की सिफारिश नहीं करते हैं।

:::info
AdvantageScope को WPILib फ्रेमवर्क और उससे जुड़े लॉगिंग टूल्स के साथ सर्वोत्तम अनुभव देने के लिए डिज़ाइन किया गया है। अनौपचारिक लॉगिंग समाधानों का उपयोग करते समय आपको कम्पैटिबिलिटी की समस्याएँ या सीमित क्षमताएँ देखने को मिल सकती हैं।

2027-2028 सीज़न में Systemcore पर शिफ्ट होने के बाद AdvantageScope के सभी फीचर्स आधिकारिक तौर पर FTC में समर्थित होंगे।
:::

## 🧮 यूनिट-अवेयर ग्राफिंग {#unit-aware-graphing}

📉 [लाइन ग्राफ](/tab-reference/line-graph/) टैब को पूरी तरह से यूनिट-अवेयर बनाने के लिए फिर से डिज़ाइन किया गया है। इससे न्यूमेरिक फील्ड्स को ग्राफ़ करते समय कई नई सुविधाएँ मिलती हैं:

- Y अक्षों और मान डिस्प्ले की सटीक लेबलिंग
- कम्पैटिबल इकाइयों में तुरंत रूपांतरण (बिना किसी पॉपअप विंडो के)
- एक ही अक्ष के भीतर कम्पैटिबल इकाई प्रकारों का स्वचालित रूपांतरण
- [इंटीग्रेटेड और डिफरेंशिएटेड](/tab-reference/line-graph/#integration-and-differentiation) इकाइयों का सटीक प्रदर्शन

नीचे दिया गया स्क्रीनशॉट इन सभी फीचर्स को काम करते हुए दिखाता है। ध्यान दें कि बाएं अक्ष में अलग-अलग कोणीय वेग इकाइयों वाले फील्ड हैं, और दाएं अक्ष में ऐसे मान हैं जो डिफरेंशिएटेड हैं और एक गैर-मूल इकाई (डिग्री) में दिख रहे हैं। इकाइयों को चुनना भी पहले से कहीं आसान है, क्योंकि प्रत्येक अक्ष के कंट्रोल मेनू में सीधे कम्पैटिबल इकाई विकल्प मौजूद हैं।

_इकाई सपोर्ट के बारे में अधिक जानकारी [दस्तावेज़](/tab-reference/line-graph/units) में मिल सकती है।_

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Unit-aware graphing" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## 🏁 तेज़ लॉग डाउनलोड {#faster-log-downloads}

[roboRIO से लॉग्स डाउनलोड करना](/overview/log-files/#downloading-from-the-robot) अब पिछली रिलीज़ की तुलना में **2-4 गुना तेज़** है। यह नए प्रोटोकॉल (FTP) पर स्विच करने से संभव हुआ है, जिससे roboRIO कम CPU लोड के साथ लॉग डेटा ट्रांसफर कर पाता है।

नीचे दी गई तालिका ईथरनेट से कनेक्ट होने पर AdvantageScope की 2025 और 2026 रिलीज़ पर मापी गई ट्रांसफर स्पीड दिखाती है (100 Mb/s की अधिकतम बैंडविड्थ)। ध्यान दें कि 2025 रिलीज़ का प्रदर्शन roboRIO पर CPU लोड से काफी प्रभावित होता है।

|                                                    | 2025 (SFTP) | 2026 (FTP) | गति में वृद्धि (Speedup)                         |
| -------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| उच्च CPU लोड<br /><sub>जटिल रोबोट कोड</sub>       | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| औसत CPU लोड<br /><sub>सामान्य रोबोट कोड</sub>     | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| न्यूनतम CPU लोड<br /><sub>कोई रोबोट कोड नहीं</sub> | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 सबफोल्डर्स से लॉग्स डाउनलोड करें {#download-logs-from-subfolders}

डाउनलोड विंडो अब सबफ़ोल्डर्स में सेव किए गए लॉग्स को सहेजने का सपोर्ट करती है। लॉग्स के प्रत्येक सबफ़ोल्डर को एक ग्रुप के रूप में डाउनलोड किया जा सकता है, जिससे CTRE के [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) की 2026 रिलीज़ से बने लॉग्स डाउनलोड करना आसान हो जाता है (जो एकल लॉग फ़ाइल में डेटा सेव न कर पाने की वजह से सबफ़ोल्डर्स का उपयोग करता है)।

<img src="/img/whats-new/subfolders.webp" alt="Downloading log subfolders" height="450" />

## 🌈 नए विज़ुअलाइज़ेशन विकल्प {#new-visualization-options}

🗺️ [2D फील्ड](/tab-reference/2d-field) और 👀 [3D फील्ड](/tab-reference/3d-field) पर कई नए विज़ुअलाइज़ेशन विकल्प उपलब्ध हैं:

- 2D फील्ड पर अब रोबोट बंपर्स के रंगों के कई नए विकल्प उपलब्ध हैं, और प्रत्येक ऑब्जेक्ट के लिए अलग रंग चुना जा सकता है। इससे कई रोबोट ऑब्जेक्ट्स के साथ घोस्ट्स का उपयोग करते समय अधिक लचीलापन मिलता है।
- [3D फील्ड पर 2D मैकेनिज्म विज़ुअलाइज़ करते समय](/tab-reference/3d-field/#2d-mechanisms), मैकेनिज्म को अब XZ प्लेन के साथ-साथ YZ प्लेन पर भी रखा जा सकता है। इससे कई अक्षों में चलने वाले जटिल मैकेनिज्म को विज़ुअलाइज़ करना आसान हो जाता है।
- 3D फील्ड में अब रेंडर किए गए किनारों की गुणवत्ता बेहतर बनाने के लिए वैकल्पिक एंटीएलियासिंग का सपोर्ट है।

<img src="/img/whats-new/field-viz.jpg" alt="New field visualizations" />

## 🪵 REV Robotics CAN लॉग सपोर्ट {#rev-robotics-can-log-support}

अब आप REV Robotics के [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) से बनी `.revlog` फ़ाइलों को सीधे AdvantageScope में खोल सकते हैं। ये फ़ाइलें Spark Max और Spark Flex डिवाइस से CAN सिग्नल रिकॉर्ड करती हैं, और AdvantageScope की [URCL](/more-features/urcl) लाइब्रेरी का एक आधिकारिक विकल्प देती हैं।

सुचारु बदलाव और पिछले सीज़न जैसे फीचर्स बनाए रखने के लिए 2026 सीज़न के दौरान URCL और आधिकारिक `StatusLogger` दोनों उपलब्ध रहेंगे। 2027 और उसके बाद के लॉगिंग विकल्पों की जानकारी हम बाद में साझा करेंगे।

<img src="/img/whats-new/revlog.webp" alt="REVLOG visualization" />

## 💿 CSV फ़ाइल इम्पोर्ट {#csv-file-imports}

रोबोट लॉगिंग फ्रेमवर्क के बाहर बने डेटा के लचीले विज़ुअलाइज़ेशन के लिए, AdvantageScope में अब CSV फ़ाइलों को इम्पोर्ट करने का बुनियादी सपोर्ट शामिल है। समर्थित फ़ॉर्मेट और अन्य सीमाओं की पूरी जानकारी के लिए [दस्तावेज़](/overview/log-files/#csv-formatting) देखें।

<img src="/img/overview/log-files/export-2.webp" alt="CSV data" />

## 🤩 UI और डिज़ाइन में सुधार {#aesthetic-improvements}

Windows 11 पर AdvantageScope UI को ट्रांसलूसेंट साइडबार के लिए अपडेट किया गया है, जो पहले केवल macOS रिलीज़ तक सीमित था। Apple के लिक्विड ग्लास मटेरियल पर आधारित macOS Tahoe के लिए एक नया ऐप आइकन भी उपलब्ध है।

<img src="/img/whats-new/windows-ui.webp" alt="Windows UI" />

## 📋 सुव्यवस्थित मेनू {#streamlined-menus}

सभी प्लेटफ़ॉर्म पर कंट्रोल्स को अधिक सुलभ और एक जैसा बनाने के लिए मेनू बार और संबंधित कंट्रोल्स को सरल और पुनर्गठित किया गया है। मुख्य फीचर्स में शामिल हैं:

- प्राथमिकताएं विंडो खोले बिना लाइव स्रोतों (जैसे NetworkTables और [Phoenix डायग्नोस्टिक्स](/overview/live-sources/phoenix-diagnostics)) के बीच तेज़ी से स्विच करना।
- किसी फील्ड का नाम (या पूरी फील्ड कुंजी) तुरंत कॉपी करने के लिए साइडबार पर राइट-क्लिक करना।
- प्राथमिकताएं विंडो का पुनर्गठन, जिससे विकल्पों को जल्दी खोजना आसान हो गया है।

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_hi.webp" />
</div>

## 🐛 स्थिरता में सुधार {#stability-improvements}

इस रिलीज़ में पूरे एप्लिकेशन में कई बग फिक्स और स्थिरता सुधार शामिल हैं। पूरी सूची रिलीज़ [चेंजलॉग](https://github.com/Mechanical-Advantage/AdvantageScope/releases) में मिल सकती है, लेकिन कुछ प्रमुख सुधार नीचे दिए गए हैं:

- लंबे समय तक डेटा स्ट्रीम करते समय AdvantageScope के प्रदर्शन में काफी सुधार हुआ है, खासकर लाइन ग्राफ टैब का उपयोग करते समय।
- AdvantageScope अब बड़ी लॉग फ़ाइलों और बड़े फील्ड मानों सहित असामान्य लॉग डेटा के लिए अधिक टिकाऊ है।
- लॉग डेटा ब्राउज़ करते समय आने वाली विभिन्न विज़ुअल गड़बड़ियों को ठीक किया गया है, खासकर लाइन ग्राफ टैब पर फ़िल्टर का उपयोग करते समय।
- डाउनलोड विंडो में AdvantageKit लॉग फ़ाइलों का क्रम ठीक किया गया है; बिना टाइमस्टैम्प वाले लॉग अब अन्य फ़ॉर्मेट की तरह सूची में सबसे नीचे दिखते हैं।
- 3D फील्ड टैब पर, रोल अक्ष में शून्य से अलग (non-zero) रोटेशन वाले रोबोट कैमरे अब सही ढंग से विज़ुअलाइज़ होते हैं।
- AdvantageScope XR की स्थिरता में सुधार किया गया है, खासकर iOS/iPadOS 26 पर। ऑफ़लाइन इंस्टॉलेशन के लिए, उपलब्ध अपडेट के लिए ऐप स्टोर देखें।
