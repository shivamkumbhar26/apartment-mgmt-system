# AI Development Log: Apartment Society Management System

This document outlines the major AI-assisted development stages carried out during the creation of the Apartment Society Management System.

---

## Stage 1: Requirement Analysis & Architectural Inspection

### Objective
- Perform an in-depth analysis of the user requirements and the existing reference project (`ReferenceProject`).
- Understand coding patterns, Express routing, MySQL connection management, authentication mechanisms, response structures, and React conventions to maintain total architectural harmony.
- Verify environmental constraints: ensure that `ReferenceProject` remains 100% untouched and all work is localized to `ApartmentSocietyManager`.

### Important Decisions
- **Strict Read-Only Enforcement:** Explicitly marked `ReferenceProject` as read-only.
- **Technology Alignment:** Adopt Node.js + Express with raw `mysql2` connection pooling and React 19 + Vite on the frontend with Bootstrap 5 + Bootstrap Icons loaded via CDN.
- **Avoidance of Prohibited Tools:** Disallowed Docker, Prisma/Sequelize migrations, Flyway, Redis, and complex DevOps infrastructure to guarantee a simple, locally runnable assessment application.
- **Manual Database Policy:** Mandated a single, self-contained `database.sql` file containing database creation, normalized tables, constraints, foreign keys, indexes, and realistic initial/sample data.

### What Was Generated / Implemented
- Comprehensive architectural breakdown of the reference project covering:
  - Global `authUser` middleware reading custom `req.headers.token`.
  - Unified `{ status: "success" | "error", data: ... }` response contract via `createResult`.
  - Service abstraction layer in React using Axios.
  - Role-based routing guards in React Router.

---

## Stage 2: Database Design & Schema Creation

### Objective
- Design a normalized, relational MySQL schema representing real-world society workflows: flats, residents, maintenance bills, payment collections, service complaints, community expenses, and user logins.

