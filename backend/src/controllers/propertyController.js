import { getConnection } from '../utils/db.js';
import { sanitizeObject } from '../utils/security.js';

export class PropertyController {
  // Create property (admin/agent only)
  static async createProperty(req, res) {
    try {
      const {
        title,
        description,
        category_id,
        property_type,
        location,
        city,
        state,
        postal_code,
        latitude,
        longitude,
        price,
        currency,
        bedrooms,
        bathrooms,
        total_area,
        area_unit,
        year_built,
        parking_spaces,
        is_furnished
      } = req.body;

      // Validate required fields
      if (!title || !category_id || !property_type || !location || !city || !state || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const agentId = req.user.userId;
      const connection = await getConnection();

      try {
        const [result] = await connection.execute(
          `INSERT INTO properties (
            title, description, category_id, agent_id, property_type, location, city, state, 
            postal_code, latitude, longitude, price, currency, bedrooms, bathrooms, total_area, 
            area_unit, year_built, parking_spaces, is_furnished
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title, description, category_id, agentId, property_type, location, city, state,
            postal_code, latitude, longitude, price, currency || 'USD', bedrooms, bathrooms, 
            total_area, area_unit || 'sqft', year_built, parking_spaces || 0, is_furnished || false
          ]
        );

        res.status(201).json({
          message: 'Property created successfully',
          propertyId: result.insertId
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({ error: 'Failed to create property' });
    }
  }

  // Get all properties
  static async getAllProperties(req, res) {
    try {
      const { city, minPrice, maxPrice, bedrooms, categoryId, page = 1, limit = 10 } = req.query;
      
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
          query += ' AND p.bedrooms = ?';
          params.push(parseInt(bedrooms));
        }
        if (categoryId) {
          query += ' AND p.category_id = ?';
          params.push(parseInt(categoryId));
        }

        query += ' ORDER BY p.featured DESC, p.views_count DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [properties] = await connection.execute(query, params);

        // Get total count
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
          countQuery += ' AND bedrooms = ?';
          countParams.push(parseInt(bedrooms));
        }
        if (categoryId) {
          countQuery += ' AND category_id = ?';
          countParams.push(parseInt(categoryId));
        }

        const [countResult] = await connection.execute(countQuery, countParams);

        res.json({
          properties,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(countResult[0].total / limit)
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

  // Get single property
  static async getProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const connection = await getConnection();

      try {
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
          'SELECT * FROM property_images WHERE property_id = ? ORDER BY display_order',
          [propertyId]
        );

        // Get amenities
        const [amenities] = await connection.execute(
          `SELECT a.* FROM amenities a
           JOIN property_amenities pa ON a.amenity_id = pa.amenity_id
           WHERE pa.property_id = ?`,
          [propertyId]
        );

        // Get reviews
        const [reviews] = await connection.execute(
          `SELECT r.*, u.full_name as reviewer_name FROM reviews r
           LEFT JOIN users u ON r.reviewer_user_id = u.user_id
           WHERE r.property_id = ? ORDER BY r.created_at DESC`,
          [propertyId]
        );

        const property = properties[0];
        property.images = images;
        property.amenities = amenities;
        property.reviews = reviews;

        res.json(property);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({ error: 'Failed to retrieve property' });
    }
  }

  // Update property
  static async updateProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const updates = sanitizeObject(req.body);

      // Don't allow certain fields
      delete updates.property_id;
      delete updates.agent_id;
      delete updates.created_at;

      const connection = await getConnection();

      try {
        // Check if property belongs to user or user is admin
        const [properties] = await connection.execute('SELECT agent_id FROM properties WHERE property_id = ?', [propertyId]);

        if (properties.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }

        if (req.user.role !== 'admin' && properties[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied' });
        }

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(propertyId);

        const [result] = await connection.execute(
          `UPDATE properties SET ${fields} WHERE property_id = ?`,
          values
        );

        res.json({ message: 'Property updated successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({ error: 'Failed to update property' });
    }
  }

  // Delete property
  static async deleteProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const connection = await getConnection();

      try {
        // Check ownership
        const [properties] = await connection.execute('SELECT agent_id FROM properties WHERE property_id = ?', [propertyId]);

        if (properties.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }

        if (req.user.role !== 'admin' && properties[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied' });
        }

        await connection.execute('DELETE FROM properties WHERE property_id = ?', [propertyId]);

        res.json({ message: 'Property deleted successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({ error: 'Failed to delete property' });
    }
  }

  // Search properties
  static async searchProperties(req, res) {
    try {
      const { query, location } = req.query;
      const connection = await getConnection();

      try {
        let sql = `
          SELECT p.property_id, p.title, p.description, p.price, p.city, 
                 p.bedrooms, p.bathrooms, c.category_name
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

        const [results] = await connection.execute(sql, params);
        res.json(results);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Search properties error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  }
}

export default PropertyController;
