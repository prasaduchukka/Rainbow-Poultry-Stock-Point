# Deploying to Render

This app is set up to deploy as **one Render Web Service** (Spring Boot serving
both the API and the frontend from the same domain) plus **one Render Postgres
database**. Same-origin like this avoids a real gotcha with cross-site login
cookies that a two-service setup would otherwise hit.

## Before you start

Push this whole project to a GitHub repository (Render deploys from Git, not
by file upload). `backend/` is the Docker build root, and
`backend/src/main/resources/static/` is the entire UI — Spring Boot serves it
directly, so there is nothing else to copy or sync before deploying.

## 1. Create the database first

1. Render dashboard → **New +** → **PostgreSQL**.
2. Name it (e.g. `vpf-db`), pick a region close to you, and — important —
   **do not pick the Free plan**. Free Postgres on Render auto-deletes after
   30 days, which is not acceptable for real business/financial data. Pick
   **Basic-256mb** (~$6/month) or higher.
3. Once created, open it and copy the **Internal Database URL**,
   **Username**, and **Password** — you'll need these in step 3.

## 2. Push your code to GitHub

```bash
cd vpf
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 3. Create the Web Service

1. Render dashboard → **New +** → **Web Service** → connect your GitHub repo.
2. **Root Directory**: `backend`
3. **Runtime**: Docker (Render will detect the `Dockerfile` automatically)
4. **Instance Type**: pick **Starter** (~$7/month, always-on). The Free tier
   spins the service down after 15 minutes of no traffic and takes about a
   minute to wake back up on the next request — fine for testing, annoying
   for the owner's daily use.
5. Add these **Environment Variables**:

| Key | Value |
|---|---|
| `DB_URL` | the Internal Database URL from step 1 (starts with `jdbc:postgresql://...` — Render's Postgres page shows a plain `postgres://` URL; change the scheme to `jdbc:postgresql://` and it'll match) |
| `DB_USERNAME` | from step 1 |
| `DB_PASSWORD` | from step 1 |
| `ADMIN_USERNAME` | whatever you want the first admin login to be |
| `ADMIN_PASSWORD` | a strong password — this is only used the very first time the app starts with an empty database |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAME_SITE` | `Lax` |
| `ALLOWED_ORIGINS` | your Render URL once you know it, e.g. `https://vpf.onrender.com` (harmless to leave as-is since frontend/backend share an origin here — CORS just won't be exercised) |

6. Click **Create Web Service**. First build takes a few minutes (Maven
   downloading dependencies + compiling).

## 4. First login

Once it's live at `https://<your-service-name>.onrender.com`, log in with the
`ADMIN_USERNAME`/`ADMIN_PASSWORD` you set in step 3. Change the password
immediately (see the change-password instructions from earlier in this
conversation) since it was set as a plain environment variable.

## 5. Custom domain (optional)

Render web services support custom domains for free — Settings → Custom
Domains on the web service, then add a CNAME record at your domain registrar
pointing to the `onrender.com` address Render gives you.

## 6. Updating the app later

```bash
# after editing files under backend/src/main/resources/
git add .
git commit -m "describe the change"
git push
```
Render auto-deploys on every push to the branch you connected.

## Cost summary

- Web Service (Starter, always-on): ~$7/month
- PostgreSQL (Basic-256mb): ~$6/month
- **Total: ~$13/month** for a real, always-on, reasonably reliable deployment.

If you want to test everything first before spending anything, you can use
the Free tiers for both (accepting the spin-down delay and the Postgres
30-day expiry) and upgrade once the owner is happy with it.
