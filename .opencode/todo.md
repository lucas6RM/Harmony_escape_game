# Issue #8 : Zones partagées + Rôles narratifs

## Spécification

## Parent
#1 (PRD: Harmony Escape Game)

## What to build
Ajouter les types `SharedZoneContent` et `CharacterRole` au modèle de domaine, puis mettre à jour `shared.json` avec au moins 2 Zones partagées et les rôles narratifs par personnage.

Décisions clés :
- Zones partagées : communes à tous les Chemins (ex: hall d'entrée, salle finale)
- Rôles narratifs : chaque Personnage non joué obtient un rôle dans l'histoire du joueur
- Contenu dans `public/assets/content/shared.json`

## Acceptance criteria
- [x] Type `SharedZoneContent` ajouté au modèle de domaine
- [x] Types `CharacterRole` et `CharacterRoles` ajoutés au modèle de domaine
- [x] Exports dans `index.ts`
- [x] `shared.json` contient au moins 2 Zones partagées
- [x] `shared.json` contient les rôles narratifs pour les 4 personnages

## Skills à Charger
- angular-developer
- domain-modeling

## Standards du Projet
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Framework : Angular 21.2 avec Signals
- Testing : Vitest + jsdom
- Styling : Tailwind CSS v4
- Changement de détection : OnPush

## Architecture existante
- Types dans `src/app/core/types/`
- JSON de contenu dans `public/assets/content/`
- `shared.json` existait déjà avec une Zone `shared_final`

## Tableau d'Avancement
- [x] Tâche 1 : Ajouter le type `SharedZoneContent` et `CharacterRole` au modèle de domaine, puis mettre à jour `shared.json` avec au moins 2 Zones partagées et les rôles narratifs par personnage
- [x] Tâche 2 : Étendre le ContentLoaderService pour charger shared.json et résoudre les références de Zones partagées dans les chemins
- [x] Tâche 3 : Ajouter loadCharacterRoles() au ContentLoaderService pour charger les rôles narratifs des autres personnages

## Zone de Transit & Logs
### Tâche en cours :
- Aucune — Tâche 3 validée.

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Tâche 3 validée : SharedZoneContent étendu avec characterRoles: CharacterRoles[], defaultValue mis à jour, loadCharacterRoles() retourne Signal<CharacterRole[]> via computed() utilisant sharedZonesResource existant, tableau vide retourné si personnage introuvable, JSDoc en français, build OK, 252 tests passants.

### Blocage Actuel :
- Aucun.
