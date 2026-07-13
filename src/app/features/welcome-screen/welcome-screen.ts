import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameEngineService } from '../../core/services/game-engine';
import { PersistenceService } from '../../core/services/persistence';
import { BadgeBonusScreen } from '../badge-bonus-screen/badge-bonus-screen';
import { CharacterSelector } from '../character-selector/character-selector';
import { HeroScreen } from '../hero-screen/hero-screen';
import { ResumeScreen } from '../resume-screen/resume-screen';

/**
 * Écran d'accueil qui orchestre le flux :
 * — si une partie est en cours → ResumeScreen
 * — sinon → HeroScreen → CharacterSelector
 * — si le Badge de complétion est cliqué → BadgeBonusScreen
 *
 * Au chargement, vérifie s'il existe une sauvegarde en cours via
 * `PersistenceService.isGameInProgress()`. Si oui, affiche l'écran de
 * reprise. Sinon, affiche le HeroScreen classique.
 */
@Component({
  selector: 'app-welcome-screen',
  templateUrl: './welcome-screen.html',
  styleUrl: './welcome-screen.css',
  imports: [ResumeScreen, HeroScreen, CharacterSelector, BadgeBonusScreen],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeScreen {
  private readonly router = inject(Router);
  private readonly gameEngine = inject(GameEngineService);
  private readonly persistence = inject(PersistenceService);

  /** `true` quand une sauvegarde en cours est détectée → on affiche le ResumeScreen */
  protected readonly showResume = signal(false);

  /** Identifiant du Personnage sauvegardé, transmis au ResumeScreen */
  protected readonly savedCharacterId = signal<string>('');

  /** `true` quand le HeroScreen a été fermé et qu'on affiche le CharacterSelector */
  protected readonly showSelector = signal(false);

  /** `true` quand le Badge de complétion a été cliqué → on affiche la scène bonus */
  protected readonly showBadgeBonus = signal(false);

  constructor() {
    if (this.persistence.isGameInProgress()) {
      const save = this.persistence.getGameSave();
      if (save?.selectedCharacterId) {
        this.showResume.set(true);
        this.savedCharacterId.set(save.selectedCharacterId);
      }
    }
  }

  /** L'utilisateur choisit de reprendre la partie sauvegardée */
  protected onResume(): void {
    this.router.navigate(['/game']);
  }

  /** L'utilisateur choisit de recommencer → on efface la sauvegarde et on affiche le HeroScreen */
  protected onNewGame(): void {
    this.gameEngine.returnToMenu();
    this.persistence.clearSave();
    this.showResume.set(false);
  }

  protected onStartGame(): void {
    this.showSelector.set(true);
  }

  protected onCharacterSelected(characterId: string): void {
    this.persistence.saveCharacter(characterId as 'mario' | 'luigi' | 'peach' | 'daisy');
    this.router.navigate(['/game']);
  }

  /** Le joueur clique sur le Badge de complétion → afficher la scène bonus */
  protected onBadgeClicked(): void {
    this.showBadgeBonus.set(true);
  }

  /** Le joueur ferme la scène bonus → revenir au CharacterSelector */
  protected onBadgeBonusClose(): void {
    this.showBadgeBonus.set(false);
  }
}
