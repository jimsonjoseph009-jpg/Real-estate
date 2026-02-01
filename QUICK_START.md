# Real Estate Management System - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- Node.js (v14+) - [Download](https://nodejs.org/)
- MySQL (v5.7+) - [Download](https://www.mysql.com/downloads/)
- Git (optional)

### Step 1: Database Setup (2 minutes)

```bash
# Open MySQL
mysql -u root -p

# Run in MySQL
CREATE USER 'realestate_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON real_estate_system.* TO 'realestate_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
exit;

# Import database
mysql -u realestate_user -p real_estate_system < database/real_estate_db.sql
```

### Step 2: Backend Setup (1 minute)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start backend
npm start
```

✓ Backend running at `http://localhost:5000`

### Step 3: Frontend Setup (2 minutes)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Option A: Using Python
python -m http.server 3000

# Option B: Using Node http-server
npx http-server -p 3000

# Option C: Using VS Code Live Server
# Right-click index.html → Open with Live Server
```

✓ Frontend running at `http://localhost:3000`

---

## 🔐 Test Credentials

After importing the database, use these credentials:

**Admin Account:**
- Email: `admin@realestate.com`
- Password: `AdminPass123!` (update after login)

**Agent Account:**
- Email: `agent@realestate.com`
- Password: `AgentPass123!`

Or register a new account at the registration page.

---

## 📝 Sample Users & Properties

The database comes pre-populated with:
- 1 Admin user
- 1 Agent user
- 3 Sample properties (Apartment, House, Office)
- 6 Property categories
- 10 Amenities

**Login and explore the system immediately!**

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Quick Tests

**Get all properties:**
```bash
curl http://localhost:5000/api/properties
```

**Register user:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "TestPass123!",
    "national_id": "TEST123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

---

## 📚 Documentation Files

- **README.md** - Project overview and setup
- **docs/DATABASE_DESIGN.md** - Database schema and normalization
- **docs/SYSTEM_ARCHITECTURE.md** - System architecture and design
- **docs/API_DOCUMENTATION.md** - Complete API reference
- **docs/PROJECT_REPORT.md** - Comprehensive project report

---

## 🐛 Troubleshooting

### Issue: "Port already in use"
```bash
# Kill process on port 5000 (backend)
lsof -i :5000
kill -9 <PID>

# Kill process on port 3000 (frontend)
lsof -i :3000
kill -9 <PID>
```

### Issue: "Database connection error"
```bash
# Check MySQL is running
mysql -u root -p

# Verify realestate_user credentials in .env
# Check database was imported successfully
mysql -u realestate_user -p real_estate_system
show tables;
```

### Issue: "Module not found"
```bash
cd backend
rm -rf node_modules
npm install
npm start
```

### Issue: "CORS errors in browser"
- Ensure backend is running on http://localhost:5000
- Frontend should be on http://localhost:3000 or similar
- Check CORS_ORIGIN in backend/.env

---

## 🚢 AWS Deployment (Optional)

### Quick Deployment Steps

**1. Database (AWS RDS)**
```bash
# Create RDS MySQL instance
# Import schema: mysql -h <RDS-ENDPOINT> -u admin -p < database/real_estate_db.sql
```

**2. Backend (AWS EC2)**
```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <your-repo-url>
cd backend
npm install
npm start
```

**3. Frontend (AWS S3 + CloudFront)**
```bash
# Upload frontend files to S3
aws s3 sync frontend/ s3://your-bucket-name --delete

# Create CloudFront distribution pointing to S3
```

---

## 📊 Project Features

✅ **User Management**
- Registration with validation
- Secure login (JWT)
- Profile management
- Role-based access control

✅ **Property Management**
- Create/Read/Update/Delete properties
- Multiple images per property
- Property amenities
- Featured listings

✅ **Search & Discovery**
- Advanced filtering (price, location, bedrooms)
- Full-text search
- Pagination
- Property details view

✅ **Inquiries & Reviews**
- Property inquiry system
- Viewing requests
- User reviews and ratings
- Agent contact information

✅ **Security**
- Bcryptjs password hashing
- JWT authentication
- Input sanitization
- SQL injection prevention
- Rate limiting

---

## 📂 Project Structure

```
real estate management system/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── pages/
│   ├── css/
│   ├── js/
│   └── assets/
├── database/
│   └── real_estate_db.sql
├── docs/
│   ├── DATABASE_DESIGN.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   └── PROJECT_REPORT.md
└── README.md
```

---

## 🎯 Next Steps

1. **Start Backend:** `npm start` (from backend folder)
2. **Start Frontend:** `python -m http.server 3000` (from frontend folder)
3. **Visit:** `http://localhost:3000`
4. **Login:** Use admin credentials or register new account
5. **Explore:** Browse properties, submit inquiries, create listings
6. **Read Docs:** Check documentation for detailed information

---

## 🔗 GitHub Setup

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: Real Estate Management System"

# Add remote and push
git remote add origin https://github.com/username/real-estate-system.git
git branch -M main
git push -u origin main

# Grant access to kevnps@gmail.com
# Go to Settings → Collaborators → Add kevnps@gmail.com
```

---

## 📞 Support

**Questions or Issues?**
1. Check the relevant documentation file
2. Review error messages in console
3. Check backend logs for API errors
4. Verify database connection
5. Ensure all prerequisites are installed

---

## ✨ Key Highlights

- **8 Normalized Database Tables** (3NF)
- **RESTful API** with 15+ endpoints
- **Vanilla JavaScript** (no frameworks)
- **Responsive Design** (mobile, tablet, desktop)
- **Production-Ready** code
- **AWS Deployment Ready**
- **Comprehensive Documentation**
- **Security Best Practices**

---

**Status:** ✅ READY TO USE

Enjoy using the Real Estate Management System!
