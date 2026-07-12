import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, resource } from '@angular/core';
import type { Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { CharacterPath, CharacterRole, RawCharacterPath, SharedZoneContent, Zone } from '../../types';

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
 * Gère également le chargement des Zones partagées depuis `shared.json`
 * et la résolution des références `{ sharedZoneId }` dans les chemins.
 *
 * Chaque appel à `loadPath()` retourne un Signal indépendant qui
 * contient le `CharacterPath` chargé (ou la valeur par défaut en cas d'erreur).
 */
@Injectable({ providedIn: 'root' })
export class ContentLoaderService {
  private readonly http = inject(HttpClient);

  /**
   * Zones partagées chargées depuis `shared.json`.
   * Chargées une seule fois au démarrage du service.
   */
  private readonly sharedZonesResource = resource<SharedZoneContent, number>({
    params: () => 0,
    loader: async () => {
      return firstValueFrom(
        this.http.get<SharedZoneContent>('assets/content/shared.json')
      );
    },
    defaultValue: { sharedZones: [], characterRoles: [] },
  });

  /**
   * Signal contenant les Zones partagées résolues.
   */
  private readonly sharedZones = this.sharedZonesResource.value;

  /**
   * Résout une Zone brute (complète ou référence partagée) en une Zone complète.
   *
   * @param rawZone — Zone brute (soit une Zone complète, soit `{ sharedZoneId }`)
   * @returns La Zone complète, ou `null` si la référence partagée est introuvable
   */
  private resolveZone(rawZone: Zone | { sharedZoneId: string }): Zone | null {
    // Si c'est déjà une Zone complète (elle possède un champ `narration`)
    if ('narration' in rawZone) {
      return rawZone as Zone;
    }

    // C'est une référence vers une Zone partagée
    const zones = this.sharedZones();
    const found = zones.sharedZones.find(
      (z) => z.id === rawZone.sharedZoneId
    );

    // Si la Zone partagée n'existe pas, on retourne null (la Zone sera ignorée)
    return found ?? null;
  }

  /**
   * Résout toutes les Zones d'un chemin brut en remplaçant les références
   * partagées par les Zones complètes depuis `shared.json`.
   *
   * @param rawPath — Chemin brut chargé depuis le fichier JSON du personnage
   * @returns Chemin avec toutes les Zones résolues
   */
  private resolvePath(rawPath: RawCharacterPath): CharacterPath {
    const resolvedZones: Zone[] = [];

    for (const rawZone of rawPath.zones) {
      const zone = this.resolveZone(rawZone);
      if (zone !== null) {
        resolvedZones.push(zone);
      }
    }

    return {
      character: rawPath.character,
      zones: resolvedZones,
    };
  }

  /**
   * Charge le Chemin d'un Personnage depuis le fichier JSON correspondant.
   * Les références de Zones partagées (`{ sharedZoneId }`) sont automatiquement
   * résolues avec les Zones complètes depuis `shared.json`.
   *
   * @param character - Nom du personnage (`mario`, `luigi`, `peach`, `daisy`)
   * @returns Signal contenant le `CharacterPath` chargé (Zones partagées résolues),
   *          ou une valeur par défaut en cas d'erreur
   */
  loadPath(character: string): Signal<CharacterPath> {
    const pathResource = resource<RawCharacterPath, string>({
      params: () => character,
      loader: async ({ params }) => {
        return firstValueFrom(
          this.http.get<RawCharacterPath>(`assets/content/${params}.json`)
        );
      },
      defaultValue: { character: 'mario', zones: [] },
    });

    // Le signal final combine le chemin brut avec les Zones partagées
    // pour résoudre les références à chaque mise à jour
    return computed<CharacterPath>(() => {
      const rawPath = pathResource.value();

      // Si le chemin n'est pas encore chargé (valeur par défaut vide),
      // on retourne la valeur par défaut
      if (rawPath.zones.length === 0 && pathResource.value().character === 'mario' && pathResource.isLoading()) {
        return DEFAULT_PATH;
      }

      return this.resolvePath(rawPath);
    });
  }

  /**
   * Retourne les rôles narratifs des 3 autres personnages pour un personnage donné.
   *
   * Les données proviennent de `shared.json` (déjà chargé via `sharedZonesResource`).
   *
   * @param characterId — Identifiant du personnage joué (`mario`, `luigi`, `peach`, `daisy`)
   * @returns Signal contenant le tableau de `CharacterRole` pour ce personnage,
   *          ou un tableau vide si le personnage n'est pas trouvé
   */
  loadCharacterRoles(characterId: string): Signal<CharacterRole[]> {
    return computed<CharacterRole[]>(() => {
      const content = this.sharedZonesResource.value();
      const entry = content.characterRoles.find(
        (cr) => cr.forCharacter === characterId
      );
      return entry?.roles ?? [];
    });
  }
}
