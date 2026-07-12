import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameEngineService } from '../../../core/services/game-engine';
import { ContentLoaderService } from '../../../core/services/content-loader';
import type { CharacterPath, Zone } from '../../../core/types';
import { ZoneExplorer } from './zone-explorer';
import { QuizPanelComponent } from '../quiz-panel/quiz-panel';

/**
 * Chemin de test avec 2 Zones pour Mario.
 */
const MOCK_MARIO_PATH: CharacterPath = {
  character: 'mario',
  zones: [
    {
      id: 'mario_zone_1',
      narration: "⭐ Tu arrives devant le palais d'Harmony. Luma t'attend, l'air inquiet. 🌟",
      choices: [
        {
          text: "Entrer par le grand portail 🚪",
          nextNarrationId: 'mario_n1_portal',
          blocking: false,
        },
        {
          text: "Essayer de grimper au mur 🧗",
          nextNarrationId: 'mario_n1_wall',
          blocking: true,
          penalty: 'Le mur est trop glissant ! Tu tombes à l\'eau. 💦',
        },
      ],
      quiz: {
        type: 'maths',
        question: 'Combien font 245 + 378 ?',
        answers: ['613', '623', '618', '603'],
        correctIndex: 1,
      },
    },
    {
      id: 'mario_zone_2',
      narration: "🌟 Tu traverses le hall principal. Des étoiles flottent dans l'air.",
      choices: [
        {
          text: "Attraper une étoile ⭐",
          nextNarrationId: 'mario_n2_star',
          blocking: false,
        },
      ],
      quiz: {
        type: 'univers-mario',
        question: 'Qui est le frère de Mario ?',
        answers: ['Luigi', 'Wario', 'Toad', 'Yoshi'],
        correctIndex: 0,
      },
    },
  ] as Zone[],
};

/**
 * Mock de ContentLoaderService qui retourne un chemin déterministe.
 */
