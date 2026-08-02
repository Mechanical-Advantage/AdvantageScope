# 📉 Grafic liniar {#line-graph}

Graficul liniar este vizualizarea implicită în AdvantageScope. Acesta suportă atât câmpuri continue (numerice), cât și câmpuri discrete.

<img src="/img/tab-reference/line-graph/line-graph-1.png" alt="Line graph demo" />

## Panoul de vizualizare {#viewer-pane}

Pentru a mări, plasați cursorul peste graficul principal și derulați în sus sau în jos. Un interval poate fi de asemenea selectat prin clic și tragere în timp ce țineți apăsată tasta `Shift`. Mutați-vă la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe grafic. Când sunteți conectat live, derularea spre stânga deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent.

Dând clic pe grafic se selectează un timp, iar dând clic dreapta se deselectează. Valoarea fiecărui câmp la acel timp este afișată în legendă. Timpul selectat este sincronizat în toate filele, făcând ușoară găsirea rapidă a acestei locații în alte vizualizări.

:::tip
Diferența (delta) dintre timpul selectat și timpul survolat este afișată ca o suprapunere pe grafic, făcând ușoară măsurarea intervalelor de timp.
:::

## Panoul de control {#control-pane}

Pentru a începe, trageți un câmp într-una dintre cele trei secțiuni (stânga, dreapta sau discret). Ștergeți un câmp folosind butonul X sau ascundeți-l temporar dând clic pe pictograma ochi sau dând dublu clic pe numele câmpului. Pentru a elimina toate câmpurile, dați clic pe cele trei puncte de lângă titlul axei și apoi pe `Șterge tot`. Câmpurile pot fi reorganizate în listă prin clic și tragere.

Culoarea și stilul liniei fiecărui câmp pot fi personalizate dând clic pe pictograma colorată sau dând clic dreapta pe numele câmpului. Datele din API-ul de [alerte persistente](https://docs.wpilib.org/en/latest/docs/software/telemetry/persistent-alerts.html) al WPILib pot fi vizualizate adăugând grupul de alerte ca un câmp discret. Un exemplu de vizualizare este prezentat mai jos.

<img src="/img/tab-reference/line-graph/line-graph-2.png" alt="Alerts visualization" />

:::tip
Pentru a suprapune modul robotului (autonom, teleoperat sau utilitar), dați clic pe cele trei puncte de lângă „Câmpuri discrete” și dați clic pe „Afișează modul robotului”.

<img src="/img/tab-reference/line-graph/line-graph-3.png" alt="Robot mode overlay" />
:::

### Ajustarea axelor {#adjusting-axes}

În mod implicit, fiecare axă își ajustează intervalul pe baza datelor vizibile. Pentru a dezactiva ajustarea automată și a bloca intervalul la valorile curente minimă și maximă, dați clic pe cele trei puncte de lângă titlul axei și apoi pe `Blochează axa`. Pentru a ajusta manual intervalul, alegeți `Editează intervalul...` și introduceți valorile dorite.

<img src="/img/tab-reference/line-graph/line-graph-4.png" alt="Editing axis range" height="250" />

### Integrare și diferențiere {#integration-and-differentiation}

Valorile pot fi integrate sau diferențiate automat de AdvantageScope. Timpul delta este măsurat întotdeauna în secunde. Dați clic pe cele trei puncte de lângă titlul axei și apoi selectați `Diferențiază` sau `Integrează`.

:::info
Derivatele sunt calculate folosind [diferența finită](https://ro.wikipedia.org/wiki/Diferen%C8%9B%C4%83_finit%C4%83) a eșantioanelor adiacente. Integralele sunt calculate folosind [integrarea trapezoidală](https://en.wikipedia.org/wiki/Trapezoidal_rule).
:::
