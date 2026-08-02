---
sidebar_position: 1
---

# 📦 Instalare {#installation}

Versiunea suportată oficial a AdvantageScope este disponibilă direct de la Echipa 6328 sau prin intermediul instalatorului WPILib. Sunt disponibile și câteva distribuții neoficiale.

## Echipa 6328 {#team-6328}

### Descărcări: [Stabilă](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [Pre-lansare](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Descărcarea AdvantageScope direct de la Echipa 6328 oferă:

- Cele mai recente caracteristici și remedieri de erori înainte ca acestea să fie disponibile pe alte canale.
- Alerte în aplicație când este disponibilă o versiune nouă pentru descărcare.
- O colecție integrată de modele recente de roboți ai Echipei 6328 pentru utilizare pe fila 👀 [Teren 3D](/tab-reference/3d-field).

:::note
Înainte de a rula versiuni AppImage pe Ubuntu 23.10 sau mai recent, trebuie să descărcați profilul AppArmor de pe pagina de lansări și să îl copiați în /etc/apparmor.d.
:::

:::info
Fiecare versiune majoră a AdvantageScope este lansată în ianuarie înainte de lansarea sezonului FRC, cu un număr de versiune corespunzător anului (de ex. v26.0.0 va fi lansată în ianuarie 2026). Versiunile beta și alpha ale AdvantageScope pot fi disponibile în lunile premergătoare fiecărei lansări, pentru echipele care doresc să experimenteze caracteristici noi și să ofere feedback. **Echipele care utilizează aceste versiuni prealabile ar trebui să se aștepte să întâmpine probleme și erori care nu sunt prezente în versiunile stabile.**
:::

## WPILib {#wpilib}

### Instalare: [Documentația WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

Instalatorul WPILib include o versiune recentă a AdvantageScope, dar poate fi în urma celei mai recente versiuni disponibile pentru descărcare directă. Documentația pentru lansarea AdvantageScope din versiunea WPILib a VSCode poate fi găsită [aici](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## Distribuții neoficiale {#unofficial-distributions}

Distribuțiile neoficiale ale AdvantageScope sunt disponibile din mai multe surse, care nu sunt suportate oficial de dezvoltatorii AdvantageScope/WPILib. Aceste distribuții pot fi în urma celei mai recente versiuni de AdvantageScope disponibile din surse oficiale. Vă rugăm să contactați direct administratorii în caz de probleme.

- [**AdvantageScope Lite pentru sistemul de control REV:**](https://github.com/j5155/AdvantageScope-Lite-FTC) O modificare a [AdvantageScope Lite](/more-features/advantagescope-lite) pentru utilizare pe sistemul de control FTC existent (anterior Systemcore).
- [**Instalator Homebrew:**](https://formulae.brew.sh/cask/advantagescope) Un pachet (cask) Homebrew pentru instalarea AdvantageScope din linia de comandă pe macOS.
- [**Arch User Repository:**](https://aur.archlinux.org/packages/advantagescope) O metodă alternativă de distribuție pentru utilizarea cu managerul de pachete pacman (o distribuție oficială Arch a AdvantageScope este disponibilă [aici](#6328-downloads)).
