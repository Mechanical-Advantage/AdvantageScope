---
sidebar_position: 1
---

# ✴️ FTC үйлесімділігі {#ftc-compatibility}

AdvantageScope алдағы маусымдарда [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) жүйесіне көшуге дайындық жасай отырып, қазіргі FIRST Tech Challenge басқару жүйесінде де ыңғайлы жұмыс істеуге арналған мүмкіндіктерді қамтиды. 2027–2028 маусымынан бастап Systemcore жүйесіне көшкеннен кейін, FTC жарыстарында AdvantageScope қолданбасының барлық мүмкіндігі ресми түрде қолдау табады.

## Алаңдар және роботтар {#fields-and-robots}

FTC алаңдары мен робот үлгілеріне толыққанды кіріктірілген қолдау көрсетіледі.

- **Алаң және робот үлгілері:** 🗺️ [2D алаңы](/tab-reference/2d-field) және 👀 [3D алаңы](/tab-reference/3d-field) қойындыларындағы ашылмалы мәзірлерден FTC алаңдары мен робот үлгілерін тікелей таңдаңыз. Барлық алаң [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) режимімен үйлесімді.
- **Координаттар жүйелері:** Кез келген алаңда [стандартты FTC координаттарымен](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) үйлесімділік үшін [координаттар жүйесін](/more-features/coordinate-systems) баптаңыз. Бұл координаттар жүйесі FTC алаңдарында әдепкі бойынша қолданылады.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Қолдау көрсетілетін пішімдер {#supported-formats}

AdvantageScope қолданбасында WPILOG және NetworkTables сияқты WPILib-үйлесімді пішімдерге қоса, **FTC Dashboard** тікелей деректер ағыны пішіміне және **Road Runner** `.log` файлдарына кіріктірілген қолдау бар.

Бірнеше үшінші тараптың FTC журналдау және телеметрия кітапханалары AdvantageScope қолданбасымен үйлесімді пішімдерде деректер жасайды. AdvantageScope әзірлеушілері белгілі бір FTC журналдау шешімін бөлек қолдамайды немесе ұсынбайды, ал кейбір шешімдерді пайдаланғанда мүмкіндіктер шектеулі болуы мүмкін.

Төменде бастауға арналған, бірақ толық емес тізім берілген:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Траекторияны жоспарлау логикасын жөндеуге арналған журнал файлдарын жасайды.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Өзінің бақылау тақтасымен де, AdvantageScope қолданбасымен де үйлесімді тікелей телеметрияны таратады.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Журнал файлдары мен тікелей таратуды қоса алғанда, бірнеше пішімде таңдамалы деректерді тіркеуге мүмкіндік береді.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Аннотацияларды пайдаланып деректерді WPILOG пішімінде сақтайды.
- **PsiKit**: AdvantageKit үлгісіне негізделген, FTC жарыстарына арналған журналдау және қайта ойнату (replay) фреймворкі.

:::warning
Командалар жарыс кезінде R704 ережесін сақтауға мұқият болуы керек. Жарыс барысында Wi-Fi желісі арқылы қосылған кезде FTC Dashboard сияқты үшінші тарап телеметрия қызметтерін пайдалануға тыйым салынады.
:::

### FTC үшін AdvantageScope Lite {#advantagescope-lite-for-ftc}

FTC жарыстарына оңтайландырылған [AdvantageScope Lite](/more-features/advantagescope-lite) нұсқасының бейресми дистрибутиві қолжетімді: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Бұл дистрибутив бейресми болып табылады және оған AdvantageScope әзірлеушілері қолдау көрсетпейді.

Стандартты [AdvantageScope Lite](/more-features/advantagescope-lite) нұсқасы Systemcore жүйесінде және FIRST Driver Station бағдарламасында пайдалануға арналған веб-қолданба болса, бейресми FTC дистрибутиві қазіргі FTC басқару жүйесінде тікелей жұмыс істеу үшін арнайы бейімделген. Ол қосымша бағдарламалық жасақтаманы қажет етпей, FTC Dashboard хаттамасы арқылы тікелей деректерді қарауды кіріктірілген түрде қолдайды.
