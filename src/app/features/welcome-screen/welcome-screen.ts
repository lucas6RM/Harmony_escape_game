import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CharacterPersistenceService } from '../../core/services/character-persistence';
import { CharacterSelector } from '../character-selector/character-selector';
import { HeroScreen } from '../hero-screen/hero-screen';

/**
 * Écran d'accueil qui orchestre le flux HeroScreen → CharacterSelector.
 *
 * Affiche d'abord le HeroScreen. Quand l'utilisateur clique sur
 * "Commencer l'aventure", le HeroScreen disparaît et le CharacterSelector
 * apparaît. Quand un personnage est sélectionné, le choix est sauvegardé
 * et le joueur est redirigé vers `/game`.
 */
@Component({
  selector: 'app-welcome-screen',
  templateUrl: './welcome-screen.html',
  styleUrl: './welcome-screen.css',
  imports: [HeroScreen, CharacterSelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeScreen {
  private readonly router = inject(Router);
  private readonly characterPersistence = inject(CharacterPersistenceService);

  /** `true` quand le HeroScreen a été fermé et qu'on affiche le CharacterSelector */
  protected readonly showSelector = signal(false);

  protected onStartGame(): void {
    this.showSelector.set(true);
  }

  protected onCharacterSelected(characterId: string): void {
    this.characterPersistence.saveCharacter(characterId as 'mario' | 'luigi' | 'peach' | 'daisy');
    this.router.navigate(['/game']);
  }
}
