import { HttpClient } from '@angular/common/http';
import { Injectable, inject, resource } from '@angular/core';
import type { Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { CharacterPath } from '../../types';

/**
 * Valeur par défaut renvoyée quand le chargement d'un Chemin échoue.
 */
const DEFAULT_PATH: CharacterPath = {
  character: 'mario',
  zones: [],
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
   * Charge le Chemin d'un Personnage depuis le fichier JSON correspondant.
   *
   * @param character - Nom du personnage (`mario`, `luigi`, `peach`, `daisy`)
   * @returns Signal contenant le `CharacterPath` chargé, ou une valeur par défaut en cas d'erreur
   */
  loadPath(character: string): Signal<CharacterPath> {
    const pathResource = resource<CharacterPath, string>({
      params: () => character,
      loader: async ({ params }) => {
        return firstValueFrom(
          this.http.get<CharacterPath>(`assets/content/${params}.json`)
        );
      },
      defaultValue: DEFAULT_PATH,
    });

    return pathResource.value;
  }
}
