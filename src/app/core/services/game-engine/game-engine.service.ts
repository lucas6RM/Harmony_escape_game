import { computed, inject, Injectable, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import { ContentLoaderService } from '../content-loader';
import type { CharacterPath, NarrativeChoice, Zone } from '../../types';

/**
 * Service central du moteur de jeu.
 *
 * Gère l'état de la partie : Zone courante, progression dans le Chemin,
 * Pièces accumulées, événements narratifs (choix bloquants, conséquences),
 * et l'orchestration de la navigation entre Zones.
 */
@Injectable({ providedIn: 'root' })
export class GameEngineService {
  private readonly contentLoader = inject(ContentLoaderService);

  // ── État interne ────────────────────────────────────────────────

  private pathSignal: Signal<CharacterPath> | null = null;

  private readonly currentZoneIndexSignal = signal<number>(0);
  private readonly coinsSignal = signal<number>(0);
  private readonly isZoneCompletedSignal = signal<boolean>(false);
  private readonly narrationEventSignal = signal<string | null>(null);
  private readonly isBlockingChoiceSignal = signal<boolean>(false);
  private readonly gameStartedSignal = signal<boolean>(false);

  // ── Accès public (Signals) ──────────────────────────────────────

  /** Index de la Zone courante dans le Chemin du personnage */
  readonly currentZoneIndex: Signal<number> = this.currentZoneIndexSignal;

  /** La Zone courante (ou `null` si le jeu n'est pas démarré) */
  readonly currentZone: Signal<Zone | null> = computed(() => {
    if (!this.pathSignal) {
      return null;
    }
    const path = this.pathSignal();
    const index = this.currentZoneIndexSignal();
    const zone = path.zones[index];
    return zone ?? null;
  });

  /** Nombre de Pièces accumulées par le joueur */
  readonly coins: Signal<number> = this.coinsSignal;

  /** Indique si la Zone courante est terminée (quiz réussi) */
  readonly isZoneCompleted: Signal<boolean> = this.isZoneCompletedSignal;

  /** Événement narratif affiché (choix bloquant, conséquence, etc.) */
  readonly narrationEvent: Signal<string | null> = this.narrationEventSignal;

  /** Indique si l'événement narratif actuel provient d'un choix bloquant (pénalité) */
  readonly isBlockingChoice: Signal<boolean> = this.isBlockingChoiceSignal;

  /** Indique si le jeu a été démarré */
  readonly gameStarted: Signal<boolean> = this.gameStartedSignal;

  /** Le Chemin complet du personnage (pour itérer sur les Zones) */
  readonly path: Signal<CharacterPath> = computed(() => {
    if (!this.pathSignal) {
      return { character: 'mario', zones: [] };
    }
    return this.pathSignal();
  });

  // ── Méthodes publiques ──────────────────────────────────────────

  /**
   * Initialise le jeu en chargeant le Chemin du personnage sélectionné.
   *
   * @param characterId - Identifiant du Personnage (`mario`, `luigi`, `peach`, `daisy`)
   */
  startGame(characterId: string): void {
    this.pathSignal = this.contentLoader.loadPath(characterId);
    this.currentZoneIndexSignal.set(0);
    this.coinsSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.narrationEventSignal.set(null);
    this.isBlockingChoiceSignal.set(false);
    this.gameStartedSignal.set(true);
  }

  /**
   * Traite un Choix narratif sélectionné par le joueur.
   *
   * - Si le choix est bloquant (`blocking: true`), affiche un événement
   *   de pénalité et propose de recommencer la Zone.
   * - Si le choix n'est pas bloquant, met à jour l'événement narratif
   *   avec la narration associée au `nextNarrationId`.
   *
   * @param choiceIndex - Index du choix dans la Zone courante
   */
  selectChoice(choiceIndex: number): void {
    const zone = this.currentZone();
    if (!zone) {
      return;
    }

    const choice: NarrativeChoice | undefined = zone.choices[choiceIndex];
    if (!choice) {
      return;
    }

    if (choice.blocking) {
      // Choix bloquant → pénalité
      this.narrationEventSignal.set(choice.penalty ?? 'Ce chemin est bloqué !');
      this.isBlockingChoiceSignal.set(true);
      return;
    }

    // Choix valide → conséquence narrative
    this.narrationEventSignal.set(choice.nextNarrationId);
    this.isBlockingChoiceSignal.set(false);
  }

  /**
   * Passe à la Zone suivante dans le Chemin.
   *
   * Si le joueur est déjà à la dernière Zone, aucune action n'est effectuée.
   */
  advanceZone(): void {
    const path = this.pathSignal?.() ?? { zones: [] };
    const currentIndex = this.currentZoneIndexSignal();

    if (currentIndex < path.zones.length - 1) {
      this.currentZoneIndexSignal.set(currentIndex + 1);
      this.isZoneCompletedSignal.set(false);
      this.narrationEventSignal.set(null);
      this.isBlockingChoiceSignal.set(false);
    }
  }

  /**
   * Recommence la Zone courante (après une pénalité de choix bloquant).
   *
   * Réinitialise l'événement narratif et l'état de complétion de la Zone.
   */
  restartZone(): void {
    this.isZoneCompletedSignal.set(false);
    this.narrationEventSignal.set(null);
    this.isBlockingChoiceSignal.set(false);
  }

  /**
   * Marque la Zone courante comme terminée (quiz réussi).
   */
  completeZone(): void {
    this.isZoneCompletedSignal.set(true);
  }

  /**
   * Ajoute des Pièces au total du joueur.
   *
   * @param amount - Nombre de Pièces à ajouter
   */
  addCoins(amount: number): void {
    this.coinsSignal.update(current => current + amount);
  }

  /**
   * Efface l'événement narratif affiché.
   */
  clearEvent(): void {
    this.narrationEventSignal.set(null);
  }
}
