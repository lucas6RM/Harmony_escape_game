import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameEngineService } from '../../../core/services/game-engine';
import type { NarrativeChoice, Zone } from '../../../core/types';

/**
 * Composant d'exploration d'une Zone.
 *
 * Affiche la narration de la Zone courante avec emojis,
 * les Choix narratifs comme boutons cliquables,
 * et l'événement narratif quand le service le met à jour.
 */
@Component({
  selector: 'app-zone-explorer',
  templateUrl: './zone-explorer.html',
  styleUrl: './zone-explorer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneExplorer {
  private readonly gameEngine = inject(GameEngineService);

  /** La Zone courante exposée par le service */
  readonly currentZone = this.gameEngine.currentZone;

  /** Événement narratif exposé par le service */
  readonly narrationEvent = this.gameEngine.narrationEvent;

  /** Indique si l'événement actuel provient d'un choix bloquant (pénalité) */
  readonly isBlockingChoice = this.gameEngine.isBlockingChoice;

  /** Liste des choix de la Zone courante (ou tableau vide si pas de Zone) */
  readonly choices = computed<NarrativeChoice[]>(() => {
    const zone = this.currentZone();
    return zone?.choices ?? [];
  });

  /** Texte de narration de la Zone courante (ou chaîne vide) */
  readonly narration = computed<string>(() => {
    const zone = this.currentZone();
    return zone?.narration ?? '';
  });

  /**
   * Traite le clic sur un Choix narratif.
   *
   * @param index - Index du choix dans la Zone courante
   */
  onSelectChoice(index: number): void {
    this.gameEngine.selectChoice(index);
  }

  /**
   * Recommence la Zone courante après une pénalité de choix bloquant.
   */
  onRestartZone(): void {
    this.gameEngine.restartZone();
  }
}
