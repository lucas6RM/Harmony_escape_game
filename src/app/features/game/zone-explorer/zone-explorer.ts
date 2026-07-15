import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameEngineService } from '../../../core/services/game-engine';
import type { NarrativeChoice, Zone } from '../../../core/types';
import { QuizPanelComponent } from '../quiz-panel/quiz-panel';

/**
 * Composant d'exploration d'une Zone.
 *
 * Affiche la narration de la Zone courante avec emojis,
 * les Choix narratifs comme boutons cliquables,
 * le feedback de pénalité quand le Quiz est raté,
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

  /** Le Quiz courant exposé par le service */
  readonly currentQuiz = this.gameEngine.currentQuiz;

  /** Indique si le Quiz est actuellement affiché */
  readonly quizActive = this.gameEngine.quizActive;

  /** Feedback visuel après une réponse au Quiz */
  readonly quizFeedback = this.gameEngine.quizFeedback;

  /** Indique si la Zone courante est terminée (quiz réussi) */
  readonly isZoneCompleted = this.gameEngine.isZoneCompleted;

  /** Solde de Pièces du joueur */
  readonly coins = this.gameEngine.coins;

  /** Texte de l'indice acheté (ou null) */
  readonly hintText = this.gameEngine.hintText;

  /** Indices des réponses éliminées */
  readonly eliminatedAnswers = this.gameEngine.eliminatedAnswers;

  /** Nombre de Quiz restants dans la Zone courante */
  readonly quizzesRemaining = this.gameEngine.quizzesRemaining;

  /** true si le joueur peut acheter un Indice (quiz actif, solde >= 1, pas déjà acheté) */
  readonly canBuyHint = computed(() => {
    return this.quizActive() && this.coins() >= 1 && this.hintText() === null;
  });

  /** true si le joueur peut acheter l'Élimination (quiz actif, solde >= 2, pas déjà acheté) */
  readonly canBuyElimination = computed(() => {
    return this.quizActive() && this.coins() >= 2 && this.eliminatedAnswers().length === 0;
  });

  /** true si le Quiz de la Zone courante est le Quiz final */
  readonly isFinalQuiz = computed(() => {
    const quiz = this.currentQuiz();
    return quiz?.isFinal ?? false;
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
    this.preserveScroll(() => this.gameEngine.selectChoice(index));
  }

  /**
   * Recommence la Zone courante après une pénalité de Quiz raté.
   */
  onRestartZone(): void {
    this.preserveScroll(() => this.gameEngine.restartZone());
  }

  /**
   * Réactive le Quiz courant après une mauvaise réponse.
   * Le joueur rejoue le même Quiz sans reset de quizIndex.
   */
  onRetryQuiz(): void {
    this.preserveScroll(() => this.gameEngine.retryQuiz());
  }

  /**
   * Soumet la réponse du Quiz sélectionnée par le joueur.
   *
   * @param index - Index de la réponse dans le Quiz (0-3)
   */
  onSelectAnswer(index: number): void {
    this.preserveScroll(() => this.gameEngine.submitQuizAnswer(index));
  }

  /**
   * Passe au Quiz suivant après un quiz réussi.
   */
  onAdvanceZone(): void {
    this.preserveScroll(() => this.gameEngine.advanceQuiz());
  }

  /**
   * Continue après le dernier quiz d'une Zone (affiche les choix narratifs).
   */
  onContinueAfterZone(): void {
    this.preserveScroll(() => this.gameEngine.continueAfterZone());
  }

  /**
   * Achète un Indice via le GameEngineService.
   */
  onBuyHint(): void {
    this.preserveScroll(() => this.gameEngine.buyHint());
  }

  /**
   * Achète l'élimination de 2 réponses via le GameEngineService.
   */
  onBuyElimination(): void {
    this.preserveScroll(() => this.gameEngine.buyElimination());
  }

  /**
   * Exécute une action tout en préservant la position de scroll et en retirant
   * le focus pour empêcher le navigateur mobile de recentrer la vue.
   */
  private preserveScroll(action: () => void): void {
    const scrollY = window.scrollY;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    action();
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }
}
