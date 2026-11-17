---
sidebar_position: 5
---

# ⏱️ Marcaje de timp {#timestamps}

AdvantageScope îți permite să personalizezi modul de afișare a marcajelor de timp în toate vizualizările, inclusiv pe axa timpului, în 📉 [Grafic liniar](/tab-reference/line-graph), 🔢 [Tabel](/tab-reference/table) și 💬 [Consolă](/tab-reference/console).

## Moduri de afișare {#display-modes}

Poți configura modul de afișare a marcajelor de timp din fereastra de preferințe:

- **Începe de la zero (implicit):** Decalează toate marcajele de timp astfel încât primele date din log să înceapă de la zero (`+0.0s`). Marcajele de timp afișate în acest mod au prefixul `+` pentru a indica timpul scurs de la începutul înregistrării.
- **Original:** Afișează marcajele de timp cu valorile lor numerice originale din fișierul log, exact așa cum sunt folosite în codul robotului.

:::info
Începând cu WPILib 2027, marcajele de timp sunt măsurate de la pornirea dispozitivului (boot) pe Systemcore și în simulare. Deoarece valorile brute pot porni de la numere arbitrare mari, opțiunea **Începe de la zero** oferă o vizualizare mult mai intuitivă.
:::

## Sincronizarea mai multor log-uri {#multi-log-synchronization}

Când [deschizi mai multe fișiere log simultan](/overview/log-files/#opening-logs), AdvantageScope le sincronizează și le aliniază marcajele de timp. În modul **Începe de la zero**, punctul zero este setat la cel mai timpuriu marcaj de timp din toate fișierele încărcate. În modul **Original**, marcajele de timp folosesc baza de timp a primului log deschis, iar celelalte loguri sunt decalate pentru a se alinia cu acesta.

## Personalizare {#customization}

Pentru a schimba modul de afișare a marcajelor de timp, deschide fereastra de preferințe din `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS), ori apasă `Ctrl+,` / `Cmd+,`. Schimbă setarea **Marcaje de timp** la opțiunea dorită.

<img src="/img/prefs_ro.webp" alt="Diagrama preferințelor" height="450" />
