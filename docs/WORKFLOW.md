# Workflow de développement

## Comment fonctione une session agent

### 1. Récupérer le contexte
- Lire `CONTEXT.md` pour le vocabulaire du domaine
- Lire les ADRs dans `docs/adr/` pour les décisions architecturales
- Récupérer l'issue depuis le tracker : `gh issue view <N>`

### 2. Créer une branche
```bash
git checkout -b feat/issue-N-nom-de-l-issue
```

### 3. Implémenter la vertical slice
Chaque issue est une tranche verticale complète :
- Logique métier (service)
- Interface (composants Angular)
- Tests (unitaires + intégration)

### 4. Vérifier
```bash
ng build
ng test
```

### 5. Commit + PR
```bash
git add .
git commit -m "feat: description de la slice"
git push -u origin feat/issue-N-nom
gh pr create --label "ready-for-review"
```

## Ordre de traitement des issues

Les issues doivent être traitées dans l'ordre des dépendances :

| Issue | Blocked by |
|---|---|
| #2 Squelette Angular + Content Loader | None |
| #3 Écran d'accueil + Sélection | #2 |
| #4 Exploration Zone + Choix narratifs | #2 |
| #5 Système de Quiz | #4 |
| #6 Système d'Aides | #5 |
| #7 Sauvegarde auto + Reprise | #4 |
| #8 Zones partagées + Personnages croisés | #4 |
| #9 Fin de partie + Quiz final | #5 |
| #10 Rejouabilité + Badge | #9 |
| #20 Contenu JSON Mario | None (indépendant) |
| #21 Contenu JSON Luigi | None (indépendant) |
| #22 Contenu JSON Peach | None (indépendant) |
| #23 Contenu JSON Daisy | None (indépendant) |

Les issues sans blocage mutuel peuvent être traitées en parallèle. Les issues de contenu (#20-23) sont indépendantes les unes des autres et peuvent être réalisées simultanément.

## Règles pour l'agent

- Respecter le vocabulaire de `CONTEXT.md` (Zone, Quiz, Pièce, etc.)
- Suivre les ADRs (ex: contenu dans JSON, pas en dur)
- Chaque slice doit être testable et demoable indépendamment
- Pas de merge avant que les dépendances ne soient merged
