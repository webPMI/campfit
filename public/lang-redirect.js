// Auto-detect language from localStorage and redirect if needed
(function () {
    var stored = localStorage.getItem('campfit_lang');
    var url = new URL(window.location);
    var urlLang = url.searchParams.get('lang');

    // If we have a stored language and URL doesn't have lang param
    if (stored && !urlLang && stored !== 'es') {
        url.searchParams.set('lang', stored);
        window.location.href = url.toString();
    }

    // If URL has lang param, sync to localStorage
    if (urlLang) {
        localStorage.setItem('campfit_lang', urlLang);
        document.documentElement.lang = urlLang;
    }
})();