---
sidebar_position: 1
title: Bienvenue
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-ltr-light.webp" className="light-only" />
<img src="/img/banner-ltr-dark.webp" className="dark-only" />

AdvantageScope est une application d'analyse de journaux, de diagnostic et de visualisation de données conçue pour les équipes FIRST par l'[équipe 6328](https://littletonrobotics.org). Elle lit les fichiers journaux aux formats WPILOG, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV, NI DS et RLOG, et permet aussi de suivre les données du robot en direct via NT4, Phoenix, RLOG ou FTC Dashboard. Vous pouvez utiliser AdvantageScope avec n'importe quel projet WPILib, même si l'application est particulièrement optimisée pour notre framework de relecture [AdvantageKit](https://docs.advantagekit.org). **AdvantageKit n'est toutefois pas nécessaire pour utiliser AdvantageScope**.

<DocCardList
items={[
{
type: "category",
label: "Présentation",
href: "/category/overview"
},
{
type: "category",
label: "Référence des onglets",
href: "/category/tab-reference"
},
{
type: "category",
label: "Plus de fonctionnalités",
href: "/category/more-features"
},
{
type: "link",
label: "Conférence du championnat",
href: "/overview/champs-conference"
}
]}
/>

AdvantageScope met à votre disposition les outils suivants :

- Une grande variété de graphiques et de courbes configurables
- Des vues de terrain 2D et 3D pour visualiser les poses, avec des modèles de robot personnalisables issus de votre CAO
- La lecture vidéo synchronisée à partir d'une vidéo de match importée séparément
- La visualisation des manettes pour suivre les commandes des pilotes sur des représentations personnalisables
- L'affichage vectoriel des modules Swerve
- La consultation des messages de la console
- L'analyse statistique des journaux
- Des options d'exportation flexibles aux formats CSV et WPILOG

<Button
label="Accéder aux téléchargements"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Vos commentaires, suggestions de fonctionnalités et rapports de bogues sont les bienvenus sur la [page des problèmes](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Consultez la [page de contribution](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) si vous souhaitez participer au développement d'AdvantageScope. Pour toute demande privée, écrivez-nous à software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />
