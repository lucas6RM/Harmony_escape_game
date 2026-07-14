# Issue #23 : Chemin de Daisy

## Spécification
Créer le fichier `daisy.json` contenant le Chemin complet de Daisy sous forme d'arbre de décision.

## Structure du fichier
```json
{
  "character": "daisy",
  "startZoneId": "daisy-entree",
  "zones": {
    "daisy-entree": { ... },
    ...
  }
}
```

## Arbre de décision
```
[daisy-entree]
  ├─(terrain)──► [daisy-terrain-de-sport]
  │                  ├─(rampe)──► [daisy-rampe-de-lancement] ──► [daisy-orbitale] ──► [daisy-chambre-harmony]
  │                  └─(tunnel)──► [daisy-grotte-lumineuse] ──► [daisy-chambre-harmony]
  └─(balcon)──► [daisy-terrasse-solaire]
                   ├─(trampolin)──► [daisy-zone-trampoline] ──► [daisy-orbitale] ──► [daisy-chambre-harmony]
                   └─(escalier)──► [daisy-salle-des-trophées] ──► [daisy-grotte-lumineuse] ──► [daisy-chambre-harmony]
```

## Zones (9 au total)
1. **daisy-entree** — Le hall d'accueil, Daisy est pleine d'énergie et prête à agir.
2. **daisy-terrain-de-sport** — Terrain de sport spatial avec obstacles
3. **daisy-rampe-de-lancement** — Rampe pour se lancer dans les étoiles
4. **daisy-orbitale** — Piste orbitale autour du palais
5. **daisy-grotte-lumineuse** — Grotte remplie de cristaux lumineux
6. **daisy-terrasse-solaire** — Terrasse ensoleillée avec vue panoramique
7. **daisy-zone-trampoline** — Zone de trampolines gravitationnels
8. **daisy-salle-des-trophées** — Salle avec les trophées d'Harmony
9. **daisy-chambre-harmony** — Zone finale, Harmony retenue

## Règles par Zone
- **Narration** : ton dynamique, énergique, plein d'humour
- **Quiz** : 2 à 3 Quiz par Zone (sauf la Zone finale qui en a 1 difficile)
- **Choix narratifs** : au moins 2 choix par Zone (sauf les Zones terminales)
- **Types de Quiz** : répartir entre Maths (CM1), Français (CM1), Univers Mario, Contexte

## Économie
- Bonne réponse : **+2 Pièces**
- Mauvaise réponse : **-1 Pièce**, rejouer le Quiz
- Sauter un Quiz : **-2 Pièces**, avance sans récompense
- Indice : **1 Pièce**
- Éliminer 2 fausses réponses : **2 Pièces**

## Parcours possibles
- Court : Entrée → Terrain → Grotte → Chambre (4 Zones)
- Moyen : Entrée → Terrain → Rampe → Orbitale → Chambre (5 Zones)
- Moyen : Entrée → Terrasse → Trampoline → Orbitale → Chambre (5 Zones)
- Long : Entrée → Terrasse → Trophées → Grotte → Chambre (5 Zones)

## Livrables
- Fichier `src/assets/content/daisy.json` complet et valide
- Tous les Quiz avec 4 réponses et `correctIndex`
- Tous les `nextZoneId` cohérents avec l'arbre ci-dessus

## Skills à Charger
- angular-developer (pour comprendre la structure du projet Angular)
- domain-modeling (pour respecter le vocabulaire du domaine)

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`

## Tableau d'Avancement
- [ ] Tâche 1 : Créer le squelette du fichier `src/assets/content/daisy.json` avec la structure de base (character, startZoneId, zones vide) et les 9 Zones avec leur narration, leurs choix narratifs et leur arbre de décision cohérent.
- [x] Tâche 2 : Rédiger les Quiz pour les Zones d'exploration (daisy-entree, daisy-terrain-de-sport, daisy-terrasse-solaire, daisy-rampe-de-lancement, daisy-grotte-lumineuse, daisy-zone-trampoline, daisy-salle-des-trophées, daisy-orbitale) — 2 à 3 Quiz par Zone, répartis entre Maths CM1, Français CM1, Univers Mario, Contexte.
- [ ] Tâche 3 : Rédiger le Quiz final de `daisy-chambre-harmony` (1 Quiz difficile de type Contexte avec `isFinal: true`), et valider la cohérence globale du fichier JSON (tous les nextZoneId corrects, format valide).

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
