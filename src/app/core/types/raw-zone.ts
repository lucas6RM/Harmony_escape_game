import type { Zone } from './zone';

/**
 * Chemin brut tel qu'il est chargé depuis un fichier JSON de personnage.
 * Structure en arbre : les Zones sont indexées par leur identifiant,
 * avec un `startZoneId` indiquant la Zone de départ.
 */
export type RawCharacterPath = {
  character: 'mario' | 'luigi' | 'peach' | 'daisy';
  startZoneId: string;
  zones: Record<string, Zone>;
};
