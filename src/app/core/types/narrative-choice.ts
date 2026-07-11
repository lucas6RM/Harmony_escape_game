/**
 * Choix narratif proposé au joueur pendant l'exploration d'une Zone.
 *
 * Certains choix mènent à des événements différents, d'autres sont bloquants
 * (mauvais choix = pénalité ou recommencer la Zone).
 */
export interface NarrativeChoice {
  /** Texte affiché au joueur pour ce choix */
  text: string;

  /** Identifiant de la narration suivante atteinte par ce choix */
  nextNarrationId: string;

  /** Si true, ce choix est bloquant (mauvais chemin) */
  blocking: boolean;

  /** Pénalité appliquée si le choix est bloquant (ex: "recommencer la zone") */
  penalty?: string;
}
