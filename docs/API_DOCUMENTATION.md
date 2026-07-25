# API Documentation

## Workforce Management & IoT PPE Monitoring System

**Base URL**: `http://localhost:5000/api/v1`  
**Protocol**: `HTTP/REST`  
**Data Format**: `application/json` (CSV download for reports)

---

## 1. Authentication & Response Format

### 1.1 Authorization Header
All protected endpoints require a JSON Web Token (JWT) provided in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

### 1.2 Standard Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### 1.3 Standard Error Response Format
```json
{
  "success": false,
  "message": "Invalid credentials provided",
  "errors": []
}
```

---

## 2. Authentication Endpoints (`/auth`)

### 2.1 User Login
Authenticates Admin or Supervisor user and returns JWT token.

- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@workforce.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
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

### 2.2 Current User Profile
Retrieves authenticated user details.

- **Endpoint**: `GET /auth/me`
- **Access**: Protected (`ADMIN`, `SUPERVISOR`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved",
    "data": {
      "user": {
        "id": "66a1b2c3d4e5f67890123456",
        "name": "John Doe",
        "email": "john.doe@workforce.com",
        "role": "SUPERVISOR",
        "siteId": {
          "_id": "66a1b2c3d4e5f67890123400",
          "name": "Apex Construction Hub",
          "code": "APEX-01"
        }
      }
    }
  }
  ```

---

### 2.3 User Logout
Logs out current user session.

- **Endpoint**: `POST /auth/logout`
- **Access**: Protected (`ADMIN`, `SUPERVISOR`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 3. Administrator Endpoints (`/admin`)

> **Note**: Requires role `ADMIN`.

### 3.1 Get Admin Dashboard Metrics
Retrieves key operational metrics across all sites.

- **Endpoint**: `GET /admin/dashboard`
- **Access**: Protected (`ADMIN`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Admin dashboard metrics retrieved",
    "data": {
      "totalWorkers": 150,
      "totalSupervisors": 5,
      "totalViolations": 42,
      "escalatedAlerts": 7,
      "recentViolations": [ ... ]
    }
  }
  ```

---

### 3.2 List & Filter Supervisors
Retrieves list of supervisors with pagination and search.

- **Endpoint**: `GET /admin/supervisors`
- **Access**: Protected (`ADMIN`)
- **Query Parameters**:
  - `page` (optional, default: `1`)
  - `limit` (optional, default: `10`)
  - `search` (optional, filter by name or email)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Supervisors retrieved successfully",
    "data": [
      {
        "_id": "66a1b2c3d4e5f67890123457",
        "name": "John Doe",
        "email": "john.doe@workforce.com",
        "role": "SUPERVISOR",
        "siteId": {
          "_id": "66a1b2c3d4e5f67890123400",
          "name": "Apex Construction Hub",
          "code": "APEX-01"
        },
        "isActive": true
      }
    ],
    "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
  }
  ```

---

### 3.3 Create New Supervisor
Admin registers a new site supervisor and assigns them to a site.

- **Endpoint**: `POST /admin/supervisors`
- **Access**: Protected (`ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Robert Vance",
    "email": "robert.vance@workforce.com",
    "password": "Password123!",
    "siteId": "66a1b2c3d4e5f67890123400"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Supervisor created successfully",
    "data": {
      "_id": "66a1b2c3d4e5f67890999999",
      "name": "Robert Vance",
      "email": "robert.vance@workforce.com",
      "role": "SUPERVISOR",
      "siteId": "66a1b2c3d4e5f67890123400"
    }
  }
  ```

---

### 3.4 Update Supervisor
Updates supervisor details or reassigns their assigned site.

- **Endpoint**: `PUT /admin/supervisors/:id`
- **Access**: Protected (`ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Robert Vance Jr.",
    "siteId": "66a1b2c3d4e5f67890123401",
    "isActive": true
  }
  ```
- **Response `200 OK`**

---

### 3.5 Delete Supervisor
Removes supervisor from system.

- **Endpoint**: `DELETE /admin/supervisors/:id`
- **Access**: Protected (`ADMIN`)
- **Response `200 OK`**

---

### 3.6 Get Escalated Admin Alerts
Displays violations unacknowledged by supervisors for > 10 minutes.

- **Endpoint**: `GET /admin/alerts`
- **Access**: Protected (`ADMIN`)
- **Query Parameters**: `page`, `limit`, `siteId`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Escalated admin alerts retrieved",
    "data": [
      {
        "_id": "66a1b2c3d4e5f67890111111",
        "workerId": {
          "name": "Alex Mercer",
          "employeeId": "WRK0003",
          "iotDeviceId": "IOT-WRK0003"
        },
        "siteId": {
          "name": "Titan Energy Refinery",
          "code": "TITAN-02"
        },
        "ppeType": "SAFETY_GLASSES",
        "severity": "CRITICAL",
        "timestamp": "2026-07-25T20:45:00.000Z",
        "status": "ESCALATED",
        "escalatedToAdminAt": "2026-07-25T20:55:00.000Z"
      }
    ]
  }
  ```

