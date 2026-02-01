# API Testing Guide - CRUD Operations, Validation & RBAC

## Quick Reference

### Test Setup
```bash
# 1. Start backend server
cd backend
npm install
npm start

# 2. Backend running on: http://localhost:5000

# 3. Example test user credentials (from registration)
Email: testuser@example.com
Password: TestPassword123
Role: buyer
```

---

## 1. AUTHENTICATION TESTS

### Register New User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "johndoe@example.com",
    "phone": "+1(555)123-4567",
    "password": "SecurePass123",
    "national_id": "123456789",
    "role": "buyer"
  }'

# Success Response (201):
{
  "message": "User registered successfully",
  "userId": 1,
  "email": "johndoe@example.com",
  "role": "buyer",
  "timestamp": "2026-02-01T10:00:00.000Z"
}

# Validation Error (400):
{
  "error": "Validation failed",
  "details": ["Password must contain uppercase, lowercase, and numbers"]
}

# Duplicate Email (409):
{
  "error": "Email already registered"
}
```

### Register Agent
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Smith",
    "email": "janesmith@example.com",
    "phone": "+1(555)987-6543",
    "password": "AgentPass123",
    "national_id": "987654321",
    "role": "agent"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@example.com",
    "password": "SecurePass123"
  }'

# Success Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "role": "buyer"
  }
}
```

---

## 2. PROPERTY TESTS

### Create Property (Agent/Admin only)
```bash
# Save token from login first
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/properties/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Luxury Apartment in Downtown Boston",
    "description": "Beautiful 3-bedroom apartment with city views",
    "category_id": 1,
    "property_type": "apartment",
    "location": "Downtown Boston",
    "city": "Boston",
    "state": "MA",
    "postal_code": "02101",
    "latitude": 42.3601,
    "longitude": -71.0589,
    "price": 450000,
    "currency": "USD",
    "bedrooms": 3,
    "bathrooms": 2,
    "total_area": 1500,
    "area_unit": "sqft",
    "year_built": 2010,
    "parking_spaces": 2,
    "is_furnished": true
  }'

# Success Response (201):
{
  "message": "Property created successfully",
  "propertyId": 15,
  "timestamp": "2026-02-01T10:15:00.000Z"
}

# Validation Error (400):
{
  "error": "Validation failed",
  "details": [
    "Title must be between 5 and 255 characters",
    "Price must be greater than 0"
  ]
}

# Permission Denied (403) - if buyer tries to create:
{
  "error": "Permission denied"
}
```

### Get All Properties (With Filtering)
```bash
# Basic request
curl -X GET http://localhost:5000/properties

# With filters
curl -X GET "http://localhost:5000/properties?city=Boston&minPrice=100000&maxPrice=500000&bedrooms=3&page=1&limit=10"

# With search
curl -X GET "http://localhost:5000/properties?searchTerm=luxury&sortBy=price&page=1&limit=20"

# Response (200):
{
  "data": [
    {
      "property_id": 15,
      "title": "Luxury Apartment in Downtown Boston",
      "description": "Beautiful 3-bedroom apartment...",
      "price": 450000,
      "city": "Boston",
      "bedrooms": 3,
      "bathrooms": 2,
      "total_area": 1500,
      "category_name": "Residential",
      "agent_name": "Jane Smith",
      "views_count": 42
    }
  ],
  "pagination": {
    "total": 145,
    "page": 1,
    "limit": 10,
    "pages": 15,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "city": "Boston",
    "priceRange": { "min": "100000", "max": "500000" },
    "bedrooms": "3"
  }
}
```

### Get Single Property
```bash
curl -X GET http://localhost:5000/properties/15

# Response (200):
{
  "data": {
    "property_id": 15,
    "title": "Luxury Apartment in Downtown Boston",
    "description": "Beautiful 3-bedroom apartment...",
    "price": 450000,
    "city": "Boston",
    "bedrooms": 3,
    "bathrooms": 2,
    "total_area": 1500,
    "views_count": 43,  // Incremented automatically
    "images": [
      { "property_image_id": 1, "image_url": "...", "display_order": 1 }
    ],
    "amenities": [
      { "amenity_id": 1, "amenity_name": "Gym" },
      { "amenity_id": 2, "amenity_name": "Pool" }
    ],
    "reviews": [
      { "review_id": 1, "rating": 5, "review_text": "Great place!", "reviewer_name": "John" }
    ]
  },
  "timestamp": "2026-02-01T10:30:00.000Z"
}

# Not Found (404):
{
  "error": "Property not found"
}
```

