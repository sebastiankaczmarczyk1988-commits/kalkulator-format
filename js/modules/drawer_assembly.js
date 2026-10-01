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

    // Pobieramy domyślne wartości w zależności od numeru frontu (od dołu!)
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

    const count = parseInt(document.getElementById('inpFrontsCount').value) || 1;
    const gap = parseFloat(document.getElementById('inpGapBetween').value) || 0;

    let html = '';

    for (let i = 1; i <= count; i++) {
        const inputH = document.getElementById(`inpFrontH_${i}`);
        const currentFrontH = inputH ? (parseFloat(inputH.value) || 0) : 0;

        let pos = 0;

        if (i === 1) {
            // Prowadnica 1 (dolna): 49 mm
            pos = 49;
        } else if (i === 2) {
            // Prowadnica 2: wysokość frontu 1 - 18mm + 10mm + szczelina + 49mm
            const front1H = parseFloat(document.getElementById('inpFrontH_1').value) || 0;
            pos = (front1H - 18) + 10 + gap + 49;
        } else {
            // Prowadnica 3+: wysokość frontu 1 - 18mm + szczelina + wys_frontu_2 + szczelina + ... + (4+szczelina) + 10mm + 49mm
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
renderAssemblyFrontInputs();
calculateAssembly();