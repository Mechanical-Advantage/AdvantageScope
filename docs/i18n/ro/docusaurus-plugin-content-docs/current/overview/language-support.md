---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Suport lingvistic {#language-support}

AdvantageScope suportă mai multe limbi pentru a oferi o experiență localizată echipelor din întreaga lume. Următoarele limbi sunt disponibile în prezent și sunt suportate de documentația AdvantageScope, aplicația desktop, aplicațiile mobile (AdvantageScope XR și AdvantageTune) și AdvantageScope Lite (pe Systemcore și în FIRST Driver Station):

- Engleză (SUA)
- Spaniolă (America Latină)
- Franceză
- Olandeză
- Portugheză (Brazilia)
- Română
- Turcă
- Rusă
- Kazahă
- Ebraică
- Arabă
- Hindi
- Chineză simplificată
- Chineză tradițională

## Configurare {#configuration}

Pentru a schimba limba de afișare în AdvantageScope, deschide fereastra de preferințe făcând clic pe `App` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS). La setarea „Limbă”, poți alege din lista de limbi suportate sau poți selecta „Implicit sistem” pentru a se potrivi automat cu limba sistemului tău de operare.

<img src="/img/prefs_ro.webp" alt="Diagrama preferințelor" height="450" />

## Chei de jurnalizare {#logging-keys}

Toate formatele suportate de AdvantageScope beneficiază de compatibilitate completă Unicode la definirea cheilor de jurnalizare. Aceasta înseamnă că poți înregistra date folosind limba ta preferată (inclusiv diacritice, caractere speciale și alfabete non-latine) și acestea vor fi înregistrate și afișate corect în AdvantageScope.

Iată un exemplu de înregistrare a unui șir de caractere cu o cheie în limba română:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("Tracțiune/Viteză motor dreapta", "Rapid");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Tracțiune/Viteză motor dreapta", "Rapid");
```

</TabItem>
</Tabs>

:::tip Suport pentru unități
Consultă pagina despre [suportul pentru unități](/tab-reference/line-graph/units) pentru mai multe detalii despre comunicarea metadatelor unităților. Numele unităților trebuie furnizate folosind simboluri SI sau engleză (ortografie americană sau britanică), indiferent de limba selectată în AdvantageScope.
:::

## Dezvoltare {#development}

Localizarea AdvantageScope este creată printr-o combinație de inteligență artificială și colaborare comunitară. Deoarece AdvantageScope este un proiect în continuă evoluție, utilizarea IA este esențială pentru a menține sincronizate aplicația tradusă și documentația în fiecare limbă. Aceasta înseamnă că noile funcționalități și actualizări sunt întotdeauna disponibile simultan, indiferent de limba selectată.

Procesul nostru este conceput pentru a se potrivi cu vocabularul specific, împrumuturile lexicale și transliterările cu care echipele locale sunt familiarizate. Cu toate acestea, traducerile generate de IA includ adesea formulări nenaturale sau alte inexactități. Apreciem feedbackul tău; poți oferi feedback cu privire la traduceri făcând clic pe pictograma mov din aplicație (când este configurată pentru orice altă limbă în afară de engleză).
