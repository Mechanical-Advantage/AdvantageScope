# 📉 Grafic liniar {#line-graph}

Graficul liniar este vizualizarea implicită în AdvantageScope și suportă atât câmpuri continue (numerice), cât și câmpuri discrete.

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="Demonstrație grafic liniar" />

_Interfața în limba engleză este ilustrată mai sus._

## Panoul de vizualizare {#viewer-pane}

Pentru a mări, plasează cursorul peste graficul principal și derulează în sus sau în jos. Poți selecta un interval și prin clic și tragere în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe grafic. Când ești conectat live, derularea spre stânga deblochează redarea de la timpul curent, iar derularea până la capăt în dreapta o blochează din nou la timpul curent.

Dacă dai clic pe grafic, selectezi un moment de timp, iar cu clic dreapta îl deselectezi. Valoarea fiecărui câmp la acel moment este afișată în legendă. Timpul selectat este sincronizat în toate filele, astfel încât să poți găsi rapid același moment și în alte vizualizări.

:::tip
Diferența (delta) dintre timpul selectat și cel peste care ții cursorul este afișată direct pe grafic, ca să poți măsura ușor intervalele de timp. Marcajele de timp sunt formatate conform preferinței [Marcaje de timp](/more-features/timestamps).
:::

## Panoul de control {#control-pane}

Pentru a începe, trage un câmp într-una dintre cele trei secțiuni (axa stângă, axa dreaptă sau câmpuri discrete). Șterge un câmp folosind butonul X sau ascunde-l temporar dând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate câmpurile, dă clic pe cele trei puncte de lângă titlul axei și apoi pe `Șterge tot`. Poți reorganiza câmpurile în listă prin clic și tragere.

Poți personaliza culoarea și stilul liniei fiecărui câmp dând clic pe pictograma colorată sau clic dreapta pe numele câmpului. De asemenea, poți vizualiza datele din API-ul WPILib pentru [alerte persistente](https://docs.wpilib.org/en/latest/docs/software/telemetry/persistent-alerts.html) adăugând grupul de alerte ca câmp discret. Mai jos este prezentat un exemplu de vizualizare.

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="Vizualizare alerte" />

:::tip
Pentru a suprapune modul robotului (autonom, teleoperat sau utilitar), dă clic pe cele trei puncte de lângă „Câmpuri discrete” și selectează `Afișează modul robotului`.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Suprapunere mod robot" />

_Interfața în limba engleză este ilustrată mai sus._
:::

### Ajustarea axelor {#adjusting-axes}

În mod implicit, fiecare axă își ajustează intervalul în funcție de datele vizibile. Pentru a dezactiva ajustarea automată și a bloca intervalul la valorile curente minimă și maximă, dă clic pe cele trei puncte de lângă titlul axei și apoi pe `Blochează axa`. Pentru a ajusta manual intervalul, alege `Editează intervalul` și introdu valorile dorite.

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="Editarea intervalului axei" height="250" />

_Interfața în limba engleză este ilustrată mai sus._

### Integrare și diferențiere {#integration-and-differentiation}

AdvantageScope poate integra sau diferenția automat valorile. Timpul delta este măsurat întotdeauna în secunde. Dă clic pe cele trei puncte de lângă titlul axei și selectează `Diferențiază` sau `Integrează`.

:::info
Derivatele sunt calculate folosind [diferența finită](https://ro.wikipedia.org/wiki/Diferen%C8%9B%C4%83_finit%C4%83) a eșantioanelor adiacente. Integralele sunt calculate folosind [integrarea trapezoidală](https://en.wikipedia.org/wiki/Trapezoidal_rule).
:::
