import { getConnection } from '../utils/db.js';
import { hashPassword, verifyPassword, sanitizeObject, validateEmail, validatePhone, generateToken, parseJWT } from '../utils/security.js';

export class UserController {
  // Register new user
  static async register(req, res) {
    try {
      const { full_name, email, phone, password, role, national_id } = req.body;

      // Validate input
      if (!full_name || !email || !phone || !password || !national_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (!validatePhone(phone)) {
        return res.status(400).json({ error: 'Invalid phone format' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const connection = await getConnection();

      try {
        // Check if email exists
        const [emailExists] = await connection.execute('SELECT user_id FROM users WHERE email = ?', [email]);
        if (emailExists.length > 0) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        // Check if phone exists
        const [phoneExists] = await connection.execute('SELECT user_id FROM users WHERE phone = ?', [phone]);
        if (phoneExists.length > 0) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }

        // Check if national ID exists
        const [idExists] = await connection.execute('SELECT user_id FROM users WHERE national_id = ?', [national_id]);
        if (idExists.length > 0) {
          return res.status(400).json({ error: 'National ID already registered' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert user
        const [result] = await connection.execute(
          'INSERT INTO users (full_name, email, phone, password_hash, role, national_id) VALUES (?, ?, ?, ?, ?, ?)',
          [full_name, email, phone, hashedPassword, role || 'buyer', national_id]
        );

        res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const connection = await getConnection();

      try {
        const [users] = await connection.execute('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);

        if (users.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const passwordMatch = await verifyPassword(password, user.password_hash);

        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.user_id, user.role);

        res.json({
          message: 'Login successful',
          token,
          user: {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email,
            role: user.role
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const connection = await getConnection();

      try {
        const [users] = await connection.execute('SELECT * FROM users WHERE user_id = ?', [userId]);

        if (users.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        delete user.password_hash;

        res.json(user);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updates = sanitizeObject(req.body);

      // Don't allow certain fields to be updated
      delete updates.user_id;
      delete updates.password_hash;
      delete updates.role;
      delete updates.created_at;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const connection = await getConnection();

      try {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(userId);

        const [result] = await connection.execute(
          `UPDATE users SET ${fields} WHERE user_id = ?`,
          values
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Get all agents
  static async getAgents(req, res) {
    try {
      const connection = await getConnection();

      try {
        const [agents] = await connection.execute(
          'SELECT user_id, full_name, email, phone, company_name, bio FROM users WHERE role = ? AND is_active = TRUE',
          ['agent']
        );

        res.json(agents);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get agents error:', error);
      res.status(500).json({ error: 'Failed to retrieve agents' });
    }
  }
}

export default UserController;
