import { computed, inject, Injectable, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CompletedPathsService } from '../completed-paths/completed-paths.service';
import { PersistenceService } from '../persistence';
import type { CharacterPath, GameSave, NarrativeChoice, RawCharacterPath, Zone } from '../../types';
import { HINT_COSTS } from '../../types';

/**
 * Service central du moteur de jeu.
 *
 * Gère l'état de la partie : Zone courante, progression dans le Chemin,
 * Pièces accumulées, et l'orchestration de la navigation entre Zones
 * via l'arbre de décision (Choix narratifs → nextZoneId).
 */
@Injectable({ providedIn: 'root' })
export class GameEngineService {
  private readonly http = inject(HttpClient);
  private readonly persistenceService = inject(PersistenceService);
  private readonly completedPathsService = inject(CompletedPathsService);

  // ── État interne ────────────────────────────────────────────────

  private readonly pathDataSignal = signal<CharacterPath>({ character: 'mario', startZoneId: '', zones: {} });
  private readonly pathLoadingSignal = signal<boolean>(false);

  private readonly currentZoneIdSignal = signal<string>('');
  private readonly currentQuizIndexSignal = signal<number>(0);
  private readonly coinsSignal = signal<number>(0);
  private readonly isZoneCompletedSignal = signal<boolean>(false);
  private readonly gameStartedSignal = signal<boolean>(false);

  private readonly quizActiveSignal = signal<boolean>(false);
  private readonly quizFeedbackSignal = signal<'correct' | 'incorrect' | null>(null);

  private readonly hintTextSignal = signal<string | null>(null);
  private readonly eliminatedAnswersSignal = signal<number[]>([]);
  private readonly gameWonSignal = signal<boolean>(false);

  // ── Accès public (Signals) ──────────────────────────────────────

  /** Identifiant de la Zone courante dans le Chemin du personnage */
  readonly currentZoneId: Signal<string> = this.currentZoneIdSignal;

  /** Index du Quiz courant dans la Zone courante */
  readonly currentQuizIndex: Signal<number> = this.currentQuizIndexSignal;

  /** La Zone courante (ou `null` si le jeu n'est pas démarré) */
  readonly currentZone: Signal<Zone | null> = computed(() => {
    const path = this.pathDataSignal();
    if (!path || !path.zones || Object.keys(path.zones).length === 0) {
      return null;
    }
    const zoneId = this.currentZoneIdSignal();
    return path.zones[zoneId] ?? null;
  });

  /** Le Quiz courant dans la Zone courante (ou `null`) */
  readonly currentQuiz = computed(() => {
    const zone = this.currentZone();
    const quizIdx = this.currentQuizIndexSignal();
    if (!zone || !zone.quizzes || quizIdx >= zone.quizzes.length) {
      return null;
    }
    return zone.quizzes[quizIdx];
  });

  /** Nombre de Quiz restants dans la Zone courante */
  readonly quizzesRemaining = computed(() => {
    const zone = this.currentZone();
    const quizIdx = this.currentQuizIndexSignal();
    if (!zone || !zone.quizzes) {
      return 0;
    }
    return zone.quizzes.length - quizIdx;
  });

  /** Nombre de Pièces accumulées par le joueur */
  readonly coins: Signal<number> = this.coinsSignal;

  /** Indique si la Zone courante est terminée (quiz réussi) */
  readonly isZoneCompleted: Signal<boolean> = this.isZoneCompletedSignal;

  /** Indique si le jeu a été démarré */
  readonly gameStarted: Signal<boolean> = this.gameStartedSignal;

  /** Indique si le Quiz est actuellement affiché (après un choix narratif valide) */
  readonly quizActive: Signal<boolean> = this.quizActiveSignal;

  /** Feedback visuel après une réponse au Quiz */
  readonly quizFeedback: Signal<'correct' | 'incorrect' | null> = this.quizFeedbackSignal;

  /** Texte de l'Indice acheté (ou `null` si aucun Indice acheté) */
  readonly hintText: Signal<string | null> = this.hintTextSignal;

  /** Indices des réponses éliminées (ou tableau vide si aucune élimination) */
  readonly eliminatedAnswers: Signal<number[]> = this.eliminatedAnswersSignal;

  /** Indique si le joueur a gagné la partie (Quiz final réussi) */
  readonly gameWon: Signal<boolean> = this.gameWonSignal;

  /** Indique si le Chemin est encore en cours de chargement asynchrone */
  readonly pathLoading: Signal<boolean> = this.pathLoadingSignal;

  /** Indique si tous les Chemins (4 personnages) sont complétés */
  readonly allPathsCompleted: Signal<boolean> = computed(
    () => this.completedPathsService.getAllCompleted(),
  );

  /** Le Chemin complet du personnage (pour itérer sur les Zones) */
  readonly path: Signal<CharacterPath> = this.pathDataSignal;

