import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { input } from '@angular/core';

/**
 * Composant d'un seul Choix narratif.
 *
 * Affiche un bouton cliquable représentant un choix du joueur.
 * Utilisé par `ZoneExplorer` dans une boucle `@for`.
 *
 * Le style visuel change selon que le choix est bloquant ou non :
 * - bloquant : bordure rouge, icône ⚠️
 * - non bloquant : bordure bleue, style standard
 */
@Component({
  selector: 'app-narrative-choice',
  templateUrl: './narrative-choice.html',
  styleUrl: './narrative-choice.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NarrativeChoiceComponent {
  /** Texte du choix affiché au joueur */
  readonly text = input.required<string>();

  /** Si true, le choix est bloquant (mauvais chemin) — style visuel différent */
  readonly blocking = input(false, { transform: (v: boolean | undefined) => v ?? false });

  /** Index du choix dans la liste (pour l'appel au service) */
  readonly index = input.required<number>();

  /** Émis quand le joueur clique sur ce choix */
  readonly selected = output<number>();

  /**
   * Traite le clic du joueur et émet l'index du choix.
   */
  onClick(): void {
    this.selected.emit(this.index());
  }

  /** Texte aria-label descriptif pour l'accessibilité */
  protected getAriaLabel(): string {
    const num = this.index() + 1;
    const warning = this.blocking() ? ' (chemin risqué)' : '';
    return `Choix ${num}: ${this.text()}${warning}`;
  }
}
