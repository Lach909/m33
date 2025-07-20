// main.js

function allowOnlyNumbersAndComma(e) {
  const allowedKeys = [
    "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"
  ];
  if (
    (e.ctrlKey || e.metaKey) &&
    ["a", "c", "v", "x", "A", "C", "V", "X"].includes(e.key)
  ) return;
  if (
    (e.key >= "0" && e.key <= "9") ||
    e.key === "," ||
    e.key === "." ||
    allowedKeys.includes(e.key)
  ) return;
  e.preventDefault();
}

function formatInputToTwoDecimals(input) {
  let val = input.value.replace(/\s/g, '').replace(',', '.');
  let num = parseFloat(val);
  if (!isNaN(num)) {
    input.value = num.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
  } else {
    input.value = "0,00";
  }
}

// NOWOŚĆ: Formatowanie na 1 miejsce po przecinku i procent dla marży
function formatInputToPercentOneDecimal(input) {
  let val = input.value.replace('%','').replace(/\s/g, '').replace(',', '.');
  let num = parseFloat(val);
  if (!isNaN(num)) {
    input.value = num.toLocaleString("pl-PL", {minimumFractionDigits: 1, maximumFractionDigits: 1}) + " %";
  } else {
    input.value = "0,0 %";
  }
}

// Dodaje eventy tylko raz do każdego inputa liczbowego
function setupNumericInput(input) {
  if (input._numericSetup) return;
  input._numericSetup = true;
  input._wasCleared = false;

  input.addEventListener("focus", function () {
    if (!this._wasCleared) {
      this.value = "";
      this._wasCleared = true;
    }
  });
  input.addEventListener("keydown", allowOnlyNumbersAndComma);
  input.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9,\.]/g, "");
  });
  // Formatowanie tylko na blur!
  input.addEventListener("blur", function () {
    formatInputToTwoDecimals(this);
    this._wasCleared = false;
  });
}

// NOWOŚĆ: Dodaje eventy do inputów marża – tylko procent 1 miejsce po przecinku
// I ograniczenie do max 100
function setupMarzaInput(input) {
  if (input._marzaSetup) return;
  input._marzaSetup = true;
  input._wasCleared = false;

  input.addEventListener("focus", function () {
    if (!this._wasCleared) {
      this.value = "";
      this._wasCleared = true;
    }
  });
  input.addEventListener("keydown", allowOnlyNumbersAndComma);
  input.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9,\.]/g, "");
    // Sprawdzenie ograniczenia na bieżąco
    let val = this.value.replace('%','').replace(/\s/g, '').replace(',', '.');
    let num = parseFloat(val);
    if (!isNaN(num) && num > 100) {
      this.value = "100";
    }
  });
  input.addEventListener("blur", function () {
    // Ograniczenie po blur
    let val = this.value.replace('%','').replace(/\s/g, '').replace(',', '.');
    let num = parseFloat(val);
    if (!isNaN(num) && num > 100) {
      num = 100;
    }
    if (!isNaN(num)) {
      this.value = num.toLocaleString("pl-PL", {minimumFractionDigits: 1, maximumFractionDigits: 1}) + " %";
    } else {
      this.value = "0,0 %";
    }
    this._wasCleared = false;
  });
}

function setupAllNumericInputsInTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.querySelectorAll("td:not(:first-child) input[data-numeric='true'], th:not(:first-child) input[data-numeric='true']").forEach(setupNumericInput);
}

// NOWOŚĆ: Dodaje eventy do wszystkich inputów marża w sekcji 3
function setupAllMarzaInputs() {
  document.querySelectorAll("#myTable2 .marza-cell").forEach(setupMarzaInput);
}

