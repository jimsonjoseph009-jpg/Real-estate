import jwt from 'jsonwebtoken';
import config from '../config/database.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function errorHandler(error, req, res, next) {
  console.error('Error:', error);

  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: 'Internal server error' });
}

export default { authenticateToken, authorizeRole, errorHandler };
