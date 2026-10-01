let drawerWidthType = 'external';

function stepDrawerVal(id, step, min = 0) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = (parseFloat(input.value) || 0) + step;
    if (val < min) val = min;
    input.value = val;
    
    if (id === 'inpFrontsCount') {
        renderFrontInputs();
    }
    calculateDrawers();
}

function setDrawerType(type) {
    drawerWidthType = type;
    const btnExt = document.getElementById('btnDrawerTypeExt');
    const btnInt = document.getElementById('btnDrawerTypeInt');
    const lbl = document.getElementById('lblDrawerWidth');
    const rowBodyThick = document.getElementById('rowBodyThick');

    if (type === 'external') {
        btnExt.classList.add('active');
        btnInt.classList.remove('active');
        lbl.innerText = 'Szerokość zewnętrzna';
        if (rowBodyThick) rowBodyThick.style.display = 'flex';
    } else {
        btnInt.classList.add('active');
        btnExt.classList.remove('active');
        lbl.innerText = 'Szerokość wewnątrz';
        if (rowBodyThick) rowBodyThick.style.display = 'none';
    }
    calculateDrawers();
}

function onDrawerSystemChange() {
    calculateDrawers();
}

function renderFrontInputs() {
    const container = document.getElementById('frontsHeightInputsContainer');
    if (!container) return;

    const count = parseInt(document.getElementById('inpFrontsCount').value) || 1;
    let html = '';

    for (let i = 1; i <= count; i++) {
        const defaultH = i === 1 ? 140 : 284;
        html += `
            <div class="input-row">
                <div class="input-label">
                    <span>Front ${i} ${i === 1 ? '(dolny!)' : ''}</span>
                    <span class="input-sublabel">Wysokość w mm</span>
                </div>
                <div class="stepper">
                    <button class="stepper-btn" onclick="stepDrawerVal('inpFrontH_${i}', -5)">-</button>
                    <input type="number" id="inpFrontH_${i}" class="stepper-input front-h-input" value="${defaultH}" onfocus="this.select()" onclick="this.select()" oninput="calculateDrawers()">
                    <button class="stepper-btn" onclick="stepDrawerVal('inpFrontH_${i}', 5)">+</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function calculateDrawers() {
    const rawWidth = parseFloat(document.getElementById('inpDrawerWidth').value) || 0;
    const bodyThick = parseFloat(document.getElementById('inpDrawerBodyThick').value) || 0;
    const runnerLength = parseFloat(document.getElementById('selDrawerLength').value) || 0;
    const drawerHeight = parseFloat(document.getElementById('selDrawerHeight').value) || 0;

    if (rawWidth <= 0) return;

    // Szerokość wewnętrzna korpusu
    const intWidth = drawerWidthType === 'external' ? (rawWidth - (2 * bodyThick)) : rawWidth;

    document.getElementById('resDrawerIntWidth').innerText = `${intWidth.toFixed(1)} mm`;

    // Wyliczenia REJS UltraBox
    // Dno: (Szerokość wewnętrzna - 75 mm) x (Długość prowadnicy - 24 mm)
    const bottomW = intWidth - 75;
    const bottomL = runnerLength - 24;

    // Plecy: (Szerokość wewnętrzna - 87 mm) x Wysokość szuflady
    const backW = intWidth - 87;
    const backH = drawerHeight;

    // Szerokość panelu frontowego: Szerokość wewnętrzna - 98 mm
    const frontPanelW = intWidth - 98;

    // Szerokość relingu frontowego: Szerokość wewnętrzna - 85 mm (tylko dla h = 167 i 199)
    const frontRailingW = intWidth - 85;

    // Długość synchronizatora: Szerokość wewnętrzna - 128 mm
    const synchroL = intWidth - 128;

    // Prezentacja wyników formatek
    document.getElementById('resDrawerBottomDim').innerText = `${bottomW.toFixed(1)} mm x ${bottomL.toFixed(1)} mm`;
    
    // Nadkreślenie szerokości pleców
    const resBackW = document.getElementById('resDrawerBackW');
    const resBackH = document.getElementById('resDrawerBackH');
    if (resBackW) resBackW.innerText = `${backW.toFixed(1)} mm`;
    if (resBackH) resBackH.innerText = `${backH.toFixed(1)} mm`;

    // Panel frontowy
    document.getElementById('resDrawerFrontPanelW').innerText = `${frontPanelW.toFixed(1)} mm`;

    // Reling frontowy (pokazywany tylko przy wysokości 167 mm i 199 mm)
    const rowFrontRailing = document.getElementById('rowFrontRailing');
    if (drawerHeight === 167 || drawerHeight === 199) {
        document.getElementById('resDrawerFrontRailingW').innerText = `${frontRailingW.toFixed(1)} mm`;
        if (rowFrontRailing) rowFrontRailing.style.display = 'flex';
    } else {
        if (rowFrontRailing) rowFrontRailing.style.display = 'none';
    }

    // Synchronizator
    document.getElementById('resDrawerSynchroDim').innerText = `${synchroL.toFixed(1)} mm`;

    // SEKCJA MONTAŻOWA - POZYCJE PROWADNIC W KORPUSIE
    calculateRunnerPositions();
}

function calculateRunnerPositions() {
    const container = document.getElementById('runnerPositionsContainer');
    if (!container) return;

    const count = parseInt(document.getElementById('inpFrontsCount').value) || 1;
    const gap = parseFloat(document.getElementById('inpGapBetween').value) || 0;

    let html = '';
    let accumulatedH = 0;

    for (let i = 1; i <= count; i++) {
        const inputH = document.getElementById(`inpFrontH_${i}`);
        const currentFrontH = inputH ? (parseFloat(inputH.value) || 0) : 0;

        let pos = 0;

        if (i === 1) {
            // Prowadnica 1 (dolna): 49 mm
            pos = 49;
            accumulatedH = currentFrontH;
        } else if (i === 2) {
            // Prowadnica 2: wysokość frontu 1 - 18mm + 10mm + szczelina + 49mm
            const front1H = parseFloat(document.getElementById('inpFrontH_1').value) || 0;
            pos = (front1H - 18) + 10 + gap + 49;
            accumulatedH = front1H + gap + currentFrontH;
        } else {
            // Prowadnica 3+ wzór: wysokość frontu 1 - 18mm + szczelina + wys_frontu_2 + szczelina + ... + (4+szczelina) + 10mm + 49mm
            const front1H = parseFloat(document.getElementById('inpFrontH_1').value) || 0;
            let middleSum = 0;
            for (let j = 2; j < i; j++) {
                const fh = parseFloat(document.getElementById(`inpFrontH_${j}`).value) || 0;
                middleSum += fh + gap;
            }
            pos = (front1H - 18) + gap + middleSum + (4 + gap) + 10 + 49;
        }

        html += `
            <div class="table-row">
                <span class="shelf-num">Prowadnica #${i} ${i === 1 ? '(dolna)' : ''}</span>
                <span class="shelf-dim">${pos.toFixed(1)} mm</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

// Inicjalizacja przy ładowaniu
renderFrontInputs();
calculateDrawers();
