import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { GameEngineService } from '../../../core/services/game-engine';
import { ContentLoaderService } from '../../../core/services/content-loader';
import type { RawCharacterPath } from '../../../core/types';
import { ZoneExplorer } from './zone-explorer';
import { QuizPanelComponent } from '../quiz-panel/quiz-panel';

/**
 * Chemin brut de test avec 2 Zones pour Mario (structure tree).
 * Chaque Zone contient 2 quizzes.
 */
const MOCK_RAW_MARIO_PATH: RawCharacterPath = {
  character: 'mario',
  startZoneId: 'mario-zone-1',
  zones: {
    'mario-zone-1': {
      id: 'mario-zone-1',
      narration: "⭐ Tu arrives devant le palais d'Harmony. Luma t'attend, l'air inquiet. 🌟",
      quizzes: [
        {
          type: 'maths',
          question: 'Combien font 245 + 378 ?',
          answers: ['613', '623', '618', '603'],
          correctIndex: 1,
        },
        {
          type: 'univers-mario',
          question: 'Quel est le pouvoir de Mario ?',
          answers: ['Super Saut', 'Super Saute', 'Super Bond', 'Super Vol'],
          correctIndex: 0,
        },
      ],
      choices: [
        { text: "Entrer par le grand portail 🚪", nextZoneId: 'mario-zone-2' },
        { text: "Explorer le jardin 🌺", nextZoneId: 'mario-zone-2' },
      ],
    },
    'mario-zone-2': {
      id: 'mario-zone-2',
      narration: "🌟 Tu traverses le hall principal. Des étoiles flottent dans l'air.",
      quizzes: [
        {
          type: 'univers-mario',
          question: 'Qui est le frère de Mario ?',
          answers: ['Luigi', 'Wario', 'Toad', 'Yoshi'],
          correctIndex: 0,
        },
        {
          type: 'contexte',
          question: 'Où as-tu rencontré Luma ?',
          answers: ['Devant le palais', 'Dans le hall', 'Au jardin', 'Sur le toit'],
          correctIndex: 0,
        },
      ],
      choices: [
        { text: "Attraper une étoile ⭐", nextZoneId: 'mario-zone-2' },
      ],
    },
  },
};

/**
 * Mock de HttpClient qui retourne le chemin brut de Mario synchronement.
 */
class HttpClientMock {
  get<T>(_url: string): Observable<T> {
    return of(MOCK_RAW_MARIO_PATH as unknown as T);
  }
}

/**
 * Mock de ContentLoaderService (requis par la dépendance d'injection).
 */
class ContentLoaderServiceMock {
  loadPath(_character: string) {
    return {
      signal: () => ({
        character: 'mario' as const,
        startZoneId: MOCK_RAW_MARIO_PATH.startZoneId,
        zones: MOCK_RAW_MARIO_PATH.zones,
      }),
      isLoading: () => false,
    };
  }
}

