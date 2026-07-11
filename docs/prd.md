# Harmony Escape Game - PRD

## Problem Statement

Les enfants de 10 ans ont besoin d'un jeu éducatif engageant qui combine apprentissage (maths, français) et divertissement dans un univers qu'ils connaissent (Mario). Le jeu doit être accessible, progressif, et offrir une expérience replayable.

## Solution

Un jeu d'escape game textuel sous forme de quiz pour enfants de 10 ans, dans l'univers de Super Mario Galaxy au palais d'Harmony et Luma. Le joueur doit retrouver Harmony capturée par Bowser Junior en traversant des Zones, répondant à des Quiz, et utilisant stratégiquement des Aides achetées avec des Pièces.

## User Stories

1. En tant que joueur, je veux voir un écran d'accueil immersif dans l'univers de Mario Galaxy, pour que je sois immédiatement plongé dans l'aventure
2. En tant que joueur, je veux choisir parmi 4 personnages (Mario, Luigi, Peach, Daisy), pour que je puisse jouer avec mon héros préféré
3. En tant que joueur, je veux voir un résumé de mon personnage et son objectif, pour comprendre ce qui m'attend
4. En tant que joueur, je veux explorer une Zone avec du texte narratif et des emojis, pour visualiser mon environnement
5. En tant que joueur, je veux faire des choix narratifs pendant l'exploration, pour me sentir acteur de l'histoire
6. En tant que joueur, je veux que certains choix mènent à des événements différents, pour que mes décisions aient du sens
7. En tant que joueur, je veux être pénalisé si je fais un mauvais choix bloquant, pour comprendre les conséquences
8. En tant que joueur, je veux répondre à un Quiz à 4 réponses en fin de Zone, pour progresser dans l'aventure
9. En tant que joueur, je veux répondre à des Quiz de différents types (Maths, Français, Univers Mario, Contexte), pour varier les défis
10. En tant que joueur, je veux gagner 2 Pièces en répondant correctement à un Quiz, pour avoir des ressources
11. En tant que joueur, je veux avoir deux chances de répondre à un Quiz, pour ne pas être trop frustré
12. En tant que joueur, je veux perdre 1 Pièce à ma deuxième erreur sur un Quiz, pour que les erreurs aient une conséquence
13. En tant que joueur, je veux pouvoir acheter un Indice pour 3 Pièces pendant un Quiz, pour avoir une chance de réussir
14. En tant que joueur, je veux pouvoir éliminer 2 fausses réponses pour 5 Pièces pendant un Quiz, pour augmenter mes chances
15. En tant que joueur, je veux voir mon solde de Pièces affiché en permanence, pour gérer mes ressources
16. En tant que joueur, je veux que ma progression soit sauvegardée automatiquement, pour ne rien perdre
17. En tant que joueur, je veux pouvoir reprendre mon Chemin là où je l'ai laissé, pour jouer à mon rythme
18. En tant que joueur, je veux traverser des Zones partagées avec d'autres personnages, pour sentir que les chemins sont connectés
19. En tant que joueur, je veux rencontrer les autres personnages dans mon histoire, pour une immersion narrative
20. En tant que joueur, je veux que les autres personnages aient des rôles différents selon mon personnage choisi, pour que chaque Chemin soit unique
21. En tant que joueur, je veux affronter un Quiz final pour libérer Harmony, pour un climax satisfaisant
22. En tant que joueur, je veux voir une scène de victoire après le Quiz final, pour être récompensé
23. En tant que joueur, je veux pouvoir rejouer avec un autre personnage après avoir terminé un Chemin, pour découvrir d'autres histoires
24. En tant que joueur, je veux obtenir un Badge de complétion en terminant les 4 Chemins, pour une récompense globale
25. En tant que joueur, je veux voir une scène bonus après le Badge de complétion, pour une conclusion satisfaisante
26. En tant que joueur, je veux que les Questions Maths soient adaptées au niveau CM1, pour être au bon niveau
27. En tant que joueur, je veux que les Questions Français soient adaptées au niveau CM1, pour être au bon niveau
28. En tant que joueur, je veux que les Questions Univers Mario testent mes connaissances, pour me sentir expert
29. En tant que joueur, je veux que les Questions Contexte fassent référence aux Zones déjà rencontrées, pour rester attentif à l'histoire
30. En tant que joueur, je veux voir une interface textuelle avec des emojis et des icônes, pour une ambiance visuelle sans lourdeur

## Implementation Decisions

- **Architecture Angular** : Application standalone components, signals pour la réactivité, injection de dépendances
- **Game Engine Service** : Service central qui orchestre le jeu (Zones, Quiz, Pièces, Aides, progression). C'est la seam principale de test.
- **Persistence Service** : Service dédié à la lecture/écriture du local storage. Mockable derrière une interface pour les tests.
- **Content Loader Service** : Service qui charge les fichiers JSON du contenu. Mockable pour injecter du contenu de test.
- **Structure JSON** : Un fichier par personnage (`mario.json`, `luigi.json`, `peach.json`, `daisy.json`) + `shared.json` pour les Zones partagées (ADR-0001)
- **Schéma JSON** : Chaque Zone contient un tableau de narrations avec choix, suivi d'un Quiz avec 4 réponses. Les choix peuvent avoir des conséquences (blocage, événement alternatif).
- **Schéma de sauvegarde** : `{ personnage: "mario", zoneCourante: 3, pieces: 4, tentativesQuiz: 1, complètes: ["mario", "luigi"] }`
- **Gestion d'état** : Signals pour l'état du jeu (zone courante, solde de pièces, tentatives restantes). Pas de zone nécessaire pour l'instant.
- **Types de Quiz** : Maths (problèmes CM1), Français (niveau CM1), Univers Mario (connaissances), Contexte (références aux Zones passées)

## Testing Decisions

- **Approche** : Tester uniquement le comportement externe des modules, pas les détails d'implémentation
- **Game Engine Service** : Tests unitaires complets couvrant tous les scénarios de jeu (Quiz réussi/échoué, achat d'aide, progression, réinitialisation)
- **Persistence Service** : Tests unitaires avec mock du local storage
- **Content Loader Service** : Tests unitaires avec contenu JSON mocké
- **Composants Angular** : Tests d'intégration pour les écrans principaux (sélection personnage, exploration Zone, Quiz, aide)
- **Framework** : Jasmine + Karma (défaut Angular)

## Out of Scope

- Multijoueur
- Backend ou synchronisation cloud
- Animations complexes ou images
- Son et musique
- Système de classement ou de score global entre joueurs
- Création de contenu par l'utilisateur (éditeur de scénarios)

## Further Notes

- Le contenu narratif doit être rédigé pour des enfants de 10 ans (langage simple, humoristique)
- Les Quiz doivent être équilibrés : pas trop faciles (ennuyeux), pas trop difficiles (frustrant)
- L'interface doit être responsive pour mobile et desktop
- Les emojis doivent être utilisés de manière cohérente avec l'univers Mario
