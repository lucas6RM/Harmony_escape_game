# Issue #2 : Squelette Angular + Content Loader

## Spécification
Mettre en place le squelette Angular de l'application et le service Content Loader qui charge le contenu du jeu depuis des fichiers JSON.

Décisions clés :
- Application Angular avec standalone components et signals
- Structure JSON : un fichier par personnage (mario.json, luigi.json, peach.json, daisy.json) + shared.json pour les Zones partagées (ADR-0001)
- Schéma JSON par Zone : narration, choix narratifs (avec conséquences/blocages), Quiz avec 4 réponses
- Content Loader Service mockable pour les tests

Schéma JSON d'une Zone :
```json
{
  "id": "zone_id",
  "narration": "texte de la zone",
  "choices": [
    { "text": "je saute", "nextNarrationId": "n1", "blocking": false },
    { "text": "je rentre par la porte", "nextNarrationId": "n2", "blocking": true, "penalty": "recommencer la zone" }
  ],
  "quiz": {
    "type": "maths",
    "question": "...",
    "answers": ["A", "B", "C", "D"],
    "correctIndex": 0
  }
}
```

## Skills à Charger
- **`domain-modeling`** — pour affiner le modèle de domaine
- **`tdd`** — test-driven development

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Décisions de Design

| Décision | Choix |
|----------|-------|
| Placement des types | `src/app/core/types/` |
| Placement du service | `src/app/core/services/content-loader/` |
| Placement des JSON | `public/assets/content/` |
| Injection du contenu | `provideHttpClient` + `ContentLoaderService` |
| State | Signals (`signal()`, `computed()`) |
| Strategy | `ChangeDetectionStrategy.OnPush` systématique |

## Modèle de Domaine

```typescript
// Type de Quiz
export type QuizType = 'maths' | 'francais' | 'univers-mario' | 'contexte';

// Choix narratif
export interface NarrativeChoice {
  text: string;
  nextNarrationId: string;
  blocking: boolean;
  penalty?: string;
}

// Quiz
export interface Quiz {
  type: QuizType;
  question: string;
  answers: string[]; // toujours 4 réponses
  correctIndex: number; // 0-3
}

// Zone
export interface Zone {
  id: string;
  narration: string;
  choices: NarrativeChoice[];
  quiz: Quiz;
}

// Chemin (un personnage)
export interface CharacterPath {
  character: 'mario' | 'luigi' | 'peach' | 'daisy';
  zones: Zone[];
}
```

## Tableau d'Avancement
- [x] Tâche 1 : Créer les types TypeScript (Zone, NarrativeChoice, Quiz, QuizType, CharacterPath) dans `src/app/core/types/`
- [x] Tâche 2 : Créer les fichiers JSON placeholder (`mario.json`, `luigi.json`, `peach.json`, `daisy.json`, `shared.json`) dans `public/assets/content/`
- [x] Tâche 3 : Créer `ContentLoaderService` avec méthode `loadPath(character: string)` qui retourne un signal `CharacterPath`
- [ ] Tâche 4 : Tests unitaires du ContentLoaderService avec JSON mocké
- [ ] Tâche 5 : Vérifier build et tests passent

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 4

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