---

### 3.7 Get Data Insights & Analytics
Returns chart datasets (by site, PPE category, severity distribution, daily trends).

- **Endpoint**: `GET /admin/insights`
- **Access**: Protected (`ADMIN`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Data insights and analytics retrieved",
    "data": {
      "violationsBySite": [ ... ],
      "violationsByPpeType": [ ... ],
      "dailyTrends": [ ... ],
      "severityDistribution": [ ... ]
    }
  }
  ```

---

## 4. Supervisor Endpoints (`/supervisor`)

> **Note**: Requires role `SUPERVISOR` or `ADMIN`.

### 4.1 Get Supervisor Dashboard Metrics
- **Endpoint**: `GET /supervisor/dashboard`
- **Access**: Protected (`SUPERVISOR`, `ADMIN`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Supervisor dashboard metrics retrieved",
    "data": {
      "todayViolations": 12,
      "pendingViolations": 3,
      "acknowledgedViolations": 7,
      "escalatedViolations": 2
    }
  }
  ```

---

### 4.2 List Site Violations
Retrieves site-filtered worker non-compliance infractions.

- **Endpoint**: `GET /supervisor/violations`
- **Access**: Protected (`SUPERVISOR`, `ADMIN`)
- **Query Parameters**:
  - `status` (`PENDING`, `ACKNOWLEDGED`, `ESCALATED`)
  - `ppeType` (`HELMET`, `VEST`, `GLOVES`, `SAFETY_GLASSES`, `BOOTS`, `HARNESS`)
  - `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `search` (Search worker name or employee ID)
  - `page`, `limit`
- **Response `200 OK`**

---

### 4.3 Acknowledge Violation Incident
Supervisor acknowledges a pending/escalated incident and submits resolution notes.

- **Endpoint**: `PATCH /supervisor/violations/:id/acknowledge`
- **Access**: Protected (`SUPERVISOR`, `ADMIN`)
- **Request Body**:
  ```json
  {
    "notes": "Worker provided new pair of heavy-duty protective gloves."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Violation acknowledged successfully",
    "data": {
      "_id": "66a1b2c3d4e5f67890111111",
      "status": "ACKNOWLEDGED",
      "acknowledgedBy": "66a1b2c3d4e5f67890123457",
      "acknowledgedAt": "2026-07-25T21:10:00.000Z",
      "notes": "Worker provided new pair of heavy-duty protective gloves."
    }
  }
  ```

---

### 4.4 Export Violation Audit Report (CSV)
Exports filtered list of violations to a downloadable CSV file.

- **Endpoint**: `GET /supervisor/reports/export`
- **Access**: Protected (`SUPERVISOR`, `ADMIN`)
- **Query Parameters**: `startDate`, `endDate`, `status`, `ppeType`
- **Response `200 OK`**: Direct CSV file download header (`Content-Type: text/csv`).

---

## 5. IoT Simulation & Trigger Endpoints (`/simulation`)

### 5.1 Trigger Simulated Violation Event
Generates a real-time simulated IoT non-compliance event.

- **Endpoint**: `POST /simulation/trigger`
- **Access**: Protected (`ADMIN`, `SUPERVISOR`)
- **Request Body**:
  ```json
  {
    "ppeType": "HARNESS",
    "severity": "CRITICAL",
    "notes": "Manual test simulation: Safety harness unhooked on level 4 scaffolding"
  }
  ```
- **Response `201 Created`**

---

### 5.2 Force Escalation Check
Manually triggers the 10-minute unacknowledged violation escalation scanner without waiting for 30s cron.

- **Endpoint**: `POST /simulation/escalate-now`
- **Access**: Protected (`ADMIN`, `SUPERVISOR`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Escalation process executed. 2 violation(s) escalated to admin.",
    "data": { "escalatedCount": 2 }
  }
  ```

---

## 6. Utility Dropdown Endpoints

- `GET /sites`: List all active sites for dropdown selection.
- `GET /workers?siteId=<ID>`: List active workers filtered by site for dropdown selection.
