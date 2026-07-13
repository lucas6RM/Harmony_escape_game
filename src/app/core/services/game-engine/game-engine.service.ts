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
 * Pièces accumulées, événements narratifs (choix bloquants, conséquences),
 * et l'orchestration de la navigation entre Zones.
 */
@Injectable({ providedIn: 'root' })
export class GameEngineService {
  private readonly http = inject(HttpClient);
  private readonly persistenceService = inject(PersistenceService);
  private readonly completedPathsService = inject(CompletedPathsService);

  // ── État interne ────────────────────────────────────────────────

  private readonly pathDataSignal = signal<CharacterPath>({ character: 'mario', zones: [] });
  private readonly pathLoadingSignal = signal<boolean>(false);

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
  private readonly zonesCompletedSignal = signal<number[]>([]);
  private readonly gameWonSignal = signal<boolean>(false);

  // ── Accès public (Signals) ──────────────────────────────────────

  /** Index de la Zone courante dans le Chemin du personnage */
  readonly currentZoneIndex: Signal<number> = this.currentZoneIndexSignal;

  /** La Zone courante (ou `null` si le jeu n'est pas démarré) */
  readonly currentZone: Signal<Zone | null> = computed(() => {
    const path = this.pathDataSignal();
    if (!path || path.zones.length === 0) {
      return null;
    }
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

  /** Indices des Zones déjà terminées par le joueur */
  readonly zonesCompleted: Signal<number[]> = this.zonesCompletedSignal;

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
    this.currentZoneIndexSignal.set(0);
    this.coinsSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.narrationEventSignal.set(null);
    this.isBlockingChoiceSignal.set(false);
    this.zonesCompletedSignal.set([]);
    this.gameWonSignal.set(false);
    this.gameStartedSignal.set(true);
    this.loadPathFromHttp(characterId);
    this.saveGameState();
  }

  private loadPathFromHttp(characterId: string): void {
    this.http.get<RawCharacterPath>(`assets/content/${characterId}.json`).subscribe({
      next: (rawPath) => {
        this.pathDataSignal.set({
          character: rawPath.character,
          zones: rawPath.zones as Zone[],
        });
        this.pathLoadingSignal.set(false);
      },
      error: () => {
        this.pathDataSignal.set({ character: characterId as 'mario' | 'luigi' | 'peach' | 'daisy', zones: [] });
        this.pathLoadingSignal.set(false);
      },
    });
  }

  /**
   * Restaure un état de jeu sauvegardé et reprend la partie là où elle s'était arrêtée.
   *
   * Charge le Chemin du Personnage sauvegardé, restaure la progression
   * (Zone courante, Pièces, tentatives de Quiz, Zones terminées) et
   * réinitialise les signaux de session (événement narratif, Quiz actif, aides).
   *
   * @param gameSave - État sauvegardé à restaurer
   */
  restoreGame(gameSave: GameSave): void {
    if (!gameSave.selectedCharacterId) {
      return;
    }

    this.pathLoadingSignal.set(true);
    this.currentZoneIndexSignal.set(gameSave.currentZoneIndex);
    this.coinsSignal.set(gameSave.coins);
    this.quizAttemptsSignal.set(gameSave.quizAttempts);
    this.zonesCompletedSignal.set([...gameSave.zonesCompleted]);
    this.isZoneCompletedSignal.set(false);
    this.narrationEventSignal.set(null);
    this.isBlockingChoiceSignal.set(false);
    this.quizActiveSignal.set(false);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.gameStartedSignal.set(true);
    this.loadPathFromHttp(gameSave.selectedCharacterId);
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
    const path = this.pathDataSignal();
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
      this.saveGameState();
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
   * Déclenche automatiquement une sauvegarde de la progression.
   */
  completeZone(): void {
    this.isZoneCompletedSignal.set(true);
    const currentZoneIndex = this.currentZoneIndexSignal();
    this.zonesCompletedSignal.update(
      completed => completed.includes(currentZoneIndex)
        ? completed
        : [...completed, currentZoneIndex],
    );
    this.saveGameState();
  }

  /**
   * Sauvegarde l'état actuel du jeu via le PersistenceService.
   */
  private saveGameState(): void {
    this.persistenceService.saveGame({
      currentZoneIndex: this.currentZoneIndexSignal(),
      coins: this.coinsSignal(),
      quizAttempts: this.quizAttemptsSignal(),
      zonesCompleted: this.zonesCompletedSignal(),
    });
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
   * Retour au menu principal — réinitialise tout l'état du jeu
   * et efface la sauvegarde.
   */
  returnToMenu(): void {
    this.pathDataSignal.set({ character: 'mario', zones: [] });
    this.pathLoadingSignal.set(false);
    this.currentZoneIndexSignal.set(0);
    this.coinsSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.narrationEventSignal.set(null);
    this.isBlockingChoiceSignal.set(false);
    this.gameStartedSignal.set(false);
    this.quizActiveSignal.set(false);
    this.quizAttemptsSignal.set(0);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.zonesCompletedSignal.set([]);
    this.gameWonSignal.set(false);
    this.persistenceService.clearSave();
  }

  /**
   * Retour à la sélection de personnage — réinitialise l'état du jeu
   * sans effacer les Chemins complétés.
   *
   * Utilisé après une victoire : le joueur retourne à la sélection
   * pour choisir un autre personnage, mais ses Chemins terminés
   * restent enregistrés.
   */
  returnToCharacterSelect(): void {
    this.pathDataSignal.set({ character: 'mario', zones: [] });
    this.pathLoadingSignal.set(false);
    this.currentZoneIndexSignal.set(0);
    this.coinsSignal.set(0);
    this.isZoneCompletedSignal.set(false);
    this.narrationEventSignal.set(null);
    this.isBlockingChoiceSignal.set(false);
    this.gameStartedSignal.set(false);
    this.quizActiveSignal.set(false);
    this.quizAttemptsSignal.set(0);
    this.quizFeedbackSignal.set(null);
    this.hintTextSignal.set(null);
    this.eliminatedAnswersSignal.set([]);
    this.zonesCompletedSignal.set([]);
    this.gameWonSignal.set(false);
    this.persistenceService.clearSave();
  }

  /**
   * Recommence la partie avec le même personnage — réinitialise
   * la progression mais garde le Chemin chargé.
   */
  restartGame(): void {
    const characterId = this.pathDataSignal().character;
    if (characterId) {
      this.startGame(characterId);
    }
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

      // Vérifier si c'est le Quiz final → victoire !
      if (zone.quiz.isFinal) {
        this.gameWonSignal.set(true);
        this.completedPathsService.addCompletedPath(this.characterId());
      }

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

      // Message adapté selon qu'il s'agit du Quiz final ou non
      if (zone.quiz.isFinal) {
        this.narrationEventSignal.set(
          'Presque là ! -1 Pièce. Bowser Junior rit, mais tu peux le battre — recommence cette Zone !',
        );
      } else {
        this.narrationEventSignal.set('Pénalité ! -1 Pièce. Recommence cette Zone.');
      }
      this.isBlockingChoiceSignal.set(true);
    }
  }
}
