let drawerWidthType = 'external';

const systemHeights = {
    rejs_ultrabox: [
        { label: '86 mm', value: 86 },
        { label: '118 mm', value: 118 },
        { label: '167 mm', value: 167 },
        { label: '199 mm', value: 199 }
    ],
    blum_antaro: [
        { label: 'N (68 mm)', value: 68 },
        { label: 'M (84 mm)', value: 84 },
        { label: 'K (116 mm)', value: 116 },
        { label: 'C (167 mm)', value: 167 },
        { label: 'D (199 mm)', value: 199 }
    ],
    blum_merivobox: [
        { label: 'N (69 mm)', value: 69 },
        { label: 'M (91 mm)', value: 91 },
        { label: 'K (123 mm)', value: 123 },
        { label: 'E (192 mm)', value: 192 }
    ],
    blum_legrabox: [
        { label: 'N (63 mm)', value: 63 },
        { label: 'M (91 mm)', value: 91 },
        { label: 'K (123 mm)', value: 123 },
        { label: 'C (177 mm)', value: 177 },
        { label: 'F (241 mm)', value: 241 }
    ],
    gtv_axispro: [
        { label: 'Niska (84 mm)', value: 84 },
        { label: 'Średnia (116 mm)', value: 116 },
        { label: 'Wysoka (168 mm)', value: 168 },
        { label: 'Bardzo wysoka (199 mm)', value: 199 }
    ],
    gtv_modernbox: [
        { label: 'Niska (84 mm)', value: 84 },
        { label: 'Średnia (135 mm)', value: 135 },
        { label: 'Wysoka (199 mm)', value: 199 }
    ],
    hettich_atira: [
        { label: 'Niska (70 mm)', value: 70 },
        { label: 'Średnia (144 mm)', value: 144 },
        { label: 'Wysoka (176 mm)', value: 176 }
    ],
    hettich_antech: [
        { label: 'Wysokość 101 mm', value: 101 },
        { label: 'Wysokość 139 mm', value: 139 },
        { label: 'Wysokość 187 mm', value: 187 },
        { label: 'Wysokość 251 mm', value: 251 }
    ]
};

function stepDrawerVal(id, step, min = 0) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = (parseFloat(input.value) || 0) + step;
    if (val < min) val = min;
    input.value = val;
    calculateDrawers();
}

function setDrawerType(type) {
    drawerWidthType = type;
    const btnExt = document.getElementById('btnDrawerTypeExt');
    const btnInt = document.getElementById('btnDrawerTypeInt');
    const lbl = document.getElementById('lblDrawerWidth');
    const rowBodyThick = document.getElementById('rowBodyThick');

    if (type === 'external') {
        btnExt.classList.add('active');
        btnInt.classList.remove('active');
        lbl.innerText = 'Szerokość zewnętrzna';
        if (rowBodyThick) rowBodyThick.style.display = 'flex';
    } else {
        btnInt.classList.add('active');
        btnExt.classList.remove('active');
        lbl.innerText = 'Szerokość wewnątrz';
        if (rowBodyThick) rowBodyThick.style.display = 'none';
    }
    calculateDrawers();
}

function updateHeightSelectOptions() {
    const system = document.getElementById('selDrawerSystem').value;
    const heightSelect = document.getElementById('selDrawerHeight');
    if (!heightSelect) return;

    const heights = systemHeights[system] || systemHeights.rejs_ultrabox;
    let html = '';
    heights.forEach(h => {
        html += `<option value="${h.value}">${h.label}</option>`;
    });
    heightSelect.innerHTML = html;
}

function onDrawerSystemChange() {
    updateHeightSelectOptions();
    calculateDrawers();
}

