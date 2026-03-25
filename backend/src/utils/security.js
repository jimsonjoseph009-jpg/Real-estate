import bcrypt from 'bcryptjs';
import config from '../config/database.js';

export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, config.bcrypt.saltRounds);
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message);
  }
}

export async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error verifying password: ' + error.message);
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/[";']/g, '') // Remove quotes and semicolons
    .substring(0, 1000); // Limit length
}

export function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function generateToken(userId, role) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

export function parseJWT(token) {
  const jwt = require('jsonwebtoken');
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
}

export default {
  hashPassword,
  verifyPassword,
  sanitizeInput,
  sanitizeObject,
  validateEmail,
  validatePhone,
  validatePassword,
  generateToken,
  parseJWT
};