describe('ZoneExplorer', () => {
  let component: ZoneExplorer;
  let fixture: ComponentFixture<ZoneExplorer>;
  let gameEngine: GameEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneExplorer],
      providers: [
        GameEngineService,
        { provide: HttpClient, useClass: HttpClientMock },
        { provide: ContentLoaderService, useClass: ContentLoaderServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ZoneExplorer);
    gameEngine = TestBed.inject(GameEngineService);
    component = fixture.componentInstance;
  });

  describe('afficher la narration de la Zone courante', () => {
    it('affiche la narration de la première Zone après startGame', () => {
      gameEngine.startGame('mario');
      fixture.detectChanges();

      const narrationText = fixture.nativeElement.querySelector('.narration-text');
      expect(narrationText).toBeTruthy();
      expect(narrationText.textContent).toContain("Tu arrives devant le palais d'Harmony");
    });

    it('ne affiche pas de narration quand le jeu n\'est pas démarré', () => {
      fixture.detectChanges();

      const narrationBlock = fixture.nativeElement.querySelector('.narration-block');
      expect(narrationBlock).toBeFalsy();
    });
  });

  describe('afficher les Choix narratifs', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('affiche un bouton par choix narratif', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      expect(buttons.length).toBe(2);
    });

    it('le premier bouton affiche le texte du premier choix', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      expect(buttons[0].textContent).toContain('Entrer par le grand portail');
    });

    it('le deuxième bouton affiche le texte du deuxième choix', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      expect(buttons[1].textContent).toContain('Explorer le jardin');
    });

    it('chaque bouton a un aria-label descriptif', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      expect(buttons[0].getAttribute('aria-label')).toContain('Choix 1');
      expect(buttons[1].getAttribute('aria-label')).toContain('Choix 2');
    });
  });

  describe('cliquer sur un choix', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('cliquer sur le premier choix appelle selectChoice(0)', () => {
      const spy = vi.spyOn(gameEngine, 'selectChoice');
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      buttons[0].click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(0);
    });

    it('cliquer sur le deuxième choix appelle selectChoice(1)', () => {
      const spy = vi.spyOn(gameEngine, 'selectChoice');
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      buttons[1].click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(1);
    });

    it('selectChoice navigue vers la Zone cible (nextZoneId)', () => {
      gameEngine.selectChoice(0);
      expect(gameEngine.currentZoneId()).toBe('mario-zone-2');
    });
  });

  describe('navigation entre Zones', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('la narration change après avoir navigué vers une nouvelle Zone', () => {
      expect(fixture.nativeElement.querySelector('.narration-text')?.textContent).toContain("Tu arrives devant le palais d'Harmony");

      gameEngine.selectChoice(0); // navigue vers mario-zone-2
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.narration-text')?.textContent).toContain("Tu traverses le hall principal");
    });

    it('quizIndex est reset à 0 après navigation', () => {
      gameEngine.selectChoice(0);
      expect(gameEngine.currentQuizIndex()).toBe(0);
    });
  });

  describe('feedback pénalité (Quiz raté)', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('ne affiche pas de pénalité au démarrage', () => {
      const penaltyBlock = fixture.nativeElement.querySelector('.event-penalty');
      expect(penaltyBlock).toBeFalsy();
    });

    it('affiche la pénalité après une réponse incorrecte', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(0); // faux (correctIndex = 1)
      fixture.detectChanges();

      const penaltyBlock = fixture.nativeElement.querySelector('.event-penalty');
      expect(penaltyBlock).toBeTruthy();
      expect(penaltyBlock.textContent).toContain('Pénalité');
    });

    it('la pénalité contient le bouton "Réessayer"', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(0); // faux
      fixture.detectChanges();

      const restartButton = fixture.nativeElement.querySelector('.restart-button');
      expect(restartButton).toBeTruthy();
      expect(restartButton.textContent).toContain('Réessayer');
    });

    it('cliquer sur "Réessayer" appelle retryQuiz()', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(0); // faux
      fixture.detectChanges();

      const spy = vi.spyOn(gameEngine, 'retryQuiz');
      const restartButton = fixture.nativeElement.querySelector('.restart-button');
      restartButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('la pénalité a role="alert"', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(0); // faux
      fixture.detectChanges();

      const penaltyBlock = fixture.nativeElement.querySelector('.event-penalty');
      expect(penaltyBlock?.getAttribute('role')).toBe('alert');
    });
  });

  describe('QuizPanel', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('ne affiche pas le QuizPanel quand quizActive est false', () => {
      (gameEngine as any).quizActiveSignal.set(false);
      fixture.detectChanges();
      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeFalsy();
    });

    it('affiche le QuizPanel quand quizActive est true', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      fixture.detectChanges();

      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeTruthy();
    });

    it('le QuizPanel disparaît quand la Zone est terminée', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-quiz-panel')).toBeTruthy();

      // Réussir les 2 quizzes de la Zone 1
      gameEngine.submitQuizAnswer(1); // quiz 0 correct
      gameEngine.advanceQuiz(); // → quiz 1
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(0); // quiz 1 correct → isZoneCompleted = true
      fixture.detectChanges();

      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeFalsy();
    });

    it('cliquer sur une réponse appelle submitQuizAnswer avec l\'index', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      fixture.detectChanges();

      const spy = vi.spyOn(gameEngine, 'submitQuizAnswer');
      component.onSelectAnswer(2);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(2);
    });
  });

  describe('message de succès (Zone terminée)', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('ne affiche pas le message de succès avant de terminer la Zone', () => {
      const successBlock = fixture.nativeElement.querySelector('.success-block');
      expect(successBlock).toBeFalsy();
    });

    it('affiche le message de succès après avoir réussi tous les quizzes', () => {
      // Réussir quiz 0
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(1); // correct
      // Avancer au quiz 1
      gameEngine.advanceQuiz();
      (gameEngine as any).quizActiveSignal.set(true);
      // Réussir quiz 1 (dernier) → isZoneCompleted = true
      gameEngine.submitQuizAnswer(0); // correct
      fixture.detectChanges();

      const successBlock = fixture.nativeElement.querySelector('.success-block');
      expect(successBlock).toBeTruthy();
      expect(successBlock.textContent).toContain('Bravo');
      expect(successBlock.textContent).toContain('+2 Pièces');
    });

    it('le message de succès contient le bouton "Quiz suivant" (pas final)', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(1);
      gameEngine.advanceQuiz();
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(0);
      fixture.detectChanges();

      const advanceButton = fixture.nativeElement.querySelector('.advance-button');
      expect(advanceButton).toBeTruthy();
      expect(advanceButton.textContent).toContain('Quiz suivant');
    });

    it('cliquer sur "Quiz suivant" appelle advanceQuiz()', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(1);
      gameEngine.advanceQuiz();
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(0);
      fixture.detectChanges();

      const spy = vi.spyOn(gameEngine, 'advanceQuiz');
      const advanceButton = fixture.nativeElement.querySelector('.advance-button');
      advanceButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('le message de succès a role="alert" et aria-live="polite"', () => {
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(1);
      gameEngine.advanceQuiz();
      (gameEngine as any).quizActiveSignal.set(true);
      gameEngine.submitQuizAnswer(0);
      fixture.detectChanges();

      const successBlock = fixture.nativeElement.querySelector('.success-block');
      expect(successBlock?.getAttribute('role')).toBe('alert');
      expect(successBlock?.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('quizzesRemaining affiché dans le composant', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('quizzesRemaining = 2 au début de la Zone 1', () => {
      expect(gameEngine.quizzesRemaining()).toBe(2);
    });

    it('quizzesRemaining = 1 après advanceQuiz', () => {
      gameEngine.advanceQuiz();
      expect(gameEngine.quizzesRemaining()).toBe(1);
    });
  });
});
