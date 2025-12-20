import { Routes } from '@angular/router';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { SignupPage } from './features/auth/pages/signup-page/signup-page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/pages/signup-page/signup-page').then((m) => m.SignupPage),
  },

  //   {
  //     path: 'signup',
  //     component: SignupPage,
  //   },
];
