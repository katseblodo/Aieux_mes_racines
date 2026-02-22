async function loadData() {
    const response = await fetch('souverains.json');
    const data = await response.json();
    renderTimeline(data);
}

function renderTimeline(data) {
    const container = document.getElementById('main-container');
    container.innerHTML = ''; // On vide tout

    // On trie par date de début
    data.sort((a, b) => a.debut - b.debut);

    // On crée des groupes par tranches de 50 ou 100 ans pour l'alignement
    // Ou plus simple : on crée une ligne par souverain dans l'ordre chronologique global
    data.forEach(souverain => {
        const row = document.createElement('div');
        row.className = 'timeline-row';
        
        // On crée 3 colonnes vides
        const cols = {
            'bretagne': document.createElement('div'),
            'france': document.createElement('div'),
            'angleterre': document.createElement('div')
        };

        Object.keys(cols).forEach(p => cols[p].className = 'col-cell');

        // On remplit la colonne concernée
        cols[souverain.pays].innerHTML = `
            <div class="mini-card active">
                <span class="dates">${souverain.debut} - ${souverain.fin}</span>
                <img src="${souverain.portrait}" class="img-mini">
                <div class="textes">
                    <strong>${souverain.nom}</strong>
                    <p>${souverain.evenement || ''}</p>
                </div>
            </div>
        `;

        // Ajout de la date à gauche
        const dateLabel = document.createElement('div');
        dateLabel.className = 'date-sidebar';
        dateLabel.innerText = souverain.debut;

        row.appendChild(dateLabel);
        row.appendChild(cols['bretagne']);
        row.appendChild(cols['france']);
        row.appendChild(cols['angleterre']);
        container.appendChild(row);
    });
}
loadData();
