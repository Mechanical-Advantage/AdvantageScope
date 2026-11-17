---
sidebar_position: 6
---

# 📊 Statistici {#statistics}

Fila statistici îți oferă o analiză statistică detaliată a câmpurilor numerice, concentrându-se pe tendințele generale, nu pe evoluția în timp. Câmpurile selectate sunt analizate cu ajutorul unei histograme și al unor indicatori statistici standard.

<img src="/img/tab-reference/statistics-1.webp" alt="Prezentare generală a filei statistici" />

_Mai sus este prezentată interfața în limba engleză._

## Panoul de control {#control-pane}

Pentru a începe, trage un câmp în secțiunea „Măsurători”. Șterge un câmp folosind butonul X sau ascunde-l temporar dând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate câmpurile, dă clic pe coșul de gunoi de lângă titlul secțiunii și apoi pe `Șterge tot`. Poți reorganiza câmpurile în listă prin clic și tragere.

Pentru a analiza diferența dintre câmpuri, comută un câmp în modul „Referință” și adaugă alte câmpuri ca elemente copil. Elementele copil pot fi comutate între modurile „Eroare relativă” și „Eroare absolută”.

:::info
Poți personaliza culoarea fiecărui câmp dând clic pe pictograma colorată sau clic dreapta pe numele câmpului.
:::

### Configurare {#configuration}

Opțiunea **Interval de timp** selectează ce părți din log sunt folosite pentru analiză:

- _Interval vizibil:_ Analizează intervalul de timp vizibil pe cronologie.
- _Log complet:_ Analizează întregul interval al fișierului log.
- _Activat:_ Analizează intervalele de timp în care robotul este activat.
- _Auto:_ Analizează intervalele de timp în care robotul este în modul autonom.
- _Teleop:_ Analizează intervalele de timp în care robotul este în modul teleoperat.
- _Live: 30 de secunde:_ Analizează cele mai recente 30 de secunde (când ești conectat la o sursă live).
- _Live: 10 secunde:_ Analizează cele mai recente 10 secunde (când ești conectat la o sursă live).

Opțiunea **Interval date** stabilește valorile minimă și maximă afișate pe histogramă. Datele din afara acestui interval nu sunt afișate, dar continuă să fie incluse în calculul indicatorilor statistici.

Opțiunea **Dimensiune pas** stabilește dimensiunea fiecărei categorii (bin) din histogramă. Valorile mai mici produc grafice mai detaliate, dar scot la iveală și mai mult zgomot.

## Panoul de vizualizare {#viewer-pane}

### Histograma {#histogram}

Histograma arată numărul de eșantioane care intră în fiecare categorie (bin), în cadrul intervalului specificat. Reține că datele din afara acestui interval sunt eliminate (nu sunt grupate într-o categorie separată).

### Măsurători statistice {#statistical-measures}

Tabelul de măsurători statistice afișează valorile calculate pentru fiecare indicator al câmpurilor selectate. Mai jos găsești detalii despre fiecare măsurătoare.

#### Rezumat {#summary}

- **Număr:** Numărul de eșantioane discrete generate.
- **Min:** Cea mai mică valoare din date.
- **Max:** Cea mai mare valoare din date.

#### Centru {#center}

- [**Medie:**](https://ro.wikipedia.org/wiki/Medie_aritmetic%C4%83) Media aritmetică (media simplă) a datelor.
- [**Mediană:**](<https://ro.wikipedia.org/wiki/Median%C4%83_(statistic%C4%83)>) Valoarea din „mijloc” a datelor, adică percentila 50%.
- [**Mod:**](<https://en.wikipedia.org/wiki/Mode_(statistics)>) Cea mai frecventă valoare din date.
- [**Medie geometrică:**](https://ro.wikipedia.org/wiki/Medie_geometric%C4%83) O măsurătoare a centrului calculată pe baza produsului valorilor, în loc de sumă. Este utilă când măsori _rate de creștere exponențială_ (cum ar fi modificarea procentuală între cicluri).
- [**Medie armonică:**](https://ro.wikipedia.org/wiki/Medie_armonic%C4%83) O măsurătoare a centrului calculată folosind suma inverselor valorilor. Este utilă când măsori _rate sau viteze_.
- [**Medie pătratică:**](https://ro.wikipedia.org/wiki/Medie_p%C4%83tratic%C4%83) O măsurătoare a centrului calculată folosind pătratele valorilor. Este utilă când măsori date cu _valori atât pozitive, cât și negative_, cum ar fi o mișcare periodică.

#### Răspândire {#spread}

- [**Deviație standard:**](https://ro.wikipedia.org/wiki/Abatere_standard) Cea mai comună măsurătoare statistică a variației, unde o valoare mai mică indică o variație mai mică. Pentru date distribuite normal, aproximativ 68% din valori se încadrează în limita unei deviații standard față de medie.
- [**Deviație absolută mediană:**](https://en.wikipedia.org/wiki/Median_absolute_deviation) Mediana deviațiilor absolute față de mediana datelor. Este o măsurătoare a dispersiei statistice mai rezistentă la valorile aberante (outliers) decât deviația standard.
- [**Interval intercuartilic:**](https://ro.wikipedia.org/wiki/Interval_intercuartilic) Diferența dintre cuartila a treia și prima cuartilă (percentila 75 și percentila 25), mai puțin afectată de valorile aberante decât deviația standard.
- [**Asimetrie:**](https://ro.wikipedia.org/wiki/Asimetrie_statistic%C4%83) O măsurătoare a asimetriei datelor. O valoare negativă indică o coadă spre stânga, o valoare pozitivă indică o coadă spre dreapta, iar valoarea zero sugerează o distribuție simetrică.

#### Percentile {#percentiles}

[Percentilele](https://en.wikipedia.org/wiki/Percentile) măsoară valorile sub care se află un anumit procent din restul datelor. De exemplu, 10% din valori se află sub percentila 10. Următoarele percentile mai sunt cunoscute și ca:

- Percentila 25 = prima cuartilă (Q1)
- Percentila 50 = a doua cuartilă (Q2) = mediana
- Percentila 75 = a treia cuartilă (Q3)
