# Issue #4 : Exploration d'une Zone + Choix narratifs

## Spécification
Exploration d'une Zone avec texte narratif, emojis et Choix narratifs. Le Game Engine Service orchestre la navigation.

Décisions clés :
- Game Engine Service : seam principale, gère l'état du jeu (zone courante, progression)
- Choix narratifs : certains mènent à des événements différents, d'autres sont bloquants (pénalité ou recommencer la Zone)
- Interface textuelle + emojis

## Acceptance criteria

- [ ] Game Engine Service gère la navigation entre Zones
- [ ] Affichage narration avec emojis
- [ ] Choix narratifs affichés comme boutons
- [ ] Choix bloquants : pénalité ou recommencer la Zone
- [ ] Choix avec conséquence : événements différents
- [ ] Tests unitaires du Game Engine (navigation, choix bloquants)

## Skills à Charger
- **`angular-developer`** — génération de code Angular
- **`tdd`** — test-driven development

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Décisions de Design (héritées des issues #2 et #3)

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

- `Zone` : `{ id, narration, choices: NarrativeChoice[], quiz: Quiz }`
- `NarrativeChoice` : `{ text, nextNarrationId, blocking, penalty? }`
- `Quiz` : `{ type, question, answers: string[], correctIndex }`
- `CharacterPath` : `{ character, zones: Zone[] }`
- `Character` : `{ id, name, emoji, summary, color }`
- `GameSave` : `{ selectedCharacterId }`

## Services existants

- `ContentLoaderService` : charge le `CharacterPath` depuis JSON via HTTP
- `CharacterPersistenceService` : gère le localStorage du personnage choisi

## Structure du projet existante

```
src/app/
├── core/
│   ├── services/
│   │   ├── character-persistence/
│   │   └── content-loader/
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
    │   └── game-shell/     ← placeholder, à enrichir
    ├── hero-screen/
    └── welcome-screen/
```

## Tableau d'Avancement
- [x] Tâche 1 : Créer le `GameEngineService` (service `providedIn: 'root'`) qui gère l'état du jeu : zone courante, index dans le Chemin, navigation vers la zone suivante/précédente, gestion des choix narratifs (bloquants vs conséquences), et le nombre de Pièces. Utilise Signals pour l'état.
- [x] Tâche 2 : Tests unitaires du `GameEngineService` (navigation entre zones, choix bloquants avec pénalité, choix avec conséquence, gain de Pièces)
- [x] Tâche 3 : Créer le composant `ZoneExplorer` qui affiche la narration de la Zone courante avec emojis et les Choix narratifs comme boutons cliquables
- [ ] Tâche 4 : Créer le composant `NarrativeChoice` (bouton de choix individuel avec feedback visuel pour les choix bloquants)
- [ ] Tâche 5 : Intégrer `ZoneExplorer` dans `GameShell`, remplacer le placeholder
- [ ] Tâche 6 : Gérer l'affichage des événements de pénalité (choix bloquant) avec un message et un bouton pour recommencer la Zone
- [ ] Tâche 7 : Vérifier build et tests passent

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 1 terminée

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
