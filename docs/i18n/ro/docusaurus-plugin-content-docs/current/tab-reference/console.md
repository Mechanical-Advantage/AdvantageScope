---
sidebar_position: 5
---

# 💬 Consolă {#console}

Vizualizarea de consolă este concepută pentru a afișa un singur câmp de tip șir de caractere (string) cu date de consolă. Mai jos găsești câteva câmpuri sugerate:

- **DS:/Dscomm/Console** - Salvat de FIRST Driver Station.
- **messages** - Salvat de sistemul de logging integrat din WPILib pe baza apelurilor la metoda [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Salvat automat de AdvantageKit în timpul funcționării robotului (folosește `System.out.println` ca de obicei).
- **/ReplayOutputs/Console** - Salvat automat de AdvantageKit în timpul reluării logului (folosește `System.out.println` ca de obicei).

Trage câmpul dorit în vizualizarea principală pentru a începe. Fiecare rând reprezintă o actualizare a câmpului. Pentru logurile WPILib, se creează un rând nou pentru fiecare linie salvată. Pentru logurile AdvantageKit, se creează un rând nou pentru fiecare ciclu de buclă.

<img src="/img/tab-reference/console-1.webp" alt="Vizualizare consolă" />

_Mai sus este prezentată interfața în limba engleză._

:::info
Fă clic pe pictograma paletă de culori pentru a activa sau dezactiva evidențierea mesajelor de avertisment și eroare. Pentru logurile WPILib și AdvantageKit, mesajele sunt evidențiate dacă conțin textul „warning” sau „error”.
:::

Controalele sunt similare cu cele din fila 🔢 [Tabel](../tab-reference/table). Momentul selectat este sincronizat în toate filele. Fă clic pe un rând pentru a-l selecta sau treci cu cursorul peste el pentru a-l previzualiza în orice ferestre pop-up vizibile. Fă clic pe butonul ↓ pentru a sări la momentul selectat (sau la momentul introdus în casetă). Marcajele de timp și valorile de salt sunt formatate conform preferinței [Marcaje de timp](/more-features/timestamps).

Introdu text în câmpul „Filtru” pentru a afișa doar rândurile care conțin textul respectiv. Apasă `Ctrl+F` pentru a selecta rapid câmpul „Filtru”. Adaugă un „!” la începutul textului de filtrare pentru a _exclude_ mesajele care se potrivesc din vizualizarea principală.

## Formatare ANSI {#ansi-formatting}

Consola suportă coduri de formatare și culori prin secvențe escape ANSI standard:

- **Stiluri de text:** Îngroșat (bold), estompat (dim), cursiv (italic) și subliniat (underline)
- **Culori de prim-plan și fundal:** 16 culori standard (normale și cu intensitate ridicată)
- **Culori pe 8 biți și 24 de biți:** Paletă de 256 de culori și RGB pe 24 de biți
- **Resetări selective:** Resetarea anumitor stiluri sau culori, păstrându-le pe celelalte

:::tip
Fă clic pe pictograma de salvare pentru a exporta datele din consolă într-un fișier text.
:::