  /** Identifiant du personnage en cours de partie */
  readonly characterId: Signal<string> = computed(() => this.pathDataSignal().character);

  // ── Méthodes publiques ──────────────────────────────────────────

  /**
   * Initialise le jeu en chargeant le Chemin du personnage sélectionné.
   *
   * @param characterId - Identifiant du Personnage (`mario`, `luigi`, `peach`, `daisy`)
   */
  startGame(characterId: string): void {
    this.pathLoadingSignal.set(true);
    this.currentZoneIdSignal.set('');
    this.currentQuizIndexSignal.set(0);
    this.coinsSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.gameWonSignal.set(false);
    this.gameStartedSignal.set(true);
    this.quizActiveSignal.set(true);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.loadPathFromHttp(characterId);
    this.saveGameState();
  }

  private loadPathFromHttp(characterId: string, overrideZoneId?: string, isRestore = false): void {
    this.http.get<RawCharacterPath>(`assets/content/${characterId}.json`).subscribe({
      next: (rawPath) => {
        const resolvedZones: { [zoneId: string]: Zone } = {};
        for (const [zoneId, zone] of Object.entries(rawPath.zones)) {
          resolvedZones[zoneId] = zone;
        }
        this.pathDataSignal.set({
          character: rawPath.character,
          startZoneId: rawPath.startZoneId,
          zones: resolvedZones,
        });
        if (overrideZoneId) {
          this.currentZoneIdSignal.set(overrideZoneId);
        } else {
          this.currentZoneIdSignal.set(rawPath.startZoneId);
        }
        if (!isRestore) {
          this.currentQuizIndexSignal.set(0);
        }
        this.pathLoadingSignal.set(false);
      },
      error: () => {
        this.pathDataSignal.set({ character: characterId as 'mario' | 'luigi' | 'peach' | 'daisy', startZoneId: '', zones: {} });
        this.pathLoadingSignal.set(false);
      },
    });
  }

  /**
   * Restaure un état de jeu sauvegardé et reprend la partie là où elle s'était arrêtée.
   *
   * @param gameSave - État sauvegardé à restaurer
   */
  restoreGame(gameSave: GameSave): void {
    if (!gameSave.selectedCharacterId) {
      return;
    }

    this.pathLoadingSignal.set(true);
    this.currentQuizIndexSignal.set(gameSave.quizIndex);
    this.coinsSignal.set(gameSave.coins);
    this.isZoneCompletedSignal.set(false);
    this.quizActiveSignal.set(true);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.gameStartedSignal.set(true);
    this.loadPathFromHttp(gameSave.selectedCharacterId, gameSave.currentZoneId, true);
  }

  /**
   * Traite un Choix narratif sélectionné par le joueur.
   *
   * Le choix navigue vers la Zone suivante via `nextZoneId`.
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

    // Navigation vers la Zone suivante via nextZoneId
    this.navigateToZone(choice.nextZoneId);
  }

  /**
   * Navigue vers une Zone identifiée par son ID.
   *
   * Réinitialise l'état du Quiz (quizIndex à 0, aides, feedback)
   * et affiche le premier Quiz de la nouvelle Zone.
   *
   * @param nextZoneId - Identifiant de la Zone cible
   */
  navigateToZone(nextZoneId: string): void {
    this.currentZoneIdSignal.set(nextZoneId);
    this.currentQuizIndexSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.quizActiveSignal.set(true);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.saveGameState();
  }

  /**
   * Passe au Quiz suivant dans la Zone courante.
   *
   * Si tous les quizzes de la Zone sont complétés (quizIndex >= quizzes.length),
   * les choix narratifs s'affichent automatiquement (géré par le composant UI).
   */
  advanceQuiz(): void {
    const zone = this.currentZone();
    if (!zone) {
      return;
    }
    const currentIdx = this.currentQuizIndexSignal();
    if (currentIdx < zone.quizzes.length - 1) {
      this.currentQuizIndexSignal.set(currentIdx + 1);
      this.isZoneCompletedSignal.set(false);
      this.quizActiveSignal.set(true);
      this.quizFeedbackSignal.set(null);
      this.hintTextSignal.set(null);
      this.eliminatedAnswersSignal.set([]);
      this.saveGameState();
    } else {
      this.isZoneCompletedSignal.set(true);
      this.quizActiveSignal.set(false);
      this.quizFeedbackSignal.set(null);
      this.hintTextSignal.set(null);
      this.eliminatedAnswersSignal.set([]);
      this.saveGameState();
    }
  }

  /**
   * Continue après avoir terminé tous les Quiz d'une Zone.
   * Réinitialise le feedback et affiche les choix narratifs.
   */
  continueAfterZone(): void {
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.isZoneCompletedSignal.set(false);
    this.saveGameState();
  }

