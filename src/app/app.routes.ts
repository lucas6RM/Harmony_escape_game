import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'accueil',
    pathMatch: 'full',
  },
  {
    path: 'accueil',
    loadComponent: () =>
      import('./features/welcome-screen/welcome-screen').then(
        (m) => m.WelcomeScreen,
      ),
  },
  {
    path: 'game',
    loadComponent: () =>
      import('./features/game/game-shell/game-shell').then(
        (m) => m.GameShell,
      ),
  },
];

export { routes };
