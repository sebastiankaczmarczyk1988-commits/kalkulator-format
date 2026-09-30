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
    const bottomMargin = parseFloat(document.getElementById('inpBottomMargin').value) || 0;

    if (frontW <= 0 || frontH <= 0 || count <= 0) return;

    // Margines boczny (frezowanie wyśrodkowane po szerokości)
    const sideMargin = (frontW - slotW) / 2;
    const totalVentH = (count * cutterD) + ((count - 1) * gap);
    const centerX = frontW / 2;

    // Powierzchnia całkowita w cm² (w przybliżeniu prostokąty + zaokrąglenia)
    const singleSlotArea = (slotW - cutterD) * cutterD + Math.PI * Math.pow(cutterD / 2, 2);
    const totalAreaCm2 = (singleSlotArea * count) / 100;

    document.getElementById('resVentSideMargin').innerText = `${sideMargin.toFixed(1)} mm`;
    document.getElementById('resVentTotalH').innerText = `${totalVentH.toFixed(1)} mm`;
    document.getElementById('resVentCenterX').innerText = `${centerX.toFixed(1)} mm`;
    document.getElementById('resVentArea').innerText = `${totalAreaCm2.toFixed(1)} cm²`;

    drawVentilationSVG(frontW, frontH, slotW, cutterD, count, gap, bottomMargin, sideMargin, totalVentH);
}

function drawVentilationSVG(fW, fH, sW, cD, count, gap, bMargin, sMargin, totalVentH) {
    const cad = document.getElementById('ventCadContainer');
    if (!cad) return;

    const strokeColor = isDarkMode ? '#F2F2F7' : '#1C1C1E';
    const accentColor = isDarkMode ? '#0A84FF' : '#007AFF';
    const fillColor = isDarkMode ? '#2C2C2E' : '#E5E5EA';

    const maxBoxDim = 320;
    const scale = Math.min(maxBoxDim / fW, maxBoxDim / fH);

    const svgW = fW * scale + 80;
    const svgH = fH * scale + 60;

    const startX = 40;
    const startY = 20;

    const scaledFW = fW * scale;
    const scaledFH = fH * scale;

    let svg = `<svg id="ventSvgGraphic" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`;

    // Outline frontu
    svg += `<rect x="${startX}" y="${startY}" width="${scaledFW}" height="${scaledFH}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" rx="3"/>`;

    // Sloty wentylacyjne (rysujemy od dołu)
    const r = (cD / 2) * scale;
    for (let i = 0; i < count; i++) {
        const slotYFromBottom = bMargin + (i * (cD + gap));
        const slotY = startY + scaledFH - ((slotYFromBottom + cD) * scale);
        const slotX = startX + (sMargin * scale);
        const scaledSW = sW * scale;
        const scaledCD = cD * scale;

        // Zaokrąglony prostokąt imitujący frezowanie frezem palcowym
        svg += `<rect x="${slotX}" y="${slotY}" width="${scaledSW}" height="${scaledCD}" rx="${r}" fill="${accentColor}" opacity="0.9"/>`;
    }

    // Linia wymiarowa marginesu bocznego (sMargin)
    const dimY = startY + scaledFH + 18;
    const firstSlotX = startX + (sMargin * scale);
    svg += `<line x1="${startX}" y1="${dimY}" x2="${firstSlotX}" y2="${dimY}" stroke="${accentColor}" stroke-width="1.2"/>`;
    svg += `<text x="${startX + (firstSlotX - startX) / 2}" y="${dimY - 4}" fill="${strokeColor}" font-size="10" font-weight="700" text-anchor="middle">${sMargin.toFixed(0)} mm</text>`;

    // Linia wymiarowa długości slotu (sW)
    const endSlotX = firstSlotX + (sW * scale);
    svg += `<line x1="${firstSlotX}" y1="${dimY}" x2="${endSlotX}" y2="${dimY}" stroke="${strokeColor}" stroke-width="1.2"/>`;
    svg += `<text x="${firstSlotX + (endSlotX - firstSlotX) / 2}" y="${dimY - 4}" fill="${strokeColor}" font-size="10" font-weight="700" text-anchor="middle">${sW.toFixed(0)} mm</text>`;

    // Linia wymiarowa wysokości od dołu (bMargin)
    const dimX = startX - 15;
    const bottomY = startY + scaledFH;
    const firstSlotY = startY + scaledFH - (bMargin * scale);
    svg += `<line x1="${dimX}" y1="${bottomY}" x2="${dimX}" y2="${firstSlotY}" stroke="${accentColor}" stroke-width="1.2"/>`;
    svg += `<text x="${dimX - 4}" y="${bottomY - (bottomY - firstSlotY) / 2}" fill="${strokeColor}" font-size="10" font-weight="700" text-anchor="end">${bMargin.toFixed(0)} mm</text>`;

    svg += `</svg>`;
    cad.innerHTML = svg;
}

// Eksport do pliku PDF
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