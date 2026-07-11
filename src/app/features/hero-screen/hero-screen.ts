import { ChangeDetectionStrategy, Component, output } from '@angular/core';

/**
 * Écran d'accueil immersif du jeu Harmony Escape Game.
 *
 * Présente l'histoire d'Harmony capturée par Bowser Junior
 * et invite le joueur à commencer l'aventure.
 */
@Component({
  selector: 'app-hero-screen',
  templateUrl: './hero-screen.html',
  styleUrl: './hero-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroScreen {
  readonly startGame = output<void>();

  protected onStartGame(): void {
    this.startGame.emit();
  }
}
