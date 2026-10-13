# CareerConnect

A job portal with two kinds of accounts. Candidates search jobs, keep a profile and resume, apply, and follow the status of each application. Recruiters post jobs, read applications, view resumes, and move each candidate from applied to hired or rejected.

This is a portfolio project. It covers the main workflows end to end rather than trying to be a full job board.

## Features

**Candidates**
- Browse and search jobs without signing in, with filters for location, job type and experience level, and paginated results
- Profile with skills, education and a PDF resume stored privately
- Apply with an optional cover letter; the profile resume is attached automatically
- One application per job, enforced in the database
- Track status on a dashboard, and withdraw an application that is still open

**Recruiters**
- Post, edit, close, reopen and delete jobs
- See every applicant for a job, with their skills, education and cover letter
- Open the resume attached to an application
- Change an application's status
- A job with applicants can't be deleted, only closed, so candidates never lose an application silently

**Access control**
- Clerk handles sign-up and sign-in. The Express API checks the Clerk session and then the user's role in the database on every protected route, so hiding a button is never the only protection.
- Recruiters can only touch their own jobs and the applications on them.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database and file storage | Supabase (PostgreSQL and Storage) |
| Authentication | Clerk |

## Project structure

```
CareerConnect/
  client/      React app (pages, components, hooks, services)
  server/      Express API (routes, controllers, services, middleware)
  database/    schema.sql, seed.sql
```

The browser never talks to Supabase. It calls the Express API, which holds the Supabase service key.

## Run it locally

You need Node.js 20 or newer, a Supabase project and a Clerk application.

1. **Database.** In Supabase, open the SQL Editor and run `database/schema.sql`. Then create a **private** storage bucket named `resumes`.
2. **Environment files.** Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`, then fill in your keys.
3. **Install and start the API.**
   ```
   cd server
   npm install
   npm run dev
   ```
4. **Install and start the client** in a second terminal.
   ```
   cd client
   npm install
   npm run dev
   ```
5. Open http://localhost:5173, sign up, and pick a role.

To get sample jobs without posting them by hand, sign up a recruiter, copy that user's `id` from the `users` table, put it into `database/seed.sql` in place of `YOUR_RECRUITER_UUID_HERE`, and run the script.

## API overview

| Method | Path | Who |
|---|---|---|
| GET | `/api/jobs`, `/api/jobs/:id` | Anyone |
| GET, POST | `/api/jobs/mine`, `/api/jobs` | Recruiter |
| PATCH, DELETE | `/api/jobs/:id` | Recruiter who owns the job |
| GET, PATCH | `/api/users/me` | Signed in |
| POST | `/api/users/onboard`, `/api/users/me/resume` | Signed in |
| POST, DELETE | `/api/applications`, `/api/applications/:id` | Candidate |
| GET | `/api/applications/mine` | Candidate |
| GET | `/api/applications/job/:jobId` | Recruiter who owns the job |
| PATCH, GET | `/api/applications/:id/status`, `/api/applications/:id/resume` | Recruiter who owns the job |

## Known limits

- No automated tests yet. Everything has been checked by hand.
- No email notifications when a status changes.
- Withdrawing an application deletes it, so there is no history of withdrawn applications.
- Resumes must be PDF files of 5 MB or less.
