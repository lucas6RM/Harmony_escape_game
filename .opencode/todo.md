# Issue #3 : Écran d'accueil + Sélection du Personnage

## Spécification
Écran d'accueil immersif dans l'univers Mario Galaxy et sélection du Personnage parmi 4 héros (Mario, Luigi, Peach, Daisy).

Décisions clés :
- Interface textuelle + emojis (pas d'images)
- Résumé du personnage et son objectif avant de commencer
- Persistance du personnage choisi dans le local storage

## Acceptance criteria

- [ ] Écran d'accueil avec ambiance Mario Galaxy (texte + emojis)
- [ ] Les 4 personnages sont affichés avec un résumé
- [ ] Le joueur peut choisir un personnage
- [ ] Le choix est sauvegardé dans le local storage
- [ ] Tests d'intégration du composant de sélection

## Skills à Charger
- **`angular-developer`** — génération de code Angular
- **`tdd`** — test-driven development

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Décisions de Design (héritées de l'issue #2)

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

## Modèle de Domaine Additionnel

```typescript
// Personnage jouable
export interface Character {
  id: 'mario' | 'luigi' | 'peach' | 'daisy';
  name: string;
  emoji: string;
  summary: string;       // court résumé affiché à l'écran de sélection
  color: string;         // couleur thématique (ex: "#E52521" pour Mario)
}

// État de la persistance
export interface GameSave {
  selectedCharacterId: 'mario' | 'luigi' | 'peach' | 'daisy' | null;
}
```

## Tableau d'Avancement
- [x] Tâche 1 : Créer le type `Character` dans `src/app/core/types/` + tableau des 4 personnages avec leurs données (nom, emoji, résumé, couleur)
- [x] Tâche 2 : Créer `CharacterPersistenceService` (sauvegarder/restaurer le personnage choisi dans le localStorage)
- [x] Tâche 3 : Créer le composant `HeroScreen` (écran d'accueil immersif Mario Galaxy avec titre, emojis, texte d'intro)
- [ ] Tâche 4 : Créer le composant `CharacterSelector` (grille des 4 personnages cliquables avec résumé et emoji)
- [ ] Tâche 5 : Configurer le routage : `/accueil` → HeroScreen + CharacterSelector, puis navigation vers le jeu après sélection
- [ ] Tâche 6 : Tests d'intégration du composant `CharacterSelector` (sélection, persistance localStorage, navigation)
- [ ] Tâche 7 : Vérifier build et tests passent

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
