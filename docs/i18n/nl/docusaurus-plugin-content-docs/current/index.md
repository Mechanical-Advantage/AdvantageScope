---
sidebar_position: 1
title: Welkom
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-ltr-light.webp" className="light-only" />
<img src="/img/banner-ltr-dark.webp" className="dark-only" />

AdvantageScope is een applicatie voor robotdiagnostiek, loganalyse en datavisualisatie voor FIRST-teams, ontwikkeld door [Team 6328](https://littletonrobotics.org). De applicatie leest logs in de formaten WPILOG, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV, NI DS-logbestand en RLOG. Daarnaast kun je live robotdata bekijken via NT4-, Phoenix-, RLOG- of FTC Dashboard-streaming. Je kunt AdvantageScope gebruiken bij elk WPILib-project, maar de applicatie is ook geoptimaliseerd voor ons log-replayframework [AdvantageKit](https://docs.advantagekit.org). Let op: **je hebt AdvantageKit niet nodig om AdvantageScope te gebruiken**.

<DocCardList
items={[
{
type: "category",
label: "Overzicht",
href: "/category/overview"
},
{
type: "category",
label: "Tabbladreferentie",
href: "/category/tab-reference"
},
{
type: "category",
label: "Meer functies",
href: "/category/more-features"
},
{
type: "link",
label: "Kampioenschapsconferentie",
href: "/overview/champs-conference"
}
]}
/>

AdvantageScope bevat de volgende tools:

- Een uitgebreide selectie flexibele grafieken en diagrammen
- 2D- en 3D-veldvisualisaties van posedata, met aanpasbare robotmodellen op basis van CAD
- Gesynchroniseerd afspelen van een los geladen wedstrijdvideo
- Joystickvisualisatie die de acties van de bestuurder toont op aanpasbare controllerweergaven
- Vectorweergaven van swerve-modules
- Overzicht van consoleberichten
- Analyse van logstatistieken
- Flexibele exportopties, met ondersteuning voor CSV en WPILOG

<Button
label="Ga naar downloads"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Feedback, verzoeken voor nieuwe functies en bugrapporten zijn welkom op de [issues-pagina](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Kijk op de [bijdragepagina](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) voor meer informatie over hoe je kunt bijdragen aan AdvantageScope. Heb je een privévraag? Stuur dan een bericht naar software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />
