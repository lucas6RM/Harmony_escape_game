import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizPanelComponent } from './quiz-panel';
import type { Quiz } from '../../../core/types';

describe('QuizPanelComponent', () => {
  let component: QuizPanelComponent;
  let fixture: ComponentFixture<QuizPanelComponent>;

  const sampleQuiz: Quiz = {
    type: 'maths',
    question: 'Combien font 24 × 3 ?',
    answers: ['62', '72', '82', '52'],
    correctIndex: 1,
  };

  /**
   * Crée le composant avec les inputs donnés.
   */
  async function createWithInputs(
    quiz: Quiz = sampleQuiz,
    feedback: 'correct' | 'incorrect' | null = null,
    disabled = false,
    selectedAnswerIndex: number | null = null,
    hintText: string | null = null,
    eliminatedAnswers: number[] = [],
    canBuyHint = false,
    canBuyElimination = false,
  ): Promise<{ component: QuizPanelComponent; fixture: ComponentFixture<QuizPanelComponent> }> {
    await TestBed.configureTestingModule({
      imports: [QuizPanelComponent],
    }).compileComponents();

    const f = TestBed.createComponent(QuizPanelComponent);
    f.componentRef.setInput('quiz', quiz);
    f.componentRef.setInput('feedback', feedback);
    f.componentRef.setInput('disabled', disabled);
    f.componentRef.setInput('selectedAnswerIndex', selectedAnswerIndex);
    f.componentRef.setInput('hintText', hintText);
    f.componentRef.setInput('eliminatedAnswers', eliminatedAnswers);
    f.componentRef.setInput('canBuyHint', canBuyHint);
    f.componentRef.setInput('canBuyElimination', canBuyElimination);
    f.detectChanges();
    return { component: f.componentInstance, fixture: f };
  }

  describe('rendre la question', () => {
    it('affiche la question du Quiz', async () => {
      ({ component, fixture } = await createWithInputs());

      const question = fixture.nativeElement.querySelector('.quiz-question');
      expect(question.textContent).toContain('Combien font 24 × 3 ?');
    });
  });

  describe('rendre les boutons de réponse', () => {
    it('affiche 4 boutons de réponse', async () => {
      ({ component, fixture } = await createWithInputs());

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      expect(buttons.length).toBe(4);
    });

    it('chaque bouton affiche le texte de sa réponse', async () => {
      ({ component, fixture } = await createWithInputs());

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      expect(buttons[0].textContent).toContain('62');
      expect(buttons[1].textContent).toContain('72');
      expect(buttons[2].textContent).toContain('82');
      expect(buttons[3].textContent).toContain('52');
    });
  });

  describe('cliquer sur une réponse', () => {
    it('émet answerSelected avec l\'index de la réponse', async () => {
      ({ component, fixture } = await createWithInputs());

      let emittedIndex: number | undefined;
      component.answerSelected.subscribe((idx: number) => {
        emittedIndex = idx;
      });

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      buttons[2].click();
      fixture.detectChanges();

      expect(emittedIndex).toBe(2);
    });

    it('ne rien émettre quand disabled est true', async () => {
      ({ component, fixture } = await createWithInputs(sampleQuiz, null, true));

      let emittedIndex: number | undefined;
      component.answerSelected.subscribe((idx: number) => {
        emittedIndex = idx;
      });

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      buttons[0].click();
      fixture.detectChanges();

      expect(emittedIndex).toBeUndefined();
    });
  });

  describe('badge du type de Quiz', () => {
    it('affiche le label "Maths" pour un Quiz de type maths', async () => {
      ({ component, fixture } = await createWithInputs());

      const badge = fixture.nativeElement.querySelector('.quiz-badge');
      expect(badge.textContent).toContain('Maths');
      expect(badge.classList.contains('badge-maths')).toBe(true);
    });

    it('affiche le label "Français" pour un Quiz de type francais', async () => {
      const quizFrancais: Quiz = {
        type: 'francais',
        question: 'Quel est le pluriel de "cheval" ?',
        answers: ['Chevals', 'Chevaux', 'Chevaus', 'Chevauxs'],
        correctIndex: 1,
      };
      ({ component, fixture } = await createWithInputs(quizFrancais));

      const badge = fixture.nativeElement.querySelector('.quiz-badge');
      expect(badge.textContent).toContain('Français');
      expect(badge.classList.contains('badge-francais')).toBe(true);
    });

    it('affiche le label "Univers Mario" pour un Quiz de type univers-mario', async () => {
      const quizMario: Quiz = {
        type: 'univers-mario',
        question: 'Comment s\'appelle le frère de Mario ?',
        answers: ['Wario', 'Luigi', 'Yoshi', 'Toad'],
        correctIndex: 1,
      };
      ({ component, fixture } = await createWithInputs(quizMario));

      const badge = fixture.nativeElement.querySelector('.quiz-badge');
      expect(badge.textContent).toContain('Univers Mario');
      expect(badge.classList.contains('badge-univers-mario')).toBe(true);
    });

    it('affiche le label "Contexte" pour un Quiz de type contexte', async () => {
      const quizContexte: Quiz = {
        type: 'contexte',
        question: 'Dans quelle Zone as-tu rencontré Luma ?',
        answers: ['Jardin', 'Couloir', 'Observatoire', 'Sous-sol'],
        correctIndex: 2,
      };
      ({ component, fixture } = await createWithInputs(quizContexte));

      const badge = fixture.nativeElement.querySelector('.quiz-badge');
      expect(badge.textContent).toContain('Contexte');
      expect(badge.classList.contains('badge-contexte')).toBe(true);
    });
  });

  describe('feedback visuel', () => {
    it('applique la classe answer-correct sur la bonne réponse quand feedback est "correct"', async () => {
      ({ component, fixture } = await createWithInputs(sampleQuiz, 'correct'));

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      expect(buttons[1].classList.contains('answer-correct')).toBe(true);
      expect(buttons[0].classList.contains('answer-correct')).toBe(false);
    });

    it('applique la classe answer-incorrect sur la réponse cliquée quand feedback est "incorrect"', async () => {
      ({ component, fixture } = await createWithInputs(sampleQuiz, 'incorrect', false, 3));

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      expect(buttons[3].classList.contains('answer-incorrect')).toBe(true);
      expect(buttons[1].classList.contains('answer-incorrect')).toBe(false);
    });

    it('affiche le message de feedback correct', async () => {
      ({ component, fixture } = await createWithInputs(sampleQuiz, 'correct'));

      const feedbackEl = fixture.nativeElement.querySelector('.feedback-correct');
      expect(feedbackEl).toBeTruthy();
      expect(feedbackEl.textContent).toContain('Bonne réponse');
    });

    it('affiche le message de feedback incorrect', async () => {
      ({ component, fixture } = await createWithInputs(sampleQuiz, 'incorrect'));

      const feedbackEl = fixture.nativeElement.querySelector('.feedback-incorrect');
      expect(feedbackEl).toBeTruthy();
      expect(feedbackEl.textContent).toContain('Mauvaise réponse');
    });

    it('n\'affiche aucun message de feedback quand feedback est null', async () => {
      ({ component, fixture } = await createWithInputs(sampleQuiz, null));

      const correctEl = fixture.nativeElement.querySelector('.feedback-correct');
      const incorrectEl = fixture.nativeElement.querySelector('.feedback-incorrect');
      expect(correctEl).toBeFalsy();
      expect(incorrectEl).toBeFalsy();
    });
  });

  describe('accessibilité', () => {
    it('le conteneur a role="region" et aria-label="Quiz"', async () => {
      ({ component, fixture } = await createWithInputs());

      const panel = fixture.nativeElement.querySelector('.quiz-panel');
      expect(panel.getAttribute('role')).toBe('region');
      expect(panel.getAttribute('aria-label')).toBe('Quiz');
    });

    it('la zone de feedback a aria-live="polite"', async () => {
      ({ component, fixture } = await createWithInputs());

      const feedbackZone = fixture.nativeElement.querySelector('.quiz-feedback');
      expect(feedbackZone.getAttribute('aria-live')).toBe('polite');
    });

    it('les boutons de réponse ont des aria-labels descriptifs', async () => {
      ({ component, fixture } = await createWithInputs());

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      expect(buttons[0].getAttribute('aria-label')).toBe('Réponse 1: 62');
      expect(buttons[3].getAttribute('aria-label')).toBe('Réponse 4: 52');
    });

    it('les boutons ont type="button"', async () => {
      ({ component, fixture } = await createWithInputs());

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      buttons.forEach((btn: Element) => {
        expect(btn.getAttribute('type')).toBe('button');
      });
    });

    it('les boutons sont désactivés quand disabled est true', async () => {
      ({ component, fixture } = await createWithInputs(sampleQuiz, null, true));

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      buttons.forEach((btn: Element) => {
        expect(btn.hasAttribute('disabled')).toBe(true);
      });
    });
  });

  describe("boutons d'Aide", () => {
    it('affiche les boutons d\'aide quand disabled est false', async () => {
      ({ component, fixture } = await createWithInputs());
      fixture.componentRef.setInput('canBuyHint', true);
      fixture.componentRef.setInput('canBuyElimination', true);
      fixture.detectChanges();

      const helpButtons = fixture.nativeElement.querySelectorAll('.help-button');
      expect(helpButtons.length).toBe(2);
    });

    it('masque les boutons d\'aide quand disabled est true', async () => {
      ({ component, fixture } = await createWithInputs(sampleQuiz, null, true));
      fixture.detectChanges();

      const helpButtons = fixture.nativeElement.querySelectorAll('.help-button');
      expect(helpButtons.length).toBe(0);
    });

    it('émet hintRequested quand on clique sur "Indice" et canBuyHint est true', async () => {
      ({ component, fixture } = await createWithInputs());
      fixture.componentRef.setInput('canBuyHint', true);
      fixture.detectChanges();

      let emitted = false;
      component.hintRequested.subscribe(() => { emitted = true; });

      const hintBtn = fixture.nativeElement.querySelector('.help-hint');
      hintBtn.click();
      fixture.detectChanges();

      expect(emitted).toBe(true);
    });

    it('ne rien émettre quand on clique sur "Indice" et canBuyHint est false', async () => {
      ({ component, fixture } = await createWithInputs());
      fixture.componentRef.setInput('canBuyHint', false);
      fixture.detectChanges();

      let emitted = false;
      component.hintRequested.subscribe(() => { emitted = true; });

      const hintBtn = fixture.nativeElement.querySelector('.help-hint');
      hintBtn.click();
      fixture.detectChanges();

      expect(emitted).toBe(false);
    });

    it('émet eliminationRequested quand on clique sur "Éliminer" et canBuyElimination est true', async () => {
      ({ component, fixture } = await createWithInputs());
      fixture.componentRef.setInput('canBuyElimination', true);
      fixture.detectChanges();

      let emitted = false;
      component.eliminationRequested.subscribe(() => { emitted = true; });

      const elimBtn = fixture.nativeElement.querySelector('.help-elimination');
      elimBtn.click();
      fixture.detectChanges();

      expect(emitted).toBe(true);
    });
  });

  describe('indice affiché', () => {
    it('affiche le texte de l\'indice quand hintText est non null', async () => {
      ({ component, fixture } = await createWithInputs());
      fixture.componentRef.setInput('hintText', 'Indice : la réponse commence par "623"...');
      fixture.detectChanges();

      const hintDisplay = fixture.nativeElement.querySelector('.hint-display');
      expect(hintDisplay).toBeTruthy();
      expect(hintDisplay.textContent).toContain('Indice : la réponse commence par "623"...');
    });

    it('ne affiche pas l\'indice quand hintText est null', async () => {
      ({ component, fixture } = await createWithInputs());
      fixture.detectChanges();

      const hintDisplay = fixture.nativeElement.querySelector('.hint-display');
      expect(hintDisplay).toBeFalsy();
    });
  });

  describe('réponses éliminées', () => {
    it('masque les réponses dont l\'index est dans eliminatedAnswers', async () => {
      ({ component, fixture } = await createWithInputs());
      fixture.componentRef.setInput('eliminatedAnswers', [0, 2]);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.answer-button');
      // Les boutons éliminés ont [hidden], donc hidden=true
      expect(buttons[0].hidden).toBe(true);
      expect(buttons[1].hidden).toBe(false);
      expect(buttons[2].hidden).toBe(true);
      expect(buttons[3].hidden).toBe(false);
    });
  });

  describe('Quiz final', () => {
    it('affiche le badge "Quiz Final" quand isFinal est true', async () => {
      const finalQuiz: Quiz = {
        type: 'maths',
        question: 'Si une Power Star vaut 125 points et que tu en collectes 8, combien de points as-tu au total ?',
        answers: ['900', '1000', '1100', '1025'],
        correctIndex: 1,
        isFinal: true,
      };
      ({ component, fixture } = await createWithInputs(finalQuiz));

      const finalBadge = fixture.nativeElement.querySelector('.quiz-final-badge');
      expect(finalBadge).toBeTruthy();
      expect(finalBadge.textContent).toContain('Quiz Final');
    });

    it('ne affiche pas le badge "Quiz Final" quand isFinal est false', async () => {
      ({ component, fixture } = await createWithInputs());

      const finalBadge = fixture.nativeElement.querySelector('.quiz-final-badge');
      expect(finalBadge).toBeFalsy();
    });

    it('ne affiche pas le badge "Quiz Final" quand isFinal est undefined', async () => {
      const quizWithoutFinal: Quiz = {
        type: 'francais',
        question: 'Quel est le pluriel de "cheval" ?',
        answers: ['chevals', 'chevaux', 'chevaus', 'chevauxs'],
        correctIndex: 1,
      };
      ({ component, fixture } = await createWithInputs(quizWithoutFinal));

      const finalBadge = fixture.nativeElement.querySelector('.quiz-final-badge');
      expect(finalBadge).toBeFalsy();
    });
  });
});
