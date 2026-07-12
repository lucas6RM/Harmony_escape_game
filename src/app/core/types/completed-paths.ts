/**
 * État des Chemins complétés par le joueur.
 *
 * Permet de suivre quels Personnages ont déjà terminé leur
 * Chemin complet, afin de débloquer le Badge de complétion
 * quand les 4 Chemins sont terminés.
 */
export interface CompletedPaths {
  /**
   * Identifiants des Personnages dont le Chemin a été terminé.
   * Exemple : `['mario', 'peach']`
   */
  completedCharacterIds: string[];
}

/**
 * Clé utilisée dans le localStorage pour stocker les Chemins complétés.
 */
export const COMPLETED_PATHS_KEY = 'harmony_escape_completed_paths';
