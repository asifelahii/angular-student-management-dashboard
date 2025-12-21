import { Routes } from '@angular/router';
import { AppShellLayout } from './shared/components/app-shell-layout/app-shell-layout';

export const routes: Routes = [
  {
    path: '',
    component: AppShellLayout,
    children: [
      // ✅ Redirect only for the empty URL
      { path: '', pathMatch: 'full', redirectTo: 'students' },

      // /login
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
      },

      // ✅ Put the more specific route first (good practice)
      // /students/:id
      {
        path: 'students/:id',
        loadComponent: () =>
          import('./features/students/pages/student-details-page/student-details-page').then(
            (m) => m.StudentDetailsPage
          ),
      },

      // /students
      {
        path: 'students',
        loadComponent: () =>
          import('./features/students/pages/students-list-page/students-list-page').then(
            (m) => m.StudentsListPage
          ),
      },

      // ✅ Wildcard last
      { path: '**', redirectTo: 'students' },
    ],
  },
];
