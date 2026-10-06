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

    // Wysokość wewnętrzna (światło)
    const intHeight = shelfWidthType === 'external' ? (rawHeight - (2 * bodyThick)) : rawHeight;

    // Dostępna przestrzeń podzielona na równe części
    const availableSpace = intHeight - (count * shelfThick);
    const gap = availableSpace / (count + 1);

    if (resGap) resGap.innerText = `${gap.toFixed(1)} mm`;

    let html = '';
    let shelfPositions = []; // Wymiar od górnej powierzchni wieńca dolnego do DOŁU danej półki

    for (let i = 1; i <= count; i++) {
        const posToBottom = (i * gap) + ((i - 1) * shelfThick);
        shelfPositions.push(posToBottom);

        html += `
            <div class="table-row">
                <span class="shelf-num">Półka #${i} (do dołu półki)</span>
                <span class="shelf-dim">${posToBottom.toFixed(1)} mm</span>
            </div>
        `;
    }

    if (container) container.innerHTML = html;

    // Wywołanie funkcji rysującej na płótnie z wyliczoną skali
    drawShelvesCanvas(intHeight, shelfThick, count, gap, shelfPositions);
}

function drawShelvesCanvas(intHeight, shelfThick, count, gap, shelfPositions) {
    const canvas = document.getElementById('shelfCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Czyszczenie tła
    ctx.clearRect(0, 0, w, h);

    const padX = 55; // Większy margines z lewej na linie wymiarowe i opisy
    const padY = 30;
    const boxW = w - padX - 20;
    const boxH = h - (2 * padY);

    // Przekrój korpusu (zewnętrzny obrys boku)
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.strokeRect(padX, padY, boxW, boxH);

    // Wieniec dolny i górny
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(padX, padY - 5, boxW, 5);
    ctx.fillRect(padX, padY + boxH, boxW, 5);

    const scale = boxH / intHeight;

    // Rysowanie półek i precyzyjnych linii wymiarowych
    shelfPositions.forEach((pos, idx) => {
        const shelfYOnCanvas = padY + boxH - (pos * scale) - (shelfThick * scale);
        const shelfHOnCanvas = Math.max(3, shelfThick * scale);

        // Półka
        ctx.fillStyle = '#3b82f6'; // Elegancki niebieski kolor akcentowy
        ctx.fillRect(padX + 2, shelfYOnCanvas, boxW - 4, shelfHOnCanvas);

        // Linia pomocnicza trasowania do DOŁU półki
        const bottomY = padY + boxH - (pos * scale);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(padX - 25, bottomY);
        ctx.lineTo(padX + 2, bottomY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tekst z wymiarem przy linii
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${pos.toFixed(0)}`, padX - 6, bottomY + 3);
    });

    // Nagłówek i linia światła wewnątrz
    ctx.fillStyle = '#a0aec0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Światło: ${intHeight.toFixed(0)} mm`, padX + (boxW / 2), padY - 12);
}

// Inicjalizacja przy ładowaniu
calculateShelves();