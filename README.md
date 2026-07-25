# Workforce Management System (IoT PPE Monitoring & Escalation)

A full-stack workforce operations and safety monitoring application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Node.js (ES Modules)**, **Express**, and **MongoDB**.

Tracks field workers equipped with IoT safety wearables, logs Personal Protective Equipment (PPE) violations, and implements an automated **10-minute alert escalation engine** for unacknowledged incidents.

---

## 📚 Project Documentation Quick Links

- [📁 Database Schema Documentation](file:///e:/Assisment/docs/DATABASE_SCHEMA.md) *(Includes ER Diagram, Collections, & Field Specifications)*
- [🔌 API Documentation](file:///e:/Assisment/docs/API_DOCUMENTATION.md) *(Endpoints, Request Bodies, Query Parameters, & JSON Payloads)*
- [🏗️ System Architecture & Project Documentation](file:///e:/Assisment/docs/PROJECT_DOCUMENTATION.md) *(10-Min Escalation Workflow, RBAC Matrix, & Design Decisions)*

---

## 🚀 Quick Features Overview

- **Secure JWT Authentication & RBAC**: Dedicated modules and dashboards for **Admin** and **Supervisor** roles.
- **Admin Portal**:
  - Dashboard with key metrics (Total Workers, Supervisors, Violations, Escalated Alerts).
  - Supervisor CRUD management & site re-assignment.
  - Admin Alerts page displaying violations unacknowledged by supervisors for > 10 minutes.
  - Data insights & operational analytics charts (Violations by Site, PPE Category, Severity, Trends).
- **Supervisor Portal**:
  - Site-scoped dashboard (Today's, Pending, Acknowledged, Escalated counts).
  - Worker non-compliance violation table with search, filters, and modal acknowledgment.
  - Export audit logs to downloadable CSV format.
- **10-Minute Escalation Engine**:
  - Background service running every 30 seconds scanning for `PENDING` violations where `timestamp <= now - 10 minutes`.
  - Automatically updates unacknowledged violations to `ESCALATED` status so they appear on the Admin Alerts page.
- **IoT Data Dataset Ingestion & Real-Time Simulation**:
  - Seed script parses `workers_dataset.xlsx` to populate worker profiles linked with hardware IoT devices.
  - Built-in IoT stream simulator producing random live non-compliance events.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Recharts, Lucide Icons
- **Backend**: Node.js (ES Modules), Express.js, MongoDB (Mongoose ORM), JWT, bcryptjs, json2csv, xlsx
- **Database**: MongoDB (Local Instance / MongoDB Atlas)

---

## 📁 Repository Structure

```text
Assisment/
├── backend/
│   ├── data/                   # Raw Excel dataset (workers_dataset.xlsx)
│   ├── src/
│   │   ├── config/             # DB connection & environment settings
│   │   ├── controllers/        # Route controllers (Auth, Admin, Supervisor, Simulation)
│   │   ├── middleware/         # Auth, RBAC, error handling
│   │   ├── models/             # Mongoose schemas (User, Site, Worker, Violation)
│   │   ├── routes/             # REST API routing definitions
│   │   ├── seeders/            # Excel parser & database seeder
│   │   ├── services/           # Escalation cron & business logic
│   │   ├── utils/              # Custom ApiError, ApiResponse, CSV helper
│   │   ├── app.js              # Express application setup
│   │   └── server.js           # Server entry point & background intervals
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios service modules
│   │   ├── components/         # Reusable UI components & layouts
│   │   ├── context/            # AuthContext & state management
│   │   ├── pages/              # Admin & Supervisor portal views
│   │   └── App.jsx             # React router setup
│   └── package.json
└── docs/                       # Project Documentation Suite
    ├── DATABASE_SCHEMA.md      # ER Diagram & DB Specifications
    ├── API_DOCUMENTATION.md    # Full REST API Reference
    └── PROJECT_DOCUMENTATION.md# System Architecture & Workflows
```

---

## ⚡ Local Setup & Execution Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local running MongoDB service (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas Connection String.

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed the database from workers_dataset.xlsx
npm run seed

# Start the development server (Runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server (Runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Default Test Credentials

| Role | Email | Password | Site Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@workforce.com` | `Password123!` | All Sites (Global View) |
| **Supervisor** | `john.doe@workforce.com` | `Password123!` | Apex Construction Hub |
| **Supervisor** | `sarah.connor@workforce.com` | `Password123!` | Titan Energy Refinery |
| **Supervisor** | `michael.scott@workforce.com` | `Password123!` | Vanguard Infra Tunnel |

---

## 🧪 Testing the 10-Minute Escalation Workflow

1. Log in as **Supervisor** (`john.doe@workforce.com`).
2. Observe newly generated violations on the **Violations** tab.
3. Leave an incident unacknowledged for **10 minutes** (or send a POST request to `/api/v1/simulation/escalate-now` to trigger instant evaluation).
4. Log in as **Admin** (`admin@workforce.com`) and navigate to the **Alerts** page.
5. Notice that the unacknowledged incident has auto-escalated to `ESCALATED` status and is listed on the Admin Alerts screen.
