import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameEngineService } from '../../../core/services/game-engine';
import { CHARACTERS } from '../../../core/types';

/**
 * Scène de Game Over narrative affichée quand le joueur n'a plus de Pièces.
 *
 * Le joueur a épuisé ses Pièces et ne peut plus continuer l'aventure.
 * Ce composant affiche :
 * — Un texte narratif de Game Over sombre/dramatique
 * — Le score : nombre de Zones explorées (fallback à 0, sera enrichi à la Tâche 7)
 * — Le nom du Personnage qui a tenté l'aventure
 * — Un bouton "Retour au menu" qui navigue vers `/accueil` et efface la sauvegarde
 */
@Component({
  selector: 'app-game-over-screen',
  imports: [],
  templateUrl: './game-over-screen.html',
  styleUrl: './game-over-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverScreen {
  private readonly gameEngine = inject(GameEngineService);
  private readonly router = inject(Router);

  /** Identifiant du personnage qui a perdu */
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

  /**
   * Nombre de Zones explorées — connecté au vrai compteur depuis GameEngineService.
   */
  protected readonly zonesExplored = this.gameEngine.zonesExplored;

  /**
   * Narration de Game Over spécifique au personnage — connectée au champ
   * `gameOverNarration` du `CharacterPath` actif.
   */
  protected readonly gameOverNarration = computed(() => this.gameEngine.path().gameOverNarration ?? '');

  /**
   * Retour au menu principal — efface la sauvegarde et navigue vers `/accueil`.
   */
  protected onReturnToMenu(): void {
    this.gameEngine.returnToMenu();
    this.router.navigate(['/accueil']);
  }
}
