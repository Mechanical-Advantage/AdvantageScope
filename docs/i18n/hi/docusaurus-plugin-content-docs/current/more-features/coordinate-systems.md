---
sidebar_position: 4
---

# 📐 कोऑर्डिनेट सिस्टम {#coordinate-systems}

AdvantageScope [🗺️ 2D फील्ड](/tab-reference/2d-field) और [👀 3D फील्ड](/tab-reference/3d-field) टैब पर कई सामान्य समन्वय प्रणालियों (कोऑर्डिनेट सिस्टम्स) का समर्थन करता है। AdvantageScope द्वारा उपयोग किए जाने वाले अक्ष और घूर्णन सम्मेलनों के बारे में अधिक जानकारी के लिए कृपया [WPILib समन्वय प्रणाली दस्तावेज़](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) देखें।

### अनुकूलन {#customization}

डिफ़ॉल्ट रूप से, चुनी गई फील्ड छवि/मॉडल के आधार पर कोऑर्डिनेट सिस्टम स्वचालित रूप से चुना जाता है। सभी फील्ड पर उपयोग के लिए एक अलग कोऑर्डिनेट सिस्टम का चयन करने के लिए, `ऐप` > `प्राथमिकताएं दिखाएँ...` (Windows/Linux) या `AdvantageScope` > `सेटिंग्स...` (macOS) पर क्लिक करके प्राथमिकताएं विंडो खोलें और "कोऑर्डिनेट सिस्टम" विकल्प को बदलें।

:::tip
सभी कोऑर्डिनेट सिस्टम विकल्प FRC और FTC दोनों फील्ड के साथ संगत हैं।
:::

## सेंटर/रेड (Systemcore) {#center-red}

मूल (origin) मैदान के केंद्र में है, जिसमें +X अक्ष रेड एलायंस वॉल से दूर की ओर है, जैसा कि नीचे दिखाया गया है। **यह 2027 से शुरू होने वाले FRC फील्ड्स और 2027-2028 से शुरू होने वाले FTC फील्ड्स के लिए डिफ़ॉल्ट कोऑर्डिनेट सिस्टम है।**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Center/red coordinate system" />

## ब्लू वॉल {#blue-wall}

मूल (origin) ब्लू एलायंस वॉल के सबसे दाहिने कोने में है, जिसमें +X अक्ष रेड एलायंस वॉल की ओर है, जैसा कि नीचे दिखाया गया है। **यह 2023 से 2026 तक के FRC फील्ड्स के लिए डिफ़ॉल्ट कोऑर्डिनेट सिस्टम है।**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Blue wall coordinate system" />

## एलायंस वॉल {#alliance-wall}

मूल (origin) _रोबोट के वर्तमान एलायंस_ के लिए एलायंस वॉल के सबसे दाहिने कोने में है, जिसमें +X अक्ष विपरीत एलायंस वॉल की ओर है, जैसा कि नीचे दिखाया गया है। **यह 2022 में FRC के लिए डिफ़ॉल्ट कोऑर्डिनेट सिस्टम है।**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Alliance wall coordinate system" />

## सेंटर/रोटेटेड {#center-rotated}

मूल (origin) मैदान के केंद्र में है, जिसमें +X अक्ष रेड एलायंस वॉल के दृष्टिकोण से दाईं ओर है, जैसा कि नीचे दिखाया गया है। **यह 2024-2025 से 2026-2027 तक के FTC फील्ड्स के लिए डिफ़ॉल्ट कोऑर्डिनेट सिस्टम है।**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Center/rotated coordinate system" height="400" />
