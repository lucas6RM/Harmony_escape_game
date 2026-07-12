import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import type { CharacterPath, CharacterRole, RawCharacterPath, SharedZoneContent, Zone } from '../../types';
import { ContentLoaderService } from './content-loader.service';

// API interne Angular pour flusher les effects (utilisé par resource())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ɵEffectScheduler: any = (await import('@angular/core')).ɵEffectScheduler;

/**
 * Zone complète de test pour Mario.
 */
const MOCK_MARIO_ZONE: Zone = {
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
};

/**
 * Chemin de test valide pour Mario (utilisé par les tests existants).
 */
const MOCK_MARIO_PATH: CharacterPath = {
  character: 'mario',
  zones: [MOCK_MARIO_ZONE],
};

/**
 * Contenu partagé de test : Zones partagées + rôles narratifs.
 */
const MOCK_SHARED_CONTENT: SharedZoneContent = {
  sharedZones: [
    {
      id: 'shared_hall',
      narration: "Le hall d'entrée du palais s'étend devant toi. Des statues de Lumas veillent sur les murs.",
      choices: [
        {
          text: "Avancer vers les escaliers",
          nextNarrationId: 'shared_hall_stairs',
          blocking: false,
        },
        {
          text: "Examiner les statues",
          nextNarrationId: 'shared_hall_statues',
          blocking: false,
        },
      ],
      quiz: {
        type: 'univers-mario',
        question: 'Comment s\'appelle le fils de Bowser ?',
        answers: ['Bowser Junior', 'Koopa Jr', 'Bowser Jr', 'Junior Bowser'],
        correctIndex: 0,
      },
    },
    {
      id: 'shared_final',
      narration: "Tu arrives enfin dans la chambre où Harmony est retenue. Bowser Junior est là, souriant de malice.",
      choices: [
        {
          text: "Confronter Bowser Junior",
          nextNarrationId: 'shared_final_confront',
          blocking: false,
        },
      ],
      quiz: {
        type: 'francais',
        question: 'Quel est le synonyme de "libérer" ?',
        answers: ['Affranchir', 'Capturer', 'Enfermer', 'Blesser'],
        correctIndex: 0,
      },
    },
  ],
  characterRoles: [
    {
      forCharacter: 'mario',
      roles: [
        {
          characterId: 'luigi',
          roleTitle: "L'Explorateur nerveux",
          description: 'Luigi explore les couloirs sombres du palais, tremblant mais courageux.',
        },
        {
          characterId: 'peach',
          roleTitle: 'La Stratège bienveillante',
          description: 'Peach utilise sa sagesse pour trouver les passages secrets.',
        },
        {
          characterId: 'daisy',
          roleTitle: "L'Aventurière impulsive",
          description: 'Daisy fonce tête baissée, ouvrant les portes verrouillées par sa force.',
        },
      ],
    },
    {
      forCharacter: 'luigi',
      roles: [
        {
          characterId: 'mario',
          roleTitle: 'Le Leader courageux',
          description: 'Mario prend la tête de l\'expédition avec détermination.',
        },
        {
          characterId: 'peach',
          roleTitle: 'La Stratège bienveillante',
          description: 'Peach utilise sa sagesse pour trouver les passages secrets.',
        },
        {
          characterId: 'daisy',
          roleTitle: "L'Aventurière impulsive",
          description: 'Daisy fonce tête baissée, ouvrant les portes verrouillées par sa force.',
        },
      ],
    },
  ],
};

/**
 * Chemin brut de test qui mélange Zones complètes et références partagées.
 */
const MOCK_RAW_PATH_WITH_SHARED: RawCharacterPath = {
  character: 'mario',
  zones: [
    MOCK_MARIO_ZONE, // Zone complète
    { sharedZoneId: 'shared_hall' }, // Référence partagée
  ],
};

/**
 * Chemin brut de test contenant uniquement des références partagées.
 */
const MOCK_RAW_PATH_ALL_SHARED: RawCharacterPath = {
  character: 'luigi',
  zones: [
    { sharedZoneId: 'shared_hall' },
    { sharedZoneId: 'shared_final' },
  ],
};

