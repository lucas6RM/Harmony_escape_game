/**
 * État sauvegardé de la partie dans le localStorage.
 *
 * Contient l'identifiant du Personnage choisi par le joueur
 * au moment de la sélection.
 */
export interface GameSave {
  /**
   * Identifiant du Personnage sélectionné, ou `null` si aucun
   * Personnage n'a encore été choisi.
   */
  selectedCharacterId: 'mario' | 'luigi' | 'peach' | 'daisy' | null;
}

/**
 * Clé utilisée dans le localStorage pour stocker la sauvegarde.
 */
export const GAME_SAVE_KEY = 'harmony_escape_game_save';
