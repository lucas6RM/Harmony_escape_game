import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameEngineService } from '../../../core/services/game-engine';
import { PersistenceService } from '../../../core/services/persistence';
import { GameOverScreen } from '../game-over-screen/game-over-screen';
import { ZoneExplorer } from '../zone-explorer/zone-explorer';
import { VictoryScreen } from '../victory-screen/victory-screen';

/**
 * Shell du jeu — conteneur principal qui orchestre le démarrage de la partie
 * et affiche l'exploration de la Zone courante via `ZoneExplorer`.
 */
@Component({
  selector: 'app-game-shell',
  templateUrl: './game-shell.html',
  styleUrl: './game-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameOverScreen, ZoneExplorer, VictoryScreen],
})
export class GameShell implements OnInit {
  private readonly gameEngine = inject(GameEngineService);
  private readonly persistence = inject(PersistenceService);
  private readonly router = inject(Router);

  /** Nombre de Pièces accumulées par le joueur */
  readonly coins = this.gameEngine.coins;

  /** Nombre de Zones explorées par le joueur */
  readonly zonesExplored = this.gameEngine.zonesExplored;

  /** Indique si le jeu a été démarré (Chemin chargé) */
  readonly gameStarted = this.gameEngine.gameStarted;

  /** Indique si le Chemin est encore en cours de chargement */
  readonly loading = computed(() => !this.gameStarted() || this.gameEngine.pathLoading());

  /** Indique si le joueur a gagné la partie */
  readonly gameWon = this.gameEngine.gameWon;

  /** Indique si le joueur est en Game Over (Pièces < 0) */
  readonly gameOver = this.gameEngine.gameOver;

  ngOnInit(): void {
    const gameSave = this.persistence.getGameSave();
    if (!gameSave?.selectedCharacterId) {
      this.router.navigate(['/accueil']);
      return;
    }

    if (this.gameStarted() && this.gameEngine.characterId() === gameSave.selectedCharacterId) {
      return;
    }

    this.gameEngine.restoreGame(gameSave);
  }
}
