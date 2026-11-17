---
sidebar_position: 1
---

# 📦 इंस्टॉलेशन {#installation}

AdvantageScope का आधिकारिक रूप से समर्थित संस्करण सीधे Team 6328 से या WPILib इंस्टॉलर के ज़रिए उपलब्ध है। इसके कई अनौपचारिक वर्ज़न (unofficial distributions) भी उपलब्ध हैं।

## Team 6328 {#team-6328}

### डाउनलोड: [स्थिर (Stable)](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [प्री-रिलीज़ (Prerelease)](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Team 6328 से सीधे AdvantageScope डाउनलोड करने पर आपको ये फायदे मिलते हैं:

- अन्य माध्यमों पर आने से पहले ही नवीनतम फीचर्स और बग फिक्स।
- डाउनलोड के लिए नया संस्करण उपलब्ध होने पर इन-ऐप अलर्ट।
- 👀 [3D फील्ड](/tab-reference/3d-field) टैब पर उपयोग के लिए हाल के 6328 रोबोट मॉडल्स का बिल्ट-इन कलेक्शन।

:::note
Ubuntu 23.10 या उसके बाद के संस्करणों पर AppImage बिल्ड चलाने से पहले, आपको रिलीज़ पेज से AppArmor प्रोफ़ाइल डाउनलोड करके उसे `/etc/apparmor.d` में कॉपी करना होगा।
:::

:::info
AdvantageScope का प्रत्येक प्रमुख संस्करण FRC किकऑफ़ से पहले जनवरी में जारी किया जाता है, जिसका वर्ज़न नंबर उस वर्ष के अनुसार होता है (जैसे v26.0.0 जनवरी 2026 में जारी हुआ था)। हर रिलीज़ से पहले के महीनों में AdvantageScope के बीटा और अल्फा संस्करण उन टीमों के लिए उपलब्ध हो सकते हैं जो नए फीचर्स आज़माना और फ़ीडबैक देना चाहती हैं। **इन प्री-रिलीज़ संस्करणों का उपयोग करने वाली टीमों को ऐसी समस्याओं और बग्स की उम्मीद रखनी चाहिए जो स्थिर रिलीज़ में नहीं होते हैं।**
:::

## WPILib {#wpilib}

### इंस्टॉलेशन: [WPILib दस्तावेज़](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

WPILib इंस्टॉलर में AdvantageScope की हालिया रिलीज़ शामिल होती है, लेकिन यह सीधे डाउनलोड के लिए उपलब्ध नवीनतम संस्करण से थोड़ा पीछे हो सकती है। VSCode के WPILib संस्करण से AdvantageScope लॉन्च करने का तरीका [यहाँ](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html) देखा जा सकता है।

## अनौपचारिक वितरण {#unofficial-distributions}

AdvantageScope के अनौपचारिक वितरण कई स्रोतों से उपलब्ध हैं, जो AdvantageScope/WPILib डेवलपर्स द्वारा आधिकारिक तौर पर समर्थित नहीं हैं। ये आधिकारिक स्रोतों पर उपलब्ध AdvantageScope के नवीनतम संस्करण से पीछे हो सकते हैं। किसी भी समस्या के मामले में कृपया सीधे इनके मेंटेनर्स से संपर्क करें।

- [**REV कंट्रोल सिस्टम के लिए AdvantageScope लाइट:**](https://github.com/j5155/AdvantageScope-Lite-FTC) मौजूदा (pre-Systemcore) FTC कंट्रोल सिस्टम पर उपयोग के लिए [AdvantageScope लाइट](/more-features/advantagescope-lite) का एक संशोधित संस्करण।
- [**Homebrew इंस्टॉलर:**](https://formulae.brew.sh/cask/advantagescope) macOS पर कमांड लाइन से AdvantageScope इंस्टॉल करने के लिए एक Homebrew cask।
- [**Arch User Repository:**](https://aur.archlinux.org/packages/advantagescope) pacman पैकेज मैनेजर के साथ उपयोग के लिए एक वैकल्पिक वितरण तरीका (AdvantageScope का आधिकारिक Arch वितरण [यहाँ](#6328-downloads) उपलब्ध है)।
