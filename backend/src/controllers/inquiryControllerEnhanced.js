import { getConnection } from '../utils/db.js';
import InquiryValidator from '../validators/inquiryValidator.js';

export class InquiryControllerEnhanced {
  /**
   * CREATE - Create new inquiry
   */
  static async createInquiry(req, res) {
    try {
      const validation = InquiryValidator.validateCreateInquiry(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }

      const {
        property_id, inquirer_name, inquirer_email, inquirer_phone,
        inquiry_type, message, preferred_date, preferred_time
      } = req.body;

      const userId = req.user?.userId || null;
      const connection = await getConnection();

      try {
        // Verify property exists and is available
        const [properties] = await connection.execute(
          'SELECT property_id FROM properties WHERE property_id = ? AND status = "available"',
          [property_id]
        );

        if (properties.length === 0) {
          return res.status(404).json({ error: 'Property not found or not available' });
        }

        const [result] = await connection.execute(
          `INSERT INTO inquiries (
            property_id, user_id, inquirer_name, inquirer_email, inquirer_phone,
            inquiry_type, message, preferred_date, preferred_time, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            property_id, userId, inquirer_name, inquirer_email, inquirer_phone || null,
            inquiry_type, message || null, preferred_date || null, preferred_time || null, 'pending'
          ]
        );

        res.status(201).json({
          message: 'Inquiry created successfully',
          inquiryId: result.insertId,
          status: 'pending',
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Create inquiry error:', error);
      res.status(500).json({ error: 'Failed to create inquiry' });
    }
  }

  /**
   * READ - Get inquiry details
   */
  static async getInquiry(req, res) {
    try {
      const { inquiryId } = req.params;
      const connection = await getConnection();

      try {
        const [inquiries] = await connection.execute(
          `SELECT i.*, p.title as property_title FROM inquiries i
           LEFT JOIN properties p ON i.property_id = p.property_id
           WHERE i.inquiry_id = ?`,
          [inquiryId]
        );

        if (inquiries.length === 0) {
          return res.status(404).json({ error: 'Inquiry not found' });
        }

        const inquiry = inquiries[0];

        // Check if user has access to this inquiry (owner or property agent or admin)
        if (req.user.role !== 'admin') {
          if (inquiry.user_id !== req.user.userId) {
            // Check if user is the agent of the property
            const [property] = await connection.execute(
              'SELECT agent_id FROM properties WHERE property_id = ?',
              [inquiry.property_id]
            );

            if (property.length === 0 || property[0].agent_id !== req.user.userId) {
              return res.status(403).json({ error: 'Permission denied' });
            }
          }
        }

        res.json({
          data: inquiry,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get inquiry error:', error);
      res.status(500).json({ error: 'Failed to retrieve inquiry' });
    }
  }

  /**
   * READ - Get inquiries for property (agent/admin only)
   */
  static async getPropertyInquiries(req, res) {
    try {
      const { propertyId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const connection = await getConnection();

      try {
        // Check property ownership
        const [properties] = await connection.execute(
          'SELECT agent_id FROM properties WHERE property_id = ?',
          [propertyId]
        );

        if (properties.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }

        // Role-based access control
        if (req.user.role !== 'admin' && properties[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied' });
        }

        let query = 'SELECT * FROM inquiries WHERE property_id = ?';
        const params = [propertyId];

        if (status) {
          query += ' AND status = ?';
          params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [inquiries] = await connection.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM inquiries WHERE property_id = ?';
        const countParams = [propertyId];

        if (status) {
          countQuery += ' AND status = ?';
          countParams.push(status);
        }

        const [countResult] = await connection.execute(countQuery, countParams);

        res.json({
          data: inquiries,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(countResult[0].total / limit)
          },
          filters: {
            status: status || null
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get property inquiries error:', error);
      res.status(500).json({ error: 'Failed to retrieve inquiries' });
    }
  }

  /**
   * READ - Get user's inquiries
   */
  static async getUserInquiries(req, res) {
    try {
      const userId = req.user.userId;
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const connection = await getConnection();

      try {
        let query = `SELECT i.*, p.title as property_title, p.price FROM inquiries i
                     LEFT JOIN properties p ON i.property_id = p.property_id
                     WHERE i.user_id = ?`;
        const params = [userId];

        if (status) {
          query += ' AND i.status = ?';
          params.push(status);
        }

        query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [inquiries] = await connection.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM inquiries WHERE user_id = ?';
        const countParams = [userId];

        if (status) {
          countQuery += ' AND status = ?';
          countParams.push(status);
        }

        const [countResult] = await connection.execute(countQuery, countParams);

        res.json({
          data: inquiries,
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
      console.error('Get user inquiries error:', error);
      res.status(500).json({ error: 'Failed to retrieve inquiries' });
    }
  }

  /**
   * UPDATE - Update inquiry status (agent/admin only)
   */
  static async updateInquiryStatus(req, res) {
    try {
      const { inquiryId } = req.params;
      const validation = InquiryValidator.validateUpdateStatus(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }

      const { status, response_notes } = req.body;
      const connection = await getConnection();

      try {
        // Get inquiry and check permissions
        const [inquiries] = await connection.execute(
          `SELECT i.*, p.agent_id FROM inquiries i
           JOIN properties p ON i.property_id = p.property_id
           WHERE i.inquiry_id = ?`,
          [inquiryId]
        );

        if (inquiries.length === 0) {
          return res.status(404).json({ error: 'Inquiry not found' });
        }

        // Role-based access control
        if (req.user.role !== 'admin' && inquiries[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied' });
        }

        await connection.execute(
          `UPDATE inquiries SET status = ?, response_notes = ?, responded_at = NOW(), updated_at = NOW()
           WHERE inquiry_id = ?`,
          [status, response_notes || null, inquiryId]
        );

        res.json({
          message: 'Inquiry status updated successfully',
          inquiryId,
          newStatus: status,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update inquiry status error:', error);
      res.status(500).json({ error: 'Failed to update inquiry' });
    }
  }

  /**
   * DELETE - Delete inquiry (agent/admin only)
   */
  static async deleteInquiry(req, res) {
    try {
      const { inquiryId } = req.params;
      const connection = await getConnection();

      try {
        // Get inquiry and check permissions
        const [inquiries] = await connection.execute(
          `SELECT i.*, p.agent_id FROM inquiries i
           JOIN properties p ON i.property_id = p.property_id
           WHERE i.inquiry_id = ?`,
          [inquiryId]
        );

        if (inquiries.length === 0) {
          return res.status(404).json({ error: 'Inquiry not found' });
        }

        // Role-based access control
        if (req.user.role !== 'admin' && inquiries[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied' });
        }

        // Soft delete
        await connection.execute(
          'UPDATE inquiries SET deleted_at = NOW() WHERE inquiry_id = ?',
          [inquiryId]
        );

        res.json({
          message: 'Inquiry deleted successfully',
          inquiryId,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete inquiry error:', error);
      res.status(500).json({ error: 'Failed to delete inquiry' });
    }
  }

  /**
   * ADMIN - Get inquiry statistics
   */
  static async getInquiryStats(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permission denied - admin only' });
      }

      const connection = await getConnection();

      try {
        // Total inquiries by status
        const [statusStats] = await connection.execute(`
          SELECT status, COUNT(*) as count FROM inquiries
          WHERE deleted_at IS NULL
          GROUP BY status
        `);

        // Total inquiries by inquiry type
        const [typeStats] = await connection.execute(`
          SELECT inquiry_type, COUNT(*) as count FROM inquiries
          WHERE deleted_at IS NULL
          GROUP BY inquiry_type
        `);

        // Recent inquiries
        const [recentInquiries] = await connection.execute(`
          SELECT i.inquiry_id, i.inquirer_name, i.inquiry_type, i.status, 
                 i.created_at, p.title as property_title
          FROM inquiries i
          LEFT JOIN properties p ON i.property_id = p.property_id
          WHERE i.deleted_at IS NULL
          ORDER BY i.created_at DESC LIMIT 10
        `);

        res.json({
          data: {
            statusDistribution: statusStats,
            typeDistribution: typeStats,
            recentInquiries
          },
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get inquiry stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve inquiry statistics' });
    }
  }
}

export default InquiryControllerEnhanced;