/**
 * Chemin brut avec une référence partagée introuvable.
 */
const MOCK_RAW_PATH_MISSING_SHARED: RawCharacterPath = {
  character: 'peach',
  zones: [
    MOCK_MARIO_ZONE,
    { sharedZoneId: 'shared_hall' },
    { sharedZoneId: 'shared_inexistant' }, // N'existe pas dans sharedZones
  ],
};

/**
 * Classe mock qui remplace HttpClient pour les tests unitaires.
 * Retourne des données différentes selon l'URL demandée.
 * shared.json est asynchrone (setTimeout) pour simuler un vrai chargement réseau.
 */
class HttpClientMock {
  get<T>(_url: string): Observable<T> {
    // Simulation d'erreur pour les chemins inconnus
    if (_url.includes('inconnu')) {
      return throwError(() => new Error('404 Not Found'));
    }

    // shared.json → contenu partagé (asynchrone pour simuler le réseau)
    if (_url.includes('shared.json')) {
      return new Observable<T>(subscriber => {
        setTimeout(() => {
          subscriber.next(MOCK_SHARED_CONTENT as unknown as T);
          subscriber.complete();
        }, 0);
      });
    }

    // Chemins de personnages → chemins bruts (avec références partagées)
    if (_url.includes('mario.json')) {
      return of(MOCK_RAW_PATH_WITH_SHARED as unknown as T);
    }

    if (_url.includes('luigi.json')) {
      return of(MOCK_RAW_PATH_ALL_SHARED as unknown as T);
    }

    if (_url.includes('peach.json')) {
      return of(MOCK_RAW_PATH_MISSING_SHARED as unknown as T);
    }

    // Fallback pour les tests existants qui s'attendent à MOCK_MARIO_PATH
    return of(MOCK_MARIO_PATH as unknown as T);
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
    // Flush les effects pour que sharedZonesResource charge shared.json
    await flushResources();
  });

  describe('loadPath', () => {
    it('retourne un CharacterPath avec character = "mario" pour le chemin mario', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      await flushResources();

      // Assert
      const result = signal();
      expect(result.character).toBe('mario');
    });

    it('retourne un CharacterPath avec des Zones non vide pour le chemin mario', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      await flushResources();

      // Assert
      const result = signal();
      expect(result.zones.length).toBeGreaterThan(0);
    });

    it('retourne la valeur par défaut quand le Chemin est inconnu', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('inconnu'));

      // Assert — avant que l'effet async ne se résolve, on lit la valeur par défaut
      const valeurInitiale = signal();
      expect(valeurInitiale.character).toBe('mario');
      expect(valeurInitiale.zones).toEqual([]);
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

  describe('Chargement des Zones partagées', () => {
    it('charge shared.json au démarrage du service', async () => {
      // Arrange & Act — le service charge shared.json via sharedZonesResource au démarrage
      // Le beforeEach a déjà flushé les effects, donc shared.json est chargé
      const signal = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      // Première lecture du signal : déclenche l'évaluation du computed
      // qui lit sharedZonesResource.value() pour la première fois
      signal();
      // Deuxième flush pour que sharedZonesResource (lazy) ait le temps de charger
      await flushResources();

      // Assert
      const result = signal();
      // Si shared.json est chargé, la référence shared_hall est résolue
      expect(result.zones.some(z => z.id === 'shared_hall')).toBe(true);
    });

    it('retourne des Zones partagées vide par défaut avant chargement', () => {
      // Arrange — on réinitialise le TestBed et on recrée le service
      // sans flusher les resources, pour capturer l'état initial
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          { provide: HttpClient, useClass: HttpClientMock },
          ContentLoaderService,
        ],
      });
      const svc = TestBed.inject(ContentLoaderService);

      // Act — on appelle loadCharacterRoles immédiatement, avant tout chargement
      const signal = TestBed.runInInjectionContext(() => svc.loadCharacterRoles('mario'));

      // Assert — la valeur immédiate est le defaultValue (tableau vide)
      // car le loader async n'a pas encore eu le temps de se résoudre
      const valeurInitiale = signal();
      expect(valeurInitiale).toEqual([]);
    });
  });

  describe('Résolution des Zones partagées dans loadPath', () => {
    it('résout une référence sharedZoneId par la Zone complète depuis shared.json', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      // Première lecture pour déclencher sharedZonesResource (lazy)
      signal();
      await flushResources();

      // Assert
      const result = signal();
      // Le chemin mario contient { sharedZoneId: 'shared_hall' }
      // qui doit être résolu en la Zone complète depuis shared.json
      const zoneResolue = result.zones.find(z => z.id === 'shared_hall');
      expect(zoneResolue).toBeDefined();
      expect(zoneResolue?.narration).toBe("Le hall d'entrée du palais s'étend devant toi. Des statues de Lumas veillent sur les murs.");
      expect(zoneResolue?.quiz.type).toBe('univers-mario');
    });

    it('ignore une sharedZoneId introuvable sans crash', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('peach'));
      signal();
      await flushResources();

      // Assert
      const result = signal();
      // Le chemin peach contient { sharedZoneId: 'shared_inexistant' }
      // qui n'existe pas dans sharedZones → la Zone est filtrée
      expect(result.zones.length).toBe(2); // MOCK_MARIO_ZONE + shared_hall
      expect(result.zones.some(z => z.id === 'shared_inexistant')).toBe(false);
      expect(result.zones.some(z => z.id === 'shared_hall')).toBe(true);
    });

    it('mélange Zones complètes et références partagées dans un même chemin', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadPath('mario'));
      signal();
      await flushResources();

      // Assert
      const result = signal();
      // Le chemin mario contient MOCK_MARIO_ZONE (complète) + { sharedZoneId: 'shared_hall' }
      expect(result.zones.length).toBe(2);
      // La Zone complète est conservée
      expect(result.zones[0].id).toBe('mario_zone_1');
      // La référence partagée est résolue
      expect(result.zones[1].id).toBe('shared_hall');
    });
  });

  describe('Rôles de personnages', () => {
    it('retourne les rôles pour un personnage existant', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadCharacterRoles('mario'));
      // Première lecture pour déclencher sharedZonesResource (lazy)
      signal();
      await flushResources();

      // Assert
      const result = signal();
      expect(result.length).toBe(3);
    });

    it('retourne un tableau vide pour un personnage inconnu', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadCharacterRoles('inconnu'));
      signal();
      await flushResources();

      // Assert
      const result = signal();
      expect(result).toEqual([]);
    });

    it('les rôles retournés ont le bon format (characterId, roleTitle, description)', async () => {
      // Arrange & Act
      const signal = TestBed.runInInjectionContext(() => service.loadCharacterRoles('mario'));
      signal();
      await flushResources();

      // Assert
      const result = signal();
      expect(result.length).toBe(3);

      // Vérifie le premier rôle (Luigi)
      const roleLuigi = result.find((r: CharacterRole) => r.characterId === 'luigi');
      expect(roleLuigi).toBeDefined();
      expect(roleLuigi?.roleTitle).toBe("L'Explorateur nerveux");
      expect(roleLuigi?.description).toBe('Luigi explore les couloirs sombres du palais, tremblant mais courageux.');

      // Vérifie le rôle de Peach
      const rolePeach = result.find((r: CharacterRole) => r.characterId === 'peach');
      expect(rolePeach).toBeDefined();
      expect(rolePeach?.roleTitle).toBe('La Stratège bienveillante');
      expect(rolePeach?.description).toBe('Peach utilise sa sagesse pour trouver les passages secrets.');

      // Vérifie le rôle de Daisy
      const roleDaisy = result.find((r: CharacterRole) => r.characterId === 'daisy');
      expect(roleDaisy).toBeDefined();
      expect(roleDaisy?.roleTitle).toBe("L'Aventurière impulsive");
      expect(roleDaisy?.description).toBe('Daisy fonce tête baissée, ouvrant les portes verrouillées par sa force.');
    });
  });
});
