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
 * Service de persistance de la progression du jeu.
 *
 * Sauvegarde et restaure l'état complet de la partie dans le
 * localStorage du navigateur, permettant de conserver la progression
 * du joueur entre les sessions.
 */
@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private readonly storage = inject<LocalStorageAdapter>(DefaultLocalStorageAdapter);

  // ---------------------------------------------------------------------------
  // Méthodes rétrocompatibles (utilisées par les composants existants)
  // ---------------------------------------------------------------------------

  /**
   * Sauvegarde l'identifiant du Personnage dans le localStorage.
   *
   * @param characterId - Identifiant du Personnage à sauvegarder
   */
  saveCharacter(characterId: CharacterId): void {
    const save: GameSave = {
      selectedCharacterId: characterId,
      currentZoneId: '',
      quizIndex: 0,
      coins: 0,
      completedPaths: [],
    };
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

  // ---------------------------------------------------------------------------
  // Nouvelles méthodes — état complet du jeu
  // ---------------------------------------------------------------------------

  /**
   * Sauvegarde l'état complet du jeu en fusionnant avec la sauvegarde existante.
   *
   * @param state - État de progression à sauvegarder
   */
  saveGame(state: {
    currentZoneId: string;
    quizIndex: number;
    coins: number;
  }): void {
    const existing = this.getGameSave();
    const merged: GameSave = {
      selectedCharacterId: existing?.selectedCharacterId ?? null,
      currentZoneId: state.currentZoneId,
      quizIndex: state.quizIndex,
      coins: state.coins,
      completedPaths: existing?.completedPaths ?? [],
    };
    this.storage.setItem(GAME_SAVE_KEY, JSON.stringify(merged));
  }

  /**
   * Retourne la sauvegarde complète depuis le localStorage.
   *
   * @returns La sauvegarde complète, ou `null` si inexistante ou invalide
   */
  getGameSave(): GameSave | null {
    const raw = this.storage.getItem(GAME_SAVE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const save = JSON.parse(raw) as GameSave;

      if (!this.isValidGameSave(save)) {
        return null;
      }

      return save;
    } catch {
      return null;
    }
  }

  /**
   * Retourne `true` si une partie est en cours (sauvegarde valide avec un
   * Personnage sélectionné et au moins une donnée de progression).
   *
   * @returns `true` si une partie en cours est détectée
   */
  isGameInProgress(): boolean {
    const save = this.getGameSave();
    if (!save) {
      return false;
    }
    return save.selectedCharacterId !== null;
  }

  /**
   * Efface la sauvegarde du localStorage.
   */
  clearSave(): void {
    this.storage.removeItem(GAME_SAVE_KEY);
  }

  // ---------------------------------------------------------------------------
  // Validation interne
  // ---------------------------------------------------------------------------

  private isValidGameSave(save: unknown): save is GameSave {
    if (typeof save !== 'object' || save === null) {
      return false;
    }

    const obj = save as Record<string, unknown>;

    // selectedCharacterId doit être null ou un CharacterId valide
    const validIds: (CharacterId | null)[] = ['mario', 'luigi', 'peach', 'daisy', null];
    if (
      typeof obj['selectedCharacterId'] !== 'string' &&
      obj['selectedCharacterId'] !== null
    ) {
      return false;
    }
    if (!validIds.includes(obj['selectedCharacterId'] as CharacterId | null)) {
      return false;
    }

    // currentZoneId doit être une string
    if (typeof obj['currentZoneId'] !== 'string') {
      return false;
    }

    // quizIndex doit être un nombre >= 0
    if (typeof obj['quizIndex'] !== 'number' || obj['quizIndex'] < 0) {
      return false;
    }

    // coins doit être un nombre >= 0
    if (typeof obj['coins'] !== 'number' || obj['coins'] < 0) {
      return false;
    }

    // completedPaths doit être un tableau
    if (!Array.isArray(obj['completedPaths'])) {
      return false;
    }

    return true;
  }
}

/**
 * Alias rétrocompatible — les composants existants importent
 * `CharacterPersistenceService` depuis le barrel `character-persistence`.
 * Cette classe étend `PersistenceService` sans ajouter de comportement,
 * permettant son utilisation comme type et comme token d'injection.
 */
@Injectable({ providedIn: 'root' })
export class CharacterPersistenceService extends PersistenceService {}
