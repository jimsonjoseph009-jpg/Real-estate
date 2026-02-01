# CRUD Operations, Validation & Access Control - Complete Guide

## Overview

Your Real Estate Management System has been enhanced with comprehensive CRUD operations, data validation, advanced filtering, search capabilities, and role-based access control (RBAC).

---

## 1. ENHANCED FEATURES

### ✅ CRUD Operations (Complete Implementation)
- **CREATE**: Add new properties, users, inquiries
- **READ**: Retrieve properties, user profiles, inquiries with advanced filtering
- **UPDATE**: Modify properties, user profiles, inquiry status
- **DELETE**: Remove properties, inquiries (soft delete - marked as archived)

### ✅ Data Validations
- **Property Validator**: Title length, price validation, category verification, coordinates validation
- **User Validator**: Email format, phone format, password strength, National ID format
- **Inquiry Validator**: Property existence, contact info format, inquiry type validation

### ✅ Search & Filtering
- **Advanced Search**: By title, description, location with full-text search
- **Property Filtering**: By city, price range, bedrooms, bathrooms, property type, category
- **Pagination**: Configurable page size (1-100), page numbers, total counts
- **Sorting**: By featured, price, creation date, view count

### ✅ Role-Based Access Control (RBAC)
- **Admin Role**: Full system access, user management, all inquiries access
- **Agent Role**: Manage own properties, view inquiries for own properties, browse other properties
- **Buyer Role**: Create inquiries, manage own profile, view properties and agents

---

## 2. VALIDATORS

### PropertyValidator
**Location**: `backend/src/validators/propertyValidator.js`

```javascript
// Validates property creation
PropertyValidator.validateCreateProperty(data)
- Title: 5-255 characters
- Category ID: Valid positive integer
- Property type: house, apartment, condo, townhouse, land, commercial
- Location: Minimum 3 characters
- City: Minimum 2 characters
- Price: Positive number up to 999,999,999
- Bedrooms/Bathrooms: 0-20 range
- Year built: 1800 to current year
- Coordinates: Valid latitude (-90 to 90), longitude (-180 to 180)

// Validates property updates
PropertyValidator.validateUpdateProperty(data)
- Partial validation (only provided fields)
- Status: available, sold, rented, archived
- Prevents updating system fields

// Validates filter parameters
PropertyValidator.validateFilterParams(filters)
- Page: positive integer
- Limit: 1-100
- Prices: valid numbers
```

### UserValidator
**Location**: `backend/src/validators/userValidator.js`

```javascript
// Validates user registration
UserValidator.validateRegister(data)
- Full name: 2-100 characters, letters only
- Email: Valid format, maximum 255 characters
- Phone: Valid international format
- Password: Minimum 8 chars, uppercase, lowercase, numbers
- National ID: 5-20 characters
- Role: buyer, agent, or admin

// Validates login
UserValidator.validateLogin(data)
- Email required
- Password required

// Validates profile updates
UserValidator.validateUpdateProfile(data)
- Prevents updating: user_id, password_hash, role, created_at, national_id
- Bio: Maximum 500 characters
- Company name: Maximum 100 characters

// Validates password change
UserValidator.validateChangePassword(data)
- Current password required (must be correct)
- New password: 8+ chars, uppercase, lowercase, numbers
- New must differ from current
```

### InquiryValidator
**Location**: `backend/src/validators/inquiryValidator.js`

```javascript
// Validates inquiry creation
InquiryValidator.validateCreateInquiry(data)
- Property ID: Valid positive integer
- Inquirer name: 2-100 characters
- Email: Valid format required
- Phone: Valid format (optional)
- Inquiry type: viewing, pricing, offer, general, financing
- Message: Maximum 2000 characters
- Preferred date: YYYY-MM-DD format
- Preferred time: HH:MM format

// Validates status updates
InquiryValidator.validateUpdateStatus(data)
- Status: pending, reviewed, scheduled, completed, rejected
- Response notes: Maximum 1000 characters
```

