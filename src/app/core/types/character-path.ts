import type { Zone } from './zone';

/**
 * Chemin propre à un Personnage, menant de la Zone de départ
 * jusqu'à la Zone finale où Harmony est retenue.
 *
 * Chaque Chemin contient 5 à 7 Zones.
 */
export interface CharacterPath {
  /** Personnage associé à ce Chemin */
  character: 'mario' | 'luigi' | 'peach' | 'daisy';

  /** Séquence de Zones de ce Chemin */
  zones: Zone[];
}
