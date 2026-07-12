import { ChangeDetectionStrategy, Component, computed, output } from '@angular/core';
import { input } from '@angular/core';
import type { Quiz, QuizType } from '../../../core/types';

/**
 * Composant d'affichage d'un Quiz.
 *
 * Affiche le type de Quiz (badge coloré), la question, et les 4 réponses
 * sous forme de boutons cliquables. Gère le feedback visuel (vert/rouge)
 * après une réponse. Supporte également les Aides (Indice et Élimination).
 *
 * Le parent contrôle la logique : ce composant émet simplement l'index
 * de la réponse cliquée via `answerSelected`.
 */
@Component({
  selector: 'app-quiz-panel',
  templateUrl: './quiz-panel.html',
  styleUrl: './quiz-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizPanelComponent {
  /** Objet Quiz à afficher */
  readonly quiz = input.required<Quiz>();

  /** État visuel après réponse : 'correct' | 'incorrect' | null */
  readonly feedback = input<'correct' | 'incorrect' | null>(null);

  /** true quand on attend le feedback ou quand le quiz est terminé */
  readonly disabled = input(false, { transform: (v: boolean | undefined) => v ?? false });

  /** Index de la réponse cliquée par le joueur */
  readonly answerSelected = output<number>();

  /** Index de la réponse actuellement cliquée (pour le feedback visuel) */
  readonly selectedAnswerIndex = input<number | null>(null);

  /** Texte de l'indice acheté (null si aucun indice acheté) */
  readonly hintText = input<string | null>(null);

  /** Indices des réponses éliminées par l'aide "Élimination" */
  readonly eliminatedAnswers = input<number[]>([]);

  /** true si le joueur peut acheter un Indice */
  readonly canBuyHint = input(false);

  /** true si le joueur peut acheter l'Élimination */
  readonly canBuyElimination = input(false);

  /** Émis quand le joueur clique sur "Acheter un Indice" */
  readonly hintRequested = output<void>();

  /** Émis quand le joueur clique sur "Éliminer 2 réponses" */
  readonly eliminationRequested = output<void>();

  /** Label du type de Quiz affiché dans le badge */
  protected readonly typeLabel = computed(() => {
    const type = this.quiz()?.type;
    const labels: Record<QuizType, string> = {
      maths: 'Maths',
      francais: 'Français',
      'univers-mario': 'Univers Mario',
      contexte: 'Contexte',
    };
    return labels[type] ?? type;
  });

  /**
   * Traite le clic sur une réponse et émet l'index.
   * Ne fait rien si le composant est désactivé.
   */
  onAnswerClick(index: number): void {
    if (this.disabled()) {
      return;
    }
    this.answerSelected.emit(index);
  }

  /** Retourne la classe CSS du badge selon le type de Quiz */
  protected getBadgeClass(): string {
    const type = this.quiz()?.type;
    const classes: Record<QuizType, string> = {
      maths: 'badge-maths',
      francais: 'badge-francais',
      'univers-mario': 'badge-univers-mario',
      contexte: 'badge-contexte',
    };
    return classes[type] ?? '';
  }

  /** Retourne la classe CSS d'un bouton de réponse selon le feedback */
  protected getAnswerButtonClass(index: number): string {
    const fb = this.feedback();
    const selectedIndex = this.selectedAnswerIndex();

    if (fb === 'correct' && index === this.quiz()?.correctIndex) {
      return 'answer-correct';
    }

    if (fb === 'incorrect' && index === selectedIndex) {
      return 'answer-incorrect';
    }

    return '';
  }

  /** Masque une réponse éliminée (display: none) */
  protected isEliminated(index: number): boolean {
    return this.eliminatedAnswers().includes(index);
  }

  /** Traite le clic sur "Acheter un Indice" */
  onBuyHint(): void {
    if (this.canBuyHint()) {
      this.hintRequested.emit();
    }
  }

  /** Traite le clic sur "Éliminer 2 réponses" */
  onBuyElimination(): void {
    if (this.canBuyElimination()) {
      this.eliminationRequested.emit();
    }
  }
}
