function stepHingeVal(id, step) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = (parseFloat(input.value) || 0) + step;
    if (val < 0) val = 0;
    input.value = val;
    draw();
}

function toggleFrame() {
    const type = document.getElementById('type').value;
    const frameGroup = document.getElementById('frame_width_group');
    if (frameGroup) {
        frameGroup.style.display = type === 'frame' ? 'flex' : 'none';
    }
}

function draw(forceW, forceH) {
    const hEl = document.getElementById('h');
    const wEl = document.getElementById('w');
    if (!hEl || !wEl) return;

    const H = parseFloat(hEl.value) || 0;
    const W = parseFloat(wEl.value) || 0;
    const type = document.getElementById('type').value;
    const frameWidth = parseFloat(document.getElementById('frame_width').value) || 40;
    const axisOffset = parseFloat(document.getElementById('axis_offset').value) || 21.5;
    const side = document.getElementById('side').value;
    const title = document.getElementById('title').value || "Brak nazwy";
    const company = document.getElementById('company').value || "";
    const job = document.getElementById('job').value || "";

    const stronaTxt = side === 'left' ? 'Front LEWY' : 'Front PRAWY';
    const typTxt = type === 'frame' ? `Ramka ${frameWidth} mm` : 'Pełny';

    document.getElementById('out-title').innerText = `${title} (${stronaTxt})`;
    document.getElementById('out-meta').innerText = `Wymiary frontu: ${H} x ${W} mm | Typ: ${typTxt} | ${stronaTxt} | Puszka: Ø35 mm | Oś puszki: ${axisOffset} mm`;
    document.getElementById('out-company').innerText = company;
    document.getElementById('out-job').innerText = job;
    document.getElementById('out-footer-center').innerText = `Typ: ${typTxt} | Średnica puszki: Ø35 mm | Oś od krawędzi: ${axisOffset} mm`;

    const svg = document.getElementById('svg');
    if (!svg) return;
    svg.innerHTML = '';

    if (H <= 0 || W <= 0) return;

    const dolne = ['d1', 'd2', 'd3'].map(id => parseFloat(document.getElementById(id).value)).filter(v => !isNaN(v));
    const gorne = ['g1', 'g2', 'g3'].map(id => parseFloat(document.getElementById(id).value)).filter(v => !isNaN(v));

    const svgW = forceW || svg.clientWidth || 800;
    const svgH = forceH || svg.clientHeight || 1000;
    
    const maxOffset = Math.max(dolne.length, gorne.length) * 30 + 60;
    const paddingX = maxOffset + 50;
    const paddingY = 80;

    const scale = Math.min((svgW - paddingX * 2) / W, (svgH - paddingY * 2) / H);
    
    const boxW = W * scale;
    const boxH = H * scale;
    const startX = (svgW - boxW) / 2;
    const startY = (svgH - boxH) / 2;

    let html = `
    <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#000"/>
        </marker>
    </defs>`;

    html += `<rect x="${startX}" y="${startY}" width="${boxW}" height="${boxH}" fill="none" stroke="#000" stroke-width="2"/>`;

    if (type === 'frame') {
        const framePx = frameWidth * scale;
        if (boxW > framePx * 2 && boxH > framePx * 2) {
            html += `<rect x="${startX + framePx}" y="${startY + framePx}" width="${boxW - framePx * 2}" height="${boxH - framePx * 2}" fill="none" stroke="#64748b" stroke-width="1.2" stroke-dasharray="2,2"/>`;
        }
    }

    const isLeft = side === 'left';
    const axisX = isLeft ? startX + (axisOffset * scale) : startX + boxW - (axisOffset * scale);
    const edgeX = isLeft ? startX : startX + boxW;

    html += `<line x1="${axisX}" y1="${startY - 20}" x2="${axisX}" y2="${startY + boxH + 20}" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1"/>`;
    html += `<line x1="${edgeX}" y1="${startY - 12}" x2="${axisX}" y2="${startY - 12}" stroke="#000" stroke-width="1" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`;
    html += `<text x="${(edgeX + axisX) / 2}" y="${startY - 16}" font-size="10" text-anchor="middle" font-weight="bold">${axisOffset}</text>`;

    const r = (35 / 2) * scale;
    const puszkiY = [];

    dolne.forEach(d => puszkiY.push(startY + boxH - (d * scale)));
    gorne.forEach(g => puszkiY.push(startY + (g * scale)));

    puszkiY.forEach(cy => {
        html += `<circle cx="${axisX}" cy="${cy}" r="${r}" fill="#f1f5f9" stroke="#000" stroke-width="1.5"/>`;
        html += `<line x1="${axisX - r - 3}" y1="${cy}" x2="${axisX + r + 3}" y2="${cy}" stroke="#000" stroke-width="0.8"/>`;
        html += `<line x1="${axisX}" y1="${cy - 8}" x2="${axisX}" y2="${cy + 8}" stroke="#000" stroke-width="0.8"/>`;
    });

    const stepWidth = 30;

    dolne.forEach((d, idx) => {
        const cy = startY + boxH - (d * scale);
        const yBottom = startY + boxH;
        const currentOffset = (idx + 1) * stepWidth;
        const lineX = isLeft ? edgeX - currentOffset : edgeX + currentOffset;

        html += `<line x1="${edgeX}" y1="${yBottom}" x2="${lineX + (isLeft ? -5 : 5)}" y2="${yBottom}" stroke="#64748b" stroke-width="0.8"/>`;
        html += `<line x1="${axisX}" y1="${cy}" x2="${lineX + (isLeft ? -5 : 5)}" y2="${cy}" stroke="#64748b" stroke-width="0.8"/>`;
        html += `<line x1="${lineX}" y1="${yBottom}" x2="${lineX}" y2="${cy}" stroke="#000" stroke-width="1" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`;

        const midY = (yBottom + cy) / 2;
        html += `<text x="${lineX + (isLeft ? -6 : 6)}" y="${midY + 4}" font-size="11" font-weight="bold" text-anchor="${isLeft ? 'end' : 'start'}">${d}</text>`;
    });

    gorne.forEach((g, idx) => {
        const cy = startY + (g * scale);
        const yTop = startY;
        const currentOffset = (idx + 1) * stepWidth;
        const lineX = isLeft ? edgeX - currentOffset : edgeX + currentOffset;

        html += `<line x1="${edgeX}" y1="${yTop}" x2="${lineX + (isLeft ? -5 : 5)}" y2="${yTop}" stroke="#64748b" stroke-width="0.8"/>`;
        html += `<line x1="${axisX}" y1="${cy}" x2="${lineX + (isLeft ? -5 : 5)}" y2="${cy}" stroke="#64748b" stroke-width="0.8"/>`;
        html += `<line x1="${lineX}" y1="${yTop}" x2="${lineX}" y2="${cy}" stroke="#000" stroke-width="1" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`;

        const midY = (yTop + cy) / 2;
        html += `<text x="${lineX + (isLeft ? -6 : 6)}" y="${midY + 4}" font-size="11" font-weight="bold" text-anchor="${isLeft ? 'end' : 'start'}">${g}</text>`;
    });

    const hDimX = isLeft ? startX + boxW + 40 : startX - 40;
    html += `<line x1="${isLeft ? startX + boxW : startX}" y1="${startY}" x2="${hDimX + (isLeft ? 8 : -8)}" y2="${startY}" stroke="#64748b" stroke-width="0.8"/>`;
    html += `<line x1="${isLeft ? startX + boxW : startX}" y1="${startY + boxH}" x2="${hDimX + (isLeft ? 8 : -8)}" y2="${startY + boxH}" stroke="#64748b" stroke-width="0.8"/>`;
    html += `<line x1="${hDimX}" y1="${startY}" x2="${hDimX}" y2="${startY + boxH}" stroke="#000" stroke-width="1" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`;
    html += `<text x="${hDimX + (isLeft ? 15 : -15)}" y="${startY + boxH / 2}" font-size="12" font-weight="bold" transform="rotate(90, ${hDimX + (isLeft ? 15 : -15)}, ${startY + boxH / 2})" text-anchor="middle">${H}</text>`;

    const wDimY = startY + boxH + 35;
    html += `<line x1="${startX}" y1="${startY + boxH}" x2="${startX}" y2="${wDimY + 8}" stroke="#64748b" stroke-width="0.8"/>`;
    html += `<line x1="${startX + boxW}" y1="${startY + boxH}" x2="${startX + boxW}" y2="${wDimY + 8}" stroke="#64748b" stroke-width="0.8"/>`;
    html += `<line x1="${startX}" y1="${wDimY}" x2="${startX + boxW}" y2="${wDimY}" stroke="#000" stroke-width="1" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`;
    html += `<text x="${startX + boxW / 2}" y="${wDimY + 18}" font-size="12" font-weight="bold" text-anchor="middle">${W}</text>`;

    svg.innerHTML = html;
}

// PRZELICZENIE DANYCH W WYMIARACH PROPORCJONALNYCH DLA A4 I WYWOŁANIE DRUKU
function printPDF() {
    draw(1800, 2400);

    setTimeout(() => {
        window.print();
        setTimeout(() => {
            draw();
        }, 500);
    }, 100);
}

// Inicjalizacja przy ładowaniu modułu SPA
toggleFrame();
draw();

// Obsługa automatycznej zmiany rozmiaru okna
window.onresize = function() {
    draw();
};