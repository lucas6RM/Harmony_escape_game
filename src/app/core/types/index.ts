/**
 * Types du modèle de domaine — Harmony Escape Game.
 *
 * Expose les interfaces et types utilisés pour représenter
 * le contenu du jeu (Zones, Chemins, Quizzes, Choix narratifs).
 */
export type { Character } from './character';
export { CHARACTERS } from './character';
export type { QuizType, Quiz } from './quiz';
export type { HintType } from './quiz';
export { HINT_COSTS } from './quiz';
export type { NarrativeChoice } from './narrative-choice';
export type { Zone } from './zone';
export type { CharacterPath } from './character-path';
export type { GameSave } from './game-save';
export { GAME_SAVE_KEY } from './game-save';
export type { SharedZoneContent } from './shared-zone';
export type { CharacterRole, CharacterRoles } from './character-role';
export type { RawZone, RawCharacterPath } from './raw-zone';
