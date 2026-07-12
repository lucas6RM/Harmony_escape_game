import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { WelcomeScreen } from '../welcome-screen/welcome-screen';
import { CharacterPersistenceService } from '../../core/services/character-persistence';
import { CharacterSelector } from './character-selector';
import { CHARACTERS } from '../../core/types';

/**
 * Mock du localStorage pour les tests d'intégration.
 *
 * Reproduit le comportement du localStorage sans dépendre
 * de l'environnement réel du navigateur.
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

describe("CharacterSelector - Tests d'intégration", () => {
  // ---------------------------------------------------------------------------
  // 1. Rendu du CharacterSelector avec les 4 personnages (composant isolé)
  // ---------------------------------------------------------------------------

  describe('Rendu du CharacterSelector', () => {
    let fixture: ComponentFixture<CharacterSelector>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CharacterSelector],
      }).compileComponents();

      fixture = TestBed.createComponent(CharacterSelector);
      fixture.detectChanges();
    });

    it('doit afficher les 4 Personnages dans la grille', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll<HTMLButtonElement>('.character-card');
      expect(cards.length).toBe(4);
    });

    it('doit afficher les 4 Personnages avec leurs identifiants corrects', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll<HTMLButtonElement>('[role="option"]');

      CHARACTERS.forEach((character) => {
        const card = compiled.querySelector<HTMLButtonElement>(`#character-${character.id}`);
        expect(card).toBeTruthy();
        expect(card?.getAttribute('aria-label')).toBe(`Choisir ${character.name}`);
      });
    });

    it("doit afficher l'emoji et le résumé de chaque Personnage", () => {
      const compiled = fixture.nativeElement as HTMLElement;

      CHARACTERS.forEach((character) => {
        const card = compiled.querySelector<HTMLButtonElement>(`#character-${character.id}`);
        const emoji = card?.querySelector('.character-emoji');
        const summary = card?.querySelector('.character-summary');

        expect(emoji?.textContent?.trim()).toBe(character.emoji);
        expect(summary?.textContent?.trim()).toBe(character.summary);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Événement characterSelected — clic sur chaque personnage
  // ---------------------------------------------------------------------------

  describe('Événement characterSelected', () => {
    let fixture: ComponentFixture<CharacterSelector>;
    let component: CharacterSelector;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CharacterSelector],
      }).compileComponents();

      fixture = TestBed.createComponent(CharacterSelector);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('doit émettre le characterId correct pour chaque Personnage', () => {
      const emittedIds: string[] = [];
      component.characterSelected.subscribe((id) => {
        emittedIds.push(id);
      });

      const compiled = fixture.nativeElement as HTMLElement;

      CHARACTERS.forEach((character) => {
        const card = compiled.querySelector<HTMLButtonElement>(`#character-${character.id}`);
        card?.click();
        fixture.detectChanges();
      });

      expect(emittedIds).toEqual(['mario', 'luigi', 'peach', 'daisy']);
    });

    it('doit émettre un seul événement par clic', () => {
      let emitCount = 0;
      component.characterSelected.subscribe(() => {
        emitCount++;
      });

      const compiled = fixture.nativeElement as HTMLElement;
      const marioCard = compiled.querySelector<HTMLButtonElement>('#character-mario');

      marioCard?.click();
      fixture.detectChanges();
      expect(emitCount).toBe(1);

      marioCard?.click();
      fixture.detectChanges();
      expect(emitCount).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Flux complet WelcomeScreen : sélection → sauvegarde → navigation
  // ---------------------------------------------------------------------------

  describe('Flux complet WelcomeScreen → CharacterSelector → Navigation', () => {
    let fixture: ComponentFixture<WelcomeScreen>;
    let router: Router;
    let mockStorage: LocalStorageMock;
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      mockStorage = new LocalStorageMock();
      vi.stubGlobal('localStorage', mockStorage);

      navigateSpy = vi.fn().mockResolvedValue(true);

      await TestBed.configureTestingModule({
        imports: [WelcomeScreen],
        providers: [
          provideRouter([]),
          {
            provide: Router,
            useValue: {
              navigate: navigateSpy,
            },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(WelcomeScreen);
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    afterEach(() => {
      mockStorage.clear();
      vi.unstubAllGlobals();
    });

    it('doit afficher le HeroScreen au démarrage et non le CharacterSelector', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-hero-screen')).toBeTruthy();
      expect(compiled.querySelector('app-character-selector')).toBeNull();
    });

    it('doit afficher le CharacterSelector après avoir cliqué "Commencer l\'aventure"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const startButton = compiled.querySelector<HTMLButtonElement>(
        'app-hero-screen button[type="button"]',
      );
      startButton?.click();
      fixture.detectChanges();

      expect(compiled.querySelector('app-character-selector')).toBeTruthy();
      expect(compiled.querySelector('app-hero-screen')).toBeNull();
    });

    it('doit sauvegarder "mario" dans le localStorage et naviguer vers /game', async () => {
      const compiled = fixture.nativeElement as HTMLElement;

      // Étape 1 : Ouvrir le CharacterSelector
      const startButton = compiled.querySelector<HTMLButtonElement>(
        'app-hero-screen button[type="button"]',
      );
      startButton?.click();
      fixture.detectChanges();

      // Étape 2 : Cliquer sur Mario
      const marioCard = compiled.querySelector<HTMLButtonElement>('#character-mario');
      marioCard?.click();
      fixture.detectChanges();

      // Étape 3 : Vérifier la sauvegarde dans le localStorage
      const persistence = TestBed.inject(CharacterPersistenceService);
      expect(persistence.getSavedCharacter()).toBe('mario');

      // Étape 4 : Vérifier la navigation
      expect(navigateSpy).toHaveBeenCalledWith(['/game']);
    });

    it('doit sauvegarder chaque Personnage correctement et naviguer vers /game', async () => {
      const persistence = TestBed.inject(CharacterPersistenceService);

      for (const character of CHARACTERS) {
        // Réinitialiser entre chaque itération
        navigateSpy.mockClear();
        mockStorage.clear();

        // Recréer le fixture pour chaque personnage
        await TestBed.inject(TestBed).resetTestingModule();
        await TestBed.configureTestingModule({
          imports: [WelcomeScreen],
          providers: [
            provideRouter([]),
            {
              provide: Router,
              useValue: {
                navigate: navigateSpy,
              },
            },
          ],
        }).compileComponents();

        fixture = TestBed.createComponent(WelcomeScreen);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;

        // Ouvrir le CharacterSelector
        const startButton = compiled.querySelector<HTMLButtonElement>(
          'app-hero-screen button[type="button"]',
        );
        startButton?.click();
        fixture.detectChanges();

        // Cliquer sur le personnage
        const card = compiled.querySelector<HTMLButtonElement>(`#character-${character.id}`);
        card?.click();
        fixture.detectChanges();

        // Vérifier la sauvegarde
        expect(persistence.getSavedCharacter()).toBe(character.id);
        expect(navigateSpy).toHaveBeenCalledWith(['/game']);
      }
    });

    it('doit persister le choix dans le localStorage même après clear du mock', () => {
      const persistence = TestBed.inject(CharacterPersistenceService);

      const compiled = fixture.nativeElement as HTMLElement;
      const startButton = compiled.querySelector<HTMLButtonElement>(
        'app-hero-screen button[type="button"]',
      );
      startButton?.click();
      fixture.detectChanges();

      const luigiCard = compiled.querySelector<HTMLButtonElement>('#character-luigi');
      luigiCard?.click();
      fixture.detectChanges();

      // Vérifier via le service que la donnée est bien persistée
      expect(persistence.getSavedCharacter()).toBe('luigi');

      // Vérifier directement dans le mock storage
      const raw = mockStorage.getItem('harmony_escape_game_save');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.selectedCharacterId).toBe('luigi');
    });

    it('doit naviguer vers /game avec le Router injecté', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      const startButton = compiled.querySelector<HTMLButtonElement>(
        'app-hero-screen button[type="button"]',
      );
      startButton?.click();
      fixture.detectChanges();

      const daisyCard = compiled.querySelector<HTMLButtonElement>('#character-daisy');
      daisyCard?.click();
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/game']);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Persistance — intégration CharacterPersistenceService + localStorage
  // ---------------------------------------------------------------------------

  describe('Persistance localStorage via CharacterPersistenceService', () => {
    let persistence: CharacterPersistenceService;
    let mockStorage: LocalStorageMock;

    beforeEach(() => {
      mockStorage = new LocalStorageMock();
      vi.stubGlobal('localStorage', mockStorage);

      TestBed.configureTestingModule({
        providers: [CharacterPersistenceService],
      });

      persistence = TestBed.inject(CharacterPersistenceService);
    });

    afterEach(() => {
      mockStorage.clear();
      vi.unstubAllGlobals();
    });

    it('doit sauvegarder et restaurer le personnage choisi', () => {
      persistence.saveCharacter('peach');
      expect(persistence.getSavedCharacter()).toBe('peach');
    });

    it("doit retourner null quand aucune sauvegarde n'existe", () => {
      expect(persistence.getSavedCharacter()).toBeNull();
    });

    it('doit effacer la sauvegarde avec clearSave', () => {
      persistence.saveCharacter('daisy');
      expect(persistence.getSavedCharacter()).toBe('daisy');

      persistence.clearSave();
      expect(persistence.getSavedCharacter()).toBeNull();
    });

    it('doit retourner null avec du JSON corrompu dans le localStorage', () => {
      mockStorage.setItem('harmony_escape_game_save', 'pas du json valide');
      expect(persistence.getSavedCharacter()).toBeNull();
    });

    it('doit retourner null avec un characterId invalide', () => {
      mockStorage.setItem(
        'harmony_escape_game_save',
        JSON.stringify({ selectedCharacterId: 'bowser' }),
      );
      expect(persistence.getSavedCharacter()).toBeNull();
    });
  });
});
