# Azure DevOps Upload Guide

## 📋 Pre-Upload Checklist

Before uploading to Azure DevOps, verify these items:

### ✅ **Files to Include**
- [x] Source code (`src/`, `server/`)
- [x] Configuration files (`package.json`, `vite.config.js`, etc.)
- [x] `.gitignore` (prevents sensitive files from being uploaded)
- [x] `.env.example` (template for environment variables)
- [x] README.md (project documentation)
- [x] `extras/` folder (documentation and test scripts)

### ❌ **Files Already Excluded (by .gitignore)**
- [x] `node_modules/` (dependencies - will be installed via npm)
- [x] `.env` (contains sensitive data - NEVER upload this!)
- [x] `dist/` (build output)
- [x] Log files
- [x] Cache files

### 🔐 **Security Check**

**IMPORTANT:** Make sure these are NOT uploaded:
- ❌ `.env` file (contains database credentials, JWT secrets)
- ❌ `node_modules/` (too large, can be reinstalled)
- ❌ Any personal API keys or passwords
- ❌ Database files

---

## 🚀 **Upload Methods**

### **Method 1: Using Azure DevOps Web Interface (Easiest)**

1. **Go to Azure DevOps**
   - Navigate to your organization: `https://dev.azure.com/YOUR_ORG`
   - Go to your project

2. **Create New Repository**
   - Click "Repos" → "Files"
   - Click "Initialize" or "Import repository"
   - Choose "Import from local Git"

3. **Upload Files**
   - Click "Upload files" or "Push an existing repository"
   - Follow the on-screen instructions

---

### **Method 2: Using Git Command Line (Recommended)**

#### **Step 1: Verify Git Installation**

Open PowerShell and check:
```powershell
git --version
```

If Git is not installed, download from: https://git-scm.com/download/win

#### **Step 2: Configure Git (First Time Only)**

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"
```

#### **Step 3: Check Current Status**

```powershell
cd C:\Users\CC259\Desktop\employee-management-portal
git status
```

#### **Step 4: Add All Files**

```powershell
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status
```

#### **Step 5: Commit Changes**

```powershell
git commit -m "Initial commit: Employee Management Portal"
```

#### **Step 6: Get Azure DevOps Repository URL**

1. Go to Azure DevOps → Your Project → Repos
2. Click "Clone"
3. Copy the HTTPS URL (looks like: `https://YOUR_ORG@dev.azure.com/YOUR_ORG/PROJECT/_git/REPO`)

#### **Step 7: Add Azure DevOps as Remote**

```powershell
# If you haven't set up remote yet
git remote add origin YOUR_AZURE_DEVOPS_URL

# Or if you need to change it
git remote set-url origin YOUR_AZURE_DEVOPS_URL

# Verify
git remote -v
```

#### **Step 8: Push to Azure DevOps**

```powershell
# Push to main branch
git push -u origin main

# Or if your branch is named 'master'
git push -u origin master
```

You'll be prompted to authenticate with your Azure DevOps credentials.

---

### **Method 3: Using Visual Studio Code**

1. **Open VS Code**
   - Open your project folder

2. **Source Control Panel**
   - Click the Source Control icon (left sidebar)
   - Click "Initialize Repository" if not already initialized

3. **Stage Changes**
   - Click "+" next to "Changes" to stage all files

4. **Commit**
   - Enter commit message: "Initial commit: Employee Management Portal"
   - Click the checkmark ✓

5. **Add Remote**
   - Click "..." → "Remote" → "Add Remote"
   - Paste your Azure DevOps URL
   - Name it "origin"

6. **Push**
   - Click "..." → "Push"
   - Authenticate when prompted

---

## 🔍 **What Will Be Uploaded**

### **Included Files:**
```
employee-management-portal/
├── src/                          ✅ Frontend source code
├── server/                       ✅ Backend source code
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── .env.example             ✅ Template (safe)
│   └── server.js
├── public/                       ✅ Static assets
├── extras/                       ✅ Documentation
├── package.json                  ✅ Dependencies list
├── README.md                     ✅ Documentation
├── .gitignore                    ✅ Git rules
└── vite.config.js               ✅ Config
```

### **Excluded Files (Automatic):**
```
❌ node_modules/          (Too large, reinstall with npm install)
❌ .env                   (Sensitive data)
❌ dist/                  (Build output)
❌ *.log                  (Log files)
```

---

## 👥 **For Team Members to Clone**

Once uploaded, your team can clone the repository:

```powershell
# Clone from Azure DevOps
git clone YOUR_AZURE_DEVOPS_URL

# Navigate to project
cd employee-management-portal

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Copy environment template
cp .env.example .env

# Edit .env with their own configuration
notepad .env

# Start MongoDB (they need to install MongoDB locally)
mongod --dbpath "%USERPROFILE%\mongodb-data"

# Seed database
npm run seed

# Run backend
npm run dev

# In another terminal, run frontend
cd ..
npm run dev
```

---

## 🔐 **Security Best Practices**

### **Before Uploading:**

1. **Check .env is NOT included:**
   ```powershell
   git status
   # Should NOT see .env in the list
   ```

2. **Verify .gitignore is working:**
   ```powershell
   git check-ignore .env
   # Should output: .env (means it's ignored)
   ```

3. **Review what will be uploaded:**
   ```powershell
   git status
   git diff --cached
   ```

### **After Uploading:**

1. **Create .env documentation:**
   - The `.env.example` file is included as a template
   - Team members should create their own `.env` file
   - Never commit actual credentials

2. **Set up Azure DevOps Secrets:**
   - For CI/CD pipelines, use Azure DevOps Variable Groups
   - Store sensitive values as secret variables

---

## 📝 **Recommended Commit Message**

```
Initial commit: Employee Management Portal

- Full-stack application with React frontend and Node.js backend
- MongoDB database with Mongoose ODM
- JWT authentication and role-based access control
- Features: Employee, Project, Asset, and Subscription management
- Comprehensive documentation in extras/ folder
- Ready for team collaboration
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Git not recognized**
**Solution:** Install Git from https://git-scm.com/download/win

### **Issue 2: Authentication failed**
**Solution:** 
- Use Personal Access Token (PAT) instead of password
- Generate PAT in Azure DevOps → User Settings → Personal Access Tokens

### **Issue 3: Large files rejected**
**Solution:** 
- Make sure `node_modules/` is in `.gitignore`
- Run `git rm -r --cached node_modules` if already tracked

### **Issue 4: .env file uploaded accidentally**
**Solution:**
```powershell
# Remove from Git (keeps local file)
git rm --cached server/.env

# Commit the removal
git commit -m "Remove .env from repository"

# Push
git push
```

---

## ✅ **Final Checklist Before Upload**

- [ ] `.env` file is NOT in the repository
- [ ] `node_modules/` is NOT in the repository
- [ ] `.gitignore` is properly configured
- [ ] README.md is up to date
- [ ] `.env.example` is included for team reference
- [ ] All sensitive data is removed
- [ ] Code is tested and working
- [ ] Documentation is complete

---

## 📞 **Need Help?**

If you encounter issues:
1. Check Azure DevOps documentation
2. Verify your repository permissions
3. Ensure you have the correct repository URL
4. Contact your Azure DevOps administrator

---

## 🎯 **Next Steps After Upload**

1. **Share with team** - Invite collaborators in Azure DevOps
2. **Set up branch policies** - Protect main branch
3. **Configure CI/CD** - Set up automated builds/deployments
4. **Add work items** - Track features and bugs
5. **Set up pull request workflow** - Code review process

---

**Good luck with your upload!** 🚀

**Last Updated:** January 6, 2026
