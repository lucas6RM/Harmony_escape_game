import { TestBed } from '@angular/core/testing';
import { PersistenceService, CharacterPersistenceService } from './persistence.service';

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

describe('PersistenceService', () => {
  let service: PersistenceService;
  let mockStorage: LocalStorageMock;

  beforeEach(() => {
    mockStorage = new LocalStorageMock();

    // Remplacer le global localStorage par le mock
    vi.stubGlobal('localStorage', mockStorage);

    TestBed.configureTestingModule({
      providers: [PersistenceService],
    });

    service = TestBed.inject(PersistenceService);
  });

  afterEach(() => {
    mockStorage.clear();
    vi.unstubAllGlobals();
  });

  // -----------------------------------------------------------------------
  // Alias rétrocompatible
  // -----------------------------------------------------------------------

  describe('CharacterPersistenceService alias', () => {
    it('étend PersistenceService', () => {
      expect(CharacterPersistenceService.prototype).toBeInstanceOf(PersistenceService);
    });
  });

  // -----------------------------------------------------------------------
  // Méthodes héritées (rétrocompatibles)
  // -----------------------------------------------------------------------

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

    it('initialise les champs de progression à zéro/vide', () => {
      service.saveCharacter('mario');

      const parsed = JSON.parse(mockStorage.getItem('harmony_escape_game_save')!);
      expect(parsed.currentZoneId).toBe('');
      expect(parsed.quizIndex).toBe(0);
      expect(parsed.coins).toBe(0);
      expect(parsed.completedPaths).toEqual([]);
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

  // -----------------------------------------------------------------------
  // Nouvelles méthodes — état complet du jeu (nouveau schéma save)
  // -----------------------------------------------------------------------

  describe('saveGame', () => {
    it('sauvegarde tous les champs de progression', () => {
      service.saveCharacter('luigi');
      service.saveGame({
        currentZoneId: 'luigi-zone-3',
        quizIndex: 1,
        coins: 15,
      });

      const save = service.getGameSave();
      expect(save).toBeTruthy();
      expect(save!.selectedCharacterId).toBe('luigi');
      expect(save!.currentZoneId).toBe('luigi-zone-3');
      expect(save!.quizIndex).toBe(1);
      expect(save!.coins).toBe(15);
      expect(save!.completedPaths).toEqual([]);
    });

    it('fusionne avec la sauvegarde existante en conservant le personnage', () => {
      service.saveCharacter('peach');
      service.saveGame({
        currentZoneId: 'peach-zone-1',
        quizIndex: 0,
        coins: 5,
      });

      const save = service.getGameSave();
      expect(save!.selectedCharacterId).toBe('peach');
      expect(save!.currentZoneId).toBe('peach-zone-1');
    });

    it('met à jour uniquement les champs de progression sans toucher au personnage', () => {
      service.saveCharacter('daisy');
      service.saveGame({
        currentZoneId: 'daisy-zone-1',
        quizIndex: 0,
        coins: 0,
      });

      service.saveGame({
        currentZoneId: 'daisy-zone-2',
        quizIndex: 1,
        coins: 10,
      });

      const save = service.getGameSave();
      expect(save!.selectedCharacterId).toBe('daisy');
      expect(save!.currentZoneId).toBe('daisy-zone-2');
      expect(save!.coins).toBe(10);
      expect(save!.quizIndex).toBe(1);
    });

    it('fonctionne même sans personnage préalablement sauvegardé', () => {
      service.saveGame({
        currentZoneId: '',
        quizIndex: 0,
        coins: 0,
      });

      const save = service.getGameSave();
      expect(save).toBeTruthy();
      expect(save!.selectedCharacterId).toBeNull();
      expect(save!.currentZoneId).toBe('');
    });
  });

  describe('getGameSave', () => {
    it('retourne null quand aucune sauvegarde n\'existe', () => {
      expect(service.getGameSave()).toBeNull();
    });

    it('retourne la sauvegarde complète après saveGame', () => {
      service.saveCharacter('mario');
      service.saveGame({
        currentZoneId: 'mario-zone-2',
        quizIndex: 1,
        coins: 8,
      });

      const save = service.getGameSave();
      expect(save).toBeTruthy();
      expect(save!.selectedCharacterId).toBe('mario');
      expect(save!.currentZoneId).toBe('mario-zone-2');
      expect(save!.quizIndex).toBe(1);
      expect(save!.coins).toBe(8);
    });

    it('retourne null quand le contenu du localStorage est corrompu', () => {
      mockStorage.setItem('harmony_escape_game_save', 'données corrompues');

      expect(service.getGameSave()).toBeNull();
    });

    it('retourne null quand les champs obligatoires sont manquants', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({ selectedCharacterId: 'mario' })
      );

      expect(service.getGameSave()).toBeNull();
    });

    it('retourne null quand quizIndex est négatif', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({
          selectedCharacterId: 'mario',
          currentZoneId: 'mario-zone-1',
          quizIndex: -1,
          coins: 0,
          completedPaths: [],
        })
      );

      expect(service.getGameSave()).toBeNull();
    });

    it('retourne null quand coins est négatif', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({
          selectedCharacterId: 'mario',
          currentZoneId: 'mario-zone-1',
          quizIndex: 0,
          coins: -5,
          completedPaths: [],
        })
      );

      expect(service.getGameSave()).toBeNull();
    });

    it('retourne null quand completedPaths n\'est pas un tableau', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({
          selectedCharacterId: 'mario',
          currentZoneId: 'mario-zone-1',
          quizIndex: 0,
          coins: 0,
          completedPaths: 'pas un tableau',
        })
      );

      expect(service.getGameSave()).toBeNull();
    });

    it('retourne null quand selectedCharacterId est invalide', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({
          selectedCharacterId: 'bowser',
          currentZoneId: 'mario-zone-1',
          quizIndex: 0,
          coins: 0,
          completedPaths: [],
        })
      );

      expect(service.getGameSave()).toBeNull();
    });

    it('retourne null quand currentZoneId n\'est pas une string', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({
          selectedCharacterId: 'mario',
          currentZoneId: 123,
          quizIndex: 0,
          coins: 0,
          completedPaths: [],
        })
      );

      expect(service.getGameSave()).toBeNull();
    });
  });

  describe('isGameInProgress', () => {
    it('retourne false quand aucune sauvegarde n\'existe', () => {
      expect(service.isGameInProgress()).toBe(false);
    });

    it('retourne true quand un personnage est sauvegardé', () => {
      service.saveCharacter('mario');

      expect(service.isGameInProgress()).toBe(true);
    });

    it('retourne true après un saveGame avec personnage', () => {
      service.saveCharacter('luigi');
      service.saveGame({
        currentZoneId: 'luigi-zone-2',
        quizIndex: 1,
        coins: 10,
      });

      expect(service.isGameInProgress()).toBe(true);
    });

    it('retourne false quand la sauvegarde est corrompue', () => {
      mockStorage.setItem('harmony_escape_game_save', 'corrompu');

      expect(service.isGameInProgress()).toBe(false);
    });

    it('retourne false après clearSave', () => {
      service.saveCharacter('peach');
      expect(service.isGameInProgress()).toBe(true);

      service.clearSave();
      expect(service.isGameInProgress()).toBe(false);
    });
  });
});
