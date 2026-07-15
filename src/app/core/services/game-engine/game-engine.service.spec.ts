import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import type { CharacterPath, GameSave, RawCharacterPath, Zone } from '../../types';
import { CompletedPathsService } from '../completed-paths/completed-paths.service';
import { ContentLoaderService } from '../content-loader';
import { PersistenceService } from '../persistence';
import { GameEngineService } from './game-engine.service';

/**
 * Chemin brut de test avec 3 Zones pour Mario dans la structure tree.
 * Chaque Zone contient 2 Quiz (sauf la dernière avec 1 Quiz final).
 * Les Choix naviguent via nextZoneId vers la Zone suivante.
 */
const MOCK_RAW_MARIO_PATH: RawCharacterPath = {
  character: 'mario',
  startZoneId: 'mario-zone-1',
  zones: {
    'mario-zone-1': {
      id: 'mario-zone-1',
      narration: "Tu arrives devant le palais d'Harmony. Luma t'attend, l'air inquiet.",
      quizzes: [
        {
          type: 'maths',
          question: 'Combien font 245 + 378 ?',
          answers: ['613', '623', '618', '603'],
          correctIndex: 1,
        },
        {
          type: 'univers-mario',
          question: 'Quel est le pouvoir spécial de Mario ?',
          answers: ['Super Saute', 'Super Saut', 'Super Bond', 'Super Vol'],
          correctIndex: 1,
        },
      ],
      choices: [
        { text: "Entrer par le grand portail", nextZoneId: 'mario-zone-2' },
      ],
    } as Zone,
    'mario-zone-2': {
      id: 'mario-zone-2',
      narration: "Tu traverses le hall principal. Des étoiles flottent dans l'air.",
      quizzes: [
        {
          type: 'francais',
          question: 'Quel est le synonyme de "rapide" ?',
          answers: ['Vite', 'Lent', 'Gros', 'Petit'],
          correctIndex: 0,
        },
        {
          type: 'contexte',
          question: 'Qui t\'a attendu à l\'entrée du palais ?',
          answers: ['Luma', 'Toad', 'Yoshi', 'Peach'],
          correctIndex: 0,
        },
      ],
      choices: [
        { text: "Attraper une étoile", nextZoneId: 'mario-zone-3' },
      ],
    } as Zone,
    'mario-zone-3': {
      id: 'mario-zone-3',
      narration: "Tu arrives dans la chambre d'Harmony. Bowser Junior est là !",
      quizzes: [
        {
          type: 'contexte',
          question: 'Qui a capturé Harmony ?',
          answers: ['Bowser Junior', 'Bowser', 'Wario', 'Kamek'],
          correctIndex: 0,
          isFinal: true,
        },
      ],
      choices: [
        { text: "Confronter Bowser Junior", nextZoneId: 'mario-zone-3' },
      ],
    } as Zone,
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

/**
 * Mock de PersistenceService qui capture les appels à saveGame.
 */
class PersistenceServiceMock {
  savedStates: unknown[] = [];

  saveGame(state: unknown): void {
    this.savedStates.push(state);
  }

  getGameSave() {
    return null;
  }

  isGameInProgress() {
    return false;
  }

  saveCharacter(_characterId: string) {}

  getSavedCharacter() {
    return null;
  }

  clearSave() {}
}

/**
 * Mock de CompletedPathsService qui capture les appels.
 */
class CompletedPathsServiceMock {
  completedPaths: string[] = [];

  addCompletedPath(characterId: string): void {
    if (!this.completedPaths.includes(characterId)) {
      this.completedPaths.push(characterId);
    }
  }

  getCompletedPaths(): string[] {
    return [...this.completedPaths];
  }

  isPathCompleted(characterId: string): boolean {
    return this.completedPaths.includes(characterId);
  }

  getAllCompleted(): boolean {
    const validIds = ['mario', 'luigi', 'peach', 'daisy'];
    return validIds.every(id => this.completedPaths.includes(id));
  }

  clearCompletedPaths(): void {
    this.completedPaths = [];
  }
}

describe('GameEngineService', () => {
  let service: GameEngineService;
  let persistenceMock: PersistenceServiceMock;
  let completedPathsMock: CompletedPathsServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        GameEngineService,
        { provide: HttpClient, useClass: HttpClientMock },
        { provide: ContentLoaderService, useClass: ContentLoaderServiceMock },
        { provide: PersistenceService, useClass: PersistenceServiceMock },
        { provide: CompletedPathsService, useClass: CompletedPathsServiceMock },
      ],
    });
    service = TestBed.inject(GameEngineService);
    persistenceMock = TestBed.inject(PersistenceService) as unknown as PersistenceServiceMock;
    completedPathsMock = TestBed.inject(CompletedPathsService) as unknown as CompletedPathsServiceMock;
  });

  // ──────────────────────────────────────────────────────────────
  // startGame
  // ──────────────────────────────────────────────────────────────

  describe('startGame', () => {
    it('gameStarted = false avant d\'appeler startGame', () => {
      expect(service.gameStarted()).toBe(false);
    });

    it('gameStarted = true après avoir appelé startGame', () => {
      service.startGame('mario');
      expect(service.gameStarted()).toBe(true);
    });

    it('currentZoneId est l\'ID de départ après startGame', () => {
      service.startGame('mario');
      expect(service.currentZoneId()).toBe('mario-zone-1');
    });

    it('currentQuizIndex est 0 après startGame', () => {
      service.startGame('mario');
      expect(service.currentQuizIndex()).toBe(0);
    });

    it('les Pièces sont à 0 après startGame', () => {
      service.startGame('mario');
      expect(service.coins()).toBe(0);
    });

    it('la Zone courante est la Zone de départ du Chemin', () => {
      service.startGame('mario');
      expect(service.currentZone()?.id).toBe('mario-zone-1');
    });

    it('la Zone n\'est pas marquée comme terminée après startGame', () => {
      service.startGame('mario');
      expect(service.isZoneCompleted()).toBe(false);
    });

    it('quizActive est false après startGame (quiz affiché après un choix)', () => {
      service.startGame('mario');
      expect(service.quizActive()).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Navigation arbre — selectChoice / navigateToZone
  // ──────────────────────────────────────────────────────────────

  describe('selectChoice — navigation arbre via nextZoneId', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('navigate vers la Zone cible indiquée par nextZoneId', () => {
      service.selectChoice(0); // nextZoneId = 'mario-zone-2'
      expect(service.currentZoneId()).toBe('mario-zone-2');
    });

    it('reset quizIndex à 0 dans la nouvelle Zone', () => {
      // On avance d'abord quizIndex
      service.currentQuizIndex; // warm up computed
      service.selectChoice(0);
      expect(service.currentQuizIndex()).toBe(0);
    });

    it('reset isZoneCompleted à false dans la nouvelle Zone', () => {
      service.selectChoice(0);
      expect(service.isZoneCompleted()).toBe(false);
    });

    it('active quizActive après selectChoice (quiz affiché après un choix)', () => {
      service.selectChoice(0);
      expect(service.quizActive()).toBe(true);
    });

    it('ne fait rien si l\'index est hors limites', () => {
      service.selectChoice(99);
      expect(service.currentZoneId()).toBe('mario-zone-1');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // restartZone
  // ──────────────────────────────────────────────────────────────

  describe('restartZone', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('réactive quizActive pour rejouer le Quiz', () => {
      service.restartZone();
      expect(service.quizActive()).toBe(true);
    });

    it('reset quizFeedback à null', () => {
      service.restartZone();
      expect(service.quizFeedback()).toBe(null);
    });

    it('reset hintText à null', () => {
      service.restartZone();
      expect(service.hintText()).toBe(null);
    });

    it('reset eliminatedAnswers à []', () => {
      service.restartZone();
      expect(service.eliminatedAnswers()).toEqual([]);
    });

    it('reset quizIndex à 0', () => {
      service.restartZone();
      expect(service.currentQuizIndex()).toBe(0);
    });

    it('démarque la Zone comme non terminée', () => {
      service.completeQuiz();
      service.restartZone();
      expect(service.isZoneCompleted()).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // addCoins
  // ──────────────────────────────────────────────────────────────

  describe('addCoins', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('ajoute des Pièces au total', () => {
      service.addCoins(5);
      expect(service.coins()).toBe(5);
    });

    it('accumule les Pièces à chaque appel', () => {
      service.addCoins(3);
      service.addCoins(2);
      expect(service.coins()).toBe(5);
    });

    it('clamp à 0 quand le solde deviendrait négatif', () => {
      service.addCoins(1);
      service.addCoins(-5);
      expect(service.coins()).toBe(0);
    });

    it('reste à 0 quand on soustrait plus que le solde', () => {
      service.addCoins(-10);
      expect(service.coins()).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // currentZone — avant startGame
  // ──────────────────────────────────────────────────────────────

  describe('currentZone — avant startGame', () => {
    it('retourne null quand le jeu n\'est pas démarré', () => {
      expect(service.currentZone()).toBe(null);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Quiz — état initial
  // ──────────────────────────────────────────────────────────────

  describe('Quiz — état initial', () => {
    it('quizActive() est false après startGame (quiz affiché après un choix)', () => {
      service.startGame('mario');
      expect(service.quizActive()).toBe(false);
    });

    it('quizFeedback() est null après startGame', () => {
      service.startGame('mario');
      expect(service.quizFeedback()).toBe(null);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Quiz — réponse correcte
  // ──────────────────────────────────────────────────────────────

  describe('Quiz — réponse correcte du 1er coup', () => {
    beforeEach(() => {
      service.startGame('mario');
      // Activer le quiz manuellement pour les tests
      (service as any).quizActiveSignal.set(true);
    });

    it('quizActive() devient false après réponse correcte', () => {
      service.submitQuizAnswer(1); // correctIndex de quiz 0 de mario-zone-1
      expect(service.quizActive()).toBe(false);
    });

    it('coins() augmente de 2', () => {
      service.submitQuizAnswer(1);
      expect(service.coins()).toBe(2);
    });

    it('isZoneCompleted() reste false car ce n\'est pas le dernier quiz de la Zone', () => {
      // Zone 1 a 2 quizzes, on est au quiz 0 → pas terminé
      service.submitQuizAnswer(1);
      expect(service.isZoneCompleted()).toBe(false);
    });

    it('quizFeedback() est "correct"', () => {
      service.submitQuizAnswer(1);
      expect(service.quizFeedback()).toBe('correct');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Quiz — réponse incorrecte (pas de free retry)
  // ──────────────────────────────────────────────────────────────

  describe('Quiz — réponse incorrecte (pas de free retry)', () => {
    beforeEach(() => {
      service.startGame('mario');
      (service as any).quizActiveSignal.set(true);
    });

    it('1ère tentative fausse : -1 Pièce, quizActive devient false, feedback = "incorrect"', () => {
      service.submitQuizAnswer(0); // faux
      expect(service.quizActive()).toBe(false);
      expect(service.coins()).toBe(0); // clampé à 0 (on avait 0, -1 → 0)
      expect(service.quizFeedback()).toBe('incorrect');
    });

    it('avec des pièces : 1ère tentative fausse coûte -1 Pièce', () => {
      service.addCoins(5);
      service.submitQuizAnswer(0); // faux
      expect(service.coins()).toBe(4); // 5 - 1 = 4
      expect(service.quizFeedback()).toBe('incorrect');
    });

    it('submitQuizAnswer sans quiz actif ne fait rien', () => {
      service.startGame('mario');
      (service as any).quizActiveSignal.set(false);
      service.submitQuizAnswer(0);
      expect(service.quizActive()).toBe(false);
      expect(service.quizFeedback()).toBe(null);
      expect(service.coins()).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Quiz — multiples Quiz par Zone
  // ──────────────────────────────────────────────────────────────

  describe('Quiz — multiples Quiz par Zone', () => {
    beforeEach(() => {
      service.startGame('mario');
      (service as any).quizActiveSignal.set(true);
    });

    it('quizIndex = 0 au début de la Zone', () => {
      expect(service.currentQuizIndex()).toBe(0);
    });

    it('quizzesRemaining = 2 pour la Zone 1 (qui a 2 quizzes)', () => {
      expect(service.quizzesRemaining()).toBe(2);
    });

    it('réussir le quiz 0 ne termine pas la Zone (il reste des quizzes)', () => {
      service.submitQuizAnswer(1); // correct quiz 0
      expect(service.isZoneCompleted()).toBe(false);
    });

    it('le dernier quiz réussi de la Zone marque isZoneCompleted = true', () => {
      // Quiz 0 réussi
      service.submitQuizAnswer(1); // correct
      service.advanceQuiz(); // → quiz 1
      (service as any).quizActiveSignal.set(true);
      // Quiz 1 réussi (dernier)
      service.submitQuizAnswer(1); // correct
      expect(service.isZoneCompleted()).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // quizIndex progression
  // ──────────────────────────────────────────────────────────────

  describe('quizIndex progression', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('quizIndex s\'incrémente avec advanceQuiz()', () => {
      expect(service.currentQuizIndex()).toBe(0);
      service.advanceQuiz();
      expect(service.currentQuizIndex()).toBe(1);
    });

    it('advanceQuiz() ne dépasse pas le dernier quiz de la Zone', () => {
      // Zone 1 a 2 quizzes (index 0 et 1)
      service.advanceQuiz(); // → 1
      service.advanceQuiz(); // devrait rester à 1 (dernier)
      expect(service.currentQuizIndex()).toBe(1);
    });

    it('navigateToZone() reset quizIndex à 0', () => {
      service.advanceQuiz();
      expect(service.currentQuizIndex()).toBe(1);
      service.navigateToZone('mario-zone-2');
      expect(service.currentQuizIndex()).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // quizzesRemaining computed signal
  // ──────────────────────────────────────────────────────────────

  describe('quizzesRemaining computed signal', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('retourne 2 pour la Zone 1 (2 quizzes, index 0)', () => {
      expect(service.quizzesRemaining()).toBe(2);
    });

    it('retourne 1 après avoir avancé au quiz 1', () => {
      service.advanceQuiz();
      expect(service.quizzesRemaining()).toBe(1);
    });

    it('retourne 1 pour la Zone 3 (1 quiz final)', () => {
      service.navigateToZone('mario-zone-3');
      expect(service.quizzesRemaining()).toBe(1);
    });
  });

  describe('quizzesRemaining — avant startGame', () => {
    it('retourne 0 quand le jeu n\'est pas démarré', () => {
      expect(service.quizzesRemaining()).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // currentQuiz computed signal
  // ──────────────────────────────────────────────────────────────

  describe('currentQuiz computed signal', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('retourne le quiz 0 au démarrage', () => {
      const quiz = service.currentQuiz();
      expect(quiz).not.toBeNull();
      expect(quiz?.question).toBe('Combien font 245 + 378 ?');
    });

    it('retourne le quiz 1 après advanceQuiz()', () => {
      service.advanceQuiz();
      const quiz = service.currentQuiz();
      expect(quiz).not.toBeNull();
      expect(quiz?.question).toBe('Quel est le pouvoir spécial de Mario ?');
    });
  });

  describe('currentQuiz — avant startGame', () => {
    it('retourne null quand le jeu n\'est pas démarré', () => {
      expect(service.currentQuiz()).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Aides — buyHint
  // ──────────────────────────────────────────────────────────────

  describe('buyHint', () => {
    beforeEach(() => {
      service.startGame('mario');
      (service as any).quizActiveSignal.set(true);
    });

    it('buyHint avec quiz non actif : retourne false', () => {
      (service as any).quizActiveSignal.set(false);
      const result = service.buyHint();
      expect(result).toBe(false);
      expect(service.hintText()).toBe(null);
      expect(service.coins()).toBe(0);
    });

    it('buyHint avec solde insuffisant : retourne false', () => {
      // Coût = 1 Pièce
      const result = service.buyHint();
      expect(result).toBe(false);
      expect(service.hintText()).toBe(null);
    });

    it('buyHint avec solde suffisant : coûte 1 Pièce, hintText non null', () => {
      service.addCoins(3);
      const result = service.buyHint();
      expect(result).toBe(true);
      expect(service.coins()).toBe(2); // 3 - 1 = 2
      expect(service.hintText()).not.toBe(null);
    });

    it('buyHint affiche un indice basé sur la bonne réponse', () => {
      service.addCoins(1);
      service.buyHint();
      // La bonne réponse est '623', donc l\'indice contient '623'
      expect(service.hintText()).toContain('623');
    });

    it("buyHint ne peut être acheté qu'une seule fois par quiz", () => {
      service.addCoins(10);
      service.buyHint();
      const result2 = service.buyHint();
      expect(result2).toBe(false);
      expect(service.coins()).toBe(9); // Seul le premier achat a coûté 1
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Aides — buyElimination
  // ──────────────────────────────────────────────────────────────

  describe('buyElimination', () => {
    beforeEach(() => {
      service.startGame('mario');
      (service as any).quizActiveSignal.set(true);
    });

    it('buyElimination avec quiz non actif : retourne false', () => {
      (service as any).quizActiveSignal.set(false);
      const result = service.buyElimination();
      expect(result).toBe(false);
      expect(service.eliminatedAnswers()).toEqual([]);
    });

    it('buyElimination avec solde insuffisant : retourne false', () => {
      // Coût = 2 Pièces
      service.addCoins(1);
      const result = service.buyElimination();
      expect(result).toBe(false);
      expect(service.eliminatedAnswers()).toEqual([]);
    });

    it('buyElimination avec solde suffisant : coûte 2 Pièces, 2 indices éliminés', () => {
      service.addCoins(5);
      const result = service.buyElimination();
      expect(result).toBe(true);
      expect(service.coins()).toBe(3); // 5 - 2 = 3
      expect(service.eliminatedAnswers()).toHaveLength(2);
    });

    it('buyElimination ne contient jamais le correctIndex', () => {
      service.addCoins(2);
      service.buyElimination();
      const eliminated = service.eliminatedAnswers();
      expect(eliminated).not.toContain(1); // correctIndex de quiz 0 de mario-zone-1
    });

    it("buyElimination ne peut être acheté qu'une seule fois par quiz", () => {
      service.addCoins(10);
      service.buyElimination();
      const result2 = service.buyElimination();
      expect(result2).toBe(false);
      expect(service.coins()).toBe(8); // Seul le premier achat a coûté 2
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Réinitialisation des aides
  // ──────────────────────────────────────────────────────────────

  describe('Réinitialisation des aides', () => {
    beforeEach(() => {
      service.startGame('mario');
      (service as any).quizActiveSignal.set(true);
    });

    it('restartZone réinitialise hintText et eliminatedAnswers', () => {
      service.addCoins(10);
      service.buyHint();
      service.buyElimination();
      expect(service.hintText()).not.toBe(null);
      expect(service.eliminatedAnswers()).toHaveLength(2);

      service.restartZone();
      expect(service.hintText()).toBe(null);
      expect(service.eliminatedAnswers()).toEqual([]);
    });

    it('navigateToZone réinitialise hintText et eliminatedAnswers', () => {
      service.addCoins(10);
      service.buyHint();
      service.buyElimination();

      service.navigateToZone('mario-zone-2');
      expect(service.hintText()).toBe(null);
      expect(service.eliminatedAnswers()).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // restoreGame
  // ──────────────────────────────────────────────────────────────

  describe('restoreGame', () => {
    const mockGameSave: GameSave = {
      selectedCharacterId: 'mario',
      currentZoneId: 'mario-zone-3',
      quizIndex: 1,
      coins: 7,
      completedPaths: [],
    };

    it('charge le Chemin du personnage sauvegardé', () => {
      service.restoreGame(mockGameSave);
      expect(service.path().character).toBe('mario');
    });

    it('restaure l\'ID de Zone courante', () => {
      service.restoreGame(mockGameSave);
      expect(service.currentZoneId()).toBe('mario-zone-3');
    });

    it('restaure l\'index du Quiz', () => {
      service.restoreGame(mockGameSave);
      expect(service.currentQuizIndex()).toBe(1);
    });

    it('restaure les Pièces accumulées', () => {
      service.restoreGame(mockGameSave);
      expect(service.coins()).toBe(7);
    });

    it('démarre le jeu (gameStarted = true)', () => {
      service.restoreGame(mockGameSave);
      expect(service.gameStarted()).toBe(true);
    });

    it('réinitialise isZoneCompleted à false', () => {
      service.restoreGame(mockGameSave);
      expect(service.isZoneCompleted()).toBe(false);
    });

    it('réinitialise les signaux de session (quiz, aides)', () => {
      service.restoreGame(mockGameSave);
      expect(service.quizActive()).toBe(false);
      expect(service.quizFeedback()).toBe(null);
      expect(service.hintText()).toBe(null);
      expect(service.eliminatedAnswers()).toEqual([]);
    });

    it('ne fait rien si selectedCharacterId est null', () => {
      const invalidSave: GameSave = {
        selectedCharacterId: null,
        currentZoneId: '',
        quizIndex: 0,
        coins: 0,
        completedPaths: [],
      };
      service.restoreGame(invalidSave);
      expect(service.gameStarted()).toBe(false);
    });

    it('fonctionne après un startGame précédent (restaure par-dessus)', () => {
      service.startGame('mario');
      expect(service.currentZoneId()).toBe('mario-zone-1');
      expect(service.coins()).toBe(0);

      service.restoreGame(mockGameSave);
      expect(service.currentZoneId()).toBe('mario-zone-3');
      expect(service.coins()).toBe(7);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Auto-save via PersistenceService
  // ──────────────────────────────────────────────────────────────

  describe('Auto-save via PersistenceService', () => {
    beforeEach(() => {
      persistenceMock.savedStates = [];
    });

    describe('startGame', () => {
      it('appelle saveGame avec l\'état initial après startGame', () => {
        service.startGame('mario');
        expect(persistenceMock.savedStates).toHaveLength(1);
        expect(persistenceMock.savedStates[0]).toEqual({
          currentZoneId: 'mario-zone-1',
          quizIndex: 0,
          coins: 0,
        });
      });
    });

    describe('navigateToZone', () => {
      beforeEach(() => {
        service.startGame('mario');
        persistenceMock.savedStates = []; // reset après startGame
      });

      it('appelle saveGame avec le nouvel ID de Zone', () => {
        service.navigateToZone('mario-zone-2');
        expect(persistenceMock.savedStates).toHaveLength(1);
        expect(persistenceMock.savedStates[0]).toMatchObject({
          currentZoneId: 'mario-zone-2',
        });
      });
    });

    describe('submitQuizAnswer (réponse correcte)', () => {
      beforeEach(() => {
        service.startGame('mario');
        (service as any).quizActiveSignal.set(true);
        persistenceMock.savedStates = []; // reset après startGame
      });

      it('déclenche saveGame via completeQuiz quand la réponse est correcte', () => {
        service.submitQuizAnswer(1); // correctIndex de quiz 0 de mario-zone-1
        expect(persistenceMock.savedStates).toHaveLength(1);
        expect(persistenceMock.savedStates[0]).toMatchObject({
          currentZoneId: 'mario-zone-1',
          coins: 2,
        });
      });
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Fin de partie — Quiz final
  // ──────────────────────────────────────────────────────────────

  describe('Fin de partie — Quiz final', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('gameWon() est false au démarrage', () => {
      expect(service.gameWon()).toBe(false);
    });

    it('gameWon() reste false après un Quiz non-final réussi', () => {
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(1); // Zone 1 quiz 0 réussi (non-final)
      expect(service.gameWon()).toBe(false);
    });

    it('gameWon() devient true après le Quiz final réussi', () => {
      // Naviguer vers la Zone 3 (Quiz final)
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      // Zone 3 = Quiz final (isFinal: true), correctIndex = 0
      service.submitQuizAnswer(0);
      expect(service.gameWon()).toBe(true);
    });

    it('gameWon() ne devient pas true si le Quiz final échoue', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(1); // faux
      expect(service.gameWon()).toBe(false);
    });

    it('characterId() retourne l\'identifiant du personnage', () => {
      expect(service.characterId()).toBe('mario');
    });

    it('le Quiz final réussi donne +2 Pièces', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0); // correctIndex de mario-zone-3
      expect(service.coins()).toBe(2);
    });

    it('le Quiz final réussi marque la Zone comme terminée (isZoneCompleted = true)', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0);
      expect(service.isZoneCompleted()).toBe(true);
    });

    it('le Quiz final réussi désactive le Quiz (quizActive = false)', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0);
      expect(service.quizActive()).toBe(false);
    });

    it('l\'échec du Quiz final coûte -1 Pièce', () => {
      service.addCoins(5);
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(1); // faux
      expect(service.coins()).toBe(4); // 5 - 1 = 4
    });

    it('startGame() réinitialise gameWon à false après une victoire', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0); // Quiz final réussi
      expect(service.gameWon()).toBe(true);

      service.startGame('mario');
      expect(service.gameWon()).toBe(false);
    });

    it('le Quiz final est bien identifié par isFinal: true', () => {
      service.navigateToZone('mario-zone-3');
      const quiz = service.currentQuiz();
      expect(quiz?.isFinal).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // returnToMenu
  // ──────────────────────────────────────────────────────────────

  describe('returnToMenu', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('réinitialise gameStarted à false', () => {
      service.returnToMenu();
      expect(service.gameStarted()).toBe(false);
    });

    it('réinitialise gameWon à false', () => {
      expect(service.gameWon()).toBe(false);
      service.returnToMenu();
      expect(service.gameWon()).toBe(false);
    });

    it('réinitialise les Pièces à 0', () => {
      service.addCoins(10);
      service.returnToMenu();
      expect(service.coins()).toBe(0);
    });

    it('réinitialise currentZoneId à ""', () => {
      service.navigateToZone('mario-zone-2');
      service.returnToMenu();
      expect(service.currentZoneId()).toBe('');
    });

    it('appelle clearSave() sur le PersistenceService', () => {
      const clearSpy = vi.spyOn(persistenceMock, 'clearSave');
      service.returnToMenu();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('réinitialise quizActive à false', () => {
      (service as any).quizActiveSignal.set(true);
      service.returnToMenu();
      expect(service.quizActive()).toBe(false);
    });

    it('la Zone courante est null après returnToMenu', () => {
      service.returnToMenu();
      expect(service.currentZone()).toBe(null);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // returnToCharacterSelect
  // ──────────────────────────────────────────────────────────────

  describe('returnToCharacterSelect', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('réinitialise gameStarted à false', () => {
      service.returnToCharacterSelect();
      expect(service.gameStarted()).toBe(false);
    });

    it('réinitialise gameWon à false', () => {
      service.returnToCharacterSelect();
      expect(service.gameWon()).toBe(false);
    });

    it('réinitialise les Pièces à 0', () => {
      service.addCoins(10);
      service.returnToCharacterSelect();
      expect(service.coins()).toBe(0);
    });

    it('réinitialise currentZoneId à ""', () => {
      service.navigateToZone('mario-zone-2');
      service.returnToCharacterSelect();
      expect(service.currentZoneId()).toBe('');
    });

    it('appelle clearSave() sur le PersistenceService', () => {
      const clearSpy = vi.spyOn(persistenceMock, 'clearSave');
      service.returnToCharacterSelect();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('ne PAS effacer les Chemins complétés', () => {
      completedPathsMock.addCompletedPath('mario');
      expect(completedPathsMock.getCompletedPaths()).toContain('mario');

      service.returnToCharacterSelect();

      expect(completedPathsMock.getCompletedPaths()).toContain('mario');
    });

    it('réinitialise quizActive à false', () => {
      (service as any).quizActiveSignal.set(true);
      service.returnToCharacterSelect();
      expect(service.quizActive()).toBe(false);
    });

    it('la Zone courante est null après returnToCharacterSelect', () => {
      service.returnToCharacterSelect();
      expect(service.currentZone()).toBe(null);
    });

    it('réinitialise quizFeedback à null', () => {
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0); // faux → feedback = 'incorrect'
      expect(service.quizFeedback()).toBe('incorrect');
      service.returnToCharacterSelect();
      expect(service.quizFeedback()).toBe(null);
    });

    it('réinitialise hintText à null', () => {
      (service as any).quizActiveSignal.set(true);
      service.addCoins(1);
      service.buyHint();
      expect(service.hintText()).not.toBe(null);
      service.returnToCharacterSelect();
      expect(service.hintText()).toBe(null);
    });

    it('réinitialise eliminatedAnswers à []', () => {
      (service as any).quizActiveSignal.set(true);
      service.addCoins(2);
      service.buyElimination();
      expect(service.eliminatedAnswers()).toHaveLength(2);
      service.returnToCharacterSelect();
      expect(service.eliminatedAnswers()).toEqual([]);
    });

    it('réinitialise gameWon à false après une victoire réelle', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0); // Quiz final réussi
      expect(service.gameWon()).toBe(true);

      service.returnToCharacterSelect();
      expect(service.gameWon()).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // addCompletedPath à la victoire
  // ──────────────────────────────────────────────────────────────

  describe('addCompletedPath à la victoire', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('appelle addCompletedPath quand le Quiz final est réussi', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0); // correctIndex de mario-zone-3

      expect(completedPathsMock.getCompletedPaths()).toContain('mario');
    });

    it('n\'appelle pas addCompletedPath pour un Quiz non-final', () => {
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(1); // Zone 1 quiz 0 réussi (non-final)

      expect(completedPathsMock.getCompletedPaths()).not.toContain('mario');
    });

    it('n\'appelle pas addCompletedPath quand le Quiz final échoue', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(1); // faux

      expect(completedPathsMock.getCompletedPaths()).not.toContain('mario');
    });

    it('appelle addCompletedPath avec le bon characterId (mario)', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0);

      const paths = completedPathsMock.getCompletedPaths();
      expect(paths).toContain('mario');
      expect(paths).toHaveLength(1);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // allPathsCompleted
  // ──────────────────────────────────────────────────────────────

  describe('allPathsCompleted', () => {
    it('retourne false quand aucun Chemin n\'est complété', () => {
      expect(service.allPathsCompleted()).toBe(false);
    });

    it('retourne false quand un seul Chemin est complété', () => {
      completedPathsMock.addCompletedPath('mario');
      expect(service.allPathsCompleted()).toBe(false);
    });

    it('retourne true quand les 4 Chemins sont complétés', () => {
      completedPathsMock.addCompletedPath('mario');
      completedPathsMock.addCompletedPath('luigi');
      completedPathsMock.addCompletedPath('peach');
      completedPathsMock.addCompletedPath('daisy');
      expect(service.allPathsCompleted()).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // restartGame
  // ──────────────────────────────────────────────────────────────

  describe('restartGame', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('redémarre le jeu avec le même personnage', () => {
      service.addCoins(10);
      service.navigateToZone('mario-zone-2');
      service.restartGame();
      expect(service.gameStarted()).toBe(true);
      expect(service.coins()).toBe(0);
      expect(service.characterId()).toBe('mario');
    });

    it('réinitialise gameWon à false après une victoire', () => {
      service.navigateToZone('mario-zone-3');
      (service as any).quizActiveSignal.set(true);
      service.submitQuizAnswer(0); // Quiz final réussi
      expect(service.gameWon()).toBe(true);

      service.restartGame();
      expect(service.gameWon()).toBe(false);
    });

    it('ne fait rien si aucun personnage n\'est chargé', () => {
      service.returnToMenu();
      service.restartGame();
      expect(service.gameStarted()).toBe(false);
    });
  });
});
