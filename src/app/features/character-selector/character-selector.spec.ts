import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterSelector } from './character-selector';

describe('CharacterSelector', () => {
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

  it('doit créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('doit afficher le titre "Choisis ton héros"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title).toBeTruthy();
    expect(title?.textContent).toContain('Choisis ton héros');
  });

  it('doit afficher les 4 personnages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll<HTMLButtonElement>('.character-card');
    expect(cards.length).toBe(4);
  });

  it('doit afficher les noms des 4 personnages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const names = compiled.querySelectorAll('.character-name');
    expect(names.length).toBe(4);
    expect(names[0]?.textContent).toBe('Mario');
    expect(names[1]?.textContent).toBe('Luigi');
    expect(names[2]?.textContent).toBe('Peach');
    expect(names[3]?.textContent).toBe('Daisy');
  });

  it('doit afficher les emojis des personnages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emojis = compiled.querySelectorAll('.character-emoji');
    expect(emojis.length).toBe(4);
    expect(emojis[0]?.textContent?.trim()).toBe('🍄');
    expect(emojis[1]?.textContent?.trim()).toBe('🌿');
    expect(emojis[2]?.textContent?.trim()).toBe('👑');
    expect(emojis[3]?.textContent?.trim()).toBe('🌸');
  });

  it('doit afficher les résumés des personnages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const summaries = compiled.querySelectorAll('.character-summary');
    expect(summaries.length).toBe(4);
    summaries.forEach((summary) => {
      expect(summary.textContent?.length).toBeGreaterThan(20);
    });
  });

  it('doit appliquer la couleur thématique sur chaque carte', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll<HTMLButtonElement>('.character-card');
    expect(cards[0]?.style.getPropertyValue('--card-color')).toBe('#E52521');
    expect(cards[1]?.style.getPropertyValue('--card-color')).toBe('#4BAE4E');
    expect(cards[2]?.style.getPropertyValue('--card-color')).toBe('#F49AC1');
    expect(cards[3]?.style.getPropertyValue('--card-color')).toBe('#F5A623');
  });

  it('doit émettre characterSelected avec "mario" quand on clique sur Mario', () => {
    let emittedId = '';
    component.characterSelected.subscribe((id) => {
      emittedId = id;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const marioCard = compiled.querySelector<HTMLButtonElement>('#character-mario');
    marioCard?.click();
    fixture.detectChanges();

    expect(emittedId).toBe('mario');
  });

  it('doit émettre characterSelected avec "luigi" quand on clique sur Luigi', () => {
    let emittedId = '';
    component.characterSelected.subscribe((id) => {
      emittedId = id;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const luigiCard = compiled.querySelector<HTMLButtonElement>('#character-luigi');
    luigiCard?.click();
    fixture.detectChanges();

    expect(emittedId).toBe('luigi');
  });

  it('doit émettre characterSelected avec "peach" quand on clique sur Peach', () => {
    let emittedId = '';
    component.characterSelected.subscribe((id) => {
      emittedId = id;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const peachCard = compiled.querySelector<HTMLButtonElement>('#character-peach');
    peachCard?.click();
    fixture.detectChanges();

    expect(emittedId).toBe('peach');
  });

  it('doit émettre characterSelected avec "daisy" quand on clique sur Daisy', () => {
    let emittedId = '';
    component.characterSelected.subscribe((id) => {
      emittedId = id;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const daisyCard = compiled.querySelector<HTMLButtonElement>('#character-daisy');
    daisyCard?.click();
    fixture.detectChanges();

    expect(emittedId).toBe('daisy');
  });

  it('doit avoir un rôle ARIA "main" sur le conteneur', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('[role="main"]');
    expect(container).toBeTruthy();
  });

  it('doit avoir un label ARIA sur le conteneur principal', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('[role="main"]');
    expect(container?.getAttribute('aria-label')).toContain('Sélection du personnage');
  });

  it('doit avoir un listbox ARIA pour la grille de personnages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const listbox = compiled.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
  });

  it('doit avoir le rôle "option" sur chaque carte personnage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const options = compiled.querySelectorAll('[role="option"]');
    expect(options.length).toBe(4);
  });

  it('doit avoir un aria-label sur chaque carte', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll<HTMLButtonElement>('[role="option"]');
    cards.forEach((card) => {
      const label = card.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label?.startsWith('Choisir')).toBe(true);
    });
  });

  it('doit lier chaque carte à son résumé via aria-describedby', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll<HTMLButtonElement>('[role="option"]');
    cards.forEach((card) => {
      const describedBy = card.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const descElement = compiled.querySelector(`#${describedBy}`);
      expect(descElement).toBeTruthy();
    });
  });
});
