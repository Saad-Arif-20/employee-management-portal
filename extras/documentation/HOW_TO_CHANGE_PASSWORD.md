# 🔐 How to Change Your Password

## ✅ Settings Page Added!

I've created a Settings page where you can change your password!

---

## 📍 How to Access

### **Option 1: Via Sidebar**
1. Look at the left sidebar
2. Click on **"Settings"** (gear icon)
3. You'll see your account information and password change form

### **Option 2: Direct URL**
Go to: **http://localhost:5173/settings**

---

## 🔧 How to Change Password

### **Step 1: Navigate to Settings**
Click **Settings** in the sidebar

### **Step 2: Fill in the Form**
1. **Current Password:** Enter your current password (admin123)
2. **New Password:** Enter your new password (min 6 characters)
3. **Confirm New Password:** Re-enter your new password

### **Step 3: Submit**
Click the **"Change Password"** button

### **Step 4: Success!**
You'll see a success message: "Password changed successfully!"

---

## 📋 Password Requirements

- ✅ At least 6 characters long
- ✅ Must match in both "New Password" and "Confirm" fields
- ✅ Current password must be correct

---

## 🎯 What You'll See on the Settings Page

### **User Information Section**
- Username
- Email
- Role (Admin/Manager/User)

### **Change Password Section**
- Current password field
- New password field
- Confirm password field
- Change Password button

### **Security Tips Sidebar**
- Password requirements
- Security best practices

---

## 🔄 Testing It

### **Test Password Change:**
1. Go to Settings page
2. Current Password: `admin123`
3. New Password: `newpassword123`
4. Confirm Password: `newpassword123`
5. Click "Change Password"
6. You should see: "Password changed successfully!"

### **Test New Password:**
1. Logout
2. Login with:
   - Email: admin@company.com
   - Password: `newpassword123` (your new password)
3. Should login successfully!

---

## ⚠️ Important Notes

1. **Remember your new password!** There's no password recovery yet
2. **Current password required:** You must know your current password to change it
3. **Logout after change:** You'll stay logged in, but new password takes effect immediately
4. **Security:** Passwords are hashed in the database (bcrypt)

---

## 🐛 Troubleshooting

### **"Current password is incorrect"**
- Make sure you're entering the right current password
- Default is `admin123` if you haven't changed it

### **"New passwords do not match"**
- Check that both password fields are exactly the same

### **"Password must be at least 6 characters"**
- Make your password longer

---

## 🎉 Features of the Settings Page

✅ View your account information  
✅ Change your password securely  
✅ Password validation  
✅ Success/error messages  
✅ Security tips and requirements  
✅ Beautiful, user-friendly interface  

---

## 🚀 Try It Now!

1. **Click "Settings" in the sidebar**
2. **See your account info**
3. **Change your password if you want**

---

**Your Settings page is ready to use!** 🎊
