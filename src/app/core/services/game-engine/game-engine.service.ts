import { computed, inject, Injectable, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import { ContentLoaderService } from '../content-loader';
import type { CharacterPath, NarrativeChoice, Zone } from '../../types';
import { HINT_COSTS } from '../../types';

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

  private readonly quizActiveSignal = signal<boolean>(false);
  private readonly quizAttemptsSignal = signal<number>(0);
  private readonly quizFeedbackSignal = signal<'correct' | 'incorrect' | null>(null);

  private readonly hintTextSignal = signal<string | null>(null);
  private readonly eliminatedAnswersSignal = signal<number[]>([]);

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

  /** Indique si le Quiz est actuellement affiché (après un choix narratif valide) */
  readonly quizActive: Signal<boolean> = this.quizActiveSignal;

  /** Nombre de tentatives pour le Quiz courant (0, 1 ou 2) */
  readonly quizAttempts: Signal<number> = this.quizAttemptsSignal;

  /** Feedback visuel après une réponse au Quiz */
  readonly quizFeedback: Signal<'correct' | 'incorrect' | null> = this.quizFeedbackSignal;

  /** Texte de l'Indice acheté (ou `null` si aucun Indice acheté) */
  readonly hintText: Signal<string | null> = this.hintTextSignal;

  /** Indices des réponses éliminées (ou tableau vide si aucune élimination) */
  readonly eliminatedAnswers: Signal<number[]> = this.eliminatedAnswersSignal;

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

    // Choix valide → conséquence narrative et activation du Quiz
    this.narrationEventSignal.set(choice.nextNarrationId);
    this.isBlockingChoiceSignal.set(false);
    this.quizActiveSignal.set(true);
    this.quizAttemptsSignal.set(0);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
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
      this.quizActiveSignal.set(false);
      this.quizAttemptsSignal.set(0);
      this.quizFeedbackSignal.set(null);
      this.hintTextSignal.set(null);
      this.eliminatedAnswersSignal.set([]);
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
    this.quizActiveSignal.set(false);
    this.quizAttemptsSignal.set(0);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
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

  /**
   * Achète un Indice textuel pendant un Quiz.
   *
   * Coûte 3 Pièces. Ne fonctionne que si le Quiz est actif et que
   * le joueur a assez de Pièces. L'indice donne un indice textuel
   * basé sur la première lettre ou le début de la bonne réponse.
   *
   * @returns true si l'achat a réussi, false sinon
   */
  buyHint(): boolean {
    if (!this.quizActiveSignal()) {
      return false;
    }
    const cost = HINT_COSTS.indice;
    if (this.coinsSignal() < cost) {
      return false;
    }
    if (this.hintTextSignal() !== null) {
      // Déjà acheté
      return false;
    }
    const zone = this.currentZone();
    if (!zone) {
      return false;
    }
    const correctAnswer = zone.quiz.answers[zone.quiz.correctIndex];
    // Indice : donne les 2-3 premiers caractères de la bonne réponse
    const preview = correctAnswer.slice(0, Math.min(3, correctAnswer.length));
    const hint = `Indice : la réponse commence par '${preview}...'`;
    this.coinsSignal.update(c => c - cost);
    this.hintTextSignal.set(hint);
    return true;
  }

  /**
   * Achète l'élimination de 2 fausses réponses pendant un Quiz.
   *
   * Coûte 5 Pièces. Ne fonctionne que si le Quiz est actif et que
   * le joueur a assez de Pièces. Retourne les indices de 2 réponses
   * fausses à masquer.
   *
   * @returns true si l'achat a réussi, false sinon
   */
  buyElimination(): boolean {
    if (!this.quizActiveSignal()) {
      return false;
    }
    const cost = HINT_COSTS.elimination;
    if (this.coinsSignal() < cost) {
      return false;
    }
    if (this.eliminatedAnswersSignal().length > 0) {
      // Déjà acheté
      return false;
    }
    const zone = this.currentZone();
    if (!zone) {
      return false;
    }
    // Trouver tous les indices incorrects
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== zone.quiz.correctIndex);
    // Prendre les 2 premiers indices incorrects
    const toEliminate = incorrectIndices.slice(0, 2);
    this.coinsSignal.update(c => c - cost);
    this.eliminatedAnswersSignal.set(toEliminate);
    return true;
  }

  /**
   * Soumet une réponse au Quiz en cours.
   *
   * - Réponse correcte : +2 Pièces, Zone terminée, Quiz désactivé.
   * - 1ère erreur : nouvelle tentative (pas de pénalité).
   * - 2ème erreur : -1 Pièce, pénalité, Zone à recommencer.
   *
   * @param answerIndex - Index de la réponse sélectionnée (0-3)
   */
  submitQuizAnswer(answerIndex: number): void {
    if (!this.quizActiveSignal()) {
      return;
    }

    const zone = this.currentZone();
    if (!zone) {
      return;
    }

    const correctIndex = zone.quiz.correctIndex;

    if (answerIndex === correctIndex) {
      // Réponse correcte
      this.addCoins(2);
      this.completeZone();
      this.quizFeedbackSignal.set('correct');
      this.quizActiveSignal.set(false);
      return;
    }

    // Réponse incorrecte → incrémenter les tentatives
    const newAttempts = this.quizAttemptsSignal() + 1;
    this.quizAttemptsSignal.set(newAttempts);

    if (newAttempts === 1) {
      // 1ère erreur → nouvelle tentative sans pénalité
      this.quizFeedbackSignal.set('incorrect');
      // quizActive reste true
    } else {
      // 2ème erreur → pénalité et recommencer la Zone
      this.addCoins(-1);
      this.quizFeedbackSignal.set('incorrect');
      this.quizActiveSignal.set(false);
      this.narrationEventSignal.set('Pénalité ! -1 Pièce. Recommence cette Zone.');
      this.isBlockingChoiceSignal.set(true);
    }
  }
}
