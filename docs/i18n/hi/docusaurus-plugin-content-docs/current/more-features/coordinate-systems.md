---
sidebar_position: 4
---

# 📐 कोऑर्डिनेट सिस्टम {#coordinate-systems}

AdvantageScope [🗺️ 2D फील्ड](/tab-reference/2d-field) और [👀 3D फील्ड](/tab-reference/3d-field) टैब पर कई प्रचलित कोऑर्डिनेट सिस्टम्स को सपोर्ट करता है। AdvantageScope द्वारा उपयोग किए जाने वाले ऐक्सिस और रोटेशन कन्वेंशन्स के बारे में अधिक जानकारी के लिए कृपया [WPILib कोऑर्डिनेट सिस्टम डॉक्यूमेंटेशन](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) देखें।

### कस्टमाइज़ेशन {#customization}

डिफ़ॉल्ट रूप से, चुनी गई फील्ड इमेज या मॉडल के आधार पर कोऑर्डिनेट सिस्टम अपने आप चुन लिया जाता है। सभी फील्ड्स पर कोई दूसरा कोऑर्डिनेट सिस्टम उपयोग करने के लिए, `ऐप` > `प्राथमिकताएं दिखाएँ...` (Windows/Linux) या `AdvantageScope` > `सेटिंग्स...` (macOS) पर क्लिक करके प्राथमिकताएं विंडो खोलें और "कोऑर्डिनेट सिस्टम" विकल्प बदलें।

:::tip
सभी कोऑर्डिनेट सिस्टम विकल्प FRC और FTC दोनों फील्ड्स के साथ काम करते हैं।
:::

## सेंटर/रेड (Systemcore) {#center-red}

इसका ओरिजिन (origin) फील्ड के केंद्र में होता है, और +X ऐक्सिस रेड एलायंस वॉल से दूर की ओर होता है, जैसा नीचे दिखाया गया है। **2027 से शुरू होने वाले FRC फील्ड्स और 2027-2028 से शुरू होने वाले FTC फील्ड्स के लिए यह डिफ़ॉल्ट कोऑर्डिनेट सिस्टम है।**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Center/red coordinate system" />

## ब्लू वॉल {#blue-wall}

इसका ओरिजिन (origin) ब्लू एलायंस वॉल के सबसे दाहिने कोने में होता है, और +X ऐक्सिस रेड एलायंस वॉल की ओर होता है, जैसा नीचे दिखाया गया है। **2023 से 2026 तक के FRC फील्ड्स के लिए यह डिफ़ॉल्ट कोऑर्डिनेट सिस्टम है।**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Blue wall coordinate system" />

## एलायंस वॉल {#alliance-wall}

इसका ओरिजिन (origin) _रोबोट के वर्तमान एलायंस_ की एलायंस वॉल के सबसे दाहिने कोने में होता है, और +X ऐक्सिस सामने वाली एलायंस वॉल की ओर होता है, जैसा नीचे दिखाया गया है। **2022 में FRC के लिए यह डिफ़ॉल्ट कोऑर्डिनेट सिस्टम था।**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Alliance wall coordinate system" />

## सेंटर/रोटेटेड {#center-rotated}

इसका ओरिजिन (origin) फील्ड के केंद्र में होता है, और रेड एलायंस वॉल की तरफ़ से देखने पर +X ऐक्सिस दाईं ओर होता है, जैसा नीचे दिखाया गया है। **2024-2025 से 2026-2027 तक के FTC फील्ड्स के लिए यह डिफ़ॉल्ट कोऑर्डिनेट सिस्टम है।**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Center/rotated coordinate system" height="400" />
