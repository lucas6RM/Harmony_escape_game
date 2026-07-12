import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NarrativeChoiceComponent } from './narrative-choice';

describe('NarrativeChoiceComponent', () => {
  let component: NarrativeChoiceComponent;
  let fixture: ComponentFixture<NarrativeChoiceComponent>;

  /**
   * Crée le composant avec les inputs donnés.
   * Les input() sont des signaux en lecture seule : on utilise setInput()
   * sur le componentRef pour les définir avant detectChanges().
   */
  async function createWithInputs(
    text: string,
    index: number,
    blocking = false,
  ): Promise<{ component: NarrativeChoiceComponent; fixture: ComponentFixture<NarrativeChoiceComponent> }> {
    await TestBed.configureTestingModule({
      imports: [NarrativeChoiceComponent],
    }).compileComponents();

    const f = TestBed.createComponent(NarrativeChoiceComponent);
    f.componentRef.setInput('text', text);
    f.componentRef.setInput('index', index);
    f.componentRef.setInput('blocking', blocking);
    f.detectChanges();
    return { component: f.componentInstance, fixture: f };
  }

  describe('afficher le texte du choix', () => {
    it('affiche le texte du choix', async () => {
      ({ component, fixture } = await createWithInputs('Entrer par le grand portail 🚪', 0));

      const button = fixture.nativeElement.querySelector('button');
      expect(button.textContent).toContain('Entrer par le grand portail 🚪');
    });
  });

  describe('cliquer sur le choix', () => {
    it('émet l\'index via selected', async () => {
      ({ component, fixture } = await createWithInputs('Entrer par le grand portail 🚪', 2));

      let emittedIndex: number | undefined;
      component.selected.subscribe((idx: number) => {
        emittedIndex = idx;
      });

      const button = fixture.nativeElement.querySelector('button');
      button.click();
      fixture.detectChanges();

      expect(emittedIndex).toBe(2);
    });
  });

  describe('style bloquant', () => {
    it('applique la classe choice-blocking quand blocking est true', async () => {
      ({ component, fixture } = await createWithInputs('Essayer de grimper au mur 🧗', 1, true));

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('choice-blocking')).toBe(true);
    });

    it('n\'applique pas la classe choice-blocking quand blocking est false', async () => {
      ({ component, fixture } = await createWithInputs('Entrer par le grand portail 🚪', 0, false));

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('choice-blocking')).toBe(false);
    });

    it('affiche l\'icône d\'avertissement quand blocking est true', async () => {
      ({ component, fixture } = await createWithInputs('Essayer de grimper au mur 🧗', 1, true));

      const warning = fixture.nativeElement.querySelector('.choice-warning');
      expect(warning).toBeTruthy();
      expect(warning.textContent).toContain('⚠️');
    });

    it('n\'affiche pas l\'icône d\'avertissement quand blocking est false', async () => {
      ({ component, fixture } = await createWithInputs('Entrer par le grand portail 🚪', 0, false));

      const warning = fixture.nativeElement.querySelector('.choice-warning');
      expect(warning).toBeFalsy();
    });
  });

  describe('accessibilité', () => {
    it('le bouton a un aria-label descriptif', async () => {
      ({ component, fixture } = await createWithInputs('Entrer par le grand portail 🚪', 0));

      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-label')).toBe('Choix 1: Entrer par le grand portail 🚪');
    });

    it('l\'aria-label mentionne "chemin risqué" pour un choix bloquant', async () => {
      ({ component, fixture } = await createWithInputs('Essayer de grimper au mur 🧗', 1, true));

      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-label')).toContain('chemin risqué');
    });

    it('l\'icône d\'avertissement a aria-hidden="true"', async () => {
      ({ component, fixture } = await createWithInputs('Essayer de grimper au mur 🧗', 1, true));

      const warning = fixture.nativeElement.querySelector('.choice-warning');
      expect(warning.getAttribute('aria-hidden')).toBe('true');
    });

    it('le bouton a type="button"', async () => {
      ({ component, fixture } = await createWithInputs('Entrer par le grand portail 🚪', 0));

      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('type')).toBe('button');
    });
  });
});
