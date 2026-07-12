import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameEngineService } from '../../../core/services/game-engine';
import type { NarrativeChoice, Zone } from '../../../core/types';
import { QuizPanelComponent } from '../quiz-panel/quiz-panel';

/**
 * Composant d'exploration d'une Zone.
 *
 * Affiche la narration de la Zone courante avec emojis,
 * les Choix narratifs comme boutons cliquables,
 * l'événement narratif quand le service le met à jour,
 * et le QuizPanel quand le Quiz est actif.
 */
@Component({
  selector: 'app-zone-explorer',
  templateUrl: './zone-explorer.html',
  styleUrl: './zone-explorer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QuizPanelComponent],
})
export class ZoneExplorer {
  private readonly gameEngine = inject(GameEngineService);

  /** La Zone courante exposée par le service */
  readonly currentZone = this.gameEngine.currentZone;

  /** Événement narratif exposé par le service */
  readonly narrationEvent = this.gameEngine.narrationEvent;

  /** Indique si l'événement actuel provient d'un choix bloquant (pénalité) */
  readonly isBlockingChoice = this.gameEngine.isBlockingChoice;

  /** Indique si le Quiz est actuellement affiché */
  readonly quizActive = this.gameEngine.quizActive;

  /** Feedback visuel après une réponse au Quiz */
  readonly quizFeedback = this.gameEngine.quizFeedback;

  /** Nombre de tentatives pour le Quiz courant */
  readonly quizAttempts = this.gameEngine.quizAttempts;

  /** Indique si la Zone courante est terminée (quiz réussi) */
  readonly isZoneCompleted = this.gameEngine.isZoneCompleted;

  /** Solde de Pièces du joueur */
  readonly coins = this.gameEngine.coins;

  /** Texte de l'indice acheté (ou null) */
  readonly hintText = this.gameEngine.hintText;

  /** Indices des réponses éliminées */
  readonly eliminatedAnswers = this.gameEngine.eliminatedAnswers;

  /** true si le joueur peut acheter un Indice (quiz actif, solde >= 3, pas déjà acheté) */
  readonly canBuyHint = computed(() => {
    return this.quizActive() && this.coins() >= 3 && this.hintText() === null;
  });

  /** true si le joueur peut acheter l'Élimination (quiz actif, solde >= 5, pas déjà acheté) */
  readonly canBuyElimination = computed(() => {
    return this.quizActive() && this.coins() >= 5 && this.eliminatedAnswers().length === 0;
  });

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

  /**
   * Soumet la réponse du Quiz sélectionnée par le joueur.
   *
   * @param index - Index de la réponse dans le Quiz (0-3)
   */
  onSelectAnswer(index: number): void {
    this.gameEngine.submitQuizAnswer(index);
  }

  /**
   * Passe à la Zone suivante après un quiz réussi.
   */
  onAdvanceZone(): void {
    this.gameEngine.advanceZone();
  }

  /**
   * Achète un Indice via le GameEngineService.
   */
  onBuyHint(): void {
    this.gameEngine.buyHint();
  }

  /**
   * Achète l'élimination de 2 réponses via le GameEngineService.
   */
  onBuyElimination(): void {
    this.gameEngine.buyElimination();
  }
}