### Important Decisions
- **Normalized Relational Model:**
  - `users`: Authentication records with SHA-256 hashed credentials and role enum (`ADMIN`, `RESIDENT`).
  - `flats`: Inventory of units with block, flat number, floor, type, and occupancy status.
  - `residents`: Occupant profiles with unique foreign key references to `flats` and `users`.
  - `maintenance_bills`: Monthly dues per flat with unique constraint on `(flat_id, month)` to prevent duplicate billing.
  - `payments`: Transaction records referencing `maintenance_bills` with payment mode, date, and reference ID.
  - `complaints`: Service requests with category, priority, status lifecycle (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`), and technician assignment.
  - `expenses`: Community operational costs categorized by utility/vendor.
- **Sample Data Integrity:** Provided realistic sample flats, pre-populated residents, pending and paid maintenance invoices, historical payments, and active complaints.

### What Was Generated / Implemented
- Generated `ApartmentSocietyManager/database.sql`.
- Verified script execution directly in MySQL Server 8.4 via CLI. Confirmed 0 errors and verified table counts.

---

## Stage 3: Backend Implementation

### Objective
- Implement the Express server, MySQL connection pool, configuration constants, authentication middleware, and role-segregated REST route handlers.

### Important Decisions
- **Connection Pooling:** Implemented `db/pool.js` using `mysql2.createPool` with reasonable connection limits and automated query queueing.
- **Standardized Response Envelope:** Replicated `utils/result.js` to ensure consistent JSON formatting.
- **Authentication & Security:** Created `utils/auth.js` with `authUser` middleware, route whitelisting (`/auth/login`, `/health`), and role authorization guards (`checkAdminAuthorization`, `checkResidentAuthorization`).
- **Data Isolation:** Designed `routes/resident.js` to extract `residentId` strictly from the decoded JWT payload, guaranteeing that residents cannot tamper with query or path variables to view other residents' bills or complaints.
- **Direct Database Aggregation:** Admin dashboard statistics API (`/admin/dashboard/stats`) queries live counts and sums directly from SQL.

### What Was Generated / Implemented
- `package.json`: Configured backend dependencies (`express`, `cors`, `mysql2`, `jsonwebtoken`, `crypto-js`).
- `db/pool.js`: MySQL connection pool.
- `utils/config.js`: Secret keys, default password hashes, and port configuration.
- `utils/result.js`: Response wrapper.
- `utils/auth.js`: JWT verification and role checks.
- `routes/common.js`: Authentication `/auth/login` and `/health`.
- `routes/admin.js`: Comprehensive Admin APIs for flats, residents, bills, payments, complaints, expenses, and stats.
- `routes/resident.js`: Isolated Resident APIs for flat info, bills, payments, and complaint workflows.
- `server.js`: Express application entry point.

---

## Stage 4: Frontend Implementation

### Objective
- Build a responsive, user-friendly Single Page Application using React 19 and Vite with dedicated Admin and Resident experiences.

### Important Decisions
- **Service Layer Pattern:** Created `services/config.js`, `services/authService.js`, `services/adminService.js`, and `services/residentService.js` to isolate all Axios HTTP calls from UI components.
- **State & Route Guards:** Used React Context API (`LoginContext`) in `App.jsx` to manage `loginStatus`, `role`, and `userData`, coupled with route-level redirects.
- **Demo-Friendly Login:** Designed the `Login.jsx` screen with quick-fill buttons for sample credentials (`admin@society.com`, `rahul@example.com`, etc.) to facilitate rapid demonstration during interviews.
- **Clean Component Hierarchy:**
  - `Navbar.jsx`: Dynamically adapts to show admin navigation or resident navigation.
  - `AdminLayout.jsx` and `ResidentLayout.jsx`: Provide consistent header, navigation, and page containers.
  - Dedicated pages for every entity (Flats, Residents, Maintenance Bills, Payments, Complaints, Expenses).

### What Was Generated / Implemented
- `frontend/package.json` & `frontend/vite.config.js`: Setup for React 19, Vite, React Router, React Toastify.
- `frontend/index.html`: Loaded Bootstrap 5 CSS, Bootstrap Icons, Google Fonts, and Bootstrap JS bundle.
- `frontend/src/index.css` & `frontend/src/App.css`: Custom design tokens, status badges, and layout styling.
- `frontend/src/services/*`: Centralized API service modules.
- `frontend/src/components/*`: Navbar, AdminLayout, ResidentLayout.
- `frontend/src/pages/*`: Complete suite of Admin and Resident views.
- `frontend/src/App.jsx` & `frontend/src/main.jsx`: Application bootstrap and route definitions.

---

## Stage 5: Testing & Debugging

### Objective
- Verify that both backend and frontend build, run locally, connect to MySQL, and flawlessly execute all 6 required business workflows and security restrictions.

### Important Decisions
- **Automated Regression Test Suite:** Created `test_full_system.js` to execute real HTTP requests through the full lifecycle:
  1. Admin login &rarr; Flat creation &rarr; Resident registration &rarr; Flat assignment
  2. Maintenance bill creation & duplication verification
  3. Payment recording & transition from `PENDING` to `PAID`
  4. Resident data isolation (verifying resident sees only their own flat, bills, and payments)
  5. Complaint lifecycle (`OPEN` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`)
  6. Society expense logging and live dashboard recalculation
  7. Role-based security checks (verifying unauthorized route access is blocked)
- **Port Conflict Handling:** Frontend automatically detected port 5173 was occupied and bound to port 5174 without failure.
- **Clean State Reset:** Re-executed `database.sql` after automated tests to ensure the database starts in the clean sample state for the user.

### Important Changes Made After Review
- Added quick credential buttons to `Login.jsx` to make live college assessment demonstrations frictionless.
- Added shortcut "Pay" buttons directly inside the Maintenance Bills table for faster payment recording.
- Filter tabs (`All`, `Pending`, `Paid`) added to the Maintenance Bills view for improved user productivity.
- Cleaned up scratch scripts and verified zero compiler/linter warnings in both backend and frontend builds.
- Refactored all hardcoded API URLs, database connection credentials, server ports, and JWT secrets into `.env` configuration files across both backend and frontend, providing `.env.example` templates and `.gitignore` protection.
