import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, delay, map, of, tap } from 'rxjs';

import { Student } from '../models/student/student.models';

type LoadState<T> =
  | { status: 'idle'; data: T }
  | { status: 'loading'; data: T }
  | { status: 'success'; data: T }
  | { status: 'error'; data: T; error: string };

@Injectable({ providedIn: 'root' })
export class StudentsService {
  // ---------------------------
  // Demo data helpers
  // ---------------------------
  departments = [
    'Computer Science',
    'Electrical',
    'Mechanical',
    'Civil',
    'Business',
    'English',
    'Arabic',
    'Bangla',
  ];

  studentStatus: Student['status'][] = ['Active', 'Inactive', 'Graduated'];

  private readonly USERS_API_URL = 'https://jsonplaceholder.typicode.com/users';
  private readonly AVATAR_API_URL = 'https://randomuser.me/portraits/men';

  // In-memory cache (shared across pages while app runs)
  private studentsCache: Student[] | null = null;

  // ---------------------------
  // UI State (Issue #11)
  // ---------------------------
  private readonly delayMs = 600;

  private readonly studentsStateSubject = new BehaviorSubject<LoadState<Student[]>>({
    status: 'idle',
    data: [],
  });

  /** List page can subscribe to this to show loading/empty/error states cleanly */
  studentsState$ = this.studentsStateSubject.asObservable();

  /** simulate error once (for acceptance criteria) */
  private failNext = false;
  failNextLoad() {
    this.failNext = true;
  }

  constructor(private http: HttpClient) {}

  // ---------------------------
  // Core fetch + cache
  // ---------------------------

  /** Loads and caches the full list once. Later calls use cache (no HTTP). */
  private ensureLoaded(): Observable<Student[]> {
    if (this.studentsCache) return of(this.studentsCache);

    return this.http.get<any[]>(this.USERS_API_URL).pipe(
      map((users) =>
        users.map(
          (user) =>
            ({
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              department: this.departments[user.id % this.departments.length],
              semester: (user.id % 12) + 1,
              status: this.studentStatus[user.id % this.studentStatus.length],
              avatarUrl: `${this.AVATAR_API_URL}/${user.id}.jpg`,
            }) as Student,
        ),
      ),
      tap((students) => (this.studentsCache = students)),
    );
  }

  /** Optional: clear in-memory cache */
  clearCache() {
    this.studentsCache = null;
    // keep UI state consistent too
    this.studentsStateSubject.next({ status: 'idle', data: [] });
  }

  // ---------------------------
  // Public APIs used by pages
  // ---------------------------

  /** Traditional getter: returns first n students (from cache) */
  getStudents(n: number): Observable<Student[]> {
    return this.ensureLoaded().pipe(map((list) => list.slice(0, n)));
  }

  /** Returns full list (from cache) */
  getAllStudents(): Observable<Student[]> {
    return this.ensureLoaded();
  }

  /** Cache-first lookup (works for added/edited/deleted students too) */
  getStudentById(id: number): Observable<Student | null> {
    if (this.studentsCache) {
      return of(this.studentsCache.find((s) => s.id === id) ?? null);
    }
    return this.ensureLoaded().pipe(map((list) => list.find((s) => s.id === id) ?? null));
  }

  // ---------------------------
  // Issue #11: load with UI states
  // ---------------------------

  /**
   * Triggers state updates:
   * - emits loading immediately
   * - after delay emits success([]) or success(data)
   * - can simulate error once via failNextLoad()
   */
  loadStudents(limit: number) {
    const current = this.studentsStateSubject.value.data;
    this.studentsStateSubject.next({ status: 'loading', data: current });

    // simulate error once
    if (this.failNext) {
      this.failNext = false;
      of(null)
        .pipe(delay(this.delayMs))
        .subscribe(() => {
          this.studentsStateSubject.next({
            status: 'error',
            data: current,
            error: 'Simulated fetch error. Please try again.',
          });
        });
      return;
    }

    this.ensureLoaded()
      .pipe(
        map((list) => list.slice(0, limit)),
        delay(this.delayMs),
        catchError((err) => {
          console.error(err);
          this.studentsStateSubject.next({
            status: 'error',
            data: current,
            error: 'Failed to load students.',
          });
          return of([] as Student[]);
        }),
      )
      .subscribe((students) => {
        this.studentsStateSubject.next({ status: 'success', data: students });
      });
  }

  /** Helper: update the state from cache after local mutations (add/edit/delete). */
  private refreshStateFromCache(limit: number) {
    const list = this.studentsCache ?? [];
    this.studentsStateSubject.next({ status: 'success', data: list.slice(0, limit) });
  }

  // ---------------------------
  // Mutations: add / update / delete
  // ---------------------------

  addStudent(payload: Omit<Student, 'id'>): Student {
    const list = this.studentsCache ?? [];

    const nextId = list.length > 0 ? Math.max(...list.map((s) => s.id)) + 1 : 1;
    const newStudent: Student = { id: nextId, ...payload };

    this.studentsCache = [newStudent, ...list];

    // If list page is showing state, keep it updated (show first 50 by default)
    this.refreshStateFromCache(50);

    return newStudent;
  }

  updateStudent(id: number, changes: Omit<Student, 'id'>): Student | null {
    if (!this.studentsCache) return null;

    const exists = this.studentsCache.some((s) => s.id === id);
    if (!exists) return null;

    const updated: Student = { id, ...changes };
    this.studentsCache = this.studentsCache.map((s) => (s.id === id ? updated : s));

    this.refreshStateFromCache(50);

    return updated;
  }

  /** Deletes a student from cache. Returns true if deleted, false if not found. */
  deleteStudent(id: number): boolean {
    if (!this.studentsCache) return false;

    const before = this.studentsCache.length;
    this.studentsCache = this.studentsCache.filter((s) => s.id !== id);

    const deleted = this.studentsCache.length !== before;

    if (deleted) {
      this.refreshStateFromCache(50);
    }

    return deleted;
  }
}
