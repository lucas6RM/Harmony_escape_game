/**
 * Barrel export rétrocompatible — redirige vers le nouveau dossier `persistence`.
 * Les composants existants importent toujours depuis ce chemin.
 */
export { CharacterPersistenceService, PersistenceService } from '../persistence';
