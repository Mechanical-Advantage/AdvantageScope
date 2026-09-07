---
title: 2026 में नया क्या है?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

AdvantageScope का 2026 संस्करण अब उपलब्ध है! विवरण के लिए [स्थापना दस्तावेज़](/overview/installation) और [पूर्ण परिवर्तन लॉग](https://github.com/Mechanical-Advantage/AdvantageScope/releases) देखें। इस रिलीज़ में कई प्रमुख नए फीचर्स और पूरे एप्लिकेशन में कई सुधार शामिल हैं। इस रिलीज़ के कई फीचर्स मौजूदा नियंत्रण प्रणालियों पर अनुभव को बेहतर बनाने के लिए डिज़ाइन किए गए हैं, जबकि भविष्य के सीज़न में [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) में एक सहज संक्रमण की तैयारी भी करते हैं।

**हम आपकी प्रतिक्रिया को महत्व देते हैं! [समस्या पृष्ठ (issues page)](https://github.com/Mechanical-Advantage/AdvantageScope/issues) पर प्रतिक्रिया, फीचर अनुरोध और बग रिपोर्ट का स्वागत है।**

## ✴️ प्रायोगिक: FTC सपोर्ट {#ftc-support}

2027-2028 सीज़न में Systemcore के साथ पूर्ण समर्थन की तैयारी में, यह रिलीज़ मौजूदा FIRST Tech Challenge नियंत्रण प्रणाली के साथ संगतता में सुधार के लिए कई सुविधाएँ जोड़ती है:

- 🗺️ [2D फील्ड](/tab-reference/2d-field) और 👀 [3D फील्ड](/tab-reference/3d-field) पर FTC फील्ड्स और रोबोट मॉडल
- [मानक FTC निर्देशांकों](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) के साथ संगतता के लिए नए [कोऑर्डिनेट सिस्टम](/more-features/coordinate-systems) विकल्प
- [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) लॉग फ़ाइलों के लिए समर्थन
- [FTC डैशबोर्ड](https://github.com/acmerobotics/ftc-dashboard) लाइव स्ट्रीमिंग प्रारूप के लिए समर्थन

:::tip
FTC टीमों को आधिकारिक सीज़न के दौरान प्रायोगिक सॉफ़्टवेयर का उपयोग करते समय सावधानी बरतनी चाहिए। AdvantageScope के लिए FTC समर्थन अभी भी सक्रिय विकास में है।
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

कई तृतीय-पक्ष FTC लॉगिंग/टेलीमेट्री लाइब्रेरी AdvantageScope के साथ संगत अन्य प्रारूपों का समर्थन करती हैं, जैसे कि WPILOG और RLOG। इन पुस्तकालयों का दस्तावेज़ीकरण संबंधित परियोजनाओं में पाया जा सकता है; AdvantageScope डेवलपर्स AdvantageScope के साथ उपयोग के लिए किसी विशेष FTC लॉगिंग समाधान का समर्थन/सिफारिश नहीं करते हैं।

:::info
AdvantageScope को WPILib फ्रेमवर्क और संबद्ध लॉगिंग टूल्स के साथ उपयोग किए जाने पर सर्वोत्तम अनुभव प्रदान करने के लिए डिज़ाइन किया गया है। अनौपचारिक लॉगिंग समाधानों का उपयोग करते समय आपको संगतता समस्याओं या सीमित क्षमताओं का सामना करना पड़ सकता है।

2027-2028 सीज़न के लिए Systemcore में संक्रमण के बाद AdvantageScope के सभी फीचर्स आधिकारिक तौर पर FTC में समर्थित होंगे।
:::

## 🧮 यूनिट-अवेयर ग्राफिंग {#unit-aware-graphing}

📉 [लाइन ग्राफ](/tab-reference/line-graph/) टैब को पूरी तरह से यूनिट-अवेयर होने के लिए फिर से डिज़ाइन किया गया है। यह न्यूमेरिक फील्ड्स को ग्राफ़ करते समय कई नई क्षमताओं को सक्षम करता है:

- Y अक्षों और मान डिस्प्ले का सटीक लेबलिंग
- संगत इकाइयों में त्वरित रूपांतरण (कोई पॉपअप विंडो नहीं)
- एक ही अक्ष के भीतर संगत इकाई प्रकारों का अंतर्निहित रूपांतरण
- [इंटीग्रेटेड और डिफरेंशिएटेड](/tab-reference/line-graph/#integration-and-differentiation) इकाइयों का सटीक प्रदर्शन

नीचे दिया गया स्क्रीनशॉट इन सभी सुविधाओं को क्रियान्वित दिखाता है। ध्यान दें कि बाएं अक्ष में विभिन्न कोणीय वेग इकाइयों वाले फील्ड शामिल हैं, और दाएं अक्ष में वे मान शामिल हैं जो डिफरेंशिएटेड हैं और एक गैर-मूल इकाई (डिग्री) में प्रदर्शित हैं। इकाइयों का चयन करना भी पहले से कहीं अधिक आसान है, जिसमें प्रत्येक अक्ष के लिए सीधे नियंत्रण मेनू में संगत इकाई विकल्प एकीकृत हैं।

_इकाई समर्थन के बारे में अधिक जानकारी [दस्तावेज़](/tab-reference/line-graph/units) में पाई जा सकती है।_

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Unit-aware graphing" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

## 🏁 तेज़ लॉग डाउनलोड {#faster-log-downloads}

[roboRIO से लॉग्स डाउनलोड करना](/overview/log-files/#downloading-from-the-robot) अब पिछली रिलीज़ की तुलना में **2-4 गुना तेज़** है। यह एक नए प्रोटोकॉल (FTP) पर स्विच करके पूरा किया गया है जो roboRIO को कम CPU ओवरहेड के साथ लॉग डेटा स्थानांतरित करने की अनुमति देता है।

नीचे दी गई तालिका ईथरनेट के माध्यम से जुड़े होने पर AdvantageScope के 2025 और 2026 रिलीज़ पर मापी गई स्थानांतरण गति दिखाती है (100 Mb/s की अधिकतम बैंडविड्थ)। ध्यान दें कि 2025 रिलीज़ का प्रदर्शन roboRIO पर CPU लोड से गंभीर रूप से प्रभावित होता है।

|                                                    | 2025 (SFTP) | 2026 (FTP) | Speedup                                          |
| -------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| High CPU load<br /><sub>Complex robot code</sub>   | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| Average CPU load<br /><sub>Normal robot code</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| Minimal CPU load<br /><sub>No robot code</sub>     | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 सबफोल्डर्स से लॉग्स डाउनलोड करें {#download-logs-from-subfolders}

डाउनलोड विंडो अब सबफ़ोल्डर्स में संग्रहीत लॉग्स को सहेजने का समर्थन करती है। लॉग्स के प्रत्येक सबफ़ोल्डर को एक समूह के रूप में डाउनलोड किया जा सकता है, जो CTRE के [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) के 2026 रिलीज़ द्वारा जनरेट किए गए लॉग्स को डाउनलोड करने के लिए एक सुव्यवस्थित दृष्टिकोण प्रदान करता है (जो एकल लॉग फ़ाइल में डेटा संग्रहीत करने में असमर्थ होने के लिए सबफ़ोल्डर्स का उपयोग करता है)।

<img src="/img/whats-new/subfolders.webp" alt="Downloading log subfolders" height="450" />

## 🌈 नए विज़ुअलाइज़ेशन विकल्प {#new-visualization-options}

🗺️ [2D फील्ड](/tab-reference/2d-field) और 👀 [3D फील्ड](/tab-reference/3d-field) पर कई नए विज़ुअलाइज़ेशन विकल्प समर्थित हैं:

- 2D फील्ड पर अब रोबोट बंपर्स के रंगों की एक विस्तृत विविधता उपलब्ध है, और प्रत्येक ऑब्जेक्ट को उसके अपने रंग के साथ कॉन्फ़िगर किया जा सकता है। यह कई रोबोट ऑब्जेक्ट्स के साथ घोस्ट्स को संयोजित करते समय अधिक लचीलापन सक्षम करता है।
- जब [3D फील्ड पर 2D मैकेनिज्म विज़ुअलाइज़ करते हैं](/tab-reference/3d-field/#2d-mechanisms), तो मैकेनिज्म को अब XZ प्लेन के अलावा YZ प्लेन पर भी रखा जा सकता है। यह कई अक्षों में गति के साथ जटिल मैकेनिज्म के आसान विज़ुअलाइज़ेशन को सक्षम बनाता है।
- 3D फील्ड अब रेंडर किए गए किनारों की गुणवत्ता में सुधार के लिए वैकल्पिक एंटीएलियासिंग का समर्थन करता है।

<img src="/img/whats-new/field-viz.jpg" alt="New field visualizations" />

## 🪵 REV Robotics CAN लॉग सपोर्ट {#rev-robotics-can-log-support}

अब आप REV Robotics के [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) द्वारा निर्मित `.revlog` फ़ाइलों को सीधे AdvantageScope में खोल सकते हैं। ये फ़ाइलें Spark Max और Spark Flex उपकरणों से CAN सिग्नल रिकॉर्ड करती हैं, जो AdvantageScope की [URCL](/more-features/urcl) लाइब्रेरी का एक आधिकारिक विकल्प प्रदान करती हैं।

एक सहज संक्रमण सुनिश्चित करने और पिछले सीज़न के साथ फीचर समानता प्रदान करने के लिए 2026 सीज़न के दौरान URCL और आधिकारिक `StatusLogger` दोनों उपलब्ध रहेंगे। 2027 और उसके बाद के लॉगिंग विकल्पों के बारे में साझा करने के लिए हमारे पास बाद में अधिक विवरण होंगे।

<img src="/img/whats-new/revlog.webp" alt="REVLOG visualization" />

## 💿 CSV फ़ाइल इम्पोर्ट {#csv-file-imports}

रोबोट लॉगिंग फ्रेमवर्क के बाहर उत्पादित डेटा के अधिक लचीले विज़ुअलाइज़ेशन के लिए, AdvantageScope में अब CSV फ़ाइलों को इम्पोर्ट करने के लिए बुनियादी समर्थन शामिल है। समर्थित प्रारूपों और अन्य सीमाओं के बारे में अधिक विवरण के लिए [दस्तावेज़](/overview/log-files/#csv-formatting) देखें।

<img src="/img/overview/log-files/export-2.webp" alt="CSV data" />

## 🤩 सौंदर्य संबंधी सुधार {#aesthetic-improvements}

Windows 11 पर AdvantageScope UI को एक ट्रांसलूसेंट साइडबार का समर्थन करने के लिए अपडेट किया गया है, जो पहले केवल macOS रिलीज़ के लिए अनन्य था। Apple के लिक्विड ग्लास मटेरियल पर आधारित macOS Tahoe के लिए एक अपडेटेड ऐप आइकन भी उपलब्ध है।

<img src="/img/whats-new/windows-ui.webp" alt="Windows UI" />

## 📋 सुव्यवस्थित मेनू {#streamlined-menus}

मेनू बार और संबंधित नियंत्रणों को सभी प्लेटफार्मों पर अधिक सुलभ और सुसंगत बनाने के लिए सुव्यवस्थित और पुनर्गठित किया गया है। उल्लेखनीय विशेषताओं में शामिल हैं:

- प्राथमिकताएं विंडो खोले बिना लाइव स्रोतों (उदा. NetworkTables और [Phoenix डायग्नोस्टिक्स](/overview/live-sources/phoenix-diagnostics)) के बीच तेज़ स्विचिंग।
- किसी फील्ड का नाम (या पूर्ण फील्ड कुंजी) तुरंत कॉपी करने के लिए साइडबार पर राइट-क्लिक करें।
- प्राथमिकताएं विंडो का पुनर्गठन, जिससे विकल्पों को जल्दी से खोजना आसान हो जाता है।

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_hi.webp" />
</div>

## 🐛 स्थिरता सुधार {#stability-improvements}

इस रिलीज़ में पूरे एप्लिकेशन में विभिन्न प्रकार के बग फिक्स और स्थिरता सुधार शामिल हैं। पूरी सूची रिलीज़ [चेंजलॉग](https://github.com/Mechanical-Advantage/AdvantageScope/releases) में पाई जा सकती है, लेकिन कुछ उल्लेखनीय सुधार नीचे सूचीबद्ध हैं:

- लंबे समय तक डेटा स्ट्रीम करते समय AdvantageScope के प्रदर्शन में काफी सुधार हुआ है, खासकर जब लाइन ग्राफ टैब का उपयोग किया जाता है।
- AdvantageScope अब असामान्य लॉग डेटा के प्रति अधिक सहिष्णु है, जिसमें बड़ी लॉग फ़ाइलें और बड़े फील्ड मान शामिल हैं।
- लॉग डेटा ब्राउज़ करते समय विभिन्न दृश्य गड़बड़ियों को ठीक किया गया है, खासकर जब लाइन ग्राफ टैब पर फ़िल्टर का उपयोग किया जाता है।
- डाउनलोड विंडो में AdvantageKit लॉग फ़ाइलों के क्रम को ठीक किया गया है; बिना टाइमस्टैम्प वाले लॉग अब अन्य प्रारूपों के समान सूची के नीचे हैं।
- 3D फील्ड टैब पर, रोल अक्ष में गैर-शून्य रोटेशन वाले रोबोट कैमरे अब सही ढंग से विज़ुअलाइज़ किए गए हैं।
- AdvantageScope XR की स्थिरता में सुधार किया गया है, खासकर जब iOS/iPadOS 26 पर चल रहा हो। ऑफ़लाइन इंस्टॉलेशन के लिए, उपलब्ध अपडेट के लिए ऐप स्टोर देखें।
