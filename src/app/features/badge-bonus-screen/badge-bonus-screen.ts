import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CHARACTERS, type Character } from '../../core/types';

/**
 * Scène bonus affichée après l'obtention du Badge de complétion.
 *
 * Célèbre l'exploit du joueur qui a terminé les 4 Chemins :
 * narration festive, les 4 Personnages alignés, et un bouton
 * « Retour à la sélection » qui émet `close`.
 */
@Component({
  selector: 'app-badge-bonus-screen',
  templateUrl: './badge-bonus-screen.html',
  styleUrl: './badge-bonus-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeBonusScreen {
  readonly close = output<void>();

  protected readonly characters: Readonly<Character[]> = CHARACTERS;

  protected onClose(): void {
    this.close.emit();
  }
}
