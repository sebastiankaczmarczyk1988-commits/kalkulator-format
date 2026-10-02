let shelfWidthType = 'external';

function stepShelfVal(id, step, min = 0) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = (parseFloat(input.value) || 0) + step;
    if (val < min) val = min;
    input.value = val;
    calculateShelves();
}

function setShelfWidthType(type) {
    shelfWidthType = type;
    const btnExt = document.getElementById('btnShelfTypeExt');
    const btnInt = document.getElementById('btnShelfTypeInt');
    const lbl = document.getElementById('lblShelfHeight');
    const rowBodyThick = document.getElementById('rowShelfBodyThick');

    if (type === 'external') {
        btnExt.classList.add('active');
        btnInt.classList.remove('active');
        lbl.innerText = 'Wysokość zewnętrzna';
        if (rowBodyThick) rowBodyThick.style.display = 'flex';
    } else {
        btnInt.classList.add('active');
        btnExt.classList.remove('active');
        lbl.innerText = 'Światło (wysokość wewnątrz)';
        if (rowBodyThick) rowBodyThick.style.display = 'none';
    }
    calculateShelves();
}

function calculateShelves() {
    const rawHeight = parseFloat(document.getElementById('inpShelfHeight').value) || 0;
    const bodyThick = parseFloat(document.getElementById('inpShelfBodyThick').value) || 0;
    const shelfThick = parseFloat(document.getElementById('inpShelfThick').value) || 0;
    const count = parseInt(document.getElementById('inpShelfCount').value) || 1;

    const resGap = document.getElementById('resShelfGap');
    const container = document.getElementById('shelfPositionsContainer');

    if (rawHeight <= 0 || count <= 0) return;

    // Wysokość wewnętrzna (światło korpusu)
    const intHeight = shelfWidthType === 'external' ? (rawHeight - (2 * bodyThick)) : rawHeight;

    // Przestrzeń użytkowa między półkami
    const availableSpace = intHeight - (count * shelfThick);
    const gap = availableSpace / (count + 1);

    if (resGap) resGap.innerText = `${gap.toFixed(1)} mm`;

    // Generowanie tabeli wyników trasowania (wyłącznie wewnątrz od górnej krawędzi wieńca)
    let html = '';
    let shelfPositions = []; // Przetrzymuje pozycję dolnej krawędzi każdej półki mierzoną od dna wnętrza

    for (let i = 1; i <= count; i++) {
        // Pozycja dolnej płaszczyzny i-tej półki liczona od górnej płaszczyzny wieńca dolnego
        const posFromBottomInside = (i * gap) + ((i - 1) * shelfThick);
        shelfPositions.push(posFromBottomInside);

        html += `
            <div class="table-row">
                <span class="shelf-num">Półka ${i} (od wieńca dolnego)</span>
                <span class="shelf-dim">${posFromBottomInside.toFixed(1)} mm</span>
            </div>
        `;
    }

    if (container) container.innerHTML = html;

    // Rysowanie na płótnie Canvas
    drawShelvesCanvas(intHeight, shelfThick, count, gap, shelfPositions);
}

function drawShelvesCanvas(intHeight, shelfThick, count, gap, shelfPositions) {
    const canvas = document.getElementById('shelfCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Marginesy rysunku
    const padX = 35;
    const padY = 25;
    const boxW = w - (2 * padX);
    const boxH = h - (2 * padY);

    // Tło korpusu
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, padY, boxW, boxH);

    // Rysowanie wieńca dolnego i górnego
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(padX, padY - 6, boxW, 6);
    ctx.fillRect(padX, padY + boxH, boxW, 6);

    // Rysowanie półek w środku
    ctx.fillStyle = '#f59e0b'; // Kolor akcentowy półki

    const scale = boxH / intHeight;

    shelfPositions.forEach((pos) => {
        // Zamiana współrzędnych (Canvas rysuje od góry)
        const shelfYOnCanvas = padY + boxH - (pos * scale) - (shelfThick * scale);
        const shelfHOnCanvas = Math.max(3, shelfThick * scale);

        ctx.fillRect(padX + 2, shelfYOnCanvas, boxW - 4, shelfHOnCanvas);
    });

    // Opis skrajnych wymiarów na Canvasie
    ctx.fillStyle = '#a0aec0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Światło: ${intHeight.toFixed(0)} mm`, w / 2, 14);
}

// Inicjalizacja przy wczytaniu
calculateShelves();