# Team Task Management Backend

A NestJS + Prisma API for running software teams: departments plan **projects**, split them into
**modules**, assign **tasks** to developers, and track time through **work sessions**. Progress
rolls up automatically from tasks to modules to projects, and each role gets its own dashboard.

## Tech stack

- **NestJS 11** (Express), ESM (`"type": "module"`)
- **Prisma 7** + **PostgreSQL** via the `@prisma/adapter-pg` driver adapter
- **JWT** auth (`passport-jwt`) with role-based access control
- **Swagger** API docs (development only)
- **Winston** logging, **helmet**, **compression**, **@nestjs/throttler** rate limiting

## Domain model

```
Department ─┬─ User (DEVELOPER | TEAM_LEAD | MANAGER)
            └─ Project ── Module ── Task ── WorkSession
```

- A **work session** is recorded each time a developer starts and ends a task. Ending a task
  stores the duration, a summary and the new progress percentage.
- **Progress roll-up:** a module's progress is the average of its tasks; a project's progress is
  the average of its modules. Either is marked `completed` at 100%.

**Roles:** `DEVELOPER`, `TEAM_LEAD`, `MANAGER`.

## Getting started

### 1. Install dependencies

```bash
yarn install
```

`postinstall` runs `prisma generate`, so the Prisma client is ready afterwards.

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | Signs access and refresh tokens |
| `NODE_ENV` | no | `production` disables Swagger and hides 500 error details |
| `PORT` | no | Defaults to `4001` |
| `CORS_ORIGINS` | in production | Comma-separated browser origins allowed to call the API. Any `localhost` origin is allowed outside production |
| `TRUST_PROXY_HOPS` | no | Number of reverse proxies in front of the app, so rate limiting sees real client IPs. Defaults to `1` on Vercel, `0` elsewhere |

### 3. Set up the database

```bash
npx prisma migrate deploy   # apply existing migrations
# or, while changing the schema:
npx prisma migrate dev --name <change>
```

Prisma reads `DATABASE_URL` through `prisma.config.ts`.

### 4. Run

```bash
yarn start:dev
```

- API: `http://localhost:4001/api/v1/...`
- Swagger: `http://localhost:4001/api-docs`
- Health check: `GET http://localhost:4001/`

## API conventions

**Authentication.** `POST /api/v1/auth/login` returns `access_token` (1 day) and
`refresh_token` (7 days). Send `Authorization: Bearer <access_token>` on every other route.

**Success responses** are wrapped by `TransformInterceptor`:

```json
{ "success": true, "statusCode": 200, "message": "Tasks successfully retrieved", "data": [] }
```

A service can return `{ message, data, meta }` to control the envelope; `meta` is included only
when present (for paginated results).

**Error responses** come from `AllExceptionsFilter`. Prisma errors are mapped to HTTP codes:
unique violation → `409`, missing related record → `400`, record not found → `404`.

```json
{ "success": false, "statusCode": 404, "path": "/api/v1/task/9", "error": "Not Found", "message": "Task with ID 9 not found", "timestamp": "..." }
```

**Rate limit:** 60 requests per minute per client IP.

## Endpoints

All paths are under `/api/v1`. Every route except `auth/login` and `auth/refresh` requires a
JWT; the Roles column lists any extra restriction.

