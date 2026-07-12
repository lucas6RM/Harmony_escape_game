# Issue #5 : Système de Quiz

## Spécification
Système de Quiz en fin de Zone : 4 réponses, 2 chances, économie de Pièces.

Décisions clés :
- 4 réponses par Quiz
- 2 chances : 1ère erreur = nouvelle tentative, 2ème erreur = -1 Pièce + recommencer la Zone
- +2 Pièces par Quiz réussi
- 4 Types de Quiz : Maths (CM1), Français (CM1), Univers Mario, Contexte (références aux Zones passées)

## Acceptance criteria

- [ ] Quiz affiché avec 4 réponses en fin de Zone
- [ ] 1ère erreur : nouvelle tentative sans pénalité
- [ ] 2ème erreur : -1 Pièce + recommencer la Zone
- [ ] Réponse correcte : +2 Pièces + Zone suivante
- [ ] Les 4 Types de Quiz fonctionnent
- [ ] Tests unitaires du Game Engine (Quiz réussi/échoué, pièces)

## Skills à Charger
- **`angular-developer`** — génération de code Angular
- **`tdd`** — test-driven development

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Décisions de Design (héritées des issues précédentes)

| Décision | Choix |
|----------|-------|
| State | Signals (`signal()`, `computed()`) |
| Strategy | `ChangeDetectionStrategy.OnPush` systématique |
| Injection | `inject()` au lieu du constructeur |
| Contrôles | Natifs (`@if`, `@for`, `@switch`) |
| Forms | Réactifs plutôt que template-driven |
| Accessibilité | WCAG AA obligatoire |
| Types | `src/app/core/types/` |
| Services | `src/app/core/services/` |

## Modèle de Domaine (existant)

Les types suivants existent déjà dans `src/app/core/types/` :

- `Quiz` : `{ type: QuizType, question: string, answers: string[], correctIndex: number }`
- `QuizType` : `'maths' | 'francais' | 'univers-mario' | 'contexte'`
- `Zone` : `{ id, narration, choices: NarrativeChoice[], quiz: Quiz }`
- `CharacterPath` : `{ character, zones: Zone[] }`

## Services existants

- `GameEngineService` : gère l'état du jeu (zone courante, progression, pièces, événements narratifs). Déjà implémenté avec `startGame`, `selectChoice`, `advanceZone`, `restartZone`, `completeZone`, `addCoins`, `clearEvent`.
- `ContentLoaderService` : charge le `CharacterPath` depuis JSON via HTTP
- `CharacterPersistenceService` : gère le localStorage du personnage choisi

## Structure du projet existante

```
src/app/
├── core/
│   ├── services/
│   │   ├── character-persistence/
│   │   ├── content-loader/
│   │   └── game-engine/
│   └── types/
│       ├── character-path.ts
│       ├── character.ts
│       ├── game-save.ts
│       ├── index.ts
│       ├── narrative-choice.ts
│       ├── quiz.ts
│       └── zone.ts
└── features/
    ├── character-selector/
    ├── game/
    │   ├── game-shell/
    │   ├── narrative-choice/
    │   └── zone-explorer/
    ├── hero-screen/
    └── welcome-screen/
```

## Contexte technique important

Le `GameEngineService` existe déjà et gère :
- `currentZone` (Signal&lt;Zone | null&gt;)
- `coins` (Signal&lt;number&gt;)
- `isZoneCompleted` (Signal&lt;boolean&gt;)
- `narrationEvent` (Signal&lt;string | null&gt;)
- `isBlockingChoice` (Signal&lt;boolean&gt;)
- `gameStarted` (Signal&lt;boolean&gt;)
- `path` (Signal&lt;CharacterPath&gt;)
- Méthodes: `startGame`, `selectChoice`, `advanceZone`, `restartZone`, `completeZone`, `addCoins`, `clearEvent`

Le `ZoneExplorer` affiche la narration et les choix narratifs. Il n'affiche PAS encore le Quiz.
Le `GameShell` est le conteneur principal affichant le compteur de Pièces et le `ZoneExplorer`.

Le type `Quiz` existe déjà dans `src/app/core/types/quiz.ts` avec `type`, `question`, `answers`, `correctIndex`.

## Tâches à implémenter

Décompose l'issue en tâches atomiques basées sur les acceptance criteria. Chaque tâche doit être testable indépendamment.

## Tableau d'Avancement
[x] Tâche 1 : Ajouter la gestion du Quiz au `GameEngineService` : état du Quiz en cours (signal `quizActive`, `quizAttempts`), méthode `submitQuizAnswer(index)` qui gère les 2 chances (1ère erreur = nouvelle tentative, 2ème erreur = -1 Pièce + recommencer la Zone), réponse correcte = +2 Pièces + marquer Zone terminée + avancer automatiquement. Le Quiz ne s'affiche qu'après que le joueur a fait un choix narratif valide (narrationEvent non null et non bloquant).

[ ] Tâche 2 : Tests unitaires du `GameEngineService` pour le Quiz : Quiz réussi du 1er coup (+2 pièces, zone terminée, avance), Quiz réussi au 2ème coup (+2 pièces, zone terminée, avance), Quiz échoué après 2 tentatives (-1 pièce, zone recommencée), Quiz non accessible tant qu'aucun choix valide n'est fait, Compteur de tentatives réinitialisé entre les zones.

[ ] Tâche 3 : Créer le composant `QuizPanel` (`src/app/features/game/quiz-panel/`) qui affiche la question du Quiz, le type de Quiz (badge coloré), les 4 réponses comme boutons, et gère l'état visuel (réponse sélectionnée, feedback vert/rouge, message de pénalité). Le composant émet un `output()` `answerSelected` avec l'index de la réponse.

[ ] Tâche 4 : Intégrer `QuizPanel` dans `ZoneExplorer` : le Quiz s'affiche après un choix narratif valide (quand `narrationEvent` est non null et non bloquant). Le Quiz disparaît quand la Zone est terminée ou recommencée. Le `GameShell` affiche le Quiz sous le `ZoneExplorer` ou le `ZoneExplorer` l'intègre directement.

[ ] Tâche 5 : Gérer les états visuels du Quiz : feedback vert pour réponse correcte, feedback rouge pour réponse incorrecte, message "Nouvelle tentative" après 1ère erreur, message "Pénalité ! -1 Pièce" après 2ème erreur avec bouton pour recommencer la Zone. Le type de Quiz s'affiche avec un badge coloré (Maths = bleu, Français = vert, Univers Mario = rouge, Contexte = violet).

[ ] Tâche 6 : Vérifier build et tests passent

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 2

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Tâche 1 validée : signals Quiz, submitQuizAnswer, selectChoice, restartZone, advanceZone conformes.

### Blocage Actuel :
- Aucun.
