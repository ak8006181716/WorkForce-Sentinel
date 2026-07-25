# Workforce Management System

A full-stack workforce operations and safety monitoring web application built with React 19, Vite, Tailwind CSS v4, Node.js (Express), and MongoDB.

The system tracks field workers using simulated IoT safety wearables, logs Personal Protective Equipment (PPE) non-compliance incidents, and triggers an automated 10-minute escalation workflow for unacknowledged alerts.

---

## Documentation

Detailed documentation is available in the `docs/` folder:

- [Database Schema & ER Diagram](file:///e:/Assisment/docs/DATABASE_SCHEMA.md)
- [API Reference](file:///e:/Assisment/docs/API_DOCUMENTATION.md)
- [System Architecture & Escalation Design](file:///e:/Assisment/docs/PROJECT_DOCUMENTATION.md)

---

## Key Features

- **Authentication & Role-Based Access (RBAC)**: Secure JWT login for Admins and Site Supervisors.
- **Admin Portal**:
  - Dashboard with key metrics (workers, supervisors, total violations, escalated alerts).
  - Supervisor management (create, update, reassign site).
  - Alerts page listing violations unacknowledged by supervisors for > 10 minutes.
  - Analytics charts (violations by site, PPE type, severity distribution, daily/monthly trends).
- **Supervisor Portal**:
  - Site-scoped dashboard metrics.
  - Worker violations list with filters (PPE type, status, severity) and search.
  - Modal interface to acknowledge violations with resolution notes.
  - Export audit logs to CSV.
- **Automated Escalation Service**:
  - Background task scanning pending violations every 30 seconds.
  - Automatically escalates any incident unacknowledged for over 10 minutes to the Admin portal.
- **Data Ingestion & IoT Simulation**:
  - Seed script parses `workers_dataset.xlsx` to populate initial workers, sites, and sample violations.
  - Live simulation stream generates periodic IoT safety violation events.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Recharts, Lucide React
- **Backend**: Node.js (ES Modules), Express.js, Mongoose (MongoDB ORM), JWT, bcryptjs, json2csv, xlsx
- **Database**: MongoDB (Local or Atlas)

---

## Project Structure

```
.
├── backend/
│   ├── data/                   # Input dataset (workers_dataset.xlsx)
│   ├── src/
│   │   ├── config/             # DB & env config
│   │   ├── controllers/        # Express route handlers
│   │   ├── middleware/         # Auth, RBAC, error handling
│   │   ├── models/             # Mongoose schemas (User, Site, Worker, Violation)
│   │   ├── routes/             # API routes
│   │   ├── seeders/            # Excel parser & seeder
│   │   ├── services/           # Escalation worker & business logic
│   │   ├── utils/              # Helper utilities (ApiError, ApiResponse, CSV)
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point & background tasks
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/                # API client functions
│   │   ├── components/         # Common UI & layouts
│   │   ├── context/            # AuthContext state
│   │   ├── pages/              # Admin & Supervisor pages
│   │   └── App.jsx             # React routing setup
│   └── package.json
└── docs/                       # Project documentation
    ├── DATABASE_SCHEMA.md
    ├── API_DOCUMENTATION.md
    └── PROJECT_DOCUMENTATION.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed     # Parses Excel dataset and seeds database
npm run dev      # Starts server on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## Default Accounts

| Role | Email | Password | Site Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@workforce.com` | `Password123!` | All Sites |
| **Supervisor** | `john.doe@workforce.com` | `Password123!` | Apex Construction Hub |
| **Supervisor** | `sarah.connor@workforce.com` | `Password123!` | Titan Energy Refinery |
| **Supervisor** | `michael.scott@workforce.com` | `Password123!` | Vanguard Infra Tunnel |

---

## Testing Escalation

1. Sign in as supervisor (`john.doe@workforce.com`).
2. Observe unacknowledged violations on the Violations page.
3. If an incident remains unacknowledged for 10 minutes, the background service marks it as `ESCALATED`.
4. Sign in as admin (`admin@workforce.com`) and navigate to the Alerts page to view the escalated alert.
5. (Optional) Call `POST /api/simulation/escalate-now` to run the escalation scan manually.
