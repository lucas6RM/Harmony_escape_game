# Projet : Harmony Escape Game

## Stack Technique
- **Node.js** : 24 LTS — utilise TOUJOURS `source ~/.nvm/nvm.sh && nvm use 24` avant tout appel npm/ng si `node --version` retourne autre chose que v24
- **Framework** : Angular (standalone components)
- **Langage** : TypeScript strict
- **Build** : Angular CLI
- **Package manager** : npm

## Commandes du Projet
- Build : `npm run build`
- Test : `npm run test --watch=false`
- Lint : `npm run lint`
- Serve : `npm run serve`

## Décisions Architecturales
- Voir [`docs/adr/`](docs/adr/) pour les ADR

## Standards de Code
- Composants standalone uniquement
- Signals pour la gestion d'état
- `ChangeDetectionStrategy.OnPush` systématique
- `input()` / `output()` au lieu des décorateurs
- Contrôle natif (`@if`, `@for`, `@switch`) au lieu des pipes Angular
- Forms réactifs plutôt que template-driven
- Accessibilité WCAG AA obligatoire
- `inject()` au lieu de l'injection par constructeur
