import { computed, Injectable, signal } from '@angular/core';

export type UserRole = 'student' | 'teacher' | 'admin';

export type AuthUser = {
  email: string;
  name: string;
  role?: UserRole;
};

type LoginResult = { ok: true; user: AuthUser } | { ok: false; error: string };

const STORAGE_TOKEN_KEY = 'auth_token';
const STORAGE_USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class Auth {
  // in-memory signals
  private _token = signal<string | null>(null);
  private _user = signal<AuthUser | null>(null);

  // Readonly signals
  token = this._token.asReadonly();
  user = this._user.asReadonly();

  // Derived State: loggedin if token exist
  isLoggedIn = computed(() => !!this._token());

  // demo users
  private DUMMY_USERS: Array<{ email: string; password: string; user: AuthUser }> = [
    {
      email: 'student@demo.com',
      password: 'student123',
      user: {
        email: 'student@demo.com',
        name: 'Student User',
        role: 'student',
      },
    },
    {
      email: 'teacher@demo.com',
      password: 'teacher123',
      user: {
        email: 'teacher@demo.com',
        name: 'Teacher User',
        role: 'teacher',
      },
    },
  ];

  constructor() {
    // for restoring state after page reload
    this.restoreFromStorage();
  }

  // Login
  login(email: string, password: string): LoginResult {
    const userFound = this.DUMMY_USERS.find(
      (account) => account.email === email && account.password === password
    );

    if (!userFound) {
      return { ok: false, error: 'Invalid email or password' };
    }

    // mock token
    const mockToken = `mock-token-${userFound.user.role ?? 'user'}-${Date.now()}`;

    // update reactive state
    this._token.set(mockToken);
    this._user.set(userFound.user);

    // persist in storage
    localStorage.setItem(STORAGE_TOKEN_KEY, mockToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userFound.user));

    return { ok: true, user: userFound.user };
  }

  // Logout
  logout(): void {
    // clear persistense
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);

    // clear reactive state
    this._token.set(null);
    this._user.set(null);
  }

  private restoreFromStorage(): void {
    const mock_token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const mock_user = localStorage.getItem(STORAGE_USER_KEY);

    if (mock_token && mock_user) {
      try {
        const userFound = JSON.parse(mock_user) as AuthUser;

        // restore state
        this._token.set(mock_token);
        this._user.set(userFound);
      } catch {
        // if corrupted data, clear storage to avoid weird state

        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
  }
}
