# Changelog

## [Unreleased] — Phase 0 : Fondations

### Ajouté
- Initialisation du mono-repo (`backend/`, `frontend/`, `docker-compose.yml`)
- Backend Laravel 13 en mode API pure
  - Authentification SPA stateful via Laravel Sanctum (login, logout, me)
  - Gestion des rôles et permissions via spatie/laravel-permission (admin, secretaire, moniteur, eleve)
  - Structure modulaire `app/Domains/` (Identite, Eleves, Moniteurs, ...)
  - Format de réponse/erreur JSON homogène
  - Rate limiting sur le login (5 requêtes/minute par IP)
  - Seeders : 4 rôles + 4 comptes de démonstration
  - Tests Pest : auth login/logout/me (cas nominal, invalide, compte désactivé)
  - Configuration Pint (formatage) et PHPStan (analyse statique, niveau 5)
- Frontend React 19 + TypeScript + Vite
  - Client axios avec gestion CSRF Sanctum stateful
  - Store auth Zustand (user, isLoading, hasRole, primaryRole)
  - TanStack Query pour les appels serveur
  - Page de login avec React Hook Form + Zod
  - Routing protégé avec redirection selon rôle
  - Layout applicatif (sidebar + topbar mobile) filtré par rôle
  - Dashboard placeholder par rôle
  - Composants partagés : Button, ProtectedRoute, ToastProvider
- Docker Compose : PostgreSQL 16 + Adminer
- CI GitHub Actions : lint + tests backend + typecheck + tests frontend
- README avec instructions de démarrage en < 5 min
