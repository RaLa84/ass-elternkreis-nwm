(function() {
    var SHEETDB_URL = 'https://sheetdb.io/api/v1/sww9evharkcun';
    var storageKey = 'survey_' + location.pathname;

    var widget = document.getElementById('survey-widget');
    if (!widget) return;

    var buttons = widget.querySelector('.survey-buttons');
    var response = document.getElementById('survey-response');

    if (localStorage.getItem(storageKey)) {
        buttons.innerHTML = '';
        response.textContent = 'Du hast bereits abgestimmt — danke!';
        response.style.color = '#2d6a4f';
        return;
    }

    window.submitSurvey = function(vote) {
        var btns = widget.querySelectorAll('button');
        btns.forEach(function(b) { b.disabled = true; b.style.opacity = '0.5'; });

        fetch(SHEETDB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    Seite: document.title,
                    Bewertung: vote,
                    Datum: new Date().toISOString()
                }
            })
        })
        .then(function(r) { return r.json(); })
        .then(function() {
            localStorage.setItem(storageKey, '1');
            buttons.innerHTML = '';
            response.textContent = 'Danke für dein Feedback!';
            response.style.color = '#2d6a4f';
        })
        .catch(function() {
            response.textContent = 'Fehler beim Senden. Bitte versuche es später erneut.';
            response.style.color = '#dc2626';
            btns.forEach(function(b) { b.disabled = false; b.style.opacity = '1'; });
        });
    };
})();
