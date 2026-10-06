let heightType = 'external';

function stepVal(id, step, min = 0) {
    const input = document.getElementById(id);
    let val = (parseFloat(input.value) || 0) + step;
    if (val < min) val = min;
    input.value = val;
    calculateShelves();
}

function setType(type) {
    heightType = type;
    const btnExt = document.getElementById('btnTypeExt');
    const btnInt = document.getElementById('btnTypeInt');
    const lbl = document.getElementById('lblHeight');

    if(type === 'external') {
        btnExt.classList.add('active');
        btnInt.classList.remove('active');
        lbl.innerText = 'Wysokość zewnętrzna';
    } else {
        btnInt.classList.add('active');
        btnExt.classList.remove('active');
        lbl.innerText = 'Wysokość wewnątrz';
    }
    calculateShelves();
}

function calculateShelves() {
    const height = parseFloat(document.getElementById('inpHeight').value) || 0;
    const bodyThick = parseFloat(document.getElementById('inpBodyThick').value) || 0;
    const shelfThick = parseFloat(document.getElementById('inpShelfThick').value) || 0;
    const shelfCount = parseInt(document.getElementById('inpShelfCount').value) || 0;

    if(height <= 0 || shelfCount <= 0) return;

    const internalHeight = heightType === 'external' ? (height - 2 * bodyThick) : height;
    const totalShelfThickness = shelfCount * shelfThick;
    const clearSpace = (internalHeight - totalShelfThickness) / (shelfCount + 1);

    document.getElementById('resClearSpace').innerText = `${clearSpace.toFixed(1)} mm`;

    const listEl = document.getElementById('measuresList');
    listEl.innerHTML = '';

    const shelvesData = [];

    for(let i = 1; i <= shelfCount; i++) {
        const bottomEdge = (i * clearSpace) + ((i - 1) * shelfThick);
        const centerEdge = bottomEdge + (shelfThick / 2);
        const topEdge = bottomEdge + shelfThick;

        shelvesData.push({ i, bottomEdge, centerEdge, topEdge });

        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <span class="shelf-num">Półka #${i} (od dołu)</span>
            <span class="shelf-dim">Dół: ${bottomEdge.toFixed(1)} mm | Oś: ${centerEdge.toFixed(1)} mm</span>
        `;
        listEl.appendChild(row);
    }

    drawShelvesSVG(internalHeight, bodyThick, shelfThick, shelfCount, clearSpace, shelvesData);
}

function drawShelvesSVG(intH, bodyT, shelfT, count, clearS, shelves) {
    const cad = document.getElementById('cadContainer');
    
    const strokeColor = isDarkMode ? '#F2F2F7' : '#1C1C1E';
    const accentColor = isDarkMode ? '#0A84FF' : '#007AFF';
    const fillColor = isDarkMode ? '#2C2C2E' : '#E5E5EA';

    const totalH = intH + 2 * bodyT;
    const svgH = 320;
    const svgW = 220;

    const scale = (svgH - 40) / totalH;
    const scaledBodyT = Math.max(bodyT * scale, 5);

    let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`;

    const startY = 20;
    const startX = 30;
    const boxW = 100;
    const scaledTotalH = totalH * scale;

    // Wieniec górny i dolny
    svg += `<rect x="${startX}" y="${startY}" width="${boxW}" height="${scaledBodyT}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" rx="1"/>`;
    svg += `<rect x="${startX}" y="${startY + scaledTotalH - scaledBodyT}" width="${boxW}" height="${scaledBodyT}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" rx="1"/>`;

    // Bok tylny
    svg += `<rect x="${startX}" y="${startY}" width="${scaledBodyT}" height="${scaledTotalH}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" rx="1"/>`;

    // Półki
    shelves.forEach(s => {
        const shelfY = startY + scaledTotalH - scaledBodyT - (s.topEdge * scale);
        const scaledShelfT = Math.max(shelfT * scale, 3);
        svg += `<rect x="${startX + scaledBodyT}" y="${shelfY}" width="${boxW - scaledBodyT}" height="${scaledShelfT}" fill="${accentColor}" rx="1"/>`;
        
        // Linia wymiarowa dolnej krawędzi
        const bottomEdgeY = shelfY + scaledShelfT;
        svg += `<line x1="${startX + boxW + 5}" y1="${bottomEdgeY}" x2="${startX + boxW + 40}" y2="${bottomEdgeY}" stroke="${accentColor}" stroke-width="1" stroke-dasharray="3,3"/>`;
        svg += `<text x="${startX + boxW + 45}" y="${bottomEdgeY + 3}" fill="${strokeColor}" font-size="10" font-weight="600">${s.bottomEdge.toFixed(0)}</text>`;
    });

    svg += `</svg>`;
    cad.innerHTML = svg;
}

// Inicjalizacja obliczeń dla półek
calculateShelves();
