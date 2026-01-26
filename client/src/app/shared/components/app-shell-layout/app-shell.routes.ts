import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth-guard';

export const appShellRoutes: Routes = [
  // ✅ Redirect only for the empty URL
  { path: '', pathMatch: 'full', redirectTo: 'students' },

  // /login
  {
    path: 'login',
    // canActivate: [authGuard],
    loadComponent: () =>
      import('../../../features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
    data: { hideShell: true },
  },

  // /students/add
  {
    path: 'students/add',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../../../features/students/pages/add-student-page/add-student-page').then(
        (m) => m.AddStudentPage,
      ),
  },

  // /students/:id/edit
  {
    path: 'students/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../../../features/students/pages/edit-student-page/edit-student-page').then(
        (m) => m.EditStudentPage,
      ),
  },

  // /students/:id
  {
    path: 'students/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../../../features/students/pages/student-details-page/student-details-page').then(
        (m) => m.StudentDetailsPage,
      ),
  },

  // /students
  {
    path: 'students',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../../../features/students/pages/students-list-page/students-list-page').then(
        (m) => m.StudentsListPage,
      ),
  },

  // ✅ Wildcard last
  { path: '**', redirectTo: 'students' },
];
