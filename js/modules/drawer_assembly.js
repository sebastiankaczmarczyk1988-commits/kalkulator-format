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
    const container = document.getElementById('runnerPositionsContainer');
    if (!container) return;

    const system = document.getElementById('selAssemblySystem').value;
    const count = parseInt(document.getElementById('inpFrontsCount').value) || 1;
    const gap = parseFloat(document.getElementById('inpGapBetween').value) || 0;

    let html = '';

    // Baza trasowania dolnej prowadnicy w zależności od systemu (od dolnej krawędzi frontu/wieńca)
    let baseOffset = 33; // Domyślna wartość dla systemów standardowych
    if (system === 'rejs_ultrabox') baseOffset = 49;
    else if (system === 'blum_antaro') baseOffset = 33;
    else if (system === 'blum_merivobox') baseOffset = 33;
    else if (system === 'gtv_axispro') baseOffset = 33;

    for (let i = 1; i <= count; i++) {
        let pos = 0;

        if (i === 1) {
            pos = baseOffset;
        } else if (i === 2) {
            const front1H = parseFloat(document.getElementById('inpFrontH_1').value) || 0;
            pos = (front1H - 18) + 10 + gap + baseOffset;
        } else {
            const front1H = parseFloat(document.getElementById('inpFrontH_1').value) || 0;
            let middleSum = 0;
            for (let j = 2; j < i; j++) {
                const fh = parseFloat(document.getElementById(`inpFrontH_${j}`).value) || 0;
                middleSum += fh + gap;
            }
            pos = (front1H - 18) + gap + middleSum + (4 + gap) + 10 + baseOffset;
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
renderAssemblyFrontInputs();
calculateAssembly();