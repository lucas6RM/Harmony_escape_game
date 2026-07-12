# Issue #9 : Fin de partie + Quiz final

## Spécification
Quiz final pour libérer Harmony et scène de victoire.

Décisions clés :
- Quiz final plus difficile en dernière Zone
- Scène de victoire narrative après succès
- Gestion de l'échec : recommencer la Zone finale

## Acceptance criteria
- Quiz final affiché en dernière Zone
- Scène de victoire après Quiz réussi
- Échec : recommencer la Zone finale
- Tests unitaires du Game Engine (fin de partie)

## Skills à Charger
- angular-developer
- tdd

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Tableau d'Avancement
- [x] Tâche 1 : Implémenter le Quiz final en dernière Zone (plus difficile)
- [x] Tâche 2 : Implémenter la scène de victoire narrative après Quiz réussi
- [ ] Tâche 3 : Gérer l'échec : recommencer la Zone finale
- [ ] Tâche 4 : Tests unitaires du Game Engine pour la fin de partie

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 1 complétée
- Tâche 2 complétée (bug corrigé)

### Compteur de rejets (tâche actuelle) :
- 2 / 5 (résolu)

### Dernier retour de Review :
- Bug corrigé : `this.gameWonSignal.set(false);` ajouté dans `startGame()`.
- Test unitaire ajouté : simule une victoire complète puis vérifie que `restartGame()` remet `gameWon` à `false`.

### Blocage Actuel :
- Aucun.
