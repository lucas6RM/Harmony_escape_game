import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CHARACTERS, type Character } from '../../core/types';

/**
 * Grille de sélection des Personnages jouables.
 *
 * Affiche les 4 Personnages (Mario, Luigi, Peach, Daisy) sous forme
 * de cartes cliquables avec emoji, nom, résumé et couleur thématique.
 * Émet `characterSelected` avec l'identifiant du Personnage choisi.
 */
@Component({
  selector: 'app-character-selector',
  templateUrl: './character-selector.html',
  styleUrl: './character-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterSelector {
  readonly characterSelected = output<string>();

  protected readonly characters: Readonly<Character[]> = CHARACTERS;

  protected onSelectCharacter(characterId: string): void {
    this.characterSelected.emit(characterId);
  }
}
