import json
import re

def parse_person_label(label):
    """
    Extrait le nom, prénom et les dates d'un libellé.
    Exemples:
    - 'LÉAUTÉ Pierre, Marie\n(1886-1974)'
    - 'LE QUEMENER Marie-Philomène<br>(1859-1943)'
    - 'Louis TANGUY<br>Mariage: 1945'
    """
    clean_label = label.replace("<br>", "\n").replace("<br/>", "\n").strip()
    lines = [l.strip() for l in clean_label.split("\n") if l.strip()]
    
    name_part = lines[0] if lines else "Inconnu"
    date_part = ""
    for line in lines[1:]:
        if "(" in line or "Mariage" in line or re.search(r'\d{4}', line):
            date_part += " " + line
            
    # Extraction des dates de naissance et décès
    birth_year, death_year = None, None
    years = re.findall(r'\b(1\d{3}|2\d{3})\b', date_part)
    
    if "(" in date_part and ")" in date_part:
        years_in_parens = re.findall(r'\b(1\d{3}|2\d{3})\b', date_part.split("(")[1].split(")")[0])
        if len(years_in_parens) == 1:
            birth_year = years_in_parens[0]
        elif len(years_in_parens) >= 2:
            birth_year, death_year = years_in_parens[0], years_in_parens[1]
    elif years and "Mariage" not in date_part:
        birth_year = years[0]
        
    # Séparation Prénom / NOM (Recherche des majuscules pour le NOM)
    parts = name_part.split()
    surnames = []
    given_names = []
    
    for part in parts:
        # Si le mot est entièrement en majuscules (ex: LÉAUTÉ, LE QUEMENER), c'est un nom
        clean_part = re.sub(r'[^A-ZÀ-DA-ÖØ-ß]', '', part)
        if len(clean_part) > 1 and clean_part.isupper():
            surnames.append(part)
        else:
            given_names.append(part)
            
    given = " ".join(given_names) if given_names else ""
    surname = " ".join(surnames) if surnames else (given_names[-1] if given_names else "")
    if surname in given_names:
        given_names.remove(surname)
        given = " ".join(given_names)
        
    return given, surname, birth_year, death_year

def json_to_gedcom(json_filepath, gedcom_filepath):
    with open(json_filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    individuals = {}  # key: id, val: {given, surname, birth, death}
    families = {}     # key: fam_id, val: {husb, wife, children: []}
    parent_child_edges = []
    spouse_edges = []

    # 1. Parsing de toutes les pages JSON
    for page in data.get("pages", []):
        mdata_str = None
        for cell in page.get("cells", []):
            if "metadata" in cell and "mermaidData" in cell["metadata"]:
                mdata_str = json.loads(cell["metadata"]["mermaidData"])["data"]
                break
                
        if mdata_str:
            lines = mdata_str.split("\n")
            for line in lines:
                line = line.strip()
                if not line or line.startswith("%%") or line.startswith("graph"):
                    continue
                # Parsing Nœuds
                nodes_found = re.findall(r'([A-Za-z0-9_]+)\["([^"]+)"\]', line)
                for nid, nlabel in nodes_found:
                    if nid not in individuals:
                        given, surname, birth, death = parse_person_label(nlabel)
                        individuals[nid] = {
                            "given": given,
                            "surname": surname,
                            "birth": birth,
                            "death": death
                        }
                # Parsing Relations
                edges_found = re.findall(r'([A-Za-z0-9_]+)\s*(-->|---)\s*([A-Za-z0-9_]+)', line)
                for src, rel, tgt in edges_found:
                    if rel == "-->":
                        parent_child_edges.append((src, tgt))
                    elif rel == "---":
                        spouse_edges.append((src, tgt))

    # 2. Reconstitution des familles (Parents -> Enfants)
    # Grouper les enfants par paires ou parents individuels
    child_to_parents = {}
    for parent, child in parent_child_edges:
        if child not in child_to_parents:
            child_to_parents[child] = []
        if parent not in child_to_parents[child]:
            child_to_parents[child].append(parent)

    # Création des familles GEDCOM
    fam_map = {} # tuple(parents_trie) -> fam_id
    fam_count = 1

    for child, parents in child_to_parents.items():
        parents_key = tuple(sorted(parents))
        if parents_key not in fam_map:
            fam_id = f"@F{fam_count}@"
            fam_count += 1
            fam_map[parents_key] = fam_id
            
            husb = parents[0] if len(parents) > 0 else None
            wife = parents[1] if len(parents) > 1 else None
            
            families[fam_id] = {
                "husb": husb,
                "wife": wife,
                "children": []
            }
        
        families[fam_map[parents_key]]["children"].append(child)

    # Ajouter les couples mariés déclarés séparément
    for sp1, sp2 in spouse_edges:
        pair_key = tuple(sorted([sp1, sp2]))
        if pair_key not in fam_map:
            fam_id = f"@F{fam_count}@"
            fam_count += 1
            fam_map[pair_key] = fam_id
            families[fam_id] = {
                "husb": sp1,
                "wife": sp2,
                "children": []
            }

    # 3. Écriture du fichier GEDCOM
    with open(gedcom_filepath, 'w', encoding='utf-8') as f:
        # En-tête GEDCOM 5.5.1
        f.write("0 HEAD\n")
        f.write("1 SOUR JSON_GENEALOGY_CONVERTER\n")
        f.write("1 GEDC\n")
        f.write("2 VERS 5.5.1\n")
        f.write("2 FORM LINEAGE-LINKED\n")
        f.write("1 CHAR UTF-8\n")
        
        # Individus
        for ind_id, ind in individuals.items():
            f.write(f"0 @{ind_id}@ INDI\n")
            f.write(f"1 NAME {ind['given']} /{ind['surname']}/\n")
            if ind['given']:
                f.write(f"2 GIVN {ind['given']}\n")
            if ind['surname']:
                f.write(f"2 SURN {ind['surname']}\n")
                
            if ind['birth']:
                f.write("1 BIRT\n")
                f.write(f"2 DATE {ind['birth']}\n")
                
            if ind['death']:
                f.write("1 DEAT\n")
                f.write(f"2 DATE {ind['death']}\n")
                
            # Lien vers la famille où la personne est enfant (FAMC)
            for fam_id, fam in families.items():
                if ind_id in fam["children"]:
                    f.write(f"1 FAMC {fam_id}\n")
            # Lien vers la famille où la personne est parent (FAMS)
            for fam_id, fam in families.items():
                if ind_id == fam["husb"] or ind_id == fam["wife"]:
                    f.write(f"1 FAMS {fam_id}\n")

        # Familles
        for fam_id, fam in families.items():
            f.write(f"0 {fam_id} FAM\n")
            if fam["husb"]:
                f.write(f"1 HUSB @{fam['husb']}@\n")
            if fam["wife"]:
                f.write(f"1 WIFE @{fam['wife']}@\n")
            for child_id in fam["children"]:
                f.write(f"1 CHIL @{child_id}@\n")

        # Fin du fichier
        f.write("0 TLR\n")

    print(f"Conversion terminée avec succès : {gedcom_filepath}")
    print(f"- Individus exportés : {len(individuals)}")
    print(f"- Familles exportées  : {len(families)}")

# Lancement de la conversion
json_to_gedcom("cousin.json", "arbre_genealogique.ged")
