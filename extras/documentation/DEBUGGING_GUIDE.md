# 🔍 Debugging Guide - No Data Showing

## Issue
After logging in, no data is displayed for employees, projects, assets, or subscriptions.

## ✅ I Just Fixed
Updated `GlobalContext.jsx` to only fetch data when user is authenticated.

## 🧪 How to Test

### Step 1: Clear Browser Cache
1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Clear storage**
4. Click **Clear site data**
5. Refresh the page

### Step 2: Login Again
1. Go to http://localhost:5173/login
2. Login with admin@company.com / admin123

### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. You should see:
   ```
   User authenticated, fetching data...
   Fetching data from API...
   API Responses: { employees: {...}, projects: {...}, ... }
   Data loaded successfully!
   ```

### Step 4: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. You should see successful API calls:
   - `GET /api/employees` - Status 200
   - `GET /api/projects` - Status 200
   - `GET /api/assets` - Status 200
   - `GET /api/subscriptions` - Status 200

---

## 🐛 If Still No Data

### Check 1: Verify Backend is Running
```powershell
# Check if backend is running
curl http://localhost:5000/api/health
```

**Expected:** `{"success":true,"message":"Server is running"}`

### Check 2: Test API Directly
```powershell
# Get auth token first
$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method POST -Body (@{email="admin@company.com";password="admin123"} | ConvertTo-Json) -ContentType "application/json"
$token = $response.data.token

# Test employees endpoint
Invoke-RestMethod -Uri http://localhost:5000/api/employees -Headers @{Authorization="Bearer $token"}
```

**Expected:** You should see the 5 employees from the seed data

### Check 3: Verify Database Has Data
The seed script should have created:
- 1 admin user
- 5 employees
- 3 projects
- 3 assets
- 2 subscriptions

**Re-run seed if needed:**
```bash
cd server
npm run seed
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "401 Unauthorized" in Console
**Cause:** Token not being sent or invalid

**Fix:**
1. Logout and login again
2. Clear localStorage
3. Check if token is saved: `localStorage.getItem('token')`

### Issue 2: "Network Error" in Console
**Cause:** Backend not running or wrong URL

**Fix:**
1. Verify backend is running on port 5000
2. Check `src/config/api.js` has correct URL
3. Restart backend server

### Issue 3: Empty Arrays Returned
**Cause:** Database is empty

**Fix:**
```bash
cd server
npm run seed
```

### Issue 4: CORS Error
**Cause:** Backend not allowing frontend origin

**Fix:**
1. Check `server/.env` has `CLIENT_URL=http://localhost:5173`
2. Restart backend server

---

## 📊 Expected Data After Seed

### Employees (5)
- Sarah Jenkins (Engineering Manager)
- Mike Chen (Senior Frontend Developer)
- Jessica Wu (Product Designer)
- David Miller (Backend Developer)
- Emily Wilson (Product Manager)

### Projects (3)
- E-Commerce Platform Launch
- Mobile App Redesign
- Customer Portal Enhancement

### Assets (3)
- MacBook Pro 16" M3
- Dell XPS 15
- Dell UltraSharp 27"

### Subscriptions (2)
- Adobe Creative Cloud
- GitHub Enterprise

---

## 🎯 Quick Debug Steps

1. **Open browser console** (F12)
2. **Login** to the app
3. **Look for these messages:**
   - ✅ "User authenticated, fetching data..."
   - ✅ "Fetching data from API..."
   - ✅ "Data loaded successfully!"

4. **If you see errors:**
   - Copy the error message
   - Check Network tab for failed requests
   - Check backend terminal for errors

5. **If no console messages:**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)
   - Try incognito mode

---

## 🚀 After Fixing

Once data loads:
1. Navigate to **Employees** page
2. You should see 5 employees
3. Navigate to **Projects** page
4. You should see 3 projects
5. Navigate to **Assets** page
6. You should see 3 assets
7. Navigate to **Subscriptions** page
8. You should see 2 subscriptions

---

## 💡 Still Having Issues?

**Share with me:**
1. Browser console errors (screenshot)
2. Network tab showing API calls (screenshot)
3. Backend terminal output

**I'll help you debug!**
