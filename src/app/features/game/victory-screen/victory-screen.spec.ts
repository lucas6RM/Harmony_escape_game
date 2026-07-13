import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GameEngineService } from '../../../core/services/game-engine';
import { ContentLoaderService } from '../../../core/services/content-loader';
import type { RawCharacterPath } from '../../../core/types';
import { VictoryScreen } from './victory-screen';

/**
 * Chemin brut de test avec 3 Zones pour Mario (structure tree).
 * La dernière Zone contient un Quiz final.
 */
const MOCK_RAW_MARIO_PATH: RawCharacterPath = {
  character: 'mario',
  startZoneId: 'mario-zone-1',
  zones: {
    'mario-zone-1': {
      id: 'mario-zone-1',
      narration: "Tu arrives devant le palais d'Harmony.",
      quizzes: [
        {
          type: 'maths',
          question: 'Combien font 245 + 378 ?',
          answers: ['613', '623', '618', '603'],
          correctIndex: 1,
        },
      ],
      choices: [
        { text: "Entrer par le grand portail", nextZoneId: 'mario-zone-2' },
      ],
    },
    'mario-zone-2': {
      id: 'mario-zone-2',
      narration: "Tu traverses le hall principal.",
      quizzes: [
        {
          type: 'univers-mario',
          question: 'Qui est le frère de Mario ?',
          answers: ['Luigi', 'Wario', 'Toad', 'Yoshi'],
          correctIndex: 0,
        },
      ],
      choices: [
        { text: "Attraper une étoile", nextZoneId: 'mario-zone-3' },
      ],
    },
    'mario-zone-3': {
      id: 'mario-zone-3',
      narration: "Tu arrives dans la chambre d'Harmony.",
      quizzes: [
        {
          type: 'contexte',
          question: 'Qui t\'a attendu à l\'entrée du palais ?',
          answers: ['Luma', 'Toad', 'Yoshi', 'Peach'],
          correctIndex: 0,
          isFinal: true,
        },
      ],
      choices: [
        { text: "Confronter Bowser Junior", nextZoneId: 'mario-zone-3' },
      ],
    },
  },
};

class HttpClientMock {
  get<T>(url: string): Observable<T> {
    // Extrait le nom du personnage depuis l'URL (ex: "assets/content/luigi.json")
    const match = url.match(/\/(mario|luigi|peach|daisy)\.json/);
    const character = match ? match[1] : 'mario';
    const path: RawCharacterPath = {
      ...MOCK_RAW_MARIO_PATH,
      character: character as 'mario' | 'luigi' | 'peach' | 'daisy',
    };
    return of(path as unknown as T);
  }
}

class ContentLoaderServiceMock {
  loadPath(character: string) {
    return {
      signal: () => ({
        character: character as 'mario' | 'luigi' | 'peach' | 'daisy',
        startZoneId: MOCK_RAW_MARIO_PATH.startZoneId,
        zones: MOCK_RAW_MARIO_PATH.zones,
      }),
      isLoading: () => false,
    };
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
        { provide: HttpClient, useClass: HttpClientMock },
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
      gameEngine.navigateToZone('mario-zone-3');
      (gameEngine as any).quizActiveSignal.set(true);
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
