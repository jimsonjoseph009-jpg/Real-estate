/**
 * Property Validator - Comprehensive data validation for property operations
 */

export class PropertyValidator {
  static validateCreateProperty(data) {
    const errors = [];

    // Required fields
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required and must be a string');
    } else if (data.title.length < 5 || data.title.length > 255) {
      errors.push('Title must be between 5 and 255 characters');
    }

    if (!data.category_id || !Number.isInteger(data.category_id) || data.category_id <= 0) {
      errors.push('Valid category ID is required');
    }

    if (!data.property_type || typeof data.property_type !== 'string') {
      errors.push('Property type is required');
    } else {
      const validTypes = ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'];
      if (!validTypes.includes(data.property_type.toLowerCase())) {
        errors.push(`Property type must be one of: ${validTypes.join(', ')}`);
      }
    }

    if (!data.location || typeof data.location !== 'string') {
      errors.push('Location is required');
    } else if (data.location.length < 3) {
      errors.push('Location must be at least 3 characters');
    }

    if (!data.city || typeof data.city !== 'string') {
      errors.push('City is required');
    } else if (data.city.length < 2) {
      errors.push('City must be at least 2 characters');
    }

    if (!data.state || typeof data.state !== 'string') {
      errors.push('State is required');
    }

    if (data.postal_code && !/^\d{5}(-\d{4})?$/.test(data.postal_code)) {
      errors.push('Invalid postal code format');
    }

    if (!data.price || !Number.isFinite(data.price) || data.price <= 0) {
      errors.push('Valid price greater than 0 is required');
    } else if (data.price > 999999999) {
      errors.push('Price exceeds maximum allowed value');
    }

    if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
      errors.push('Currency must be a valid 3-letter code');
    }

    if (data.bedrooms !== undefined) {
      if (!Number.isInteger(data.bedrooms) || data.bedrooms < 0 || data.bedrooms > 20) {
        errors.push('Bedrooms must be between 0 and 20');
      }
    }

    if (data.bathrooms !== undefined) {
      if (!Number.isInteger(data.bathrooms) || data.bathrooms < 0 || data.bathrooms > 20) {
        errors.push('Bathrooms must be between 0 and 20');
      }
    }

    if (data.total_area !== undefined) {
      if (!Number.isFinite(data.total_area) || data.total_area <= 0) {
        errors.push('Total area must be greater than 0');
      } else if (data.total_area > 9999999) {
        errors.push('Total area exceeds maximum value');
      }
    }

    if (data.year_built !== undefined) {
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(data.year_built) || data.year_built < 1800 || data.year_built > currentYear) {
        errors.push(`Year built must be between 1800 and ${currentYear}`);
      }
    }

    if (data.parking_spaces !== undefined) {
      if (!Number.isInteger(data.parking_spaces) || data.parking_spaces < 0) {
        errors.push('Parking spaces cannot be negative');
      }
    }

    if (data.latitude !== undefined) {
      if (!Number.isFinite(data.latitude) || data.latitude < -90 || data.latitude > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }

    if (data.longitude !== undefined) {
      if (!Number.isFinite(data.longitude) || data.longitude < -180 || data.longitude > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }

    if (data.description && data.description.length > 2000) {
      errors.push('Description cannot exceed 2000 characters');
    }

    if (data.is_furnished !== undefined && typeof data.is_furnished !== 'boolean') {
      errors.push('is_furnished must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateProperty(data) {
    const errors = [];

    if (Object.keys(data).length === 0) {
      errors.push('At least one field must be provided for update');
    }

    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.length < 5 || data.title.length > 255) {
        errors.push('Title must be between 5 and 255 characters');
      }
    }

    if (data.price !== undefined) {
      if (!Number.isFinite(data.price) || data.price <= 0) {
        errors.push('Price must be greater than 0');
      }
    }

    if (data.status !== undefined) {
      const validStatuses = ['available', 'sold', 'rented', 'archived'];
      if (!validStatuses.includes(data.status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate other fields similarly
    if (data.bedrooms !== undefined && (!Number.isInteger(data.bedrooms) || data.bedrooms < 0)) {
      errors.push('Bedrooms must be a non-negative integer');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateFilterParams(filters) {
    const errors = [];

    if (filters.minPrice !== undefined) {
      const price = parseFloat(filters.minPrice);
      if (isNaN(price) || price < 0) {
        errors.push('minPrice must be a valid non-negative number');
      }
    }

    if (filters.maxPrice !== undefined) {
      const price = parseFloat(filters.maxPrice);
      if (isNaN(price) || price < 0) {
        errors.push('maxPrice must be a valid non-negative number');
      }
    }

    if (filters.page !== undefined) {
      const page = parseInt(filters.page);
      if (isNaN(page) || page < 1) {
        errors.push('page must be a positive integer');
      }
    }

    if (filters.limit !== undefined) {
      const limit = parseInt(filters.limit);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        errors.push('limit must be between 1 and 100');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default PropertyValidator;
