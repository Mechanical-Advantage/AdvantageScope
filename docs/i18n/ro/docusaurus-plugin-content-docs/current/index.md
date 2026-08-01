---
sidebar_position: 1
title: Bun venit
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner.png" alt="AdvantageScope" />

AdvantageScope este o aplicație de diagnosticare a robotului, de revizuire/analiză a logurilor și de vizualizare a datelor pentru echipele FIRST, dezvoltată de [Echipa 6328](https://littletonrobotics.org). Aceasta citește loguri în formatele de fișiere WPILOG, log DS, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV și RLOG, oferind în plus vizualizarea datelor live ale robotului prin streaming NT4, Phoenix, RLOG sau FTC Dashboard. AdvantageScope poate fi utilizat cu orice proiect WPILib, dar este de asemenea optimizat pentru utilizarea cu cadrul nostru de reluare a logurilor [AdvantageKit](https://docs.advantagekit.org). Rețineți că **AdvantageKit nu este necesar pentru a utiliza AdvantageScope**.

<DocCardList
items={[
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
type: "category",
label: "Mai multe caracteristici",
href: "/category/more-features"
},
{
type: "link",
label: "Conferința de Campionat",
href: "/overview/champs-conference"
}
]}
/>

AdvantageScope include următoarele instrumente:

- O selecție largă de grafice și diagrame flexibile
- Vizualizări 2D și 3D ale terenului pentru datele de pose, cu roboți personalizabili bazați pe modele CAD
- Redare video sincronizată dintr-un videoclip de meci încărcat separat
- Vizualizarea joystick-urilor, afișând acțiunile șoferului pe reprezentări personalizabile de controlere
- Afișaje vectoriale pentru modulele de direcție Swerve
- Revizuirea mesajelor de consolă
- Analiza statisticilor din loguri
- Opțiuni de export flexibile, cu suport pentru CSV și WPILOG

<Button
label="Accesează descărcările"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Feedback-ul, solicitările de caracteristici noi și raportările de erori sunt binevenite pe [pagina de probleme](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Consultați [pagina de contribuții](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) pentru mai multe informații despre cum puteți contribui la AdvantageScope. Pentru întrebări non-publice, vă rugăm să trimiteți un mesaj la software@team6328.org.

<img src="/img/screenshot-light.png" className="light-only" />
<img src="/img/screenshot-light.png" className="dark-only" />
