/**
 * Conteneur des Zones partagées et des rôles narratifs chargés depuis shared.json.
 */
export interface SharedZoneContent {
  sharedZones: import('./zone').Zone[];
  characterRoles: import('./character-role').CharacterRoles[];
}
