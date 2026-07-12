import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { WelcomeScreen } from './welcome-screen';
import { PersistenceService } from '../../core/services/persistence';

describe('WelcomeScreen', () => {
  let fixture: ComponentFixture<WelcomeScreen>;
  let component: WelcomeScreen;
  let router: Router;
  let saveCharacterSpy: ReturnType<typeof vi.fn>;
  let clearSaveSpy: ReturnType<typeof vi.fn>;
  let isGameInProgressSpy: ReturnType<typeof vi.fn>;
  let getGameSaveSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    saveCharacterSpy = vi.fn();
    clearSaveSpy = vi.fn();
    isGameInProgressSpy = vi.fn().mockReturnValue(false);
    getGameSaveSpy = vi.fn().mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [WelcomeScreen],
      providers: [
        provideRouter([]),
        {
          provide: PersistenceService,
          useValue: {
            saveCharacter: saveCharacterSpy,
            getSavedCharacter: () => null,
            clearSave: clearSaveSpy,
            isGameInProgress: isGameInProgressSpy,
            getGameSave: getGameSaveSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeScreen);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('doit afficher le HeroScreen au démarrage quand aucune sauvegarde n\'existe', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heroScreen = compiled.querySelector('app-hero-screen');
    expect(heroScreen).toBeTruthy();
  });

  it('ne doit pas afficher le CharacterSelector au démarrage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const characterSelector = compiled.querySelector('app-character-selector');
    expect(characterSelector).toBeNull();
  });

  it('ne doit pas afficher le ResumeScreen quand aucune sauvegarde n\'existe', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const resumeScreen = compiled.querySelector('app-resume-screen');
    expect(resumeScreen).toBeNull();
  });

  it('doit afficher le CharacterSelector quand on clique "Commencer l\'aventure"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const startButton = compiled.querySelector<HTMLButtonElement>('app-hero-screen button[type="button"]');
    startButton?.click();
    fixture.detectChanges();

    const characterSelector = compiled.querySelector('app-character-selector');
    expect(characterSelector).toBeTruthy();
  });

  it('ne doit plus afficher le HeroScreen après avoir cliqué "Commencer l\'aventure"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const startButton = compiled.querySelector<HTMLButtonElement>('app-hero-screen button[type="button"]');
    startButton?.click();
    fixture.detectChanges();

    const heroScreen = compiled.querySelector('app-hero-screen');
    expect(heroScreen).toBeNull();
  });

  it('doit sauvegarder le personnage et naviguer vers /game quand un personnage est sélectionné', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // Cliquer sur "Commencer l'aventure" pour afficher le CharacterSelector
    const compiled = fixture.nativeElement as HTMLElement;
    const startButton = compiled.querySelector<HTMLButtonElement>('app-hero-screen button[type="button"]');
    startButton?.click();
    fixture.detectChanges();

    // Cliquer sur la carte Mario
    const marioCard = compiled.querySelector<HTMLButtonElement>('#character-mario');
    marioCard?.click();
    fixture.detectChanges();

    expect(saveCharacterSpy).toHaveBeenCalledWith('mario');
    expect(navigateSpy).toHaveBeenCalledWith(['/game']);
  });

  // ---------------------------------------------------------------------------
  // Tests de reprise (sauvegarde en cours)
  // ---------------------------------------------------------------------------

  describe('Reprise de partie', () => {
    let resumeFixture: ComponentFixture<WelcomeScreen>;
    let resumeComponent: WelcomeScreen;
    let resumeRouter: Router;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      const _saveCharacterSpy = vi.fn();
      const _clearSaveSpy = vi.fn();

      await TestBed.configureTestingModule({
        imports: [WelcomeScreen],
        providers: [
          provideRouter([]),
          {
            provide: PersistenceService,
            useValue: {
              saveCharacter: _saveCharacterSpy,
              getSavedCharacter: () => 'peach',
              clearSave: _clearSaveSpy,
              isGameInProgress: () => true,
              getGameSave: () => ({
                selectedCharacterId: 'peach',
                currentZoneIndex: 2,
                coins: 5,
                quizAttempts: 1,
                zonesCompleted: [0, 1],
              }),
            },
          },
        ],
      }).compileComponents();

      resumeFixture = TestBed.createComponent(WelcomeScreen);
      resumeComponent = resumeFixture.componentInstance;
      resumeRouter = TestBed.inject(Router);
      resumeFixture.detectChanges();
    });

    it('doit afficher le ResumeScreen quand une sauvegarde en cours existe', () => {
      const compiled = resumeFixture.nativeElement as HTMLElement;
      const resumeScreen = compiled.querySelector('app-resume-screen');
      expect(resumeScreen).toBeTruthy();
    });

    it('ne doit pas afficher le HeroScreen quand une sauvegarde en cours existe', () => {
      const compiled = resumeFixture.nativeElement as HTMLElement;
      const heroScreen = compiled.querySelector('app-hero-screen');
      expect(heroScreen).toBeNull();
    });

    it('doit transmettre le characterId sauvegardé au ResumeScreen', () => {
      const compiled = resumeFixture.nativeElement as HTMLElement;
      const resumeScreen = compiled.querySelector<HTMLElement>('app-resume-screen');
      expect(resumeScreen).toBeTruthy();
    });

    it('doit naviguer vers /game quand on clique "Reprendre"', () => {
      const navigateSpy = vi.spyOn(resumeRouter, 'navigate').mockResolvedValue(true);

      const compiled = resumeFixture.nativeElement as HTMLElement;
      const resumeButton = compiled.querySelector<HTMLButtonElement>('app-resume-screen .btn-resume');
      resumeButton?.click();
      resumeFixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/game']);
    });

    it('doit effacer la sauvegarde et afficher le HeroScreen quand on clique "Recommencer"', () => {
      const persistence = TestBed.inject(PersistenceService);
      const clearSaveSpy = vi.spyOn(persistence, 'clearSave');

      const compiled = resumeFixture.nativeElement as HTMLElement;
      const newGameButton = compiled.querySelector<HTMLButtonElement>('app-resume-screen .btn-new-game');
      newGameButton?.click();
      resumeFixture.detectChanges();

      expect(clearSaveSpy).toHaveBeenCalled();

      const heroScreen = compiled.querySelector('app-hero-screen');
      expect(heroScreen).toBeTruthy();

      const resumeScreen = compiled.querySelector('app-resume-screen');
      expect(resumeScreen).toBeNull();
    });
  });
});
