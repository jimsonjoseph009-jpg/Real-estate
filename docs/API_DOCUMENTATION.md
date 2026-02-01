# Real Estate Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Authentication uses JWT (JSON Web Tokens). Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Response Format
All responses are in JSON format with the following structure:

### Success Response (200, 201)
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response (400, 401, 403, 500)
```json
{
  "error": "Error description"
}
```

---

## Endpoints

### USER ENDPOINTS

#### 1. Register User
Create a new user account

**Endpoint:** `POST /users/register`  
**Auth Required:** No  
**Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "role": "buyer",
  "national_id": "ID123456"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

**Validation:**
- Email must be valid format and unique
- Phone must be valid format and unique
- Password must be 8+ chars with uppercase, lowercase, number, special char
- National ID must be unique and 5+ characters

---

#### 2. Login User
Authenticate user and receive JWT token

**Endpoint:** `POST /users/login`  
**Auth Required:** No  
**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

**Error Responses:**
- 401: Invalid credentials
- 400: Missing email or password

---

#### 3. Get User Profile
Retrieve authenticated user's profile

**Endpoint:** `GET /users/profile`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user_id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "buyer",
  "city": "New York",
  "state": "NY",
  "is_verified": true,
  "is_active": true,
  "created_at": "2026-02-01T10:00:00Z",
  "updated_at": "2026-02-01T10:00:00Z"
}
```

---

#### 4. Update User Profile
Update authenticated user's information

**Endpoint:** `PUT /users/profile`  
**Auth Required:** Yes  
**Body:** (all fields optional)
```json
{
  "full_name": "John Smith",
  "phone": "+1234567891",
  "city": "Los Angeles",
  "state": "CA",
  "postal_code": "90001",
  "bio": "Real estate investor interested in commercial properties"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully"
}
```

---

#### 5. Get All Agents
List all active real estate agents

**Endpoint:** `GET /users/agents`  
**Auth Required:** No  
**Query Parameters:** None

**Response (200):**
```json
[
  {
    "user_id": 2,
    "full_name": "Jane Smith",
    "email": "jane@realestate.com",
    "phone": "+1234567891",
    "company_name": "Real Estate Solutions",
    "bio": "10 years of experience in residential properties"
  },
  ...
]
```

---

### PROPERTY ENDPOINTS

#### 1. Get All Properties
List properties with pagination and filtering

**Endpoint:** `GET /properties`  
**Auth Required:** No  
**Query Parameters:**
```
?page=1
&limit=10
&city=New York
&minPrice=500000
&maxPrice=2000000
&bedrooms=3
&categoryId=1
```

**Response (200):**
```json
{
  "properties": [
    {
      "property_id": 1,
      "title": "Luxury Apartment Downtown",
      "price": 1500000,
      "currency": "USD",
      "city": "New York",
      "state": "NY",
      "bedrooms": 3,
      "bathrooms": 2,
      "total_area": 2000,
      "category_name": "Apartment",
      "agent_name": "Jane Smith",
      "agent_phone": "+1234567891",
      "status": "available",
      "views_count": 250,
      "created_at": "2026-02-01T10:00:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

#### 2. Search Properties
Full-text search on properties

**Endpoint:** `GET /properties/search`  
**Auth Required:** No  
**Query Parameters:**
```
?query=apartment luxury
&location=Manhattan
```

**Response (200):**
```json
[
  {
    "property_id": 1,
    "title": "Luxury Apartment Downtown",
    "description": "Premium apartment...",
    "price": 1500000,
    "city": "New York",
    "bedrooms": 3,
    "bathrooms": 2,
    "category_name": "Apartment"
  },
  ...
]
```

---

#### 3. Get Property Details
Get complete property information with images, amenities, reviews

**Endpoint:** `GET /properties/:propertyId`  
**Auth Required:** No  
**Path Parameters:**
```
propertyId: integer
```

**Response (200):**
```json
{
  "property_id": 1,
  "title": "Luxury Apartment Downtown",
  "description": "Modern apartment with...",
  "price": 1500000,
  "currency": "USD",
  "city": "New York",
  "state": "NY",
  "location": "123 Main Street",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "bedrooms": 3,
  "bathrooms": 2,
  "total_area": 2000,
  "area_unit": "sqft",
  "year_built": 2020,
  "parking_spaces": 2,
  "is_furnished": true,
  "status": "available",
  "views_count": 250,
  "category_name": "Apartment",
  "agent_name": "Jane Smith",
  "agent_phone": "+1234567891",
  "agent_email": "jane@realestate.com",
  "images": [
    {
      "image_id": 1,
      "image_url": "https://...",
      "image_alt_text": "Front view",
      "is_primary": true,
      "display_order": 1
    }
  ],
  "amenities": [
    {
      "amenity_id": 1,
      "amenity_name": "WiFi",
      "icon_class": "fas fa-wifi"
    }
  ],
  "reviews": [
    {
      "review_id": 1,
      "rating": 5,
      "comment": "Great property!",
      "reviewer_name": "John Doe",
      "created_at": "2026-02-01T10:00:00Z"
    }
  ]
}
```

---

#### 4. Create Property
Create new property listing

**Endpoint:** `POST /properties`  
**Auth Required:** Yes (Agent/Admin only)  
**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Luxury Apartment Downtown",
  "description": "Modern apartment with...",
  "category_id": 1,
  "property_type": "residential",
  "location": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "price": 1500000,
  "currency": "USD",
  "bedrooms": 3,
  "bathrooms": 2,
  "total_area": 2000,
  "area_unit": "sqft",
  "year_built": 2020,
  "parking_spaces": 2,
  "is_furnished": true
}
```

**Response (201):**
```json
{
  "message": "Property created successfully",
  "propertyId": 1
}
```

**Validation:**
- All required fields must be present
- Price must be positive number
- Location, city, state are required
- Category ID must exist

---

#### 5. Update Property
Update existing property (agent only)

**Endpoint:** `PUT /properties/:propertyId`  
**Auth Required:** Yes  
**Path Parameters:**
```
propertyId: integer
```

**Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 1600000,
  "status": "under_offer"
}
```

**Response (200):**
```json
{
  "message": "Property updated successfully"
}
```

**Permissions:**
- Agent can only update own properties
- Admin can update any property

---

#### 6. Delete Property
Delete property listing

**Endpoint:** `DELETE /properties/:propertyId`  
**Auth Required:** Yes  
**Path Parameters:**
```
propertyId: integer
```

**Response (200):**
```json
{
  "message": "Property deleted successfully"
}
```

---

### INQUIRY ENDPOINTS

#### 1. Create Inquiry
Submit inquiry for property viewing/information

**Endpoint:** `POST /inquiries`  
**Auth Required:** No  
**Body:**
```json
{
  "property_id": 1,
  "inquirer_name": "John Buyer",
  "inquirer_email": "buyer@example.com",
  "inquirer_phone": "+1234567890",
  "inquiry_type": "viewing",
  "message": "I'm interested in viewing this property",
  "preferred_date": "2026-02-15",
  "preferred_time": "14:00"
}
```

**Response (201):**
```json
{
  "message": "Inquiry created successfully",
  "inquiryId": 1
}
```

**Validation:**
- property_id must exist
- inquirer_name, inquirer_email required
- inquiry_type must be: viewing, information, offer, general

---

#### 2. Get Property Inquiries
Get all inquiries for a property

**Endpoint:** `GET /inquiries/property/:propertyId`  
**Auth Required:** Yes (Agent/Admin only)  
**Path Parameters:**
```
propertyId: integer
```

**Response (200):**
```json
[
  {
    "inquiry_id": 1,
    "property_id": 1,
    "inquirer_name": "John Buyer",
    "inquirer_email": "buyer@example.com",
    "inquirer_phone": "+1234567890",
    "inquiry_type": "viewing",
    "message": "I'm interested...",
    "status": "new",
    "preferred_date": "2026-02-15",
    "preferred_time": "14:00",
    "created_at": "2026-02-01T10:00:00Z"
  },
  ...
]
```

**Permissions:**
- Agent can only view inquiries for own properties
- Admin can view all inquiries

---

#### 3. Update Inquiry Status
Update inquiry status by agent

**Endpoint:** `PUT /inquiries/:inquiryId/status`  
**Auth Required:** Yes (Agent/Admin only)  
**Path Parameters:**
```
inquiryId: integer
```

**Body:**
```json
{
  "status": "scheduled"
}
```

**Valid Status Values:**
- new
- contacted
- scheduled
- completed
- cancelled

**Response (200):**
```json
{
  "message": "Inquiry status updated"
}
```

---

#### 4. Get User Inquiries
Get all inquiries submitted by authenticated user

**Endpoint:** `GET /inquiries/user/my-inquiries`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "inquiry_id": 1,
    "property_id": 1,
    "inquirer_name": "John Buyer",
    "inquirer_email": "buyer@example.com",
    "inquiry_type": "viewing",
    "status": "scheduled",
    "property_title": "Luxury Apartment Downtown",
    "created_at": "2026-02-01T10:00:00Z"
  },
  ...
]
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Missing required fields or invalid format |
| 401 | Unauthorized | Authentication required or token invalid |
| 403 | Forbidden | Insufficient permissions for action |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

The API implements rate limiting:
- **Limit:** 100 requests per 15 minutes per IP address
- **Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643705400
```

---

## CORS Headers

Requests from configured origins are allowed:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Example Requests

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "SecurePass123!",
    "national_id": "ID123456"
  }'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Get properties
curl 'http://localhost:5000/api/properties?page=1&limit=10'

# Get property details
curl 'http://localhost:5000/api/properties/1'

# Create inquiry
curl -X POST http://localhost:5000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "inquirer_name": "John Buyer",
    "inquirer_email": "buyer@example.com",
    "inquiry_type": "viewing"
  }'
```

### Using JavaScript Fetch

```javascript
// Login
const response = await fetch('http://localhost:5000/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
const token = data.token;

// Get authenticated user profile
const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await profileResponse.json();
```

---

## Support

For API issues:
1. Check the error message and response code
2. Verify all required fields are provided
3. Ensure authentication token is valid
4. Check request format matches examples above
5. Review system logs for detailed errors

