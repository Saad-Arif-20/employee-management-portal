import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    CreditCard,
    Monitor,
    LogOut,
    User,
    ChevronDown
} from 'lucide-react';
import { Container, Nav, NavItem, Button } from 'reactstrap';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/employees', icon: Users, label: 'Employees' },
        { path: '/projects', icon: Briefcase, label: 'Projects' },
        { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
        { path: '/assets', icon: Monitor, label: 'Assets' },
    ];

    return (
        <div className="sidebar border-0">
            <div className="p-4 mb-2">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-3 p-2 shadow-sm"
                        style={{
                            background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)'
                        }}
                    >
                        <Users size={24} style={{ color: '#0d3b2e' }} />
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#ffffff' }}>EmpPortal</h5>
                        <small style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Management System</small>
                    </div>
                </div>
            </div>

            <div className="px-3 py-2">
                <small className="text-uppercase fw-bold px-3 mb-2 d-block" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: 'rgba(255, 255, 255, 0.5)' }}>
                    Main Menu
                </small>
                <Nav vertical className="gap-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <NavItem key={item.path} className={`nav-item-modern ${isActive ? 'active' : ''}`}>
                                <Link to={item.path} className="text-decoration-none">
                                    <div className="nav-link-content">
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <div className="ms-auto rounded-circle" style={{ width: '6px', height: '6px', background: '#0d3b2e', opacity: 0.8 }}></div>
                                        )}
                                    </div>
                                </Link>
                            </NavItem>
                        );
                    })}
                </Nav>
            </div>

            <div className="mt-auto p-4 position-absolute bottom-0 w-100">
                <Button
                    color="danger"
                    outline
                    block
                    className="d-flex align-items-center justify-content-center gap-2 border-0 hover-shadow"
                    style={{
                        transition: 'all 0.2s',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444'
                    }}
                >
                    <LogOut size={18} />
                    <span className="fw-medium">Logout</span>
                </Button>
            </div>
        </div>
    );
};

const Header = () => {
    const location = useLocation();

    const getPageTitle = (path) => {
        switch (path) {
            case '/': return 'Dashboard Overview';
            case '/employees': return 'Employee Management';
            case '/projects': return 'Project Portfolio';
            case '/subscriptions': return 'Subscription Tracker';
            case '/assets': return 'Asset Inventory';
            default: return 'Overview';
        }
    };

    return (
        <header className="top-header">
            <div className="d-flex align-items-center gap-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">{getPageTitle(location.pathname)}</h4>
                    <p className="mb-0 text-muted small">Welcome back, Admin</p>
                </div>
            </div>

            <div className="d-flex align-items-center gap-4">
                <div className="profile-badge d-flex align-items-center gap-3 ps-1 pe-3">
                    <div
                        className="rounded-circle p-1 d-flex align-items-center justify-content-center"
                        style={{
                            width: '38px',
                            height: '38px',
                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)'
                        }}
                    >
                        <User size={20} className="text-white" />
                    </div>
                    <div className="d-none d-md-block text-start">
                        <p className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Admin User</p>
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem', marginTop: '-2px' }}>Super Admin</small>
                    </div>
                    <ChevronDown size={16} className="text-muted ms-1" />
                </div>
            </div>
        </header>
    );
};

const Layout = () => {
    return (
        <div className="main-layout">
            <Sidebar />
            <Header />
            <main className="main-content">
                <Container fluid className="p-0">
                    <Outlet />
                </Container>
            </main>
        </div>
    );
};

export default Layout;
