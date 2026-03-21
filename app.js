/**
 * GESTIONNAIRE DE RECHERCHE GÉNÉALOGIQUE - EXPERT
 */

let dbIndividus = []; // Stockera les données du CSV

/**
 * Initialisation : Chargement du fichier CSV (simulé ici avec vos données)
 */
async function init() {
    // Dans un usage réel, on fetch le CSV ici
    console.log("Système prêt. En attente d'un numéro SOSA.");
}

/**
 * Recherche un individu par SOSA et peuple l'éditeur
 */
function chargerIndividu() {
    const sosaRecherche = document.getElementById('search-sosa').value;
    
    // Simulation de recherche dans vos données (ex: SOSA 6 - Pierre Marie Quillec)
    // Ici, on imagine que dbIndividus est déjà peuplé par votre CSV
    const ind = {
        sosa: sosaRecherche,
        nom_prenom: "QUILLEC Pierre Marie", // Exemple issu de votre fichier
        profession: "Médecin",
        date_naissance: "13/03/1912",
        lieu_naissance: "Penmarch",
        date_deces: "08/03/2015",
        sexe: "M"
    };

    remplirFormulaire(ind);
    genererAssistantRecherche(ind);
}

/**
 * Remplit les champs de saisie pour modification/complétion
 */
function remplirFormulaire(ind) {
    document.getElementById('f_nom').value = ind.nom_prenom;
    document.getElementById('f_prof').value = ind.profession;
    document.getElementById('f_naiss_date').value = ind.date_naissance;
    document.getElementById('f_naiss_lieu').value = ind.lieu_naissance;
    // ... etc pour tous les champs
}

/**
 * Génère les conseils de recherche (Militaire, Recensements)
 */
function genererAssistantRecherche(ind) {
    const anneeNaiss = parseInt(ind.date_naissance.split('/').pop());
    const anneeDeces = ind.date_deces ? parseInt(ind.date_deces.split('/').pop()) : 2024;
    
    // Logique Militaire
    const classe = anneeNaiss + 20;
    let milHtml = `<strong>Classe ${classe}</strong> : `;
    if (classe >= 1867) {
        milHtml += "Consulter les Registres Matricules (AD).";
    }

    // Logique Recensements
    let recensements = [];
    for (let a = 1836; a <= 1936; a += 5) {
        if (a >= anneeNaiss && a <= anneeDeces) recensements.push(a);
    }

    document.getElementById('militaire-advice').innerHTML = milHtml;
    document.getElementById('recensement-list').innerText = recensements.join(', ');
    
    // Création du template JSON exhaustif
    construireJSON(ind, recensements);
}

/**
 * Construit le JSON final avec les champs de suivi de recherche
 */
function construireJSON(ind, recensements) {
    const researchJSON = {
        individu: ind,
        suivi_actes: {
            naissance: { etat: "A vérifier", lien: "" },
            mariage: { etat: "A chercher", lien: "" },
            deces: { etat: "Ok", lien: "" }
        },
        recherches_effectuees: {
            militaire: { fait: false, cote: "" },
            recensements: recensements.map(y => ({ annee: y, trouve: false }))
        },
        fratrie: [] // Sera peuplé via le JSON des parents
    };

    document.getElementById('json-output').value = JSON.stringify(researchJSON, null, 4);
}
