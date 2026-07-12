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
- [x] Tâche 3 : Gérer l'échec : recommencer la Zone finale
- [x] Tâche 4 : Tests unitaires du Game Engine pour la fin de partie

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 1 complétée
- Tâche 2 complétée (bug corrigé)
- Tâche 3 complétée
- Tâche 4 complétée

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Message de pénalité adapté au Quiz final : "Presque là ! -1 Pièce. Bowser Junior rit, mais tu peux le battre — recommence cette Zone !"
- Tests unitaires ajoutés : 5 nouveaux tests dans le bloc "Fin de partie — Quiz final" couvrant l'échec du Quiz final, le message motivant, isBlockingChoice, restartZone, et la distinction avec les Quiz non-finaux.
- Tâche 4 : 7 tests supplémentaires ajoutés pour couvrir les scénarios de fin de partie : Quiz final réussi (+2 Pièces, isZoneCompleted, quizActive désactivé), échec Quiz final (-1 Pièce), startGame() réinitialise gameWon après victoire, isFinal: true identifié dans la Zone, restartGame() après victoire réinitialise coins/zonesCompleted/currentZoneIndex.

### Blocage Actuel :
- Aucun.
