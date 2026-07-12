import { ChangeDetectionStrategy, Component, computed, output } from '@angular/core';
import { input } from '@angular/core';
import type { Quiz, QuizType } from '../../../core/types';

/**
 * Composant d'affichage d'un Quiz.
 *
 * Affiche le type de Quiz (badge coloré), la question, et les 4 réponses
 * sous forme de boutons cliquables. Gère le feedback visuel (vert/rouge)
 * après une réponse.
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
}
