-- Real Estate Management System Database
-- Normalized to 3NF with 8 related tables
-- Created: February 2026

CREATE DATABASE IF NOT EXISTS real_estate_system;
USE real_estate_system;

-- ============================================
-- 1. Users Table - Stores user information
-- ============================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'agent', 'buyer', 'seller') NOT NULL DEFAULT 'buyer',
    company_name VARCHAR(100),
    company_registration VARCHAR(50),
    national_id VARCHAR(50) UNIQUE NOT NULL,
    profile_picture_url VARCHAR(255),
    bio TEXT,
    address VARCHAR(255),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_phone (phone),
    UNIQUE KEY unique_national_id (national_id),
    INDEX idx_role (role),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Categories Table - Property categories
-- ============================================
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Amenities Table - Property amenities
-- ============================================
CREATE TABLE amenities (
    amenity_id INT PRIMARY KEY AUTO_INCREMENT,
    amenity_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_class VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_amenity_name (amenity_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Properties Table - Main properties table
-- ============================================
CREATE TABLE properties (
    property_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    agent_id INT NOT NULL,
    property_type ENUM('residential', 'commercial', 'land', 'mixed-use') NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    price DECIMAL(15, 2) NOT NULL,
    currency ENUM('USD', 'EUR', 'KES', 'GBP', 'INR') DEFAULT 'USD',
    bedrooms INT,
    bathrooms INT,
    total_area DECIMAL(10, 2),
    area_unit ENUM('sqft', 'sqm') DEFAULT 'sqft',
    year_built INT,
    parking_spaces INT DEFAULT 0,
    is_furnished BOOLEAN DEFAULT FALSE,
    status ENUM('available', 'sold', 'rented', 'under_offer', 'off_market') DEFAULT 'available',
    featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (agent_id) REFERENCES users(user_id),
    INDEX idx_city (city),
    INDEX idx_status (status),
    INDEX idx_price (price),
    INDEX idx_category_id (category_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Property_Amenities Table (Junction Table)
-- ============================================
CREATE TABLE property_amenities (
    property_amenity_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    amenity_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id),
    UNIQUE KEY unique_property_amenity (property_id, amenity_id),
    INDEX idx_property_id (property_id),
    INDEX idx_amenity_id (amenity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Property_Images Table - Store multiple images
-- ============================================
CREATE TABLE property_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_alt_text VARCHAR(200),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Inquiries Table - User inquiries for properties
-- ============================================
CREATE TABLE inquiries (
    inquiry_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    inquirer_name VARCHAR(100) NOT NULL,
    inquirer_email VARCHAR(100) NOT NULL,
    inquirer_phone VARCHAR(20),
    inquiry_type ENUM('viewing', 'information', 'offer', 'general') NOT NULL,
    message TEXT,
    preferred_date DATE,
    preferred_time TIME,
    status ENUM('new', 'contacted', 'scheduled', 'completed', 'cancelled') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_property_id (property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Reviews Table - Property and agent reviews
-- ============================================
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    agent_id INT,
    reviewer_user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,
    review_type ENUM('property', 'agent') NOT NULL,
    is_verified_buyer BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
    FOREIGN KEY (agent_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (reviewer_user_id) REFERENCES users(user_id),
    INDEX idx_property_id (property_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_reviewer_user_id (reviewer_user_id),
    INDEX idx_rating (rating),
    INDEX idx_review_type (review_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Sample Data
-- ============================================

-- Insert Categories
INSERT INTO categories (category_name, description) VALUES
('Apartment', 'Modern apartments in urban areas'),
('House', 'Single family homes and villas'),
('Commercial', 'Office spaces and retail units'),
('Land', 'Vacant land for development'),
('Condo', 'Condominium units'),
('Farm', 'Agricultural land and properties');

-- Insert Amenities
INSERT INTO amenities (amenity_name, description, icon_class) VALUES
('WiFi', 'High-speed internet', 'fas fa-wifi'),
('Swimming Pool', 'Outdoor swimming pool', 'fas fa-water'),
('Gym', 'Fitness center', 'fas fa-dumbbell'),
('Parking', 'Dedicated parking spaces', 'fas fa-car'),
('Garden', 'Landscaped garden', 'fas fa-leaf'),
('Security', '24/7 security system', 'fas fa-shield-alt'),
('Air Conditioning', 'Central AC system', 'fas fa-snowflake'),
('Elevator', 'Passenger elevator', 'fas fa-arrow-up'),
('Balcony', 'Spacious balcony', 'fas fa-door-open'),
('Kitchen', 'Equipped kitchen', 'fas fa-utensils');

-- Insert Admin User
INSERT INTO users (full_name, email, phone, password_hash, role, national_id, is_verified, is_active) VALUES
('Admin User', 'admin@realestate.com', '+1234567890', '$2b$10$YourHashedPasswordHere', 'admin', 'ADMIN001', TRUE, TRUE);

-- Insert Sample Agent
INSERT INTO users (full_name, email, phone, password_hash, role, company_name, national_id, is_verified, is_active) VALUES
('John Smith', 'agent@realestate.com', '+1234567891', '$2b$10$YourHashedPasswordHere', 'agent', 'Real Estate Solutions', 'AGENT001', TRUE, TRUE);

-- Insert Sample Properties
INSERT INTO properties (title, description, category_id, agent_id, property_type, location, city, state, postal_code, latitude, longitude, price, currency, bedrooms, bathrooms, total_area, area_unit, year_built, parking_spaces, is_furnished, status, featured, views_count) VALUES
('Luxury Apartment Downtown', 'Premium apartment with modern amenities in the heart of the city', 1, 2, 'residential', '123 Main Street', 'New York', 'NY', '10001', 40.7128, -74.0060, 1500000, 'USD', 3, 2, 2000, 'sqft', 2020, 2, TRUE, 'available', TRUE, 250),
('Cozy Family House', 'Beautiful 4-bedroom house perfect for families', 2, 2, 'residential', '456 Oak Avenue', 'Los Angeles', 'CA', '90001', 34.0522, -118.2437, 850000, 'USD', 4, 3, 3500, 'sqft', 2015, 2, FALSE, 'available', FALSE, 180),
('Commercial Office Space', 'Modern office space in business district', 3, 2, 'commercial', '789 Business Park', 'Chicago', 'IL', '60601', 41.8781, -87.6298, 2500000, 'USD', NULL, NULL, 5000, 'sqft', 2018, 5, TRUE, 'available', TRUE, 120);

-- Insert Sample Images
INSERT INTO property_images (property_id, image_url, image_alt_text, is_primary, display_order) VALUES
(1, 'https://via.placeholder.com/600x400?text=Apartment+Front', 'Front view of apartment', TRUE, 1),
(1, 'https://via.placeholder.com/600x400?text=Apartment+Living', 'Living room', FALSE, 2),
(2, 'https://via.placeholder.com/600x400?text=House+Exterior', 'House exterior', TRUE, 1),
(3, 'https://via.placeholder.com/600x400?text=Office+Space', 'Office space', TRUE, 1);

-- Insert Property Amenities
INSERT INTO property_amenities (property_id, amenity_id) VALUES
(1, 1), (1, 3), (1, 4), (1, 6), (1, 7), (1, 9),
(2, 4), (2, 5), (2, 6), (2, 10),
(3, 1), (3, 3), (3, 4), (3, 6), (3, 8);

-- Create Indexes for Performance
ALTER TABLE properties ADD FULLTEXT INDEX ft_title_description (title, description);
ALTER TABLE properties ADD FULLTEXT INDEX ft_location (location, city, state);

-- Create Views for Common Queries
CREATE VIEW property_with_details AS
SELECT 
    p.property_id,
    p.title,
    p.description,
    p.price,
    p.currency,
    p.city,
    p.state,
    p.bedrooms,
    p.bathrooms,
    p.total_area,
    c.category_name,
    u.full_name AS agent_name,
    u.phone AS agent_phone,
    u.email AS agent_email,
    p.views_count,
    p.created_at,
    p.status
FROM properties p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN users u ON p.agent_id = u.user_id
WHERE p.status = 'available';

-- Create Stored Procedure for Property Search
DELIMITER $$

CREATE PROCEDURE search_properties(
    IN p_city VARCHAR(50),
    IN p_min_price DECIMAL(15, 2),
    IN p_max_price DECIMAL(15, 2),
    IN p_bedrooms INT,
    IN p_category_id INT
)
BEGIN
    SELECT p.property_id, p.title, p.description, p.price, p.city, 
           p.bedrooms, p.bathrooms, p.total_area, c.category_name,
           u.full_name AS agent_name, p.views_count
    FROM properties p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN users u ON p.agent_id = u.user_id
    WHERE (p_city IS NULL OR p.city = p_city)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_bedrooms IS NULL OR p.bedrooms = p_bedrooms)
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND p.status = 'available'
    ORDER BY p.views_count DESC;
END$$

DELIMITER ;

-- Create Triggers
DELIMITER $$

CREATE TRIGGER update_property_timestamp
BEFORE UPDATE ON properties
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER increment_property_views
AFTER INSERT ON inquiries
FOR EACH ROW
BEGIN
    UPDATE properties SET views_count = views_count + 1 WHERE property_id = NEW.property_id;
END$$

DELIMITER ;

-- Grant Privileges
GRANT ALL PRIVILEGES ON real_estate_system.* TO 'realestate_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
FLUSH PRIVILEGES;
