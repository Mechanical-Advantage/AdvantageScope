---
sidebar_position: 1
---

# ✴️ Compatibilitate FTC {#ftc-compatibility}

AdvantageScope include funcționalități pentru a oferi o experiență fluidă pe sistemul de control existent FIRST Tech Challenge, pregătind în același timp tranziția către [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) în sezoanele viitoare. Toate caracteristicile AdvantageScope vor fi suportate oficial în FTC după tranziția la Systemcore începând cu sezonul 2027-2028.

## Terenuri și roboți {#fields-and-robots}

Terenurile și modelele de roboți FTC sunt complet suportate nativ.

- **Modele de terenuri și roboți:** Selectează terenuri și modele de roboți FTC în filele 🗺️ [Teren 2D](/tab-reference/2d-field) și 👀 [Teren 3D](/tab-reference/3d-field) direct din meniurile drop-down. Toate terenurile sunt compatibile cu [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Sisteme de coordonate:** Configurează [sistemul de coordonate](/more-features/coordinate-systems) pentru compatibilitate cu [coordonatele standard FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) pe orice teren. Acest sistem de coordonate este utilizat implicit pe terenurile FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Formate suportate {#supported-formats}

AdvantageScope include suport nativ pentru formatul de streaming live **FTC Dashboard** și fișierele `.log` **Road Runner**, pe lângă formatele compatibile cu WPILib, cum ar fi WPILOG și NetworkTables.

Mai multe biblioteci terțe de telemetrie și jurnalizare FTC produc date în formate compatibile cu AdvantageScope. Dezvoltatorii AdvantageScope nu susțin și nu recomandă nicio soluție de jurnalizare specifică FTC și este posibil să întâmpini capacități limitate atunci când utilizezi anumite soluții de jurnalizare.

Lista de mai jos oferă un punct de plecare, dar nu este exhaustivă:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Generează fișiere log pentru depanarea logicii de planificare a traiectoriei.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Transmite telemetrie live compatibilă atât cu propriul dashboard, cât și cu AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Permite înregistrarea personalizată a datelor în multiple formate, inclusiv fișiere log și streaming live.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Salvează date în formatul WPILOG folosind adnotări.
- **PsiKit**: Un framework de jurnalizare și reluare pentru FTC inspirat de AdvantageKit.

:::warning
Echipele trebuie să se asigure că respectă regula R704 în timpul competițiilor. Serviciile de telemetrie terțe, cum ar fi FTC Dashboard, sunt interzise atunci când sunt conectate prin Wi-Fi la competiții.
:::

### AdvantageScope Lite pentru FTC {#advantagescope-lite-for-ftc}

Este disponibilă o distribuție neoficială a [AdvantageScope Lite](/more-features/advantagescope-lite) optimizată pentru FTC: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Această distribuție este neoficială și nu este susținută de dezvoltatorii AdvantageScope.

În timp ce versiunea standard [AdvantageScope Lite](/more-features/advantagescope-lite) este o aplicație web concepută pentru a fi utilizată pe Systemcore și pe FIRST Driver Station, distribuția neoficială FTC este modificată special pentru a fi utilizată direct pe sistemul de control FTC existent. Aceasta suportă nativ vizualizarea datelor live prin protocolul FTC Dashboard fără a necesita software suplimentar.
