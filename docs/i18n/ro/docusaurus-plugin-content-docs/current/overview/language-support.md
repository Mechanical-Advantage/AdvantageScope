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

Mulțumim următorilor contribuitori pentru ajutorul acordat în revizuirea și îmbunătățirea traducerilor AdvantageScope:

- FRC Team 4400 Cerbotics
- FRC Team 6907 The G.O.A.T.
- Ata Baber

## Configurare {#configuration}

Pentru a schimba limba de afișare în AdvantageScope, deschide fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS). La setarea „Limbă”, poți alege din lista de limbi suportate sau poți selecta „Implicită a sistemului” pentru a folosi automat limba sistemului tău de operare.

<img src="/img/prefs_ro.webp" alt="Diagrama preferințelor" height="450" />

## Chei de jurnalizare {#logging-keys}

Toate formatele suportate de AdvantageScope beneficiază de compatibilitate completă Unicode la definirea cheilor de jurnalizare. Asta înseamnă că poți înregistra date folosind limba ta preferată (inclusiv diacritice, caractere speciale și alfabete non-latine), iar acestea vor fi înregistrate și afișate corect în AdvantageScope.

Iată un exemplu de înregistrare a unui șir de caractere cu o cheie în limba română:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Telemetry.log("Tracțiune/Viteză motor dreapta", "Rapid");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::telemetry::Log("Tracțiune/Viteză motor dreapta", "Rapid");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import telemetry

telemetry.log("Tracțiune/Viteză motor dreapta", "Rapid")
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

Localizarea AdvantageScope este realizată printr-o combinație de inteligență artificială și colaborare comunitară. Deoarece AdvantageScope este un proiect în continuă evoluție, utilizarea AI este esențială pentru a menține aplicația tradusă și documentația sincronizate în fiecare limbă. Astfel, noile funcționalități și actualizări sunt disponibile simultan, indiferent de limba selectată.

Procesul nostru este conceput pentru a se potrivi cu vocabularul specific, împrumuturile și transliterările cu care echipele locale sunt familiarizate. Cu toate acestea, **traducerile generate de AI includ adesea formulări nenaturale sau alte inexactități**. Apreciem feedback-ul tău; poți trimite observații despre traduceri dând clic pe pictograma mov din aplicație sau pe linkul de feedback din bara de titlu a documentației (atunci când este configurată pentru orice altă limbă în afară de engleză).
