let isDarkMode = true;
let currentModule = 'home';

// Dynamiczne wczytywanie modułów HTML i JS
async function loadModule(moduleName) {
    const contentContainer = document.getElementById('app-content');
    
    if (moduleName === 'home') {
        document.getElementById('homePage').style.display = 'block';
        contentContainer.innerHTML = '';
        currentModule = 'home';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    document.getElementById('homePage').style.display = 'none';

    try {
        // Pobieranie pliku HTML modułu
        const response = await fetch(`modules/${moduleName}.html`);
        if (!response.ok) throw new Error('Nie znaleziono pliku modułu');
        const html = await response.text();
        contentContainer.innerHTML = html;

        // Ładowanie skryptu JS modułu jeśli jeszcze nie istnieje
        if (!document.getElementById(`script-${moduleName}`)) {
            const script = document.createElement('script');
            script.id = `script-${moduleName}`;
            script.src = `js/modules/${moduleName}.js`;
            document.body.appendChild(script);
        } else {
            // Jeśli skrypt już był wczytany, uruchamiamy przeliczenie
            if (moduleName === 'shelves' && typeof calculateShelves === 'function') {
                calculateShelves();
            }
        }
        
        currentModule = moduleName;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Błąd ładowania modułu:', error);
        contentContainer.innerHTML = `<div class="card"><p style="text-align:center; color:var(--text-secondary);">Moduł w przygotowaniu...</p></div>`;
    }
}

// Obsługa Motywu Dzień / Noc
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const mainLogo = document.getElementById('mainLogo');

function updateThemeIcon() {
    if(isDarkMode) {
        themeIcon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>`;
        if(mainLogo) mainLogo.src = 'logo-white.png';
    } else {
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>`;
        if(mainLogo) mainLogo.src = 'logo-black.png';
    }
}

themeBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if(isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('theme-color-meta').setAttribute('content', '#121214');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('theme-color-meta').setAttribute('content', '#F4F4F6');
    }
    updateThemeIcon();
    if(currentModule === 'shelves' && typeof calculateShelves === 'function') calculateShelves();
});

// Inicjalizacja
updateThemeIcon();