function stepVentVal(id, step, min = 0) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = (parseFloat(input.value) || 0) + step;
    if (val < min) val = min;
    input.value = val;
    calculateVentilation();
}

function calculateVentilation() {
    const frontW = parseFloat(document.getElementById('inpFrontW').value) || 0;
    const frontH = parseFloat(document.getElementById('inpFrontH').value) || 0;
    const slotW = parseFloat(document.getElementById('inpSlotW').value) || 0;
    const cutterD = parseFloat(document.getElementById('inpCutterD').value) || 0;
    const count = parseInt(document.getElementById('inpSlotCount').value) || 0;
    const gap = parseFloat(document.getElementById('inpGap').value) || 0;
    const topMargin = parseFloat(document.getElementById('inpTopMargin').value) || 0;

    if (frontW <= 0 || frontH <= 0 || count <= 0) return;

    // Margines boczny (wyśrodkowanie)
    const sideMargin = (frontW - slotW) / 2;
    const totalVentH = (count * cutterD) + ((count - 1) * gap);
    const bottomMargin = frontH - topMargin - totalVentH;

    // Powierzchnia całkowita w cm²
    const singleSlotArea = (slotW - cutterD) * cutterD + Math.PI * Math.pow(cutterD / 2, 2);
    const totalAreaCm2 = (singleSlotArea * count) / 100;

    document.getElementById('resVentSideMargin').innerText = `${sideMargin.toFixed(1)} mm`;
    document.getElementById('resVentTotalH').innerText = `${totalVentH.toFixed(1)} mm`;
    document.getElementById('resVentBottomMargin').innerText = `${bottomMargin.toFixed(1)} mm`;
    document.getElementById('resVentArea').innerText = `${totalAreaCm2.toFixed(1)} cm²`;

    drawVentilationSVG(frontW, frontH, slotW, cutterD, count, gap, topMargin, sideMargin, totalVentH);
}

