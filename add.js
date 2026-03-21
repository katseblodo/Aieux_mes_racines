/**
 * Calcule l'année de conscription (20 ans) et les recensements pertinents
 * @param {number} birthYear - Année de naissance
 * @param {number} deathYear - Année de décès (optionnel)
 */
function calculateResearchMilestones(birthYear, deathYear) {
    const endLife = deathYear || new Date().getFullYear();
    
    // 1. Recherche Militaire (Classe = Année de naissance + 20)
    const conscriptionYear = birthYear + 20;
    const militaryHtml = `
        <div class="tool-tip">
            <strong>Recrutement Militaire :</strong><br>
            Chercher la classe <b>${conscriptionYear}</b>.<br>
            Bureau probable : Proche du lieu de résidence à 20 ans.
        </div>`;

    // 2. Recensements (Tous les 5 ans, ex: 1872, 1876, ..., 1901, 1906...)
    let censusYears = [];
    for (let y = 1836; y <= 1936; y += 5) {
        if (y === 1871) y = 1872; // Exception historique
        if (y >= birthYear && y <= endLife) {
            censusYears.push(y);
        }
    }

    const censusHtml = `
        <div class="tool-tip">
            <strong>Recensements disponibles :</strong><br>
            ${censusYears.join(', ')}
        </div>`;

    document.getElementById('military-helper').innerHTML = militaryHtml;
    document.getElementById('census-helper').innerHTML = censusHtml;
}

/**
 * Charge les données depuis le fichier JSON spécifique à l'individu
 * et complète la fratrie en allant chercher le JSON du père/mère.
 */
async function loadIndividual(idSosa) {
    // Note : On simule ici la récupération des données
    // Dans votre outil, cela fetcherait 'data/json/63342.json'
    console.log("Chargement de l'individu SOSA : " + idSosa);
    
    // Exemple de logique pour l'affichage de la fratrie
    // fetch(parentJson).then(data => displayFratrie(data.enfants))
}

/**
 * Génère le squelette JSON pour l'individu
 */
function generateJSONTemplate(ind) {
    return {
        id: ind.sosa,
        nom: ind.nom_prenom,
        recherche_etat_civil: {
            naissance: { statut: "à chercher", archive_url: "" },
            mariage: { statut: "ok", archive_url: "" },
            deces: { statut: "à chercher", archive_url: "" }
        },
        enfants: [], // IDs des enfants
        notes: ""
    };
}
