import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameEngineService } from '../../../core/services/game-engine';
import { CHARACTERS } from '../../../core/types';

/**
 * Scène de victoire narrative affichée après la réussite du Quiz final.
 *
 * Le joueur a libéré Harmony ! Ce composant affiche :
 * — Un texte narratif de victoire
 * — Le score final (nombre total de Pièces gagnées)
 * — Le nom du Personnage qui a accompli l'aventure
 * — Deux boutons : retourner au menu principal ou recommencer la partie
 */
@Component({
  selector: 'app-victory-screen',
  imports: [],
  templateUrl: './victory-screen.html',
  styleUrl: './victory-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VictoryScreen {
  private readonly gameEngine = inject(GameEngineService);
  private readonly router = inject(Router);

  /** Nombre total de Pièces accumulées par le joueur */
  readonly coins = this.gameEngine.coins;

  /** Identifiant du personnage qui a gagné */
  readonly characterId = this.gameEngine.characterId;

  /** Nom affiché du personnage */
  protected readonly characterName = computed(() => {
    const id = this.characterId();
    const character = CHARACTERS.find(c => c.id === id);
    return character?.name ?? 'Héros';
  });

  /** Emoji du personnage */
  protected readonly characterEmoji = computed(() => {
    const id = this.characterId();
    const character = CHARACTERS.find(c => c.id === id);
    return character?.emoji ?? '⭐';
  });

  /** Retour au menu principal — efface la sauvegarde et navigue */
  protected onReturnToMenu(): void {
    this.gameEngine.returnToMenu();
    this.router.navigate(['/accueil']);
  }

  /** Recommence la partie avec le même personnage */
  protected onRestartGame(): void {
    this.gameEngine.restartGame();
  }
}
