# Issue #10 : Rejouabilité + Badge de complétion

## Spécification
Rejouabilité libre des personnages et Badge de complétion après les 4 Chemins.

Décisions clés :
- Chaque Chemin est indépendant, reset à 0 Pièces
- Badge de complétion débloqué après les 4 Chemins
- Scène bonus après obtention du Badge
- Persistance des Chemins complétés dans le local storage

## Acceptance criteria
- Après un Chemin terminé, retour à la sélection de personnage
- Chaque personnage commence avec 0 Pièces
- Badge de complétion affiché après les 4 Chemins
- Scène bonus après le Badge
- Chemins complétés sauvegardés dans le local storage
- Tests unitaires du Game Engine (badge, reset)

## Skills à Charger
- angular-developer
- tdd

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Tableau d'Avancement
- [x] Tâche 1 : Persister les Chemins complétés dans le localStorage (nouveau service + type)
- [x] Tâche 2 : Game Engine — marquer un Chemin comme complété à la victoire + méthode retour à la sélection
- [x] Tâche 3 : Victory Screen — bouton "Choisir un autre personnage" qui retourne à la sélection sans effacer les Chemins complétés
- [x] Tâche 4 : Character Selector — afficher les Chemins déjà complétés + Badge de complétion quand les 4 sont terminés
- [ ] Tâche 5 : Scène bonus du Badge de complétion (composant dédié)
- [ ] Tâche 6 : Tests unitaires (Game Engine badge/reset + PersistenceService Chemins complétés)

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 4 terminée

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Tâche 4 : Build OK, 345 tests passants (14 fichiers).

### Dernier retour de Review :
- Tâche 2 : Build OK, 337 tests passants (14 fichiers).

### Dernier retour de Review :
- Tâche 1 : Build OK, 322 tests passants (14 fichiers).

### Blocage Actuel :
- Aucun.
