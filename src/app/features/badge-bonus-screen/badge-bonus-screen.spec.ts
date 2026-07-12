import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeBonusScreen } from './badge-bonus-screen';

describe('BadgeBonusScreen', () => {
  let fixture: ComponentFixture<BadgeBonusScreen>;
  let component: BadgeBonusScreen;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeBonusScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeBonusScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('doit afficher le titre de la scène bonus', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1.bonus-title');
    expect(title).toBeTruthy();
    expect(title?.textContent).toContain('Scène Bonus');
    expect(title?.textContent).toContain('Le Retour d\'Harmony');
  });

  it('doit afficher les 4 personnages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const showcases = compiled.querySelectorAll('.character-showcase');
    expect(showcases.length).toBe(4);
  });

  it('doit afficher les noms des 4 personnages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const names = compiled.querySelectorAll('.character-showcase__name');
    expect(names.length).toBe(4);
    expect(names[0]?.textContent).toBe('Mario');
    expect(names[1]?.textContent).toBe('Luigi');
    expect(names[2]?.textContent).toBe('Peach');
    expect(names[3]?.textContent).toBe('Daisy');
  });

  it('doit afficher le message de célébration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const celebrationText = compiled.querySelector('.celebration-text');
    expect(celebrationText).toBeTruthy();
    expect(celebrationText?.textContent).toContain('4 Chemins');
    expect(celebrationText?.textContent).toContain('véritable héros');
  });

  it('doit afficher la narration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const narrationParagraphs = compiled.querySelectorAll('.narration-text');
    expect(narrationParagraphs.length).toBeGreaterThan(0);
  });

  it('doit émettre close quand on clique sur "Retour à la sélection"', () => {
    const closeSpy = vi.spyOn(component.close, 'emit');

    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector<HTMLButtonElement>('.btn-back');
    backButton?.click();
    fixture.detectChanges();

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('doit avoir le bon aria-label sur le conteneur', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const screen = compiled.querySelector('.bonus-screen');
    expect(screen?.getAttribute('aria-label')).toContain('Scène bonus');
  });
});
