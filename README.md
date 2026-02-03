# Real Estate Management System - Project Setup & Installation Guide

## Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** (v6 or higher)
- **Git** (for version control)

## Project Structure

```
Real Estate Management System/
├── backend/                  # Node.js/Express Backend
├── frontend/                 # Vanilla JavaScript Frontend
├── database/                 # Database schema and SQL
├── docs/                     # Documentation
└── README.md                 # Project overview
```

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

### 4. Configure Database
Edit `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=realestate_user
DB_PASSWORD=SecurePassword123!
DB_NAME=real_estate_system
JWT_SECRET=your-super-secret-key-change-in-production
```

### 5. Create MySQL Database

Open MySQL and run:
```sql
mysql> source ../database/real_estate_db.sql;
```

Or import via command line:
```bash
mysql -u realestate_user -p real_estate_system < ../database/real_estate_db.sql
```

### 6. Start Backend Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Frontend Setup

The frontend is a collection of static HTML, CSS, and JavaScript files. No installation required.

### 1. Serve Frontend Files

Option 1: Using Python's built-in server
```bash
cd frontend
python -m http.server 3000
```

Option 2: Using Node.js http-server
```bash
npm install -g http-server
cd frontend
http-server -p 3000
```

Option 3: Using VS Code Live Server extension
- Install Live Server extension in VS Code
- Right-click `index.html` and select "Open with Live Server"

The frontend will be available at `http://localhost:3000`

## Database Setup

### 1. Create Database User
```sql
CREATE USER 'realestate_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON real_estate_system.* TO 'realestate_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Import Database Schema
```bash
mysql -u realestate_user -p < database/real_estate_db.sql
```

### 3. Verify Installation
```sql
mysql -u realestate_user -p real_estate_system
mysql> SHOW TABLES;
```

You should see 8 tables:
- users
- categories
- amenities
- properties
- property_amenities
- property_images
- inquiries
- reviews

## Configuration Files

### Backend .env
```
PORT=5000
HOST=localhost
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=realestate_user
DB_PASSWORD=SecurePassword123!
DB_NAME=real_estate_system

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000

# API URLs
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## Running the Application

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend
```bash
cd frontend
python -m http.server 3000
# or
http-server -p 3000
# or use VS Code Live Server
```

### Access Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- API Health Check: `http://localhost:5000/health`

## Testing the API

### Using cURL

Register a new user:
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "jimmy@example.com",
    "phone": "+1234567890",
    "password": "Password123!",
    "national_id": "ID123456"
  }'
```

Login:
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

Get all properties:
```bash
curl http://localhost:5000/api/properties
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Database Connection Error
- Verify MySQL is running
- Check credentials in .env file
- Ensure database user has proper permissions

### CORS Errors
- Ensure CORS_ORIGIN in .env matches frontend URL
- Check that backend is running on correct port

### Module Not Found Errors
```bash
cd backend
rm -rf node_modules
npm install
```

## Development

### Adding New Features
1. Create controller in `src/controllers/`
2. Add routes in `src/routes/`
3. Update database schema if needed
4. Create frontend pages/forms

### Testing
- Use cURL or Postman for API testing
- Test in browser DevTools for frontend
- Check console for JavaScript errors

## Production Deployment

### Backend (AWS EC2 or similar)
1. Install Node.js and MySQL
2. Clone repository
3. Create `.env` with production values
4. Install dependencies: `npm install`
5. Start with PM2: `pm2 start src/app.js --name "realestate-api"`
6. Configure nginx as reverse proxy

### Frontend (AWS S3)
1. Upload all frontend files to S3
2. Create CloudFront distribution
3. Configure S3 bucket for static website hosting

### Database (AWS RDS)
1. Create RDS MySQL instance
2. Import database schema
3. Update backend .env with RDS endpoint

## Support

For issues or questions:
1. Check documentation in `docs/` folder
2. Review API endpoints in `docs/SYSTEM_ARCHITECTURE.md`
3. Check database schema in `docs/DATABASE_DESIGN.md`

