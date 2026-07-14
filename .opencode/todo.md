# Issue #22 : Chemin de Peach

## Spécification
Créer le fichier `peach.json` contenant le Chemin complet de Peach sous forme d'arbre de décision.

## Structure du fichier
Le fichier doit être placé dans `public/assets/content/peach.json` (le ContentLoaderService charge depuis `assets/content/`).

```json
{
  "character": "peach",
  "startZoneId": "peach-entree",
  "zones": {
    "peach-entree": { ... },
    "peach-salon-royal": { ... },
    ...
  }
}
```

## Arbre de décision
```
[peach-entree]
  ├─(salon)──► [peach-salon-royal]
  │               ├─(bibliothèque)──► [peach-bibliotheque] ──► [peach-jardin-prive] ──► [peach-chambre-harmony]
  │               └─(balcon)──► [peach-terrasse-royale] ──► [peach-chambre-harmony]
  └─(jardin)──► [peach-serre-enchantee]
                   ├─(fontaine)──► [peach-fontaine-des-soeux] ──► [peach-terrasse-royale] ──► [peach-chambre-harmony]
                   └─(chemin secret)──► [peach-atelier-de-luma] ──► [peach-bibliotheque] ──► [peach-jardin-prive] ──► [peach-chambre-harmony]
```

## Zones (9 au total)
1. **peach-entree** — Le hall d'accueil. Peach atterrit gracieusement.
2. **peach-salon-royal** — Salon élégant rempli de souvenirs d'Harmony
3. **peach-bibliotheque** — Bibliothèque avec livres sur les galaxies
4. **peach-jardin-prive** — Jardin magique de fleurs cosmiques
5. **peach-terrasse-royale** — Terrasse ouverte sur les galaxies
6. **peach-serre-enchantee** — Serre avec plantes magiques flottantes
7. **peach-fontaine-des-soeux** — Fontaine scintillante qui exauce les souhaits
8. **peach-atelier-de-luma** — Atelier secret de Luma avec objets magiques
9. **peach-chambre-harmony** — Zone finale, Harmony retenue

## Règles par Zone
- **Narration** : texte immersif, ton adapté à des enfants de 10 ans
- **Quiz** : 2 à 3 Quiz par Zone (sauf la Zone finale qui en a 1 difficile avec `isFinal: true`)
- **Choix narratifs** : au moins 2 choix par Zone (sauf les Zones terminales comme `peach-chambre-harmony` qui n'a pas de choix)
- **Types de Quiz** : répartir entre Maths (CM1), Français (CM1), Univers Mario, Contexte

## Parcours possibles
- Court : Entrée → Salon → Terrasse → Chambre (4 Zones)
- Moyen : Entrée → Salon → Bibliothèque → Jardin → Chambre (5 Zones)
- Long : Entrée → Serre → Fontaine → Terrasse → Chambre (5 Zones)
- Long 2 : Entrée → Serre → Atelier → Bibliothèque → Jardin → Chambre (6 Zones)

## Standards du Projet & Commandes
- Build : `npm run build`
- Test : `npm run test --watch=false`

## Zone de Transit & Logs
### Tâche en cours :
- [x] Créer le fichier peach.json avec les 9 Zones du Chemin de Peach

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Validé : JSON valide, 9 zones conformes, arbre de décision correct (4 chemins), quiz bien répartis (maths:18, francais:18, univers-mario:13, contexte:24), narrations adaptées au personnage de Peach, build OK, tests stables (20 échecs pré-existants non liés à cette issue).

### Blocage Actuel :
- Aucun.