function drawVentilationSVG(fW, fH, sW, cD, count, gap, tMargin, sMargin, totalVentH) {
    const cad = document.getElementById('ventCadContainer');
    if (!cad) return;

    const strokeColor = isDarkMode ? '#F2F2F7' : '#1C1C1E';
    const accentColor = isDarkMode ? '#0A84FF' : '#007AFF';
    const fillColor = isDarkMode ? '#2C2C2E' : '#E5E5EA';

    const maxBoxDim = 280;
    const scale = Math.min(maxBoxDim / fW, maxBoxDim / fH);

    const startX = 65; // Odstęp od lewej na wymiar pionowy
    const startY = 30; // Odstęp od góry

    const svgW = fW * scale + 110;
    const svgH = fH * scale + 65;

    const scaledFW = fW * scale;
    const scaledFH = fH * scale;

    let svg = `<svg id="ventSvgGraphic" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`;

    // Obrys frontu
    svg += `<rect x="${startX}" y="${startY}" width="${scaledFW}" height="${scaledFH}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" rx="3"/>`;

    // Rysowanie slotów OD GÓRY do dołu
    const r = (cD / 2) * scale;
    const slotX = startX + (sMargin * scale);
    const scaledSW = sW * scale;
    const scaledCD = Math.max(cD * scale, 3);

    for (let i = 0; i < count; i++) {
        const slotYFromTop = tMargin + (i * (cD + gap));
        const slotY = startY + (slotYFromTop * scale);

        // Zaokrąglony prostokąt (frezowanie)
        svg += `<rect x="${slotX}" y="${slotY}" width="${scaledSW}" height="${scaledCD}" rx="${r}" fill="${accentColor}" opacity="0.9"/>`;
    }

    // 1. WYMIAR PIONOWY OD GÓRY DO PIERWSZEGO FREZU (tMargin)
    const dimX1 = startX - 20;
    const topY = startY;
    const firstSlotY = startY + (tMargin * scale);

    svg += `<line x1="${dimX1}" y1="${topY}" x2="${dimX1}" y2="${firstSlotY}" stroke="${accentColor}" stroke-width="1.2"/>`;
    svg += `<line x1="${dimX1 - 4}" y1="${topY}" x2="${dimX1 + 4}" y2="${topY}" stroke="${accentColor}" stroke-width="1"/>`;
    svg += `<line x1="${dimX1 - 4}" y1="${firstSlotY}" x2="${dimX1 + 4}" y2="${firstSlotY}" stroke="${accentColor}" stroke-width="1"/>`;
    svg += `<text x="${dimX1 - 6}" y="${topY + (firstSlotY - topY) / 2 + 3}" fill="${strokeColor}" font-size="10" font-weight="700" text-anchor="end">${tMargin.toFixed(0)} mm</text>`;

    // 2. WYMIAR PIONOWY ODSTĘPU MIĘDZY FREZAMI (gap) - jeśli więcej niż 1 slot
    if (count > 1 && gap > 0) {
        const gapSlot1Bottom = startY + ((tMargin + cD) * scale);
        const gapSlot2Top = startY + ((tMargin + cD + gap) * scale);
        const dimX2 = startX - 20;

        svg += `<line x1="${dimX2}" y1="${gapSlot1Bottom}" x2="${dimX2}" y2="${gapSlot2Top}" stroke="${strokeColor}" stroke-width="1.2" stroke-dasharray="2,2"/>`;
        svg += `<text x="${dimX2 - 6}" y="${gapSlot1Bottom + (gapSlot2Top - gapSlot1Bottom) / 2 + 3}" fill="${strokeColor}" font-size="9" font-weight="600" text-anchor="end">odstęp: ${gap.toFixed(0)} mm</text>`;
    }

    // 3. POZIOMY WYMIAR MARGINESU BOCZNEGO (sMargin)
    const dimY = startY + scaledFH + 22;
    const firstSlotX = startX + (sMargin * scale);

    svg += `<line x1="${startX}" y1="${dimY}" x2="${firstSlotX}" y2="${dimY}" stroke="${accentColor}" stroke-width="1.2"/>`;
    svg += `<line x1="${startX}" y1="${dimY - 4}" x2="${startX}" y2="${dimY + 4}" stroke="${accentColor}" stroke-width="1"/>`;
    svg += `<line x1="${firstSlotX}" y1="${dimY - 4}" x2="${firstSlotX}" y2="${dimY + 4}" stroke="${accentColor}" stroke-width="1"/>`;
    svg += `<text x="${startX + (firstSlotX - startX) / 2}" y="${dimY + 14}" fill="${strokeColor}" font-size="10" font-weight="700" text-anchor="middle">${sMargin.toFixed(0)} mm</text>`;

    // 4. POZIOMY WYMIAR DŁUGOŚCI FREZU (sW)
    const endSlotX = firstSlotX + (sW * scale);
    svg += `<line x1="${firstSlotX}" y1="${dimY}" x2="${endSlotX}" y2="${dimY}" stroke="${strokeColor}" stroke-width="1.2"/>`;
    svg += `<line x1="${firstSlotX}" y1="${dimY - 4}" x2="${firstSlotX}" y2="${dimY + 4}" stroke="${strokeColor}" stroke-width="1"/>`;
    svg += `<line x1="${endSlotX}" y1="${dimY - 4}" x2="${endSlotX}" y2="${dimY + 4}" stroke="${strokeColor}" stroke-width="1"/>`;
    svg += `<text x="${firstSlotX + (endSlotX - firstSlotX) / 2}" y="${dimY + 14}" fill="${strokeColor}" font-size="10" font-weight="700" text-anchor="middle">długość: ${sW.toFixed(0)} mm</text>`;

    svg += `</svg>`;
    cad.innerHTML = svg;
}

// Eksport do PDF
function exportVentPDF() {
    const element = document.getElementById('pdfPrintCard');
    if (!element || typeof html2pdf === 'undefined') {
        alert('Generowanie PDF jest niedostępne. Upewnij się, że masz połączenie z internetem.');
        return;
    }

    const opt = {
        margin:       10,
        filename:     `FOR.MAT-frezowanie-kratek-${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

// Inicjalizacja
calculateVentilation();