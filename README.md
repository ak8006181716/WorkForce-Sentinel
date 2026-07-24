# Workforce Management System (IoT PPE Monitoring & Escalation)

A full-stack workforce management application built with **React 19**, **Vite**, **Tailwind CSS**, **Node.js (ES Modules)**, **Express**, and **MongoDB**.

Tracks field workers equipped with IoT devices, logs Personal Protective Equipment (PPE) violations, and implements an automated **10-minute alert escalation engine** for unacknowledged incidents.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router, Axios, Recharts, Lucide Icons
- **Backend**: Node.js (ES Modules), Express.js, MongoDB (Mongoose ORM), JWT, bcryptjs, json2csv
- **Database**: MongoDB Atlas / Local MongoDB instance

---

## Key Features

- **JWT Authentication & RBAC**: Admin and Supervisor user roles with protected client routes and backend middleware.
- **Admin Portal**:
  - Dashboard with summary metrics (Total Workers, Total Supervisors, Total Violations, Escalated Alerts).
  - Supervisor CRUD (Create, Edit, Assign Site, Delete).
  - Admin Alerts page displaying violations unacknowledged for > 10 minutes.
  - Analytics & Data Insights (Violations by Site, PPE Type, Daily, Monthly).
- **Supervisor Portal**:
  - Dashboard (Today's, Pending, Acknowledged violations).
  - Violations table with search, filtering, and acknowledgment modal.
  - Export audit logs to CSV format.
- **10-Minute Escalation Engine**:
  - Background service running every 30 seconds scanning for `PENDING` violations where `timestamp <= now - 10 minutes`.
  - Automatically updates unacknowledged violations to `ESCALATED` status so they appear on the Admin Alerts page.

---

## Project Architecture

```
Assisment/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & env configuration
│   │   ├── controllers/        # Express route controllers
│   │   ├── middleware/         # Auth, RBAC, error handling
│   │   ├── models/             # Mongoose schemas (User, Site, Worker, Violation)
│   │   ├── routes/             # API routes
│   │   ├── seeders/            # Database seeder script
│   │   ├── services/           # Business logic & escalation cron
│   │   ├── utils/              # Custom ApiError, ApiResponse, CSV helper
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── api/                # Axios API services
    │   ├── components/         # Reusable UI components & layouts
    │   ├── context/            # AuthContext
    │   ├── pages/              # Admin & Supervisor pages
    │   └── App.jsx             # React router setup
    └── package.json
```

---

## Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds test sites, users, workers, and violations
npm run dev      # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@workforce.com` | `Password123!` |
| **Supervisor** | `john.doe@workforce.com` | `Password123!` |
