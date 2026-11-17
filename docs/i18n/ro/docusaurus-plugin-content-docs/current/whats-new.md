---
title: Ce este nou în 2026?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

Versiunea 2026 a AdvantageScope este acum disponibilă! Consultă [documentația de instalare](/overview/installation) și [jurnalul complet de modificări](https://github.com/Mechanical-Advantage/AdvantageScope/releases) pentru detalii. Această versiune include câteva funcționalități noi majore și numeroase îmbunătățiri în întreaga aplicație. Multe dintre funcționalitățile din această versiune sunt concepute pentru a îmbunătăți experiența pe sistemele de control existente, pregătind în același timp o tranziție lină către [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) în sezoanele viitoare.

**Apreciem feedback-ul tău! Feedback-ul, sugestiile de funcționalități noi și raportările de erori sunt binevenite pe [pagina de probleme](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Experimental: suport FTC {#ftc-support}

În pregătirea pentru suportul complet cu Systemcore în sezonul 2027-2028, această versiune adaugă câteva funcționalități pentru a îmbunătăți compatibilitatea cu sistemul de control existent FIRST Tech Challenge:

- Terenuri FTC și modele de roboți pe fila 🗺️ [Teren 2D](/tab-reference/2d-field) și 👀 [Teren 3D](/tab-reference/3d-field)
- Opțiuni noi de [sistem de coordonate](/more-features/coordinate-systems) pentru compatibilitate cu [coordonatele standard FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Suport pentru fișiere log [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- Suport pentru formatul de streaming live [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Echipele FTC ar trebui să fie prudente atunci când folosesc software experimental în timpul sezonului oficial. Suportul FTC pentru AdvantageScope este încă în dezvoltare activă.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

Mai multe biblioteci terțe de jurnalizare/telemetrie FTC acceptă alte formate compatibile cu AdvantageScope, cum ar fi WPILOG și RLOG. Documentația acestor biblioteci poate fi găsită în proiectele respective; dezvoltatorii AdvantageScope nu susțin și nu recomandă o anumită soluție de logare FTC pentru utilizarea cu AdvantageScope.

:::info
AdvantageScope este conceput pentru a oferi cea mai bună experiență atunci când este utilizat alături de framework-ul WPILib și instrumentele asociate de logare. Poți întâmpina probleme de compatibilitate sau funcționalități limitate când folosești soluții neoficiale de logare.

Toate funcționalitățile AdvantageScope vor fi suportate oficial în FTC după tranziția la Systemcore pentru sezonul 2027-2028.
:::

## 🧮 Grafice bazate pe unități {#unit-aware-graphing}

Fila 📉 [Grafic liniar](/tab-reference/line-graph/) a fost reproiectată pentru a fi complet compatibilă cu unitățile de măsură. Acest lucru permite mai multe funcționalități noi la reprezentarea grafică a câmpurilor numerice:

- Etichetarea precisă a axelor Y și afișarea valorilor
- Conversie rapidă în unități compatibile (fără ferestre pop-up)
- Conversie implicită a tipurilor de unități compatibile în cadrul unei singure axe
- Afișarea corectă a unităților [integrate și diferențiate](/tab-reference/line-graph/#integration-and-differentiation)

Captura de ecran de mai jos prezintă toate aceste funcționalități în acțiune. Reține că axa stângă include câmpuri cu unități diferite de viteză unghiulară, iar axa dreaptă include valori diferențiate și afișate într-o unitate non-nativă (grade). Selectarea unităților este, de asemenea, mai ușoară ca niciodată, cu opțiuni de unități compatibile integrate direct în meniul de control pentru fiecare axă.

_Mai multe informații despre suportul pentru unități pot fi găsite în [documentație](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Grafice bazate pe unități" />

_Mai sus este prezentată interfața în limba engleză._

## 🏁 Descărcări mai rapide de loguri {#faster-log-downloads}

[Descărcarea logurilor de pe roboRIO](/overview/log-files/#downloading-from-the-robot) este acum de **2-4x mai rapidă** decât în versiunile anterioare. Acest lucru se realizează prin trecerea la un nou protocol (FTP), care permite roboRIO să transfere date de log cu o utilizare mai mică a CPU-ului.

Tabelul de mai jos arată viteza de transfer măsurată pe versiunile 2025 și 2026 ale AdvantageScope când este conectat prin Ethernet (lățime de bandă maximă de 100 Mb/s). Reține că performanța versiunii 2025 este puternic afectată de utilizarea CPU-ului pe roboRIO.

|                                                      | 2025 (SFTP) | 2026 (FTP) | Accelerare                                       |
| ---------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Utilizare mare CPU<br /><sub>Cod robot complex</sub> | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3,2x**</span> |
| Utilizare medie CPU<br /><sub>Cod robot normal</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2,3x**</span> |
| Utilizare minimă CPU<br /><sub>Fără cod robot</sub>  | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1,1x**</span> |

## 📁 Descărcare loguri din subfoldere {#download-logs-from-subfolders}

Fereastra de descărcare permite acum salvarea logurilor stocate în subfoldere. Fiecare subfolder poate fi descărcat ca un grup, ceea ce ușurează descărcarea logurilor generate de versiunea 2026 a [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de la CTRE (care folosește subfoldere deoarece nu poate salva toate datele într-un singur fișier log).

<img src="/img/whats-new/subfolders.webp" alt="Descărcarea logurilor din subfoldere" height="450" />

## 🌈 Opțiuni noi de vizualizare {#new-visualization-options}

Câteva opțiuni noi de vizualizare sunt suportate pe 🗺️ [Teren 2D](/tab-reference/2d-field) și 👀 [Teren 3D](/tab-reference/3d-field):

- Pe terenul 2D este disponibilă acum o varietate mai largă de culori pentru bumperele robotului, iar fiecare obiect poate fi configurat cu propria sa culoare. Acest lucru oferă o mai mare flexibilitate atunci când combini fantomele cu mai multe obiecte robot.
- La [vizualizarea mecanismelor 2D pe terenul 3D](/tab-reference/3d-field/#2d-mechanisms), mecanismele pot fi plasate acum și pe planul YZ, pe lângă planul XZ. Acest lucru permite o vizualizare mai ușoară a mecanismelor complexe cu mișcare pe axe multiple.
- Terenul 3D suportă acum antialiasing opțional pentru a îmbunătăți calitatea marginilor randate.

<img src="/img/whats-new/field-viz.jpg" alt="Vizualizări noi de teren" />

## 🪵 Suport pentru loguri CAN REV Robotics {#rev-robotics-can-log-support}

Acum poți deschide fișiere `.revlog` produse de [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de la REV Robotics direct în AdvantageScope. Aceste fișiere înregistrează semnale CAN de la dispozitivele Spark Max și Spark Flex, oferind o alternativă oficială la biblioteca [URCL](/more-features/urcl) din AdvantageScope.

Atât URCL, cât și `StatusLogger`-ul oficial vor rămâne disponibile în timpul sezonului 2026 pentru a asigura o tranziție lină și aceleași funcționalități ca în sezoanele anterioare. Vom reveni cu mai multe detalii despre opțiunile de logare pentru 2027 și după.

<img src="/img/whats-new/revlog.webp" alt="Vizualizare REVLOG" />

## 💿 Importuri de fișiere CSV {#csv-file-imports}

Pentru o vizualizare mai flexibilă a datelor produse în afara framework-urilor de logare ale robotului, AdvantageScope include acum suport de bază pentru importul fișierelor CSV. Consultă [documentația](/overview/log-files/#csv-formatting) pentru mai multe detalii despre formatele suportate și alte limitări.

<img src="/img/overview/log-files/export-2.webp" alt="Date CSV" />

## 🤩 Îmbunătățiri estetice {#aesthetic-improvements}

Interfața AdvantageScope pe Windows 11 a fost actualizată și include acum o bară laterală translucidă, care anterior era disponibilă doar pe macOS. O pictogramă actualizată a aplicației este, de asemenea, disponibilă pentru macOS Tahoe, bazată pe materialul Liquid Glass de la Apple.

<img src="/img/whats-new/windows-ui.webp" alt="Interfață utilizator Windows" />

## 📋 Meniuri simplificate {#streamlined-menus}

Bara de meniu și controalele asociate au fost simplificate și reorganizate pentru a fi mai accesibile și mai coerente pe toate platformele. Printre funcționalitățile notabile se numără:

- Comutare mai rapidă între sursele live (de exemplu NetworkTables și [Diagnostice Phoenix](/overview/live-sources/phoenix-diagnostics)), fără să mai fie nevoie să deschizi fereastra de preferințe.
- Clic dreapta pe bara laterală pentru a copia rapid numele unui câmp (sau cheia completă a câmpului).
- Reorganizarea ferestrei de preferințe, astfel încât opțiunile să fie mai ușor de găsit rapid.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_ro.webp" />
</div>

## 🐛 Îmbunătățiri ale stabilității {#stability-improvements}

Această versiune include o serie de remedieri de erori și îmbunătățiri ale stabilității în întreaga aplicație. Lista completă poate fi găsită în [jurnalul de modificări](https://github.com/Mechanical-Advantage/AdvantageScope/releases) al versiunii, însă câteva remedieri importante sunt enumerate mai jos:

- Performanța AdvantageScope la streamingul de date pe perioade lungi a fost îmbunătățită considerabil, în special la utilizarea filei Grafic liniar.
- AdvantageScope este acum mai tolerant cu datele de log neobișnuite, inclusiv fișiere de log mari și valori mari de câmp.
- Au fost remediate diverse erori vizuale la navigarea prin datele din log, în special la utilizarea filtrelor pe fila Grafic liniar.
- Ordonarea fișierelor log AdvantageKit în fereastra de descărcare a fost remediată; logurile fără marcaje de timp apar acum în partea de jos a listei, similar cu alte formate.
- Pe fila Teren 3D, camerele robotului cu o rotație diferită de zero pe axa de ruliu (roll) sunt acum vizualizate corect.
- Stabilitatea AdvantageScope XR a fost îmbunătățită, în special când rulează pe iOS/iPadOS 26. Pentru instalările offline, verifică App Store pentru actualizările disponibile.
