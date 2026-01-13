# 🚀 Quick Reference Card

## 📁 Project Structure

```
employee-management-portal/
├── server/                          ← NEW! Backend API
│   ├── config/                      ← Database configuration
│   ├── controllers/                 ← Business logic
│   ├── middleware/                  ← Auth & error handling
│   ├── models/                      ← Database schemas
│   ├── routes/                      ← API endpoints
│   ├── .env                         ← Environment variables
│   ├── server.js                    ← Main entry point
│   ├── seed.js                      ← Database seeder
│   └── README.md                    ← Backend docs
├── src/                             ← Your React frontend
├── BACKEND_SETUP_COMPLETE.md        ← Setup guide
├── BACKEND_INTEGRATION_GUIDE.md     ← Integration guide
└── ARCHITECTURE.md                  ← Architecture docs
```

---

## ⚡ Quick Commands

### Start Backend Server
```bash
cd server
npm run dev
```
Server: http://localhost:5000

### Seed Database
```bash
cd server
npm run seed
```

### Start Frontend
```bash
npm run dev
```
Frontend: http://localhost:5173

---

## 🔐 Default Login

**Email:** `admin@company.com`  
**Password:** `admin123`  
**Role:** Admin (full access)

---

## 📡 API Endpoints Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
POST   /auth/login              Login
POST   /auth/register           Register
GET    /auth/me                 Get current user
PUT    /auth/update-password    Update password
```

### Employees
```
GET    /employees               Get all
GET    /employees/:id           Get one
POST   /employees               Create
PUT    /employees/:id           Update
DELETE /employees/:id           Delete
GET    /employees/stats/overview Statistics
```

### Projects
```
GET    /projects                Get all
GET    /projects/:id            Get one
POST   /projects                Create
PUT    /projects/:id            Update
DELETE /projects/:id            Delete
GET    /projects/stats/overview Statistics
```

### Assets
```
GET    /assets                  Get all
GET    /assets/:id              Get one
POST   /assets                  Create
PUT    /assets/:id              Update
DELETE /assets/:id              Delete
GET    /assets/stats/overview   Statistics
```

### Subscriptions
```
GET    /subscriptions           Get all
GET    /subscriptions/:id       Get one
POST   /subscriptions           Create
PUT    /subscriptions/:id       Update
DELETE /subscriptions/:id       Delete
GET    /subscriptions/stats/overview Statistics
```

---

## 🧪 Test API with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### Get Employees (with token)
```bash
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Employee
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "123456",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "Developer",
    "department": "Engineering",
    "salary": 80000,
    "joinDate": "2026-01-01",
    "status": "Active"
  }'
```

---

## 🔧 Environment Variables

Located in `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/employee-management-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

---

## 🗄️ MongoDB Quick Commands

### Start MongoDB
```bash
# Windows
mongod

# Mac
brew services start mongodb-community
```

### MongoDB Compass
- Download: https://www.mongodb.com/products/compass
- Connect to: `mongodb://localhost:27017`
- View collections: users, employees, projects, assets, subscriptions

---

## 📦 NPM Scripts

### Backend (in `server/` directory)
```bash
npm start       # Production server
npm run dev     # Development server (auto-reload)
npm run seed    # Seed database
```

### Frontend (in root directory)
```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Preview production build
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection error | Start MongoDB: `mongod` |
| Port 5000 in use | Change PORT in `.env` |
| CORS error | Check CLIENT_URL in `.env` |
| 401 Unauthorized | Login again to get new token |
| npm install fails | Delete `node_modules` and `package-lock.json`, run `npm install` |

---

## 📚 Documentation Files

1. **BACKEND_SETUP_COMPLETE.md** - Complete setup guide
2. **BACKEND_INTEGRATION_GUIDE.md** - Frontend integration
3. **ARCHITECTURE.md** - System architecture
4. **server/README.md** - Backend API docs

---

## 🎯 Next Steps Checklist

- [ ] Install MongoDB
- [ ] Start MongoDB service
- [ ] Start backend server (`cd server && npm run dev`)
- [ ] Seed database (`cd server && npm run seed`)
- [ ] Test login with cURL or Postman
- [ ] Read BACKEND_INTEGRATION_GUIDE.md
- [ ] Install Axios in frontend
- [ ] Create API service layer
- [ ] Add authentication context
- [ ] Create login page
- [ ] Update components to use API
- [ ] Test full integration

---

## 💡 Pro Tips

1. **Use MongoDB Compass** for visual database management
2. **Use Postman or Thunder Client** for API testing
3. **Check server logs** for debugging
4. **Keep both servers running** during development
5. **Use environment variables** for sensitive data
6. **Never commit .env file** to Git

---

## 🆘 Need Help?

1. Check the error message in terminal
2. Review the relevant documentation file
3. Check MongoDB is running
4. Verify environment variables
5. Test API endpoints with cURL/Postman

---

**Quick Start:**
```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start Backend
cd server
npm run seed
npm run dev

# Terminal 3 - Start Frontend
npm run dev
```

**Login at:** http://localhost:5173/login  
**Email:** admin@company.com  
**Password:** admin123

---

**Happy Coding! 🎉**
