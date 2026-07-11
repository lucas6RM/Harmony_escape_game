# Contenu du jeu piloté par JSON

Le contenu narratif et les Quiz sont stockés dans des fichiers JSON plutôt que codés en dur dans l'application Angular. Un fichier par personnage (`mario.json`, `luigi.json`, `peach.json`, `daisy.json`) contient le Chemin propre au personnage. Les Zones partagées entre personnages sont dans `shared.json`.

**Pourquoi** : Cette séparation permet d'ajouter, modifier ou étendre des scénarios et des Quiz sans toucher au code de l'application. Le contenu est donc modulable et facilement extensible.