---

## 3. ENHANCED CONTROLLERS

### PropertyControllerEnhanced
**Location**: `backend/src/controllers/propertyControllerEnhanced.js`

#### Methods:

**1. createProperty(req, res)** - ADMIN/AGENT only
```
POST /properties/create
Validates input → Checks category exists → Inserts property
Returns: propertyId, message, timestamp
```

**2. getAllProperties(req, res)** - Public
```
GET /properties?city=Boston&minPrice=100000&maxPrice=500000&bedrooms=3&page=1&limit=10
Filters: city, minPrice, maxPrice, bedrooms, bathrooms, propertyType, categoryId, featured, searchTerm
Sorting: featured, price, created_at, views_count
Returns: Paginated properties with total count and pagination metadata
```

**3. getProperty(req, res)** - Public
```
GET /properties/:propertyId
Returns: Full property details, images, amenities, reviews
Also: Increments view count
```

**4. updateProperty(req, res)** - ADMIN/AGENT (own properties only)
```
PUT /properties/:propertyId
Validates updates → Checks ownership → Updates fields
Returns: Updated fields list, propertyId, timestamp
```

**5. deleteProperty(req, res)** - ADMIN/AGENT (own properties only)
```
DELETE /properties/:propertyId
Soft deletes: Sets status to 'archived', marks deleted_at
Returns: Message, propertyId, timestamp
```

**6. searchProperties(req, res)** - Public
```
GET /properties/search?query=luxury&location=Manhattan&minPrice=1000000&page=1
Full-text search + location filters
Returns: Matching properties with pagination
```

**7. getAgentProperties(req, res)** - AGENT/ADMIN
```
GET /agent/:agentId/properties
AGENT: Can only view own properties
ADMIN: Can view any agent's properties
Returns: Properties list with count
```

**8. getPropertiesByCategory(req, res)** - Public
```
GET /properties/category/:categoryId?page=1&limit=10
Paginated properties by category
```

### UserControllerEnhanced
**Location**: `backend/src/controllers/userControllerEnhanced.js`

#### Methods:

**1. register(req, res)** - Public
```
POST /auth/register
Validates input → Checks duplicates (email, phone, national_id)
Hashes password → Creates user
Returns: userId, email, role, timestamp
```

**2. getProfile(req, res)** - Authenticated
```
GET /user/profile
Returns: User profile (excluding password_hash)
```

**3. updateProfile(req, res)** - Authenticated
```
PUT /user/profile
Validates updates → Prevents restricted fields update
Returns: Updated fields, userId, timestamp
```

**4. changePassword(req, res)** - Authenticated
```
POST /user/change-password
Validates current password → Hashes new password → Updates
Returns: Success message, timestamp
```

**5. deleteAccount(req, res)** - Authenticated
```
DELETE /user/account
Soft deletes: Sets is_active=FALSE, marks deleted_at
Returns: Message, timestamp
```

**6. getAgents(req, res)** - Public
```
GET /agents?page=1&limit=10
Paginated list of active agents
Returns: Agent details (no sensitive data), pagination
```

**7. getAgentDetails(req, res)** - Public
```
GET /agents/:agentId
Returns: Agent profile + total properties count
```

**8. getAllUsers(req, res)** - ADMIN only
```
GET /admin/users?role=agent&status=active&page=1&limit=20
Filters: role (buyer/agent/admin), status (active/inactive)
Returns: User list with pagination
```

**9. updateUserRole(req, res)** - ADMIN only
```
PUT /admin/users/:userId/role
Updates user role: buyer → agent → admin
Returns: userId, newRole, timestamp
```

### InquiryControllerEnhanced
**Location**: `backend/src/controllers/inquiryControllerEnhanced.js`

#### Methods:

**1. createInquiry(req, res)** - Authenticated/Public
```
POST /inquiries/create
Validates input → Verifies property exists
Inserts inquiry with 'pending' status
Returns: inquiryId, status, timestamp
```