// USTAWIANIE WARTOŚCI POCZĄTKOWEJ 10 DLA MARŻY W SEKCJI 3 + nagłówki sekcji 4
document.addEventListener("DOMContentLoaded", function() {
    // Ustaw wartość początkową "10" dla wszystkich inputów marża w sekcji 3, jeśli puste lub 0
    document.querySelectorAll("#myTable2 .marza-cell").forEach(function(input) {
        if (!input.value || input.value === "0,0 %" || input.value === "0") {
            input.value = "10";
        }
    });

    // Zmiana nagłówka w tabeli sekcji 4 kolumna 4 na taki sam jak w sekcji 3 kolumna 4
    const sekcja3Naglowek = document.getElementById('myTable2')?.rows[0]?.cells[3]?.innerText;
    if (sekcja3Naglowek) {
        const myTable3 = document.getElementById('myTable3');
        if (myTable3 && myTable3.rows[0] && myTable3.rows[0].cells[3]) {
            myTable3.rows[0].cells[3].innerText = sekcja3Naglowek;
        }
    }

    // Zmiana nagłówka w tabeli sekcji 4 kolumna 5 na "Struktura"
    const myTable3 = document.getElementById('myTable3');
    if (myTable3 && myTable3.rows[0] && myTable3.rows[0].cells[4]) {
        myTable3.rows[0].cells[4].innerText = "Struktura";
    }

    // ------ JEDYNA POPRAWKA ------
    // Sekcja 2 (myTable2), kolumna 2 readonly
    const sekcja2 = document.getElementById('myTable2');
    if (sekcja2) {
        for (let i = 1; i < sekcja2.rows.length - 1; i++) {
            const row = sekcja2.rows[i];
            const input = row.cells[1]?.querySelector('input');
            if (input) {
                input.readOnly = true;
                input.classList.add("readonly-output");
            }
        }
    }
    // ------ KONIEC POPRAWKI ------
});

