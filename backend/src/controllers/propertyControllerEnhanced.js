import { getConnection } from '../utils/db.js';
import { sanitizeObject } from '../utils/security.js';
import PropertyValidator from '../validators/propertyValidator.js';

export class PropertyControllerEnhanced {
  /**
   * CREATE - Add new property (agent/admin only)
   */
  static async createProperty(req, res) {
    try {
      // Validate input data
      const validation = PropertyValidator.validateCreateProperty(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }

      const {
        title, description, category_id, property_type, location, city, state,
        postal_code, latitude, longitude, price, currency, bedrooms, bathrooms,
        total_area, area_unit, year_built, parking_spaces, is_furnished
      } = req.body;

      const agentId = req.user.userId;
      const connection = await getConnection();

      try {
        // Check if category exists
        const [categories] = await connection.execute(
          'SELECT category_id FROM categories WHERE category_id = ?',
          [category_id]
        );
        if (categories.length === 0) {
          return res.status(400).json({ error: 'Invalid category ID' });
        }

        // Insert property
        const [result] = await connection.execute(
          `INSERT INTO properties (
            title, description, category_id, agent_id, property_type, location, city, state,
            postal_code, latitude, longitude, price, currency, bedrooms, bathrooms, total_area,
            area_unit, year_built, parking_spaces, is_furnished, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title, description, category_id, agentId, property_type.toLowerCase(), location,
            city, state, postal_code || null, latitude || null, longitude || null, price,
            currency || 'USD', bedrooms || 0, bathrooms || 0, total_area || null,
            area_unit || 'sqft', year_built || null, parking_spaces || 0, is_furnished || false, 'available'
          ]
        );

        res.status(201).json({
          message: 'Property created successfully',
          propertyId: result.insertId,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({ error: 'Failed to create property' });
    }
  }

  /**
   * READ - Get all properties with advanced filtering
   */
  static async getAllProperties(req, res) {
    try {
      const validation = PropertyValidator.validateFilterParams(req.query);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Invalid filter parameters', details: validation.errors });
      }

      const {
        city, minPrice, maxPrice, bedrooms, bathrooms, propertyType, categoryId,
        featured, searchTerm, sortBy = 'featured', page = 1, limit = 10
      } = req.query;

      const offset = (page - 1) * limit;
      const connection = await getConnection();

      try {
        let query = `
          SELECT p.*, c.category_name, u.full_name as agent_name, u.phone as agent_phone
          FROM properties p
          LEFT JOIN categories c ON p.category_id = c.category_id
          LEFT JOIN users u ON p.agent_id = u.user_id
          WHERE p.status = 'available'
        `;
        const params = [];

        // Apply filters
        if (city) {
          query += ' AND p.city = ?';
          params.push(city);
        }
        if (minPrice) {
          query += ' AND p.price >= ?';
          params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
          query += ' AND p.price <= ?';
          params.push(parseFloat(maxPrice));
        }
        if (bedrooms) {
          query += ' AND p.bedrooms >= ?';
          params.push(parseInt(bedrooms));
        }
        if (bathrooms) {
          query += ' AND p.bathrooms >= ?';
          params.push(parseInt(bathrooms));
        }
        if (propertyType) {
          query += ' AND LOWER(p.property_type) = ?';
          params.push(propertyType.toLowerCase());
        }
        if (categoryId) {
          query += ' AND p.category_id = ?';
          params.push(parseInt(categoryId));
        }
        if (featured === 'true') {
          query += ' AND p.featured = true';
        }
        if (searchTerm) {
          query += ' AND (MATCH(p.title, p.description) AGAINST(? IN BOOLEAN MODE) OR p.title LIKE ? OR p.city LIKE ?)';
          params.push(searchTerm, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Apply sorting
        const validSortFields = ['featured', 'price', 'created_at', 'views_count'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'featured';
        query += ` ORDER BY p.${sortField} DESC`;

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [properties] = await connection.execute(query, params);

        // Get total count with same filters
        let countQuery = 'SELECT COUNT(*) as total FROM properties WHERE status = "available"';
        const countParams = [];

        if (city) {
          countQuery += ' AND city = ?';
          countParams.push(city);
        }
        if (minPrice) {
          countQuery += ' AND price >= ?';
          countParams.push(parseFloat(minPrice));
        }
        if (maxPrice) {
          countQuery += ' AND price <= ?';
          countParams.push(parseFloat(maxPrice));
        }
        if (bedrooms) {
          countQuery += ' AND bedrooms >= ?';
          countParams.push(parseInt(bedrooms));
        }
        if (bathrooms) {
          countQuery += ' AND bathrooms >= ?';
          countParams.push(parseInt(bathrooms));
        }
        if (propertyType) {
          countQuery += ' AND LOWER(property_type) = ?';
          countParams.push(propertyType.toLowerCase());
        }
        if (categoryId) {
          countQuery += ' AND category_id = ?';
          countParams.push(parseInt(categoryId));
        }
        if (searchTerm) {
          countQuery += ' AND (MATCH(title, description) AGAINST(? IN BOOLEAN MODE) OR title LIKE ? OR city LIKE ?)';
          countParams.push(searchTerm, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        const [countResult] = await connection.execute(countQuery, countParams);

        res.json({
          data: properties,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(countResult[0].total / limit),
            hasNext: parseInt(page) < Math.ceil(countResult[0].total / limit),
            hasPrev: parseInt(page) > 1
          },
          filters: {
            city: city || null,
            priceRange: { min: minPrice || null, max: maxPrice || null },
            bedrooms: bedrooms || null,
            propertyType: propertyType || null
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get all properties error:', error);
      res.status(500).json({ error: 'Failed to retrieve properties' });
    }
  }

  /**
   * READ - Get single property by ID
   */
  static async getProperty(req, res) {
    try {
      const { propertyId } = req.params;

      if (!Number.isInteger(parseInt(propertyId))) {
        return res.status(400).json({ error: 'Invalid property ID' });
      }

      const connection = await getConnection();

      try {
        // Get property details
        const [properties] = await connection.execute(
          `SELECT p.*, c.category_name, u.full_name as agent_name, u.phone as agent_phone, u.email as agent_email
           FROM properties p
           LEFT JOIN categories c ON p.category_id = c.category_id
           LEFT JOIN users u ON p.agent_id = u.user_id
           WHERE p.property_id = ?`,
          [propertyId]
        );

        if (properties.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }

        // Get images
        const [images] = await connection.execute(
          'SELECT property_image_id, image_url, display_order FROM property_images WHERE property_id = ? ORDER BY display_order',
          [propertyId]
        );

        // Get amenities
        const [amenities] = await connection.execute(
          `SELECT a.amenity_id, a.amenity_name FROM amenities a
           JOIN property_amenities pa ON a.amenity_id = pa.amenity_id
           WHERE pa.property_id = ?`,
          [propertyId]
        );

        // Get reviews
        const [reviews] = await connection.execute(
          `SELECT r.review_id, r.rating, r.review_text, r.created_at, u.full_name as reviewer_name
           FROM reviews r
           LEFT JOIN users u ON r.reviewer_user_id = u.user_id
           WHERE r.property_id = ? ORDER BY r.created_at DESC`,
          [propertyId]
        );

        // Increment view count
        await connection.execute(
          'UPDATE properties SET views_count = views_count + 1 WHERE property_id = ?',
          [propertyId]
        );

        const property = properties[0];
        property.images = images;
        property.amenities = amenities;
        property.reviews = reviews;

        res.json({
          data: property,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({ error: 'Failed to retrieve property' });
    }
  }

  /**
   * UPDATE - Update property (agent/admin only)
   */
  static async updateProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const validation = PropertyValidator.validateUpdateProperty(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }

      const updates = sanitizeObject(req.body);

      // Prevent restricted field updates
      const restrictedFields = ['property_id', 'agent_id', 'created_at', 'user_id'];
      restrictedFields.forEach(field => delete updates[field]);

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const connection = await getConnection();

      try {
        // Check ownership and role-based access
        const [properties] = await connection.execute(
          'SELECT agent_id FROM properties WHERE property_id = ?',
          [propertyId]
        );

        if (properties.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }

        // Role-based access control
        if (req.user.role !== 'admin' && properties[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied - can only edit own properties' });
        }

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(propertyId);

        await connection.execute(
          `UPDATE properties SET ${fields}, updated_at = NOW() WHERE property_id = ?`,
          values
        );

        res.json({
          message: 'Property updated successfully',
          propertyId,
          updatedFields: Object.keys(updates),
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({ error: 'Failed to update property' });
    }
  }

  /**
   * DELETE - Delete property (agent/admin only)
   */
  static async deleteProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const connection = await getConnection();

      try {
        // Check ownership
        const [properties] = await connection.execute(
          'SELECT agent_id FROM properties WHERE property_id = ?',
          [propertyId]
        );

        if (properties.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }

        // Role-based access control
        if (req.user.role !== 'admin' && properties[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied - can only delete own properties' });
        }

        // Soft delete - mark as archived
        await connection.execute(
          'UPDATE properties SET status = "archived", deleted_at = NOW() WHERE property_id = ?',
          [propertyId]
        );

        res.json({
          message: 'Property deleted successfully',
          propertyId,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({ error: 'Failed to delete property' });
    }
  }

  /**
   * SEARCH - Advanced search with filters
   */
  static async searchProperties(req, res) {
    try {
      const { query, location, minPrice, maxPrice, bedrooms, propertyType, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      const connection = await getConnection();

      try {
        let sql = `
          SELECT p.property_id, p.title, p.description, p.price, p.city,
                 p.bedrooms, p.bathrooms, p.total_area, c.category_name
          FROM properties p
          LEFT JOIN categories c ON p.category_id = c.category_id
          WHERE p.status = 'available'
        `;
        const params = [];

        if (query) {
          sql += ' AND (MATCH(p.title, p.description) AGAINST(? IN BOOLEAN MODE) OR p.title LIKE ?)';
          params.push(query, `%${query}%`);
        }

        if (location) {
          sql += ' AND (p.city LIKE ? OR p.location LIKE ?)';
          params.push(`%${location}%`, `%${location}%`);
        }

        if (minPrice) {
          sql += ' AND p.price >= ?';
          params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
          sql += ' AND p.price <= ?';
          params.push(parseFloat(maxPrice));
        }

        if (bedrooms) {
          sql += ' AND p.bedrooms >= ?';
          params.push(parseInt(bedrooms));
        }

        if (propertyType) {
          sql += ' AND LOWER(p.property_type) = ?';
          params.push(propertyType.toLowerCase());
        }

        sql += ' ORDER BY p.featured DESC, p.price ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [results] = await connection.execute(sql, params);

        res.json({
          data: results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            count: results.length
          },
          searchCriteria: {
            query: query || null,
            location: location || null,
            priceRange: { min: minPrice || null, max: maxPrice || null }
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Search properties error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  }

  /**
   * Get agent's properties
   */
  static async getAgentProperties(req, res) {
    try {
      const agentId = req.params.agentId || req.user.userId;

      // Role-based access: agents can only see their own properties, admins can see all
      if (req.user.role !== 'admin' && parseInt(agentId) !== req.user.userId) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const connection = await getConnection();

      try {
        const [properties] = await connection.execute(
          `SELECT p.* FROM properties p
           WHERE p.agent_id = ? AND p.status != 'archived'
           ORDER BY p.created_at DESC`,
          [agentId]
        );

        res.json({
          data: properties,
          count: properties.length
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get agent properties error:', error);
      res.status(500).json({ error: 'Failed to retrieve agent properties' });
    }
  }

  /**
   * Get properties by category
   */
  static async getPropertiesByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const connection = await getConnection();

      try {
        const [properties] = await connection.execute(
          `SELECT p.*, c.category_name FROM properties p
           LEFT JOIN categories c ON p.category_id = c.category_id
           WHERE p.category_id = ? AND p.status = 'available'
           ORDER BY p.featured DESC LIMIT ? OFFSET ?`,
          [categoryId, parseInt(limit), offset]
        );

        const [countResult] = await connection.execute(
          'SELECT COUNT(*) as total FROM properties WHERE category_id = ? AND status = "available"',
          [categoryId]
        );

        res.json({
          data: properties,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get properties by category error:', error);
      res.status(500).json({ error: 'Failed to retrieve properties' });
    }
  }
}

export default PropertyControllerEnhanced;
