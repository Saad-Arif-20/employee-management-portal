# 🚀 Complete Setup Guide - Step by Step

## Option 1: MongoDB Atlas (Cloud - RECOMMENDED - No Installation!)

### Step 1: Create MongoDB Atlas Account (5 minutes)

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with Google/Email
3. **Create a FREE cluster:**
   - Choose **M0 (Free tier)**
   - Select a cloud provider (AWS recommended)
   - Choose a region close to you
   - Click **Create Cluster**

### Step 2: Setup Database Access

1. In Atlas dashboard, click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Create a user:
   - Username: `admin`
   - Password: `admin123` (or generate one)
   - User Privileges: **Atlas admin**
4. Click **Add User**

### Step 3: Setup Network Access

1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
4. Click **Confirm**

### Step 4: Get Connection String

1. Click **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

### Step 5: Update Your .env File

Open `server/.env` and update:

```env
MONGODB_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/employee-management-portal?retryWrites=true&w=majority
```

**That's it! MongoDB is ready!** ✅

---

## Option 2: Local MongoDB (If you prefer local installation)

### For Windows:

The MongoDB installation is downloading. Once complete:

1. **After installation completes**, MongoDB will be installed
2. **Start MongoDB as a service:**
   ```powershell
   net start MongoDB
   ```
3. **Verify it's running:**
   ```powershell
   mongod --version
   ```

Your `.env` is already configured for local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/employee-management-portal
```

---

## 🎯 Next Steps (After MongoDB is Ready)

### Step 1: Seed the Database

Open a **NEW terminal** in VS Code:

```bash
cd server
npm run seed
```

**Expected output:**
```
✅ MongoDB Connected
🗑️  Cleared existing data
👤 Created admin user (email: admin@company.com, password: admin123)
✅ Created 5 employees
✅ Created 3 projects
✅ Created 3 assets
✅ Created 2 subscriptions

🎉 Database seeded successfully!
```

### Step 2: Start the Backend Server

In the same terminal:

```bash
npm run dev
```

**Expected output:**
```
🚀 Server running in development mode on port 5000
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
```

### Step 3: Test the Backend

Open **another NEW terminal**:

```bash
# Test health check
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@company.com\",\"password\":\"admin123\"}"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@company.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🎊 Phase 2: Frontend Integration

Once backend is working, let's integrate with your React app!

### Step 1: Install Axios

In your **main project directory** (not server):

```bash
npm install axios
```

### Step 2: Create API Configuration

I'll create these files for you:
- `src/config/api.js` - Axios configuration
- `src/services/api.service.js` - API service layer
- `src/contexts/AuthContext.jsx` - Authentication context
- `src/pages/Login.jsx` - Login page

### Step 3: Update Your App

I'll help you:
- Add authentication to your app
- Create protected routes
- Update DataContext to fetch from API
- Add login/logout functionality

---

## 📋 Quick Checklist

- [ ] MongoDB setup (Atlas or Local)
- [ ] Update `server/.env` with connection string
- [ ] Run `npm run seed` in server directory
- [ ] Run `npm run dev` in server directory
- [ ] Test API with curl/Postman
- [ ] Install Axios in frontend
- [ ] Create API service files
- [ ] Add authentication
- [ ] Test full integration

---

## 🆘 Troubleshooting

### MongoDB Atlas Connection Issues
- Check username/password in connection string
- Ensure IP is whitelisted (0.0.0.0/0 for development)
- Replace `<password>` with actual password (no brackets)

### Local MongoDB Issues
- Ensure MongoDB service is running: `net start MongoDB`
- Check if port 27017 is available
- Try restarting the service

### Backend Won't Start
- Check if MongoDB is accessible
- Verify `.env` file exists in server directory
- Check for port conflicts (change PORT in .env)

---

## 🎯 What to Do Right Now

**Choose your MongoDB option:**

**Option A (Recommended - Easier):** 
1. Sign up for MongoDB Atlas (link above)
2. Get connection string
3. Update `server/.env`
4. Run `npm run seed`
5. Run `npm run dev`

**Option B (Local):**
1. Wait for MongoDB installation to complete
2. Start MongoDB service
3. Run `npm run seed`
4. Run `npm run dev`

**Let me know which option you choose and I'll guide you through it!**
