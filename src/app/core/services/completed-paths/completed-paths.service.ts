import { Injectable, inject, signal } from '@angular/core';
import type { CompletedPaths } from '../../types';
import { COMPLETED_PATHS_KEY } from '../../types';

/**
 * Identifiants valides des Personnages.
 */
const VALID_CHARACTER_IDS = ['mario', 'luigi', 'peach', 'daisy'] as const;

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
 * Service qui persiste les Chemins complétés dans le localStorage.
 *
 * Permet de suivre quels Personnages ont terminé leur Chemin,
 * et de débloquer le Badge de complétion quand les 4 Chemins
 * sont terminés.
 */
@Injectable({ providedIn: 'root' })
export class CompletedPathsService {
  private readonly storage = inject<LocalStorageAdapter>(DefaultLocalStorageAdapter);

  private readonly completedPaths = signal<CompletedPaths>(this.loadFromStorage());

  /**
   * Ajoute un Personnage au tableau des Chemins complétés.
   *
   * Si le Personnage est déjà présent, aucun doublon n'est ajouté.
   *
   * @param characterId - Identifiant du Personnage dont le Chemin est terminé
   */
  addCompletedPath(characterId: string): void {
    const current = this.completedPaths();
    if (!current.completedCharacterIds.includes(characterId)) {
      const updated: CompletedPaths = {
        completedCharacterIds: [...current.completedCharacterIds, characterId],
      };
      this.completedPaths.set(updated);
      this.persistToStorage(updated);
    }
  }

  /**
   * Retourne la liste des Chemins complétés.
   *
   * @returns Tableau des identifiants de Personnages ayant terminé leur Chemin
   */
  getCompletedPaths(): string[] {
    return this.completedPaths().completedCharacterIds;
  }

  /**
   * Retourne `true` si le Chemin du Personnage a déjà été terminé.
   *
   * @param characterId - Identifiant du Personnage à vérifier
   * @returns `true` si le Chemin est complété
   */
  isPathCompleted(characterId: string): boolean {
    return this.completedPaths().completedCharacterIds.includes(characterId);
  }

  /**
   * Retourne `true` si les 4 Chemins sont complétés.
   *
   * @returns `true` si tous les Personnages ont terminé leur Chemin
   */
  getAllCompleted(): boolean {
    const completed = this.completedPaths().completedCharacterIds;
    return VALID_CHARACTER_IDS.every(id => completed.includes(id));
  }

  /**
   * Efface la persistance des Chemins complétés.
   */
  clearCompletedPaths(): void {
    const empty: CompletedPaths = { completedCharacterIds: [] };
    this.completedPaths.set(empty);
    this.storage.removeItem(COMPLETED_PATHS_KEY);
  }

  // ---------------------------------------------------------------------------
  // Persistance interne
  // ---------------------------------------------------------------------------

  private loadFromStorage(): CompletedPaths {
    const raw = this.storage.getItem(COMPLETED_PATHS_KEY);
    if (!raw) {
      return { completedCharacterIds: [] };
    }

    try {
      const parsed = JSON.parse(raw) as CompletedPaths;
      if (
        parsed &&
        Array.isArray(parsed.completedCharacterIds) &&
        parsed.completedCharacterIds.every(id => typeof id === 'string')
      ) {
        return parsed;
      }
      return { completedCharacterIds: [] };
    } catch {
      return { completedCharacterIds: [] };
    }
  }

  private persistToStorage(data: CompletedPaths): void {
    this.storage.setItem(COMPLETED_PATHS_KEY, JSON.stringify(data));
  }
}
