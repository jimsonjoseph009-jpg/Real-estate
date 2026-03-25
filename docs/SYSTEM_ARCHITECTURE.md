# Real Estate Management System - Architecture Documentation

## System Overview

The Real Estate Management System is a full-stack web application built with:
- **Backend:** Node.js with Express.js
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Database:** MySQL 5.7+
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs for password hashing, helmet for HTTP headers, CORS

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Frontend (Vanilla JS, HTML5, CSS3)                     │  │
│  │ - index.html (Home & Property Listing)                 │  │
│  │ - pages/login.html (User Authentication)               │  │
│  │ - pages/register.html (User Registration)              │  │
│  │ - pages/property-details.html (Property Details)       │  │
│  │ - js/api.js (API Calls)                                │  │
│  │ - js/auth.js (Authentication Management)               │  │
│  │ - css/style.css (Global Styling)                       │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                      HTTP/REST Requests
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                          │
│         (Express.js Server on Port 5000)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Middleware Stack                                       │  │
│  │ - helmet() - Security headers                          │  │
│  │ - cors() - Cross-origin requests                       │  │
│  │ - express.json() - JSON parsing                        │  │
│  │ - rateLimit() - Request throttling                     │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Routing (src/routes/)                                  │  │
│  │ - userRoutes.js                                        │  │
│  │ - propertyRoutes.js                                    │  │
│  │ - inquiryRoutes.js                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Controllers (src/controllers/)                         │  │
│  │ - userController.js (Auth & Profile)                  │  │
│  │ - propertyController.js (Properties CRUD)             │  │
│  │ - inquiryController.js (Inquiry Management)           │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Middleware (src/middleware/)                           │  │
│  │ - auth.js (JWT verification & RBAC)                   │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Utilities (src/utils/)                                 │  │
│  │ - security.js (Hashing, Validation, Sanitization)     │  │
│  │ - db.js (Database Connection Pool)                    │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE LAYER                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ MySQL Connection Pool                                  │  │
│  │ - Prepared Statements                                  │  │
│  │ - Connection Reuse                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ MySQL Database (real_estate_system)                    │  │
│  │ - 8 Normalized Tables (3NF)                            │  │
│  │ - Views & Stored Procedures                            │  │
│  │ - Triggers for Automation                              │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Backend Structure

```
backend/
├── src/
│   ├── app.js                 # Express application setup
│   ├── config/
│   │   └── database.js        # Configuration & constants
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── propertyController.js
│   │   └── inquiryController.js
│   ├── middleware/
│   │   └── auth.js            # JWT & RBAC middleware
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── propertyRoutes.js
│   │   └── inquiryRoutes.js
│   └── utils/
│       ├── db.js              # Database pool & queries
│       └── security.js        # Hashing, validation, sanitization
├── package.json
├── .env.example
└── README.md
```

## Frontend Structure

```
frontend/
├── index.html                 # Home & property listing page
├── pages/
│   ├── login.html
│   ├── register.html
│   └── property-details.html
├── css/
│   ├── style.css              # Main styles
│   ├── auth.css               # Authentication pages
│   └── property-details.css   # Property details page
├── js/
│   ├── api.js                 # API client & utilities
│   ├── auth.js                # Authentication management
│   ├── login.js               # Login page logic
│   ├── register.js            # Register page logic
│   ├── main.js                # Home page logic
│   └── property-details.js    # Property details logic
└── assets/                    # Images & other assets
```

## API Endpoints

### User Routes (`/api/users`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)
- `GET /agents` - Get all agents

### Property Routes (`/api/properties`)
- `GET /` - List all properties (with pagination & filters)
- `GET /search` - Search properties
- `GET /:propertyId` - Get property details
- `POST /` - Create property (protected, admin/agent only)
- `PUT /:propertyId` - Update property (protected)
- `DELETE /:propertyId` - Delete property (protected)

### Inquiry Routes (`/api/inquiries`)
- `POST /` - Create inquiry
- `GET /property/:propertyId` - Get property inquiries (protected)
- `PUT /:inquiryId/status` - Update inquiry status (protected)
- `GET /user/my-inquiries` - Get user's inquiries (protected)

## Authentication & Authorization

### JWT Token Flow
1. User registers/logs in with credentials
2. Backend validates and returns JWT token
3. Frontend stores token in localStorage
4. Subsequent requests include token in Authorization header
5. Backend verifies token and extracts user information

### Role-Based Access Control (RBAC)
- **Admin:** Full system access
- **Agent:** Can create/manage properties, view inquiries
- **Buyer/Seller:** Can browse properties, submit inquiries

### Authorization Middleware
```javascript
authenticateToken() - Verifies JWT
authorizeRole(...roles) - Checks user role
```

## Security Implementation

### Password Security
- Bcryptjs with 10 salt rounds
- Password validation rules:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character

### Input Validation & Sanitization
- Email format validation
- Phone number format validation
- HTML entity encoding
- XSS prevention through sanitization
- SQL injection prevention through parameterized queries

### HTTP Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- No sensitive data in responses

### Database Security
- Prepared statements for all queries
- Connection pool management
- Unique constraints on sensitive fields
- Cascading deletes with foreign keys

## Data Flow Examples

### User Registration Flow
```
1. Frontend: User fills registration form
2. Frontend: Client-side validation
3. Frontend: Send POST /api/users/register with encrypted password
4. Backend: Sanitize inputs
5. Backend: Validate email, phone format
6. Backend: Check for duplicates
7. Backend: Hash password with bcrypt
8. Backend: Insert user into database
9. Backend: Return success/error response
10. Frontend: Store token if successful
```

### Property Listing Flow
```
1. Frontend: Load home page
2. Frontend: Fetch GET /api/properties
3. Backend: Query database with filters
4. Backend: Join with categories, amenities, images
5. Backend: Return paginated results
6. Frontend: Render property cards
7. Frontend: Display pagination controls
```

### Property Search Flow
```
1. Frontend: User enters search criteria
2. Frontend: Send GET /api/properties with query params
3. Backend: Build dynamic SQL with WHERE clauses
4. Backend: Execute search query
5. Backend: Return matching properties
6. Frontend: Filter and display results
```

## Performance Considerations

### Database Optimization
- Connection pooling (10 connections)
- Full-text indexes on search fields
- Composite indexes on filtered columns
- Query optimization with EXPLAIN

### Frontend Optimization
- Lazy loading for property images
- Pagination to limit data transfer
- Local caching of auth tokens
- Minimized JavaScript/CSS

### Backend Optimization
- Prepared statements
- Efficient SQL joins
- Response compression
- Rate limiting

## Error Handling

### HTTP Status Codes
- 200: Successful request
- 201: Created
- 400: Bad request (validation error)
- 401: Unauthorized (auth required)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Server error

### Error Response Format
```json
{
  "error": "Description of error"
}
```

## Environment Variables

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=realestate_user
DB_PASSWORD=SecurePassword123!
DB_NAME=real_estate_system
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

## Deployment Considerations

- Use environment variables for sensitive data
- Enable HTTPS in production
- Set stronger JWT secret in production
- Configure database backup strategy
- Implement logging and monitoring
- Use AWS RDS for managed database
- Deploy backend on AWS EC2/Lambda
- Deploy frontend on AWS S3/CloudFront

