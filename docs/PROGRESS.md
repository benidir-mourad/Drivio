# Progression du projet Drivio

## Phase 0 — Fondations ✅

### Backend
- [x] Laravel 13 initialisé en mode API
- [x] Sanctum configuré (SPA stateful, CORS)
- [x] spatie/laravel-permission installé
- [x] Structure modulaire `app/Domains/`
- [x] Préfixe `/api/v1`
- [x] Format d'erreur JSON homogène
- [x] Endpoint `POST /api/v1/auth/login`
- [x] Endpoint `POST /api/v1/auth/logout`
- [x] Endpoint `GET /api/v1/auth/me`
- [x] Rate limiting sur le login (5/min par IP)
- [x] Seeders : 4 rôles + 4 comptes démo
- [x] Tests Pest : login (nominal, invalide, compte désactivé, validation)
- [x] Tests Pest : logout (authentifié, non authentifié)
- [x] Tests Pest : me (authentifié, non authentifié)
- [x] pint.json (formatage Laravel)
- [x] phpstan.neon (analyse statique niveau 5)

### Frontend
- [x] React 19 + Vite + TypeScript
- [x] Tailwind CSS v4
- [x] Client axios (CSRF Sanctum cookie stateful + intercepteurs)
- [x] Store auth Zustand (user, isLoading, hasRole, primaryRole)
- [x] TanStack Query configuré
- [x] Page de login (React Hook Form + Zod)
- [x] Routing protégé avec redirection par rôle
- [x] AppLayout (sidebar + topbar mobile, navigation filtrée par rôle)
- [x] Dashboard placeholder par rôle
- [x] Composants : Button, ProtectedRoute, ToastProvider
- [x] Utilitaires : roles.ts, fmtDate.ts, downloadPdf.ts
- [x] Test LoginPage (Vitest + RTL)

### Infrastructure
- [x] docker-compose.yml (PostgreSQL 16 + Adminer)
- [x] .github/workflows/ci.yml (lint + tests + typecheck + build)
- [x] README.md racine
- [x] CHANGELOG.md
- [x] docs/PROGRESS.md

---

## Phase 1 — Socle données (Élèves, Moniteurs, Véhicules) ⬜

### Backend
- [ ] Migration + Model `Student`
- [ ] Migration + Model `Instructor`
- [ ] Migration + Model `Vehicle`
- [ ] CRUD Student (Form Request, Resource, Policy)
- [ ] CRUD Instructor
- [ ] CRUD Vehicle
- [ ] Pagination, recherche, filtres
- [ ] Upload documents élève
- [ ] Tests Pest (nominal + autorisation + validation)

### Frontend
- [ ] Page liste Students (table triable/filtrable)
- [ ] Fiche Student (détail, édition, suppression)
- [ ] Formulaire création/édition Student
- [ ] Page liste Instructors
- [ ] Fiche Instructor
- [ ] Page liste Vehicles
- [ ] Fiche Vehicle
- [ ] Upload pièces côté fiche élève

---

## Phase 2 — Planning & Réservations ⬜
## Phase 3 — Pédagogie & Examens ⬜
## Phase 4 — Finance & PDF ⬜
## Phase 5 — Automatisation & Pilotage ⬜