### Update Property (Owner Agent/Admin only)
```bash
curl -X PUT http://localhost:5000/properties/15 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": 425000,
    "bedrooms": 2,
    "status": "sold"
  }'

# Success Response (200):
{
  "message": "Property updated successfully",
  "propertyId": 15,
  "updatedFields": ["price", "bedrooms", "status"],
  "timestamp": "2026-02-01T10:45:00.000Z"
}

# Permission Denied (403) - if different agent tries to edit:
{
  "error": "Permission denied - can only edit own properties"
}
```

### Delete Property (Owner Agent/Admin only)
```bash
curl -X DELETE http://localhost:5000/properties/15 \
  -H "Authorization: Bearer $TOKEN"

# Success Response (200):
{
  "message": "Property deleted successfully",
  "propertyId": 15,
  "timestamp": "2026-02-01T11:00:00.000Z"
}
```

### Search Properties
```bash
curl -X GET "http://localhost:5000/properties/search?query=modern&location=Manhattan&minPrice=1000000&bedrooms=4&page=1&limit=20"

# Response (200):
{
  "data": [
    {
      "property_id": 25,
      "title": "Modern Penthouse in Manhattan",
      "price": 2500000,
      "city": "New York",
      "bedrooms": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "count": 5
  },
  "searchCriteria": {
    "query": "modern",
    "location": "Manhattan",
    "priceRange": { "min": "1000000", "max": null }
  }
}
```

### Get Agent's Properties
```bash
# Get current user's properties
curl -X GET http://localhost:5000/agent/me/properties \
  -H "Authorization: Bearer $TOKEN"

# Get specific agent's properties
curl -X GET http://localhost:5000/agent/5/properties

# Response (200):
{
  "data": [
    { "property_id": 10, "title": "...", "price": 350000 },
    { "property_id": 15, "title": "...", "price": 450000 }
  ],
  "count": 2
}
```

---

## 3. USER TESTS

### Get User Profile
```bash
curl -X GET http://localhost:5000/user/profile \
  -H "Authorization: Bearer $TOKEN"

# Response (200):
{
  "data": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "johndoe@example.com",
    "phone": "+1(555)123-4567",
    "role": "buyer",
    "bio": null,
    "company_name": null,
    "created_at": "2026-02-01T09:00:00.000Z"
  },
  "timestamp": "2026-02-01T11:15:00.000Z"
}
```

### Update User Profile
```bash
curl -X PUT http://localhost:5000/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "John Alexander Doe",
    "bio": "Real estate enthusiast looking for my dream home",
    "phone": "+1(555)999-8888"
  }'

# Success Response (200):
{
  "message": "Profile updated successfully",
  "userId": 1,
  "updatedFields": ["full_name", "bio", "phone"],
  "timestamp": "2026-02-01T11:30:00.000Z"
}

# Validation Error (400):
{
  "error": "Validation failed",
  "details": ["Bio cannot exceed 500 characters"]
}
```

### Change Password
```bash
curl -X POST http://localhost:5000/user/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'

# Success Response (200):
{
  "message": "Password changed successfully",
  "timestamp": "2026-02-01T11:45:00.000Z"
}

# Error (401) - wrong current password:
{
  "error": "Current password is incorrect"
}
```

### Delete Account
```bash
curl -X DELETE http://localhost:5000/user/account \
  -H "Authorization: Bearer $TOKEN"

# Success Response (200):
{
  "message": "Account deleted successfully",
  "timestamp": "2026-02-01T12:00:00.000Z"
}
```

