import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GameEngineService } from '../../../core/services/game-engine';
import { ContentLoaderService } from '../../../core/services/content-loader';
import { PersistenceService } from '../../../core/services/persistence';
import type { RawCharacterPath } from '../../../core/types';
import { GameOverScreen } from './game-over-screen';

/**
 * Chemin brut de test avec 3 Zones pour Mario (structure tree).
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

class RouterMock {
  navigatedUrl = '';
  navigate(url: string[]): void {
    this.navigatedUrl = url[0] ?? '';
  }
}

describe('GameOverScreen', () => {
  let component: GameOverScreen;
  let fixture: ComponentFixture<GameOverScreen>;
  let gameEngine: GameEngineService;
  let routerMock: RouterMock;
  let persistenceMock: PersistenceServiceMock;

  beforeEach(async () => {
    persistenceMock = new PersistenceServiceMock();

    await TestBed.configureTestingModule({
      imports: [GameOverScreen],
      providers: [
        GameEngineService,
        { provide: HttpClient, useClass: HttpClientMock },
        { provide: ContentLoaderService, useClass: ContentLoaderServiceMock },
        { provide: Router, useClass: RouterMock },
        { provide: PersistenceService, useValue: persistenceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameOverScreen);
    gameEngine = TestBed.inject(GameEngineService);
    routerMock = TestBed.inject(Router) as unknown as RouterMock;
    component = fixture.componentInstance;
  });

  describe('affichage de base', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('affiche le titre "Game Over"', () => {
      const title = fixture.nativeElement.querySelector('.game-over-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Game Over');
    });

    it('affiche le nom du personnage', () => {
      const narration = fixture.nativeElement.querySelector('.game-over-narration');
      expect(narration.textContent).toContain('Mario');
    });

    it('affiche l\'emoji du personnage', () => {
      const narration = fixture.nativeElement.querySelector('.game-over-narration');
      expect(narration.textContent).toContain('🍄');
    });

    it('affiche le texte narratif de Game Over', () => {
      const narration = fixture.nativeElement.querySelector('.game-over-narration');
      expect(narration.textContent).toContain('Harmony reste prisonnière');
    });

    it('affiche le score avec le nombre de Zones explorées (fallback 0)', () => {
      const scoreValue = fixture.nativeElement.querySelector('.score-value');
      expect(scoreValue.textContent).toContain('0');
    });

    it('affiche le label "Zones explorées"', () => {
      const scoreLabel = fixture.nativeElement.querySelector('.score-label');
      expect(scoreLabel.textContent).toContain('Zones explorées');
    });
  });

  describe('bouton Retour au menu', () => {
    beforeEach(() => {
      gameEngine.startGame('mario');
      fixture.detectChanges();
    });

    it('affiche le bouton "Retour au menu"', () => {
      const menuButton = fixture.nativeElement.querySelector('.action-menu');
      expect(menuButton).toBeTruthy();
      expect(menuButton.textContent).toContain('Retour au menu');
    });

    it('cliquer sur "Retour au menu" appelle clearSave() et navigue vers /accueil', () => {
      const clearSpy = vi.spyOn(persistenceMock, 'clearSave');
      const menuButton = fixture.nativeElement.querySelector('.action-menu');
      menuButton.click();
      fixture.detectChanges();

      expect(clearSpy).toHaveBeenCalled();
      expect(routerMock.navigatedUrl).toBe('/accueil');
    });

    it('le bouton a un aria-label descriptif', () => {
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
      const container = fixture.nativeElement.querySelector('.game-over-screen');
      expect(container.getAttribute('role')).toBe('main');
    });

    it('le score a role="status" et aria-live="polite"', () => {
      const score = fixture.nativeElement.querySelector('.game-over-score');
      expect(score.getAttribute('role')).toBe('status');
      expect(score.getAttribute('aria-live')).toBe('polite');
    });

    it('la narration a role="region"', () => {
      const narration = fixture.nativeElement.querySelector('.game-over-narration');
      expect(narration.getAttribute('role')).toBe('region');
    });
  });

  describe('différents personnages', () => {
    it('affiche le nom et l\'emoji de Luigi', () => {
      gameEngine.startGame('luigi');
      fixture.detectChanges();

      const narration = fixture.nativeElement.querySelector('.game-over-narration');
      expect(narration.textContent).toContain('Luigi');
      expect(narration.textContent).toContain('🌿');
    });

    it('affiche le nom et l\'emoji de Peach', () => {
      gameEngine.startGame('peach');
      fixture.detectChanges();

      const narration = fixture.nativeElement.querySelector('.game-over-narration');
      expect(narration.textContent).toContain('Peach');
      expect(narration.textContent).toContain('👑');
    });

    it('affiche le nom et l\'emoji de Daisy', () => {
      gameEngine.startGame('daisy');
      fixture.detectChanges();

      const narration = fixture.nativeElement.querySelector('.game-over-narration');
      expect(narration.textContent).toContain('Daisy');
      expect(narration.textContent).toContain('🌸');
    });
  });
});
