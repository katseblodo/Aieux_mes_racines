let data = [];

async function loadData() {
    const response = await fetch('souverains.json');
    data = await response.json();
    // Tri par date de début
    data.sort((a, b) => a.debut - b.debut);
    renderTimeline(data);
}

function renderTimeline(items) {
    // On vide les 3 colonnes
    const cols = {
        'bretagne': document.querySelector('#col-bretagne .entries'),
        'france': document.querySelector('#col-france .entries'),
        'angleterre': document.querySelector('#col-angleterre .entries')
    };
    
    Object.values(cols).forEach(el => el.innerHTML = '');

    items.forEach(item => {
        const targetCol = cols[item.pays];
        if (!targetCol) return;

        const card = document.createElement('div');
        card.className = `card ${item.pays}`;
        
        card.innerHTML = `
            <div class="content">
                <span class="date-label">${item.debut} - ${item.fin}</span>
                <h3>${item.nom}</h3>
                <img src="${item.portrait}" style="width:60px; height:60px; float:right; border-radius:5px; margin-left:10px;">
                <p><strong>${item.titre}</strong></p>
                <p class="event"><small>${item.evenement}</small></p>
                <p style="font-size:0.8em; color:gray;">Maison: ${item.maison}</p>
            </div>
        `;
        targetCol.appendChild(card);
    });
}

// La fonction filterTimeline reste la même, elle filtrera juste les données envoyées
function filterTimeline(country) {
    if (country === 'all') {
        renderTimeline(data);
    } else {
        const filtered = data.filter(item => item.pays === country);
        renderTimeline(filtered);
    }
}

loadData();
