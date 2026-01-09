import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalProvider } from './contexts/GlobalContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeProfile from './pages/EmployeeProfile';
import Projects from './pages/Projects';
import Subscriptions from './pages/Subscriptions';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const DashboardWrapper = () => {
  const location = useLocation();
  return <Dashboard key={location.key || 'dashboard'} />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardWrapper />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route path="projects" element={<Projects />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="assets" element={<Assets />} />
        <Route path="assets/:assetTag" element={<AssetDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalProvider>
          <AppRoutes />
        </GlobalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
