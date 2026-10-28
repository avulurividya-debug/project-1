# Students Placement and Internship Management Program

**CampusPath** is a responsive, full-stack campus career portal for managing student profiles, company details, placement drives, internship opportunities, and applications.

## 1. Problem statement

Students often find hiring announcements in different places and have no single place to track applications. Placement staff also need a consistent way to publish drives and review applicants. CampusPath brings those workflows into one small application backed by PostgreSQL.

## 2. Objectives

- Let students register, sign in, maintain a basic career profile, browse opportunities, apply once per drive, and track application status.
- Let placement administrators manage companies and drives, view registered students, and update application statuses.
- Store information persistently in Supabase PostgreSQL through a Node.js/Express REST API.
- Demonstrate validation, role checks, password hashing, and safe handling of server secrets.

## 3. Roles and features

### Student
- Register and log in with an email and password.
- Update name, department, graduation year, and skills.
- Search and filter placement/internship drives.
- View eligibility, location, deadline, and description.
- Apply to an open drive, with duplicate applications prevented by the database.
- View application status and withdraw an application.

### Admin
- Access the campus management section.
- Add companies and publish, close/reopen, or delete drives.
- View registered students and applications.
- Update application status to Submitted, Under Review, Shortlisted, Rejected, or Selected.

**First admin setup:** create a normal account in the application, then promote that account using the one-time SQL command in the setup section. Never add a public admin-registration button.

## 4. Technology stack

- HTML5, CSS3, vanilla browser JavaScript
- Node.js and Express.js
- Supabase PostgreSQL
- npm packages: `@supabase/supabase-js`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `express`, `cors`, `helmet`, `express-rate-limit`
- Git and GitHub

No frontend framework, paid API, or external service is required beyond your free/available Supabase project. Google Fonts is an optional visual enhancement; the app remains usable if it is unavailable.

## 5. Folder structure

```text
students-placement-internship-management-program/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── companies.js
│   │   ├── drives.js
│   │   └── applications.js
│   ├── middleware/auth.js
│   ├── utils/validation.js
│   ├── package.json
│   ├── .env.example
│   ├── .env (create locally; do not commit)
│   └── .gitignore
├── database/schema.sql
├── .gitignore
└── README.md
```

## 6. Prerequisites

Install these on Windows:

1. **Visual Studio Code:** https://code.visualstudio.com/
2. **Node.js LTS (includes npm):** https://nodejs.org/
3. **Git:** https://git-scm.com/downloads
4. **Supabase account:** https://supabase.com/

Open VS Code, choose **File → Open Folder**, and open the project root folder. Open **Terminal → New Terminal**. Commands below are run from the stated directory.

Verify the tools:

```powershell
node --version
npm --version
git --version
```

Each command should print a version number. If a command is not recognized, install the software and restart VS Code.

## 7. Create and configure the Supabase database

1. Sign in to Supabase and create a new project: https://supabase.com/dashboard.
2. Choose a project name and a strong database password. Save the password securely; it is not the same as a student login.
3. Open **SQL Editor → New query**.
4. Open `database/schema.sql` in VS Code, copy the complete file, paste it into the SQL Editor, and click **Run**.
5. Open **Table Editor**. Confirm that `users`, `companies`, `drives`, and `applications` exist.
6. In **Project Settings → API** (wording can change), copy the Project URL and the server-side service-role/secret key. Use the service-role key only on the backend. Never paste it into `frontend/app.js`, a screenshot, GitHub, or a public report.

### Create the first administrator

First register your own account through the running application. Then in Supabase **SQL Editor**, run the following after replacing the email with the exact email used to register:

```sql
update public.users
set role = 'admin'
where email = lower('your-admin-email@example.com');
```

Verify the query reports one updated row. Log out and log in again so the newly issued token contains the admin role. This is a one-time setup operation performed by the project owner, not a public API feature. Keep administrator access limited to trusted people.

## 8. Environment variables

In VS Code, create `backend/.env` by copying `backend/.env.example`. Replace the example values with your own project values:

```dotenv
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_REAL_SERVER_SIDE_KEY
JWT_SECRET=PASTE_A_LONG_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=8h
```

Generate a random JWT secret in a terminal (you can run this from any directory):

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the printed value into `JWT_SECRET`. Do not use the literal example text. `SUPABASE_URL` identifies your Supabase project; `SUPABASE_SERVICE_ROLE_KEY` lets the server perform database queries; `JWT_SECRET` signs login tokens; `JWT_EXPIRES_IN` sets token lifetime. `.env.example` contains safe placeholders and belongs in Git; `.env` contains real credentials and must stay private.

## 9. Install and run

Open the VS Code terminal at the **project root**, then run:

```powershell
cd backend
npm install
npm start
```

Expected output: `App running at http://localhost:3000`. Keep that terminal open. Visit **http://localhost:3000** in your browser. Do not double-click `index.html`; the Express server serves the frontend and `/api` endpoints.

Check the server health endpoint at http://localhost:3000/api/health. Expected JSON:

```json
{"status":"ok","service":"Students Placement and Internship Management Program"}
```

To stop the server, click its terminal and press `Ctrl+C`. During development you can use `npm run dev` to restart the server when backend files change.

## 10. Architecture

```text
Browser (HTML/CSS/vanilla JS)
          | fetch('/api/...') + Bearer token
          v
Node.js + Express (validation, login, role checks)
          | server-only Supabase client
          v
Supabase PostgreSQL (persistent tables + constraints)
```

The browser never receives the Supabase service-role key. Passwords are hashed with bcrypt before being stored. The backend signs short-lived JWTs and verifies them on protected endpoints. The API checks the role for administrator-only actions. PostgreSQL Row Level Security (RLS) is enabled with no direct client policies; all database operations are intended to go through the authorized Express API using the private service-role key. Because the service role bypasses RLS, backend authorization checks are essential.

