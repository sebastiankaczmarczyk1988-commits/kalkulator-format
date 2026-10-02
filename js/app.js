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
        
        // Zapisujemy stan w historii przeglądarki
        if (history.state?.module !== 'home') {
            history.pushState({ module: 'home' }, '', '#home');
        }
        return;
    }

    // Ładowanie modułu
    homePage.style.display = 'none';
    appContent.style.display = 'block';
    currentModule = moduleName;

    // Aktualizacja historii przeglądarki (History API)
    if (history.state?.module !== moduleName) {
        history.pushState({ module: moduleName }, '', `#${moduleName}`);
    }

    // Pobieranie szablonu HTML modułu z pętlą unikania pamięci podręcznej (cache-busting)
    fetch(`modules/${moduleName}.html?v=${Date.now()}`)
        .then(response => {
            if (!response.ok) throw new Error('Błąd ładowania pliku modułu');
            return response.text();
        })
        .then(html => {
            appContent.innerHTML = html;

            // Dynamiczne podpinanie dedykowanego pliku JS dla modułu
            const oldScript = document.getElementById('module-script');
            if (oldScript) oldScript.remove();

            const script = document.createElement('script');
            script.id = 'module-script';
            script.src = `js/modules/${moduleName}.js?v=${Date.now()}`;
            document.body.appendChild(script);

            // Przewijanie na górę ekranu
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
        // Jeśli jesteśmy w module -> wracamy do menu głównego
        loadModule('home');
    } else {
        // Jeśli jesteśmy w menu głównym -> logika "Dwuklik wstecz aby wyjść"
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
            // Drugie kliknięcie w ciągu 2 sekund -> pozwól na wyjście / zamknięcie
            return;
        } else {
            // Pierwsze kliknięcie w menu -> zablokuj wyjście i pokaż podpowiedź
            lastBackPressTime = now;
            history.pushState({ module: 'home' }, '', '#home');
            showToast('Naciśnij ponownie Wstecz, aby wyjść');
        }
    }
});

// Szybkie powiadomienie Toast na dole ekranu
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
    // Ustawienie punktu początkowego w historii
    history.replaceState({ module: 'home' }, '', '#home');
    loadModule('home');
});