---
sidebar_position: 1
title: Bienvenue
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner.png" alt="AdvantageScope" />

AdvantageScope est une application de diagnostic de robot, d'examen et d'analyse de journaux, et de visualisation de données pour les équipes FIRST, développée par l'[Équipe 6328](https://littletonrobotics.org). Elle lit les journaux aux formats de fichier WPILOG, journal DS, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV et RLOG, ainsi que l'affichage des données du robot en direct par diffusion NT4, Phoenix, RLOG ou FTC Dashboard. AdvantageScope peut être utilisée avec n'importe quel projet WPILib, mais elle est également optimisée pour une utilisation avec notre framework de relecture de journaux [AdvantageKit](https://docs.advantagekit.org). Notez qu'**AdvantageKit n'est pas nécessaire pour utiliser AdvantageScope**.

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

AdvantageScope comprend les outils suivants :

- Une vaste sélection de graphiques et de diagrammes flexibles
- Des visualisations de terrain 2D et 3D des données de pose, avec des robots personnalisables basés sur la CAO
- La lecture vidéo synchronisée à partir d'une vidéo de match chargée séparément
- La visualisation des manettes, montrant les actions du pilote sur des représentations de manettes personnalisables
- L'affichage vectoriel des modules Swerve
- L'examen des messages de la console
- L'analyse des statistiques de journaux
- Des options d'exportation flexibles, prenant en charge les formats CSV et WPILOG

<Button
  label="Accéder aux téléchargements"
  link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
  variant="primary"
  size="lg"
  block
  style={{ marginBottom: "15px" }}
/>

Les commentaires, demandes de fonctionnalités et rapports de bogues sont les bienvenus sur la [page des problèmes](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Consultez la [page de contribution](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) pour plus d'informations sur la contribution à AdvantageScope. Pour les demandes non publiques, veuillez envoyer un message à software@team6328.org.

<img src="/img/screenshot-light.png" className="light-only" />
<img src="/img/screenshot-light.png" className="dark-only" />
