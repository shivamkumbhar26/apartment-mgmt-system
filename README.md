# Apartment Society Management System

A full-stack, locally runnable web application developed for college assessment and evaluation. The system enables seamless, transparent management of an apartment housing society's flats, residents, monthly maintenance billing, collection payments, service complaints, and community expenses.

> **Important Database Note:**  
> **The database is initialized manually using database.sql.**  
> **No database migration system is used.**

---

## 1. Project Overview
The Apartment Society Management System provides role-based access for two main stakeholders:
- **Society Manager / Admin:** Oversees the residential complex, configures flat inventory, onboards and allocates flats to residents, generates monthly maintenance invoices, tracks collections and logs expenses, and delegates service complaints to staff.
- **Resident:** Accesses their personalized portal to view allocated apartment unit specifications, inspect pending and historical maintenance invoices, review payment receipts, raise service complaints with priority levels, and track technician progress in real time.

---

## 2. Business Problem
Residential apartment societies often struggle with:
- Disconnected records spread across paper ledgers, spreadsheets, and messaging groups.
- Lack of transparency in monthly maintenance dues and payment receipts.
- Unstructured grievance redressal for plumbing, electrical, and facility breakdowns.
- Inaccurate tracking of society operational expenditures (security, elevator maintenance, sanitation).

This system resolves these issues through a centralized, normalized database and dedicated, role-isolated portals.

---

## 3. Key Features

