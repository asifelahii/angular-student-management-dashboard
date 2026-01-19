# Angular Student Management Dashboard

A learning project to practice **professional SDLC**: Agile iteration, GitHub Issues, PR workflow, and Angular best practices — built with a **Liquid Glass UI** style (SCSS + Tailwind utilities).

> Status: MVP v0.1 — routing + mock auth + students (list/details/add/edit/delete) + search/sort + UX states

---

## Preview

![Students List](docs/screenshots/students-list.png)

![Student Details](docs/screenshots/student-details.png)

---

## Apps

- `client/` — Angular web app

---

## Features (MVP)

### Auth (Mock)

- `/login` page with **reactive form** + validation
- Stores mock **user/token** in `localStorage`
- Logout clears auth data and redirects to `/login`

### Students

- Students list page (cards)
  - Shows: **name, email, department, status**
  - Click a card → `/students/:id`
- Search + Sort (works together)
  - Search by **name or email** (case-insensitive)
  - Sort by **name/department/semester/status** (A–Z / Z–A)
- Student details page
  - Displays key fields: email, phone, department, semester, status
  - “Student not found” state + Back link
- Add Student (frontend-only)
  - Reactive form + validation
  - Adds student to **in-memory** service state
  - Redirects to `/students`
- Edit Student
  - Prefills form with existing data
  - Updates student in service state
  - Redirects to `/students/:id`
- Delete Student
  - Confirm modal
  - Deletes from service state + updates list
  - Redirects back to `/students`

### UX States

- Loading state (mock delay)
- Empty state
- Error state (simulated once + retry)

---

## Tech Stack

- Angular (standalone components)
- Tailwind CSS (utility classes)
- SCSS (global UI primitives + component styling)
- RxJS (service state, loading/error handling)

---

## Project Structure (high-level)

```text
client/
  src/
    app/
      core/                 # guards, interceptors, core services
      features/
        auth/               # login + auth service
        students/           # list/details/add/edit + students service
      shared/
        components/         # reusable UI components (header, cards, select, etc.)
        ui.scss             # liquid-glass primitives
```
