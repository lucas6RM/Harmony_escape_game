import type { Zone } from './zone';

/**
 * Chemin propre à un Personnage, menant de la Zone de départ
 * jusqu'à la Zone finale où Harmony est retenue.
 *
 * Structure en arbre : les Zones sont indexées par leur identifiant,
 * avec un `startZoneId` indiquant la Zone d'entrée du Chemin.
 * Le joueur explore 3 à 6 Zones par partie selon ses choix narratifs.
 */
export interface CharacterPath {
  /** Personnage associé à ce Chemin */
  character: 'mario' | 'luigi' | 'peach' | 'daisy';

  /** Identifiant de la Zone de départ de ce Chemin */
  startZoneId: string;

  /** Zones du Chemin, indexées par leur identifiant */
  zones: { [zoneId: string]: Zone };
}
