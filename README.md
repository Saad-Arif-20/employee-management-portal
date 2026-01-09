# Employee Management Portal

A full-stack web application for managing employees, projects, assets, and subscriptions.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)

### Installation

1. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # Windows
   mongod --dbpath "%USERPROFILE%\mongodb-data"
   
   # Mac/Linux
   mongod --dbpath ~/mongodb-data
   ```

4. **Seed the database:**
   ```bash
   cd server
   npm run seed
   ```

5. **Start the application:**
   ```bash
   # Terminal 1: Start backend
   cd server
   npm run dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Default Login
- **Email:** admin@company.com
- **Password:** admin123

## 📁 Project Structure

```
employee-management-portal/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   └── services/          # API services
├── server/                # Backend source code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
├── public/               # Static assets
├── extras/               # Documentation & test scripts
└── package.json          # Frontend dependencies
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

## 📚 Features

- **Employee Management** - Add, edit, view, and manage employee records
- **Project Tracking** - Create and monitor projects with team assignments
- **Asset Management** - Track company assets and assignments
- **Subscription Management** - Manage software licenses and subscriptions
- **Dashboard Analytics** - View key metrics and statistics
- **Role-Based Access** - Admin, Manager, and User roles
- **Authentication** - Secure JWT-based authentication

## 🛠️ Technology Stack

### Frontend
- React 19
- React Router
- Bootstrap & Reactstrap
- Axios
- Chart.js & Recharts
- Vite

### Backend
- Node.js
- Express
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs

## 📖 Additional Documentation

For detailed guides and documentation, see the `extras/documentation/` folder:
- Architecture overview
- Backend integration guide
- Debugging guide
- Git workflow guide
- And more...

## 🧪 Testing

Test scripts are available in `extras/test-scripts/`:
- `test-connection.js` - Test MongoDB connection
- `test-api.js` - Test API endpoints

## 📄 License

ISC

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** January 2026
