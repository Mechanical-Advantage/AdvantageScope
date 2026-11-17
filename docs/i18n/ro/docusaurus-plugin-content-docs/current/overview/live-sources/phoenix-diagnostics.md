---
sidebar_position: 2
---

# Diagnostice Phoenix {#phoenix-diagnostics}

AdvantageScope suportă streaming live al semnalelor de la dispozitivele Phoenix 6 fără **nicio configurare în codul utilizatorului**. Acest lucru permite depanarea și ajustarea ușoară a dispozitivelor Phoenix folosind interfața familiară și întreaga putere a AdvantageScope:

- Opțiuni flexibile de vizualizare, inclusiv suport pentru tabele și analiză statistică
- Suport complet pentru grafice bazate pe unități, inclusiv conversie implicită și printr-un singur clic a unităților ([documentație](/tab-reference/line-graph/units))
- Decodarea valorilor enum ca șiruri lizibile (moduri de control, starea punții, starea magnetului CANcoder etc.)
- Tooltip-uri integrate în bara laterală cu descrieri și unități pentru fiecare semnal
- Organizarea ierarhică a semnalelor, grupate după magistrala CAN, dispozitiv și tipul de semnal
- Analiză avansată a datelor cu opțiuni integrate de integrare și diferențiere ([documentație](/tab-reference/line-graph/#adjusting-axes))

:::tip
Pentru a te conecta, selectează „Diagnostice Phoenix” când te conectezi la robot sau simulator din bara de meniu.
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="Captură de ecran cu graficul liniar" />

Fila 📊 [Statistici](/tab-reference/statistics) din AdvantageScope permite, de asemenea, o analiză avansată a semnalelor Phoenix, cu suport pentru histograme, intervale personalizate și câmpuri derivate pentru măsurarea erorilor relative și absolute:

<img src="/img/overview/live-sources/phoenix-2.webp" alt="Captură de ecran cu statistici" />

_Interfața în limba engleză este ilustrată mai sus._

:::note
Această funcționalitate poate întâmpina ocazional probleme în urma actualizărilor Phoenix. Îți recomandăm să folosești cea mai recentă versiune de AdvantageScope pentru a minimiza problemele. În caz contrar, [deschide o problemă (issue)](https://github.com/Mechanical-Advantage/AdvantageScope/issues) pentru a ne anunța despre eventualele erori.
:::
