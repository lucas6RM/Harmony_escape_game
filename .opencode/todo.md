# Issues #31 & #32 : Supprimer saut Quiz + Game Over + Persistance

## Spécification

### Issue #31 - Slice 1: Supprimer le saut de Quiz et nettoyer les types
Retirer complètement la fonctionnalité "Sauter le Quiz" du jeu : supprimer la méthode `skipQuiz()` du `GameEngineService`, retirer `skip` des types (`HintType`, `HINT_COSTS`), et enlever le bouton "Sauter" du `QuizPanelComponent`. Mettre à jour les tests associés.

### Issue #32 - Slice 2: Mauvaise réponse moins punitive, Game Over, persistance Pièces
Refondre le flux des mauvaises réponses et ajouter le Game Over + persistance des Pièces. Nouveau flux : plus de restartZone après erreur, le joueur perd 1 Pièce et reste sur la même question avec un bouton "Réessayer". Game Over si Pièces < 0. Persistance des Pièces et zones explorées.

## Skills à Charger
- angular-developer
- tdd

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## RÈGLES CRITIQUES
- Utiliser le vocabulaire du domaine (CONTEXT.md) : Zone, Quiz, Pièce, Aide, Personnage, Chemin. JAMAIS utiliser les termes à éviter (Level, Question, Coin, Hint, Hero, Path...).
- Le contenu du jeu est piloté par JSON (ADR 0001).
- Framework : Angular moderne avec signals.

## Tableau d'Avancement

### Issue #31
- [x] Tâche 1 : Supprimer `skipQuiz()` du `GameEngineService` et retirer `skip` de `HintType` / `HINT_COSTS` dans les types
- [x] Tâche 2 : Retirer le bouton "Sauter" du `QuizPanelComponent` et la logique de saut du `ZoneExplorerComponent`
- [x] Tâche 3 : Mettre à jour ou retirer les tests liés à `skipQuiz`, vérifier que le jeu compile et les tests passent

### Issue #32
- [ ] Tâche 4 : Refondre `submitQuizAnswer()` pour ne plus reset `quizIndex` après mauvaise réponse + créer `retryQuiz()` qui réactive `quizActive` et clear `quizFeedback`
- [ ] Tâche 5 : Retirer le clamp `Math.max(0, ...)` dans `addCoins()` + déclencher `gameOverSignal` quand Pièces < 0
- [ ] Tâche 6 : Créer le composant `GameOverScreen` (style `VictoryScreen`) avec narration spécifique au personnage, score Zones explorées, bouton "Retour au menu" vers `/accueil` + `clearSave()`
- [ ] Tâche 7 : Ajouter `zonesExplored` à `GameSave`, `gameOverNarration` à `CharacterPath`, persister les Pièces après chaque modification, afficher le compteur de Zones dans `GameShellComponent`
- [ ] Tâche 8 : Mettre à jour le bloc pénalité dans `ZoneExplorerComponent` pour afficher "Réessayer" au lieu de "Recommencer le Quiz", mettre à jour les tests, vérifier compilation et tests

## Zone de Transit & Logs
### Tâche en cours :
- Aucune (Issue #31 terminée)

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
