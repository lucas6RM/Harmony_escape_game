/**
 * Personnage jouable de l'aventure.
 *
 * Chaque Personnage suit un Chemin unique pour retrouver
 * Harmony capturée par Bowser Junior.
 */
export interface Character {
  /** Identifiant unique du Personnage */
  id: 'mario' | 'luigi' | 'peach' | 'daisy';

  /** Nom affiché du Personnage */
  name: string;

  /** Emoji représentatif du Personnage */
  emoji: string;

  /** Résumé court qui explique son rôle dans l'aventure */
  summary: string;

  /** Couleur thématique du Personnage (hex) */
  color: string;
}

/**
 * Tableau des 4 Personnages jouables.
 */
export const CHARACTERS: Readonly<Character[]> = [
  {
    id: 'mario',
    name: 'Mario',
    emoji: '🍄',
    summary:
      "Le héros le plus célèbre du royaume ! Mario est courageux et toujours prêt à sauter dans l'action pour sauver ses amis. Il va te guider à travers les galaxies du palais pour retrouver Harmony.",
    color: '#E52521',
  },
  {
    id: 'luigi',
    name: 'Luigi',
    emoji: '🌿',
    summary:
      "Le frère cadet de Mario, un peu timide mais incroyablement déterminé ! Même s'il a parfois la frousse, Luigi ne reculera devant rien pour sauver Harmony. Sa grande sautille est une arme redoutable !",
    color: '#4BAE4E',
  },
  {
    id: 'peach',
    name: 'Peach',
    emoji: '👑',
    summary:
      "La princesse Peach est bien plus qu'une reine couronnée : elle est astucieuse, gentille et pleine de ressources. Elle utilise son intelligence pour débloquer les passages et aider ses amis dans leur quête.",
    color: '#F49AC1',
  },
  {
    id: 'daisy',
    name: 'Daisy',
    emoji: '🌸',
    summary:
      "La princesse Daisy est l'amie fidèle de Peach et une aventurière de premier ordre ! Énergique et pleine de fou rire, elle n'a peur de rien et transforme chaque obstacle en un super défi à relever.",
    color: '#F5A623',
  },
] as const;
