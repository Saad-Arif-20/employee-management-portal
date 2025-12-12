import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeProfile from './pages/EmployeeProfile';
import Projects from './pages/Projects';
import Subscriptions from './pages/Subscriptions';
import Assets from './pages/Assets';
import { GlobalProvider } from './contexts/GlobalContext';

// Wrapper component to force Dashboard remount
const DashboardWrapper = () => {
  const location = useLocation();
  return <Dashboard key={location.key || 'dashboard'} />;
};

function App() {
  return (
    <GlobalProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardWrapper />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/:id" element={<EmployeeProfile />} />
            <Route path="projects" element={<Projects />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="assets" element={<Assets />} />
          </Route>
        </Routes>
      </Router>
    </GlobalProvider>
  );
}

export default App;
