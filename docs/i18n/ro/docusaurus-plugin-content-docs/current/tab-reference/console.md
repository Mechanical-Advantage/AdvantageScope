---
sidebar_position: 5
---

# 💬 Consolă {#console}

Vizualizarea de consolă este concepută pentru a vizualiza un singur câmp de tip șir de caractere (string) cu date de consolă. Câteva câmpuri sugerate sunt enumerate mai jos.

- **DS:/Dscomm/Console** - Salvat de FIRST Driver Station.
- **messages** - Salvat de înregistrarea integrată din WPILib pe baza apelurilor la metoda [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Salvat automat de AdvantageKit în timpul funcționării robotului (utilizați `System.out.println` ca de obicei).
- **/ReplayOutputs/Console** - Salvat automat de AdvantageKit în timpul reluării logului (utilizați `System.out.println` ca de obicei).

Trageți câmpul dorit în vizualizarea principală pentru a începe. Fiecare rând reprezintă o actualizare a câmpului. Pentru logurile WPILib, este creat un rând nou pentru fiecare linie salvată. Pentru logurile AdvantageKit, este creat un rând nou pentru fiecare ciclu de buclă.

<img src="/img/tab-reference/console-1.webp" alt="Vizualizare consolă" />

:::info
Dați clic pe pictograma paletă de culori pentru a comuta evidențierea mesajelor de avertisment și eroare. Pentru logurile WPILib și AdvantageKit, mesajele sunt evidențiate dacă conțin textul „warning” sau „error”.
:::

Controalele sunt similare cu cele de pe fila 🔢 [Tabel](../tab-reference/table). Timpul selectat este sincronizat în toate filele. Dați clic pe un rând pentru a-l selecta sau treceți cu cursorul peste un rând pentru a-l previzualiza în orice ferestre pop-up vizibile. Dând clic pe butonul ↓ se trece la timpul selectat (sau timpul introdus în casetă).

Introduceți text în câmpul de intrare „Filtru” pentru a afișa doar rândurile care conțin textul de filtrare. Apăsați `Ctrl+F` pentru a selecta rapid câmpul de intrare „Filtru”. Adăugați un „!” la începutul textului de filtrare pentru a _exclude_ mesajele care se potrivesc din vizualizarea principală.

:::tip
Dați clic pe pictograma de salvare pentru a exporta datele de consolă într-un fișier text.
:::
