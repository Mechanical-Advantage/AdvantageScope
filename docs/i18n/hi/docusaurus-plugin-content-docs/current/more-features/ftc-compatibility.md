---
sidebar_position: 1
---

# ✴️ FTC संगतता {#ftc-compatibility}

AdvantageScope में मौजूदा FIRST Tech Challenge नियंत्रण प्रणाली (control system) पर सहज अनुभव देने के लिए कई फीचर्स शामिल हैं, और साथ ही भविष्य के सीज़न में [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) पर शिफ्ट होने की तैयारी भी की गई है। 2027-2028 सीज़न से Systemcore पर ट्रांज़िशन के बाद AdvantageScope के सभी फीचर्स आधिकारिक रूप से FTC में सपोर्ट किए जाएँगे।

## फील्ड्स और रोबोट्स {#fields-and-robots}

FTC फील्ड्स और रोबोट मॉडल नेटिव रूप से पूरी तरह समर्थित हैं।

- **फील्ड और रोबोट मॉडल:** 🗺️ [2D फील्ड](/tab-reference/2d-field) और 👀 [3D फील्ड](/tab-reference/3d-field) टैब पर सीधे ड्रॉपडाउन मेनू से FTC फील्ड और रोबोट मॉडल चुनें। सभी फील्ड्स [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) के साथ काम करते हैं।
- **कोऑर्डिनेट सिस्टम:** किसी भी फील्ड पर [मानक FTC निर्देशांकों](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) के अनुरूप काम करने के लिए [कोऑर्डिनेट सिस्टम](/more-features/coordinate-systems) कॉन्फ़िगर करें। FTC फील्ड्स पर यह कोऑर्डिनेट सिस्टम डिफ़ॉल्ट रूप से उपयोग होता है।

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## समर्थित फ़ॉर्मेट्स {#supported-formats}

AdvantageScope में WPILOG और NetworkTables जैसे WPILib-संगत फ़ॉर्मेट्स के अलावा **FTC डैशबोर्ड** लाइव स्ट्रीमिंग फ़ॉर्मेट और **Road Runner** `.log` फ़ाइलों के लिए भी नेटिव सपोर्ट शामिल है।

कई थर्ड-पार्टी FTC लॉगिंग और टेलीमेट्री लाइब्रेरीज़ AdvantageScope के साथ काम करने वाले फ़ॉर्मेट्स में डेटा जेनरेट करती हैं। AdvantageScope के डेवलपर्स किसी विशेष FTC लॉगिंग समाधान का समर्थन या अनुशंसा नहीं करते हैं, और कुछ लॉगिंग समाधानों का उपयोग करते समय आपको सीमित क्षमताएँ मिल सकती हैं।

नीचे दी गई सूची एक शुरुआती जानकारी देती है, हालाँकि यह पूरी सूची नहीं है:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): पाथ प्लानिंग लॉजिक को डिबग करने के लिए लॉग फ़ाइलें जेनरेट करता है।
- [**FTC डैशबोर्ड**](https://acmerobotics.github.io/ftc-dashboard/): लाइव टेलीमेट्री स्ट्रीम करता है जो इसके अपने डैशबोर्ड और AdvantageScope दोनों के साथ काम करती है।
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): लॉग फ़ाइलों और लाइव स्ट्रीमिंग सहित कई फ़ॉर्मेट्स में कस्टम डेटा लॉगिंग की सुविधा देता है।
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): एनोटेशन का उपयोग करके WPILOG फ़ॉर्मेट में डेटा सेव करता है।
- **PsiKit**: AdvantageKit से प्रेरित, FTC के लिए एक लॉगिंग और रीप्ले फ्रेमवर्क।

:::warning
प्रतियोगिताओं में टीमों को R704 नियम का पालन करने का ध्यान रखना चाहिए। प्रतियोगिताओं के दौरान वाई-फाई से कनेक्ट होने पर FTC डैशबोर्ड जैसी थर्ड-पार्टी टेलीमेट्री सेवाएँ प्रतिबंधित हैं।
:::

### FTC के लिए AdvantageScope लाइट {#advantagescope-lite-for-ftc}

FTC के लिए ऑप्टिमाइज़ किया गया [AdvantageScope लाइट](/more-features/advantagescope-lite) का एक अनऑफिशियल डिस्ट्रीब्यूशन उपलब्ध है: [**REV कंट्रोल सिस्टम के लिए AdvantageScope लाइट**](https://github.com/j5155/AdvantageScope-Lite-FTC)। यह डिस्ट्रीब्यूशन अनऑफिशियल है और AdvantageScope के डेवलपर्स द्वारा समर्थित नहीं है।

जहाँ मानक [AdvantageScope लाइट](/more-features/advantagescope-lite) Systemcore और FIRST ड्राइवर स्टेशन पर उपयोग के लिए डिज़ाइन किया गया एक वेब ऐप है, वहीं इस अनऑफिशियल FTC डिस्ट्रीब्यूशन को खास तौर पर मौजूदा FTC कंट्रोल सिस्टम पर सीधे चलने के लिए मॉडिफाई किया गया है। यह बिना किसी अतिरिक्त सॉफ़्टवेयर के FTC डैशबोर्ड प्रोटोकॉल पर लाइव डेटा देखने को नेटिव रूप से सपोर्ट करता है।
