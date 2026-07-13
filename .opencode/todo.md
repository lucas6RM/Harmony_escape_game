# Issue #20 : Chemin de Mario

## Spécification
Créer le fichier `mario.json` contenant le Chemin complet de Mario sous forme d'arbre de décision.

## Structure du fichier
Le fichier doit être placé dans `src/assets/content/mario.json` (le ContentLoaderService charge depuis `assets/content/`).

```json
{
  "character": "mario",
  "startZoneId": "mario-entree",
  "zones": {
    "mario-entree": { ... },
    "mario-jardin-des-etoiles": { ... },
    ...
  }
}
```

## Arbre de décision
```
[mario-entree]
  ├─(jardin)──► [mario-jardin-des-etoiles]
  │               ├─(escalier)──► [mario-tour-de-luma] ──► [mario-observatoire] ──► [mario-chambre-harmony]
  │               └─(porte)──► [mario-salle-des-galaxies] ──► [mario-chambre-harmony]
  └─(couloir)──► [mario-chemin-des-meteores]
                    ├─(tunnel)──► [mario-sous-sol] ──► [mario-cuisine-cosmique] ──► [mario-chambre-harmony]
                    └─(pont)──► [mario-salle-des-galaxies] ──► [mario-chambre-harmony]
```

## Zones (9 au total)
1. **mario-entree** — Le hall d'accueil. Bowser Junior a laissé une trace.
2. **mario-jardin-des-etoiles** — Jardin flottant avec plantes galactiques
3. **mario-tour-de-luma** — Chambre de Luma, objets volants
4. **mario-observatoire** — Vue sur les étoiles, télescopes
5. **mario-salle-des-galaxies** — Mini-galaxies en rotation
6. **mario-chemin-des-meteores** — Couloir dangereux, roches flottantes
7. **mario-sous-sol** — Tunnels secrets
8. **mario-cuisine-cosmique** — Ingrédients spatiaux
9. **mario-chambre-harmony** — Zone finale, Harmony retenue

## Types TypeScript attendus (dans src/app/core/types/)

### Zone
```typescript
interface Zone {
  id: string;
  narration: string;
  choices: NarrativeChoice[];
  quizzes: Quiz[];
}
```

### NarrativeChoice
```typescript
interface NarrativeChoice {
  text: string;
  nextZoneId: string;
}
```

### Quiz
```typescript
interface Quiz {
  type: 'maths' | 'francais' | 'univers-mario' | 'contexte';
  question: string;
  answers: string[];
  correctIndex: number;
  hintText?: string;
  isFinal?: boolean;
}
```

## Règles par Zone
- **Narration** : texte immersif, ton adapté à des enfants de 10 ans
- **Quiz** : 2 à 3 Quiz par Zone (sauf la Zone finale qui en a 1 difficile avec `isFinal: true`)
- **Choix narratifs** : au moins 2 choix par Zone (sauf les Zones terminales comme `mario-chambre-harmony` qui n'a pas de choix)
- **Types de Quiz** : répartir entre Maths (CM1), Français (CM1), Univers Mario, Contexte

## Parcours possibles
- Court : Entrée → Jardin → Salle des galaxies → Chambre (4 Zones)
- Moyen : Entrée → Jardin → Tour → Observatoire → Chambre (5 Zones)
- Long : Entrée → Chemin des météores → Sous-sol → Cuisine → Chambre (5 Zones)

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Zone de Transit & Logs
### Tâche en cours :
- [x] Créer le fichier mario.json avec les 9 Zones du Chemin de Mario

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Validé : JSON valide, 9 zones conformes, arbre de décision correct, quiz bien répartis (maths:5, francais:4, univers-mario:5, contexte:8), narrations adaptées, build OK, 337 tests passés.

### Blocage Actuel :
- Aucun.