### Get All Agents (Public)
```bash
curl -X GET "http://localhost:5000/agents?page=1&limit=10"

# Response (200):
{
  "data": [
    {
      "user_id": 2,
      "full_name": "Jane Smith",
      "email": "janesmith@example.com",
      "phone": "+1(555)987-6543",
      "company_name": "Real Estate Pro",
      "bio": "Experienced agent with 10 years..."
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Get Agent Details
```bash
curl -X GET http://localhost:5000/agents/2

# Response (200):
{
  "data": {
    "user_id": 2,
    "full_name": "Jane Smith",
    "email": "janesmith@example.com",
    "phone": "+1(555)987-6543",
    "company_name": "Real Estate Pro",
    "bio": "Experienced agent with 10 years...",
    "totalProperties": 12,
    "created_at": "2025-06-15T08:30:00.000Z"
  },
  "timestamp": "2026-02-01T12:15:00.000Z"
}
```

### Get All Users (Admin only)
```bash
curl -X GET "http://localhost:5000/admin/users?role=agent&status=active&page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Success Response (200):
{
  "data": [
    {
      "user_id": 2,
      "full_name": "Jane Smith",
      "email": "janesmith@example.com",
      "phone": "+1(555)987-6543",
      "role": "agent",
      "is_active": true,
      "created_at": "2025-06-15T08:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "count": 15
  }
}

# Permission Denied (403) - non-admin user:
{
  "error": "Permission denied - admin only"
}
```

### Update User Role (Admin only)
```bash
curl -X PUT http://localhost:5000/admin/users/1/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "newRole": "agent"
  }'

# Success Response (200):
{
  "message": "User role updated successfully",
  "userId": 1,
  "newRole": "agent",
  "timestamp": "2026-02-01T12:30:00.000Z"
}
```

---

## 4. INQUIRY TESTS

### Create Inquiry
```bash
curl -X POST http://localhost:5000/inquiries/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "property_id": 15,
    "inquirer_name": "John Doe",
    "inquirer_email": "johndoe@example.com",
    "inquirer_phone": "+1(555)123-4567",
    "inquiry_type": "viewing",
    "message": "I am very interested in this property. Can we schedule a viewing?",
    "preferred_date": "2026-02-10",
    "preferred_time": "14:00"
  }'

# Success Response (201):
{
  "message": "Inquiry created successfully",
  "inquiryId": 42,
  "status": "pending",
  "timestamp": "2026-02-01T13:00:00.000Z"
}

# Validation Error (400):
{
  "error": "Validation failed",
  "details": [
    "Inquiry type must be one of: viewing, pricing, offer, general, financing",
    "Preferred date must be in YYYY-MM-DD format"
  ]
}

# Property Not Available (404):
{
  "error": "Property not found or not available"
}
```

### Get Inquiry Details
```bash
curl -X GET http://localhost:5000/inquiries/42 \
  -H "Authorization: Bearer $TOKEN"

# Response (200):
{
  "data": {
    "inquiry_id": 42,
    "property_id": 15,
    "inquirer_name": "John Doe",
    "inquirer_email": "johndoe@example.com",
    "inquirer_phone": "+1(555)123-4567",
    "inquiry_type": "viewing",
    "message": "I am very interested in this property...",
    "preferred_date": "2026-02-10",
    "preferred_time": "14:00",
    "status": "pending",
    "property_title": "Luxury Apartment in Downtown Boston",
    "created_at": "2026-02-01T13:00:00.000Z"
  },
  "timestamp": "2026-02-01T13:15:00.000Z"
}

# Permission Denied (403) - unauthorized user:
{
  "error": "Permission denied"
}
```

### Get Property Inquiries (Agent/Admin only)
```bash
curl -X GET "http://localhost:5000/properties/15/inquiries?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer $AGENT_TOKEN"

