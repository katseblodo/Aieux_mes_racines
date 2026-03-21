/**
 * GENERATION ET GESTION DE RECHERCHE GENEALOGIQUE
 * Version : 2.0 Pro
 */

let baseIndividus = []; // Données issues du CSV
let individuActuel = {};

/**
 * Initialisation : Chargement automatique du CSV au lancement
 */
window.onload = async () => {
    try {
        const response = await fetch('individus_nettoye.csv');
        const data = await response.text();
        baseIndividus = parseCSV(data);
        console.log("CSV chargé : " + baseIndividus.length + " individus.");
    } catch (err) {
        alert("Erreur de chargement du fichier individus_nettoye.csv. Vérifiez qu'il est à la racine.");
    }
};

/**
 * Parseur CSV optimisé (gère les points-virgules et guillemets)
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(';');
    return lines.slice(1).map(line => {
        const values = line.split(';');
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = values[i] ? values[i].trim() : "");
        return obj;
    });
}

/**
 * Charge un individu et prédit son entourage via les numéros de SOSA
 */
function chargerSosa(sosaId) {
    const sosa = parseInt(sosaId);
    const csvInd = baseIndividus.find(i => parseInt(i.sosa) === sosa);
    
    // Structure JSON exhaustive (Champs à trouver sur Internet pour un généalogiste pro)
    individuActuel = {
        sosa: sosa,
        etat_civil: csvInd || { nom_prenom: "Inconnu" },
        parents: {
            pere: getRelative(sosa * 2),
            mere: getRelative(sosa * 2 + 1)
        },
        conjoint: getRelative(sosa % 2 === 0 ? sosa + 1 : sosa - 1),
        enfants: baseIndividus.filter(i => Math.floor(parseInt(i.sosa)) === Math.floor(sosa / 2)),
        // DONNEES DE RECHERCHE A COMPLETER
        recherche_militaire: {
            classe: "", bureau: "", matricule: "", degre_instruction: "",
            description_physique: { taille: "", yeux: "", front: "", nez: "" }
        },
        recensements: [], // Liste des domiciles par année
        actes_notaries: [], // Contrats de mariage, Testaments, Inventaires après décès
        sante: { cause_deces: "", maladies_chroniques: "" },
        signe: "Inconnu" // Sait signer ? Oui/Non
    };

    remplirInterface();
}

/**
 * Récupère un proche dans la base CSV
 */
function getRelative(sosa) {
    return baseIndividus.find(i => parseInt(i.sosa) === sosa) || { sosa: sosa, nom_prenom: "Non défini" };
}

/**
 * Met à jour le tableau des recensements et l'UI
 */
function remplirInterface() {
    const ind = individuActuel.etat_civil;
    document.getElementById('nom_header').innerText = ind.nom_prenom;
    
    // Calcul automatique classe militaire
    if (ind.date_naissance) {
        const annee = parseInt(ind.date_naissance.split('/').pop());
        if (!isNaN(annee)) {
            individuActuel.recherche_militaire.classe = annee + 20;
            genererGrilleRecensement(annee, ind.date_deces);
        }
    }
    
    actualiserJSON();
}

/**
 * Génère la grille de saisie pour les recensements (1836-1936)
 */
function genererGrilleRecensement(birth, death) {
    const tbody = document.getElementById('census_body');
    tbody.innerHTML = "";
    const end = death ? parseInt(death.split('/').pop()) : 1946;

    const annees = [1836, 1841, 1846, 1851, 1856, 1861, 1866, 1872, 1876, 1881, 1886, 1891, 1896, 1901, 1906, 1911, 1921, 1926, 1931, 1936];
    
    annees.forEach(a => {
        if (a >= birth && a <= end) {
            const row = `<tr>
                <td>${a}</td>
                <td><input type="text" placeholder="Lieu" oninput="updateCensus(${a}, 'lieu', this.value)"></td>
                <td><input type="text" placeholder="Vue/Page" oninput="updateCensus(${a}, 'vue', this.value)"></td>
                <td><input type="text" placeholder="Observation" oninput="updateCensus(${a}, 'obs', this.value)"></td>
            </tr>`;
            tbody.innerHTML += row;
        }
    });
}

function updateCensus(annee, champ, val) {
    let rec = individuActuel.recensements.find(r => r.annee === annee);
    if (!rec) { rec = { annee: annee }; individuActuel.recensements.push(rec); }
    rec[champ] = val;
    actualiserJSON();
}

function actualiserJSON() {
    document.getElementById('json_preview').value = JSON.stringify(individuActuel, null, 4);
}
