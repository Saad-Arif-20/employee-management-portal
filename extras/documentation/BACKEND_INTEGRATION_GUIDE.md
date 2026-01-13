# Backend Integration Guide

This guide will help you connect your React frontend to the new Node.js backend.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Integration](#frontend-integration)
4. [API Service Layer](#api-service-layer)
5. [Authentication Context](#authentication-context)
6. [Updating Components](#updating-components)
7. [Testing](#testing)

---

## Prerequisites

Before integrating the backend, ensure:

- ✅ Backend server is set up and running
- ✅ MongoDB is installed and running
- ✅ Database is seeded with sample data
- ✅ You have the admin credentials (admin@company.com / admin123)

---

## Backend Setup

### 1. Install MongoDB

**Windows:**
```bash
# Download and install from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Start MongoDB:**
```bash
# Windows
mongod

# Mac
brew services start mongodb-community
```

### 2. Start the Backend Server

```bash
cd server
npm run dev
```

The server should start on `http://localhost:5000`

### 3. Seed the Database

```bash
cd server
npm run seed
```

---

## Frontend Integration

### Step 1: Install Axios

In your main project directory (not the server folder):

```bash
npm install axios
```

### Step 2: Create API Configuration

Create `src/config/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3: Create API Service Layer

Create `src/services/api.service.js`:

```javascript
import api from '../config/api';

// Authentication
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/update-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

// Employees
export const employeeService = {
  getAll: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  
  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },
  
  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/employees/stats/overview');
    return response.data;
  }
};

// Projects
export const projectService = {
  getAll: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  
  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/projects/stats/overview');
    return response.data;
  }
};

// Assets
export const assetService = {
  getAll: async (params = {}) => {
    const response = await api.get('/assets', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },
  
  create: async (assetData) => {
    const response = await api.post('/assets', assetData);
    return response.data;
  },
  
  update: async (id, assetData) => {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/assets/stats/overview');
    return response.data;
  }
};

// Subscriptions
export const subscriptionService = {
  getAll: async (params = {}) => {
    const response = await api.get('/subscriptions', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },
  
  create: async (subscriptionData) => {
    const response = await api.post('/subscriptions', subscriptionData);
    return response.data;
  },
  
  update: async (id, subscriptionData) => {
    const response = await api.put(`/subscriptions/${id}`, subscriptionData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/subscriptions/stats/overview');
    return response.data;
  }
};
```

### Step 4: Create Authentication Context

Create `src/contexts/AuthContext.jsx`:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api.service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### Step 5: Create Login Page

Create `src/pages/Login.jsx`:

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <CardBody>
              <h2 className="text-center mb-4">Login</h2>
              
              {error && <Alert color="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormGroup>
                
                <Button color="primary" block disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              
              <div className="mt-3 text-center text-muted">
                <small>Default: admin@company.com / admin123</small>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
```

### Step 6: Update App.jsx

Update your `src/App.jsx` to include authentication:

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// ... other imports

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      {/* Add other protected routes */}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### Step 7: Update DataContext

Update `src/contexts/DataContext.jsx` to fetch from API:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { employeeService, projectService, assetService, subscriptionService } from '../services/api.service';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [employeesRes, projectsRes, assetsRes, subscriptionsRes] = await Promise.all([
        employeeService.getAll(),
        projectService.getAll(),
        assetService.getAll(),
        subscriptionService.getAll()
      ]);

      setEmployees(employeesRes.data || []);
      setProjects(projectsRes.data || []);
      setAssets(assetsRes.data || []);
      setSubscriptions(subscriptionsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for employees
  const addEmployee = async (employeeData) => {
    try {
      const response = await employeeService.create(employeeData);
      if (response.success) {
        setEmployees([...employees, response.data]);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      const response = await employeeService.update(id, employeeData);
      if (response.success) {
        setEmployees(employees.map(emp => emp._id === id ? response.data : emp));
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const response = await employeeService.delete(id);
      if (response.success) {
        setEmployees(employees.filter(emp => emp._id !== id));
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  // Similar CRUD operations for projects, assets, subscriptions...

  const value = {
    employees,
    projects,
    assets,
    subscriptions,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    // Add other CRUD methods
    refreshData: fetchAllData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
```

---

## Testing

### 1. Test Backend Health

```bash
curl http://localhost:5000/api/health
```

### 2. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### 3. Test Frontend

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`
3. Login with: `admin@company.com` / `admin123`
4. Verify data loads from the backend

---

## Common Issues

### CORS Error
- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `server/server.js`

### MongoDB Connection Error
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`

### 401 Unauthorized
- Token might be expired, login again
- Check if token is being sent in Authorization header

---

## Next Steps

1. ✅ Replace all mock data with API calls
2. ✅ Add loading states to components
3. ✅ Add error handling and user feedback
4. ✅ Implement real-time updates
5. ✅ Add form validation
6. ✅ Deploy backend and frontend

**Happy Coding! 🚀**
