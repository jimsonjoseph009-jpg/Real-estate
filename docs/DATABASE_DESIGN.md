# Real Estate Management System - Database Design Document

## Overview
This document details the database schema for the Real Estate Management System, designed and normalized to Third Normal Form (3NF).

## Database Schema

### 1. Users Table
**Purpose:** Stores user account information with role-based access control

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| user_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(100) | UNIQUE, NOT NULL | User's email address |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | User's phone number |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | ENUM | NOT NULL, DEFAULT 'buyer' | User role (admin, agent, buyer, seller) |
| company_name | VARCHAR(100) | NULL | For agents/agencies |
| company_registration | VARCHAR(50) | NULL | Business registration number |
| national_id | VARCHAR(50) | UNIQUE, NOT NULL | National ID for verification |
| profile_picture_url | VARCHAR(255) | NULL | User profile picture |
| bio | TEXT | NULL | User biography/description |
| address | VARCHAR(255) | NULL | Residential address |
| city | VARCHAR(50) | NULL | City |
| state | VARCHAR(50) | NULL | State/Province |
| postal_code | VARCHAR(20) | NULL | Postal code |
| is_verified | BOOLEAN | DEFAULT FALSE | Email/account verification status |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:** email, phone, national_id, role

### 2. Categories Table
**Purpose:** Stores property categories/types

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| category_id | INT | PRIMARY KEY, AUTO_INCREMENT | Category identifier |
| category_name | VARCHAR(50) | UNIQUE, NOT NULL | Category name (Apartment, House, etc.) |
| description | TEXT | NULL | Category description |
| is_active | BOOLEAN | DEFAULT TRUE | Category status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Indexes:** category_name

### 3. Amenities Table
**Purpose:** Stores available property amenities

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| amenity_id | INT | PRIMARY KEY, AUTO_INCREMENT | Amenity identifier |
| amenity_name | VARCHAR(100) | UNIQUE, NOT NULL | Amenity name (WiFi, Pool, etc.) |
| description | TEXT | NULL | Amenity description |
| icon_class | VARCHAR(50) | NULL | CSS icon class for UI |
| is_active | BOOLEAN | DEFAULT TRUE | Amenity status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Indexes:** amenity_name

### 4. Properties Table
**Purpose:** Main table storing property listings

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| property_id | INT | PRIMARY KEY, AUTO_INCREMENT | Property identifier |
| title | VARCHAR(200) | NOT NULL | Property title |
| description | TEXT | NULL | Detailed description |
| category_id | INT | NOT NULL, FK | Reference to categories |
| agent_id | INT | NOT NULL, FK | Reference to agent (user) |
| property_type | ENUM | NOT NULL | residential, commercial, land, mixed-use |
| location | VARCHAR(255) | NOT NULL | Street address |
| city | VARCHAR(50) | NOT NULL | City name |
| state | VARCHAR(50) | NOT NULL | State/Province |
| postal_code | VARCHAR(20) | NULL | Postal code |
| latitude | DECIMAL(10,8) | NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NULL | GPS longitude |
| price | DECIMAL(15,2) | NOT NULL | Property price |
| currency | ENUM | DEFAULT 'USD' | Currency (USD, EUR, KES, GBP, INR) |
| bedrooms | INT | NULL | Number of bedrooms |
| bathrooms | INT | NULL | Number of bathrooms |
| total_area | DECIMAL(10,2) | NULL | Total area size |
| area_unit | ENUM | DEFAULT 'sqft' | sqft or sqm |
| year_built | INT | NULL | Year property was built |
| parking_spaces | INT | DEFAULT 0 | Number of parking spaces |
| is_furnished | BOOLEAN | DEFAULT FALSE | Furnished status |
| status | ENUM | DEFAULT 'available' | available, sold, rented, under_offer, off_market |
| featured | BOOLEAN | DEFAULT FALSE | Featured listing flag |
| views_count | INT | DEFAULT 0 | Number of views |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Listing creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:** city, status, price, category_id, agent_id, created_at
**Full Text Indexes:** title, description, location

### 5. Property_Amenities Table (Junction)
**Purpose:** Links properties to their amenities (many-to-many relationship)

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| property_amenity_id | INT | PRIMARY KEY, AUTO_INCREMENT | Relationship identifier |
| property_id | INT | NOT NULL, FK | Property reference |
| amenity_id | INT | NOT NULL, FK | Amenity reference |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Constraints:** UNIQUE(property_id, amenity_id), ON DELETE CASCADE for property