class ContentLoaderServiceMock {
  loadPath(_character: string) {
    return () => MOCK_MARIO_PATH;
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
      expect(buttons[1].textContent).toContain('Essayer de grimper au mur');
    });

    it('le choix bloquant a la classe choice-blocking', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      expect(buttons[1].classList.contains('choice-blocking')).toBe(true);
    });

    it('le choix non bloquant n\'a pas la classe choice-blocking', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      expect(buttons[0].classList.contains('choice-blocking')).toBe(false);
    });

    it('chaque bouton a un aria-label descriptif', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.choice-button');
      expect(buttons[0].getAttribute('aria-label')).toContain('Choix 1');
      expect(buttons[1].getAttribute('aria-label')).toContain('Choix 2');
      expect(buttons[1].getAttribute('aria-label')).toContain('chemin risqué');
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
  });

  describe('événement narratif', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('ne affiche pas d\'événement au démarrage', () => {
      const eventBlock = fixture.nativeElement.querySelector('.event-block');
      expect(eventBlock).toBeFalsy();
    });

    it('affiche l\'événement narratif après un choix non bloquant', () => {
      gameEngine.selectChoice(0);
      fixture.detectChanges();

      const eventBlock = fixture.nativeElement.querySelector('.event-block');
      expect(eventBlock).toBeTruthy();
      expect(eventBlock.textContent).toContain('mario_n1_portal');
    });

    it('affiche la pénalité après un choix bloquant', () => {
      gameEngine.selectChoice(1);
      fixture.detectChanges();

      const eventBlock = fixture.nativeElement.querySelector('.event-block');
      expect(eventBlock).toBeTruthy();
      expect(eventBlock.textContent).toContain('Le mur est trop glissant');
    });

    it('l\'événement a role="alert" et aria-live="polite"', () => {
      gameEngine.selectChoice(0);
      fixture.detectChanges();

      const eventBlock = fixture.nativeElement.querySelector('.event-block');
      expect(eventBlock.getAttribute('role')).toBe('alert');
      expect(eventBlock.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('événement de pénalité (choix bloquant)', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('affiche le bouton "Recommencer la Zone" après un choix bloquant', () => {
      gameEngine.selectChoice(1);
      fixture.detectChanges();

      const restartButton = fixture.nativeElement.querySelector('.restart-button');
      expect(restartButton).toBeTruthy();
      expect(restartButton.textContent).toContain('Recommencer la Zone');
    });

    it('ne affiche pas le bouton "Recommencer la Zone" après un choix non bloquant', () => {
      gameEngine.selectChoice(0);
      fixture.detectChanges();

      const restartButton = fixture.nativeElement.querySelector('.restart-button');
      expect(restartButton).toBeFalsy();
    });

    it('cliquer sur le bouton appelle restartZone() du service', () => {
      gameEngine.selectChoice(1);
      fixture.detectChanges();

      const spy = vi.spyOn(gameEngine, 'restartZone');
      const restartButton = fixture.nativeElement.querySelector('.restart-button');
      restartButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('l\'événement de pénalité a role="alert"', () => {
      gameEngine.selectChoice(1);
      fixture.detectChanges();

      const eventBlock = fixture.nativeElement.querySelector('.event-block');
      expect(eventBlock.getAttribute('role')).toBe('alert');
    });

    it('l\'événement de pénalité a la classe event-penalty', () => {
      gameEngine.selectChoice(1);
      fixture.detectChanges();

      const eventBlock = fixture.nativeElement.querySelector('.event-block');
      expect(eventBlock.classList.contains('event-penalty')).toBe(true);
    });

    it('le bouton a un aria-label descriptif', () => {
      gameEngine.selectChoice(1);
      fixture.detectChanges();

      const restartButton = fixture.nativeElement.querySelector('.restart-button');
      expect(restartButton.getAttribute('aria-label')).toContain('Recommencer la Zone');
    });

    it('l\'événement de pénalité contient l\'icône d\'avertissement', () => {
      gameEngine.selectChoice(1);
      fixture.detectChanges();

      const eventIcon = fixture.nativeElement.querySelector('.event-icon');
      expect(eventIcon).toBeTruthy();
      expect(eventIcon.textContent).toContain('⚠️');
    });
  });

  describe('QuizPanel', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('ne affiche pas le QuizPanel avant qu\'un choix valide ne soit fait', () => {
      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeFalsy();
    });

    it('affiche le QuizPanel après un choix narratif non bloquant', () => {
      gameEngine.selectChoice(0);
      fixture.detectChanges();

      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeTruthy();
    });

    it('ne affiche pas le QuizPanel après un choix bloquant', () => {
      gameEngine.selectChoice(1);
      fixture.detectChanges();

      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeFalsy();
    });

    it('le QuizPanel disparaît quand la Zone est terminée', () => {
      gameEngine.selectChoice(0);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-quiz-panel')).toBeTruthy();

      gameEngine.submitQuizAnswer(1);
      fixture.detectChanges();

      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeFalsy();
    });

    it('le QuizPanel disparaît quand on recommence la Zone', () => {
      gameEngine.selectChoice(0);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-quiz-panel')).toBeTruthy();

      gameEngine.restartZone();
      fixture.detectChanges();

      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeFalsy();
    });

    it('cliquer sur une réponse appelle submitQuizAnswer avec l\'index', () => {
      gameEngine.selectChoice(0);
      fixture.detectChanges();

      const spy = vi.spyOn(gameEngine, 'submitQuizAnswer');
      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeTruthy();

      component.onSelectAnswer(2);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(2);
    });

    it('le QuizPanel est disabled quand il y a un feedback', () => {
      gameEngine.selectChoice(0);
      fixture.detectChanges();

      const quizPanel = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanel).toBeTruthy();

      gameEngine.submitQuizAnswer(3);
      fixture.detectChanges();

      // Après 1ère erreur, quizActive reste true mais feedback est 'incorrect'
      // → le QuizPanel reste visible mais les boutons sont disabled
      const quizPanelAfter = fixture.nativeElement.querySelector('app-quiz-panel');
      expect(quizPanelAfter).toBeTruthy();
      const buttons = quizPanelAfter.querySelectorAll('.answer-button');
      expect(buttons[0].disabled).toBe(true);
    });
  });
});
