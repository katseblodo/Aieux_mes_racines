/**
 * GESTIONNAIRE DE RECHERCHE GÉNÉALOGIQUE
 * Logique de calcul Sosa et structuration JSON
 */

let individuCourant = {};

/**
 * Charge un individu à partir du SOSA et calcule son entourage
 */
function chargerSosa(sosa) {
    sosa = parseInt(sosa);
    const pereSosa = sosa * 2;
    const mereSosa = (sosa * 2) + 1;
    const conjointSosa = (sosa % 2 === 0) ? sosa + 1 : sosa - 1;
    const enfantSosa = Math.floor(sosa / 2);

    // Initialisation de la structure JSON de l'individu
    individuCourant = {
        sosa: sosa,
        nom: "", // A remplir ou charger du CSV
        liens: {
            pere: pereSosa,
            mere: mereSosa,
            conjoint: conjointSosa,
            enfants: enfantSosa > 0 ? [enfantSosa] : []
        },
        recensements: [],
        fratrie: []
    };

    updateUI();
}

/**
 * Génère la grille de recensement basée sur les dates de vie
 */
function genererGrilleRecensement(anneeNaissance, anneeDeces) {
    const tableBody = document.getElementById('recensement-body');
    tableBody.innerHTML = "";
    const fin = anneeDeces || new Date().getFullYear();
    
    for (let annee = 1836; annee <= 1936; annee += 5) {
        if (annee === 1871) annee = 1872;
        if (annee >= anneeNaissance && annee <= fin) {
            const row = `<tr>
                <td>${annee}</td>
                <td><input type="text" placeholder="Ville/Quartier" onchange="updateCensus(${annee}, 'lieu', this.value)"></td>
                <td><input type="text" placeholder="Page/Vue" onchange="updateCensus(${annee}, 'page', this.value)"></td>
                <td><input type="text" placeholder="Infos (métier, foyer...)" onchange="updateCensus(${annee}, 'notes', this.value)"></td>
            </tr>`;
            tableBody.innerHTML += row;
        }
    }
}

/**
 * Met à jour les données de recensement dans l'objet JSON
 */
function updateCensus(annee, champ, valeur) {
    let entry = individuCourant.recensements.find(r => r.annee === annee);
    if (!entry) {
        entry = { annee: annee };
        individuCourant.recensements.push(entry);
    }
    entry[champ] = valeur;
    actualiserJSON();
}

/**
 * Ajoute un frère ou une sœur (stocké dans le futur JSON des parents)
 */
function ajouterFrereSoeur() {
    const nom = prompt("Nom du frère/sœur :");
    if (nom) {
        individuCourant.fratrie.push({ nom: nom });
        actualiserFratrieUI();
    }
}

/**
 * Affiche le JSON en temps réel pour copier/coller
 */
function actualiserJSON() {
    document.getElementById('json-output').value = JSON.stringify(individuCourant, null, 4);
}

// Fonctions UI simplifiées pour l'exemple
function updateUI() {
    document.getElementById('sosa-title').innerText = "Individu SOSA " + individuCourant.sosa;
    document.getElementById('pere-link').innerText = "Père (Sosa " + individuCourant.liens.pere + ")";
    document.getElementById('mere-link').innerText = "Mère (Sosa " + individuCourant.liens.mere + ")";
    document.getElementById('conjoint-link').innerText = "Conjoint (Sosa " + individuCourant.liens.conjoint + ")";
    actualiserJSON();
}
