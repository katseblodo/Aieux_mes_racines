async function loadData() {
    const response = await fetch('souverains.json');
    let data = await response.json();
    
    // 1. Récupérer toutes les dates de début et de fin uniques pour créer des "étages"
    const dates = new Set();
    data.forEach(d => {
        dates.add(d.debut);
        dates.add(d.fin);
    });
    const sortedDates = Array.from(dates).sort((a, b) => a - b);

    renderTimeline(data, sortedDates);
}

function renderTimeline(data, sortedDates) {
    const container = document.getElementById('main-container');
    // On garde les en-têtes mais on vide le reste
    document.querySelectorAll('.entries').forEach(el => el.innerHTML = '');

    // 2. Créer des rangées par période
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const start = sortedDates[i];
        const end = sortedDates[i+1];

        const row = document.createElement('div');
        row.className = 'timeline-row';
        row.innerHTML = `<div class="time-indicator">${start}</div>`;

        // 3. Pour chaque pays, trouver qui règne pendant cet intervalle [start, end]
        ['bretagne', 'france', 'angleterre'].forEach(pays => {
            const col = document.createElement('div');
            col.className = `col-cell ${pays}`;
            
            const souverain = data.find(s => 
                s.pays === pays && (s.debut <= start && s.fin >= end)
            );

            if (souverain) {
                // On n'affiche le nom que si c'est le DEBUT de son règne dans la frise 
                // pour éviter les répétitions trop lourdes, ou on affiche un bloc continu.
                col.innerHTML = `
                    <div class="mini-card">
                        <img src="${souverain.portrait}" class="thumb">
                        <div class="info">
                            <span class="name">${souverain.nom}</span>
                        </div>
                    </div>`;
            }
            row.appendChild(col);
        });
        container.appendChild(row);
    }
}
