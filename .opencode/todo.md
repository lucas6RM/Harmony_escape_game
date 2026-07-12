# Issue #6 : Système d'Aides

## Spécification
Système d'Aides pendant un Quiz : achat d'Indice (3 Pièces) et élimination de 2 fausses réponses (5 Pièces).

Décisions clés :
- Indice (3 Pièces) : affiche un indice textuel
- Élimination (5 Pièces) : masque 2 fausses réponses, il reste 2 choix dont la bonne
- Solde de Pièces affiché en permanence

## Acceptance criteria

- [ ] Bouton "Acheter un Indice" (3 Pièces) disponible pendant un Quiz
- [ ] Bouton "Éliminer 2 réponses" (5 Pièces) disponible pendant un Quiz
- [ ] Solde insuffisant : boutons désactivés
- [ ] Solde de Pièces affiché en permanence
- [ ] Tests unitaires du Game Engine (achat aide, solde)

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

Types existants dans `src/app/core/types/` :
- `Quiz` : `{ type: QuizType, question: string, answers: string[], correctIndex: number }`
- `QuizType` : `'maths' | 'francais' | 'univers-mario' | 'contexte'`
- `Zone` : `{ id, narration, choices: NarrativeChoice[], quiz: Quiz }`
- `CharacterPath` : `{ character, zones: Zone[] }`

## Services existants

- `GameEngineService` : gère l'état du jeu. Signaux : `currentZone`, `coins`, `isZoneCompleted`, `narrationEvent`, `isBlockingChoice`, `gameStarted`, `quizActive`, `quizAttempts`, `quizFeedback`, `path`. Méthodes : `startGame`, `selectChoice`, `advanceZone`, `restartZone`, `completeZone`, `addCoins`, `clearEvent`, `submitQuizAnswer`.
- `ContentLoaderService` : charge le `CharacterPath` depuis JSON via HTTP
- `CharacterPersistenceService` : gère le localStorage du personnage choisi

## Composants existants

- `GameShell` : conteneur principal, affiche le compteur de Pièces (`coins()`) et le `ZoneExplorer`
- `ZoneExplorer` : affiche la narration, les choix narratifs, et le `QuizPanel` quand le Quiz est actif
- `QuizPanel` : affiche la question, le badge de type, les 4 réponses, le feedback. Émet `answerSelected`

## Structure du projet

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
    │   ├── quiz-panel/
    │   └── zone-explorer/
    ├── hero-screen/
    └── welcome-screen/
```

## Contexte technique important

Le solde de Pièces est DÉJÀ affiché en permanence dans `game-shell.html` via `{{ coins() }}`. 
Le `QuizPanel` existe déjà et affiche les 4 réponses. Il faut lui ajouter :
1. Un signal `eliminatedAnswers` (indices masqués par l'élimination)
2. Un signal `hintText` (texte de l'indice acheté)
3. Les boutons d'achat d'aide

Le `GameEngineService` doit gérer :
- `buyHint()` : coûte 3 Pièces, retourne un indice textuel (on peut utiliser une partie de la bonne réponse comme indice)
- `buyElimination()` : coûte 5 Pièces, retourne les 2 indices de fausses réponses à masquer
- Les deux méthodes ne fonctionnent que si `quizActive()` est true ET si le solde est suffisant
- Après achat, le solde est décrété

## Tableau d'Avancement

[x] Tâche 1 : Ajouter les types et méthodes d'Aide au `GameEngineService`
  - Créer le type `HintType` dans `src/app/core/types/quiz.ts` (ou un nouveau fichier `aide.ts`)
  - Ajouter les signaux `hintText` (Signal&lt;string | null&gt;) et `eliminatedAnswers` (Signal&lt;number[]&gt;) au GameEngineService
  - Ajouter `buyHint()`: coûte 3 Pièces, affiche un indice textuel. Ne fonctionne que si quizActive=true et coins >= 3
  - Ajouter `buyElimination()`: coûte 5 Pièces, retourne les 2 indices de fausses réponses à masquer. Ne fonctionne que si quizActive=true et coins >= 5
  - Réinitialiser hint et eliminatedAnswers dans `restartZone()`, `advanceZone()` et quand le Quiz est activé (`selectChoice` choix valide)
  - Exporter les nouveaux types depuis `index.ts`

[x] Tâche 2 : Tests unitaires du `GameEngineService` pour les Aides
  - buyHint avec solde suffisant : coins diminués de 3, hintText non null
  - buyHint avec solde insuffisant : rien ne change
  - buyHint quand quiz non actif : rien ne change
  - buyElimination avec solde suffisant : coins diminués de 5, eliminatedAnswers contient 2 indices
  - buyElimination avec solde insuffisant : rien ne change
  - buyElimination quand quiz non actif : rien ne change
  - eliminatedAnswers ne contient jamais le correctIndex
  - restartZone/advanceZone réinitialisent hint et eliminatedAnswers

[ ] Tâche 3 : Intégrer les boutons d'Aide dans `QuizPanel`
  - Ajouter les inputs `hintText`, `eliminatedAnswers`, `coins`, `canBuyHint`, `canBuyElimination`
  - Ajouter les outputs `hintRequested`, `eliminationRequested`
  - Afficher le texte de l'indice quand `hintText` est non null (zone aria-live="polite")
  - Masquer/griser les réponses dont l'index est dans `eliminatedAnswers` (display: none ou opacité réduite)
  - Bouton "Acheter un Indice (3 🪙)" activé uniquement si `canBuyHint`
  - Bouton "Éliminer 2 réponses (5 🪙)" activé uniquement si `canBuyElimination`
  - Les boutons d'aide sont visibles uniquement quand le quiz n'est pas désactivé

[ ] Tâche 4 : Relier `ZoneExplorer` et `GameEngineService` aux Aides
  - Exposer `hintText`, `eliminatedAnswers`, `coins` depuis `ZoneExplorer`
  - Ajouter `onBuyHint()` et `onBuyElimination()` appelant le GameEngineService
  - Passer les inputs/outputs au `QuizPanel` dans le template de `ZoneExplorer`
  - `canBuyHint` = quizActive() && coins() >= 3 && !hintText()
  - `canBuyElimination` = quizActive() && coins() >= 5 && eliminatedAnswers().length === 0

[ ] Tâche 5 : Vérifier build et tests passent

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 1

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Corrections validées : réinitialisation dans selectChoice() et import mort supprimés.

### Blocage Actuel :
- Aucun.
