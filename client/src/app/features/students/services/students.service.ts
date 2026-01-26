import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, delay, map, of, tap, throwError } from 'rxjs';

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
              hnbr: String(100000 + user.id),
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

    // ✅ Build the student in a safe order:
    // - spread payload first
    // - then set id + hnbr to guarantee they exist even if payload has weird values
    const newStudent: Student = {
      ...payload,
      id: nextId,
      hnbr: payload.hnbr?.trim() ? payload.hnbr.trim() : String(100000 + nextId),
    };

    this.studentsCache = [newStudent, ...list];

    // Keep list page state updated (e.g. first 50)
    this.refreshStateFromCache(50);

    return newStudent;
  }

  updateStudent(id: number, changes: Omit<Student, 'id'>): Student | null {
    if (!this.studentsCache) return null;

    const existing = this.studentsCache.find((s) => s.id === id);
    if (!existing) return null;

    // ✅ Merge instead of replace:
    // This prevents losing fields like hnbr/avatarUrl when edit form doesn't send them.
    const updated: Student = {
      ...existing,
      ...changes,
      id, // force correct id
      hnbr: changes.hnbr?.trim() ? changes.hnbr.trim() : (existing.hnbr ?? String(100000 + id)),
    };

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

  /**
   * Issue #27: Create student via API (JSON request) end-to-end
   * Uses JSONPlaceholder as a backend stub (POST works, persistence is not real).
   */
  createStudentViaApi(payload: Omit<Student, 'id'>): Observable<Student> {
    // JSON payload contract (DTO-ish)
    const dto = {
      name: payload.name ?? '',
      email: payload.email,
      phone: payload.phone,
      hnbr: payload.hnbr,
      department: payload.department,
      semester: payload.semester,
      status: payload.status,
      avatarUrl: payload.avatarUrl,
    };

    return this.http.post<any>(this.USERS_API_URL, dto).pipe(
      map((res) => {
        // jsonplaceholder returns an id in the response (usually 11)
        const id = Number(res?.id ?? Date.now());

        const created: Student = {
          ...payload,
          id,
          hnbr: payload.hnbr?.trim() ? payload.hnbr.trim() : String(100000 + id),
        };

        // Update in-memory cache so list reflects the created record instantly
        const list = this.studentsCache ?? [];
        this.studentsCache = [created, ...list];
        this.refreshStateFromCache(50);

        return created;
      }),
      catchError((err) => {
        console.error('Create student API failed:', err);
        return throwError(() => err);
      }),
    );
  }
}