document.addEventListener("DOMContentLoaded", () => {
  setupAllNumericInputsInTable("myTable");
  setupAllNumericInputsInTable("myTable2");
  setupAllMarzaInputs();

  // Dodane: logika liczenia STRUKTURY w sekcji 3 (kolumna 5)
  function calcStrukturaSekcja3() {
    const table = document.getElementById("myTable2");
    if (!table) return;
    // wiersze 1,2,3 = produkty, materiały, usługi, kolumna 2 = index 1, kolumna 5 = index 4
    let suma = 0;
    for (let i = 1; i <= 3; i++) {
      let val = table.rows[i].cells[1].querySelector('input').value.replace(/\s/g, '').replace(',', '.');
      suma += parseFloat(val) || 0;
    }
    for (let i = 1; i <= 3; i++) {
      let val = table.rows[i].cells[1].querySelector('input').value.replace(/\s/g, '').replace(',', '.');
      let result = 0;
      if (suma > 0) {
        result = (parseFloat(val) || 0) / suma;
      }
      table.rows[i].cells[4].querySelector('input').value = result.toLocaleString("pl-PL", {style:"percent", minimumFractionDigits:2, maximumFractionDigits:2});
    }
  }
  // Wywołuj dla sekcji 3 po input
  document.getElementById("myTable2").addEventListener("input", calcStrukturaSekcja3);
  // Początkowe przeliczenie
  calcStrukturaSekcja3();

  // --- DODANE: zmienne pomocnicze m_1, m_2, m_3 ---
  function calcMVarsSekcja3() {
    function toNumber(str) {
      if (!str) return 0;
      str = str.replace('%', '').replace(/\s/g, '').replace(',', '.');
      return parseFloat(str) || 0;
    }
    window.m_1 = 0;
    window.m_2 = 0;
    window.m_3 = 0;
    const table = document.getElementById("myTable2");
    for (let i = 1; i <= 3; i++) {
      const v1 = table.rows[i].cells[1].querySelector('input').value;
      const v6 = table.rows[i].cells[5].querySelector('input').value;
      let v1Num = toNumber(v1);
      let v6Num = toNumber(v6);
      if (table.rows[i].cells[5].querySelector('input').value.includes('%')) v6Num = v6Num / 100;
      let res = (v1Num * v6Num) / 100;
      if (i === 1) window.m_1 = res;
      if (i === 2) window.m_2 = res;
      if (i === 3) window.m_3 = res;
    }
  }
  document.getElementById("myTable2").addEventListener("input", calcMVarsSekcja3);
  calcMVarsSekcja3();

  // --- OBLICZENIA DLA SEKCJI 4: Produkty, Materiały, Usługi, kolumny 2, 3, 4 i 5 ---
  function updateSekcja4Wartosci() {
    const table3 = document.getElementById('myTable2');
    const table4 = document.getElementById('myTable3');
    if (!table3 || !table4) return;

    // Suma kolumny 2 w sekcji 4 (myTable3)
    let suma_k2 = 0;
    for (let i = 1; i <= 3; i++) {
        const w4k2Input = table4.rows[i].cells[1].querySelector('input');
        if (w4k2Input) {
            let val = w4k2Input.value.replace(/\s/g, '').replace(',', '.');
            suma_k2 += parseFloat(val) || 0;
        }
    }

    // Wiersze: 1 - Produkty, 2 - Materiały, 3 - Usługi (indeksy 1,2,3)
    for (let i = 1; i <= 3; i++) {
        // --- Kolumna 2 ---
        const w3k2Input = table3.rows[i].cells[1].querySelector('input');
        const w3k6Input = table3.rows[i].cells[5].querySelector('input');
        const w4k2Input = table4.rows[i].cells[1].querySelector('input');
        if (w3k2Input && w3k6Input && w4k2Input) {
            let val_k2 = w3k2Input.value.replace(/\s/g, '').replace(',', '.');
            let val_k6 = w3k6Input.value.replace('%','').replace(/\s/g, '').replace(',', '.');
            let netto = parseFloat(val_k2) || 0;
            let marza = parseFloat(val_k6) || 0;
            let wynik = netto * (1 - marza / 100);
            w4k2Input.value = wynik.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            w4k2Input.readOnly = true;
            w4k2Input.classList.add("readonly-output");
        }

        // --- Kolumna 3 ---
        const w3k3Input = table3.rows[i].cells[2].querySelector('input');
        const w4k3Input = table4.rows[i].cells[2].querySelector('input');
        if (w3k3Input && w3k6Input && w4k3Input) {
            let val_k3 = w3k3Input.value.replace(/\s/g, '').replace(',', '.');
            let val_k6 = w3k6Input.value.replace('%','').replace(/\s/g, '').replace(',', '.');
            let netto = parseFloat(val_k3) || 0;
            let marza = parseFloat(val_k6) || 0;
            let wynik = netto * (1 - marza / 100);
            w4k3Input.value = wynik.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            w4k3Input.readOnly = true;
            w4k3Input.classList.add("readonly-output");
        }

        // --- Kolumna 4 ---
        const w3k4Input = table3.rows[i].cells[3].querySelector('input');
        const w4k4Input = table4.rows[i].cells[3].querySelector('input');
        if (w3k4Input && w3k6Input && w4k4Input) {
            let val_k4 = w3k4Input.value.replace(/\s/g, '').replace(',', '.');
            let val_k6 = w3k6Input.value.replace('%','').replace(/\s/g, '').replace(',', '.');
            let netto = parseFloat(val_k4) || 0;
            let marza = parseFloat(val_k6) || 0;
            let wynik = netto * (1 - marza / 100);
            w4k4Input.value = wynik.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            w4k4Input.readOnly = true;
            w4k4Input.classList.add("readonly-output");
        }

        // --- Kolumna 5: Struktura = kolumna 2 / suma kolumna 2 * 100 ---
        const w4k5Input = table4.rows[i].cells[4].querySelector('input');
        const w4k2Input_new = table4.rows[i].cells[1].querySelector('input');
        if (w4k5Input && w4k2Input_new) {
            let val_k2 = w4k2Input_new.value.replace(/\s/g, '').replace(',', '.');
            let v = parseFloat(val_k2) || 0;
            let struktura = 0;
            if (suma_k2 > 0) {
                struktura = (v / suma_k2) * 100;
            }
            w4k5Input.value = struktura.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2}) + " %";
            w4k5Input.readOnly = true;
            w4k5Input.classList.add("readonly-output");
        }
    }
  }
  document.getElementById("myTable2").addEventListener("input", updateSekcja4Wartosci);
  updateSekcja4Wartosci();
});

function formatAllTableInputs() {
  document.querySelectorAll("table").forEach((table) => {
    table.querySelectorAll("tr").forEach((tr) => {
      tr.querySelectorAll("td input[data-numeric='true']").forEach((input) => {
        formatInputToTwoDecimals(input);
      });
    });
  });
}

// --- Funkcje logiki tabeli ---

