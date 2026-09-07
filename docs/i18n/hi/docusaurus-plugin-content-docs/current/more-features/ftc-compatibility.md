---
sidebar_position: 1
---

# ✴️ FTC संगतता {#ftc-compatibility}

AdvantageScope में मौजूदा FIRST Tech Challenge नियंत्रण प्रणाली पर एक सहज अनुभव प्रदान करने के लिए सुविधाएँ शामिल हैं, जबकि भविष्य के सीज़न में [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) में संक्रमण की स्थापना भी की गई है। 2027-2028 सीज़न से शुरू होने वाले Systemcore में संक्रमण के बाद AdvantageScope के सभी फीचर्स आधिकारिक तौर पर FTC में समर्थित होंगे।

## फील्ड्स और रोबोट्स {#fields-and-robots}

FTC फील्ड्स और रोबोट मॉडल मूल रूप से पूरी तरह से समर्थित हैं।

- **फील्ड और रोबोट मॉडल:** 🗺️ [2D फील्ड](/tab-reference/2d-field) और 👀 [3D फील्ड](/tab-reference/3d-field) टैब पर सीधे ड्रॉपडाउन मेनू से FTC फील्ड और रोबोट मॉडल चुनें। सभी फील्ड [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) के साथ संगत हैं।
- **कोऑर्डिनेट सिस्टम:** किसी भी फील्ड पर [मानक FTC निर्देशांकों](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) के साथ संगतता के लिए [कोऑर्डिनेट सिस्टम](/more-features/coordinate-systems) कॉन्फ़िगर करें। यह कोऑर्डिनेट सिस्टम FTC फील्ड्स पर डिफ़ॉल्ट रूप से उपयोग किया जाता है।

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## समर्थित प्रारूप {#supported-formats}

AdvantageScope में WPILOG और NetworkTables जैसे WPILib-संगत प्रारूपों के अलावा **FTC डैशबोर्ड** लाइव स्ट्रीमिंग प्रारूप और **Road Runner** `.log` फ़ाइलों के लिए मूल समर्थन शामिल है।

कई तृतीय-पक्ष FTC लॉगिंग और टेलीमेट्री लाइब्रेरी AdvantageScope के साथ संगत स्वरूपों में डेटा उत्पन्न करती हैं। AdvantageScope डेवलपर्स किसी विशेष FTC लॉगिंग समाधान का समर्थन या अनुशंसा नहीं करते हैं, और कुछ लॉगिंग समाधानों का उपयोग करते समय आपको सीमित क्षमताओं का सामना करना पड़ सकता है।

नीचे दी गई सूची एक शुरुआती बिंदु प्रदान करती है लेकिन विस्तृत नहीं है:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): पथ योजना (path planning) तर्क को डिबग करने के लिए लॉग फ़ाइलें उत्पन्न करता है।
- [**FTC डैशबोर्ड**](https://acmerobotics.github.io/ftc-dashboard/): लाइव टेलीमेट्री स्ट्रीम करता है जो अपने स्वयं के डैशबोर्ड और AdvantageScope दोनों के साथ संगत है।
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): लॉग फ़ाइलों और लाइव स्ट्रीमिंग सहित कई प्रारूपों में कस्टम डेटा लॉगिंग को सक्षम बनाता है।
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): एनोटेशन का उपयोग करके WPILOG प्रारूप में डेटा सहेजता है।
- **PsiKit**: AdvantageKit से प्रेरित FTC के लिए एक लॉगिंग और रीप्ले फ्रेमवर्क।

:::warning
प्रतियोगिता में टीमों को R704 का अनुपालन करने का ध्यान रखना चाहिए। प्रतियोगिताओं में वाई-फाई पर कनेक्ट होने पर FTC डैशबोर्ड जैसी तृतीय-पक्ष टेलीमेट्री सेवाएँ निषिद्ध हैं।
:::

### FTC के लिए AdvantageScope लाइट {#advantagescope-lite-for-ftc}

FTC के लिए अनुकूलित [AdvantageScope लाइट](/more-features/advantagescope-lite) का एक अनौपचारिक वितरण उपलब्ध है: [**REV कंट्रोल सिस्टम के लिए AdvantageScope लाइट**](https://github.com/j5155/AdvantageScope-Lite-FTC)। यह वितरण अनौपचारिक है और AdvantageScope डेवलपर्स द्वारा समर्थित नहीं है।

जबकि मानक [AdvantageScope लाइट](/more-features/advantagescope-lite) Systemcore और FIRST ड्राइवर स्टेशन पर उपयोग के लिए डिज़ाइन किया गया एक वेब ऐप है, अनौपचारिक FTC वितरण को विशेष रूप से मौजूदा FTC नियंत्रण प्रणाली पर सीधे उपयोग के लिए संशोधित किया गया है। यह अतिरिक्त सॉफ़्टवेयर की आवश्यकता के बिना FTC डैशबोर्ड प्रोटोकॉल पर लाइव डेटा देखने का मूल रूप से समर्थन करता है।
