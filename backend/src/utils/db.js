import mysql from 'mysql2/promise';
import config from '../config/database.js';

let pool = null;

export async function initializeDatabase() {
  try {
    pool = mysql.createPool(config.database);
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✓ Database connection successful');
    return pool;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase first.');
  }
  return pool;
}

export async function getConnection() {
  const pool = getPool();
  return pool.getConnection();
}

export async function executeQuery(query, values = []) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, values);
    return results;
  } finally {
    connection.release();
  }
}

export async function executeInsert(query, values = []) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, values);
    return results;
  } finally {
    connection.release();
  }
}

export default { initializeDatabase, getPool, getConnection, executeQuery, executeInsert };
