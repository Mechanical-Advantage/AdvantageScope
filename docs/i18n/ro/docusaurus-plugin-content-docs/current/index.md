---
sidebar_position: 1
title: Bun venit
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-ltr-light.webp" className="light-only" />
<img src="/img/banner-ltr-dark.webp" className="dark-only" />

AdvantageScope este o aplicație de diagnosticare a robotului, analiză a logurilor și vizualizare a datelor pentru echipele FIRST, dezvoltată de [Echipa 6328](https://littletonrobotics.org). Aceasta citește loguri în formatele WPILOG, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV, log NI DS și RLOG, oferind în plus vizualizarea datelor live ale robotului prin streaming NT4, Phoenix, RLOG sau FTC Dashboard. AdvantageScope poate fi folosit cu orice proiect WPILib, dar este și optimizat pentru utilizarea cu framework-ul nostru de reluare a logurilor, [AdvantageKit](https://docs.advantagekit.org). Reține că **AdvantageKit nu este necesar pentru a folosi AdvantageScope**.

<DocCardList
items={[
{
type: "category",
label: "Tutoriale",
href: "/category/tutorials"
},
{
type: "category",
label: "Prezentare generală",
href: "/category/overview"
},
{
type: "category",
label: "Referință file",
href: "/category/tab-reference"
},
{
type: "link",
label: "Conferința de campionat",
href: "/overview/champs-conference"
}
]}
/>

AdvantageScope include următoarele instrumente:

- O gamă variată de grafice și diagrame flexibile
- Vizualizări 2D și 3D ale terenului pentru datele de pose, cu roboți personalizabili bazați pe modele CAD
- Redare video sincronizată dintr-un videoclip de meci încărcat separat
- Vizualizarea joystick-urilor, care afișează acțiunile driverului pe reprezentări personalizabile de controllere
- Afișaje vectoriale pentru modulele swerve
- Verificarea mesajelor din consolă
- Analiza statisticilor din loguri
- Opțiuni flexibile de export, cu suport pentru CSV și WPILOG

<Button
label="Accesează descărcările"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Feedback-ul, sugestiile de funcționalități noi și raportările de erori sunt binevenite pe [pagina de probleme](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Consultă [pagina de contribuții](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) pentru mai multe informații despre cum poți contribui la AdvantageScope. Pentru întrebări private, trimite un mesaj la software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />
