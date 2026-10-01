# Vijayalakshmi Poultry Farm — Management System

A digitization of the farm's paper ledger: customers, suppliers, vehicle
trips, purchases, deliveries, payments, expenses, running ledgers, and PDF
reports.

**This is one Spring Boot application.** There is no separate frontend
project, no build step, and nothing to copy or sync — the app serves its own
UI directly.

```
vpf/
└── backend/
    ├── pom.xml, Dockerfile
    └── src/main/
        ├── java/com/vpf/...              Spring Boot API
        └── resources/
            ├── application.yml
            └── static/                   The ENTIRE UI (HTML/CSS/JS).
                                           This is the one and only place to
                                           edit frontend files. Spring Boot
                                           serves this folder automatically
                                           at the app's own URL - there is no
                                           second frontend folder anywhere
                                           and nothing needs copying.
```

> **If you've used an earlier version of this project:** older copies had a
> second `vpf/frontend/` folder that had to be manually copied into
> `backend/src/main/resources/static/` before every run/deploy. That folder
> has been removed. If you still have it locally, delete it — editing it did
> nothing, since Spring Boot never served it, and it's very likely the reason
> earlier changes appeared not to take effect no matter what was edited.
> **Only `backend/src/main/resources/static/` is real.**

---

## 1. Prerequisites

- **Java 21** and **Maven**
- **PostgreSQL 13+**

## 2. Database setup

```sql
CREATE DATABASE vpf_db;
CREATE USER vpf_user WITH ENCRYPTED PASSWORD 'change_me';
GRANT ALL PRIVILEGES ON DATABASE vpf_db TO vpf_user;
```

Tables are created automatically on first run (`ddl-auto: update` in
`application.yml`). Two one-time migration scripts also live at the project
root and should be run once, after the first deploy of the version that
needed them:
- `migration_v2.sql` — makes Purchase Rate/Amount optional.
- `migration_v3.sql` — backfills `trip_number` on any trips that existed
  before the Trip ID redesign (safe/additive; nothing is deleted or merged).

## 3. Running it

```bash
cd backend
# Set these before running (or edit application.yml directly):
export DB_URL=jdbc:postgresql://localhost:5432/vpf_db
export DB_USERNAME=vpf_user
export DB_PASSWORD=change_me
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=choose_a_strong_password

mvn clean install
mvn spring-boot:run
```

Then just open **`http://localhost:8080`** (or whatever `PORT` you set) in a
browser. That's it — the login page, every other page, and the API are all
served from that one address. Nothing else to start, no separate frontend
server, no `API_BASE` to configure.

A default admin user is created automatically on first run (username/password
from the env vars above, or `admin` / `admin123` if you don't set them —
**change this immediately** via the "Change Password" option, or by setting
`ADMIN_PASSWORD` before the very first run).

## 4. Deploying

See `RENDER_DEPLOY.md` for a full walkthrough of deploying this as a single
Render Web Service + Render Postgres. In short: this whole `vpf/` folder is
one deployable unit (`backend/` is the Docker build root); there is nothing
under a separate `frontend/` folder to keep in sync anymore.

## 5. First login

1. Go to the login page, sign in with the admin credentials from Section 3.
2. Add your suppliers under **Purchases → Supplier Details**, and your
   customers under **Customers** — enter their current outstanding balance
   as the **Opening Balance** so history isn't lost when you switch off paper.
3. If staff (gumasta) need their own logins, go to **Staff Accounts** (Admin
   only) and create a Gumasta account. Gumasta accounts can add new
   deliveries, payments, purchases, expenses, customers, suppliers, and
   vehicles, but cannot edit or permanently delete anything — only Admin
   accounts can.
4. Start recording purchases (which is also where a vehicle's trip is
   started) → deliveries → payments day to day. Sales Amount, running
   balances, dashboard, and PDFs are all automatic.

## 6. What's implemented

- **Vehicle trips**: a vehicle can make several independent trips in one day.
  Trip identity is always an explicit Trip ID — never guessed from
  vehicle+date — so two trips for the same vehicle/day can never merge or
  overwrite each other's supplier, driver, loaded weight, etc. A trip is
  always started from **Purchases** (Start New Trip / Continue Existing
  Trip, with driver, helper, distance, fuel, and auto-calculated mileage);
  **Deliveries** can only continue a trip that already has a purchase
  recorded against it — it can never start one. Delivered weight is checked
  cumulatively per trip against a 5 kg tolerance over the loaded weight.
- Customers, Suppliers, Vehicles — full CRUD for Admin; add-only for Gumasta;
  account pages with running balance.
- Deliveries — Sales Amount = Dispatch Weight × Selling Rate. Payment can be
  recorded in the same form (Sales Amount / Amount Paid / Payment Method).
- Feed sales — record when a chicken center buys chicken feed from the farm;
  adds to their outstanding balance the same way a delivery does.
- Customer & Supplier payments — every payment is its own row, never
  overwritten. Supports **Save & Next** for entering many payments in one
  sitting.
- Customer & Supplier ledgers — append-only running balance.
- Expenses (9 categories from the spec).
- Admin dashboard — Today's Sales, Supplier Outstanding, Today's Expenses,
  Recent Deliveries and Payments.
- 6 PDF reports: Vehicle Trip, Customer Statement (single or all combined),
  Supplier Purchase, Daily Sales, Expense, Profit/Loss.
- **Two account roles**: Admin (full access, including permanent deletes) and
  Gumasta/Staff (add-only, enforced on the backend, not just hidden in the UI).
- Deleting a customer/supplier cascades to all their records and ledger
  history; deleting a single record recalculates that ledger afterward.
- Session-based login (no GST, no separate Orders feature exposed in the UI).

## 7. Suggested next steps (not built yet, only if you want them later)

- Automated daily Postgres backups
- SMS/WhatsApp reminders for outstanding balances
- A settings screen for Admins to change other users' passwords
