import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CHARACTERS } from '../../core/types/character';

/**
 * Écran de reprise de partie.
 *
 * S'affiche quand le joueur revient sur l'application et qu'une
 * partie est en cours. Propose de reprendre la progression ou
 * de recommencer une nouvelle partie.
 */
@Component({
  selector: 'app-resume-screen',
  templateUrl: './resume-screen.html',
  styleUrl: './resume-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumeScreen {
  /** Identifiant du Personnage sauvegardé */
  readonly characterId = input.required<string>();

  /** Émis quand le joueur choisit de reprendre la partie */
  readonly resume = output<void>();

  /** Émis quand le joueur choisit de recommencer une nouvelle partie */
  readonly newGame = output<void>();

  /** Nom du Personnage trouvé dans le tableau CHARACTERS */
  protected readonly characterName = computed(() => {
    const character = CHARACTERS.find(
      (c) => c.id === this.characterId(),
    );
    return character?.name ?? 'l\'aventurier';
  });

  /** Emoji du Personnage trouvé dans le tableau CHARACTERS */
  protected readonly characterEmoji = computed(() => {
    const character = CHARACTERS.find(
      (c) => c.id === this.characterId(),
    );
    return character?.emoji ?? '🌟';
  });

  protected onResume(): void {
    this.resume.emit();
  }

  protected onNewGame(): void {
    this.newGame.emit();
  }
}