For a production deployment, consider Supabase Auth, refresh-token/session management, password reset, email verification, stricter CORS/CSP, HTTPS, audit logging, and a managed deployment environment. This educational MVP uses a bearer token kept in `sessionStorage`, which clears when the browser tab/session ends; it is not a substitute for a security review.

## 11. REST API reference

All endpoints except register, login, and health require `Authorization: Bearer <token>`. JSON request bodies use `Content-Type: application/json`.

| Method | Path | Purpose | Permission |
|---|---|---|---|
| GET | `/api/health` | Health check | Public |
| POST | `/api/auth/register` | Create student account | Public; role always student |
| POST | `/api/auth/login` | Verify credentials and issue token | Public, rate limited |
| GET | `/api/students/me` | Read current profile | Student or admin, own profile |
| PATCH | `/api/students/me` | Update current profile | Student or admin, own profile |
| GET | `/api/students` | List students | Admin |
| GET | `/api/companies` | List companies | Authenticated |
| POST | `/api/companies` | Add company | Admin |
| DELETE | `/api/companies/:id` | Delete company | Admin |
| GET | `/api/drives` | List drives; optional `?status=Open` | Authenticated |
| POST | `/api/drives` | Create drive | Admin |
| PATCH | `/api/drives/:id` | Update drive details/status | Admin |
| DELETE | `/api/drives/:id` | Delete drive and related applications | Admin |
| GET | `/api/applications` | List own applications; admins see all | Authenticated; admin may filter `?status=` |
| POST | `/api/applications` | Apply to an open drive | Authenticated; current user is assigned server-side |
| PATCH | `/api/applications/:id/status` | Change application status | Admin |
| DELETE | `/api/applications/:id` | Withdraw own application | Owner or admin |

Successful responses are JSON objects, for example `{ "drives": [...] }`, `{ "application": {...} }`, or `{ "token": "...", "user": {...} }`. Common errors use HTTP `400` for invalid data, `401` for missing/invalid login, `403` for role restrictions, `404` for missing resources, `409` for duplicate registration/application, and `500` for server/database configuration failures. The server returns generic text for unexpected errors and logs a limited error message in the backend terminal.

## 12. How to use the app

1. Open the app and select **Get started** to register as a student.
2. Log in and open **My profile** to add department, graduation year, and skills.
3. Open **Opportunities**, search/filter by type or status, and read the details.
4. Select **Apply now** for an open drive. A second application to the same drive is rejected.
5. Open **My applications** to check status or withdraw.
6. After promoting a trusted account to admin using the SQL above, log in as that admin. Use **Manage campus** to add a company and publish drives, and to review applications.

No demo data or shared credentials are included. Add your own company and drive records through the admin dashboard.

## 13. Manual testing checklist

- [ ] `/api/health` returns `status: ok`.
- [ ] A new student can register; password is not stored in plaintext.
- [ ] Registering the same email again returns a duplicate-account error.
- [ ] Wrong login credentials return `401` without revealing whether the email exists.
- [ ] A student can update their profile and see the saved values after refresh.
- [ ] A student can browse, search, and filter drives.
- [ ] An admin can add a company and publish a drive with a valid deadline.
- [ ] A student can apply to an open drive and sees it under My applications.
- [ ] Applying twice to the same drive returns a duplicate-application error.
- [ ] Applying to a closed or expired drive is rejected.
- [ ] A student cannot create companies/drives or change application status; the API returns `403`.
- [ ] A student can withdraw their own application, but cannot delete another student's application.
- [ ] Admin can change status and the student sees the new status after reloading.
- [ ] Invalid form values show friendly errors; tables and cards fit mobile screens.
- [ ] Stop the server and verify the browser displays a connection message rather than crashing.

## 14. Troubleshooting

- **`Cannot reach the server`:** check the terminal is running `npm start`, visit `http://localhost:3000`, and check the port.
- **Supabase environment variables are missing:** ensure `backend/.env` exists, names match `.env.example`, and restart the server after editing it.
- **Invalid API key / database error:** check the project URL and server-side key copied from the same Supabase project. Do not use a publishable key as the service-role key for this backend.
- **Tables or columns missing:** rerun `database/schema.sql` in the correct Supabase project and check Table Editor.
- **Admin menu does not appear:** run the admin promotion SQL for the registered email, then log out and log in again.
- **401 after waiting:** the token expires; log in again.
- **Port already in use:** change `PORT` in `backend/.env` to `3001` and open `http://localhost:3001`.
- **npm install fails:** verify Node.js LTS and internet access, then retry from the `backend` folder.
- **Google Fonts unavailable:** the browser falls back to local system fonts; functionality is unaffected.

## 15. Git and GitHub

From the **project root** (not `backend`), create an empty repository on https://github.com/new. Do not initialize it with a README if you already have this README locally. Then run:

```bash
git init
git status
git add .
git status
git commit -m "Build placement and internship management program"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL. Check the second `git status` output before committing. Confirm that `backend/.env`, `node_modules/`, private data, and keys are not staged. `backend/.env.example` should be included. After pushing, refresh the GitHub repository page and verify the expected files are present.

**Important:** `.gitignore` does not remove a secret already committed. If you accidentally push a credential, rotate/revoke it immediately in Supabase and clean the repository history as appropriate before continuing.

## 16. Limitations and future improvements

This beginner MVP does not include resume uploads, email notifications, password reset, email verification, pagination, analytics exports, automated end-to-end browser tests, or production deployment. The custom JWT login is suitable for learning but should be reviewed and strengthened before public production use. Possible extensions include Supabase Auth, resume links/storage, interview scheduling, CSV reports, and placement statistics.