  /**
   * Recommence la Zone courante — reset uniquement l'état du Quiz.
   *
   * Ne change pas la Zone courante ni la narration affichée.
   */
  restartZone(): void {
    this.currentQuizIndexSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.quizActiveSignal.set(true);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
  }

  /**
   * Marque le Quiz courant comme terminé (quiz réussi).
   *
   * Si c'est le dernier quiz de la Zone, marque isZoneCompleted = true.
   * Si le quiz est final (isFinal: true), déclenche gameWon.
   */
  completeQuiz(): void {
    const zone = this.currentZone();
    if (!zone) {
      return;
    }
    const currentIdx = this.currentQuizIndexSignal();
    if (currentIdx >= zone.quizzes.length - 1) {
      this.isZoneCompletedSignal.set(true);
    }
  }

  /**
   * Sauvegarde l'état actuel du jeu via le PersistenceService.
   */
  private saveGameState(): void {
    this.persistenceService.saveGame({
      currentZoneId: this.currentZoneIdSignal(),
      quizIndex: this.currentQuizIndexSignal(),
      coins: this.coinsSignal(),
    });
  }

  /**
   * Ajoute des Pièces au total du joueur (clampé à 0).
   *
   * @param amount - Nombre de Pièces à ajouter
   */
  addCoins(amount: number): void {
    this.coinsSignal.update(current => Math.max(0, current + amount));
  }

  /**
   * Achète un Indice textuel pendant un Quiz.
   *
   * Coûte 1 Pièce.
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
      return false;
    }
    const quiz = this.currentQuiz();
    if (!quiz) {
      return false;
    }
    let hint: string;
    if (quiz.hintText) {
      hint = quiz.hintText;
    } else {
      const correctAnswer = quiz.answers[quiz.correctIndex];
      const preview = correctAnswer.slice(0, Math.min(3, correctAnswer.length));
      hint = `Indice : la réponse commence par '${preview}...'`;
    }
    this.coinsSignal.update(c => c - cost);
    this.hintTextSignal.set(hint);
    return true;
  }

  /**
   * Achète l'élimination de 2 fausses réponses pendant un Quiz.
   *
   * Coûte 2 Pièces.
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
      return false;
    }
    const quiz = this.currentQuiz();
    if (!quiz) {
      return false;
    }
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== quiz.correctIndex);
    const toEliminate = incorrectIndices.slice(0, 2);
    this.coinsSignal.update(c => c - cost);
    this.eliminatedAnswersSignal.set(toEliminate);
    return true;
  }

  /**
   * Retour au menu principal — réinitialise tout l'état du jeu
   * et efface la sauvegarde.
   */
  returnToMenu(): void {
    this.pathDataSignal.set({ character: 'mario', startZoneId: '', zones: {} });
    this.pathLoadingSignal.set(false);
    this.currentZoneIdSignal.set('');
    this.currentQuizIndexSignal.set(0);
    this.coinsSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.gameStartedSignal.set(false);
    this.quizActiveSignal.set(false);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.gameWonSignal.set(false);
    this.persistenceService.clearSave();
  }

  /**
   * Retour à la sélection de personnage — réinitialise l'état du jeu
   * sans effacer les Chemins complétés.
   */
  returnToCharacterSelect(): void {
    this.pathDataSignal.set({ character: 'mario', startZoneId: '', zones: {} });
    this.pathLoadingSignal.set(false);
    this.currentZoneIdSignal.set('');
    this.currentQuizIndexSignal.set(0);
    this.coinsSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.gameStartedSignal.set(false);
    this.quizActiveSignal.set(false);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.gameWonSignal.set(false);
    this.persistenceService.clearSave();
  }

  /**
   * Recommence la partie avec le même personnage.
   */
  restartGame(): void {
    if (!this.gameStartedSignal()) {
      return;
    }
    const characterId = this.pathDataSignal().character;
    this.startGame(characterId);
  }

  /**
   * Soumet une réponse au Quiz en cours.
   *
   * - Réponse correcte : +2 Pièces, avance au Quiz suivant ou termine la Zone.
   * - Réponse incorrecte : -1 Pièce, pénalité, Quiz à rejouer.
   *
   * @param answerIndex - Index de la réponse sélectionnée (0-3)
   */
  submitQuizAnswer(answerIndex: number): void {
    if (!this.quizActiveSignal()) {
      return;
    }

    const quiz = this.currentQuiz();
    if (!quiz) {
      return;
    }

    const correctIndex = quiz.correctIndex;

    if (answerIndex === correctIndex) {
      // Réponse correcte
      this.addCoins(2);
      this.completeQuiz();
      this.quizFeedbackSignal.set('correct');
      this.quizActiveSignal.set(false);

      return;
    }

    // Réponse incorrecte → -1 Pièce et recommencer le Quiz
    this.addCoins(-1);
    this.quizFeedbackSignal.set('incorrect');
    this.quizActiveSignal.set(false);
  }
}
