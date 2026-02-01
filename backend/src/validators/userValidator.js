/**
 * User Validator - Comprehensive data validation for user operations
 */

export class UserValidator {
  static validateRegister(data) {
    const errors = [];

    if (!data.full_name || typeof data.full_name !== 'string') {
      errors.push('Full name is required and must be a string');
    } else if (data.full_name.length < 2 || data.full_name.length > 100) {
      errors.push('Full name must be between 2 and 100 characters');
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.full_name)) {
      errors.push('Full name contains invalid characters');
    }

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    } else if (data.email.length > 255) {
      errors.push('Email is too long');
    }

    if (!data.phone || typeof data.phone !== 'string') {
      errors.push('Phone number is required');
    } else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(data.phone)) {
      errors.push('Invalid phone format');
    }

    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.push('Password must contain uppercase, lowercase, and numbers');
    }

    if (!data.national_id || typeof data.national_id !== 'string') {
      errors.push('National ID is required');
    } else if (data.national_id.length < 5 || data.national_id.length > 20) {
      errors.push('National ID must be between 5 and 20 characters');
    }

    if (data.role && !['buyer', 'agent', 'admin'].includes(data.role)) {
      errors.push('Invalid role');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateLogin(data) {
    const errors = [];

    if (!data.email) {
      errors.push('Email is required');
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateProfile(data) {
    const errors = [];

    // Prevent restricted fields
    const restrictedFields = ['user_id', 'password_hash', 'role', 'created_at', 'national_id'];
    const providedRestricted = restrictedFields.filter(field => field in data);
    
    if (providedRestricted.length > 0) {
      errors.push(`Cannot update restricted fields: ${providedRestricted.join(', ')}`);
    }

    if (data.full_name !== undefined) {
      if (typeof data.full_name !== 'string' || data.full_name.length < 2) {
        errors.push('Full name must be at least 2 characters');
      }
    }

    if (data.email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    if (data.phone !== undefined) {
      if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(data.phone)) {
        errors.push('Invalid phone format');
      }
    }

    if (data.bio !== undefined && data.bio.length > 500) {
      errors.push('Bio cannot exceed 500 characters');
    }

    if (data.company_name !== undefined && data.company_name.length > 100) {
      errors.push('Company name cannot exceed 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateChangePassword(data) {
    const errors = [];

    if (!data.currentPassword) {
      errors.push('Current password is required');
    }

    if (!data.newPassword) {
      errors.push('New password is required');
    } else if (data.newPassword.length < 8) {
      errors.push('New password must be at least 8 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
      errors.push('Password must contain uppercase, lowercase, and numbers');
    }

    if (data.currentPassword === data.newPassword) {
      errors.push('New password must be different from current password');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default UserValidator;
