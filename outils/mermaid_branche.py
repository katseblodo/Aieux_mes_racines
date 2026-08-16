import sys

def parse_and_generate_mermaid(
    file_path: str, target_branch: str, nb_generations: int
) -> str:

    individuals = {}

    # Lecture et parsing du fichier CSV généalogique
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("SOSA"):
                continue

            parts = line.split(";")
            if len(parts) < 4:
                continue

            try:
                sosa = int(parts[0])
            except ValueError:
                continue

            gen_code = parts[1]  # Ex: G12
            branch = parts[2]  # Ex: LL
            name = parts[3]
            title = parts[4] if len(parts) > 4 else ""
            b_date = parts[5] if len(parts) > 5 else ""
            d_date = parts[6] if len(parts) > 6 else ""

            # Filtrage sur la branche
            if branch.upper() != target_branch.upper():
                continue

            try:
                gen_num = int(gen_code.replace("G", ""))
            except ValueError:
                gen_num = 0

            individuals[sosa] = {
                "sosa": sosa,
                "gen_num": gen_num,
                "name": name,
                "title": title,
                "b_date": b_date,
                "d_date": d_date,
            }

    if not individuals:
        return f"%% Aucun individu trouvé pour la branche '{target_branch}'."

    # Détermination de la génération minimale présente
    min_gen = min(ind["gen_num"] for ind in individuals.values())
    max_allowed_gen = min_gen + nb_generations - 1

    # Filtrage selon la profondeur de génération demandée
    filtered = {
        sosa: ind
        for sosa, ind in individuals.items()
        if ind["gen_num"] <= max_allowed_gen
    }

    # Génération de la syntaxe Mermaid
    mermaid_output = ["graph TD"]

    # 1. Déclaration des nœuds
    for sosa, ind in sorted(filtered.items()):
        dates = []
        if ind["b_date"]:
            dates.append(f"° {ind['b_date']}")
        if ind["d_date"]:
            dates.append(f"+ {ind['d_date']}")
        date_str = " | ".join(dates)

        label_parts = [f"<b>{ind['name']}</b>"]
        if ind["title"]:
            label_parts.append(f"<i>{ind['title']}</i>")
        if date_str:
            label_parts.append(date_str)

        node_label = "<br/>".join(label_parts)
        mermaid_output.append(f'    ind_{sosa}["[{sosa}] {node_label}"]')

    mermaid_output.append("")

    # 2. Création des liens d'ascendance (Règle SOSA : Père = 2*N, Mère = 2*N + 1)
    for sosa in sorted(filtered.keys()):
        father_sosa = sosa * 2
        mother_sosa = sosa * 2 + 1

        if father_sosa in filtered:
            mermaid_output.append(f"    ind_{father_sosa} --> ind_{sosa}")
        if mother_sosa in filtered:
            mermaid_output.append(f"    ind_{mother_sosa} --> ind_{sosa}")

    return "\n".join(mermaid_output)


# --- EXEMPLE D'UTILISATION ---
if __name__ == "__main__":
    # Paramètres de sélection
    FICHIER_DONNEES = "genealogie.txt"
    BRANCHE = "LL"
    NB_GENERATIONS = 5

    # Code Mermaid généré
    mermaid_code = parse_and_generate_mermaid(
        FICHIER_DONNEES, BRANCHE, NB_GENERATIONS
    )
    print(mermaid_code)
