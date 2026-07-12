import { TestBed } from '@angular/core/testing';
import { CharacterPersistenceService } from './character-persistence.service';

/**
 * Mock du localStorage pour les tests unitaires.
 */
class LocalStorageMock {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(_index: number): string | null {
    return null;
  }

  readonly sessionStorage: never = undefined as never;
}

describe('CharacterPersistenceService', () => {
  let service: CharacterPersistenceService;
  let mockStorage: LocalStorageMock;

  beforeEach(() => {
    mockStorage = new LocalStorageMock();

    // Remplacer le global localStorage par le mock
    vi.stubGlobal('localStorage', mockStorage);

    TestBed.configureTestingModule({
      providers: [CharacterPersistenceService],
    });

    service = TestBed.inject(CharacterPersistenceService);
  });

  afterEach(() => {
    mockStorage.clear();
    vi.unstubAllGlobals();
  });

  describe('saveCharacter', () => {
    it('sauvegarde l\'identifiant du Personnage dans le localStorage', () => {
      service.saveCharacter('mario');

      const raw = mockStorage.getItem('harmony_escape_game_save');
      expect(raw).toBeTruthy();

      const parsed = JSON.parse(raw!);
      expect(parsed.selectedCharacterId).toBe('mario');
    });

    it('sauvegarde correctement chaque Personnage', () => {
      service.saveCharacter('luigi');
      expect(JSON.parse(mockStorage.getItem('harmony_escape_game_save')!).selectedCharacterId).toBe('luigi');

      service.saveCharacter('peach');
      expect(JSON.parse(mockStorage.getItem('harmony_escape_game_save')!).selectedCharacterId).toBe('peach');

      service.saveCharacter('daisy');
      expect(JSON.parse(mockStorage.getItem('harmony_escape_game_save')!).selectedCharacterId).toBe('daisy');
    });
  });

  describe('getSavedCharacter', () => {
    it('retourne null quand aucune sauvegarde n\'existe', () => {
      expect(service.getSavedCharacter()).toBeNull();
    });

    it('retourne l\'identifiant sauvegardé', () => {
      service.saveCharacter('peach');

      expect(service.getSavedCharacter()).toBe('peach');
    });

    it('retourne null quand le contenu du localStorage est corrompu', () => {
      mockStorage.setItem('harmony_escape_game_save', 'ceci n\'est pas du JSON valide');

      expect(service.getSavedCharacter()).toBeNull();
    });

    it('retourne null quand l\'identifiant sauvegardé est invalide', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({ selectedCharacterId: 'bowser' })
      );

      expect(service.getSavedCharacter()).toBeNull();
    });

    it('retourne null quand selectedCharacterId est null dans la sauvegarde', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({ selectedCharacterId: null })
      );

      expect(service.getSavedCharacter()).toBeNull();
    });
  });

  describe('clearSave', () => {
    it('supprime la sauvegarde du localStorage', () => {
      service.saveCharacter('daisy');
      expect(service.getSavedCharacter()).toBe('daisy');

      service.clearSave();
      expect(service.getSavedCharacter()).toBeNull();
    });

    it('ne lève pas d\'erreur quand il n\'y a pas de sauvegarde', () => {
      expect(() => service.clearSave()).not.toThrow();
    });
  });
});
