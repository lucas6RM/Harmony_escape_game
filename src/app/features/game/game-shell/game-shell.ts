import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Shell du jeu — placeholder jusqu'à l'implémentation des Zones et Quiz.
 */
@Component({
  selector: 'app-game-shell',
  templateUrl: './game-shell.html',
  styleUrl: './game-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameShell {}
