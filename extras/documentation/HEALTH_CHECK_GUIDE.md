# Backend & Database Health Check Guide

## 🎯 Quick Health Check Commands

### Option 1: Run Automated Test Scripts (Recommended)

We've created two comprehensive test scripts for you:

#### 1. **Database Connection Test**
Tests MongoDB connection, collections, and data integrity.

```bash
cd server
node test-connection.js
```

**What it checks:**
- ✅ MongoDB connection status
- ✅ Database collections (users, employees, projects, assets, subscriptions)
- ✅ Document counts in each collection
- ✅ Sample data retrieval
- ✅ Admin user verification

#### 2. **API Endpoints Test**
Tests all backend API endpoints and authentication.

```bash
cd server
node test-api.js
```

**What it checks:**
- ✅ Health endpoint (`/api/health`)
- ✅ Login endpoint (`/api/auth/login`)
- ✅ Protected routes (requires authentication)
- ✅ Get employees, projects, assets, subscriptions
- ✅ Authorization security (blocks unauthorized access)

---

## 🔍 Manual Health Checks

### 1. Check MongoDB is Running

**Windows PowerShell:**
```powershell
Get-Process mongod -ErrorAction SilentlyContinue
```

**Expected Output:**
```
   Id ProcessName
   -- -----------
15004 mongod
```

If no output, MongoDB is not running. Start it with:
```powershell
Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath `"$env:USERPROFILE\mongodb-data`"" -WindowStyle Hidden
```

---

### 2. Test Backend Server Health

**Using PowerShell:**
```powershell
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-06T10:42:58.833Z"
}
```

**Status Code:** 200 OK

---

### 3. Test Login Endpoint

**Using PowerShell:**
```powershell
$body = '{"email":"admin@company.com","password":"admin123"}'
$headers = @{'Content-Type'='application/json'}
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -Headers $headers -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@company.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Test Protected Endpoint (Requires Token)

First, get your token from the login response above, then:

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{'Authorization'="Bearer $token"}
Invoke-RestMethod -Uri 'http://localhost:5000/api/employees' -Method GET -Headers $headers
```

**Expected Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "name": "Sarah Jenkins",
      "email": "sarah.j@company.com",
      "department": "Engineering",
      ...
    },
    ...
  ]
}
```

---

### 5. Test Unauthorized Access (Should Fail)

```powershell
curl http://localhost:5000/api/employees
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Status Code:** 401 Unauthorized

This confirms your security is working correctly! ✅

---

## 📊 Understanding Test Results

### ✅ All Systems Working
If you see:
- MongoDB process running
- Health endpoint returns 200 OK
- Login successful with token
- Protected routes accessible with token
- Unauthorized access blocked

**Your backend and database are working perfectly!**

---

### ❌ Common Issues & Solutions

#### Issue 1: MongoDB Not Running
**Symptom:** `Cannot connect to MongoDB` or no mongod process

**Solution:**
```powershell
Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath `"$env:USERPROFILE\mongodb-data`"" -WindowStyle Hidden
```

---

#### Issue 2: Backend Server Not Running
**Symptom:** `Connection refused` on port 5000

**Solution:**
```bash
cd server
npm run dev
```

---

#### Issue 3: Login Fails - User Not Found
**Symptom:** `Email not found` or `Incorrect password`

**Solution:** Seed the database
```bash
cd server
npm run seed
```

This creates the default admin user:
- Email: `admin@company.com`
- Password: `admin123`

---

#### Issue 4: Empty Database
**Symptom:** `Total employees: 0` or empty collections

**Solution:** Run the seed script
```bash
cd server
npm run seed
```

This populates:
- 1 admin user
- 12 employees
- 3 projects
- 12 assets
- 6 subscriptions

---

## 🔐 Security Verification Checklist

- [ ] Unauthorized requests are blocked (401 status)
- [ ] JWT tokens are required for protected routes
- [ ] Passwords are hashed in database (never plain text)
- [ ] CORS is configured correctly
- [ ] Health endpoint is accessible without auth
- [ ] Login endpoint validates credentials

---

## 📝 API Endpoints Reference

### Public Endpoints (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

### Protected Endpoints (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-password` | Update password |
| GET | `/api/employees` | Get all employees |
| GET | `/api/projects` | Get all projects |
| GET | `/api/assets` | Get all assets |
| GET | `/api/subscriptions` | Get all subscriptions |

---

## 🎯 Quick Troubleshooting Commands

**Check if backend is running:**
```powershell
Test-NetConnection -ComputerName localhost -Port 5000
```

**Check if MongoDB is running:**
```powershell
Test-NetConnection -ComputerName localhost -Port 27017
```

**View backend logs:**
Check the terminal where `npm run dev` is running

**Stop MongoDB:**
```powershell
Stop-Process -Name mongod
```

---

## 📈 Performance Indicators

### Good Performance
- Health check responds in < 100ms
- Login responds in < 500ms
- Data queries respond in < 1000ms
- No error messages in backend logs

### Needs Investigation
- Slow response times (> 2 seconds)
- Frequent connection errors
- Memory warnings
- Database timeout errors

---

## 🚀 Best Practices

1. **Always run tests after:**
   - Restarting your computer
   - Updating dependencies
   - Changing database schema
   - Modifying authentication logic

2. **Regular maintenance:**
   - Check MongoDB disk space
   - Review backend logs for errors
   - Update dependencies monthly
   - Backup database regularly

3. **Before deployment:**
   - Run all test scripts
   - Verify all endpoints work
   - Check security measures
   - Test with production-like data

---

## 📞 Need Help?

If tests fail, check:
1. Are MongoDB and backend both running?
2. Is the database seeded with data?
3. Are there any error messages in the terminal?
4. Is port 5000 or 27017 already in use?

Run the automated test scripts for detailed diagnostics:
```bash
node test-connection.js  # Database check
node test-api.js         # API check
```

---

**Last Updated:** 2026-01-06
**Version:** 1.0.0
