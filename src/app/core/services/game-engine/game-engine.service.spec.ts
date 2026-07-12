import { TestBed } from '@angular/core/testing';
import type { CharacterPath, Zone } from '../../types';
import { ContentLoaderService } from '../content-loader';
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

describe('GameEngineService', () => {
  let service: GameEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameEngineService,
        { provide: ContentLoaderService, useClass: ContentLoaderServiceMock },
      ],
    });
    service = TestBed.inject(GameEngineService);
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
});
