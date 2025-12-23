import { Routes } from '@angular/router';
import { AppShellLayout } from './shared/components/app-shell-layout/app-shell-layout';

export const routes: Routes = [
  {
    path: '',
    component: AppShellLayout,
    loadChildren: () => import('./shared/app-shell/app-shell.routes').then((m) => m.appShellRoutes),
  },
];
