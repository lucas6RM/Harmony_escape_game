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
- [ ] Tâche 8 : Mettre à jour les mocks de test (MOCK_MARIO_PATH tree structure avec multiples Quiz par Zone) et réécrire les tests existants (no free retry, nouveaux coûts, navigation par ID, nouveau schéma save)
- [ ] Tâche 9 : Ajouter les nouveaux tests (skipQuiz, multiples Quiz par Zone, quizIndex progression, coin clamping, tree navigation via nextZoneId)

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 2 : Supprimer les types obsolètes

### Compteur de rejets (tâche actuelle) :
- 2 / 5

### Dernier retour de Review :
**REJETÉ** — Le worker a avancé sur plusieurs tâches mais plusieurs problèmes bloquent la validation :

#### ✅ Tâches correctement implémentées :
- **Tâche 1** : Types migrés correctement (Zone.quizzes[], NarrativeChoice.nextZoneId, blocking/penalty supprimés, RawCharacterPath tree, CharacterPath tree, GameSave currentZoneId+quizIndex+completedPaths, Quiz.hintText, HINT_COSTS, HintType skipQuiz)
- **Tâche 5** : Nouvelle économie implémentée (pas de free retry, -1 Pièce à chaque erreur, buyHint=1, buyElimination=2, skipQuiz=2, addCoins clampé à 0)
- **Tâche 7** : PersistenceService migré (nouveau schéma, validateur, restoreGame)
- **Composants UI** : narrative-choice, quiz-panel, zone-explorer adaptés correctement

#### ❌ Tâche 2 NON FAITE — Types obsolètes toujours présents :
- `src/app/core/types/shared-zone.ts` n'a PAS été supprimé
- `src/app/core/types/character-role.ts` n'a PAS été supprimé
- `ContentLoaderService` importe encore `CharacterRole` et `SharedZoneContent` (ligne 5)
- La méthode `loadCharacterRoles()` existe toujours (ligne 144-152)
- Le fichier `index.ts` des types doit être mis à jour pour ne plus exporter ces types

#### ❌ Tâche 3 INCOMPLÈTE — ContentLoaderService partiellement migré :
- `resolvePath()` est bien adapté pour le format tree ✅
- MAIS `sharedZonesResource` (ligne 34-42) est toujours présent et utilisé
- `resolveZone()` (ligne 55-69) est toujours présent et gère encore les shared zones
- `loadCharacterRoles()` (ligne 144-152) est toujours présent
- Les imports obsolètes (`CharacterRole`, `SharedZoneContent`) sont toujours dans la ligne 5

#### ❌ Tâche 4 INCOMPLÈTE — Signaux GameEngineService :
- `currentZoneId`, `currentQuizIndex`, `currentQuiz` ajoutés ✅
- MAIS `quizzesRemaining` computed n'est PAS implémenté (exigé par la spécification)
- Signaux obsolètes NON supprimés : `narrationEventSignal` (ligne 31), `isBlockingChoiceSignal` (ligne 32), `quizAttemptsSignal` (ligne 36), `zonesCompletedSignal` (ligne 41) — tous toujours exposés publiquement et utilisés dans le code

#### ❌ Tâche 6 BUG CRITIQUE — Navigation arbre non fonctionnelle :
- `selectChoice()` (ligne 207-226) ne navigue PAS vers la zone suivante ! Il fait `this.narrationEventSignal.set(choice.nextZoneId)` (stocke l'ID dans un signal de texte) et active le quiz. La méthode `navigateToZone()` existe mais n'est JAMAIS appelée.
- Le flux attendu : joueur clique sur un choix → `selectChoice` appelle `navigateToZone(choice.nextZoneId)` → nouvelle zone s'affiche
- Le flux actuel : joueur clique sur un choix → quiz de la zone courante s'active → jamais de transition vers la zone cible
- `advanceQuiz()` n'a pas de logique pour détecter la fin de tous les quizzes d'une zone et naviguer automatiquement vers la zone suivante

#### ⚠️ Tests :
- Les échecs de tests sont attendus (Tâches 8-9 non faites) — les mocks utilisent encore l'ancien format (zones[], quiz, nextNarrationId, blocking, advanceZone, completeZone, currentZoneIndex)

