let data = [];

async function loadData() {
    const response = await fetch('souverains.json');
    data = await response.json();
    // Tri par date de début
    data.sort((a, b) => a.debut - b.debut);
    renderTimeline(data);
}

function renderTimeline(items) {
    const container = document.getElementById('timeline');
    container.innerHTML = '';

    // Dictionnaire des drapeaux/emojis
    const flags = {
        'france': '🇫🇷',
        'bretagne': '🏴󠁦󠁲󠁢󠁲󠁥󠁿', // Note: Le drapeau Hermine peut varier selon le support, on peut utiliser une image sinon
        'angleterre': '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    };

    items.forEach((item, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const card = document.createElement('div');
        card.className = `card ${side} ${item.pays}`;
        
        card.innerHTML = `
            <div class="content">
                <div style="font-size: 1.5em; margin-bottom: 5px;">${flags[item.pays] || ''}</div>
                <h3>${item.nom}</h3>
                <img src="${item.portrait}" alt="${item.nom}">
                <p><strong>${item.titre}</strong></p>
                <p>📅 ${item.debut} - ${item.fin}</p>
                <span class="country-badge badge-${item.pays}">${item.pays}</span>
                <p><small>🏰 Maison : ${item.maison}</small></p>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterTimeline(country) {
    if (country === 'all') {
        renderTimeline(data);
    } else {
        const filtered = data.filter(item => item.pays === country);
        renderTimeline(filtered);
    }
}

loadData();
