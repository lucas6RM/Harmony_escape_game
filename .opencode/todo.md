# Issue #33 : Données narratives — indices scénarisés et Game Over

## Spécification

Slice 3: Données narratives — indices scénarisés et Game Over

**Parent**: #30

**What to build**:
Rédiger et insérer les données narratives dans les JSON des 4 chemins.

**`hintText` scénarisés** :
Pour chaque Quiz de chaque chemin, remplacer le `hintText` actuel par une phrase scénarisée qui met en scène le personnage tiers :
- Chemin Mario → Luigi donne l'indice
- Chemin Luigi → Mario donne l'indice
- Chemin Peach → Toad donne l'indice
- Chemin Daisy → Wario donne l'indice

Chaque `hintText` doit inclure une phrase d'intro narrative (ex: "Luigi sort d'un tuyau et murmure : ...") suivie de l'indice proprement dit.

**`gameOverNarration`** :
Ajouter le champ `gameOverNarration` à chaque JSON de chemin avec un texte narratif théâtral spécifique au personnage.

## Acceptance criteria

- [ ] Chaque Quiz du chemin Mario a un `hintText` scénarisé avec Luigi
- [ ] Chaque Quiz du chemin Luigi a un `hintText` scénarisé avec Mario
- [ ] Chaque Quiz du chemin Peach a un `hintText` scénarisé avec Toad
- [ ] Chaque Quiz du chemin Daisy a un `hintText` scénarisé avec Wario
- [ ] Chaque chemin a un `gameOverNarration` théâtral et spécifique
- [ ] Les fichiers JSON sont valides et le jeu charge correctement les données

## Blocked by

- #31 (types HintType nettoyés)
- #32 (champ `gameOverNarration` ajouté au `CharacterPath`)

## Skills à Charger
- domain-modeling (pour respecter le vocabulaire du domaine)

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Tableau d'Avancement
- [x] Tâche 1 : Scénariser les hintText du chemin Mario avec Luigi (fichier `src/assets/content/mario.json`)
- [x] Tâche 2 : Scénariser les hintText du chemin Luigi avec Mario (fichier `src/assets/content/luigi.json`)
- [ ] Tâche 3 : Scénariser les hintText du chemin Peach avec Toad (fichier `src/assets/content/peach.json`)
- [ ] Tâche 4 : Scénariser les hintText du chemin Daisy avec Wario (fichier `src/assets/content/daisy.json`)
- [ ] Tâche 5 : Vérifier les gameOverNarration et valider les JSON (build + tests)

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 2 : Scénariser les hintText du chemin Luigi avec Mario

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Blocage Actuel
- Aucun

### Dernier retour de Review :
- Aucun
