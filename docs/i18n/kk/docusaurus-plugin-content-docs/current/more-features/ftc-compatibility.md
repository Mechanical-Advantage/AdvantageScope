---
sidebar_position: 1
---

# ✴️ FTC үйлесімділігі {#ftc-compatibility}

AdvantageScope болашақ маусымдарда [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) жүйесіне көшуге дайындық жасай отырып, бар FIRST Tech Challenge басқару жүйесінде біркелкі жұмыс тәжірибесін қамтамасыз ететін мүмкіндіктерді қамтиды. AdvantageScope қолданбасының барлық мүмкіндіктері 2027-2028 маусымынан бастап Systemcore-ға көшкеннен кейін FTC-де ресми түрде қолдау табады.

## Алаңдар және роботтар {#fields-and-robots}

FTC алаңдары мен робот модельдері толығымен және нативті түрде қолданылады.

- **Алаң және робот модельдері:** 🗺️ [2D алаң](/tab-reference/2d-field) және 👀 [3D алаң](/tab-reference/3d-field) қойындыларындағы ашылмалы мәзірлерден FTC алаңдары мен робот модельдерін тікелей таңдаңыз. Барлық алаңдар [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) қолданбасымен үйлесімді.
- **Координаттар жүйелері:** Кез келген алаңда [стандартты FTC координаттарымен](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) үйлесімділік үшін [координаттар жүйесін](/more-features/coordinate-systems) баптаңыз. Бұл координаттар жүйесі FTC алаңдарында әдепкі бойынша қолданылады.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Қолдау көрсетілетін форматтар {#supported-formats}

AdvantageScope WPILOG және NetworkTables сияқты WPILib-үйлесімді форматтарға қоса, **FTC Dashboard** нақты уақыттағы деректер ағыны пішімін және **Road Runner** `.log` файлдарын нативті қолдауды қамтиды.

FTC үшін бірнеше үшінші тарап журналдау және телеметрия кітапханалары AdvantageScope қолданбасымен үйлесімді форматтарда деректер шығарады. AdvantageScope әзірлеушілері белгілі бір FTC журналдау шешімін мақұлдамайды немесе ұсынбайды; кейбір журналдау шешімдерін пайдаланған кезде шектеулі мүмкіндіктерге тап болуыңыз мүмкін.

Төмендегі тізім бастапқы нүкте болып табылады, бірақ толық емес:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Траекторияны жоспарлау логикасын жөндеуге арналған журнал файлдарын жасайды.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Өзінің бақылау тақтасымен де, AdvantageScope-пен де үйлесімді тікелей телеметрияны таратады.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Журнал файлдары мен нақты уақыттағы таратуды қоса алғанда, бірнеше форматқа арнайы деректерді тіркеуге мүмкіндік береді.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Аннотацияларды пайдаланып деректерді WPILOG пішімінде сақтайды.
- **PsiKit**: AdvantageKit-тен шабыттанған FTC үшін журналдау және қайта ойнату (replay) фреймворкі.

:::warning
Командалар жарыс кезінде R704 ережесіне сәйкестігін қамтамасыз етуі керек. Жарыстарда Wi-Fi арқылы қосылған кезде FTC Dashboard сияқты үшінші тарап телеметрия қызметтеріне тыйым салынады.
:::

### FTC үшін AdvantageScope Lite {#advantagescope-lite-for-ftc}

FTC үшін оңтайландырылған AdvantageScope Lite нұсқасының бейресми дистрибутиві қолжетімді: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Бұл дистрибутив бейресми және AdvantageScope әзірлеушілері тарапынан қолдау көрсетілмейді.

Стандартты [AdvantageScope Lite](/more-features/advantagescope-lite) Systemcore және FIRST Driver Station-да пайдалануға арналған веб-қолданба болса, бейресми FTC дистрибутиві бар FTC басқару жүйесінде тікелей пайдалану үшін арнайы өзгертілген. Ол қосымша бағдарламалық жасақтаманы қажет етпей, FTC Dashboard хаттамасы арқылы нақты уақыттағы деректерді қарауды нативті түрде қолдайды.
