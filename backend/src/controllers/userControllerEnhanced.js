import { getConnection } from '../utils/db.js';
import { hashPassword, verifyPassword, sanitizeObject } from '../utils/security.js';
import UserValidator from '../validators/userValidator.js';

export class UserControllerEnhanced {
  /**
   * CREATE - Register new user
   */
  static async register(req, res) {
    try {
      const validation = UserValidator.validateRegister(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }

      const { full_name, email, phone, password, role = 'buyer', national_id } = req.body;
      const connection = await getConnection();

      try {
        // Check for duplicates
        const [emailExists] = await connection.execute('SELECT user_id FROM users WHERE email = ?', [email]);
        if (emailExists.length > 0) {
          return res.status(409).json({ error: 'Email already registered' });
        }

        const [phoneExists] = await connection.execute('SELECT user_id FROM users WHERE phone = ?', [phone]);
        if (phoneExists.length > 0) {
          return res.status(409).json({ error: 'Phone number already registered' });
        }

        const [idExists] = await connection.execute('SELECT user_id FROM users WHERE national_id = ?', [national_id]);
        if (idExists.length > 0) {
          return res.status(409).json({ error: 'National ID already registered' });
        }

        const hashedPassword = await hashPassword(password);
        const [result] = await connection.execute(
          `INSERT INTO users (full_name, email, phone, password_hash, role, national_id, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [full_name, email, phone, hashedPassword, role, national_id, true]
        );

        res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId,
          email,
          role,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  /**
   * READ - Get user profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const connection = await getConnection();

      try {
        const [users] = await connection.execute(
          'SELECT user_id, full_name, email, phone, role, bio, company_name, created_at FROM users WHERE user_id = ? AND is_active = TRUE',
          [userId]
        );

        if (users.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({
          data: users[0],
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  }

  /**
   * UPDATE - Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const validation = UserValidator.validateUpdateProfile(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }

      const userId = req.user.userId;
      const updates = sanitizeObject(req.body);

      // Prevent restricted fields
      const restrictedFields = ['user_id', 'password_hash', 'role', 'created_at', 'national_id'];
      restrictedFields.forEach(field => delete updates[field]);

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const connection = await getConnection();

      try {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(userId);

        const [result] = await connection.execute(
          `UPDATE users SET ${fields}, updated_at = NOW() WHERE user_id = ?`,
          values
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({
          message: 'Profile updated successfully',
          userId,
          updatedFields: Object.keys(updates),
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  /**
   * UPDATE - Change password
   */
  static async changePassword(req, res) {
    try {
      const validation = UserValidator.validateChangePassword(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;
      const connection = await getConnection();

      try {
        const [users] = await connection.execute('SELECT password_hash FROM users WHERE user_id = ?', [userId]);

        if (users.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await verifyPassword(currentPassword, users[0].password_hash);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await hashPassword(newPassword);
        await connection.execute(
          'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
          [hashedPassword, userId]
        );

        res.json({
          message: 'Password changed successfully',
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  /**
   * DELETE - Delete account (soft delete)
   */
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.userId;
      const connection = await getConnection();

      try {
        await connection.execute(
          'UPDATE users SET is_active = FALSE, deleted_at = NOW() WHERE user_id = ?',
          [userId]
        );

        res.json({
          message: 'Account deleted successfully',
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }

  /**
   * READ - Get all agents (public)
   */
  static async getAgents(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const connection = await getConnection();

      try {
        const [agents] = await connection.execute(
          `SELECT user_id, full_name, email, phone, company_name, bio FROM users
           WHERE role = 'agent' AND is_active = TRUE
           LIMIT ? OFFSET ?`,
          [parseInt(limit), offset]
        );

        const [countResult] = await connection.execute(
          'SELECT COUNT(*) as total FROM users WHERE role = "agent" AND is_active = TRUE'
        );

        res.json({
          data: agents,
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
      console.error('Get agents error:', error);
      res.status(500).json({ error: 'Failed to retrieve agents' });
    }
  }

  /**
   * READ - Get single agent details
   */
  static async getAgentDetails(req, res) {
    try {
      const { agentId } = req.params;
      const connection = await getConnection();

      try {
        const [agents] = await connection.execute(
          `SELECT user_id, full_name, email, phone, company_name, bio, created_at FROM users
           WHERE user_id = ? AND role = 'agent' AND is_active = TRUE`,
          [agentId]
        );

        if (agents.length === 0) {
          return res.status(404).json({ error: 'Agent not found' });
        }

        // Get agent's properties
        const [properties] = await connection.execute(
          'SELECT COUNT(*) as total_properties FROM properties WHERE agent_id = ? AND status = "available"',
          [agentId]
        );

        const agent = agents[0];
        agent.totalProperties = properties[0].total_properties;

        res.json({
          data: agent,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get agent details error:', error);
      res.status(500).json({ error: 'Failed to retrieve agent details' });
    }
  }

  /**
   * ADMIN - Get all users with role filter
   */
  static async getAllUsers(req, res) {
    try {
      // Role-based access: admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permission denied - admin only' });
      }

      const { role, status = 'active', page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      const connection = await getConnection();

      try {
        let query = 'SELECT user_id, full_name, email, phone, role, is_active, created_at FROM users WHERE 1=1';
        const params = [];

        if (role && ['buyer', 'agent', 'admin'].includes(role)) {
          query += ' AND role = ?';
          params.push(role);
        }

        if (status === 'active') {
          query += ' AND is_active = TRUE';
        } else if (status === 'inactive') {
          query += ' AND is_active = FALSE';
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [users] = await connection.execute(query, params);

        res.json({
          data: users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            count: users.length
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  }

  /**
   * ADMIN - Update user role
   */
  static async updateUserRole(req, res) {
    try {
      // Role-based access: admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permission denied - admin only' });
      }

      const { userId } = req.params;
      const { newRole } = req.body;

      if (!['buyer', 'agent', 'admin'].includes(newRole)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const connection = await getConnection();

      try {
        const [result] = await connection.execute(
          'UPDATE users SET role = ?, updated_at = NOW() WHERE user_id = ?',
          [newRole, userId]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({
          message: 'User role updated successfully',
          userId,
          newRole,
          timestamp: new Date().toISOString()
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
}

export default UserControllerEnhanced;
