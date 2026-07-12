/**
 * État sauvegardé de la partie dans le localStorage.
 *
 * Contient l'identifiant du Personnage choisi par le joueur
 * ainsi que la progression complète (Zone courante, Pièces,
 * tentatives de Quiz, Zones terminées).
 */
export interface GameSave {
  /**
   * Identifiant du Personnage sélectionné, ou `null` si aucun
   * Personnage n'a encore été choisi.
   */
  selectedCharacterId: 'mario' | 'luigi' | 'peach' | 'daisy' | null;

  /**
   * Index de la Zone courante dans le Chemin du Personnage.
   * `0` signifie que le joueur est dans la première Zone.
   */
  currentZoneIndex: number;

  /**
   * Nombre de Pièces accumulées par le joueur.
   */
  coins: number;

  /**
   * Nombre de tentatives effectuées sur le Quiz de la Zone courante.
   */
  quizAttempts: number;

  /**
   * Tableau des indices des Zones déjà terminées par le joueur.
   */
  zonesCompleted: number[];
}

/**
 * Clé utilisée dans le localStorage pour stocker la sauvegarde.
 */
export const GAME_SAVE_KEY = 'harmony_escape_game_save';
