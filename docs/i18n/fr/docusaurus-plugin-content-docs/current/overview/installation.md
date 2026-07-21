---
sidebar_position: 1
---

# 📦 Installation

La version officiellement prise en charge d'AdvantageScope est disponible directement auprès de l'Équipe 6328 ou via l'installateur WPILib. Plusieurs distributions non officielles sont également disponibles.

## Équipe 6328 {#team-6328}

### Téléchargements : [Version stable](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [Version préliminaire](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Le téléchargement d'AdvantageScope directement auprès de l'Équipe 6328 offre :

- Les dernières fonctionnalités et corrections de bogues avant qu'elles ne soient disponibles via d'autres canaux.
- Des alertes dans l'application lorsqu'une nouvelle version est disponible au téléchargement.
- Une collection intégrée de modèles de robots récents de la 6328 à utiliser sur l'onglet 👀 [Terrain 3D](/tab-reference/3d-field).

:::note
Avant d'exécuter des builds AppImage sur Ubuntu 23.10 ou version ultérieure, vous devez télécharger le profil AppArmor depuis la page des versions et le copier dans /etc/apparmor.d.
:::

:::info
Chaque version majeure d'AdvantageScope est publiée en janvier avant le lancement de la FRC, avec un numéro de version correspondant à l'année (par ex., la v26.0.0 sera publiée en janvier 2026). Des versions bêta et alpha d'AdvantageScope peuvent être disponibles au cours des mois précédant chaque publication, pour les équipes qui souhaitent expérimenter de nouvelles fonctionnalités et fournir des commentaires. **Les équipes utilisant ces versions préliminaires doivent s'attendre à voir des problèmes et des bogues non présents dans les versions stables.**
:::

## WPILib

### Installation : [Documentation WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

L'installateur WPILib inclut une version récente d'AdvantageScope, mais peut prendre du retard par rapport à la dernière version disponible en téléchargement direct. La documentation pour lancer AdvantageScope depuis la version WPILib de VSCode se trouve [ici](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## Distributions non officielles

Des distributions non officielles d'AdvantageScope sont disponibles auprès de plusieurs sources, qui ne sont pas officiellement prises en charge par les développeurs d'AdvantageScope/WPILib. Ces distributions peuvent prendre du retard par rapport à la dernière version d'AdvantageScope disponible auprès des sources officielles. Veuillez contacter directement les mainteneurs en cas de problème.

- [**AdvantageScope Lite pour le système de contrôle REV :**](https://github.com/j5155/AdvantageScope-Lite-FTC) Une modification d'[AdvantageScope Lite](/more-features/advantagescope-lite) à utiliser sur le système de contrôle FTC existant (pré-Systemcore).
- [**Installateur Homebrew :**](https://formulae.brew.sh/cask/advantagescope) Un cask Homebrew pour installer AdvantageScope depuis la ligne de commande sur macOS.
- [**Arch User Repository :**](https://aur.archlinux.org/packages/advantagescope) Une méthode de distribution alternative à utiliser avec le gestionnaire de paquets pacman (une distribution Arch officielle d'AdvantageScope est disponible [ici](#6328-downloads)).
