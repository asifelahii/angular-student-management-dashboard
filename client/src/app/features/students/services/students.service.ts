import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';

import { Student } from '../models/student/student.models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
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

  studentStatus = ['Active', 'Inactive', 'Graduated'];

  private USERS_API_URL = 'https://jsonplaceholder.typicode.com/users';
  private AVATAR_API_URL = 'https://randomuser.me/portraits/men';

  private studentsCache: Student[] | null = null;

  constructor(private http: HttpClient) {}

  getStudentById(id: number): Observable<Student | null> {
    // ✅ 1) Try cache first (fast, no HTTP)
    if (this.studentsCache) {
      return of(this.studentsCache.find((s) => s.id === id) ?? null);
    }

    // ✅ 2) If cache empty, fetch once, then find
    return this.getStudents(50).pipe(map((students) => students.find((s) => s.id === id) ?? null));
  }

  getStudents(n: number): Observable<Student[]> {
    return this.ensureLoaded().pipe(map((list) => list.slice(0, n)));
  }

  getAllStudents(): Observable<Student[]> {
    return this.ensureLoaded();
  }

  // Optional helper (useful later for logout / refresh)
  clearCache() {
    this.studentsCache = null;
  }

  // cache + helper
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
              status: this.studentStatus[user.id % this.studentStatus.length] as
                | 'Active'
                | 'Inactive'
                | 'Graduated',
              avatarUrl: `${this.AVATAR_API_URL}/${user.id}.jpg`,
            } as Student)
        )
      ),
      tap((students) => (this.studentsCache = students))
    );
  }

  addStudent(payload: Omit<Student, 'id'>): Student {
    const list = this.studentsCache ?? [];

    const nextId = list.length > 0 ? Math.max(...list.map((s) => s.id)) + 1 : 1;

    const newStudent: Student = { id: nextId, ...payload };

    this.studentsCache = [newStudent, ...list];

    return newStudent;
  }

  updateStudent(id: number, changes: Omit<Student, 'id'>): Student | null {
    if (!this.studentsCache) return null;

    const index = this.studentsCache.findIndex((s) => s.id === id);

    if (index === -1) return null;

    const updatedStudent: Student = { id, ...changes };

    // replace student immutably (good habit)
    this.studentsCache = this.studentsCache.map((s) => (s.id === id ? updatedStudent : s));

    return updatedStudent;
  }
}
