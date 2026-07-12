import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameEngineService } from '../../../core/services/game-engine';
import { ContentLoaderService } from '../../../core/services/content-loader';
import type { CharacterPath, Zone } from '../../../core/types';
import { VictoryScreen } from './victory-screen';

/**
 * Chemin de test avec 3 Zones pour Mario (la dernière a un Quiz final).
 */
const MOCK_MARIO_PATH: CharacterPath = {
  character: 'mario',
  zones: [
    {
      id: 'mario_zone_1',
      narration: "Tu arrives devant le palais d'Harmony.",
      choices: [
        {
          text: "Entrer par le grand portail",
          nextNarrationId: 'mario_n1_portal',
          blocking: false,
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
      narration: "Tu traverses le hall principal.",
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
      narration: "Tu arrives dans la chambre d'Harmony.",
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

class ContentLoaderServiceMock {
  loadPath(character: string) {
    return () => ({
      character: character as 'mario' | 'luigi' | 'peach' | 'daisy',
      zones: MOCK_MARIO_PATH.zones,
    });
  }
}

class PersistenceServiceMock {
  saveGame(_state: unknown) {}
  getGameSave() { return null; }
  isGameInProgress() { return false; }
  saveCharacter(_id: string) {}
  getSavedCharacter() { return null; }
  clearSave() {}
}

/**
 * Mock du Router qui capture les appels navigate.
 */
class RouterMock {
  navigatedUrl = '';
  navigate(url: string[]): void {
    this.navigatedUrl = url[0] ?? '';
  }
}

describe('VictoryScreen', () => {
  let component: VictoryScreen;
  let fixture: ComponentFixture<VictoryScreen>;
  let gameEngine: GameEngineService;
  let routerMock: RouterMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VictoryScreen],
      providers: [
        GameEngineService,
        { provide: ContentLoaderService, useClass: ContentLoaderServiceMock },
        { provide: Router, useClass: RouterMock },
        { provide: 'PersistenceService', useValue: new PersistenceServiceMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VictoryScreen);
    gameEngine = TestBed.inject(GameEngineService);
    routerMock = TestBed.inject(Router) as unknown as RouterMock;
    component = fixture.componentInstance;
  });

  describe('affichage de base', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('affiche le titre "Victoire !"', () => {
      const title = fixture.nativeElement.querySelector('.victory-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Victoire');
    });

    it('affiche le nom du personnage', () => {
      const narration = fixture.nativeElement.querySelector('.victory-narration');
      expect(narration.textContent).toContain('Mario');
    });

    it('affiche l\'emoji du personnage', () => {
      const narration = fixture.nativeElement.querySelector('.victory-narration');
      expect(narration.textContent).toContain('🍄');
    });

    it('affiche le texte narratif de libération d\'Harmony', () => {
      const narration = fixture.nativeElement.querySelector('.victory-narration');
      expect(narration.textContent).toContain('Harmony est libérée');
    });

    it('affiche le score final avec le nombre de Pièces', () => {
      gameEngine.addCoins(4); // simuler 2 zones passées
      fixture.detectChanges();

      const scoreValue = fixture.nativeElement.querySelector('.score-value');
      expect(scoreValue.textContent).toContain('4');
    });

    it('affiche le label "Pièces collectées"', () => {
      const scoreLabel = fixture.nativeElement.querySelector('.score-label');
      expect(scoreLabel.textContent).toContain('Pièces collectées');
    });
  });

  describe('boutons d\'action', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('affiche le bouton "Recommencer"', () => {
      const restartButton = fixture.nativeElement.querySelector('.action-restart');
      expect(restartButton).toBeTruthy();
      expect(restartButton.textContent).toContain('Recommencer');
    });

    it('affiche le bouton "Menu principal"', () => {
      const menuButton = fixture.nativeElement.querySelector('.action-menu');
      expect(menuButton).toBeTruthy();
      expect(menuButton.textContent).toContain('Menu principal');
    });

    it('cliquer sur "Recommencer" appelle restartGame()', () => {
      const spy = vi.spyOn(gameEngine, 'restartGame');
      const restartButton = fixture.nativeElement.querySelector('.action-restart');
      restartButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('cliquer sur "Menu principal" appelle returnToMenu() et navigue vers /accueil', () => {
      const spy = vi.spyOn(gameEngine, 'returnToMenu');
      const menuButton = fixture.nativeElement.querySelector('.action-menu');
      menuButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect(routerMock.navigatedUrl).toBe('/accueil');
    });

    it('affiche le bouton "Choisir un autre personnage"', () => {
      const anotherButton = fixture.nativeElement.querySelector('.action-another');
      expect(anotherButton).toBeTruthy();
      expect(anotherButton.textContent).toContain('Choisir un autre personnage');
    });

    it('cliquer sur "Choisir un autre personnage" appelle returnToCharacterSelect() et navigue vers /accueil', () => {
      const spy = vi.spyOn(gameEngine, 'returnToCharacterSelect');
      const anotherButton = fixture.nativeElement.querySelector('.action-another');
      anotherButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect(routerMock.navigatedUrl).toBe('/accueil');
    });

    it('cliquer sur "Choisir un autre personnage" réinitialise gameWon', () => {
      // Simuler une victoire
      gameEngine.selectChoice(0);
      gameEngine.submitQuizAnswer(1);
      gameEngine.advanceZone();
      gameEngine.selectChoice(0);
      gameEngine.submitQuizAnswer(0);
      gameEngine.advanceZone();
      gameEngine.selectChoice(0);
      gameEngine.submitQuizAnswer(0); // Quiz final réussi
      expect(gameEngine.gameWon()).toBe(true);

      const anotherButton = fixture.nativeElement.querySelector('.action-another');
      anotherButton.click();
      fixture.detectChanges();

      expect(gameEngine.gameWon()).toBe(false);
    });

    it('les boutons ont des aria-labels descriptifs', () => {
      const restartButton = fixture.nativeElement.querySelector('.action-restart');
      expect(restartButton.getAttribute('aria-label')).toContain('Recommencer');

      const anotherButton = fixture.nativeElement.querySelector('.action-another');
      expect(anotherButton.getAttribute('aria-label')).toContain('Choisir un autre personnage');

      const menuButton = fixture.nativeElement.querySelector('.action-menu');
      expect(menuButton.getAttribute('aria-label')).toContain('Retourner au menu');
    });
  });

  describe('accessibilité', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('le conteneur a role="main"', () => {
      const container = fixture.nativeElement.querySelector('.victory-screen');
      expect(container.getAttribute('role')).toBe('main');
    });

    it('le score a role="status" et aria-live="polite"', () => {
      const score = fixture.nativeElement.querySelector('.victory-score');
      expect(score.getAttribute('role')).toBe('status');
      expect(score.getAttribute('aria-live')).toBe('polite');
    });

    it('la narration a role="region"', () => {
      const narration = fixture.nativeElement.querySelector('.victory-narration');
      expect(narration.getAttribute('role')).toBe('region');
    });
  });

  describe('différents personnages', () => {
    it('affiche le nom et l\'emoji de Luigi', () => {
      gameEngine.startGame('luigi');
      fixture.detectChanges();

      const narration = fixture.nativeElement.querySelector('.victory-narration');
      expect(narration.textContent).toContain('Luigi');
      expect(narration.textContent).toContain('🌿');
    });

    it('affiche le nom et l\'emoji de Peach', () => {
      gameEngine.startGame('peach');
      fixture.detectChanges();

      const narration = fixture.nativeElement.querySelector('.victory-narration');
      expect(narration.textContent).toContain('Peach');
      expect(narration.textContent).toContain('👑');
    });

    it('affiche le nom et l\'emoji de Daisy', () => {
      gameEngine.startGame('daisy');
      fixture.detectChanges();

      const narration = fixture.nativeElement.querySelector('.victory-narration');
      expect(narration.textContent).toContain('Daisy');
      expect(narration.textContent).toContain('🌸');
    });
  });
});