function updateLeasingOperacyjnyFromSection1() {
    const table = document.getElementById("myTable");
    let sumaSrodkowWlasnych = 0;
    for (let i = 1; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        const select = row.cells[5].querySelector('select');
        const srodkiWlasneInput = row.cells[3].querySelector('input');
        if (select && select.value === "leasing") {
            let val = srodkiWlasneInput.value.replace(/\s/g, '').replace(',', '.');
            sumaSrodkowWlasnych += parseFloat(val) || 0;
        }
    }
    const leasingOperacyjnyInput = document.getElementById("leasingOperacyjny2");
    if (leasingOperacyjnyInput) {
        leasingOperacyjnyInput.value = sumaSrodkowWlasnych.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
}

// --- Nowa logika obliczania Atemp: ---
// Atemp = pozostałe środki sekcja 1 + środki własne sekcja 1

function liczAtemp() {
    function toNumber(str) {
        if (!str) return 0;
        return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0;
    }
    function toCurrency(val) {
        return val.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    const summary5 = toNumber(document.getElementById('summary5').value); // pozostałe środki sekcja 1
    const summary4 = toNumber(document.getElementById('summary4').value); // środki własne sekcja 1
    const kapitalZakladowy2 = toNumber(document.getElementById('kapitalZakladowy2').value); // kapitał zakładowy sekcja 2

    const kredytInwestycyjny2 = document.getElementById('kredytInwestycyjny2');
    const srodkiWlasneObrotowe2 = document.getElementById('srodkiWlasneObrotowe2');
    
    // Nowy wzór:
    const Atemp = summary5 + summary4;
    const wynik = Atemp - kapitalZakladowy2;

    if (wynik >= 0) {
        if (kredytInwestycyjny2) kredytInwestycyjny2.value = toCurrency(wynik);
        if (srodkiWlasneObrotowe2) srodkiWlasneObrotowe2.value = toCurrency(0);
    } else {
        if (kredytInwestycyjny2) kredytInwestycyjny2.value = toCurrency(0);
        if (srodkiWlasneObrotowe2) srodkiWlasneObrotowe2.value = toCurrency(kapitalZakladowy2 - Atemp);
    }
}

// Funkcja do obliczenia "Nakłady finansowe razem" sekcja 2
function liczNakladyFinansoweRazem() {
    function toNumber(str) {
        if (!str) return 0;
        return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0;
    }
    function toCurrency(val) {
        return val.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    const summary4 = toNumber(document.getElementById('summary4').value); // środki własne sekcja 1
    const summary5 = toNumber(document.getElementById('summary5').value); // pozostałe środki sekcja 1
    const nakladyRazem2 = document.getElementById('nakladyRazem2');

    const wynik = summary4 + summary5;

    if (nakladyRazem2) {
        nakladyRazem2.value = toCurrency(wynik);
    }
}

function updateKredytInwestycyjny2() {
    liczAtemp();
}

function updateSrodkiWlasneObrotowe2() {
    liczAtemp();
    updateKredytObrotowy2();
}

function updateKredytObrotowy2() {
    const srodkiWlasneObrotowe2 = document.getElementById('srodkiWlasneObrotowe2');
    const kredytObrotowy2 = document.getElementById('kredytObrotowy2');
    function toNumber(str) {
        if (!str) return 0;
        return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0;
    }
    function toCurrency(val) {
        return val.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
    if (srodkiWlasneObrotowe2 && kredytObrotowy2) {
        let swo = toNumber(srodkiWlasneObrotowe2.value);
        if (swo < 0) {
            kredytObrotowy2.value = toCurrency(-swo);
            srodkiWlasneObrotowe2.value = "0,00";
        } else {
            kredytObrotowy2.value = "0,00";
        }
    }
}

// Dodawanie i usuwanie wierszy
function addRow(tableId, summaryRowId, numCols) {
    const table = document.getElementById(tableId);
    const row = table.insertRow(table.rows.length - 1);

    for (let i = 0; i < numCols; i++) {
        const cell = row.insertCell(i);
        if (tableId === "myTable") {
            if (i === 0) {
                cell.innerHTML = `<input type="text" value="">`;
            } else if (i === 1) {
                cell.className = "numeric-cell";
                cell.innerHTML = `<input type="text" data-numeric="true" maxlength="32" value="0,00">`;
            } else if (i === 2) {
                cell.className = "percent-cell";
                cell.innerHTML = `<input type="text" data-numeric="true" maxlength="32" value="0,00">`;
            } else if (i === 3) {
                cell.className = "numeric-cell";
                cell.innerHTML = `<input type="text" data-numeric="true" maxlength="32" value="0,00">`;
            } else if (i === 4) {
                cell.className = "numeric-cell";
                cell.innerHTML = `<input type="text" data-numeric="true" maxlength="32" value="0,00" readonly>`;
            } else if (i === 5) {
                cell.className = "numeric-cell";
                cell.innerHTML = `<select style="text-align-last:center;-moz-text-align-last:center;display:inline-block;margin:0 auto;">
                                    <option value="kredyt" selected>kredyt</option>
                                    <option value="leasing">leasing</option>
                                    <option value="">nic</option>
                                  </select>`;
            }
        } else {
            if (i === 0) {
                cell.innerHTML = `<input type="text" value="">`;
            } else if (tableId === "myTable2" && i === 5) {
                // Dodawanie nowego inputa marża w sekcji 3, domyślnie 10
                cell.innerHTML = `<input type="text" maxlength="8" class="marza-cell" value="10">`;
            } else {
                cell.className = "numeric-cell";
                cell.innerHTML = `<input type="text" data-numeric="true" maxlength="32" value="0,00">`;
            }
        }
    }
    // Dodaj eventy tylko do nowych inputów!
    row.querySelectorAll("input[data-numeric='true']").forEach(setupNumericInput);
    // Dodaj eventy do inputa marża, gdy dodajesz wiersz w sekcji 3
    if (tableId === "myTable2") {
        row.querySelectorAll(".marza-cell").forEach(setupMarzaInput);
        // Po dodaniu wiersza w sekcji 3, ustaw "10" jeśli dodany input marza jest pusty
        row.querySelectorAll(".marza-cell").forEach(function(input) {
            if (!input.value || input.value === "0,0 %" || input.value === "0") {
                input.value = "10";
            }
        });
    }
}

function removeRow(tableId, summaryRowId, minRows) {
    const table = document.getElementById(tableId);
    if (table.rows.length - 2 >= minRows) {
        table.deleteRow(table.rows.length - 2);
    }
}

// SUMOWANIE TABEL + WYŚWIETLANIE SUM W HTML
document.addEventListener("DOMContentLoaded", function () {
    function toNumber(str) {
        if (!str) return 0;
        return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0;
    }
    function toCurrency(val) {
        return val.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    // BLOK 1: Środki trwałe i WNiP
    const table = document.getElementById("myTable");
    function recalcTable() {
        let sumNetto = 0, sumAmort = 0, sumOwn = 0, sumRest = 0;
        for (let i = 1; i < table.rows.length - 1; i++) {
            const row = table.rows[i];
            const nettoInput = row.cells[1].querySelector('input');
            const amortInput = row.cells[2].querySelector('input');
            const ownInput = row.cells[3].querySelector('input');
            const restInput = row.cells[4].querySelector('input');
            const select = row.cells[5].querySelector('select');
            const netto = toNumber(nettoInput.value);

            if (select && select.value === "leasing") {
                const own = Math.round(netto * 0.2 * 100) / 100;
                ownInput.value = toCurrency(own);
                ownInput.readOnly = true;
                ownInput.classList.add("readonly-output");
                restInput.value = toCurrency(0);
            } else {
                ownInput.readOnly = false;
                ownInput.classList.remove("readonly-output");
                const own = toNumber(ownInput.value);
                const rest = Math.max(netto - own, 0);
                restInput.value = toCurrency(rest);
            }

            const amort = toNumber(amortInput.value);
            const own = toNumber(ownInput.value);
            const rest = toNumber(restInput.value);

            sumNetto += netto;
            sumAmort += amort;
            sumOwn += own;
            sumRest += rest;
        }
        document.getElementById("summary1").value = toCurrency(sumNetto);
        document.getElementById("summary2").value = toCurrency(sumAmort);
        document.getElementById("summary4").value = toCurrency(sumOwn);
        document.getElementById("summary5").value = toCurrency(sumRest);

        showSumsInHtml("myTable-sum-netto", sumNetto);
        showSumsInHtml("myTable-sum-amort", sumAmort);
        showSumsInHtml("myTable-sum-own", sumOwn);
        showSumsInHtml("myTable-sum-rest", sumRest);

        updateLeasingOperacyjnyFromSection1();
        updateKredytInwestycyjny2();
        updateSrodkiWlasneObrotowe2();
        liczNakladyFinansoweRazem(); // Dodajemy, by zawsze przeliczało nakłady przy zmianie tabeli
    }

    table.addEventListener("input", function (e) {
        if (
            e.target &&
            (
                e.target.parentElement.cellIndex === 1 ||
                e.target.parentElement.cellIndex === 2 ||
                e.target.parentElement.cellIndex === 3
            )
        ) {
            recalcTable();
        }
    });

    table.addEventListener("change", function (e) {
        if (e.target && e.target.tagName === "SELECT") {
            recalcTable();
        }
    });

    recalcTable();

    function recalcSumColumns(tableId, summaryRowId, sumInputs, htmlSums) {
        const t = document.getElementById(tableId);
        const sum = [0,0,0,0];
        for (let i = 1; i < t.rows.length - 1; i++) {
            for (let j = 1; j <= 4; j++) {
                const val = toNumber(t.rows[i].cells[j].querySelector('input').value);
                sum[j-1] += val;
            }
        }
        for (let k = 0; k < 4; k++) {
            document.getElementById(sumInputs[k]).value = toCurrency(sum[k]);
            if (htmlSums && htmlSums[k]) {
                showSumsInHtml(htmlSums[k], sum[k]);
            }
        }
    }

    recalcSumColumns("myTable2", "summaryRow2", ["summary1_2","summary2_2","summary3_2","summary4_2"], [
        "myTable2-sum1", "myTable2-sum2", "myTable2-sum3", "myTable2-sum4"
    ]);
    recalcSumColumns("myTable3", "summaryRow3", ["summary1_3","summary2_3","summary3_3","summary4_3"], [
        "myTable3-sum1", "myTable3-sum2", "myTable3-sum3", "myTable3-sum4"
    ]);
    recalcSumColumns("myTable4", "summaryRow4", ["summary1_4","summary2_4","summary3_4","summary4_4"], [
        "myTable4-sum1", "myTable4-sum2", "myTable4-sum3", "myTable4-sum4"
    ]);
    recalcSumColumns("myTable5", "summaryRow5", ["summary1_5","summary2_5","summary3_5","summary4_5"], [
        "myTable5-sum1", "myTable5-sum2", "myTable5-sum3", "myTable5-sum4"
    ]);

    document.getElementById("myTable2").addEventListener("input", function () {
        recalcSumColumns("myTable2", "summaryRow2", ["summary1_2","summary2_2","summary3_2","summary4_2"], [
            "myTable2-sum1", "myTable2-sum2", "myTable2-sum3", "myTable2-sum4"
        ]);
    });
    document.getElementById("myTable3").addEventListener("input", function () {
        recalcSumColumns("myTable3", "summaryRow3", ["summary1_3","summary2_3","summary3_3","summary4_3"], [
            "myTable3-sum1", "myTable3-sum2", "myTable3-sum3", "myTable3-sum4"
        ]);
    });
    document.getElementById("myTable4").addEventListener("input", function () {
        recalcSumColumns("myTable4", "summaryRow4", ["summary1_4","summary2_4","summary3_4","summary4_4"], [
            "myTable4-sum1", "myTable4-sum2", "myTable4-sum3", "myTable4-sum4"
        ]);
    });
    document.getElementById("myTable5").addEventListener("input", function () {
        recalcSumColumns("myTable5", "summaryRow5", ["summary1_5","summary2_5","summary3_5","summary4_5"], [
            "myTable5-sum1", "myTable5-sum2", "myTable5-sum3", "myTable5-sum4"
        ]);
    });

    function showSumsInHtml(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = toCurrency(value);
        }
    }

    // Automatyczne przeliczanie sekcji 2 po zmianach kluczowych pól
    // summary5, summary4, leasingOperacyjny2, kapitalZakladowy2
    [
        'summary5',
        'summary4',
        'leasingOperacyjny2',
        'kapitalZakladowy2'
    ].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', liczAtemp);
            el.addEventListener('change', liczAtemp);
        }
    });

    // Automatyczne przeliczanie nakładów finansowych razem po zmianie summary4 i summary5
    ['summary4', 'summary5'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', liczNakladyFinansoweRazem);
            el.addEventListener('change', liczNakladyFinansoweRazem);
        }
    });
});