### Admin / Society Manager
- **Dynamic Executive Dashboard:** Real-time metrics calculated directly from MySQL queries (Total Flats, Occupied vs. Vacant units, Active Residents, Pending vs. Paid Bills, Total Maintenance Collections, Open Complaints, and Society Expenses).
- **Flats Management:** Register blocks/wings, configure flat types (1 BHK, 2 BHK, 3 BHK, Penthouse), and monitor occupancy.
- **Residents Directory:** Register residents, create login credentials, assign/unassign flats, and manage tenant lifecycles.
- **Maintenance Billing:** Generate individual invoices or batch-generate monthly maintenance bills across all occupied units.
- **Payments Ledger:** Record payments across multiple modes (UPI, Net Banking, Cards, Cash, Cheque) and automatically update bill statuses from `PENDING` to `PAID`.
- **Complaints & Grievance Redressal:** Review service requests, assign specialized technicians, update progress states (`OPEN` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`), and record resolution remarks.
- **Society Expenses:** Record and audit recurring operational expenditures (lift servicing, security personnel, tank cleaning, landscaping).

### Resident
- **Resident Dashboard:** Snapshot of flat status, pending dues amount, paid invoices, and active complaints.
- **My Flat:** View allocated unit specifications, block, floor, and registration details.
- **My Bills:** Review itemized monthly maintenance invoices, due dates, and statuses.
- **My Payments:** Access complete payment history with receipt numbers and bank reference IDs.
- **Complaint Management:** Log service tickets with category and urgency level, monitor ticket lifecycle, and view technician resolution notes.

---

## 4. Technology Stack

- **Backend:** Node.js, Express.js (REST APIs, CommonJS modular architecture)
- **Frontend:** React 19, Vite, React Router v7, React Toastify, Bootstrap 5 & Bootstrap Icons (CDN)
- **Database:** MySQL 8.x (Connection pooling via `mysql2`, parameterized raw queries, no ORMs)
- **Authentication & Security:** JSON Web Tokens (`jsonwebtoken`), SHA-256 password hashing (`crypto-js`)
- **HTTP Client:** Axios (Centralized service layer)

---

## 5. Architecture Overview

The system strictly follows the architectural, routing, and database patterns established in the reference project:

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)               │
│   Pages: AdminDashboard, Flats, Residents, Bills, etc. │
│   Context: LoginContext (loginStatus, role, userData)  │
│   Services: Centralized Axios modules with JWT header  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST (JSON)
                            │ Header: { token: "<JWT>" }
┌───────────────────────────▼────────────────────────────┐
│               Backend (Node.js + Express)              │
│   server.js: Global CORS, JSON, and authUser middleware│
│   Routes: /auth/login, /admin/*, /resident/*           │
│   Response Envelope: { status: "success"|"error", data }│
└───────────────────────────┬────────────────────────────┘
                            │ Parameterized Raw SQL
                            │ mysql2 connection pool
┌───────────────────────────▼────────────────────────────┐
│                    MySQL Database                      │
│   Schema: apartment_society_db                         │
│   Normalized tables with foreign keys and indexes      │
└────────────────────────────────────────────────────────┘
```

---

## 6. Folder Structure

```text
ApartmentSocietyManager/
├── database.sql                  # Complete SQL schema, constraints, indexes & sample data
├── package.json                  # Backend dependencies and scripts
├── server.js                     # Express server entry point & router mounting
├── test_full_system.js           # Automated end-to-end regression & workflow test suite
├── db/
│   └── pool.js                   # MySQL connection pool configuration (mysql2)
├── utils/
│   ├── auth.js                   # JWT verification & role authorization middleware
│   ├── config.js                 # JWT secret key, default credentials, port settings
│   └── result.js                 # Standardized createResult response packaging utility
├── routes/
│   ├── common.js                 # Public routes (/auth/login, /health)
│   ├── admin.js                  # Admin-restricted endpoints (/admin/*)
│   └── resident.js               # Resident-restricted endpoints with data isolation (/resident/*)
└── frontend/                     # React + Vite Single Page Application
    ├── index.html                # Bootstrap 5, Bootstrap Icons, Google Fonts
    ├── package.json              # Frontend dependencies and Vite scripts
    ├── vite.config.js            # Vite configuration
    └── src/
        ├── main.jsx              # React DOM root mounting BrowserRouter
        ├── App.jsx               # Routes, LoginContext provider, route guards, ToastContainer
        ├── App.css / index.css   # Custom styling, status badges, layout utilities
        ├── components/
        │   ├── Navbar.jsx        # Role-switching responsive navigation bar
        │   ├── AdminLayout.jsx   # Admin view wrapper
        │   └── ResidentLayout.jsx# Resident view wrapper
        ├── pages/
        │   ├── Login.jsx         # Sign-in portal with quick demo credential buttons
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── ManageFlats.jsx
        │   │   ├── ManageResidents.jsx
        │   │   ├── ManageBills.jsx
        │   │   ├── ManagePayments.jsx
        │   │   ├── ManageComplaints.jsx
        │   │   └── ManageExpenses.jsx
        │   └── resident/
        │       ├── ResidentDashboard.jsx
        │       ├── MyFlat.jsx
        │       ├── MyBills.jsx
        │       ├── MyPayments.jsx
        │       ├── MyComplaints.jsx
        │       └── RaiseComplaint.jsx
        └── services/
            ├── config.js         # API base URL configuration
            ├── authService.js    # Authentication API calls and token storage
            ├── adminService.js   # Admin portal API calls
            └── residentService.js# Resident portal API calls
```

---

## 7. Database Setup & Execution of `database.sql`

**The database is initialized manually using database.sql. No database migration system is used.**

### How to execute database.sql:

#### Option A: Using MySQL Command Line Client / Terminal
Open your terminal or command prompt and execute:
```bash
mysql -u root -p < database.sql
```
*(Enter your MySQL root password when prompted)*

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench and connect to your local MySQL instance.
2. Go to **File &rarr; Open SQL Script...** and select `database.sql`.
3. Click the **Execute (Lightning bolt)** icon to run the script.
4. Refresh your schemas list; `apartment_society_db` will be created with all tables and sample records.

---

## 8. Environment Variables Configuration

Both backend and frontend utilize `.env` files for configurable parameters, sensitive credentials, and URLs.

### Backend `.env` (`ApartmentSocietyManager/.env`)
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=manager
DB_NAME=apartment_society_db

# Security & Authentication
JWT_SECRET=APT_SOCIETY_JWT_SECRET_KEY_2026_COLLEGE_ASSESSMENT
DEFAULT_PASSWORD_HASH=2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84
```
*(Reference template available in `.env.example`)*

### Frontend `.env` (`ApartmentSocietyManager/frontend/.env`)
```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:4000
```
*(Reference template available in `frontend/.env.example`)*

---

## 9. Backend Setup & Run

1. Navigate to the root project directory:
   ```bash
   cd ApartmentSocietyManager
   ```
2. Verify or customize `.env` as needed.
3. Install backend dependencies (if not already installed):
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will start listening on `http://localhost:4000` (or `PORT` specified in `.env`).*

---

## 9. Frontend Setup & Run

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ApartmentSocietyManager/frontend
   ```
2. Install frontend dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the displayed Vite URL (e.g. `http://localhost:5173` or `http://localhost:5174`).

---

## 10. Automated Testing

An automated regression test suite is included that exercises all 6 core workflows and security controls:
```bash
cd ApartmentSocietyManager
npm test
```
This script tests:
1. Admin login &rarr; Flat creation &rarr; Resident onboarding &rarr; Flat assignment
2. Maintenance bill generation & duplication checks
3. Payment recording & dynamic transition from `PENDING` to `PAID`
4. Resident data isolation (verifying resident sees only their own flat, bills, and payments)
5. Complete complaint lifecycle (`OPEN` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`)
6. Society expense recording and live dashboard recalculation
7. Security checks (verifying role authorization prevents unauthorized horizontal or vertical access)

---

## 11. Sample Credentials

For assessment demonstration, you can type the credentials below or click the **Quick Demo Credentials** buttons directly on the Login page:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@society.com` | `admin123` | Society Administrator & Manager |
| **Resident** | `rahul@example.com` | `resident123` | Resident of Flat A-101 (Active) |
| **Resident** | `priya@example.com` | `resident123` | Resident of Flat A-102 (Active) |
| **Resident** | `amit@example.com` | `resident123` | Resident of Flat B-201 (Active) |
| **Resident** | `sneha@example.com` | `resident123` | Resident of Flat B-202 (Active) |

---

## 12. Main Business Workflows

### Workflow 1: Flat and Resident Management
1. Admin logs into the Admin Portal.
2. Admin navigates to **Flats** and creates a unit (e.g., Block `C`, Flat `C-101`, Floor `1`, Type `2 BHK`). The flat status is initialized as `VACANT`.
3. Admin navigates to **Residents** and registers a new resident (e.g., Vikram Malhotra, `vikram@example.com`).
4. Admin assigns Vikram to flat `C-101`. Flat status automatically updates to `OCCUPIED`.
5. Vikram can now log in using `vikram@example.com` / `resident123` and access Flat `C-101` details.

### Workflow 2: Maintenance Billing
1. Admin navigates to **Maintenance Bills**.
2. Admin creates a bill for Flat `C-101` for Month `November 2026`, Amount `₹3200`, Due Date `2026-11-15`.
3. Bill is created with status `PENDING`.
4. Dashboard pending bills counter increases immediately.

### Workflow 3: Payment Recording
1. Admin navigates to **Payments** (or clicks "Pay" directly on the bill in the bills table).
2. Admin records payment: Amount `₹3200`, Mode `UPI`, Reference `UPI-NOV-998877`.
3. The bill status instantly updates to `PAID`.
4. Total Society Maintenance Collection in the Admin Dashboard recalculates live.

### Workflow 4: Grievance / Complaint Lifecycle
1. Resident logs in and clicks **Raise Complaint**.
2. Resident submits ticket: Category `Plumbing`, Title `Water leakage in kitchen sink`, Priority `HIGH`. Ticket is created with status `OPEN`.
3. Admin opens **Complaints**, inspects the ticket, and assigns it to technician `Mukesh Plumber`. Ticket status advances to `ASSIGNED`.
4. Technician commences work; Admin updates status to `IN_PROGRESS`.
5. Upon repair completion, Admin marks status `RESOLVED` with remarks `Washer replaced, no leakage`.
6. Resident checks **My Complaints** and sees `RESOLVED` with the technician's notes.

### Workflow 5: Society Expenses
1. Admin navigates to **Society Expenses** and clicks **Record Society Expense**.
2. Admin enters: Category `Maintenance`, Description `Fire extinguisher refilling`, Amount `₹4500`, Mode `ONLINE`.
3. Expense is appended to the ledger, and the Dashboard Total Society Expenses updates.

---

## 13. API Overview

### Common & Authentication
- `POST /auth/login`: Authenticates user and returns JWT token and role payload.
- `GET /health`: Health check endpoint.

### Admin APIs (`checkAdminAuthorization` required)
- `GET /admin/dashboard/stats`: Returns live aggregated database metrics.
- `GET /admin/flats`: List all flats with occupant details.
- `POST /admin/flats`: Create new flat.
- `PUT /admin/flats/:id`: Update flat details.
- `DELETE /admin/flats/:id`: Delete vacant flat.
- `GET /admin/residents`: List all residents with assigned flat information.
- `POST /admin/residents`: Register resident and provision login account.
- `PUT /admin/residents/:id/assign-flat`: Assign or reassign flat to resident.
- `PUT /admin/residents/:id/unassign-flat`: Unassign flat and set status to `VACANT`.
- `DELETE /admin/residents/:id`: Delete resident and vacate flat.
- `GET /admin/bills`: List maintenance bills with payment statuses.
- `POST /admin/bills`: Create a maintenance bill.
- `POST /admin/bills/generate-batch`: Batch generate bills for all occupied flats.
- `DELETE /admin/bills/:id`: Delete unpaid bill.
- `GET /admin/payments`: List recorded payment transactions.
- `POST /admin/payments`: Record a payment and mark bill as `PAID`.
- `GET /admin/complaints`: List all resident complaints.
- `PUT /admin/complaints/:id/assign`: Assign technician to complaint.
- `PUT /admin/complaints/:id/status`: Update complaint status and resolution notes.
- `GET /admin/expenses`: List society operational expenses.
- `POST /admin/expenses`: Record a society expense.
- `DELETE /admin/expenses/:id`: Delete an expense record.

### Resident APIs (`checkResidentAuthorization` required)
- `GET /resident/dashboard`: Resident summary metrics.
- `GET /resident/my-flat`: Authenticated resident's flat specifications.
- `GET /resident/my-bills`: Authenticated resident's maintenance invoices.
- `GET /resident/my-payments`: Authenticated resident's payment history.
- `GET /resident/my-complaints`: Authenticated resident's service requests.
- `POST /resident/complaints`: Raise a new complaint.
- `PUT /resident/change-password`: Update own login password.

---

## 14. Known Assumptions & Business Rules
1. **One Resident per Flat:** In accordance with the assessment requirements, each flat can have at most one active primary resident assigned at any time.
2. **Billing Integrity:** A maintenance bill cannot be duplicated for the same flat in the same month (`UNIQUE(flat_id, month)` constraint).
3. **Payment Integrity:** A bill must exist before a payment can be recorded, and each bill is linked to its payment record.
4. **Data Isolation:** All resident endpoints resolve the resident's identity directly from the authenticated JWT token payload, preventing unauthorized access across accounts.








Testing : 

Step 0: Ensure Services Are Running
If you ever need to start them fresh in two separate terminals:

Terminal 1 (Backend):

powershell
cd "d:\Campus Assessment\ApartmentSocietyManager"
npm start
You should see: Apartment Society Management System API running on port 4000

Terminal 2 (Frontend):

powershell
cd "d:\Campus Assessment\ApartmentSocietyManager\frontend"
npm run dev
Open the URL shown in your terminal (usually http://localhost:5173 or http://localhost:5174).

(Note: Both the backend and frontend dev servers are already currently running right now in background!)

Step 1: Open the Application in Your Browser
Open your browser (Chrome, Edge, etc.) and go to: 👉 http://localhost:5174/ (or http://localhost:5173/)
You will see the Account Sign In page with:
Skyline Heights branding on the left
Three Quick Demo Credentials buttons
The login form on the right
Step 2: Test Admin Login & Real-Time Dashboard
On the login page, click the quick-fill button:
👉 ADMIN admin@society.com (admin123)
(or manually type admin@society.com and admin123)
Click Sign In.
You will be redirected to the Society Executive Dashboard:
Notice the live statistics queried directly from MySQL:
Total Flats: 8
Occupied Flats: 4
Vacant Flats: 4
Active Residents: 4
Total Maintenance Collection: ₹16,500
Society Expenses: ₹57,000
Open Complaints: 3
Step 3: Test Flat & Resident Workflow (Admin)
A. Create a New Flat
In the top navigation bar, click Flats.
Click the blue + Add New Flat button.
Fill in:
Block / Wing: C
Flat Number: C-101
Floor: 1
Flat Type: 2 BHK
Click Save Flat.
You will see a success toast, and C-101 will appear in the table with a grey VACANT badge and Assigned Resident: None.
B. Register a Resident & Assign Flat
In the top navigation bar, click Residents.
Click the blue + Register New Resident button.
Fill in:
Full Name: Vikram Malhotra
Email: vikram@example.com
Phone: 9876500001
Initial Password: resident123
Assign Flat: Select Flat C-101 (C Block - 2 BHK)
Click Register Resident.
Notice:
Vikram appears in the Residents table assigned to Flat C-101.
Click back on Flats in the top navigation:
Flat C-101 now has a purple OCCUPIED badge, and Assigned Resident shows Vikram Malhotra!
Step 4: Test Maintenance Bill Creation
In the top navigation bar, click Maintenance Bills.
Click Create Single Bill.
Fill in:
Target Flat: Select Flat C-101 (C Block) - Occupied by Vikram Malhotra
Billing Month: November 2026
Bill Amount (₹): 3200
Due Date: Choose any future date (e.g., 15-11-2026)
Click Generate Bill.
The bill appears in the table with:
Flat: C-101
Resident: Vikram Malhotra
Month: November 2026
Amount: ₹3,200
Status: yellow PENDING badge
A green Pay button under Actions.
Step 5: Test Payment Recording & Live Dashboard Update
In the Maintenance Bills table, find the C-101 bill and click the green Pay button. (It automatically opens the payment dialog with the bill and amount pre-filled!)
Check the details:
Amount Paid: 3200
Payment Mode: Select UPI (GPay / PhonePe / Paytm)
Transaction / Ref No: UPI-TEST-998877
Remarks: Paid online via GPay
Click Submit Payment.
You will see a success toast: Payment recorded successfully. Bill marked as PAID.
Notice:
You are redirected to Payments and see receipt RCPT-... for C-101 with ₹3,200.
Click on Maintenance Bills:
The status for Flat C-101 has flipped from PENDING to a green PAID badge!
Click on Dashboard:
Notice Total Collection has increased live by ₹3,200 (from ₹16,500 to ₹19,700)!
Step 6: Test Resident Login & Personal Data Isolation
In the top navigation bar, click the red Logout button.
You are back on the login page.
In the quick credentials box, click:
👉 RESIDENT rahul@example.com (Flat A-101)
Click Sign In.
You are now in the Resident Portal:
Header shows: Rahul Sharma (Flat: A-101)
Dashboard shows only Rahul's metrics.
Click My Flat:
Displays Flat A-101, Block A, Floor 1, 2 BHK, with Rahul's contact information.
Data Isolation Check: Rahul cannot see Vikram's or Priya's flat!
Click My Bills:
Displays only the maintenance bills belonging to Flat A-101.
Click My Payments:
Displays only receipts for payments made by Flat A-101.
Step 7: Test Complaint Lifecycle (Resident & Admin)
A. Resident Raises a Complaint
While logged in as Rahul, click Raise Complaint in the top navigation bar.
Fill in:
Complaint Category: Plumbing
Priority Level: HIGH - Urgent attention needed
Complaint Title: Kitchen tap dripping water
Detailed Description: Continuous leakage from main sink tap, washer needs replacement.
Click Register Complaint.
You are taken to Complaints where your ticket appears with a red OPEN badge and Assigned Staff: Pending Assignment.
Click Logout at the top right.
B. Admin Assigns and Resolves the Complaint
Log in back as Admin (admin@society.com / admin123).
In the top navigation bar, click Complaints.
Locate Rahul's ticket: Kitchen tap dripping water.
Click Assign:
Enter Assignee Name: Mukesh Plumber
Click Assign Staff.
Notice the status updates to yellow ASSIGNED and shows Mukesh Plumber.
Click Status:
Set Status to: RESOLVED
Remarks: Replaced rubber washer and sealed pipe joint. Tested ok.
Click Update Status.
Status badge turns green: RESOLVED!
C. Resident Verifies Resolution
Log out of Admin and log back in as Rahul (rahul@example.com / resident123).
Click Complaints in the navigation.
Verify ticket Kitchen tap dripping water shows green RESOLVED with the remarks: Replaced rubber washer and sealed pipe joint. Tested ok.
Step 8: Test Society Expenses Ledger
Log in as Admin (admin@society.com / admin123).
Click Society Expenses in the navigation bar.
Click the blue + Record Society Expense button.
Fill in:
Category: Repairs & Replacements
Description / Vendor: Common corridor emergency LED lighting repair
Amount (₹): 3500
Expense Date: Today's date
Payment Mode: Online Bank Transfer / NEFT
Click Record Expense.
The expense is added to the ledger, and the total outflow updates immediately.
Click Dashboard:
Society Expenses on the dashboard has increased by ₹3,500!