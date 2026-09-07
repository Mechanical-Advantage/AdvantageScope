---
sidebar_position: 1
---

# 📦 स्थापना {#installation}

AdvantageScope का आधिकारिक रूप से समर्थित संस्करण सीधे Team 6328 से या WPILib इंस्टॉलर के माध्यम से उपलब्ध है। कई अनौपचारिक वितरण भी उपलब्ध हैं।

## Team 6328 {#team-6328}

### डाउनलोड: [स्थिर (Stable)](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [प्री-रिलीज़ (Prerelease)](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Team 6328 से सीधे AdvantageScope डाउनलोड करने पर मिलता है:

- अन्य चैनलों के माध्यम से उपलब्ध होने से पहले नवीनतम फीचर्स और बग फिक्स।
- डाउनलोड के लिए नया संस्करण उपलब्ध होने पर इन-ऐप अलर्ट।
- 👀 [3D फील्ड](/tab-reference/3d-field) टैब पर उपयोग के लिए हाल के 6328 रोबोट मॉडलों का एक अंतर्निहित संग्रह।

:::note
Ubuntu 23.10 या उसके बाद के संस्करणों पर AppImage बिल्ड चलाने से पहले, आपको रिलीज़ पेज से AppArmor प्रोफ़ाइल डाउनलोड करनी होगी और इसे /etc/apparmor.d में कॉपी करना होगा।
:::

:::info
AdvantageScope का प्रत्येक प्रमुख संस्करण FRC किकऑफ़ से पहले जनवरी में जारी किया जाता है, जिसका संस्करण नंबर वर्ष के अनुरूप होता है (उदा. v26.0.0 जनवरी 2026 में जारी किया गया था)। AdvantageScope के बीटा और अल्फा संस्करण प्रत्येक रिलीज़ से पहले के महीनों में उन टीमों के लिए उपलब्ध हो सकते हैं जो नई सुविधाओं के साथ प्रयोग करना चाहती हैं और प्रतिक्रिया प्रदान करना चाहती हैं। **इन प्री-रिलीज़ संस्करणों का उपयोग करने वाली टीमों को ऐसी समस्याओं और बग्स को देखने की उम्मीद करनी चाहिए जो स्थिर रिलीज़ में मौजूद नहीं हैं।**
:::

## WPILib {#wpilib}

### स्थापना: [WPILib दस्तावेज़](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

WPILib इंस्टॉलर में AdvantageScope की हाल की रिलीज़ शामिल है, लेकिन यह सीधे डाउनलोड के लिए उपलब्ध नवीनतम संस्करण से पीछे हो सकती है। VSCode के WPILib संस्करण से AdvantageScope लॉन्च करने का दस्तावेज़ीकरण [यहाँ](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html) पाया जा सकता है।

## अनौपचारिक वितरण {#unofficial-distributions}

AdvantageScope के अनौपचारिक वितरण कई स्रोतों से उपलब्ध हैं, जो AdvantageScope/WPILib डेवलपर्स द्वारा आधिकारिक तौर पर समर्थित नहीं हैं। ये वितरण आधिकारिक स्रोतों से उपलब्ध AdvantageScope के नवीनतम संस्करण से पीछे रह सकते हैं। समस्याओं के मामले में कृपया सीधे मेंटेनर्स से संपर्क करें।

- [**REV कंट्रोल सिस्टम के लिए AdvantageScope लाइट:**](https://github.com/j5155/AdvantageScope-Lite-FTC) मौजूदा (pre-Systemcore) FTC नियंत्रण प्रणाली पर उपयोग के लिए [AdvantageScope लाइट](/more-features/advantagescope-lite) का एक संशोधन।
- [**Homebrew इंस्टॉलर:**](https://formulae.brew.sh/cask/advantagescope) macOS पर कमांड लाइन से AdvantageScope स्थापित करने के लिए एक Homebrew cask।
- [**Arch User Repository:**](https://aur.archlinux.org/packages/advantagescope) pacman पैकेज मैनेजर के साथ उपयोग के लिए एक वैकल्पिक वितरण विधि (AdvantageScope का एक आधिकारिक Arch वितरण [यहाँ](#6328-downloads) उपलब्ध है)।
