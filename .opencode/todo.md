# Issue #7 : Sauvegarde auto + Reprise

## Spécification

## Parent
#1 (PRD: Harmony Escape Game)

## What to build
Sauvegarde automatique de la progression dans le local storage et écran de reprise.

Décisions clés :
- Auto-save à chaque Zone terminée
- Écran de reprise au retour sur l'app : "Reprendre l'aventure de [personnage] ?"
- Persistence Service dédié, mockable

Schéma de sauvegarde :
{ personnage, zoneCourante, pieces, tentativesQuiz, completes }

## Acceptance criteria
- [x] Persistance Service lit/écrit le local storage
- [x] Auto-save après chaque Zone terminée
- [x] Écran de reprise au retour sur l'app
- [x] Possibilité de reprendre ou de recommencer
- [x] Tests unitaires du Persistence Service avec mock

## Skills à Charger
- angular-developer
- tdd

## Standards du Projet
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Framework : Angular 21.2 avec Signals
- Testing : Vitest + jsdom
- Styling : Tailwind CSS v4
- Changement de détection : OnPush

## Architecture existante
- `CharacterPersistenceService` existe déjà et gère uniquement le `selectedCharacterId` dans le localStorage
- `GameEngineService` gère l'état du jeu (zone courante, pièces, quiz, etc.)
- Le schéma de sauvegarde doit être étendu pour inclure: personnage, zoneCourante, pieces, tentativesQuiz, completes
- Le `GameSave` interface est dans `src/app/core/types/game-save.ts`
- La clé localStorage est `GAME_SAVE_KEY = 'harmony_escape_game_save'`

## Contexte technique important
- Le `CharacterPersistenceService` actuel sauvegarde/restaure uniquement le personnage sélectionné
- Il faut étendre ce service (ou le renommer en `PersistenceService`) pour sauvegarder l'état complet du jeu
- L'auto-save doit se déclencher quand `GameEngineService.completeZone()` est appelé (ou quand `advanceZone()` est appelé)
- L'écran de reprise doit apparaître au chargement de l'app (dans `WelcomeScreen`) si une sauvegarde existe avec une partie en cours
- Le joueur doit pouvoir choisir "Reprendre" (charge l'état sauvegardé dans le GameEngine) ou "Recommencer" (efface la sauvegarde)
- Le service doit rester mockable via l'interface `LocalStorageAdapter`

## Tableau d'Avancement
- [x] Tâche 1 : Étendre l'interface GameSave et le PersistenceService pour gérer l'état complet (zoneCourante, pieces, tentativesQuiz, completes) + tests unitaires
- [x] Tâche 2 : Implémenter l'auto-save après chaque Zone terminée (dans GameEngineService ou via un mécanisme d'écoute)
- [x] Tâche 3 : Créer le composant de reprise (ResumeScreen) avec les boutons "Reprendre" et "Recommencer"
- [x] Tâche 4 : Intégrer l'écran de reprise dans le WelcomeScreen (affiché quand une sauvegarde en cours existe)
- [x] Tâche 5 : Permettre au GameEngine de charger un état sauvegardé (méthode restoreGame)

## Zone de Transit & Logs
### Tâche en cours :
- Aucune — Issue #7 complétée et validée.

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Issue #7 entièrement validée : 5 tâches complétées, 252 tests passants, build OK. PR prête.

### Blocage Actuel :
- Aucun.