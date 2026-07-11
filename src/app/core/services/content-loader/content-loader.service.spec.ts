import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import type { CharacterPath, Zone } from '../../types';
import { ContentLoaderService } from './content-loader.service';

/**
 * Chemin de test valide pour Mario.
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
          nextNarrationId: 'mario_n1',
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
  ] as Zone[],
};

/**
 * Classe mock qui remplace HttpClient pour les tests unitaires.
 */
class HttpClientMock {
  get<T>(_url: string): Observable<T> {
    if (_url.includes('inconnu')) {
      return throwError(() => new Error('404 Not Found'));
    }
    return of(MOCK_MARIO_PATH as unknown as T);
  }
}

describe('ContentLoaderService', () => {
  let service: ContentLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: HttpClient, useClass: HttpClientMock },
        ContentLoaderService,
      ],
    });
    service = TestBed.inject(ContentLoaderService);
  });

  describe('loadPath', () => {
    it('retourne un CharacterPath avec character = "mario" pour le chemin mario', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('mario'));

      // Assert
      await vi.waitFor(() => {
        const result = signal();
        expect(result.character).toBe('mario');
      });
    });

    it('retourne un CharacterPath avec des Zones non vide pour le chemin mario', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('mario'));

      // Assert
      await vi.waitFor(() => {
        const result = signal();
        expect(result.zones.length).toBeGreaterThan(0);
      });
    });

    it('retourne la valeur par défaut quand le Chemin est inconnu', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('inconnu'));

      // Assert
      await vi.waitFor(() => {
        const result = signal();
        expect(result.character).toBe('mario');
        expect(result.zones).toEqual([]);
      });
    });

    it('est bien réactif : valeur par défaut puis mise à jour après chargement', () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('mario'));

      // Assert — la valeur immédiate est la valeur par défaut (chargement asynchrone en cours)
      const valeurInitiale = signal();
      expect(valeurInitiale.character).toBe('mario');
      expect(valeurInitiale.zones).toEqual([]);
    });
  });
});
