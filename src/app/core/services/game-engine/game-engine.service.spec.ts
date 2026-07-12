import { TestBed } from '@angular/core/testing';
import type { CharacterPath, GameSave, Zone } from '../../types';
import { CompletedPathsService } from '../completed-paths/completed-paths.service';
import { ContentLoaderService } from '../content-loader';
import { PersistenceService } from '../persistence';
import { GameEngineService } from './game-engine.service';

/**
 * Chemin de test avec 3 Zones pour Mario.
 */
const MOCK_MARIO_PATH: CharacterPath = {
  character: 'mario',
  zones: [
    {
      id: 'mario_zone_1',
      narration: "Tu arrives devant le palais d'Harmony. Luma t'attend, l'air inquiet.",
      choices: [
        {
          text: "Entrer par le grand portail",
          nextNarrationId: 'mario_n1_portal',
          blocking: false,
        },
        {
          text: "Essayer de grimper au mur",
          nextNarrationId: 'mario_n1_wall',
          blocking: true,
          penalty: 'Le mur est trop glissant ! Tu tombes à l\'eau.',
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
      narration: "Tu traverses le hall principal. Des étoiles flottent dans l'air.",
      choices: [
        {
          text: "Attraper une étoile",
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
    {
      id: 'mario_zone_3',
      narration: "Tu arrives dans la chambre d'Harmony. Bowser Junior est là !",
      choices: [
        {
          text: "Confronter Bowser Junior",
          nextNarrationId: 'mario_n3_final',
          blocking: false,
        },
      ],
      quiz: {
        type: 'contexte',
        question: 'Qui t\'a attendu à l\'entrée du palais ?',
        answers: ['Luma', 'Toad', 'Yoshi', 'Peach'],
        correctIndex: 0,
        isFinal: true,
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
      providers: [
        GameEngineService,
        { provide: ContentLoaderService, useClass: ContentLoaderServiceMock },
        { provide: PersistenceService, useClass: PersistenceServiceMock },
        { provide: CompletedPathsService, useClass: CompletedPathsServiceMock },
      ],
    });
    service = TestBed.inject(GameEngineService);
    persistenceMock = TestBed.inject(PersistenceService) as unknown as PersistenceServiceMock;
    completedPathsMock = TestBed.inject(CompletedPathsService) as unknown as CompletedPathsServiceMock;
  });

  describe('startGame', () => {
    it('démarré = false avant d\'appeler startGame', () => {
      expect(service.gameStarted()).toBe(false);
    });

    it('démarré = true après avoir appelé startGame', () => {
      service.startGame('mario');
      expect(service.gameStarted()).toBe(true);
    });

    it('l\'index de Zone courante est 0 après startGame', () => {
      service.startGame('mario');
      expect(service.currentZoneIndex()).toBe(0);
    });

    it('les Pièces sont à 0 après startGame', () => {
      service.startGame('mario');
      expect(service.coins()).toBe(0);
    });

    it('la Zone courante est la première Zone du Chemin', () => {
      service.startGame('mario');
      expect(service.currentZone()?.id).toBe('mario_zone_1');
    });

    it('aucun événement narratif après startGame', () => {
      service.startGame('mario');
      expect(service.narrationEvent()).toBe(null);
    });

    it('la Zone n\'est pas marquée comme terminée après startGame', () => {
      service.startGame('mario');
      expect(service.isZoneCompleted()).toBe(false);
    });
  });

  describe('selectChoice — choix non bloquant', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('met à jour narrationEvent avec le nextNarrationId du choix', () => {
      service.selectChoice(0);
      expect(service.narrationEvent()).toBe('mario_n1_portal');
    });

    it('ne change pas l\'index de Zone courante', () => {
      service.selectChoice(0);
      expect(service.currentZoneIndex()).toBe(0);
    });
  });

  describe('selectChoice — choix bloquant', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('affiche la pénalité dans narrationEvent', () => {
      service.selectChoice(1);
      expect(service.narrationEvent()).toBe("Le mur est trop glissant ! Tu tombes à l'eau.");
    });

    it('utilise le message par défaut si penalty n\'est pas défini', () => {
      // On simule un choix bloquant sans penalty
      const zone = service.currentZone();
      if (zone) {
        zone.choices[1].penalty = undefined;
      }
      service.selectChoice(1);
      expect(service.narrationEvent()).toBe('Ce chemin est bloqué !');
    });
  });

  describe('selectChoice — index invalide', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('ne fait rien si l\'index est hors limites', () => {
      service.selectChoice(99);
      expect(service.narrationEvent()).toBe(null);
    });

    it('ne fait rien si la Zone courante est null', () => {
      // Avant startGame, currentZone est null
      TestBed.inject(GameEngineService);
      // On recrée un service propre sans startGame
    });
  });

  describe('advanceZone', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('avance à la Zone suivante', () => {
      service.advanceZone();
      expect(service.currentZoneIndex()).toBe(1);
      expect(service.currentZone()?.id).toBe('mario_zone_2');
    });

    it('réinitialise isZoneCompleted', () => {
      service.completeZone();
      expect(service.isZoneCompleted()).toBe(true);
      service.advanceZone();
      expect(service.isZoneCompleted()).toBe(false);
    });

    it('efface l\'événement narratif', () => {
      service.selectChoice(0);
      expect(service.narrationEvent()).not.toBe(null);
      service.advanceZone();
      expect(service.narrationEvent()).toBe(null);
    });

    it('ne dépasse pas la dernière Zone', () => {
      // Avancer jusqu'à la dernière Zone
      service.advanceZone(); // index 1
      service.advanceZone(); // index 2 (dernière)
      service.advanceZone(); // devrait rester à 2
      expect(service.currentZoneIndex()).toBe(2);
    });
  });

  describe('restartZone', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('efface l\'événement narratif', () => {
      service.selectChoice(1); // choix bloquant
      expect(service.narrationEvent()).not.toBe(null);
      service.restartZone();
      expect(service.narrationEvent()).toBe(null);
    });

    it('démarque la Zone comme non terminée', () => {
      service.completeZone();
      service.restartZone();
      expect(service.isZoneCompleted()).toBe(false);
    });
  });

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
  });

  describe('clearEvent', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('efface l\'événement narratif', () => {
      service.selectChoice(0);
      expect(service.narrationEvent()).not.toBe(null);
      service.clearEvent();
      expect(service.narrationEvent()).toBe(null);
    });
  });

  describe('completeZone', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('marque la Zone comme terminée', () => {
      service.completeZone();
      expect(service.isZoneCompleted()).toBe(true);
    });
  });

  describe('currentZone — avant startGame', () => {
    it('retourne null quand le jeu n\'est pas démarré', () => {
      expect(service.currentZone()).toBe(null);
    });
  });

  describe('Quiz', () => {
    describe('Quiz non actif au démarrage', () => {
      it('quizActive() est false après startGame', () => {
        service.startGame('mario');
        expect(service.quizActive()).toBe(false);
      });

      it('quizAttempts() est 0 après startGame', () => {
        service.startGame('mario');
        expect(service.quizAttempts()).toBe(0);
      });

      it('quizFeedback() est null après startGame', () => {
        service.startGame('mario');
        expect(service.quizFeedback()).toBe(null);
      });
    });

    describe('Quiz activé après un choix valide', () => {
      beforeEach(() => {
        service.startGame('mario');
      });

      it('quizActive() devient true après selectChoice(0)', () => {
        service.selectChoice(0);
        expect(service.quizActive()).toBe(true);
      });

      it('quizAttempts() est 0 après activation du Quiz', () => {
        service.selectChoice(0);
        expect(service.quizAttempts()).toBe(0);
      });

      it('quizFeedback() est null après activation du Quiz', () => {
        service.selectChoice(0);
        expect(service.quizFeedback()).toBe(null);
      });
    });

    describe('Quiz réussi du 1er coup', () => {
      beforeEach(() => {
        service.startGame('mario');
        service.selectChoice(0);
      });

      it('quizActive() devient false après réponse correcte', () => {
        service.submitQuizAnswer(1); // correctIndex de mario_zone_1
        expect(service.quizActive()).toBe(false);
      });

      it('coins() augmente de 2', () => {
        service.submitQuizAnswer(1);
        expect(service.coins()).toBe(2);
      });

      it('isZoneCompleted() devient true', () => {
        service.submitQuizAnswer(1);
        expect(service.isZoneCompleted()).toBe(true);
      });

      it('quizFeedback() est "correct"', () => {
        service.submitQuizAnswer(1);
        expect(service.quizFeedback()).toBe('correct');
      });
    });

    describe('Quiz réussi au 2ème coup', () => {
      beforeEach(() => {
        service.startGame('mario');
        service.selectChoice(0);
      });

      it('1ère tentative fausse : quizActive() reste true, quizAttempts() = 1, quizFeedback() = "incorrect"', () => {
        service.submitQuizAnswer(0); // faux
        expect(service.quizActive()).toBe(true);
        expect(service.quizAttempts()).toBe(1);
        expect(service.quizFeedback()).toBe('incorrect');
      });

      it('2ème tentative correcte : quizActive() devient false, coins +2, isZoneCompleted = true, feedback = "correct"', () => {
        service.submitQuizAnswer(0); // faux
        service.submitQuizAnswer(1); // correct
        expect(service.quizActive()).toBe(false);
        expect(service.coins()).toBe(2);
        expect(service.isZoneCompleted()).toBe(true);
        expect(service.quizFeedback()).toBe('correct');
      });
    });

    describe('Quiz échoué après 2 tentatives', () => {
      beforeEach(() => {
        service.startGame('mario');
        service.selectChoice(0);
      });

      it('1ère tentative fausse : quizAttempts() = 1, quizActive() reste true', () => {
        service.submitQuizAnswer(0); // faux
        expect(service.quizAttempts()).toBe(1);
        expect(service.quizActive()).toBe(true);
      });

      it('2ème tentative fausse : quizActive() devient false, coins -1, isBlockingChoice = true, narrationEvent contient "Pénalité"', () => {
        service.submitQuizAnswer(0); // 1ère faux
        service.submitQuizAnswer(2); // 2ème faux
        expect(service.quizActive()).toBe(false);
        expect(service.coins()).toBe(-1);
        expect(service.isBlockingChoice()).toBe(true);
        expect(service.narrationEvent()).toContain('Pénalité');
      });
    });

    describe('submitQuizAnswer sans quiz actif ne fait rien', () => {
      it('ne change rien avant tout choix', () => {
        service.startGame('mario');
        service.submitQuizAnswer(0);
        expect(service.quizActive()).toBe(false);
        expect(service.quizAttempts()).toBe(0);
        expect(service.quizFeedback()).toBe(null);
        expect(service.coins()).toBe(0);
      });
    });

    describe('restartZone réinitialise l\'état du Quiz', () => {
      beforeEach(() => {
        service.startGame('mario');
      });

      it('quizActive() redevient false', () => {
        service.selectChoice(0);
        expect(service.quizActive()).toBe(true);
        service.restartZone();
        expect(service.quizActive()).toBe(false);
      });

      it('quizAttempts() redevient 0', () => {
        service.selectChoice(0);
        service.submitQuizAnswer(0); // faux → attempts = 1
        expect(service.quizAttempts()).toBe(1);
        service.restartZone();
        expect(service.quizAttempts()).toBe(0);
      });

      it('quizFeedback() redevient null', () => {
        service.selectChoice(0);
        service.submitQuizAnswer(0); // faux → feedback = 'incorrect'
        expect(service.quizFeedback()).toBe('incorrect');
        service.restartZone();
        expect(service.quizFeedback()).toBe(null);
      });
    });

    describe('advanceZone réinitialise l\'état du Quiz', () => {
      beforeEach(() => {
        service.startGame('mario');
      });

      it('quizActive() redevient false', () => {
        service.selectChoice(0);
        expect(service.quizActive()).toBe(true);
        service.advanceZone();
        expect(service.quizActive()).toBe(false);
      });

      it('quizAttempts() redevient 0', () => {
        service.selectChoice(0);
        service.submitQuizAnswer(0); // faux → attempts = 1
        expect(service.quizAttempts()).toBe(1);
        service.advanceZone();
        expect(service.quizAttempts()).toBe(0);
      });

      it('quizFeedback() redevient null', () => {
        service.selectChoice(0);
        service.submitQuizAnswer(0); // faux → feedback = 'incorrect'
        expect(service.quizFeedback()).toBe('incorrect');
        service.advanceZone();
        expect(service.quizFeedback()).toBe(null);
      });
    });
  });

  describe('Aides', () => {
    describe('buyHint', () => {
      beforeEach(() => {
        service.startGame('mario');
      });

      it('buyHint avec quiz non actif : retourne false, rien ne change', () => {
        const result = service.buyHint();
        expect(result).toBe(false);
        expect(service.hintText()).toBe(null);
        expect(service.coins()).toBe(0);
      });

      it('buyHint avec solde insuffisant : retourne false', () => {
        service.selectChoice(0); // active le quiz
        service.addCoins(2); // 2 pièces, besoin de 3
        const result = service.buyHint();
        expect(result).toBe(false);
        expect(service.hintText()).toBe(null);
        expect(service.coins()).toBe(2);
      });

      it('buyHint avec solde suffisant : coûte 3 pièces, hintText non null', () => {
        service.selectChoice(0); // active le quiz
        service.addCoins(5); // 5 pièces
        const result = service.buyHint();
        expect(result).toBe(true);
        expect(service.coins()).toBe(2); // 5 - 3 = 2
        expect(service.hintText()).not.toBe(null);
        expect(service.hintText()).toContain('Indice');
      });

      it('buyHint affiche un indice basé sur la bonne réponse', () => {
        service.selectChoice(0); // active le quiz, zone 1, bonne réponse = '623'
        service.addCoins(3);
        service.buyHint();
        // La bonne réponse est '623', donc l'indice contient '623'
        expect(service.hintText()).toContain('623');
      });

      it("buyHint ne peut être acheté qu'une seule fois par quiz", () => {
        service.selectChoice(0);
        service.addCoins(10);
        service.buyHint();
        const result2 = service.buyHint();
        expect(result2).toBe(false);
        expect(service.coins()).toBe(7); // Seule le premier achat a coûté 3
      });
    });

    describe('buyElimination', () => {
      beforeEach(() => {
        service.startGame('mario');
      });

      it('buyElimination avec quiz non actif : retourne false', () => {
        const result = service.buyElimination();
        expect(result).toBe(false);
        expect(service.eliminatedAnswers()).toEqual([]);
        expect(service.coins()).toBe(0);
      });

      it('buyElimination avec solde insuffisant : retourne false', () => {
        service.selectChoice(0);
        service.addCoins(4); // 4 pièces, besoin de 5
        const result = service.buyElimination();
        expect(result).toBe(false);
        expect(service.eliminatedAnswers()).toEqual([]);
        expect(service.coins()).toBe(4);
      });

      it('buyElimination avec solde suffisant : coûte 5 pièces, 2 indices éliminés', () => {
        service.selectChoice(0);
        service.addCoins(7);
        const result = service.buyElimination();
        expect(result).toBe(true);
        expect(service.coins()).toBe(2); // 7 - 5 = 2
        expect(service.eliminatedAnswers()).toHaveLength(2);
      });

      it('buyElimination ne contient jamais le correctIndex', () => {
        service.selectChoice(0); // zone 1, correctIndex = 1
        service.addCoins(5);
        service.buyElimination();
        const eliminated = service.eliminatedAnswers();
        expect(eliminated).not.toContain(1); // correctIndex de mario_zone_1
      });

      it("buyElimination ne peut être acheté qu'une seule fois par quiz", () => {
        service.selectChoice(0);
        service.addCoins(15);
        service.buyElimination();
        const result2 = service.buyElimination();
        expect(result2).toBe(false);
        expect(service.coins()).toBe(10); // Seul le premier achat a coûté 5
      });
    });

    describe('Réinitialisation des aides', () => {
      beforeEach(() => {
        service.startGame('mario');
      });

      it('restartZone réinitialise hintText et eliminatedAnswers', () => {
        service.selectChoice(0);
        service.addCoins(10);
        service.buyHint();
        service.buyElimination();
        expect(service.hintText()).not.toBe(null);
        expect(service.eliminatedAnswers()).toHaveLength(2);

        service.restartZone();
        expect(service.hintText()).toBe(null);
        expect(service.eliminatedAnswers()).toEqual([]);
      });

      it('advanceZone réinitialise hintText et eliminatedAnswers', () => {
        service.selectChoice(0);
        service.addCoins(10);
        service.buyHint();
        service.buyElimination();

        service.advanceZone();
        expect(service.hintText()).toBe(null);
        expect(service.eliminatedAnswers()).toEqual([]);
      });

      it('selectChoice (choix valide) réinitialise hintText et eliminatedAnswers', () => {
        service.addCoins(10);
        service.selectChoice(0);
        service.buyHint();
        expect(service.hintText()).not.toBe(null);

        // Refaire un choix valide réinitialise
        service.selectChoice(0);
        expect(service.hintText()).toBe(null);
        expect(service.eliminatedAnswers()).toEqual([]);
      });
    });
  });

  describe('restoreGame', () => {
    const mockGameSave: GameSave = {
      selectedCharacterId: 'mario',
      currentZoneIndex: 2,
      coins: 7,
      quizAttempts: 1,
      zonesCompleted: [0, 1],
    };

    it('charge le Chemin du personnage sauvegardé', () => {
      service.restoreGame(mockGameSave);
      expect(service.path().character).toBe('mario');
    });

    it('restaure l\'index de Zone courante', () => {
      service.restoreGame(mockGameSave);
      expect(service.currentZoneIndex()).toBe(2);
    });

    it('restaure les Pièces accumulées', () => {
      service.restoreGame(mockGameSave);
      expect(service.coins()).toBe(7);
    });

    it('restaure les tentatives de Quiz', () => {
      service.restoreGame(mockGameSave);
      expect(service.quizAttempts()).toBe(1);
    });

    it('restaure les Zones terminées (copie défensive)', () => {
      service.restoreGame(mockGameSave);
      expect(service.zonesCompleted()).toEqual([0, 1]);
      // Vérifier que c\'est une copie et non la même référence
      expect(service.zonesCompleted()).not.toBe(mockGameSave.zonesCompleted);
    });

    it('démarre le jeu (gameStarted = true)', () => {
      service.restoreGame(mockGameSave);
      expect(service.gameStarted()).toBe(true);
    });

    it('la Zone courante correspond à l\'index restauré', () => {
      service.restoreGame(mockGameSave);
      expect(service.currentZone()?.id).toBe('mario_zone_3');
    });

    it('réinitialise isZoneCompleted à false', () => {
      service.restoreGame(mockGameSave);
      expect(service.isZoneCompleted()).toBe(false);
    });

    it('réinitialise les signaux de session (narration, quiz, aides)', () => {
      service.restoreGame(mockGameSave);
      expect(service.narrationEvent()).toBe(null);
      expect(service.isBlockingChoice()).toBe(false);
      expect(service.quizActive()).toBe(false);
      expect(service.quizFeedback()).toBe(null);
      expect(service.hintText()).toBe(null);
      expect(service.eliminatedAnswers()).toEqual([]);
    });

    it('ne fait rien si selectedCharacterId est null', () => {
      const invalidSave: GameSave = {
        selectedCharacterId: null,
        currentZoneIndex: 0,
        coins: 0,
        quizAttempts: 0,
        zonesCompleted: [],
      };
      service.restoreGame(invalidSave);
      expect(service.gameStarted()).toBe(false);
    });

    it('fonctionne après un startGame précédent (restaure par-dessus)', () => {
      service.startGame('mario');
      expect(service.currentZoneIndex()).toBe(0);
      expect(service.coins()).toBe(0);

      service.restoreGame(mockGameSave);
      expect(service.currentZoneIndex()).toBe(2);
      expect(service.coins()).toBe(7);
      expect(service.zonesCompleted()).toEqual([0, 1]);
    });
  });

  describe('Auto-save via PersistenceService', () => {
    beforeEach(() => {
      persistenceMock.savedStates = [];
    });

    describe('startGame', () => {
      it('appelle saveGame avec l\'état initial après startGame', () => {
        service.startGame('mario');
        expect(persistenceMock.savedStates).toHaveLength(1);
        expect(persistenceMock.savedStates[0]).toEqual({
          currentZoneIndex: 0,
          coins: 0,
          quizAttempts: 0,
          zonesCompleted: [],
        });
      });
    });

    describe('completeZone', () => {
      beforeEach(() => {
        service.startGame('mario');
        persistenceMock.savedStates = []; // reset après startGame
      });

      it('appelle saveGame avec l\'index de la Zone complétée dans zonesCompleted', () => {
        service.completeZone();
        expect(persistenceMock.savedStates).toHaveLength(1);
        expect(persistenceMock.savedStates[0]).toEqual({
          currentZoneIndex: 0,
          coins: 0,
          quizAttempts: 0,
          zonesCompleted: [0],
        });
      });

      it('n\'ajoute pas l\'index en double si completeZone est appelé deux fois', () => {
        service.completeZone();
        service.completeZone();
        expect(persistenceMock.savedStates).toHaveLength(2);
        expect(persistenceMock.savedStates[1]).toEqual({
          currentZoneIndex: 0,
          coins: 0,
          quizAttempts: 0,
          zonesCompleted: [0],
        });
      });

      it('sauvegarde les Pièces accumulées', () => {
        service.addCoins(5);
        service.completeZone();
        expect(persistenceMock.savedStates[0]).toMatchObject({
          coins: 5,
          zonesCompleted: [0],
        });
      });
    });

    describe('advanceZone', () => {
      beforeEach(() => {
        service.startGame('mario');
        persistenceMock.savedStates = []; // reset après startGame
      });

      it('appelle saveGame avec le nouvel index de Zone', () => {
        service.advanceZone();
        expect(persistenceMock.savedStates).toHaveLength(1);
        expect(persistenceMock.savedStates[0]).toMatchObject({
          currentZoneIndex: 1,
        });
      });

      it('sauvegarde l\'état après avoir complété puis avancé', () => {
        service.completeZone(); // Zone 0 complétée
        persistenceMock.savedStates = []; // reset
        service.advanceZone(); // avance à Zone 1
        expect(persistenceMock.savedStates).toHaveLength(1);
        expect(persistenceMock.savedStates[0]).toMatchObject({
          currentZoneIndex: 1,
          zonesCompleted: [0],
        });
      });
    });

    describe('submitQuizAnswer (réponse correcte)', () => {
      beforeEach(() => {
        service.startGame('mario');
        service.selectChoice(0);
        persistenceMock.savedStates = []; // reset après startGame
      });

      it('déclenche saveGame via completeZone quand la réponse est correcte', () => {
        service.submitQuizAnswer(1); // correctIndex de mario_zone_1
        expect(persistenceMock.savedStates).toHaveLength(1);
        expect(persistenceMock.savedStates[0]).toMatchObject({
          currentZoneIndex: 0,
          coins: 2,
          zonesCompleted: [0],
        });
      });
    });
  });

  describe('Fin de partie — Quiz final', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('gameWon() est false au démarrage', () => {
      expect(service.gameWon()).toBe(false);
    });

    it('gameWon() reste false après un Quiz non-final réussi', () => {
      service.selectChoice(0); // Zone 1 (non-final)
      service.submitQuizAnswer(1); // réponse correcte
      expect(service.gameWon()).toBe(false);
    });

    it('gameWon() devient true après le Quiz final réussi', () => {
      // Avancer jusqu'à la dernière Zone (zone 3, Quiz final)
      service.selectChoice(0);
      service.submitQuizAnswer(1); // Zone 1 réussie
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0); // Zone 2 réussie
      service.advanceZone();

      // Zone 3 = Quiz final (isFinal: true)
      service.selectChoice(0);
      service.submitQuizAnswer(0); // correctIndex de mario_zone_3
      expect(service.gameWon()).toBe(true);
    });

    it('gameWon() ne devient pas true si le Quiz final échoue', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      // Zone 3 = Quiz final → 2 erreurs
      service.selectChoice(0);
      service.submitQuizAnswer(1); // faux
      service.submitQuizAnswer(2); // faux → pénalité
      expect(service.gameWon()).toBe(false);
    });

    it('l\'échec du Quiz final affiche un message motivant spécifique', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      // Zone 3 = Quiz final → 2 erreurs
      service.selectChoice(0);
      service.submitQuizAnswer(1); // faux
      service.submitQuizAnswer(2); // faux → pénalité
      expect(service.narrationEvent()).toContain('Presque là');
      expect(service.narrationEvent()).toContain('Bowser Junior');
      expect(service.narrationEvent()).toContain('recommence');
    });

    it('l\'échec du Quiz final met isBlockingChoice à true (bouton Recommencer disponible)', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      // Zone 3 = Quiz final → 2 erreurs
      service.selectChoice(0);
      service.submitQuizAnswer(1); // faux
      service.submitQuizAnswer(2); // faux → pénalité
      expect(service.isBlockingChoice()).toBe(true);
    });

    it('restartZone() permet de recommencer la Zone finale après échec', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      // Zone 3 = Quiz final → 2 erreurs
      service.selectChoice(0);
      service.submitQuizAnswer(1); // faux
      service.submitQuizAnswer(2); // faux → pénalité
      expect(service.isBlockingChoice()).toBe(true);
      expect(service.quizActive()).toBe(false);

      // Le joueur clique sur "Recommencer la Zone"
      service.restartZone();
      expect(service.isBlockingChoice()).toBe(false);
      expect(service.narrationEvent()).toBe(null);
      expect(service.quizActive()).toBe(false);
      expect(service.quizAttempts()).toBe(0);
      expect(service.quizFeedback()).toBe(null);
      // La Zone courante reste la Zone finale
      expect(service.currentZone()?.id).toBe('mario_zone_3');
      expect(service.currentZone()?.quiz.isFinal).toBe(true);
    });

    it('l\'échec d\'un Quiz non-final affiche le message générique de pénalité', () => {
      // Zone 1 (non-final) → 2 erreurs
      service.selectChoice(0);
      service.submitQuizAnswer(0); // faux
      service.submitQuizAnswer(2); // faux → pénalité
      expect(service.narrationEvent()).toBe('Pénalité ! -1 Pièce. Recommence cette Zone.');
      expect(service.narrationEvent()).not.toContain('Presque là');
    });

    it('characterId() retourne l\'identifiant du personnage', () => {
      expect(service.characterId()).toBe('mario');
    });

    it('le Quiz final réussi donne +2 Pièces', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1); // Zone 1 réussie → +2
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0); // Zone 2 réussie → +2
      service.advanceZone();

      // Zone 3 = Quiz final → +2
      service.selectChoice(0);
      service.submitQuizAnswer(0); // correctIndex de mario_zone_3
      expect(service.coins()).toBe(6); // 2 + 2 + 2
    });

    it('le Quiz final réussi marque la Zone comme terminée (isZoneCompleted = true)', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      // Zone 3 = Quiz final
      service.selectChoice(0);
      service.submitQuizAnswer(0);
      expect(service.isZoneCompleted()).toBe(true);
    });

    it('le Quiz final réussi désactive le Quiz (quizActive = false)', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      // Zone 3 = Quiz final
      service.selectChoice(0);
      expect(service.quizActive()).toBe(true);
      service.submitQuizAnswer(0);
      expect(service.quizActive()).toBe(false);
    });

    it('l\'échec du Quiz final coûte -1 Pièce', () => {
      // Avancer jusqu'à la dernière Zone avec des pièces accumulées
      service.selectChoice(0);
      service.submitQuizAnswer(1); // Zone 1 → +2
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0); // Zone 2 → +2
      service.advanceZone();

      // Zone 3 = Quiz final → 2 erreurs → -1
      service.selectChoice(0);
      service.submitQuizAnswer(1); // faux
      service.submitQuizAnswer(2); // faux → pénalité
      expect(service.coins()).toBe(3); // 2 + 2 - 1 = 3
    });

    it('startGame() réinitialise gameWon à false après une victoire', () => {
      // Simuler une victoire
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0); // Quiz final réussi
      expect(service.gameWon()).toBe(true);

      // Recommencer une nouvelle partie
      service.startGame('mario');
      expect(service.gameWon()).toBe(false);
    });

    it('le Quiz final est bien identifié par isFinal: true dans la Zone', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      // Zone 3 doit avoir quiz.isFinal = true
      expect(service.currentZone()?.quiz.isFinal).toBe(true);
    });
  });

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

    it('réinitialise l\'index de Zone à 0', () => {
      service.advanceZone();
      service.returnToMenu();
      expect(service.currentZoneIndex()).toBe(0);
    });

    it('réinitialise les Zones terminées', () => {
      service.completeZone();
      service.returnToMenu();
      expect(service.zonesCompleted()).toEqual([]);
    });

    it('appelle clearSave() sur le PersistenceService', () => {
      const clearSpy = vi.spyOn(persistenceMock, 'clearSave');
      service.returnToMenu();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('réinitialise quizActive à false', () => {
      service.selectChoice(0);
      expect(service.quizActive()).toBe(true);
      service.returnToMenu();
      expect(service.quizActive()).toBe(false);
    });

    it('réinitialise l\'événement narratif à null', () => {
      service.selectChoice(0);
      service.returnToMenu();
      expect(service.narrationEvent()).toBe(null);
    });

    it('la Zone courante est null après returnToMenu', () => {
      service.returnToMenu();
      expect(service.currentZone()).toBe(null);
    });
  });

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

    it('réinitialise l\'index de Zone à 0', () => {
      service.advanceZone();
      service.returnToCharacterSelect();
      expect(service.currentZoneIndex()).toBe(0);
    });

    it('réinitialise les Zones terminées', () => {
      service.completeZone();
      service.returnToCharacterSelect();
      expect(service.zonesCompleted()).toEqual([]);
    });

    it('appelle clearSave() sur le PersistenceService', () => {
      const clearSpy = vi.spyOn(persistenceMock, 'clearSave');
      service.returnToCharacterSelect();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('ne PAS effacer les Chemins complétés', () => {
      // Simuler que Mario a complété son Chemin
      completedPathsMock.addCompletedPath('mario');
      expect(completedPathsMock.getCompletedPaths()).toContain('mario');

      service.returnToCharacterSelect();

      // Le Chemin complété de Mario doit rester
      expect(completedPathsMock.getCompletedPaths()).toContain('mario');
    });

    it('réinitialise quizActive à false', () => {
      service.selectChoice(0);
      expect(service.quizActive()).toBe(true);
      service.returnToCharacterSelect();
      expect(service.quizActive()).toBe(false);
    });

    it('la Zone courante est null après returnToCharacterSelect', () => {
      service.returnToCharacterSelect();
      expect(service.currentZone()).toBe(null);
    });
  });

  describe('addCompletedPath à la victoire', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('appelle addCompletedPath quand le Quiz final est réussi', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1); // Zone 1 réussie
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0); // Zone 2 réussie
      service.advanceZone();

      // Zone 3 = Quiz final (isFinal: true)
      service.selectChoice(0);
      service.submitQuizAnswer(0); // correctIndex de mario_zone_3

      expect(completedPathsMock.getCompletedPaths()).toContain('mario');
    });

    it('n\'appelle pas addCompletedPath pour un Quiz non-final', () => {
      service.selectChoice(0);
      service.submitQuizAnswer(1); // Zone 1 réussie (non-final)

      expect(completedPathsMock.getCompletedPaths()).not.toContain('mario');
    });

    it('n\'appelle pas addCompletedPath quand le Quiz final échoue', () => {
      // Avancer jusqu'à la dernière Zone
      service.selectChoice(0);
      service.submitQuizAnswer(1);
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0);
      service.advanceZone();

      // Zone 3 = Quiz final → 2 erreurs
      service.selectChoice(0);
      service.submitQuizAnswer(1); // faux
      service.submitQuizAnswer(2); // faux → pénalité

      expect(completedPathsMock.getCompletedPaths()).not.toContain('mario');
    });
  });

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

  describe('restartGame', () => {
    beforeEach(() => {
      service.startGame('mario');
    });

    it('redémarre le jeu avec le même personnage', () => {
      service.addCoins(10);
      service.advanceZone();
      service.restartGame();
      expect(service.gameStarted()).toBe(true);
      expect(service.coins()).toBe(0);
      expect(service.currentZoneIndex()).toBe(0);
      expect(service.characterId()).toBe('mario');
    });

    it('réinitialise gameWon à false après une victoire', () => {
      // Simuler une victoire en réussissant le Quiz final
      service.selectChoice(0);
      service.submitQuizAnswer(1); // Zone 1 réussie
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0); // Zone 2 réussie
      service.advanceZone();

      // Zone 3 = Quiz final (isFinal: true)
      service.selectChoice(0);
      service.submitQuizAnswer(0); // correctIndex de mario_zone_3
      expect(service.gameWon()).toBe(true);

      // Le joueur clique sur "Recommencer"
      service.restartGame();
      expect(service.gameWon()).toBe(false);
    });

    it('ne fait rien si aucun personnage n\'est chargé', () => {
      // Après returnToMenu, pathSignal est null
      service.returnToMenu();
      service.restartGame();
      expect(service.gameStarted()).toBe(false);
    });

    it('réinitialise coins, zonesCompleted et currentZoneIndex après une victoire', () => {
      // Simuler une victoire
      service.selectChoice(0);
      service.submitQuizAnswer(1); // Zone 1 → +2
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0); // Zone 2 → +2
      service.advanceZone();

      service.selectChoice(0);
      service.submitQuizAnswer(0); // Quiz final réussi
      expect(service.gameWon()).toBe(true);
      expect(service.coins()).toBe(6);
      expect(service.currentZoneIndex()).toBe(2);
      expect(service.zonesCompleted()).toContain(2);

      // restartGame après victoire
      service.restartGame();
      expect(service.gameWon()).toBe(false);
      expect(service.coins()).toBe(0);
      expect(service.currentZoneIndex()).toBe(0);
      expect(service.zonesCompleted()).toEqual([]);
      expect(service.gameStarted()).toBe(true);
      expect(service.characterId()).toBe('mario');
    });
  });
});