// (pozostałe funkcje bez zmian...)

function saveToFile() {
    let csv = [];
    let tables = ['myTable','myTable2','myTable3','myTable4','myTable5'];
    for (let t = 0; t < tables.length; t++) {
        let table = document.getElementById(tables[t]);
        for (let i = 0, row; row = table.rows[i]; i++) {
            let rowData = [];
            for (let j = 0, col; col = row.cells[j]; j++) {
                let input = col.querySelector('input, select');
                if (input) {
                    rowData.push(input.value);
                } else {
                    rowData.push(col.innerText);
                }
            }
            csv.push(rowData.join(";"));
        }
        csv.push("");
    }
    let filename = document.getElementById('filename').value || "biznesgpt.csv";
    let blob = new Blob([csv.join("\n")], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        let lines = text.split('\n');
        let tables = ['myTable','myTable2','myTable3','myTable4','myTable5'];
        let rowIdx = 0;
        for (let t = 0; t < tables.length; t++) {
            let table = document.getElementById(tables[t]);
            let numRows = table.rows.length;
            let numCols = table.rows[0].cells.length;
            for (let i = 0; i < numRows; i++) {
                let vals = lines[rowIdx] ? lines[rowIdx].split(";") : [];
                for (let j = 0; j < numCols; j++) {
                    let input = table.rows[i].cells[j].querySelector('input, select');
                    if (input && vals[j] !== undefined) {
                        input.value = vals[j];
                        formatInputToTwoDecimals(input);
                        if (input.hasAttribute('data-numeric')) setupNumericInput(input);
                        if (input.classList.contains('marza-cell')) setupMarzaInput(input);
                    }
                }
                rowIdx++;
            }
            rowIdx++;
        }
        document.dispatchEvent(new Event("DOMContentLoaded"));
        updateKredytInwestycyjny2();
        updateSrodkiWlasneObrotowe2();
        formatNakladyKapitalFields();
        liczNakladyFinansoweRazem();
        setupAllMarzaInputs(); // po wczytaniu pliku: aktywuj eventy marża
    };
    reader.readAsText(file, 'UTF-8');
}