| Method | Path | Roles |
| --- | --- | --- |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | public |
| POST | `/auth/change-password` | |
| POST | `/users/create` | MANAGER, TEAM_LEAD |
| GET | `/users` | |
| GET | `/users/team-members` | |
| GET | `/users/assigned-projects` | |
| GET | `/users/assigned-modules` | |
| GET | `/users/user-details/:id` | MANAGER, TEAM_LEAD |
| GET / PATCH | `/users/:id` | |
| DELETE | `/users/:id` | MANAGER, TEAM_LEAD |
| POST | `/project/create` | |
| GET | `/project/all` | |
| GET / PATCH | `/project/:id` | |
| DELETE | `/project/:id` | MANAGER, TEAM_LEAD |
| GET | `/project/project-members/:id` | |
| POST | `/module/create` | |
| GET | `/module/all` | |
| GET | `/module/by-project/:id` | |
| GET / PATCH / DELETE | `/module/:id` | |
| GET | `/module/assign-developers/:id` | MANAGER, TEAM_LEAD |
| POST | `/task/create` | |
| GET | `/task/all` | |
| GET | `/task/management/dashboard` | |
| GET | `/task/:id` | |
| GET | `/task/by-project/:id` | |
| GET | `/task/by-module/:id` | |
| PATCH | `/task/update/:id` | |
| DELETE | `/task/remove/:id` | |
| POST | `/task/start/:id` | |
| POST | `/task/end/:id` | |
| GET | `/task/my/tasks` | |
| GET | `/task/my/completed-tasks` | |
| GET | `/dashboard/manager` | MANAGER |
| GET | `/dashboard/team-lead` | TEAM_LEAD |
| GET | `/dashboard/developer` | DEVELOPER |

Request and response bodies are documented in Swagger.

## Project structure

```
src/
├── main.ts                  # bootstrap: prefix, CORS, helmet, pipes, filter, Swagger
├── app.module.ts            # config, throttler, request logging
├── prisma/                  # global PrismaService (pg driver adapter)
├── core/logger/             # Winston configuration
├── common/
│   ├── common.module.ts     # global Validator + ProgressService
│   ├── config/              # CORS allowlist
│   ├── decorators/          # @GetUser, @Roles, @Public
│   ├── filters/             # AllExceptionsFilter
│   ├── guards/              # RolesGuard
│   ├── interceptors/        # TransformInterceptor
│   ├── middlewares/         # HTTP request logger
│   ├── services/            # ProgressService (progress roll-up)
│   └── validation/          # Validator (existence and state checks)
└── modules/
    └── <feature>/           # auth, users, project, module, task, dashboard
        ├── dto/
        ├── <feature>.controller.ts
        ├── <feature>.service.ts      # business logic
        └── <feature>.repository.ts   # all Prisma queries for the feature
```

Services never call Prisma directly; they go through their module's repository. Repository
methods that take an optional `client` argument can run inside a transaction:

```ts
await this.repository.transaction(async (tx) => {
  const task = await this.repository.remove(id, tx);
  await this.progressService.updateModuleProgress(task.moduleId, tx);
});
```

## Logging

Winston writes to the console (human-readable in development, JSON in production) and, except
on Vercel, to rotating files in `logs/`:

- `logs/application-YYYY-MM-DD.log`: info and above, kept 14 days
- `logs/error-YYYY-MM-DD.log`: errors only, kept 30 days

Client errors (4xx) are logged as warnings; server errors (5xx) as errors with a stack trace.

## Deploying to Vercel

The project uses Vercel's zero-configuration NestJS support, so there is no `vercel.json`.
Vercel detects `src/main.ts`, installs dependencies (which runs `prisma generate`) and deploys
the app as a single function.

1. Set `DATABASE_URL`, `JWT_SECRET` and `CORS_ORIGINS` in the Vercel project's environment
   variables. Vercel sets `NODE_ENV=production`, which disables Swagger.
2. Apply migrations against the production database before or after deploying. The Vercel build
   does not run them:

   ```bash
   DATABASE_URL=<production url> npx prisma migrate deploy
   ```

Notes:

- File logging is turned off on Vercel (read-only filesystem). Use Vercel's runtime logs.
- Rate-limit counters are kept in memory per function instance.
- `src/main.ts` casts the `helmet` import because Vercel's build type-checker resolves helmet's
  CommonJS typings. Keep the cast if you touch that import.

## Scripts

| Script | Purpose |
| --- | --- |
| `yarn start:dev` | Run in watch mode |
| `yarn build` | Generate the Prisma client and compile to `dist/` |
| `yarn start:prod` | Run the compiled build |
| `yarn lint` | ESLint with auto-fix |
| `yarn format` | Prettier |
| `yarn test` | Unit tests (Jest, ESM) |
| `yarn test:e2e` | End-to-end tests (needs a reachable `DATABASE_URL`) |
