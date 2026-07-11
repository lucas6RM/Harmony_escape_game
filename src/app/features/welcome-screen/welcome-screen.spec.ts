import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { WelcomeScreen } from './welcome-screen';
import { CharacterPersistenceService } from '../../core/services/character-persistence';

describe('WelcomeScreen', () => {
  let fixture: ComponentFixture<WelcomeScreen>;
  let component: WelcomeScreen;
  let router: Router;
  let saveCharacterSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    saveCharacterSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [WelcomeScreen],
      providers: [
        provideRouter([]),
        {
          provide: CharacterPersistenceService,
          useValue: {
            saveCharacter: saveCharacterSpy,
            getSavedCharacter: () => null,
            clearSave: vi.fn(),
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

  it('doit afficher le HeroScreen au démarrage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heroScreen = compiled.querySelector('app-hero-screen');
    expect(heroScreen).toBeTruthy();
  });

  it('ne doit pas afficher le CharacterSelector au démarrage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const characterSelector = compiled.querySelector('app-character-selector');
    expect(characterSelector).toBeNull();
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
});