// --- FORMATOWANIE POL "nakladyRazem2" i "kapitalZakladowy2" --- //
function formatToCurrencyPL(input) {
    let val = input.value.replace(/\s/g, '').replace(',', '.');
    let num = parseFloat(val);
    if (!isNaN(num)) {
        input.value = num.toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    } else {
        input.value = "0,00";
    }
}
function formatNakladyKapitalFields() {
    ["nakladyRazem2", "kapitalZakladowy2"].forEach(function(id) {
        let el = document.getElementById(id);
        if (el) formatToCurrencyPL(el);
    });
}
["nakladyRazem2", "kapitalZakladowy2"].forEach(function(id) {
    let el = document.getElementById(id);
    if (el) {
        if (!el._numericSetup) {
            el._numericSetup = true;
            el._wasCleared = false;
            el.addEventListener("focus", function() {
                if (!el._wasCleared) {
                    el.value = "";
                    el._wasCleared = true;
                }
            });
            el.addEventListener("blur", function() {
                formatToCurrencyPL(el);
                el._wasCleared = false;
            });
            el.addEventListener("change", function() {
                formatToCurrencyPL(el);
            });
            el.addEventListener("keydown", allowOnlyNumbersAndComma);
            el.addEventListener("input", function () {
                this.value = this.value.replace(/[^0-9,\.]/g, "");
            });
        }
        formatToCurrencyPL(el);
    }
});
document.addEventListener("DOMContentLoaded", formatNakladyKapitalFields);

// NIE wywołuj formatAllTableInputs w trakcie wpisywania, tylko na blur pojedynczego inputa!
// NIE wywołuj setupAllNumericInputsInTable po każdym input ani change, tylko na początku i przy dodawaniu wiersza!

// WAŻNE: Jeśli masz inne funkcje, które masowo nadpisują value inputów (np. formatowanie, przeliczanie)
// wywołuj je tylko po zakończeniu edycji (blur/change), a nie w trakcie wpisywania!