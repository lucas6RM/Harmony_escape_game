import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { GameEngineService } from '../../../core/services/game-engine';
import { PersistenceService } from '../../../core/services/persistence';
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
  imports: [ZoneExplorer, VictoryScreen],
})
export class GameShell implements OnInit {
  private readonly gameEngine = inject(GameEngineService);
  private readonly persistence = inject(PersistenceService);

  /** Nombre de Pièces accumulées par le joueur */
  readonly coins = this.gameEngine.coins;

  /** Indique si le jeu a été démarré (Chemin chargé) */
  readonly gameStarted = this.gameEngine.gameStarted;

  /** Indique si le Chemin est encore en cours de chargement */
  readonly loading = computed(() => !this.gameStarted());

  /** Indique si le joueur a gagné la partie */
  readonly gameWon = this.gameEngine.gameWon;

  ngOnInit(): void {
    const gameSave = this.persistence.getGameSave();
    if (gameSave) {
      this.gameEngine.restoreGame(gameSave);
    }
  }
}
