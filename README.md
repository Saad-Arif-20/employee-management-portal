# Employee Management Portal

## Project Overview

A comprehensive full-stack Employee Management Portal designed to streamline organizational resources. This application provides a complete solution for tracking employees, managing projects, monitoring assets, and handling software subscriptions with a modern, intuitive interface.

The system consists of three main components:
- **Frontend**: React-based user interface
- **Backend**: Node.js/Express REST API
- **Database**: MongoDB for data persistence

## Technology Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Bootstrap 5 (via Reactstrap) and custom CSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing, CORS enabled

### Database
- **Database**: MongoDB
- **ODM**: Mongoose
- **Seeding**: Automated seed script with mock data

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### 1. Install Frontend Dependencies
Navigate to the project root directory and install the required packages:

```bash
npm install
```

### 2. Install Backend Dependencies
Navigate to the server directory and install backend packages:

```bash
cd server
npm install
cd ..
```

### 3. Configure Environment Variables
Create a `.env` file in the `server` directory with the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee-management
JWT_SECRET=your-secret-key-here
```

### 4. Start MongoDB
Ensure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or use the provided script in extras folder
.\extras\start-mongodb.ps1
```

### 5. Seed the Database
Populate the database with initial data:

```bash
cd server
node seed.js
cd ..
```

### 6. Start the Backend Server
In the `server` directory:

```bash
cd server
npm start
```

The backend API will run at `http://localhost:5000`

### 7. Start the Frontend Development Server
In the root directory:

```bash
npm run dev
```

The application will launch at `http://localhost:5173`

## Login Credentials

For development purposes, the system is pre-seeded with an administrator account:
- **Email:** admin@company.com
- **Password:** Admin123

## Key Features

- **Dashboard**: High-level overview of company metrics, including total employees, active projects, monthly spending, and recent activities
- **Employee Directory**: View, search, filter, and manage employee profiles with status changes and role management
- **Project Management**: Kanban-style interface for tracking project progress, assigning teams, and managing deadlines
- **Asset Tracking**: Complete inventory management system for company hardware and devices with QR code generation
- **Subscription Manager**: Track software licenses, costs, renewal dates, and assigned employees
- **Authentication**: Secure login system with JWT-based authentication
- **Profile Management**: Employee profile pages with detailed information and password change functionality

## Project Structure

```
employee-management-portal/
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   ├── contexts/          # React Context providers
│   ├── pages/             # Page components
│   └── App.jsx            # Main application component
├── server/                # Backend source code
│   ├── controllers/       # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   └── server.js         # Express server entry point
├── extras/               # Documentation and utilities
│   ├── documentation/    # Detailed guides
│   └── test-scripts/     # API testing scripts
└── public/              # Static assets

```

## API Documentation

The backend provides RESTful API endpoints for:
- **Authentication**: `/api/auth/login`, `/api/auth/change-password`
- **Employees**: `/api/employees` (CRUD operations)
- **Projects**: `/api/projects` (CRUD operations)
- **Assets**: `/api/assets` (CRUD operations)
- **Subscriptions**: `/api/subscriptions` (CRUD operations)

For detailed API documentation, see `server/README.md`

## Additional Resources

- **Setup Guides**: See `extras/documentation/` for detailed setup and integration guides
- **Architecture**: Review `extras/documentation/ARCHITECTURE.md` for system design details
- **Testing**: Use scripts in `extras/test-scripts/` to test API endpoints