**2. getInquiry(req, res)** - OWNER/AGENT/ADMIN
```
GET /inquiries/:inquiryId
Access: Owner (who created it), property agent, or admin
Returns: Inquiry details with property title
```

**3. getPropertyInquiries(req, res)** - AGENT/ADMIN
```
GET /properties/:propertyId/inquiries?status=pending&page=1&limit=10
AGENT: Only inquiries for own properties
ADMIN: All inquiries for property
Filters: status (pending, reviewed, scheduled, completed, rejected)
Returns: Paginated inquiries, status distribution
```

**4. getUserInquiries(req, res)** - Authenticated
```
GET /user/inquiries?status=pending&page=1
Returns: User's inquiries with property details
```

**5. updateInquiryStatus(req, res)** - AGENT/ADMIN
```
PUT /inquiries/:inquiryId/status
Updates status, adds response notes, sets responded_at
Returns: inquiryId, newStatus, timestamp
```

**6. deleteInquiry(req, res)** - AGENT/ADMIN
```
DELETE /inquiries/:inquiryId
Soft deletes: Sets deleted_at timestamp
Returns: Message, inquiryId
```

**7. getInquiryStats(req, res)** - ADMIN only
```
GET /admin/inquiries/stats
Returns: Status distribution, type distribution, recent inquiries (top 10)
```

---

## 4. ROLE-BASED ACCESS CONTROL (RBAC)

### Roles & Permissions

#### 🔴 Admin Role
- ✅ Create/Read/Update/Delete any property
- ✅ View all users and their inquiries
- ✅ Update user roles (buyer ↔ agent ↔ admin)
- ✅ Access system statistics and analytics
- ✅ Resolve property and inquiry issues

#### 🟡 Agent Role
- ✅ Create/Read/Update/Delete own properties
- ✅ View inquiries for own properties
- ✅ Respond to inquiries
- ✅ Update own profile
- ✅ View other agents and their properties
- ❌ Cannot delete other agents' properties
- ❌ Cannot access system admin functions

#### 🟢 Buyer Role
- ✅ Create inquiries for properties
- ✅ View own inquiries and their status
- ✅ Update own profile
- ✅ View all properties and agents
- ✅ Search and filter properties
- ❌ Cannot create/edit properties
- ❌ Cannot view other users' inquiries

### Middleware Implementation

**Location**: `backend/src/middleware/auth.js`

```javascript
// Authenticate token - verifies JWT and attaches user to request
authenticateToken(req, res, next)

// Authorize by role - checks if user has required role(s)
authorizeRole(...allowedRoles)(req, res, next)
```

### Usage Example in Routes

```javascript
// Public route - no auth required
router.get('/properties', PropertyControllerEnhanced.getAllProperties);

// Requires authentication
router.get('/user/profile', authenticateToken, UserControllerEnhanced.getProfile);

// Requires specific role
router.post('/properties/create',
  authenticateToken,
  authorizeRole('agent', 'admin'),
  PropertyControllerEnhanced.createProperty
);

// Admin only
router.get('/admin/users',
  authenticateToken,
  authorizeRole('admin'),
  UserControllerEnhanced.getAllUsers
);
```

---

## 5. DATA VALIDATION FLOW

### Example: Property Creation

```
Client Request
    ↓
PropertyValidator.validateCreateProperty(data)
    ↓
Validation Errors? → Return 400 with error details
    ↓
Check Category Exists
    ↓
Category Doesn't Exist? → Return 400 "Invalid category"
    ↓
Insert into Database
    ↓
Return 201 with propertyId
```

### Error Response Format

```json
{
  "error": "Validation failed",
  "details": [
    "Title must be between 5 and 255 characters",
    "Price must be greater than 0",
    "Invalid email format"
  ]
}
```

---

## 6. FILTERING & SEARCH CAPABILITIES

