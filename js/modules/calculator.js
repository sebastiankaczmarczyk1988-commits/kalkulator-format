let calcCurrent = '0';
let calcPrevious = '';
let calcOperation = null;
let calcResetOnNext = false;

function updateCalcDisplay() {
    const display = document.getElementById('calcDisplay');
    const history = document.getElementById('calcHistory');
    if (display) display.innerText = calcCurrent;
    if (history) {
        if (calcOperation && calcPrevious !== '') {
            const opSymbol = calcOperation === '*' ? '×' : calcOperation === '/' ? '÷' : calcOperation;
            history.innerText = `${calcPrevious} ${opSymbol}`;
        } else {
            history.innerText = '';
        }
    }
}

function calcNum(num) {
    if (calcCurrent === '0' || calcResetOnNext) {
        calcCurrent = num;
        calcResetOnNext = false;
    } else {
        if (calcCurrent.length < 12) {
            calcCurrent += num;
        }
    }
    updateCalcDisplay();
}

function calcDot() {
    if (calcResetOnNext) {
        calcCurrent = '0.';
        calcResetOnNext = false;
    } else if (!calcCurrent.includes('.')) {
        calcCurrent += '.';
    }
    updateCalcDisplay();
}

function calcOp(op) {
    if (calcOperation !== null && !calcResetOnNext) {
        calcEquals();
    }
    calcPrevious = calcCurrent;
    calcOperation = op;
    calcResetOnNext = true;
    updateCalcDisplay();
}

function calcEquals() {
    if (calcOperation === null || calcPrevious === '') return;

    let prev = parseFloat(calcPrevious);
    let curr = parseFloat(calcCurrent);
    let res = 0;

    switch (calcOperation) {
        case '+': res = prev + curr; break;
        case '-': res = prev - curr; break;
        case '*': res = prev * curr; break;
        case '/': res = curr !== 0 ? prev / curr : 'Błąd'; break;
        case '%': res = (prev * curr) / 100; break;
    }

    if (typeof res === 'number') {
        // Zaokrąglanie wyników, aby uniknąć błędów zmiennoprzecinkowych (np. 0.1 + 0.2)
        res = Math.round(res * 100000) / 100000;
    }

    calcCurrent = res.toString();
    calcOperation = null;
    calcPrevious = '';
    calcResetOnNext = true;
    updateCalcDisplay();
}

function calcClear() {
    calcCurrent = '0';
    calcPrevious = '';
    calcOperation = null;
    calcResetOnNext = false;
    updateCalcDisplay();
}

function calcBackspace() {
    if (calcResetOnNext) return;
    if (calcCurrent.length > 1) {
        calcCurrent = calcCurrent.slice(0, -1);
    } else {
        calcCurrent = '0';
    }
    updateCalcDisplay();
}

// Inicjalizacja ekranu kalkulatora
updateCalcDisplay();