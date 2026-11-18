# EduSphere ERP

A multi-tenant school management SaaS foundation. Platform Super Admins provision school workspaces; each School Admin can access only the school linked to their account. Student, teacher, class, attendance, fee, exam and report modules are intentionally placeholders in this phase.

## Local setup

Requirements: Node.js 22+, PostgreSQL 14+, and npm.

1. Create an application database and a separate test database (`edusphere_dev` and `edusphere_test` are suggested).
2. Copy `.env.example` to `.env`, then set `DATABASE_URL`, `TEST_DATABASE_URL`, `INITIAL_ADMIN_EMAIL`, and a private `INITIAL_ADMIN_PASSWORD` (12–72 UTF-8 bytes). `INITIAL_ADMIN_NAME` may be changed. No default account or production credential is included.
3. Install dependencies and initialize the database:

   ```sh
   npm ci
   npm run db:migrate
   npm run db:seed:admin
   npm run dev
   ```

4. Sign in as the Platform Super Admin. Creating a school also provisions its School Admin; the generated temporary password is shown once and must be changed at first sign-in.
5. Run `npm test` to exercise API persistence and account forms. Tests create and drop a temporary schema in the dedicated `TEST_DATABASE_URL` database; never point it at production data.

For a production build, run `npm run build`. Apply the reviewed SQL migration with the deployment process before serving traffic. Configure production database access and secrets through the deployment environment, not source control.

## Data model

- `schools`: name, unique email, phone, address, active/suspended status, creation and update timestamps.
- `users`: unique case-insensitive email, password hash, role, optional school foreign key, active flag and first-login password-change flag. Each school has at most one School Admin in this phase.
- `sessions`: hashed opaque token, user foreign key and expiry; sign-out revokes the persisted session.

## API

- `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/change-password`
- `GET /api/platform/schools?q=&status=&sort=&page=` (paginated; Platform Super Admin only)
- `POST /api/platform/schools` (creates a school and its School Admin; Platform Super Admin only)
- `GET /api/school/dashboard` (returns only the signed-in School Admin’s school)

School Admin data access derives the school ID from the server-side session. All role checks are enforced on the backend; browser visibility is not treated as authorization.

## Not in this phase

School edits, invitations or password recovery, student/teacher/class/attendance/fee/exam/report workflows, audit-log screens, and email delivery are not implemented. Add production-grade per-IP login throttling and a CSP/rate-limit deployment policy before opening public registration or a large user base.