### 6. Property_Images Table
**Purpose:** Stores multiple images per property

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| image_id | INT | PRIMARY KEY, AUTO_INCREMENT | Image identifier |
| property_id | INT | NOT NULL, FK | Property reference |
| image_url | VARCHAR(500) | NOT NULL | Image URL/path |
| image_alt_text | VARCHAR(200) | NULL | Alternative text |
| is_primary | BOOLEAN | DEFAULT FALSE | Primary/cover image flag |
| display_order | INT | DEFAULT 0 | Display order in gallery |
| uploaded_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload time |

**Constraints:** ON DELETE CASCADE for property
**Indexes:** property_id, is_primary

### 7. Inquiries Table
**Purpose:** Tracks user inquiries about properties

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| inquiry_id | INT | PRIMARY KEY, AUTO_INCREMENT | Inquiry identifier |
| property_id | INT | NOT NULL, FK | Property reference |
| user_id | INT | NOT NULL, FK | User reference |
| inquirer_name | VARCHAR(100) | NOT NULL | Name of inquirer |
| inquirer_email | VARCHAR(100) | NOT NULL | Email of inquirer |
| inquirer_phone | VARCHAR(20) | NULL | Phone of inquirer |
| inquiry_type | ENUM | NOT NULL | viewing, information, offer, general |
| message | TEXT | NULL | Inquiry message/notes |
| preferred_date | DATE | NULL | Preferred viewing date |
| preferred_time | TIME | NULL | Preferred viewing time |
| status | ENUM | DEFAULT 'new' | new, contacted, scheduled, completed, cancelled |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Constraints:** ON DELETE CASCADE for property
**Indexes:** property_id, user_id, status, created_at

### 8. Reviews Table
**Purpose:** Stores reviews for properties and agents

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| review_id | INT | PRIMARY KEY, AUTO_INCREMENT | Review identifier |
| property_id | INT | NULL, FK | Property reference |
| agent_id | INT | NULL, FK | Agent reference |
| reviewer_user_id | INT | NOT NULL, FK | User who left review |
| rating | INT | NOT NULL, CHECK(1-5) | Rating 1-5 stars |
| title | VARCHAR(200) | NULL | Review title |
| comment | TEXT | NOT NULL | Review comment |
| review_type | ENUM | NOT NULL | 'property' or 'agent' |
| is_verified_buyer | BOOLEAN | DEFAULT FALSE | Verified purchase flag |
| helpful_count | INT | DEFAULT 0 | Number finding it helpful |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Review creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Constraints:** ON DELETE SET NULL for both property and agent
**Indexes:** property_id, agent_id, reviewer_user_id, rating, review_type

## Normalization to 3NF

### First Normal Form (1NF)
- All attributes contain atomic values (no repeating groups)
- Property_Amenities acts as junction table to eliminate multivalued attributes
- Property_Images table stores multiple images separately

### Second Normal Form (2NF)
- All non-key attributes are fully functionally dependent on primary key
- No partial dependencies
- All tables follow one-to-many relationships properly

### Third Normal Form (3NF)
- No transitive dependencies
- Non-key attributes depend only on primary key, not on other non-key attributes
- Example: In Properties table, location data (city, state) depends on property_id, not on agent_id

## Database Views

### property_with_details
Displays properties with category and agent information for easier querying

## Stored Procedures

### search_properties(p_city, p_min_price, p_max_price, p_bedrooms, p_category_id)
Searches properties based on multiple criteria

## Triggers

1. **update_property_timestamp** - Auto-updates property updated_at timestamp
2. **update_user_timestamp** - Auto-updates user updated_at timestamp
3. **increment_property_views** - Increments property views when inquiry is created

## Security Features

- Password fields are hashed (bcrypt)
- Unique constraints on sensitive fields (email, phone, national_id)
- User roles enable role-based access control
- Account verification status tracking
- Active/inactive status for soft deletes

## Performance Optimizations

- Composite indexes on commonly queried fields
- Full-text indexes for title/description search
- Proper foreign key relationships with cascading deletes
- Connection pooling configured in application

## Data Integrity

- Foreign key constraints prevent orphaned records
- Check constraints on rating values
- Unique constraints prevent duplicate entries
- Cascading deletes maintain referential integrity

