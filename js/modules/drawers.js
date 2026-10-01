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

function calculateDrawers() {
    const rawWidth = parseFloat(document.getElementById('inpDrawerWidth').value) || 0;
    const bodyThick = parseFloat(document.getElementById('inpDrawerBodyThick').value) || 0;
    const runnerLength = parseFloat(document.getElementById('selDrawerLength').value) || 0;
    const drawerHeight = parseFloat(document.getElementById('selDrawerHeight').value) || 0;

    if (rawWidth <= 0) return;

    const intWidth = drawerWidthType === 'external' ? (rawWidth - (2 * bodyThick)) : rawWidth;
    document.getElementById('resDrawerIntWidth').innerText = `${intWidth.toFixed(1)} mm`;

    const bottomW = intWidth - 75;
    const bottomL = runnerLength - 24;
    const backW = intWidth - 87;
    const backH = drawerHeight;
    const frontPanelW = intWidth - 98;
    const frontRailingW = intWidth - 85;
    const synchroL = intWidth - 128;

    document.getElementById('resDrawerBottomDim').innerText = `${bottomW.toFixed(1)} mm x ${bottomL.toFixed(1)} mm`;
    
    const resBackW = document.getElementById('resDrawerBackW');
    const resBackH = document.getElementById('resDrawerBackH');
    if (resBackW) resBackW.innerText = `${backW.toFixed(1)} mm`;
    if (resBackH) resBackH.innerText = `${backH.toFixed(1)} mm`;

    document.getElementById('resDrawerFrontPanelW').innerText = `${frontPanelW.toFixed(1)} mm`;

    const rowFrontRailing = document.getElementById('rowFrontRailing');
    if (drawerHeight === 167 || drawerHeight === 199) {
        document.getElementById('resDrawerFrontRailingW').innerText = `${frontRailingW.toFixed(1)} mm`;
        if (rowFrontRailing) rowFrontRailing.style.display = 'flex';
    } else {
        if (rowFrontRailing) rowFrontRailing.style.display = 'none';
    }

    document.getElementById('resDrawerSynchroDim').innerText = `${synchroL.toFixed(1)} mm`;
}

calculateDrawers();