# Response (200):
{
  "data": [
    {
      "inquiry_id": 42,
      "inquirer_name": "John Doe",
      "inquiry_type": "viewing",
      "status": "pending",
      "created_at": "2026-02-01T13:00:00.000Z"
    },
    {
      "inquiry_id": 43,
      "inquirer_name": "Jane Smith",
      "inquiry_type": "pricing",
      "status": "reviewed",
      "created_at": "2026-02-01T13:10:00.000Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "pages": 2
  },
  "filters": {
    "status": "pending"
  }
}

# Permission Denied (403) - different agent:
{
  "error": "Permission denied"
}
```

### Get User Inquiries
```bash
curl -X GET "http://localhost:5000/user/inquiries?status=pending&page=1" \
  -H "Authorization: Bearer $TOKEN"

# Response (200):
{
  "data": [
    {
      "inquiry_id": 42,
      "inquirer_name": "John Doe",
      "inquiry_type": "viewing",
      "status": "pending",
      "property_title": "Luxury Apartment in Downtown Boston",
      "price": 450000,
      "created_at": "2026-02-01T13:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Update Inquiry Status (Agent/Admin only)
```bash
curl -X PUT http://localhost:5000/inquiries/42/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -d '{
    "status": "scheduled",
    "response_notes": "Viewing scheduled for Feb 10 at 2:00 PM. Please arrive 10 minutes early."
  }'

# Success Response (200):
{
  "message": "Inquiry status updated successfully",
  "inquiryId": 42,
  "newStatus": "scheduled",
  "timestamp": "2026-02-01T13:45:00.000Z"
}
```

### Delete Inquiry (Agent/Admin only)
```bash
curl -X DELETE http://localhost:5000/inquiries/42 \
  -H "Authorization: Bearer $AGENT_TOKEN"

# Success Response (200):
{
  "message": "Inquiry deleted successfully",
  "inquiryId": 42,
  "timestamp": "2026-02-01T14:00:00.000Z"
}
```

### Get Inquiry Statistics (Admin only)
```bash
curl -X GET http://localhost:5000/admin/inquiries/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response (200):
{
  "data": {
    "statusDistribution": [
      { "status": "pending", "count": 15 },
      { "status": "reviewed", "count": 8 },
      { "status": "scheduled", "count": 12 },
      { "status": "completed", "count": 5 }
    ],
    "typeDistribution": [
      { "inquiry_type": "viewing", "count": 20 },
      { "inquiry_type": "pricing", "count": 10 },
      { "inquiry_type": "offer", "count": 5 }
    ],
    "recentInquiries": [
      {
        "inquiry_id": 42,
        "inquirer_name": "John Doe",
        "inquiry_type": "viewing",
        "status": "pending",
        "property_title": "Luxury Apartment in Downtown Boston",
        "created_at": "2026-02-01T13:00:00.000Z"
      }
    ]
  },
  "timestamp": "2026-02-01T14:15:00.000Z"
}
```

---

## 5. ERROR HANDLING TESTS

### Invalid Token
```bash
curl -X GET http://localhost:5000/user/profile \
  -H "Authorization: Bearer invalid_token_123"

# Response (403):
{
  "error": "Invalid or expired token"
}
```

### Missing Required Token
```bash
curl -X GET http://localhost:5000/user/profile

# Response (401):
{
  "error": "Access token required"
}
```

### Invalid Input Data
```bash
curl -X POST http://localhost:5000/properties/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "123",  # Too short
    "price": -100,   # Negative
    "city": ""       # Empty
  }'

# Response (400):
{
  "error": "Validation failed",
  "details": [
    "Title must be between 5 and 255 characters",
    "Price must be greater than 0",
    "City is required"
  ]
}
```

### Role-Based Permission Error
```bash
# Buyer tries to create property
curl -X POST http://localhost:5000/properties/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{...}'

# Response (403):
{
  "error": "Permission denied"
}
```

---

## 6. POSTMAN COLLECTION SETUP

### Environment Variables
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 1,
  "propertyId": 15,
  "inquiryId": 42,
  "baseUrl": "http://localhost:5000"
}
```

### Headers Template
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 7. SUCCESS CRITERIA

- ✅ All CRUD operations functional
- ✅ Input validation working correctly
- ✅ Role-based access enforced
- ✅ Pagination returning correct data
- ✅ Filtering producing expected results
- ✅ Error messages clear and helpful
- ✅ Soft deletes preserving data
- ✅ Timestamps accurate
- ✅ No SQL injection vulnerabilities
- ✅ Passwords properly hashed

---

**Test Version**: 1.0
**Last Updated**: 2026-02-01
**Status**: Ready for comprehensive testing
