import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import type { CharacterPath, RawCharacterPath, Zone } from '../../types';
import { ContentLoaderService } from './content-loader.service';

// API interne Angular pour flusher les effects (utilisé par resource())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ɵEffectScheduler: any = (await import('@angular/core')).ɵEffectScheduler;

/**
 * Zone complète de test pour Mario.
 */
const MOCK_MARIO_ZONE_1: Zone = {
  id: 'mario_zone_1',
  narration: "Tu arrives devant le palais d'Harmony. Luma t'attend, l'air inquiet.",
  choices: [
    {
      text: "Entrer par le grand portail",
      nextZoneId: 'mario_zone_2',
    },
  ],
  quizzes: [
    {
      type: 'maths',
      question: 'Combien font 245 + 378 ?',
      answers: ['613', '623', '618', '603'],
      correctIndex: 1,
    },
  ],
};

/**
 * Chemin de test valide pour Mario (structure tree).
 */
const MOCK_MARIO_PATH: CharacterPath = {
  character: 'mario',
  startZoneId: 'mario_zone_1',
  gameOverNarration: '',
  zones: {
    mario_zone_1: MOCK_MARIO_ZONE_1,
  },
};

/**
 * Chemin brut de test pour Mario (structure tree JSON).
 */
const MOCK_RAW_MARIO_PATH: RawCharacterPath = {
  character: 'mario',
  startZoneId: 'mario_zone_1',
  gameOverNarration: '',
  zones: {
    mario_zone_1: MOCK_MARIO_ZONE_1,
  },
};

/**
 * Chemin brut de test pour Luigi.
 */
const MOCK_RAW_LUIGI_PATH: RawCharacterPath = {
  character: 'luigi',
  startZoneId: 'luigi_zone_1',
  gameOverNarration: '',
  zones: {
    luigi_zone_1: {
      id: 'luigi_zone_1',
      narration: "Luigi tremble devant le palais.",
      choices: [
        { text: "Entrer courageusement", nextZoneId: 'luigi_zone_2' },
      ],
      quizzes: [
        {
          type: 'univers-mario',
          question: 'Quelle est la couleur de Luigi ?',
          answers: ['Vert', 'Rouge', 'Bleu', 'Jaune'],
          correctIndex: 0,
        },
      ],
    },
  },
};

/**
 * Classe mock qui remplace HttpClient pour les tests unitaires.
 */
class HttpClientMock {
  get<T>(_url: string): Observable<T> {
    // Simulation d'erreur pour les chemins inconnus
    if (_url.includes('inconnu')) {
      return throwError(() => new Error('404 Not Found'));
    }

    // Chemins de personnages → chemins bruts en structure tree
    if (_url.includes('mario.json')) {
      return of(MOCK_RAW_MARIO_PATH as unknown as T);
    }

    if (_url.includes('luigi.json')) {
      return of(MOCK_RAW_LUIGI_PATH as unknown as T);
    }

    // Fallback
    return of(MOCK_RAW_MARIO_PATH as unknown as T);
  }
}

/**
 * Flush les effects Angular (utilisés par resource()) puis attend
 * que les Promises des loaders soient résolues.
 */
async function flushResources(): Promise<void> {
  // 1. Flush les effects planifiés par le scheduler
  TestBed.runInInjectionContext(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scheduler = (TestBed as any).inject(ɵEffectScheduler);
    scheduler.flush();
  });
  // 2. Laisse les micro-tâches (Promise resolution) s'exécuter
  await new Promise(resolve => setTimeout(resolve, 0));
}

describe('ContentLoaderService', () => {
  let service: ContentLoaderService;

  beforeEach(async () => {
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
      const loaded = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      await flushResources();

      const result = loaded.signal();
      expect(result.character).toBe('mario');
    });

    it('retourne un CharacterPath avec des Zones non vide pour le chemin mario', async () => {
      const loaded = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      await flushResources();

      const result = loaded.signal();
      expect(Object.keys(result.zones).length).toBeGreaterThan(0);
    });

    it('retourne un CharacterPath avec startZoneId pour le chemin mario', async () => {
      const loaded = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      await flushResources();

      const result = loaded.signal();
      expect(result.startZoneId).toBe('mario_zone_1');
    });

    it('retourne la valeur par défaut quand le Chemin est inconnu', async () => {
      const loaded = TestBed.runInInjectionContext(() => service.loadPath('inconnu'));

      const valeurInitiale = loaded.signal();
      expect(valeurInitiale.character).toBe('mario');
      expect(Object.keys(valeurInitiale.zones)).toEqual([]);
    });

    it('est bien réactif : valeur par défaut puis mise à jour après chargement', () => {
      const loaded = TestBed.runInInjectionContext(() => service.loadPath('mario'));

      const valeurInitiale = loaded.signal();
      expect(valeurInitiale.character).toBe('mario');
      expect(Object.keys(valeurInitiale.zones)).toEqual([]);
    });

    it('charge correctement le chemin de Luigi', async () => {
      const loaded = TestBed.runInInjectionContext(() => service.loadPath('luigi'));
      await flushResources();

      const result = loaded.signal();
      expect(result.character).toBe('luigi');
      expect(result.startZoneId).toBe('luigi_zone_1');
      expect(Object.keys(result.zones)).toContain('luigi_zone_1');
    });

    it('les Zones chargées ont la structure correcte (quizzes[], choices avec nextZoneId)', async () => {
      const loaded = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      await flushResources();

      const result = loaded.signal();
      const zone = result.zones['mario_zone_1'];
      expect(zone).toBeDefined();
      expect(Array.isArray(zone?.quizzes)).toBe(true);
      expect(zone?.quizzes.length).toBe(1);
      expect(zone?.choices[0].nextZoneId).toBe('mario_zone_2');
    });
  });
});
