import { Injectable, inject } from '@angular/core';
import type { GameSave } from '../../types';
import { GAME_SAVE_KEY } from '../../types';

type CharacterId = 'mario' | 'luigi' | 'peach' | 'daisy';

/**
 * Interface d'accès au localStorage, permettant le mocking dans les tests.
 */
interface LocalStorageAdapter {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

/**
 * Implémentation par défaut qui délègue au localStorage du navigateur.
 */
@Injectable({ providedIn: 'root' })
class DefaultLocalStorageAdapter implements LocalStorageAdapter {
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

/**
 * Service de persistance du Personnage choisi.
 *
 * Sauvegarde et restaure l'identifiant du Personnage dans le
 * localStorage du navigateur, permettant de conserver le choix
 * du joueur entre les sessions.
 */
@Injectable({ providedIn: 'root' })
export class CharacterPersistenceService {
  private readonly storage = inject<LocalStorageAdapter>(DefaultLocalStorageAdapter);

  /**
   * Sauvegarde l'identifiant du Personnage dans le localStorage.
   *
   * @param characterId - Identifiant du Personnage à sauvegarder
   */
  saveCharacter(characterId: CharacterId): void {
    const save: GameSave = { selectedCharacterId: characterId };
    this.storage.setItem(GAME_SAVE_KEY, JSON.stringify(save));
  }

  /**
   * Restaure le Personnage sauvegardé depuis le localStorage.
   *
   * @returns L'identifiant du Personnage sauvegardé, ou `null` si aucune sauvegarde
   */
  getSavedCharacter(): GameSave['selectedCharacterId'] {
    const raw = this.storage.getItem(GAME_SAVE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const save = JSON.parse(raw) as GameSave;
      const validIds: CharacterId[] = ['mario', 'luigi', 'peach', 'daisy'];
      if (
        save.selectedCharacterId !== null &&
        validIds.includes(save.selectedCharacterId as CharacterId)
      ) {
        return save.selectedCharacterId;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Efface la sauvegarde du localStorage.
   */
  clearSave(): void {
    this.storage.removeItem(GAME_SAVE_KEY);
  }
}
