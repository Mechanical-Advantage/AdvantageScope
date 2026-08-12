---
sidebar_position: 2
---

# Diagnostice Phoenix {#phoenix-diagnostics}

AdvantageScope suportă streaming live al semnalelor de la dispozitivele Phoenix 6 fără **nicio configurare în codul utilizatorului**. Acest lucru permite depanarea și ajustarea ușoară a dispozitivelor Phoenix folosind interfața familiară și întreaga putere a AdvantageScope:

- Opțiuni flexibile de vizualizare, inclusiv suport pentru axe multiple și câmpuri discrete
- Suport complet pentru diagrame bazate pe unități, inclusiv conversie implicită și printr-un singur clic a unităților ([docs](/tab-reference/line-graph/units))
- Previzualizare live a tuturor valorilor în bara laterală pentru o navigare ușoară
- Suport pentru reprezentarea grafică și previzualizarea semnalului de la mai multe dispozitive simultan
- Decodarea valorilor enum ca șiruri lizibile de către om (moduri de control, starea punții, starea magnetului CANcoder etc.)
- Informații tooltip integrate în bara laterală cu descrieri și unități pentru fiecare semnal
- Organizarea ierarhică a semnalelor, grupate după magistrala CAN, dispozitiv și tipul de semnal
- Analiză avansată a datelor cu opțiuni integrate de integrare și diferențiere ([docs](/tab-reference/line-graph/#adjusting-axes))

:::tip
Pentru a vă conecta, selectați „Diagnostice Phoenix” când vă conectați la robot sau simulator din bara de meniu.
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="Captură de ecran cu graficul liniar" />

Fila 📊 [Statistici](/tab-reference/statistics) a AdvantageScope permite de asemenea o analiză avansată a semnalelor Phoenix, cu suport pentru histograme, intervale personalizate și câmpuri derivate pentru măsurători ale erorilor relative și absolute:

<img src="/img/overview/live-sources/phoenix-2.webp" alt="Captură de ecran cu statistici" />

:::note
Această caracteristică poate întâmpina ocazional probleme ca urmare a actualizărilor Phoenix. Vă recomandăm să utilizați cea mai recentă versiune de AdvantageScope pentru a minimiza problemele. În caz contrar, vă rugăm să [deschideți o problemă](https://github.com/Mechanical-Advantage/AdvantageScope/issues) pentru a ne anunța despre eventualele probleme.
:::
