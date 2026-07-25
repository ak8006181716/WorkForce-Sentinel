# Database Schema Documentation

## Workforce Management & IoT PPE Monitoring System

This document provides a comprehensive overview of the database design, data models, schema relationships, index strategies, and data ingestion pipeline for the Workforce Management System.

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    SITE ||--o{ USER : "has assigned supervisors"
    SITE ||--o{ WORKER : "houses active workers"
    SITE ||--o{ VIOLATION : "location of incident"
    WORKER ||--o{ VIOLATION : "commits non-compliance"
    USER ||--o{ VIOLATION : "acknowledges (Supervisor)"

    SITE {
        ObjectId _id PK
        String name
        String code UK
        String location
        String description
        Boolean isActive
        Date createdAt
        Date updatedAt
    }

    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role "ADMIN | SUPERVISOR"
        ObjectId siteId FK
        Boolean isActive
        Date createdAt
        Date updatedAt
    }

    WORKER {
        ObjectId _id PK
        String employeeId UK
        String name
        ObjectId siteId FK
        String iotDeviceId UK
        String jobProfile
        String trade
        String department
        String mobileNumber
        String aadharNumber
        String status "ACTIVE | INACTIVE | ON_LEAVE"
        Date createdAt
        Date updatedAt
    }

    VIOLATION {
        ObjectId _id PK
        ObjectId workerId FK
        ObjectId siteId FK
        String ppeType "HELMET | VEST | GLOVES | SAFETY_GLASSES | BOOTS | HARNESS"
        String severity "LOW | MEDIUM | HIGH | CRITICAL"
        Date timestamp
        String status "PENDING | ACKNOWLEDGED | ESCALATED"
        ObjectId acknowledgedBy FK
        Date acknowledgedAt
        Date escalatedToAdminAt
        String notes
        Date createdAt
        Date updatedAt
    }
```

---

## 2. Collections & Schema Specifications

### 2.1 `sites` Collection (`Site` Model)
Stores physical construction sites, refineries, and infrastructure client projects.

| Field | Type | Options / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique identifier for the site |
| `name` | `String` | `required`, `trim`, `unique`, `maxlength: 100` | Human-readable site name (e.g. Apex Construction Hub) |
| `code` | `String` | `required`, `trim`, `unique`, `uppercase` | Short unique code (e.g. `APEX-01`, `TITAN-02`) |
| `location` | `String` | `required`, `trim` | Physical address or sector location |
| `description`| `String` | `trim` | Project operational details |
| `isActive` | `Boolean` | `default: true` | Soft-delete / active status flag |
| `createdAt` | `Date` | Auto Timestamp | Schema creation timestamp |
| `updatedAt` | `Date` | Auto Timestamp | Schema last update timestamp |

---

### 2.2 `users` Collection (`User` Model)
Stores system authentication credentials and user profiles for Admins and Site Supervisors.

| Field | Type | Options / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique user ID |
| `name` | `String` | `required`, `trim` | Full name of the user |
| `email` | `String` | `required`, `trim`, `lowercase`, `unique` | User login email address |
| `password` | `String` | `required`, `select: false` | Bcrypt hashed password (cost factor 10) |
| `role` | `String` | `enum: ['ADMIN', 'SUPERVISOR']`, `default: 'SUPERVISOR'` | Role-based access control level |
| `siteId` | `ObjectId` | `ref: 'Site'`, `default: null` | Foreign key referencing assigned Site (for Supervisors) |
| `isActive` | `Boolean` | `default: true` | Account active flag |
| `createdAt` | `Date` | Auto Timestamp | Record creation timestamp |
| `updatedAt` | `Date` | Auto Timestamp | Record last update timestamp |

---

### 2.3 `workers` Collection (`Worker` Model)
Stores field personnel equipped with IoT telemetry wearables. Derived from the `workers_dataset.xlsx` dataset.

| Field | Type | Options / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Internal worker identifier |
| `employeeId` | `String` | `required`, `trim`, `uppercase`, `unique` | Official Worker ID from company roster |
| `name` | `String` | `required`, `trim` | Full name of the worker |
| `siteId` | `ObjectId` | `ref: 'Site'`, `required` | Foreign key linking worker to current workplace site |
| `iotDeviceId` | `String` | `required`, `trim`, `unique` | Hardware ID of assigned IoT safety monitor |
| `jobProfile` | `String` | `trim`, `default: 'Field Operator'` | Operational designation |
| `trade` | `String` | `trim`, `default: 'GENERAL_CONSTRUCTION'` | Trade specialty |
| `department` | `String` | `trim` | Department designation |
| `mobileNumber`| `String` | `trim` | Contact number |
| `aadharNumber`| `String` | `trim` | Government identity number |
| `status` | `String` | `enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE']`, `default: 'ACTIVE'` | Operational availability status |
| `createdAt` | `Date` | Auto Timestamp | Record creation timestamp |
| `updatedAt` | `Date` | Auto Timestamp | Record last update timestamp |

**Indexes:**
- `{ siteId: 1 }`: Fast lookup of all workers assigned to a specific site.

---

### 2.4 `violations` Collection (`Violation` Model)
Stores non-compliance safety incidents transmitted by worker IoT devices.

| Field | Type | Options / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Primary Key, Auto-generated | Unique violation record ID |
| `workerId` | `ObjectId` | `ref: 'Worker'`, `required` | Foreign key referencing offending worker |
| `siteId` | `ObjectId` | `ref: 'Site'`, `required` | Foreign key referencing site where violation occurred |
| `ppeType` | `String` | `enum: ['HELMET', 'VEST', 'GLOVES', 'SAFETY_GLASSES', 'BOOTS', 'HARNESS']` | Category of unequipped safety gear |
| `severity` | `String` | `enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']`, `default: 'MEDIUM'` | Threat level rating |
| `timestamp` | `Date` | `required`, `default: Date.now` | Time when IoT sensor detected safety infraction |
| `status` | `String` | `enum: ['PENDING', 'ACKNOWLEDGED', 'ESCALATED']`, `default: 'PENDING'` | Lifecycle state of incident |
| `acknowledgedBy`| `ObjectId` | `ref: 'User'`, `default: null` | Foreign key of Supervisor who acknowledged incident |
| `acknowledgedAt`| `Date` | `default: null` | Time when supervisor clicked acknowledge button |
| `escalatedToAdminAt`| `Date` | `default: null` | Time when system auto-escalated incident to Admin |
| `notes` | `String` | `trim` | Contextual details / supervisor resolution note |
| `createdAt` | `Date` | Auto Timestamp | Record creation timestamp |
| `updatedAt` | `Date` | Auto Timestamp | Record last update timestamp |

**Indexes:**
- `{ status: 1, timestamp: 1 }`: Enables optimal query performance for the 10-minute escalation background process scanning `PENDING` items.
- `{ siteId: 1, timestamp: -1 }`: Optimizes site-filtered supervisor violation dashboards.
- `{ ppeType: 1, timestamp: -1 }`: Optimizes analytics aggregation grouped by PPE category.
- `{ workerId: 1, timestamp: -1 }`: Enables fast history lookup per worker.

---

## 3. Data Seeding & Dataset Ingestion Strategy

The database is populated using `backend/src/seeders/seed.js` via `npm run seed`.

1. **Excel Parsing**: Uses `xlsx` (SheetJS) to import the provided `workers_dataset.xlsx`.
2. **Entity Generation**:
   - Generates initial operational client sites (`Apex Construction Hub`, `Titan Energy Refinery`, `Vanguard Infra Tunnel`).
   - Creates default Admin account (`admin@workforce.com`) and Site Supervisors (`john.doe@workforce.com`, etc.).
   - Maps each worker row from the dataset into the `Worker` model, auto-assigning unique IoT device IDs (`IOT-WRK0001`).
3. **Simulation Data Seeding**:
   - Injects realistic non-compliance incidents with varying timestamps (`PENDING`, `ACKNOWLEDGED`, `ESCALATED`) to populate dashboards and analytics charts immediately upon startup.
