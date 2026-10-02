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

    // Domyślna baza trasowania pierwszej (dolnej) prowadnicy od wieńca
    let baseOffset = 33; 
    if (system === 'rejs_ultrabox') baseOffset = 49;
    else if (system === 'blum_antaro') baseOffset = 33;
    else if (system === 'blum_merivobox') baseOffset = 33;
    else if (system === 'blum_legrabox') baseOffset = 33;
    else if (system === 'gtv_axispro') baseOffset = 33;
    else if (system === 'gtv_modernbox') baseOffset = 33;
    else if (system === 'hettich_atira') baseOffset = 33;
    else if (system === 'hettich_antech') baseOffset = 33;

    // Pobranie wysokości frontów
    let frontHeights = [];
    for (let i = 1; i <= count; i++) {
        const inputH = document.getElementById(`inpFrontH_${i}`);
        frontHeights.push(inputH ? (parseFloat(inputH.value) || 0) : 0);
    }

    let runnerPositions = [];

    // 1. OBLICZANIE POZYCJI PROWADNIC W KORPUSIE
    for (let i = 1; i <= count; i++) {
        let pos = 0;

        if (i === 1) {
            pos = baseOffset;
        } else if (i === 2) {
            const front1H = frontHeights[0];
            pos = (front1H - 18) + 10 + gap + baseOffset;
        } else {
            const front1H = frontHeights[0];
            let middleSum = 0;
            for (let j = 1; j < i - 1; j++) {
                middleSum += frontHeights[j] + gap;
            }
            pos = (front1H - 18) + gap + middleSum + (4 + gap) + 10 + baseOffset;
        }

        runnerPositions.push(pos);

        runnerHtml += `
            <div class="table-row">
                <span class="shelf-num">Prowadnica #${i} ${i === 1 ? '(dolna)' : ''}</span>
                <span class="shelf-dim">${pos.toFixed(1)} mm</span>
            </div>
        `;
    }

    // 2. OBLICZANIE TRASOWANIA OTWORÓW NA FRONTACH (OD DOŁU KAŻDEGO FRONTU)
    let accumulatedFrontY = 0; // Dolna krawędź obecnego frontu mierzona od wieńca dolnego

    for (let i = 1; i <= count; i++) {
        const currentFrontH = frontHeights[i - 1];
        const runnerY = runnerPositions[i - 1];

        let bottomHole = 0;
        let topHole = 0;

        if (system === 'rejs_ultrabox') {
            // Weryfikacja praktyczna: dolna krawędź prowadnicy + 17mm = dolny otwór mocowania
            // Dla dolnej prowadnicy (49mm): 49mm + 17mm = 66mm od dołu frontu #1
            bottomHole = (runnerY - accumulatedFrontY) + 17;
            topHole = bottomHole + 32;
        } else {
            // Standardowe systemy (np. Blum/GTV): dolna krawędź prowadnicy + 14mm = dolny otwór
            bottomHole = (runnerY - accumulatedFrontY) + 14;
            topHole = bottomHole + 32;
        }

        frontHtml += `
            <div class="table-row" style="flex-direction: column; align-items: flex-start; gap: 4px; padding: 12px 14px;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <span class="shelf-num">Front #${i} ${i === 1 ? '(dolny)' : ''}</span>
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); background: var(--card-bg); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--card-border);">Odsunięcie bocznie: 12.5 mm</span>
                </div>
                <div style="font-size: 14px; font-weight: 700; color: var(--cad-accent); margin-top: 2px;">
                    Dolny wkręt: <span style="color: var(--text-primary);">${bottomHole.toFixed(1)} mm</span> &nbsp;|&nbsp; 
                    Górny wkręt: <span style="color: var(--text-primary);">${topHole.toFixed(1)} mm</span>
                </div>
            </div>
        `;

        // Przesuwamy punkt odniesienia dla kolejnego frontu (wysokość frontu + szczelina)
        accumulatedFrontY += currentFrontH + gap;
    }

    runnerContainer.innerHTML = runnerHtml;
    frontContainer.innerHTML = frontHtml;
}

// Inicjalizacja przy ładowaniu
renderAssemblyFrontInputs();
calculateAssembly();