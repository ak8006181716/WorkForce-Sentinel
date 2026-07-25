# API Reference

**Base URL**: `http://localhost:5000/api`

---

## Overview

### Authentication
Protected routes require a JWT token passed in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### Standard Response Layouts

**Success Response**:
```json
{
  "success": true,
  "message": "Supervisors retrieved successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

---

## Auth Endpoints (`/auth`)

### `POST /auth/login`
Authenticate user credentials and obtain a JWT token.

- **Access**: Public
- **Request**:
  ```json
  {
    "email": "admin@workforce.com",
    "password": "Password123!"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "66a1b2c3d4e5f67890123456",
        "name": "Admin User",
        "email": "admin@workforce.com",
        "role": "ADMIN",
        "siteId": null
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### `GET /auth/me`
Fetch currently logged in user's profile details.

- **Access**: Protected (`ADMIN`, `SUPERVISOR`)
- **Response (200)**: Returns user record and assigned site details if applicable.

---

### `POST /auth/logout`
Invalidate current session on client.

- **Access**: Protected (`ADMIN`, `SUPERVISOR`)

---

## Admin Endpoints (`/admin`)

> Requires role: `ADMIN`

### `GET /admin/dashboard`
Returns global dashboard counters: total workers, supervisors, total violations, and active escalated alerts.

---

### `GET /admin/supervisors`
Fetch supervisor list with search and pagination.

- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (filter name or email)

---

### `POST /admin/supervisors`
Create a new supervisor user account and optionally assign them to a site.

- **Request**:
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah.connor@workforce.com",
    "password": "Password123!",
    "siteId": "66a1b2c3d4e5f67890123400"
  }
  ```
- **Response (201)**: Created supervisor object.

---

### `PUT /admin/supervisors/:id`
Update supervisor account details or reassign site.

---

### `DELETE /admin/supervisors/:id`
Delete supervisor account.

---

### `GET /admin/alerts`
Fetch list of violations unacknowledged by supervisors for longer than 10 minutes (`ESCALATED` status).

- **Query Params**: `page`, `limit`, `siteId`, `search`

---

### `GET /admin/insights`
Aggregated dataset for charts: violations by site, PPE category counts, daily trends (last 14 days), and monthly totals.

---

## Supervisor Endpoints (`/supervisor`)

> Requires role: `SUPERVISOR` or `ADMIN`

### `GET /supervisor/dashboard`
Returns metrics scoped to the supervisor's assigned site: today's violations, pending count, acknowledged count, and escalated count.

---

### `GET /supervisor/violations`
Get site-scoped worker violations list.

- **Query Params**:
  - `status` (`PENDING`, `ACKNOWLEDGED`, `ESCALATED`)
  - `ppeType` (`HELMET`, `VEST`, `GLOVES`, `SAFETY_GLASSES`, `BOOTS`, `HARNESS`)
  - `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `search` (worker name or employee ID)
  - `page`, `limit`

---

### `PATCH /supervisor/violations/:id/acknowledge`
Acknowledge a violation incident and attach resolution notes.

- **Request**:
  ```json
  {
    "notes": "Issued worker new safety harness."
  }
  ```
- **Response (200)**: Updated violation document with `ACKNOWLEDGED` status.

---

### `GET /supervisor/reports/export`
Download a generated CSV audit log of site violations.

- **Query Params**: `startDate`, `endDate`, `status`, `ppeType`
- **Response**: CSV File attachment (`Content-Type: text/csv`)

---

## Simulation Endpoints (`/simulation`)

> Requires role: `ADMIN` or `SUPERVISOR`

### `POST /simulation/trigger`
Manually generate an IoT safety non-compliance event for testing.

- **Request**:
  ```json
  {
    "ppeType": "HELMET",
    "severity": "HIGH",
    "notes": "Hardhat unequipped near high-risk area"
  }
  ```

---

### `POST /simulation/escalate-now`
Manually trigger the 10-minute unacknowledged violation escalation background check.

- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Escalation process executed. 2 violation(s) escalated to admin.",
    "data": { "escalatedCount": 2 }
  }
  ```

---

## Utility Endpoints

- `GET /sites` (Protected): Active site dropdown list.
- `GET /workers?siteId=<ID>` (Protected): Active workers list for selection dropdowns.
