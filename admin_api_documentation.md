# Book My Venue - Admin API Documentation

This document provides detailed information about all Admin APIs available in the Book My Venue backend. These APIs are used by the administrative dashboard to manage the entire platform.

---

## 🔐 Base Configuration

- **Base URL**: `http://192.168.1.12:3000` (or `http://localhost:3000` for local)
- **Content-Type**: `application/json`
- **Authorization**: Most Admin APIs require an `Authorization` header with a Bearer token or an `adminid` header.

---

## 1. Admin Authentication

Endpoints for administrative access and security.

### 🔹 Admin Login
- **Endpoint**: `POST /admin/login`
- **Purpose**: Authenticate an admin user.
- **Request Body**:
  ```json
  {
    "username": "admin_username",
    "password": "admin_password"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Login success",
    "admin": { "_id": "...", "username": "..." }
  }
  ```
- **Error Response**: `400 Bad Request` - "Invalid credentials"

### 🔹 Admin Registration
- **Endpoint**: `POST /admin/register`
- **Purpose**: Create a new admin account.
- **Request Body**:
  ```json
  {
    "username": "new_admin",
    "password": "strong_password"
  }
  ```
- **Success Response**: `200 OK`

---

## 2. Dashboard & Analytics

Aggregated platform data and summaries.

### 🔹 Subscription Summary
- **Endpoint**: `GET /subscription/all`
- **Purpose**: Fetch a summary of all vendor subscriptions (Active, Grace, Expired).
- **Authentication**: `isAdmin` required.
- **Success Response**:
  ```json
  {
    "success": true,
    "summary": {
      "total": 120,
      "active": 85,
      "grace": 15,
      "expired": 20,
      "expiringSoon": 5
    },
    "data": [...]
  }
  ```

---

## 3. Users Management

Manage platform customers.

### 🔹 List All Users
- **Endpoint**: `GET /users/`
- **Purpose**: Fetch all registered users (soft-deleted users excluded).
- **Authentication**: `isAdmin` required.
- **Query Filters**:
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 10)
  - `search`: Search by name or email.
- **Success Response**:
  ```json
  {
    "data": [ { "name": "...", "email": "...", ... } ],
    "page": 1,
    "limit": 10,
    "totalRecords": 150,
    "totalPages": 15
  }
  ```

---

## 4. Vendors Management

Manage business partners and their approval lifecycle.

### 🔹 List All Vendors
- **Endpoint**: `GET /vendors/`
- **Purpose**: List all vendors with their business details and verification status.
- **Query Filters**:
  - `page`, `limit`, `search`, `status` (pending, approved, rejected).
- **Success Response**: Paginated object with `data`, `page`, `limit`, etc.

### 🔹 Approve Vendor
- **Endpoint**: `PUT /vendors/approve/:id`
- **Purpose**: Approve a vendor and set their login credentials.
- **Request Body**:
  ```json
  {
    "username": "vendor_user",
    "password": "temporary_password"
  }
  ```

### 🔹 Reject Vendor
- **Endpoint**: `PUT /vendors/reject/:id`
- **Purpose**: Reject a vendor application with a reason.
- **Request Body**: `{ "message": "Reason for rejection" }`

---

## 5. Venues Management

Control venue listings and their public visibility.

### 🔹 List All Venues (Admin View)
- **Endpoint**: `GET /admin/venues`
- **Purpose**: Fetch all venues with full vendor details.
- **Query Filters**:
  - `page`, `limit`, `search`, `status` (approved, pending, rejected).
- **Success Response**: Paginated object with `data`, `page`, `limit`, etc.

### 🔹 Update Venue Status
- **Endpoint**: `PUT /admin/venues/:id/status`
- **Purpose**: Change venue status (Approve/Reject).
- **Request Body**: `{ "status": "approved" }`

### 🔹 Sync Visibility
- **Endpoint**: `POST /venues/sync-all-visibility`
- **Purpose**: Manually trigger a synchronization of venue visibility based on current subscription statuses.

---

## 6. User Reviews

Moderation of feedback across the platform.

### 🔹 List All Reviews
- **Endpoint**: `GET /admin/reviews`
- **Purpose**: Monitor all feedback across all venues.
- **Query Filters**: `page`, `limit`, `search`, `status`.
- **Success Response**: Paginated reviews with `venueName` and `userId` details.

### 🔹 Moderate Review
- **Endpoint**: `PATCH /admin/reviews/:venueId/:reviewId/status`
- **Purpose**: Approve or Reject a user review.
- **Request Body**: `{ "status": "approved" }`

---

## 7. Bookings

Oversee all platform transactions and reservations.

### 🔹 List All Bookings
- **Endpoint**: `GET /bookings/`
- **Purpose**: View all platform bookings with user, vendor, and venue details.
- **Query Filters**: `page`, `limit`, `status`.
- **Success Response**: Paginated object with `data`, `page`, `limit`, etc.

---

## 8. Payments

Financial auditing and transaction monitoring.

### 🔹 Admin-Vendor Payments
- **Endpoint**: `GET /payments/admin-vendor`
- **Purpose**: Monitor payments from vendors to admin (Subscriptions, Full Payments).
- **Query Filters**: `page`, `limit`, `type`, `paymentStatus`.

### 🔹 User-Vendor Payments
- **Endpoint**: `GET /payments/user-vendor`
- **Purpose**: Monitor booking payments from users to vendors.
- **Query Filters**: `page`, `limit`, `paymentStatus`.

---

## 9. Subscription Plans

Manage the platform's revenue model.

### 🔹 List All Plans
- **Endpoint**: `GET /plans/all`
- **Purpose**: View all plans including inactive and soft-deleted ones.
- **Query Filters**: `page`, `limit`, `search`.

### 🔹 Create New Plan
- **Endpoint**: `POST /plans`
- **Purpose**: Create a new subscription or full-payment plan.
- **Request Body**:
  ```json
  {
    "name": "Gold Plan",
    "duration_days": 30,
    "price": 1000,
    "planType": "base",
    "features": ["Unlimited Listings", "Premium Support"]
  }
  ```

---

## 10. Subscription Monitoring

Ensuring vendor compliance and platform health.

### 🔹 Active Subscriptions
- **Endpoint**: `GET /subscription/all`
- **Purpose**: Comprehensive list of all current vendor subscriptions.

### 🔹 Expiring Soon
- **Endpoint**: `GET /subscription/expiring-soon`
- **Purpose**: List subscriptions expiring within the 15-day warning window.

### 🔹 Admin Manual Assignment
- **Endpoint**: `POST /subscription/admin/assign` (Base Plan)
- **Endpoint**: `POST /subscription/admin/full-payment` (Add-on)
- **Purpose**: Manually grant or extend subscriptions to vendors.

---

## 11. Reports, Notifications & Settings

*Note: These modules are currently in the planning/integration phase.*

- **Reports**: Data export for analytics. (Planned: `GET /admin/reports/revenue`)
- **Notifications**: Broadcast messages to vendors or users. (Planned: `POST /admin/notify`)
- **Settings**: Global platform configurations. (Planned: `PUT /admin/settings`)

---

## 🛠️ Implementation Notes

### Pagination Format
All listing APIs follow this standard response structure:
```json
{
  "data": [],
  "page": 1,
  "limit": 10,
  "totalRecords": 100,
  "totalPages": 10
}
```

### Authentication Header
Admins must include the following in their requests:
- `headers: { "adminid": "ADMIN_ID_HERE" }`
- OR `headers: { "Authorization": "Bearer TOKEN_HERE" }`
