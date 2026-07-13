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
  ): Promise<{ component: NarrativeChoiceComponent; fixture: ComponentFixture<NarrativeChoiceComponent> }> {
    await TestBed.configureTestingModule({
      imports: [NarrativeChoiceComponent],
    }).compileComponents();

    const f = TestBed.createComponent(NarrativeChoiceComponent);
    f.componentRef.setInput('text', text);
    f.componentRef.setInput('index', index);
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

  describe('accessibilité', () => {
    it('le bouton a un aria-label descriptif', async () => {
      ({ component, fixture } = await createWithInputs('Entrer par le grand portail 🚪', 0));

      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-label')).toBe('Choix 1: Entrer par le grand portail 🚪');
    });

    it('le bouton a type="button"', async () => {
      ({ component, fixture } = await createWithInputs('Entrer par le grand portail 🚪', 0));

      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('type')).toBe('button');
    });
  });
});
