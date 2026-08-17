---
sidebar_position: 5
---

# ⏱️ Marcaje de timp {#timestamps}

AdvantageScope acceptă opțiuni personalizabile de afișare a marcajelor de timp în toate vizualizările, inclusiv pe axa timpului, în 📉 [Grafic liniar](/tab-reference/line-graph), 🔢 [Tabel](/tab-reference/table) și 💬 [Consolă](/tab-reference/console).

## Moduri de afișare {#display-modes}

Modul de afișare a marcajelor de timp poate fi configurat în fereastra de preferințe:

- **Începe de la zero (Implicit):** Decalează toate marcajele de timp astfel încât primele date din log să înceapă de la zero (`+0.0s`). Marcajele de timp afișate în acest mod sunt prefixate cu un simbol `+` pentru a indica timpul scurs de la începutul datelor.
- **Original:** Afișează marcajele de timp folosind valorile lor numerice originale așa cum au fost înregistrate în fișierul log, potrivindu-se cu valorile exacte utilizate de codul robotului.

:::info
Începând cu WPILib 2027, marcajele de timp sunt măsurate folosind timpul de la pornirea dispozitivului (boot) pe Systemcore și în simulare. Deoarece marcajele de timp brute pot începe de la numere mari arbitrare, **Începe de la zero** este oferit ca o opțiune de vizualizare mai intuitivă.
:::

## Sincronizarea mai multor log-uri {#multi-log-synchronization}

Când [sunt deschise mai multe fișiere log simultan](/overview/log-files/#opening-logs), AdvantageScope sincronizează și aliniază marcajele lor de timp. În modul **Începe de la zero**, punctul zero este setat la cel mai vechi marcaj de timp din toate fișierele încărcate. În modul **Original**, marcajele de timp sunt afișate folosind baza de timp a primului log deschis, orice log-uri suplimentare fiind deplasate pentru a se alinia cu acesta.

## Personalizare {#customization}

Pentru a schimba modul de afișare a marcajelor de timp, deschide fereastra de preferințe făcând clic pe `App` > `Arată preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS), sau apăsând `Ctrl+,` / `Cmd+,`. Actualizează setarea **Marcaje de timp** la opțiunea dorită.

<img src="/img/prefs_ro.webp" alt="Diagrama preferințelor" height="350" />