function calculateDrawers() {
    const system = document.getElementById('selDrawerSystem').value;
    const rawWidth = parseFloat(document.getElementById('inpDrawerWidth').value) || 0;
    const bodyThick = parseFloat(document.getElementById('inpDrawerBodyThick').value) || 0;
    const runnerLength = parseFloat(document.getElementById('selDrawerLength').value) || 0;
    const drawerHeight = parseFloat(document.getElementById('selDrawerHeight').value) || 0;

    if (rawWidth <= 0) return;

    const intWidth = drawerWidthType === 'external' ? (rawWidth - (2 * bodyThick)) : rawWidth;
    document.getElementById('resDrawerIntWidth').innerText = `${intWidth.toFixed(1)} mm`;

    let bottomW = 0, bottomL = 0, backW = 0, backH = drawerHeight;
    let frontPanelW = 0, frontRailingW = 0, synchroL = 0;

    const rowFrontRailing = document.getElementById('rowFrontRailing');
    const rowFrontPanel = document.getElementById('rowFrontPanel');
    const rowSynchro = document.getElementById('rowSynchro');

    switch (system) {
        case 'rejs_ultrabox':
            bottomW = intWidth - 75;
            bottomL = runnerLength - 24;
            backW = intWidth - 87;
            frontPanelW = intWidth - 98;
            frontRailingW = intWidth - 85;
            synchroL = intWidth - 128;
            if (rowFrontRailing) rowFrontRailing.style.display = (drawerHeight === 167 || drawerHeight === 199) ? 'flex' : 'none';
            if (rowFrontPanel) rowFrontPanel.style.display = 'flex';
            if (rowSynchro) rowSynchro.style.display = 'flex';
            break;

        case 'blum_antaro':
            bottomW = intWidth - 75;
            bottomL = runnerLength - 24;
            backW = intWidth - 87;
            synchroL = intWidth - 128;
            if (rowFrontRailing) rowFrontRailing.style.display = 'none';
            if (rowFrontPanel) rowFrontPanel.style.display = 'none';
            if (rowSynchro) rowSynchro.style.display = 'flex';
            break;

        case 'blum_merivobox':
            bottomW = intWidth - 42;
            bottomL = runnerLength - 14;
            backW = intWidth - 42;
            synchroL = intWidth - 128;
            if (rowFrontRailing) rowFrontRailing.style.display = 'none';
            if (rowFrontPanel) rowFrontPanel.style.display = 'none';
            if (rowSynchro) rowSynchro.style.display = 'flex';
            break;

        case 'blum_legrabox':
            bottomW = intWidth - 35;
            bottomL = runnerLength - 10;
            backW = intWidth - 38;
            synchroL = intWidth - 128;
            if (rowFrontRailing) rowFrontRailing.style.display = 'none';
            if (rowFrontPanel) rowFrontPanel.style.display = 'none';
            if (rowSynchro) rowSynchro.style.display = 'flex';
            break;

        case 'gtv_axispro':
            bottomW = intWidth - 75;
            bottomL = runnerLength - 24;
            backW = intWidth - 87;
            synchroL = intWidth - 128;
            if (rowFrontRailing) rowFrontRailing.style.display = 'none';
            if (rowFrontPanel) rowFrontPanel.style.display = 'none';
            if (rowSynchro) rowSynchro.style.display = 'flex';
            break;

        case 'gtv_modernbox':
            bottomW = intWidth - 75;
            bottomL = runnerLength - 24;
            backW = intWidth - 87;
            synchroL = intWidth - 128;
            if (rowFrontRailing) rowFrontRailing.style.display = 'none';
            if (rowFrontPanel) rowFrontPanel.style.display = 'none';
            if (rowSynchro) rowSynchro.style.display = 'flex';
            break;

        case 'hettich_atira':
            bottomW = intWidth - 75;
            bottomL = runnerLength - 20;
            backW = intWidth - 87;
            synchroL = intWidth - 128;
            if (rowFrontRailing) rowFrontRailing.style.display = 'none';
            if (rowFrontPanel) rowFrontPanel.style.display = 'none';
            if (rowSynchro) rowSynchro.style.display = 'flex';
            break;

        case 'hettich_antech':
            bottomW = intWidth - 35;
            bottomL = runnerLength - 12;
            backW = intWidth - 38;
            synchroL = intWidth - 128;
            if (rowFrontRailing) rowFrontRailing.style.display = 'none';
            if (rowFrontPanel) rowFrontPanel.style.display = 'none';
            if (rowSynchro) rowSynchro.style.display = 'flex';
            break;
    }

    document.getElementById('resDrawerBottomDim').innerText = `${bottomW.toFixed(1)} mm x ${bottomL.toFixed(1)} mm`;
    
    const resBackW = document.getElementById('resDrawerBackW');
    const resBackH = document.getElementById('resDrawerBackH');
    if (resBackW) resBackW.innerText = `${backW.toFixed(1)} mm`;
    if (resBackH) resBackH.innerText = `${backH.toFixed(1)} mm`;

    if (document.getElementById('resDrawerFrontPanelW')) document.getElementById('resDrawerFrontPanelW').innerText = `${frontPanelW.toFixed(1)} mm`;
    if (document.getElementById('resDrawerFrontRailingW')) document.getElementById('resDrawerFrontRailingW').innerText = `${frontRailingW.toFixed(1)} mm`;
    if (document.getElementById('resDrawerSynchroDim')) document.getElementById('resDrawerSynchroDim').innerText = `${synchroL.toFixed(1)} mm`;
}

updateHeightSelectOptions();
calculateDrawers();