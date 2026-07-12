import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroScreen } from './hero-screen';

describe('HeroScreen', () => {
  let fixture: ComponentFixture<HeroScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroScreen);
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('doit afficher le titre "Harmony Escape Game"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title).toBeTruthy();
    expect(title?.textContent).toContain('Harmony Escape Game');
  });

  it('doit afficher le texte d\'introduction sur Harmony capturée', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const storySection = compiled.querySelector('[aria-label="L\'histoire"]');
    expect(storySection).toBeTruthy();
    expect(storySection?.textContent).toContain('Harmony');
    expect(storySection?.textContent).toContain('Bowser Junior');
  });

  it('doit afficher le bouton "Commencer l\'aventure"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button[type="button"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Commencer l\'aventure');
  });

  it('doit émettre startGame quand le bouton est cliqué', () => {
    const component = fixture.componentInstance;
    let emitted = false;

    component.startGame.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector<HTMLButtonElement>('button[type="button"]');
    button?.click();
    fixture.detectChanges();

    expect(emitted).toBe(true);
  });

  it('doit avoir un rôle ARIA "main" sur le conteneur', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('[role="main"]');
    expect(container).toBeTruthy();
  });

  it('doit avoir un label ARIA sur le conteneur principal', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('[role="main"]');
    expect(container?.getAttribute('aria-label')).toContain('Écran d\'accueil');
  });
});
