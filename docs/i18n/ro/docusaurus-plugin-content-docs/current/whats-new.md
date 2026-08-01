---
title: Ce este nou în 2026?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-light.png" className="light-only" />
<img src="/img/whats-new/banner-dark.png" className="dark-only" />

Versiunea 2026 a AdvantageScope este acum disponibilă! Consultați [documentația de instalare](/overview/installation) și [jurnalul complet de modificări](https://github.com/Mechanical-Advantage/AdvantageScope/releases) pentru detalii. Această versiune include câteva caracteristici noi majore și numeroase îmbunătățiri în întreaga aplicație. Multe dintre caracteristicile din această versiune sunt concepute pentru a îmbunătăți experiența pe sistemele de control existente, pregătind în același timp o tranziție lină către [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) în sezoanele viitoare.

**Apreciem feedback-ul tău! Feedback-ul, solicitările de caracteristici noi și raportările de erori sunt binevenite pe [pagina de probleme](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Experimental: suport FTC {#ftc-support}

În pregătirea pentru suportul complet cu Systemcore în sezonul 2027-2028, această versiune adaugă câteva caracteristici pentru a îmbunătăți compatibilitatea cu sistemul de control existent FIRST Tech Challenge:

- Terenuri FTC și modele de roboți pe fila 🗺️ [Teren 2D](/tab-reference/2d-field) și 👀 [Teren 3D](/tab-reference/3d-field)
- Opțiuni noi de [sistem de coordonate](/more-features/coordinate-systems) pentru compatibilitate cu [coordonatele standard FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Suport pentru fișiere log [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- Suport pentru formatul de streaming live [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Echipele FTC ar trebui să fie prudente atunci când utilizează software experimental în timpul sezonului oficial. Suportul FTC pentru AdvantageScope este încă în dezvoltare activă.
:::

<div className="image-gallery">
  <img src="/img/whats-new/ftc-1.jpg" />
  <img src="/img/whats-new/ftc-2.jpg" />
  <img src="/img/whats-new/ftc-3.png" />
  <img src="/img/whats-new/ftc-4.png" />
  <img src="/img/whats-new/ftc-5.png" />
</div>

Mai multe biblioteci terțe de înregistrare/telemetrie FTC acceptă alte formate compatibile cu AdvantageScope, cum ar fi WPILOG și RLOG. Documentația acestor biblioteci poate fi găsită în proiectele respective; dezvoltatorii AdvantageScope nu susțin/recomandă o anumită soluție de logare FTC pentru utilizarea cu AdvantageScope.

:::info
AdvantageScope este conceput pentru a oferi cea mai bună experiență atunci când este utilizat alături de cadrul WPILib și instrumentele asociate de logare. Puteți întâmpina probleme de compatibilitate sau capacități limitate când utilizați soluții neoficiale de logare.

Toate caracteristicile AdvantageScope vor fi suportate oficial în FTC după tranziția la Systemcore pentru sezonul 2027-2028.
:::

## 🧮 Grafice bazate pe unități {#unit-aware-graphing}

Fila 📉 [Grafic liniar](/tab-reference/line-graph/) a fost reproiectată pentru a fi pe deplin conștientă de unități. Acest lucru permite mai multe capacități noi la reprezentarea grafică a câmpurilor numerice:

- Etichetarea precisă a axelor Y și afișarea valorilor
- Conversie rapidă la unități compatibile (fără ferestre pop-up)
- Conversie implicită a tipurilor de unități compatibile în cadrul unei singure axe
- Afișarea exactă a unităților [integrate și diferențiate](/tab-reference/line-graph/#integration--differentiation)

Captura de ecran de mai jos prezintă toate aceste caracteristici în acțiune. Rețineți că axa stângă include câmpuri cu unități diferite de viteză unghiulară, iar axa dreaptă include valori care sunt diferențiate și afișate într-o unitate non-nativă (grade). Selectarea unităților este de asemenea mai ușoară ca niciodată, cu opțiuni de unități compatibile integrate direct în meniul de control pentru fiecare axă.

_Mai multe informații despre suportul pentru unități pot fi găsite în [documentație](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.png" alt="Unit-aware graphing" />

## 🏁 Descărcări mai rapide de loguri {#faster-log-downloads}

[Descărcarea logurilor de pe roboRIO](/overview/log-files/#downloading-from-the-robot) este acum de **2-4x mai rapidă** decât în versiunile anterioare. Acest lucru se realizează prin trecerea la un nou protocol (FTP) care permite roboRIO să transfere date de log cu o încărcare mai mică a CPU-ului.

Tabelul de mai jos arată viteza de transfer măsurată pe versiunile 2025 și 2026 ale AdvantageScope când este conectat prin Ethernet (lățime de bandă maximă de 100 Mb/s). Rețineți că performanța versiunii 2025 este puternic afectată de încărcarea CPU-ului pe roboRIO.

|                                                         | 2025 (SFTP) | 2026 (FTP) | Accelerare                                       |
| ------------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Încărcare mare CPU<br /><sub>Cod robot complex</sub>    | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| Încărcare medie CPU<br /><sub>Cod robot normal</sub>    | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| Încărcare minimă CPU<br /><sub>Fără cod robot</sub>     | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 Descărcare loguri din subfoldere {#download-logs-from-subfolders}

Fereastra de descărcare acceptă acum salvarea logurilor care sunt stocate în subfoldere. Fiecare subfolder de loguri poate fi descărcat ca un grup, oferind o abordare simplificată pentru descărcarea logurilor generate de versiunea 2026 a [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de la CTRE (care folosește subfoldere ca o soluție pentru imposibilitatea de a stoca date într-un singur fișier log).

<img src="/img/whats-new/subfolders.png" alt="Downloading log subfolders" height="450" />

## 🌈 Opțiuni noi de vizualizare {#new-visualization-options}

Câteva opțiuni noi de vizualizare sunt suportate pe terenul 🗺️ [Teren 2D](/tab-reference/2d-field) și 👀 [Teren 3D](/tab-reference/3d-field):

- O varietate mai largă de culori pentru bumperele robotului este acum disponibilă pe terenul 2D, iar fiecare obiect poate fi configurat cu propria sa culoare. Acest lucru permite o mai mare flexibilitate la combinarea fantomelor cu mai multe obiecte robot.
- La [vizualizarea mecanicilor 2D pe terenul 3D](/tab-reference/3d-field/#2d-mechanisms), mecanismele pot fi plasate acum pe planul YZ pe lângă planul XZ. Acest lucru permite o vizualizare mai ușoară a mecanicilor complexe cu mișcare pe axe multiple.
- Terenul 3D suportă acum antialiasing opțional pentru a îmbunătăți calitatea marginilor randate.

<img src="/img/whats-new/field-viz.jpg" alt="New field visualizations" />

## 🪵 Suport pentru loguri CAN REV Robotics {#rev-robotics-can-log-support}

Acum puteți deschide fișiere `.revlog` produse de [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de la REV Robotics direct în AdvantageScope. Aceste fișiere înregistrează semnale CAN de la dispozitivele Spark Max și Spark Flex, oferind o alternativă oficială la biblioteca [URCL](/more-features/urcl) a AdvantageScope.

Atât URCL, cât și `StatusLogger`-ul oficial vor rămâne disponibile în timpul sezonului 2026 pentru a asigura o tranziție lină și pentru a oferi paritate de caracteristici cu sezoanele anterioare. Vom avea mai multe detalii de împărtășit despre opțiunile de logare în 2027 și ulterior la o dată viitoare.

<img src="/img/whats-new/revlog.png" alt="REVLOG visualization" />

## 💿 Importuri de fișiere CSV {#csv-file-imports}

Pentru o vizualizare mai flexibilă a datelor produse în afara cadrelor de logare ale robotului, AdvantageScope include acum suport de bază pentru importul fișierelor CSV. Consultați [documentația](/overview/log-files/#csv-formatting) pentru mai multe detalii despre formatele suportate și alte limitări.

<img src="/img/overview/log-files/export-2.png" alt="CSV data" />

## 🤩 Îmbunătățiri estetice {#aesthetic-improvements}

Interfața de utilizator AdvantageScope pe Windows 11 a fost actualizată pentru a suporta o bară laterală translucidă, care anterior era exclusivă pentru versiunile macOS. O pictogramă actualizată a aplicației este de asemenea disponibilă pentru macOS Tahoe bazată pe materialul Liquid Glass de la Apple.

<img src="/img/whats-new/windows-ui.png" alt="Windows UI" />

## 📋 Meniuri simplificate {#streamlined-menus}

Bara de meniu și controalele conexe au fost simplificate și reorganizate pentru a face controalele mai accesibile și mai coerente pe toate platformele. Caracteristicile notabile includ:

- Comutare mai rapidă între sursele live (de exemplu NetworkTables și [Diagnostice Phoenix](/overview/live-sources/phoenix-diagnostics)), fără a fi nevoie să deschideți fereastra de preferințe.
- Dă clic dreapta pe bara laterală pentru a copia rapid numele unui câmp (sau cheia completă a câmpului).
- Reorganizarea ferestrei de preferințe, făcând opțiunile mai ușor de găsit rapid.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.png" />
  <img src="/img/whats-new/menus-2.png" />
  <img src="/img/prefs.png" />
</div>

## 🐛 Îmbunătățiri ale stabilității {#stability-improvements}

Această versiune include o varietate de remedieri de erori și îmbunătățiri ale stabilității în întreaga aplicație. Lista completă poate fi găsită în [jurnalul de modificări](https://github.com/Mechanical-Advantage/AdvantageScope/releases) al versiunii, însă câteva remedieri notabile sunt enumerate mai jos:

- Performanța AdvantageScope la streaming de date pentru perioade lungi a fost îmbunătățită considerabil, în special la utilizarea filei grafic liniar.
- AdvantageScope este acum mai tolerant cu datele de log neobișnuite, inclusiv fișiere de log mari și valori mari de câmp.
- Diverse erori vizuale au fost remediate la navigarea prin datele din log, în special la utilizarea filtrelor pe fila grafic liniar.
- Ordonarea fișierelor de log AdvantageKit în fereastra de descărcare a fost remediată; logurile fără marcaje de timp sunt acum în partea de jos a listei, similar cu alte formate.
- Pe fila teren 3D, camerele robotului cu o rotație diferită de zero pe axa de ruliu (roll) sunt acum vizualizate corect.
- Stabilitatea AdvantageScope XR a fost îmbunătățită, în special când rulează pe iOS/iPadOS 26. Pentru instalările offline, verificați App Store pentru actualizările disponibile.
