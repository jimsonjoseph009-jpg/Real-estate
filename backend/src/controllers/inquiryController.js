import { getConnection } from '../utils/db.js';

export class InquiryController {
  // Create inquiry
  static async createInquiry(req, res) {
    try {
      const {
        property_id,
        inquirer_name,
        inquirer_email,
        inquirer_phone,
        inquiry_type,
        message,
        preferred_date,
        preferred_time
      } = req.body;

      if (!property_id || !inquirer_name || !inquirer_email || !inquiry_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const userId = req.user?.userId || null;
      const connection = await getConnection();

      try {
        const [result] = await connection.execute(
          `INSERT INTO inquiries (
            property_id, user_id, inquirer_name, inquirer_email, inquirer_phone,
            inquiry_type, message, preferred_date, preferred_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [property_id, userId, inquirer_name, inquirer_email, inquirer_phone || null, inquiry_type, message || null, preferred_date || null, preferred_time || null]
        );

        res.status(201).json({
          message: 'Inquiry created successfully',
          inquiryId: result.insertId
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Create inquiry error:', error);
      res.status(500).json({ error: 'Failed to create inquiry' });
    }
  }

  // Get inquiries for property (agent only)
  static async getPropertyInquiries(req, res) {
    try {
      const { propertyId } = req.params;
      const connection = await getConnection();

      try {
        // Check if user is agent of this property
        const [properties] = await connection.execute('SELECT agent_id FROM properties WHERE property_id = ?', [propertyId]);

        if (properties.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }

        if (req.user.role !== 'admin' && properties[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied' });
        }

        const [inquiries] = await connection.execute(
          `SELECT * FROM inquiries WHERE property_id = ? ORDER BY created_at DESC`,
          [propertyId]
        );

        res.json(inquiries);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get property inquiries error:', error);
      res.status(500).json({ error: 'Failed to retrieve inquiries' });
    }
  }

  // Update inquiry status
  static async updateInquiryStatus(req, res) {
    try {
      const { inquiryId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const connection = await getConnection();

      try {
        // Get inquiry and check permissions
        const [inquiries] = await connection.execute('SELECT i.*, p.agent_id FROM inquiries i JOIN properties p ON i.property_id = p.property_id WHERE i.inquiry_id = ?', [inquiryId]);

        if (inquiries.length === 0) {
          return res.status(404).json({ error: 'Inquiry not found' });
        }

        if (req.user.role !== 'admin' && inquiries[0].agent_id !== req.user.userId) {
          return res.status(403).json({ error: 'Permission denied' });
        }

        const [result] = await connection.execute(
          'UPDATE inquiries SET status = ? WHERE inquiry_id = ?',
          [status, inquiryId]
        );

        res.json({ message: 'Inquiry status updated' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update inquiry error:', error);
      res.status(500).json({ error: 'Failed to update inquiry' });
    }
  }

  // Get user inquiries
  static async getUserInquiries(req, res) {
    try {
      const userId = req.user.userId;
      const connection = await getConnection();

      try {
        const [inquiries] = await connection.execute(
          `SELECT i.*, p.title as property_title FROM inquiries i
           LEFT JOIN properties p ON i.property_id = p.property_id
           WHERE i.user_id = ? ORDER BY i.created_at DESC`,
          [userId]
        );

        res.json(inquiries);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get user inquiries error:', error);
      res.status(500).json({ error: 'Failed to retrieve inquiries' });
    }
  }
}

export default InquiryController;
