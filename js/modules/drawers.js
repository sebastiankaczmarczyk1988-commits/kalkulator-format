let drawerWidthType = 'external';

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

function onDrawerSystemChange() {
    calculateDrawers();
}

function calculateDrawers() {
    const rawWidth = parseFloat(document.getElementById('inpDrawerWidth').value) || 0;
    const bodyThick = parseFloat(document.getElementById('inpDrawerBodyThick').value) || 0;
    const runnerLength = parseFloat(document.getElementById('selDrawerLength').value) || 0;
    const drawerHeight = parseFloat(document.getElementById('selDrawerHeight').value) || 0;
    const isPushToOpen = document.getElementById('chkPushToOpen').checked;

    if (rawWidth <= 0) return;

    // Szerokość wewnętrzna korpusu
    const intWidth = drawerWidthType === 'external' ? (rawWidth - (2 * bodyThick)) : rawWidth;

    document.getElementById('resDrawerIntWidth').innerText = `${intWidth.toFixed(1)} mm`;

    // Wyliczenia dla REJS UltraBox
    // Dno: (Szerokość wewnętrzna - 75 mm) x (Długość prowadnicy - 24 mm)
    const bottomW = intWidth - 75;
    const bottomL = runnerLength - 24;

    // Plecy: (Szerokość wewnętrzna - 87 mm) x Wysokość szuflady
    const backW = intWidth - 87;
    const backH = drawerHeight;

    // Prezentacja wyników
    document.getElementById('resDrawerBottomDim').innerText = `${bottomW.toFixed(1)} mm x ${bottomL.toFixed(1)} mm`;
    
    // Rozbicie wymiaru pleców dla osobnego nadkreślenia szerokości
    const resBackW = document.getElementById('resDrawerBackW');
    const resBackH = document.getElementById('resDrawerBackH');
    if (resBackW) resBackW.innerText = `${backW.toFixed(1)} mm`;
    if (resBackH) resBackH.innerText = `${backH.toFixed(1)} mm`;

    // Push To Open / Synchronizator
    const rowSynchro = document.getElementById('rowSynchronizer');
    if (isPushToOpen) {
        const synchroL = intWidth - 128;
        document.getElementById('resDrawerSynchroDim').innerText = `${synchroL.toFixed(1)} mm`;
        if (rowSynchro) rowSynchro.style.display = 'flex';
    } else {
        if (rowSynchro) rowSynchro.style.display = 'none';
    }
}

// Inicjalizacja wyliczeń przy starcie modułu
calculateDrawers();