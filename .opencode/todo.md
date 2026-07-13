# Issue #24 : Migration vers l'arbre de décision et nouvelle économie

## Spécification
PRD : Migration vers l'arbre de décision et nouvelle économie

Le jeu implémente un modèle linéaire : les Zones sont un tableau ordonné, chaque Zone contient un seul Quiz, les coûts des Aides ne correspondent pas à l'économie définie, et le système de retry offre deux chances gratuites. Le modèle de domaine (CONTEXT.md, PRD, ADR-0001) a été affiné pour supporter un arbre de décision avec 8-12 Zones par personnage (3-6 vues par partie), 2-3 Quiz par Zone, et une économie rééquilibrée. Le code et le modèle sont en contradiction.

Migrer le moteur de jeu vers un modèle d'arbre de décision où chaque Choix narratif pointe vers une Zone suivante via `nextZoneId`. Chaque Zone contient 2-3 Quiz. L'économie est rééquilibrée : pas de retry gratuit, -1 Pièce à chaque erreur, trois Aides (Indice=1, Éliminer=2, Saut=2), Pièces clamped à 0. La sauvegarde utilise des IDs de Zone au lieu d'indices numériques.

## Skills à Charger
- angular-developer
- tdd

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Tableau d'Avancement
### Phase 1 — Types
- [x] Tâche 1 : Migrer les types (Zone.quiz → quizzes[], NarrativeChoice.nextNarrationId → nextZoneId, supprimer blocking/penalty, RawCharacterPath array → object with startZoneId, CharacterPath tree structure, GameSave currentZoneIndex → currentZoneId + quizIndex, HINT_COSTS nouveaux coûts, Quiz hintText optionnel)
- [x] Tâche 2 : Supprimer les types obsolètes (SharedZoneContent, RawZone shared reference, CharacterRole, CharacterRoles) et supprimer shared-zone.ts + character-role.ts

### Phase 2 — Content Loader
- [x] Tâche 3 : Migrer le ContentLoaderService (supprimer sharedZonesResource, resolveZone, resolvePath, loadCharacterRoles ; charger tree JSON, résoudre Zone par ID)

### Phase 3 — Game Engine signaux
- [x] Tâche 4 : Ajouter les nouveaux signaux du GameEngineService (currentZoneId string, currentQuizIndex number, currentQuiz computed, quizzesRemaining computed) et supprimer les anciens (currentZoneIndex, narrationEvent, isBlockingChoice, quizAttempts, zonesCompleted)

### Phase 4 — Game Engine méthodes économie
- [x] Tâche 5 : Implémenter la nouvelle économie dans le GameEngineService (submitQuizAnswer sans free retry, -1 Pièce à chaque erreur, replay Quiz seulement ; buyHint coût 1 par Quiz ; buyElimination coût 2 par Quiz ; skipQuiz coût 2 ; addCoins clampé à 0)

### Phase 5 — Game Engine navigation arbre
- [x] Tâche 6 : Implémenter la navigation arbre dans le GameEngineService (selectChoice navigue via nextZoneId, quizIndex progression, Zone complète quand quizIndex >= quizzes.length, restartZone reset Quiz seulement, gameWon au dernier Quiz final)

### Phase 6 — Persistence
- [x] Tâche 7 : Migrer le PersistenceService (nouveau schéma save {selectedCharacterId, currentZoneId, quizIndex, coins, completedPaths}, validateur pour currentZoneId string, restoreGame par currentZoneId + quizIndex)

### Phase 7 — Tests
- [x] Tâche 8 : Mettre à jour les mocks de test (MOCK_MARIO_PATH tree structure avec multiples Quiz par Zone) et réécrire les tests existants (no free retry, nouveaux coûts, navigation par ID, nouveau schéma save)
- [x] Tâche 9 : Ajouter les nouveaux tests (skipQuiz, multiples Quiz par Zone, quizIndex progression, coin clamping, tree navigation via nextZoneId)

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 9 : Ajouter les nouveaux tests

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
**VALIDÉ** — Tâches 8 et 9 validées. Tous les tests passent (337/337), le build passe. Les mocks utilisent le format tree, tous les scénarios couverts (no free retry, nouveaux coûts, navigation par ID, skipQuiz, quizIndex progression, coin clamping, quizzesRemaining, currentQuiz, nouveau schéma save, ContentLoader sans shared zones).