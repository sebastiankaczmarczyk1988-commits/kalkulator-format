function stepAssemblyVal(id, step, min = 0) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = (parseFloat(input.value) || 0) + step;
    if (val < min) val = min;
    input.value = val;
    
    if (id === 'inpFrontsCount') {
        renderAssemblyFrontInputs();
    }
    calculateAssembly();
}

function renderAssemblyFrontInputs() {
    const container = document.getElementById('frontsHeightInputsContainer');
    if (!container) return;

    const count = parseInt(document.getElementById('inpFrontsCount').value) || 1;
    let html = '';

    for (let i = 1; i <= count; i++) {
        let defaultH = 284;
        if (i === 1) defaultH = 300;
        else if (i === 2) defaultH = 300;
        else if (i === 3) defaultH = 159;

        html += `
            <div class="input-row">
                <div class="input-label">
                    <span>Front ${i} ${i === 1 ? '(dolny!)' : ''}</span>
                    <span class="input-sublabel">Wysokość w mm</span>
                </div>
                <div class="stepper">
                    <button class="stepper-btn" onclick="stepAssemblyVal('inpFrontH_${i}', -5)">-</button>
                    <input type="number" id="inpFrontH_${i}" class="stepper-input front-h-input" value="${defaultH}" onfocus="this.select()" onclick="this.select()" oninput="calculateAssembly()">
                    <button class="stepper-btn" onclick="stepAssemblyVal('inpFrontH_${i}', 5)">+</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function calculateAssembly() {
    const runnerContainer = document.getElementById('runnerPositionsContainer');
    const frontContainer = document.getElementById('frontPositionsContainer');
    if (!runnerContainer || !frontContainer) return;

    const system = document.getElementById('selAssemblySystem').value;
    const count = parseInt(document.getElementById('inpFrontsCount').value) || 1;
    const gap = parseFloat(document.getElementById('inpGapBetween').value) || 0;

    let runnerHtml = '';
    let frontHtml = '';

    // Stałe odsunięcie bocznej linii trasowania dla frontu nakładanego
    const sideOffset = 32.0;

    // Pobranie wysokości frontów
    let frontHeights = [];
    for (let i = 1; i <= count; i++) {
        const inputH = document.getElementById(`inpFrontH_${i}`);
        frontHeights.push(inputH ? (parseFloat(inputH.value) || 0) : 0);
    }

    // 1. OBLICZANIE POZYCJI PROWADNIC W KORPUSIE (OD DOŁU BOKU)
    for (let i = 1; i <= count; i++) {
        let pos = 0;

        if (i === 1) {
            // Prowadnica 1: 49 mm + 18 mm = 67 mm
            pos = 49 + 18;
        } else {
            // Prowadnice kolejne: Suma poprzednich frontów + szczeliny + 10 mm + 49 mm
            let prevFrontsSum = 0;
            for (let j = 0; j < i - 1; j++) {
                prevFrontsSum += frontHeights[j] + gap;
            }
            pos = prevFrontsSum + 10 + 49;
        }

        runnerHtml += `
            <div class="table-row">
                <span class="shelf-num">Prowadnica #${i} ${i === 1 ? '(dolna)' : ''}</span>
                <span class="shelf-dim">${pos.toFixed(1)} mm</span>
            </div>
        `;
    }

    // 2. OBLICZANIE TRASOWANIA OTWORÓW NA FRONTACH (OD DOŁU DANEGO FRONTU)
    for (let i = 1; i <= count; i++) {
        let bottomHole = 0;

        if (i === 1) {
            // Front #1 (dolny): 48 mm + 18 mm = 66 mm
            bottomHole = 48 + 18;
        } else {
            // Front #2, #3... (kolejne): 48 mm + 10 mm = 58 mm
            bottomHole = 48 + 10;
        }

        const topHole = bottomHole + 32;

        frontHtml += `
            <div class="table-row" style="flex-direction: column; align-items: flex-start; gap: 4px; padding: 12px 14px;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <span class="shelf-num">Front #${i} ${i === 1 ? '(dolny)' : ''}</span>
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); background: var(--card-bg); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--card-border);">Bok: ${sideOffset.toFixed(1)} mm</span>
                </div>
                <div style="font-size: 14px; font-weight: 700; color: var(--cad-accent); margin-top: 2px;">
                    Dolny wkręt: <span style="color: var(--text-primary);">${bottomHole.toFixed(1)} mm</span> &nbsp;|&nbsp; 
                    Górny wkręt: <span style="color: var(--text-primary);">${topHole.toFixed(1)} mm</span>
                </div>
            </div>
        `;
    }

    runnerContainer.innerHTML = runnerHtml;
    frontContainer.innerHTML = frontHtml;
}

// Inicjalizacja przy ładowaniu
renderAssemblyFrontInputs();
calculateAssembly();