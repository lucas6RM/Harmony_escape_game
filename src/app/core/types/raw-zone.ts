import type { Zone } from './zone';

/**
 * Une Zone telle qu'elle apparaît dans un fichier JSON de personnage.
 * Peut être une Zone complète ou une référence vers une Zone partagée.
 */
export type RawZone = Zone | { sharedZoneId: string };

/**
 * Chemin brut tel qu'il est chargé depuis un fichier JSON de personnage.
 * Les Zones peuvent être complètes ou des références vers shared.json.
 */
export type RawCharacterPath = {
  character: 'mario' | 'luigi' | 'peach' | 'daisy';
  zones: RawZone[];
};
