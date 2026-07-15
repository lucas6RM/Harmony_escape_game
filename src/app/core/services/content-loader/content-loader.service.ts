import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, resource } from '@angular/core';
import type { Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { CharacterPath, RawCharacterPath, Zone } from '../../types';

/**
 * Valeur par défaut renvoyée quand le chargement d'un Chemin échoue.
 */
const DEFAULT_PATH: CharacterPath = {
  character: 'mario',
  startZoneId: '',
  gameOverNarration: '',
  zones: {},
};

/**
 * Service qui charge le contenu d'un Chemin de Personnage depuis
 * les fichiers JSON placés dans `assets/content/`.
 *
 * Chaque appel à `loadPath()` retourne un Signal indépendant qui
 * contient le `CharacterPath` chargé (ou la valeur par défaut en cas d'erreur).
 */
@Injectable({ providedIn: 'root' })
export class ContentLoaderService {
  private readonly http = inject(HttpClient);

  /**
   * Résout toutes les Zones d'un chemin brut en un CharacterPath.
   *
   * @param rawPath — Chemin brut chargé depuis le fichier JSON du personnage
   * @returns Chemin avec toutes les Zones résolues par ID
   */
  private resolvePath(rawPath: RawCharacterPath): CharacterPath {
    const resolvedZones: { [zoneId: string]: Zone } = {};

    for (const [zoneId, zone] of Object.entries(rawPath.zones)) {
      resolvedZones[zoneId] = zone;
    }

    return {
      character: rawPath.character,
      startZoneId: rawPath.startZoneId,
      gameOverNarration: rawPath.gameOverNarration ?? '',
      zones: resolvedZones,
    };
  }

  /**
   * Charge le Chemin d'un Personnage depuis le fichier JSON correspondant.
   *
   * @param character - Nom du personnage (`mario`, `luigi`, `peach`, `daisy`)
   * @returns Signal contenant le `CharacterPath` chargé,
   *          ou une valeur par défaut en cas d'erreur
   */
  loadPath(character: string): { signal: Signal<CharacterPath>, isLoading: Signal<boolean> } {
    const pathResource = resource<RawCharacterPath, string>({
      params: () => character,
      loader: async ({ params }) => {
        return firstValueFrom(
          this.http.get<RawCharacterPath>(`assets/content/${params}.json`)
        );
      },
      defaultValue: { character: 'mario', startZoneId: '', gameOverNarration: '', zones: {} },
    });

    const pathSignal = computed<CharacterPath>(() => {
      const rawPath = pathResource.value();

      if (Object.keys(rawPath.zones).length === 0 && pathResource.value().character === 'mario' && pathResource.isLoading()) {
        return DEFAULT_PATH;
      }

      return this.resolvePath(rawPath);
    });

    return {
      signal: pathSignal,
      isLoading: pathResource.isLoading,
    };
  }
}
