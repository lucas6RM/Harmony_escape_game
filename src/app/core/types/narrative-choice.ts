/**
 * Choix narratif proposé au joueur pendant l'exploration d'une Zone.
 *
 * Chaque choix mène à une Zone suivante différente, créant un arbre de décision.
 */
export interface NarrativeChoice {
  /** Texte affiché au joueur pour ce choix */
  text: string;

  /** Identifiant de la Zone suivante atteinte par ce choix */
  nextZoneId: string;
}
