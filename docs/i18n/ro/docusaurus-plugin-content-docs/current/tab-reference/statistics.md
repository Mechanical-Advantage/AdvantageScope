---
sidebar_position: 6
---

# 📊 Statistici

Fila statistici permite analiza statistică aprofundată a câmpurilor numerice, analizând tendințele generale mai degrabă decât modificările în timp. Câmpurile selectate sunt analizate folosind o histogramă și o varietate de măsurători statistice standard.

<img src="/img/tab-reference/statistics-1.png" alt="Overview of statistics tab" />

## Panoul de control

Pentru a începe, trageți un câmp în secțiunea „Măsurători”. Ștergeți un câmp folosind butonul X sau ascundeți-l temporar dând clic pe pictograma ochi sau dând dublu clic pe numele câmpului. Pentru a elimina toate câmpurile, dați clic pe cele trei puncte de lângă titlul axei și apoi pe `Șterge tot`. Câmpurile pot fi reorganizate în listă prin clic și tragere.

Pentru a analiza diferența dintre câmpuri, comutați un câmp în modul „Referință” și adăugați alte câmpuri ca obiecte copil. Obiectele copil pot fi comutate între modurile „Eroare relativă” și „Eroare absolută”.

:::info
Culoarea fiecărui câmp poate fi personalizată dând clic pe pictograma colorată sau dând clic dreapta pe numele câmpului.
:::

### Configurare

Opțiunea **Interval de timp** selectează ce părți din log sunt utilizate pentru analiză:

- _Interval vizibil:_ Analizează intervalul de timp vizibil pe cronologie.
- _Log complet:_ Analizează intervalul complet al fișierului log.
- _Activat:_ Analizează intervalele de timp în care robotul este activat.
- _Auto:_ Analizează intervalele de timp în care robotul este în modul autonom.
- _Teleop:_ Analizează intervalele de timp în care robotul este în modul teleoperat.
- _Live: 30 de secunde:_ Analizează cele mai recente 30 de secunde (când sunteți conectat la o sursă live).
- _Live: 10 secunde:_ Analizează cele mai recente 10 secunde (când sunteți conectat la o sursă live).

Opțiunea **Interval date** selectează valorile minimă și maximă de afișat pe histogramă. Datele din afara acestui interval nu sunt afișate, dar continuă să fie utilizate pentru măsurătorile statistice.

Opțiunea **Dimensiune pas** selectează dimensiunea fiecărei categorii (bin) din histogramă. Valorile mai mici produc grafice mai detaliate, dar dezvăluie și mai mult zgomot.

## Panoul de vizualizare

### Histograma

Histograma afișează numărul de eșantioane care se încadrează în fiecare categorie (bin), în cadrul intervalului specificat. Rețineți că datele din afara intervalului specificat sunt eliminate (mai degrabă decât grupate într-o categorie separată).

### Măsurători statistice

Tabelul de măsurători statistice afișează valorile calculate pentru fiecare măsurătoare a câmpurilor furnizate. Mai multe informații despre fiecare măsurătoare sunt furnizate mai jos.

#### Rezumat

- **Număr:** Numărul de eșantioane discrete generate.
- **Min:** Cea mai mică valoare din date.
- **Max:** Cea mai mare valoare din date.

#### Centru

- [**Medie:**](https://ro.wikipedia.org/wiki/Medie_aritmetic%C4%83) Media aritmetică (media simplă) a datelor.
- [**Mediană:**](<https://ro.wikipedia.org/wiki/Median%C4%83_(statistic%C4%83)>) Valoarea din „mijloc” a datelor, sau percentila 50%.
- [**Mod:**](<https://en.wikipedia.org/wiki/Mode_(statistics)>) Cea mai frecventă valoare din date.
- [**Medie geometrică:**](https://ro.wikipedia.org/wiki/Medie_geometric%C4%83) O măsurătoare a centrului calculată folosind produsul valorilor mai degrabă decât suma. Aplicabilă la măsurarea _ratelor de creștere exponențială_ (cum ar fi procentul de modificare între cicluri).
- [**Medie armonică:**](https://ro.wikipedia.org/wiki/Medie_armonic%C4%83) O măsurătoare a centrului calculată folosind suma inverselor valorilor. Aplicabilă la măsurarea _ratelor sau vitezelor_.
- [**Medie pătratică:**](https://ro.wikipedia.org/wiki/Medie_p%C4%83tratic%C4%83) O măsurătoare a centrului calculată folosind pătratele valorilor. Aplicabilă la măsurarea datelor cu _valori atât pozitive, cât și negative_, cum ar fi mișcarea periodică.

#### Răspândire

- [**Deviație standard:**](https://ro.wikipedia.org/wiki/Abatere_standard) Cea mai comună măsurătoare statistică a variației, unde o valoare mai mică indică o variație mai mică. 68% din date se încadrează în limita unei deviații standard față de medie.
- [**Deviație absolută medie:**](https://en.wikipedia.org/wiki/Average_absolute_deviation) Distanța medie dintre fiecare valoare și medie. Aceasta este o alternativă la deviația standard.
- [**Interval intercuartilic:**](https://ro.wikipedia.org/wiki/Interval_intercuartilic) Diferența dintre cuartila a treia și prima cuartilă (percentila 75 și percentila 25), mai puțin afectată de valorile aberante (outliers) decât deviația standard sau deviația absolută medie.
- [**Asimetrie:**](https://ro.wikipedia.org/wiki/Asimetrie_statistic%C4%83) O măsurătoare a asimetriei datelor. O valoare negativă indică o coadă spre stânga, o valoare pozitivă indică o coadă spre dreapta, iar o valoare zero sugerează o distribuție simetrică.

#### Percentile

[Percentilele](https://en.wikipedia.org/wiki/Percentile) măsoară valorile sub care se încadrează procentul dat din celelalte valori. De exemplu, 10% din valori se încadrează sub percentila 10. Următoarele percentile sunt de asemenea cunoscute ca:

- Percentila 25 = prima cuartilă (Q1)
- Percentila 50 = a doua cuartilă (Q2) = mediana
- Percentila 75 = a treia cuartilă (Q3)
