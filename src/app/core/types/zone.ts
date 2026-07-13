import type { NarrativeChoice } from './narrative-choice';
import type { Quiz } from './quiz';

/**
 * Zone du palais ou du jeu que le personnage traverse.
 *
 * Chaque Zone contient une exploration avec des choix narratifs,
 * puis se termine par une série de 2 à 3 Quizzes.
 */
export interface Zone {
  /** Identifiant unique de la Zone */
  id: string;

  /** Texte narratif d'introduction de la Zone */
  narration: string;

  /** Choix narratifs proposés au joueur */
  choices: NarrativeChoice[];

  /** Quizzes de fin de Zone (2 à 3 par Zone) */
  quizzes: Quiz[];
}
