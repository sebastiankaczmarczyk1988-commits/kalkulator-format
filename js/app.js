// Główny skrypt aplikacji FOR.MAT

let currentModule = 'home';
let lastBackPressTime = 0;

// Dynamiczne ładowanie modułów
function loadModule(moduleName) {
    const appContent = document.getElementById('app-content');
    const homePage = document.getElementById('homePage');
    const navItems = document.querySelectorAll('.nav-item');

    if (!appContent || !homePage) return;

    // Aktualizacja stanu nawigacji
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`'${moduleName}'`)) {
            item.classList.add('active');
        }
    });

    if (moduleName === 'home') {
        appContent.innerHTML = '';
        appContent.style.display = 'none';
        homePage.style.display = 'block';
        currentModule = 'home';
        
        if (history.state?.module !== 'home') {
            history.pushState({ module: 'home' }, '', '#home');
        }
        return;
    }

    homePage.style.display = 'none';
    appContent.style.display = 'block';
    currentModule = moduleName;

    if (history.state?.module !== moduleName) {
        history.pushState({ module: moduleName }, '', `#${moduleName}`);
    }

    // Pobieranie szablonu HTML modułu
    fetch(`modules/${moduleName}.html?v=${Date.now()}`)
        .then(response => {
            if (!response.ok) throw new Error('Błąd ładowania pliku modułu');
            return response.text();
        })
        .then(html => {
            appContent.innerHTML = html;

            // Czyszczenie starego skryptu modułu
            const oldScript = document.getElementById('module-script');
            if (oldScript) oldScript.remove();

            // Tworzenie nowego skryptu
            const script = document.createElement('script');
            script.id = 'module-script';
            script.src = `js/modules/${moduleName}.js?v=${Date.now()}`;
            
            // Po załadowaniu skryptu upewniamy się, że wywołana zostanie funkcja wyliczająca / rysująca
            script.onload = () => {
                if (moduleName === 'shelves' && typeof calculateShelves === 'function') {
                    calculateShelves();
                }
            };

            document.body.appendChild(script);

            // Przewijanie na górę
            window.scrollTo(0, 0);
        })
        .catch(err => {
            console.error(err);
            appContent.innerHTML = `<div class="card"><p style="color:red;">Błąd ładowania modułu ${moduleName}. Sprawdź połączenie.</p></div>`;
        });
}

// OBSŁUGA PRZYCISKU WSTECZ (Gesty mobilne / Android / iOS)
window.addEventListener('popstate', function (event) {
    if (currentModule !== 'home') {
        loadModule('home');
    } else {
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
            return;
        } else {
            lastBackPressTime = now;
            history.pushState({ module: 'home' }, '', '#home');
            showToast('Naciśnij ponownie Wstecz, aby wyjść');
        }
    }
});

// Szybkie powiadomienie Toast
function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 75px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: #fff;
            padding: 10px 18px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 2000);
}

// Inicjalizacja przy pierwszym otwarciu strony
document.addEventListener('DOMContentLoaded', () => {
    history.replaceState({ module: 'home' }, '', '#home');
    loadModule('home');
});