import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth-guard';

export const appShellRoutes: Routes = [
  // ✅ Redirect only for the empty URL
  { path: '', pathMatch: 'full', redirectTo: 'students' },

  // /login
  {
    path: 'login',
    loadComponent: () =>
      import('../../../features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
    data: { hideShell: true },
  },

  // /students/:id
  {
    path: 'students/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../../../features/students/pages/student-details-page/student-details-page').then(
        (m) => m.StudentDetailsPage
      ),
  },

  // /students
  {
    path: 'students',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../../../features/students/pages/students-list-page/students-list-page').then(
        (m) => m.StudentsListPage
      ),
  },

  // ✅ Wildcard last
  { path: '**', redirectTo: 'students' },
];
