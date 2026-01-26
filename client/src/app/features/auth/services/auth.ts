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
const STORAGE_EXPIRES_KEY = 'auth_expires_at';

@Injectable({ providedIn: 'root' })
export class Auth {
  private _token = signal<string | null>(null);
  private _user = signal<AuthUser | null>(null);
  private _expiresAt = signal<number | null>(null); // epoch ms

  token = this._token.asReadonly();
  user = this._user.asReadonly();

  isLoggedIn = computed(() => {
    const t = this._token();
    const exp = this._expiresAt();
    if (!t || !exp) return false;
    return Date.now() < exp;
  });

  // demo users (add admin too)
  private DUMMY_USERS: Array<{ email: string; password: string; user: AuthUser }> = [
    {
      email: 'student@demo.com',
      password: 'student123',
      user: { email: 'student@demo.com', name: 'Student User', role: 'student' },
    },
    {
      email: 'teacher@demo.com',
      password: 'teacher123',
      user: { email: 'teacher@demo.com', name: 'Teacher User', role: 'teacher' },
    },
    {
      email: 'admin@demo.com',
      password: 'admin123',
      user: { email: 'admin@demo.com', name: 'Admin User', role: 'admin' },
    },
  ];

  constructor() {
    this.restoreFromStorage();
  }

  /** convenience for interceptors */
  getAccessToken(): string | null {
    return this.isLoggedIn() ? this._token() : null;
  }

  login(email: string, password: string): LoginResult {
    const found = this.DUMMY_USERS.find((a) => a.email === email && a.password === password);
    if (!found) return { ok: false, error: 'Invalid email or password' };

    // mock JWT (JWT-ready shape) + expiry
    const mockToken = `mock-jwt-${found.user.role ?? 'user'}-${Date.now()}`;
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    this._token.set(mockToken);
    this._user.set(found.user);
    this._expiresAt.set(expiresAt);

    localStorage.setItem(STORAGE_TOKEN_KEY, mockToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(found.user));
    localStorage.setItem(STORAGE_EXPIRES_KEY, String(expiresAt));

    return { ok: true, user: found.user };
  }

  logout(): void {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_EXPIRES_KEY);

    this._token.set(null);
    this._user.set(null);
    this._expiresAt.set(null);
  }

  private restoreFromStorage(): void {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const userStr = localStorage.getItem(STORAGE_USER_KEY);
    const expStr = localStorage.getItem(STORAGE_EXPIRES_KEY);

    if (!token || !userStr || !expStr) return;

    const expiresAt = Number(expStr);
    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
      this.logout();
      return;
    }

    try {
      const user = JSON.parse(userStr) as AuthUser;
      this._token.set(token);
      this._user.set(user);
      this._expiresAt.set(expiresAt);
    } catch {
      this.logout();
    }
  }
}
