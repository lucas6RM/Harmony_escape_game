/**
 * État sauvegardé de la partie dans le localStorage.
 *
 * Contient l'identifiant du Personnage choisi par le joueur
 * ainsi que la progression complète (Zone courante via ID, index
 * du Quiz en cours, Pièces, Chemins complétés).
 */
export interface GameSave {
  /**
   * Identifiant du Personnage sélectionné, ou `null` si aucun
   * Personnage n'a encore été choisi.
   */
  selectedCharacterId: 'mario' | 'luigi' | 'peach' | 'daisy' | null;

  /**
   * Identifiant de la Zone courante dans le Chemin du Personnage.
   */
  currentZoneId: string;

  /**
   * Index du Quiz en cours dans la Zone courante.
   */
  quizIndex: number;

  /**
   * Nombre de Pièces accumulées par le joueur.
   */
  coins: number;

  /**
   * Identifiants des Personnages dont le Chemin a été terminé.
   */
  completedPaths: string[];

  /**
   * Nombre de Zones explorées par le joueur durant la partie.
   */
  zonesExplored: number;
}

/**
 * Clé utilisée dans le localStorage pour stocker la sauvegarde.
 */
export const GAME_SAVE_KEY = 'harmony_escape_game_save';
