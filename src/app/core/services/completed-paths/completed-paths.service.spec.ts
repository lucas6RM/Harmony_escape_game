import { TestBed } from '@angular/core/testing';
import { CompletedPathsService } from './completed-paths.service';

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
}

describe('CompletedPathsService', () => {
  let service: CompletedPathsService;
  let mockStorage: LocalStorageMock;

  beforeEach(() => {
    mockStorage = new LocalStorageMock();

    vi.stubGlobal('localStorage', mockStorage);

    TestBed.configureTestingModule({
      providers: [CompletedPathsService],
    });

    service = TestBed.inject(CompletedPathsService);
  });

  afterEach(() => {
    mockStorage.clear();
    vi.unstubAllGlobals();
  });

  describe('addCompletedPath', () => {
    it('ajoute un Personnage au tableau des Chemins complétés', () => {
      service.addCompletedPath('mario');

      expect(service.getCompletedPaths()).toContain('mario');
      expect(service.getCompletedPaths()).toHaveLength(1);
    });

    it('ajoute plusieurs Personnages distincts', () => {
      service.addCompletedPath('mario');
      service.addCompletedPath('peach');

      const completed = service.getCompletedPaths();
      expect(completed).toContain('mario');
      expect(completed).toContain('peach');
      expect(completed).toHaveLength(2);
    });

    it('ne crée pas de doublon si on ajoute le même Personnage deux fois', () => {
      service.addCompletedPath('luigi');
      service.addCompletedPath('luigi');

      expect(service.getCompletedPaths()).toEqual(['luigi']);
    });
  });

  describe('isPathCompleted', () => {
    it('retourne false quand le Personnage n\'a pas terminé son Chemin', () => {
      expect(service.isPathCompleted('mario')).toBe(false);
    });

    it('retourne true quand le Personnage a terminé son Chemin', () => {
      service.addCompletedPath('daisy');

      expect(service.isPathCompleted('daisy')).toBe(true);
    });

    it('retourne false pour un autre Personnage non complété', () => {
      service.addCompletedPath('mario');

      expect(service.isPathCompleted('luigi')).toBe(false);
    });
  });

  describe('getAllCompleted', () => {
    it('retourne false quand aucun Chemin n\'est complété', () => {
      expect(service.getAllCompleted()).toBe(false);
    });

    it('retourne false quand un Personnage manque', () => {
      service.addCompletedPath('mario');
      service.addCompletedPath('luigi');
      service.addCompletedPath('peach');

      expect(service.getAllCompleted()).toBe(false);
    });

    it('retourne true quand les 4 Personnages sont complétés', () => {
      service.addCompletedPath('mario');
      service.addCompletedPath('luigi');
      service.addCompletedPath('peach');
      service.addCompletedPath('daisy');

      expect(service.getAllCompleted()).toBe(true);
    });
  });

  describe('clearCompletedPaths', () => {
    it('vide le localStorage et réinitialise l\'état', () => {
      service.addCompletedPath('mario');
      service.addCompletedPath('peach');

      expect(service.getCompletedPaths()).toHaveLength(2);

      service.clearCompletedPaths();

      expect(service.getCompletedPaths()).toEqual([]);
      expect(mockStorage.getItem('harmony_escape_completed_paths')).toBeNull();
    });

    it('ne lève pas d\'erreur quand il n\'y a rien à effacer', () => {
      expect(() => service.clearCompletedPaths()).not.toThrow();
    });
  });

  describe('persistance', () => {
    it('persiste les Chemins complétés dans le localStorage', () => {
      service.addCompletedPath('mario');

      const raw = mockStorage.getItem('harmony_escape_completed_paths');
      expect(raw).toBeTruthy();

      const parsed = JSON.parse(raw!);
      expect(parsed.completedCharacterIds).toContain('mario');
    });

    it('restaure les Chemins complétés depuis le localStorage à l\'initialisation', () => {
      // Simuler une donnée pré-existante dans le localStorage
      mockStorage.setItem(
        'harmony_escape_completed_paths',
        JSON.stringify({ completedCharacterIds: ['mario', 'luigi'] })
      );

      // Recréer le service pour qu'il relise le localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [CompletedPathsService],
      });
      service = TestBed.inject(CompletedPathsService);

      expect(service.getCompletedPaths()).toContain('mario');
      expect(service.getCompletedPaths()).toContain('luigi');
      expect(service.getCompletedPaths()).toHaveLength(2);
    });

    it('ignore les données corrompues dans le localStorage', () => {
      mockStorage.setItem('harmony_escape_completed_paths', 'données corrompues');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [CompletedPathsService],
      });
      service = TestBed.inject(CompletedPathsService);

      expect(service.getCompletedPaths()).toEqual([]);
    });
  });
});
