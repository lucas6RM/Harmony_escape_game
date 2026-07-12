/**
 * Rôle narratif d'un autre Personnage dans l'aventure du joueur.
 *
 * Quand le joueur choisit un Personnage, chaque autre Personnage
 * obtient un rôle narratif spécifique (ex: "l'explorateur", "la stratège").
 */
export interface CharacterRole {
  /** Personnage qui joue ce rôle */
  characterId: 'mario' | 'luigi' | 'peach' | 'daisy';

  /** Titre du rôle (ex: "L'Explorateur") */
  roleTitle: string;

  /** Description courte du rôle dans la narration */
  description: string;
}

/**
 * Rôles des 3 autres personnages quand un personnage spécifique est joué.
 */
export interface CharacterRoles {
  /** Personnage joué par le joueur */
  forCharacter: 'mario' | 'luigi' | 'peach' | 'daisy';

  /** Rôles des 3 autres personnages */
  roles: CharacterRole[];
}
