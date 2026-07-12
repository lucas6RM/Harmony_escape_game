/**
 * Type de Quiz.
 *
 * - `maths` : problèmes de mathématiques niveau CM1
 * - `francais` : questions de français niveau CM1
 * - `univers-mario` : connaissances sur l'univers Super Mario
 * - `contexte` : questions sur les Zones déjà rencontrées
 */
export type QuizType = 'maths' | 'francais' | 'univers-mario' | 'contexte';

/**
 * Quiz posé à la fin d'une Zone.
 *
 * Le joueur choisit parmi 4 réponses. Un Quiz correct rapporte des Pièces
 * et avance le joueur. Un Quiz incorrect peut pénaliser ou forcer de rejouer.
 */
export interface Quiz {
  /** Type de Quiz */
  type: QuizType;

  /** Énoncé de la question */
  question: string;

  /** Les 4 réponses proposées (ordre fixe) */
  answers: string[];

  /** Index de la réponse correcte (0-3) */
  correctIndex: number;

  /** true si c'est le Quiz final de la dernière Zone (plus difficile) */
  isFinal?: boolean;
}

/**
 * Type d'Aide disponible pendant un Quiz.
 * - `indice` : affiche un indice textuel (coûte 3 Pièces)
 * - `elimination` : masque 2 fausses réponses (coûte 5 Pièces)
 */
export type HintType = 'indice' | 'elimination';

/**
 * Coût en Pièces de chaque type d'Aide.
 */
export const HINT_COSTS: Record<HintType, number> = {
  indice: 3,
  elimination: 5,
};
