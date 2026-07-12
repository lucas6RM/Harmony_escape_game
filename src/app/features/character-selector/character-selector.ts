import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { CHARACTERS, type Character } from '../../core/types';
import { CompletedPathsService } from '../../core/services/completed-paths/completed-paths.service';

/**
 * Grille de sélection des Personnages jouables.
 *
 * Affiche les 4 Personnages (Mario, Luigi, Peach, Daisy) sous forme
 * de cartes cliquables avec emoji, nom, résumé et couleur thématique.
 * Émet `characterSelected` avec l'identifiant du Personnage choisi.
 * Affiche un indicateur visuel sur les Chemins déjà complétés et un
 * Badge de complétion quand les 4 Chemins sont terminés.
 */
@Component({
  selector: 'app-character-selector',
  templateUrl: './character-selector.html',
  styleUrl: './character-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterSelector {
  private readonly completedPathsService = inject(CompletedPathsService);

  readonly characterSelected = output<string>();
  readonly badgeClicked = output<void>();

  protected readonly characters: Readonly<Character[]> = CHARACTERS;

  protected readonly completedPaths = computed(() =>
    this.completedPathsService.getCompletedPaths(),
  );

  protected readonly allCompleted = computed(() =>
    this.completedPathsService.getAllCompleted(),
  );

  protected isPathCompleted(characterId: string): boolean {
    return this.completedPathsService.isPathCompleted(characterId);
  }

  protected onSelectCharacter(characterId: string): void {
    this.characterSelected.emit(characterId);
  }

  protected onBadgeClicked(): void {
    this.badgeClicked.emit();
  }
}
