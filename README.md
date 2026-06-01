# Drivio — Application de gestion d'auto-école

Application web complète pour la gestion d'une auto-école (planning, élèves, facturation, pédagogie).

## Prérequis

- PHP 8.3+
- Composer
- Node.js 22+
- Docker & Docker Compose (pour la base de données)

## Lancement rapide (dev)

### 1. Base de données (PostgreSQL via Docker)

```bash
docker compose up -d
```

Adminer disponible sur http://localhost:8080 (serveur: `postgres`, user: `drivio`, mot de passe: `secret`).

### 2. Backend (Laravel)

```bash
cd backend
cp .env.example .env
# Éditer .env : DB_CONNECTION=pgsql, DB_HOST=127.0.0.1, DB_PORT=5432, DB_DATABASE=drivio, DB_USERNAME=drivio, DB_PASSWORD=secret
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API disponible sur http://localhost:8000

### 3. Frontend (React)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App disponible sur http://localhost:5173

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@drivio.fr | password |
| Secrétaire | secretaire@drivio.fr | password |
| Moniteur | moniteur@drivio.fr | password |
| Élève | eleve@drivio.fr | password |

## Structure du projet

```
backend/     → API Laravel 13
frontend/    → SPA React 19 + TypeScript
docker-compose.yml  → PostgreSQL + Adminer
```

## Commandes utiles

```bash
# Backend — tests
cd backend && php artisan test

# Backend — lint (Pint)
cd backend && ./vendor/bin/pint

# Backend — analyse statique
cd backend && ./vendor/bin/phpstan analyse

# Frontend — tests
cd frontend && npm run test

# Frontend — vérification types
cd frontend && npm run typecheck
```

## Documentation API

La documentation API est générée via Scribe : `php artisan scribe:generate` (à configurer en Phase 1).
