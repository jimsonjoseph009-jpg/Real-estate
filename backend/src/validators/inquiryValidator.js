/**
 * Inquiry Validator - Comprehensive data validation for inquiry operations
 */

export class InquiryValidator {
  static validateCreateInquiry(data) {
    const errors = [];

    if (!data.property_id || !Number.isInteger(data.property_id) || data.property_id <= 0) {
      errors.push('Valid property ID is required');
    }

    if (!data.inquirer_name || typeof data.inquirer_name !== 'string') {
      errors.push('Inquirer name is required');
    } else if (data.inquirer_name.length < 2 || data.inquirer_name.length > 100) {
      errors.push('Name must be between 2 and 100 characters');
    }

    if (!data.inquirer_email || typeof data.inquirer_email !== 'string') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.inquirer_email)) {
      errors.push('Invalid email format');
    }

    if (data.inquirer_phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(data.inquirer_phone)) {
      errors.push('Invalid phone format');
    }

    if (!data.inquiry_type || typeof data.inquiry_type !== 'string') {
      errors.push('Inquiry type is required');
    } else {
      const validTypes = ['viewing', 'pricing', 'offer', 'general', 'financing'];
      if (!validTypes.includes(data.inquiry_type.toLowerCase())) {
        errors.push(`Inquiry type must be one of: ${validTypes.join(', ')}`);
      }
    }

    if (data.message && data.message.length > 2000) {
      errors.push('Message cannot exceed 2000 characters');
    }

    if (data.preferred_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.preferred_date)) {
      errors.push('Preferred date must be in YYYY-MM-DD format');
    }

    if (data.preferred_time && !/^\d{2}:\d{2}$/.test(data.preferred_time)) {
      errors.push('Preferred time must be in HH:MM format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateStatus(data) {
    const errors = [];

    if (!data.status || typeof data.status !== 'string') {
      errors.push('Status is required');
    } else {
      const validStatuses = ['pending', 'reviewed', 'scheduled', 'completed', 'rejected'];
      if (!validStatuses.includes(data.status.toLowerCase())) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    if (data.response_notes && data.response_notes.length > 1000) {
      errors.push('Response notes cannot exceed 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default InquiryValidator;
