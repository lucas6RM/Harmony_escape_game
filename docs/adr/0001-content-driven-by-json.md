# Contenu du jeu piloté par JSON

Le contenu narratif et les Quiz sont stockés dans des fichiers JSON plutôt que codés en dur dans l'application Angular. Un fichier par personnage (`mario.json`, `luigi.json`, `peach.json`, `daisy.json`) contient le Chemin complet du personnage sous forme d'arbre de décision. Plus de fichier `shared.json` — chaque personnage a son contenu autonome.

**Structure** : Chaque fichier JSON contient un objet indexé par ID de Zone, avec un `startZoneId` indiquant la Zone de départ. Chaque Zone contient sa narration, 2 à 3 Quiz, et des choix narratifs pointant vers des `nextZoneId`.

**Pourquoi** : Cette séparation permet d'ajouter, modifier ou étendre des scénarios et des Quiz sans toucher au code de l'application. L'arbre de décision offre une expérience replayable : le joueur parcourt 3 à 6 Zones sur 8 à 12 disponibles, selon ses choix.
