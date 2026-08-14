---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Language Support {#language-support}

AdvantageScope supports multiple languages to provide a localized experience for teams worldwide. The following languages are currently available:

- English (US)
- Spanish (Latin America)
- French
- Portuguese (Brazil)
- Turkish
- Romanian
- Hebrew
- Kazakh
- Russian
- Arabic
- Simplified Chinese
- Traditional Chinese

## Configuration {#configuration}

To change the display language in AdvantageScope, open the preferences window by clicking `App` > `Show Preferences...` (Windows/Linux) or `AdvantageScope` > `Settings...` (macOS). Under the "Language" setting, you can choose from the list of supported languages or select "System Default" to automatically match your operating system's language.

<img src="/img/prefs_en-US.webp" alt="Diagram of preferences" height="350" />

## Logging Keys {#logging-keys}

All formats supported by AdvantageScope feature full Unicode compatibility when defining log keys. This means you can log data using your native language (including accents, special characters, and non-Latin alphabets) and it will be properly recorded and displayed in AdvantageScope.

Here is an example of logging a string with a Simplified Chinese key:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SmartDashboard.putString("驱动/右电机速度", "快");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("驱动/右电机速度", "快");
```

</TabItem>
</Tabs>

:::tip Unit support
See the page on [unit support](/tab-reference/line-graph/units) for more details on communicating unit metadata. Unit names must be provided using SI symbols or American English, regardless of the language selected in AdvantageScope.
:::

## Development {#development}

AdvantageScope's localization is driven by a combination of artificial intelligence and community collaboration. Because AdvantageScope is a rapidly evolving project, utilizing AI is essential to keeping the translated app and documentation in sync across every language. This means that new features and updates are always available simultaneously regardless of the language you select.

To ensure the highest quality translations, our process relies on extensive reference materials from native speakers in the FIRST community to build detailed glossaries and guidelines for each language. This helps the translations match the specific vocabulary, loanwords, and transliterations that local teams are familiar with.

The foundational translations are generated iteratively using AI with human oversight over critical choices (such as translations of FIRST vocabulary). These translations are then reviewed and polished by native speakers from the FIRST community to ensure the accuracy of the resulting text. Users can also provide feedback on translations by clicking the purple icon in the app (when configured for any language other than English).