### Property Filters

| Filter | Type | Example | Description |
|--------|------|---------|-------------|
| `city` | string | Boston | Exact city match |
| `minPrice` | number | 100000 | Minimum price (inclusive) |
| `maxPrice` | number | 500000 | Maximum price (inclusive) |
| `bedrooms` | number | 3 | Minimum bedrooms |
| `bathrooms` | number | 2 | Minimum bathrooms |
| `propertyType` | string | apartment | Property type |
| `categoryId` | number | 1 | Property category |
| `featured` | boolean | true | Featured properties only |
| `searchTerm` | string | luxury | Full-text search |
| `sortBy` | string | price | Sort by field |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Results per page |

### Example Queries

```
// Find luxury apartments in Boston under $500k with 3+ bedrooms
GET /properties?searchTerm=luxury&city=Boston&propertyType=apartment&maxPrice=500000&bedrooms=3&page=1&limit=10

// Find featured properties sorted by price
GET /properties?featured=true&sortBy=price&page=1&limit=20

// Search with multiple criteria
GET /properties/search?query=modern&location=Manhattan&minPrice=1000000&bedrooms=4

// Agent's properties
GET /agent/5/properties

// Properties by category
GET /properties/category/2?page=1&limit=15
```

---

## 7. PAGINATION & RESPONSE FORMAT

### Pagination Metadata

```json
{
  "data": [...properties],
  "pagination": {
    "total": 145,           // Total matching results
    "page": 1,              // Current page
    "limit": 10,            // Results per page
    "pages": 15,            // Total pages
    "hasNext": true,        // More pages available
    "hasPrev": false        // Previous page available
  }
}
```

### Response Envelope

```json
{
  "data": {...},                  // Actual data
  "pagination": {...},            // If applicable
  "filters": {...},               // Applied filters
  "timestamp": "2026-02-01T..."   // ISO timestamp
}
```

---

## 8. ERROR HANDLING

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request successful |
| 201 | Created | Property/user/inquiry created |
| 400 | Bad Request | Validation failed, invalid input |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | Insufficient permissions for role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email/phone already exists |
| 500 | Server Error | Database/system error |

### Example Error Response

```json
{
  "error": "Validation failed",
  "details": [
    "Title must be between 5 and 255 characters",
    "Price must be greater than 0"
  ]
}
```

---

## 9. FIELD RESTRICTIONS

### Cannot Be Updated

| Entity | Restricted Fields |
|--------|------------------|
| Property | property_id, agent_id, created_at, views_count |
| User | user_id, password_hash, role, created_at, national_id |
| Inquiry | inquiry_id, property_id (can create new inquiry instead) |

### Cannot Be Deleted Directly

- Properties, Inquiries, Users use **soft delete** (marked with `deleted_at` timestamp)
- Original data preserved for auditing
- Filtered out in queries by default

---

## 10. IMPLEMENTATION CHECKLIST

✅ PropertyValidator - Comprehensive validation rules
✅ UserValidator - Registration, login, profile validation
✅ InquiryValidator - Inquiry and status validation
✅ PropertyControllerEnhanced - Full CRUD + search + filtering
✅ UserControllerEnhanced - Full CRUD + role management
✅ InquiryControllerEnhanced - Full CRUD + statistics
✅ Role-based access control middleware
✅ Pagination support (1-100 items per page)
✅ Advanced filtering (price range, location, type, etc.)
✅ Full-text search capabilities
✅ Error handling with detailed messages
✅ Data sanitization (XSS prevention)
✅ Password hashing with bcrypt
✅ JWT authentication & authorization

---

## 11. NEXT STEPS

1. **Import Enhanced Controllers** in route files
2. **Update Routes** to use enhanced controllers
3. **Test API Endpoints** with postman/curl
4. **Deploy** to production
5. **Monitor** error logs and validate edge cases

---

**Last Updated**: 2026-02-01
**Status**: Ready for integration and testing
