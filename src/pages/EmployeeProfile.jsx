import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Badge, Button, Row, Col, Table, Input, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ArrowLeft, User, Mail, Briefcase, DollarSign, Users, Monitor, Smartphone, Laptop, HardDrive, Layers, CreditCard, Check, X, PauseCircle, Activity, Edit, Trash2, Calendar, Clock, Plus, Search, TrendingUp, Package } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

const EmployeeProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { employees, projects, assets, subscriptions, updateEmployee, updateSubscription, updateAsset, updateProject } = useGlobal();

    const employee = (employees || []).find(emp => emp.id.toString() === id.toString());

    const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
    const [subModalOpen, setSubModalOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
    const [subFormData, setSubFormData] = useState({ status: 'Active', startDate: '' });

    // Asset modal state
    const [assetModalOpen, setAssetModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showAssetUnassignConfirm, setShowAssetUnassignConfirm] = useState(false);
    const [assignAssetModalOpen, setAssignAssetModalOpen] = useState(false);
    const [assetSearchTerm, setAssetSearchTerm] = useState('');

    // Modal state for project details and confirmation
    const [projectModalOpen, setProjectModalOpen] = useState(false);
    const [projectSearchTerm, setProjectSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [removeConfirmModalOpen, setRemoveConfirmModalOpen] = useState(false);
    const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
    const [formData, setFormData] = useState({});
    const [managerTooltipOpen, setManagerTooltipOpen] = useState(false);

    // Reportee modal state
    const [selectedReportee, setSelectedReportee] = useState(null);
    const [reporteeModalOpen, setReporteeModalOpen] = useState(false);
    const [showReporteeUnassignConfirm, setShowReporteeUnassignConfirm] = useState(false);

    // Subscription removal confirmation state
    const [showSubRemoveConfirm, setShowSubRemoveConfirm] = useState(false);

    // Assign subscription modal state
    const [assignSubModalOpen, setAssignSubModalOpen] = useState(false);
    const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState('');

    // Assign Reportees modal state
    const [assignReporteeModalOpen, setAssignReporteeModalOpen] = useState(false);
    const [reporteeSearchTerm, setReporteeSearchTerm] = useState('');
    const [selectedReporteesForAssignment, setSelectedReporteesForAssignment] = useState([]);


    // Guarded useEffect to populate formData when employee data is ready
    useEffect(() => {
        if (!employee) return;
        const reporteesList = (employees || []).filter(emp => emp.reportingTo === employee.id.toString());
        setFormData({
            role: employee.role,
            department: employee.department,
            salary: employee.salary ? employee.salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
            status: employee.status,
            reportingTo: employee.reportingTo || '',
            reportees: reporteesList.map(r => r.id.toString())
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee]);

    if (!employee) {
        return (
            <div className="container-fluid py-4">
                <Card>
                    <CardBody className="text-center py-5">
                        <h4 className="text-muted">Employee not found</h4>
                        <Button color="primary" className="mt-3" onClick={() => navigate('/employees')}>
                            <ArrowLeft size={16} className="me-2" />
                            Back to Employee List
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Personal Information Section Handlers
    const handleEditPersonal = () => {
        setPersonalInfoModalOpen(true);
    };

    const handleSavePersonal = () => {
        // Remove commas from salary before saving
        const dataToSave = {
            ...formData,
            salary: formData.salary ? formData.salary.replace(/,/g, '') : formData.salary
        };
        updateEmployee(employee.id, dataToSave);
        setPersonalInfoModalOpen(false);
    };

    const handleCancelPersonal = () => {
        setPersonalInfoModalOpen(false);
        if (employee) {
            setFormData({
                role: employee.role,
                department: employee.department,
                salary: employee.salary ? employee.salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                status: employee.status,
                reportingTo: employee.reportingTo || '',
                reportees: getReportees().map(r => r.id.toString())
            });
        }
    };

    // Subscriptions Section Handlers
    const handleEditSubClick = (sub) => {
        setSelectedSub(sub);
        setSubFormData({
            status: sub.employeeStatus || 'Active',
            startDate: sub.startDate || new Date().toISOString().split('T')[0]
        });
        setSubModalOpen(true);
    };

    const handleSaveSubModal = () => {
        if (!selectedSub) return;
        const origSub = subscriptions.find(s => s.id === selectedSub.id);
        if (origSub) {
            let newAssignedTo = origSub.assignedTo || [];
            if (!Array.isArray(newAssignedTo)) newAssignedTo = [];

            const updatedAssignedTo = newAssignedTo.map(item => {
                // Check for match using both employeeId and employee fields
                const isMatch = (typeof item === 'object' && item !== null) && (
                    (item.employeeId && item.employeeId.toString() === employee.id.toString()) ||
                    (item.employee && (
                        typeof item.employee === 'object'
                            ? (item.employee.id === employee.id.toString() || item.employee._id === employee.id.toString())
                            : item.employee.toString() === employee.id.toString()
                    ))
                ) || (item?.toString() === employee.id.toString());

                if (isMatch) {
                    // Preserve the original field structure (employee vs employeeId)
                    if (typeof item === 'object' && item !== null) {
                        return {
                            ...item,
                            employee: item.employee || employee.id.toString(),
                            status: subFormData.status,
                            startDate: subFormData.startDate
                        };
                    }
                    return {
                        employee: employee.id.toString(),
                        status: subFormData.status,
                        startDate: subFormData.startDate
                    };
                }
                return item;
            });

            updateSubscription({ ...origSub, assignedTo: updatedAssignedTo });
        }
        setSubModalOpen(false);
    };

    const handleDeleteSubModal = () => {
        if (!selectedSub) return;
        const origSub = subscriptions.find(s => s.id === selectedSub.id);
        if (origSub) {
            let newAssignedTo = origSub.assignedTo || [];
            if (Array.isArray(newAssignedTo)) {
                newAssignedTo = newAssignedTo.filter(item => {
                    if (typeof item === 'object') return item.employeeId?.toString() !== employee.id.toString();
                    return item?.toString() !== employee.id.toString();
                });
            }
            updateSubscription({ ...origSub, assignedTo: newAssignedTo });
        }
        setSubModalOpen(false);
    };

    const handleAssignSubscription = (subscription) => {
        const origSub = subscriptions.find(s => s.id === subscription.id);
        if (origSub) {
            let newAssignedTo = origSub.assignedTo || [];
            if (!Array.isArray(newAssignedTo)) newAssignedTo = [];

            // Add employee to subscription
            const newAssignment = {
                employeeId: employee.id.toString(),
                status: 'Active',
                startDate: new Date().toISOString().split('T')[0]
            };

            newAssignedTo.push(newAssignment);
            updateSubscription({ ...origSub, assignedTo: newAssignedTo });
        }
    };

    // Assets Section Handlers
    const handleEditAssetClick = (asset) => {
        setSelectedAsset(asset);
        setAssetModalOpen(true);
    };

    const handleConfirmUnassignAsset = () => {
        if (!selectedAsset) return;

        // Unassign the asset
        updateAsset(selectedAsset.id, { assignedTo: '', status: 'Available' });

        // Close modals and reset state
        setAssetModalOpen(false);
        setSelectedAsset(null);
        setShowAssetUnassignConfirm(false);
    };

    const handleAssignAsset = (assetId) => {
        const asset = assets.find(a => a.id === assetId);
        if (asset) {
            updateAsset(assetId, { ...asset, status: 'Assigned', assignedTo: employee.name });
            setAssignAssetModalOpen(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, options } = e.target;

        // Handle multi-select for reportees
        if (name === 'reportees' && options) {
            const selected = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
            setFormData(prev => ({ ...prev, [name]: selected }));
        } else if (name === 'salary') {
            // Remove all non-digit characters
            const numericValue = value.replace(/[^\d]/g, '');
            // Format with commas
            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle Project Actions
    const handleConfirmRemoveFromProject = () => {
        if (!selectedProject) return;

        // Find the project and remove the employee from the team
        const updatedTeam = selectedProject.team.filter(member => {
            if (typeof member === 'string') {
                return member !== employee.name && member !== employee.id.toString();
            }
            return member.employeeId !== employee.id &&
                member.employeeId !== employee.id.toString() &&
                member.employeeName !== employee.name;
        });

        // Update the project with the new team (pass id and updated data separately)
        updateProject(selectedProject.id, {
            ...selectedProject,
            team: updatedTeam
        });

        setRemoveConfirmModalOpen(false);
        setSelectedProject(null);
    };

    // Handle Reportee Unassignment
    const handleConfirmUnassignReportee = () => {
        if (!selectedReportee) return;

        const updatedReportee = {
            ...selectedReportee,
            reportingTo: null
        };
        updateEmployee(selectedReportee.id, updatedReportee);

        setReporteeModalOpen(false);
        setSelectedReportee(null);
        setShowReporteeUnassignConfirm(false);
    };

    // Handle Assign Reportees
    const handleOpenAssignReportees = () => {
        const currentReporteeIds = reportees.map(r => r.id.toString());
        setSelectedReporteesForAssignment(currentReporteeIds);
        setAssignReporteeModalOpen(true);
    };



    const toggleReporteeSelection = (id) => {
        const strId = id.toString();
        let newSelection;

        if (selectedReporteesForAssignment.includes(strId)) {
            newSelection = selectedReporteesForAssignment.filter(pid => pid !== strId);
        } else {
            newSelection = [...selectedReporteesForAssignment, strId];
        }

        setSelectedReporteesForAssignment(newSelection);

        // Save immediately
        updateEmployee(employee.id, {
            ...employee,
            reportees: newSelection
        });
    };

    // Get manager name
    const getManagerName = (managerId) => {
        if (!managerId) return null;
        const manager = (employees || []).find(emp => emp.id.toString() === managerId);
        return manager ? manager.name : null;
    };

    // Get manager details for tooltip
    const getManagerDetails = (managerId) => {
        if (!managerId) return null;
        const manager = (employees || []).find(emp => emp.id.toString() === managerId);
        return manager ? { designation: manager.role, email: manager.email } : null;
    };

    // Get reportees
    const getReportees = () => {
        const reporteesList = (employees || []).filter(emp => emp.reportingTo === employee.id.toString());
        return reporteesList.length > 0 ? reporteesList : [];
    };

    // Get employee projects
    const getEmployeeProjects = () => {
        return projects.filter(project => {
            // Check if employee is the project lead
            // Compare against both name and ID (as string)
            if (project.lead === employee.name || project.lead === employee.id.toString()) {
                return true;
            }

            // Check if project has team array
            if (!project.team || !Array.isArray(project.team)) {
                return false;
            }
            return project.team.some(member => {
                // If member is a string, compare with employee name or ID
                if (typeof member === 'string') {
                    return member === employee.name || member === employee.id.toString();
                }
                // If member is an object, compare with employeeId or name
                return member.employeeId === employee.id ||
                    member.employeeId === employee.id.toString() ||
                    member.employeeName === employee.name;
            });
        });
    };

    // Get employee role in project
    const getProjectRole = (project) => {
        if (!project || !project.team) return 'Team Member';

        // Check if lead
        if (project.lead === employee.name) return 'Project Lead';

        // Check specific role in team array
        const member = project.team.find(m =>
            (typeof m === 'string' && (m === employee.name || m === employee.id.toString())) ||
            (typeof m === 'object' && (m.employeeId === employee.id || m.employeeId === employee.id.toString() || m.employeeName === employee.name))
        );

        if (typeof member === 'object' && member.role) {
            return member.role;
        }

        return 'Team Member';
    };

    // Get assigned assets
    const getAssignedAssets = () => {
        return assets.filter(asset =>
            asset.assignedTo &&
            (asset.assignedTo === employee.name ||
                asset.assignedTo === employee.id.toString() ||
                asset.assignedTo === employee.employeeId)
        );
    };

    // Get asset icon
    const getAssetIcon = (type) => {
        switch (type) {
            case 'Laptop': return <Laptop size={16} className="text-muted" />;
            case 'Mobile': return <Smartphone size={16} className="text-muted" />;
            case 'Monitor': return <Monitor size={16} className="text-muted" />;
            case 'Storage': return <HardDrive size={16} className="text-muted" />;
            case 'Furniture (Chair, Desk, etc.)': return <Layers size={16} className="text-muted" />;
            default: return <Layers size={16} className="text-muted" />;
        }
    };

    // Format price to match Subscriptions.jsx
    const formatPrice = (price) => {
        if (!price) return price;

        // Ensure price is treated as a string
        const priceStr = price.toString();

        // Extract numeric value from price string (e.g., "$2500/mo" -> "2500")
        const match = priceStr.match(/\$([\d.]+)\/mo/);

        // If it doesn't match the expected format, return original
        if (!match) return price;

        const numericValue = match[1];
        const parts = numericValue.split('.');

        // Add commas for thousands
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedNumber = parts.join('.');

        return `$${formattedNumber}/mo`;
    };

    // Get employee subscriptions
    const getEmployeeSubscriptions = () => {
        return subscriptions.filter(sub => {
            // If assignedTo is an array (of objects or IDs)
            if (Array.isArray(sub.assignedTo)) {
                // Check for objects with employeeId/employee or direct ID strings
                return sub.assignedTo.some(assigned => {
                    if (typeof assigned === 'object' && assigned !== null) {
                        // Check both employeeId (legacy/frontend) and employee (backend schema)
                        return (assigned.employeeId && assigned.employeeId.toString() === employee.id.toString()) ||
                            (assigned.employee && (
                                // handle populated employee object or direct ID
                                (typeof assigned.employee === 'object' ? assigned.employee.id === employee.id.toString() || assigned.employee._id === employee.id.toString() : assigned.employee.toString() === employee.id.toString())
                            ));
                    }
                    // Assume assigned is a string ID
                    return assigned?.toString() === employee.id.toString();
                });
            }
            // If assignedTo is an object
            if (typeof sub.assignedTo === 'object' && sub.assignedTo !== null) {
                return (sub.assignedTo.employeeId && sub.assignedTo.employeeId.toString() === employee.id.toString()) ||
                    (sub.assignedTo.employee && sub.assignedTo.employee.toString() === employee.id.toString());
            }
            // If assignedTo is a string (could be name or ID)
            const assignedStr = sub.assignedTo?.toString();
            return assignedStr === employee.id.toString() || assignedStr === employee.name;
        });
    };


    const employeeProjects = getEmployeeProjects();
    const hasActiveProjects = employeeProjects.some(p => p.status === 'Planning' || p.status === 'In Progress');
    const assignedAssets = getAssignedAssets();
    const reportees = getReportees();

    // For subscriptions, we need to merge the global data with local status when not editing
    // When editing, we use editedSubscriptions directly
    const displaySubscriptions = getEmployeeSubscriptions().map(sub => {
        let status = 'Active';
        let startDate = null;

        // Check global subscription status first
        if (sub.status === 'Paused') {
            status = 'Paused';
        } else if (Array.isArray(sub.assignedTo)) {
            const assignment = sub.assignedTo.find(a => {
                if (typeof a === 'object' && a !== null) {
                    return (a.employeeId && a.employeeId.toString() === employee.id.toString()) ||
                        (a.employee && (
                            (typeof a.employee === 'object' ? a.employee.id === employee.id.toString() || a.employee._id === employee.id.toString() : a.employee.toString() === employee.id.toString())
                        ));
                }
                return a?.toString() === employee.id.toString();
            });

            if (typeof assignment === 'object' && assignment !== null) {
                if (assignment.status) status = assignment.status;
                if (assignment.startDate) startDate = assignment.startDate;
            }
        }
        return { ...sub, employeeStatus: status, startDate };
    });


    return (
        <>
            <style>{`
                .dropdown-menu .dropdown-item:hover,
                .dropdown-menu .dropdown-item:focus {
                    background-color: #0d3b2e !important;
                    color: white !important;
                }
            `}</style>
            <div className="container-fluid py-4">
                {/* Header */}
                <div className="mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <Button
                            color="light"
                            onClick={() => navigate('/employees')}
                            className="p-2 d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                            title="Back to List"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h2 className="fw-bold text-dark mb-0">{employee.name}</h2>
                            <p className="text-muted mb-0">{employee.role} • {employee.department}</p>
                        </div>
                    </div>
                </div>


                <Row>
                    {/* Personal Information - Left Column */}
                    <Col lg={6} className="mb-4">
                        <Card className="glass-card border-0 h-100">
                            <CardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-4 pt-3 px-3">
                                    <div>
                                        <h5 className="mb-1 fw-bold">Personal Information</h5>
                                        <p className="text-muted small mb-0">Basic employee details and contact information</p>
                                    </div>
                                    <Button size="sm" color="light" onClick={handleEditPersonal}>
                                        <Edit size={14} className="me-1" />
                                        Manage
                                    </Button>
                                </div>
                                <Row className="px-3">
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <User size={18} className="text-muted" />
                                                <strong>Employee ID:</strong>
                                            </div>
                                            <p className="ms-4 mb-0 text-muted">{employee.employeeId || '-'}</p>
                                        </div>
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Mail size={18} className="text-muted" />
                                                <strong>Email:</strong>
                                            </div>
                                            <p className="ms-4 mb-0 text-muted">{employee.email || '-'}</p>
                                        </div>
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Briefcase size={18} className="text-muted" />
                                                <strong>Department:</strong>
                                            </div>
                                            <p className="ms-4 mb-0 text-muted">{employee.department}</p>
                                        </div>
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <User size={18} className="text-muted" />
                                                <strong>Reporting To:</strong>
                                            </div>
                                            {getManagerName(employee.reportingTo) ? (
                                                <div
                                                    className="ms-4 position-relative d-inline-block"
                                                    onMouseEnter={() => setManagerTooltipOpen(true)}
                                                    onMouseLeave={() => setManagerTooltipOpen(false)}
                                                >
                                                    <Badge
                                                        color="success"
                                                        className="px-3 py-2"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {getManagerName(employee.reportingTo)}
                                                    </Badge>
                                                    {managerTooltipOpen && getManagerDetails(employee.reportingTo) && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '100%',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            marginBottom: '8px',
                                                            backgroundColor: '#333',
                                                            color: 'white',
                                                            padding: '8px 12px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            zIndex: 1000,
                                                            whiteSpace: 'nowrap',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                            pointerEvents: 'none'
                                                        }}>
                                                            <div className="text-start">
                                                                <div><strong>Designation:</strong> {getManagerDetails(employee.reportingTo).designation}</div>
                                                                <div><strong>Email:</strong> {getManagerDetails(employee.reportingTo).email}</div>
                                                            </div>
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: '50%',
                                                                marginLeft: '-5px',
                                                                borderWidth: '5px',
                                                                borderStyle: 'solid',
                                                                borderColor: '#333 transparent transparent transparent'
                                                            }} />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="ms-4 mb-0 text-muted">-</p>
                                            )}
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Briefcase size={18} className="text-muted" />
                                                <strong>Role:</strong>
                                            </div>
                                            <p className="ms-4 mb-0 text-muted">{employee.role}</p>
                                        </div>
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <DollarSign size={18} className="text-muted" />
                                                <strong>Salary:</strong>
                                            </div>
                                            <div className="ms-4 d-flex align-items-center gap-2">
                                                <span className="text-muted">{Number(employee.salary).toLocaleString()}</span>
                                                <span className="text-dark fw-bold">USD</span>
                                            </div>
                                        </div>
                                        <div className="mb-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Activity size={18} className="text-muted" />
                                                <strong>Status:</strong>
                                            </div>
                                            <Badge
                                                className="ms-4 px-3 py-2 rounded-pill bg-opacity-10 d-inline-flex align-items-center gap-2"
                                                style={{
                                                    backgroundColor:
                                                        employee.status === 'Active' ? 'rgba(25, 135, 84, 0.1)' :
                                                            employee.status === 'On Leave' ? 'rgba(255, 193, 7, 0.1)' :
                                                                'rgba(220, 53, 69, 0.1)',
                                                    color:
                                                        employee.status === 'Active' ? '#198754' :
                                                            employee.status === 'On Leave' ? '#ffc107' :
                                                                '#dc3545'
                                                }}
                                            >
                                                {employee.status === 'Active' && <Check size={14} />}
                                                {employee.status === 'On Leave' && <PauseCircle size={14} />}
                                                {employee.status === 'Inactive' && <X size={14} />}
                                                {employee.status}
                                            </Badge>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Quick Metrics Cards - Right Column (2x2 Grid) */}
                    <Col lg={6} className="mb-4 d-flex flex-column">
                        <Row className="g-3 flex-fill">
                            {/* Active Projects */}
                            <Col md={6}>
                                <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)' }}>
                                    <CardBody className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div>
                                                <h2 className="mb-1 fw-bold text-white" style={{ fontSize: '2rem', lineHeight: '1' }}>{employeeProjects.length}</h2>
                                                <p className="mb-0 text-white-50" style={{ fontSize: '0.875rem', letterSpacing: '0.5px', marginTop: '0.5rem' }}>ACTIVE PROJECTS</p>
                                            </div>
                                            <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                                                <Briefcase size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-white" style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                opacity: 0.9
                                            }}>
                                                {employeeProjects.filter(p => p.status === 'In Progress').length} In Progress • {employeeProjects.filter(p => p.status === 'Planning').length} Planning
                                            </span>
                                            <div className="mt-1">
                                                <span className="text-white" style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    opacity: 0.9
                                                }}>
                                                    {employeeProjects.filter(p => p.status === 'On Hold').length} On Hold
                                                </span>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Active Subscriptions */}
                            <Col md={6}>
                                <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>
                                    <CardBody className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div>
                                                <h2 className="mb-1 fw-bold text-white" style={{ fontSize: '2rem', lineHeight: '1' }}>
                                                    ${displaySubscriptions.reduce((total, sub) => {
                                                        const match = sub.price.match(/\$([/\d.,]+)\/mo/);
                                                        const price = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
                                                        return total + price;
                                                    }, 0).toFixed(2)}
                                                </h2>
                                                <p className="mb-0 text-white-50" style={{ fontSize: '0.875rem', letterSpacing: '0.5px', marginTop: '0.5rem' }}>ACTIVE SUBSCRIPTIONS</p>
                                            </div>
                                            <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                                                <Package size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-white" style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                opacity: 0.9
                                            }}>
                                                {displaySubscriptions.filter(sub => sub.employeeStatus === 'Active').length} Active • {displaySubscriptions.filter(sub => sub.employeeStatus === 'Paused').length} Paused
                                            </span>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Assigned Assets */}
                            <Col md={6}>
                                <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)' }}>
                                    <CardBody className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div>
                                                <h2 className="mb-1 fw-bold text-white" style={{ fontSize: '2rem', lineHeight: '1' }}>
                                                    ${assignedAssets.reduce((total, asset) => total + (parseFloat(asset.price) || 0), 0).toLocaleString()}
                                                </h2>
                                                <p className="mb-0 text-white-50" style={{ fontSize: '0.875rem', letterSpacing: '0.5px', marginTop: '0.5rem' }}>ASSIGNED ASSETS</p>
                                            </div>
                                            <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                                                <Monitor size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-white" style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                opacity: 0.9
                                            }}>
                                                {assignedAssets.length} Assets
                                            </span>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Total Investment */}
                            <Col md={6}>
                                <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, rgb(251, 191, 36) 0%, rgb(191, 170, 60) 100%)' }}>
                                    <CardBody className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div>
                                                <h2 className="mb-1 fw-bold text-white" style={{ fontSize: '2rem', lineHeight: '1' }}>
                                                    ${(() => {
                                                        const subscriptionCost = displaySubscriptions.reduce((total, sub) => {
                                                            const match = sub.price.match(/\$([/\d.,]+)\/mo/);
                                                            const price = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
                                                            return total + price;
                                                        }, 0);
                                                        const assetValue = assignedAssets.reduce((total, asset) => total + (parseFloat(asset.price) || 0), 0);
                                                        return (subscriptionCost + assetValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                    })()}
                                                </h2>
                                                <p className="mb-0 text-white-50" style={{ fontSize: '0.875rem', letterSpacing: '0.5px', marginTop: '0.5rem' }}>TOTAL INVESTMENT</p>
                                            </div>
                                            <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                                                <TrendingUp size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-white" style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                opacity: 0.9
                                            }}>
                                                Assets + Subscriptions
                                            </span>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row>
                    {/* Subscriptions - Full Width */}
                    <Col lg={12} className="mb-4">
                        <Card className="glass-card border-0 h-100">
                            <CardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-4 pt-3 px-3">
                                    <div>
                                        <h5 className="mb-1 fw-bold">Subscriptions</h5>
                                        <p className="text-muted small mb-0">Active subscription licenses for this employee</p>
                                    </div>
                                    <Button size="sm" onClick={() => setAssignSubModalOpen(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                            border: 'none',
                                            color: 'white'
                                        }}
                                    >
                                        <Plus size={14} className="me-1" />
                                        Assign Subscription
                                    </Button>
                                </div>
                                {displaySubscriptions.length > 0 ? (
                                    <div className="table-responsive px-3">
                                        <Table hover className="align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Service</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Type</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Price</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Start Date</th>
                                                    <th className="border-0 fw-medium text-center" style={{ color: '#0d3b2e' }}>Status</th>
                                                    <th className="border-0 fw-medium text-center" style={{ color: '#0d3b2e' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displaySubscriptions.map(sub => (
                                                    <tr key={sub.id}>
                                                        <td className="border-bottom border-light py-3">
                                                            <div className="fw-bold text-dark">{sub.name}</div>
                                                        </td>
                                                        <td className="border-bottom border-light py-3">
                                                            <span className="text-muted">{sub.type}</span>
                                                        </td>
                                                        <td className="border-bottom border-light py-3">
                                                            <span className="text-muted">{formatPrice(sub.price)}</span>
                                                        </td>
                                                        <td className="border-bottom border-light py-3">
                                                            <span className="text-muted">{sub.startDate || '-'}</span>
                                                        </td>
                                                        <td className="border-bottom border-light py-3 text-center">
                                                            <Badge
                                                                color={sub.employeeStatus === 'Active' ? 'success' : 'warning'}
                                                                className="px-3 py-2"
                                                            >
                                                                {sub.employeeStatus}
                                                            </Badge>
                                                        </td>
                                                        <td className="border-bottom border-light py-3 text-center">
                                                            <Button
                                                                size="sm"
                                                                color="light"
                                                                onClick={() => handleEditSubClick(sub)}
                                                                title="Edit Subscription"
                                                            >
                                                                <Edit size={14} className="me-1" />
                                                                Manage
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted px-3">
                                        <CreditCard size={48} className="mb-3 opacity-50" />
                                        <p className="mb-0">No subscriptions assigned</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Projects */}
                    <Col lg={12} className="mb-4">
                        <Card className="glass-card border-0 h-100">
                            <CardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-4 pt-3 px-3">
                                    <div>
                                        <h5 className="mb-1 fw-bold">Projects</h5>
                                        <p className="text-muted small mb-0">Active projects and assignments for this employee</p>
                                    </div>
                                    <Button size="sm" onClick={() => setProjectModalOpen(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                            border: 'none',
                                            color: 'white'
                                        }}
                                    >
                                        <Plus size={14} className="me-1" />
                                        Assign Project
                                    </Button>
                                </div>
                                {employeeProjects.length > 0 ? (
                                    <div className="table-responsive px-3">
                                        <Table hover className="align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Project Title</th>
                                                    <th className="border-0 fw-medium text-center" style={{ color: '#0d3b2e' }}>Project Status</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Role</th>
                                                    <th className="border-0 fw-medium text-center" style={{ color: '#0d3b2e' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employeeProjects.map(project => {
                                                    const role = getProjectRole(project);
                                                    return (
                                                        <tr key={project.id}>
                                                            <td className="border-bottom border-light py-3">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="bg-primary bg-opacity-10 p-2 rounded">
                                                                        <Briefcase size={16} className="text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="fw-bold text-dark">{project.title || project.name}</div>
                                                                        {project.description && (
                                                                            <small className="text-muted">{project.description}</small>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="border-bottom border-light py-3 text-center">
                                                                <Badge
                                                                    color={
                                                                        project.status === 'In Progress' ? 'primary' :
                                                                            project.status === 'Planning' ? 'info' :
                                                                                project.status === 'Completed' ? 'success' :
                                                                                    project.status === 'On Hold' ? 'warning' : 'secondary'
                                                                    }
                                                                    className="px-3 py-2"
                                                                >
                                                                    {project.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="border-bottom border-light py-3">
                                                                <Badge
                                                                    color={role === 'Project Lead' ? 'warning' : 'info'}
                                                                    className="px-3 py-2"
                                                                >
                                                                    {role}
                                                                </Badge>
                                                            </td>
                                                            <td className="border-bottom border-light py-3 text-center">
                                                                <Button
                                                                    size="sm"
                                                                    color="light"
                                                                    onClick={() => {
                                                                        setSelectedProject(project);
                                                                        setRemoveConfirmModalOpen(true);
                                                                    }}
                                                                    title="Edit Project Assignment"
                                                                >
                                                                    <Edit size={14} className="me-1" />
                                                                    Manage
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted px-3">
                                        <Briefcase size={48} className="mb-3 opacity-50" />
                                        <p className="mb-0">No projects assigned</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Reportees */}
                    <Col lg={12} className="mb-4">
                        <Card className="glass-card border-0 h-100">
                            <CardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-4 pt-3 px-3">
                                    <div>
                                        <h5 className="mb-1 fw-bold">Reportees</h5>
                                        <p className="text-muted small mb-0">Team members reporting directly to this employee</p>
                                    </div>
                                    <Button size="sm" onClick={handleOpenAssignReportees}
                                        style={{
                                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                            border: 'none',
                                            color: 'white'
                                        }}
                                    >
                                        <Plus size={14} className="me-1" />
                                        Assign Reportees
                                    </Button>
                                </div>
                                {reportees.length > 0 ? (
                                    <div className="table-responsive px-3">
                                        <Table hover className="align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Name</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Designation</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Department</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Email</th>
                                                    <th className="border-0 fw-medium text-center" style={{ color: '#0d3b2e' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportees.map(reportee => (
                                                    <tr key={reportee.id}>
                                                        <td className="border-bottom border-light py-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="bg-primary bg-opacity-10 p-2 rounded">
                                                                    <User size={16} className="text-primary" />
                                                                </div>
                                                                <div className="fw-bold text-dark">{reportee.name}</div>
                                                            </div>
                                                        </td>
                                                        <td className="border-bottom border-light py-3">
                                                            <span className="text-muted">{reportee.role || '-'}</span>
                                                        </td>
                                                        <td className="border-bottom border-light py-3">
                                                            <span className="text-muted">{reportee.department || '-'}</span>
                                                        </td>
                                                        <td className="border-bottom border-light py-3">
                                                            <span className="text-muted">{reportee.email || '-'}</span>
                                                        </td>
                                                        <td className="border-bottom border-light py-3 text-center">
                                                            <Button
                                                                size="sm"
                                                                color="light"
                                                                onClick={() => {
                                                                    setSelectedReportee(reportee);
                                                                    setReporteeModalOpen(true);
                                                                }}
                                                                title="Edit Reportee Assignment"
                                                            >
                                                                <Edit size={14} className="me-1" />
                                                                Manage
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted px-3">
                                        <Users size={48} className="mb-3 opacity-50" />
                                        <p className="mb-0">No reportees assigned</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>



                    {/* Assigned Assets */}
                    < Col lg={12} >
                        <Card className="glass-card border-0">
                            <CardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-4 pt-3 px-3">
                                    <div>
                                        <h5 className="mb-1 fw-bold">Assigned Assets</h5>
                                        <p className="text-muted small mb-0">Hardware and equipment allocated to this employee</p>
                                    </div>
                                    <Button size="sm" onClick={() => setAssignAssetModalOpen(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                            border: 'none',
                                            color: 'white'
                                        }}
                                    >
                                        <Plus size={14} className="me-1" />
                                        Assign Assets
                                    </Button>
                                </div>
                                {assignedAssets.length > 0 ? (
                                    <div className="table-responsive px-3">
                                        <Table hover className="align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Asset Tag</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Asset Name</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Type</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Price</th>
                                                    <th className="border-0 fw-medium" style={{ color: '#0d3b2e' }}>Serial Number</th>
                                                    <th className="border-0 fw-medium text-center" style={{ color: '#0d3b2e' }}>Status</th>
                                                    <th className="border-0 fw-medium text-center" style={{ color: '#0d3b2e' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assignedAssets.map(asset => {
                                                    const Icon = getAssetIcon(asset.type);
                                                    return (
                                                        <tr key={asset.id}>
                                                            <td className="border-bottom border-light py-3">
                                                                <span className="text-muted">{asset.assetTag}</span>
                                                            </td>
                                                            <td className="border-bottom border-light py-3">
                                                                <div className="fw-bold text-dark">{asset.name}</div>
                                                            </td>
                                                            <td className="border-bottom border-light py-3">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    {Icon}
                                                                    <span className="text-muted">{asset.type}</span>
                                                                </div>
                                                            </td>
                                                            <td className="border-bottom border-light py-3">
                                                                <span className="text-muted">${parseFloat(asset.price || 0).toLocaleString()}</span>
                                                            </td>
                                                            <td className="border-bottom border-light py-3">
                                                                <span className="text-muted font-monospace">{asset.serial || '-'}</span>
                                                            </td>
                                                            <td className="border-bottom border-light py-3 text-center">
                                                                <Badge
                                                                    color={
                                                                        asset.status === 'Available' ? 'success' :
                                                                            asset.status === 'In Use' ? 'primary' :
                                                                                asset.status === 'Under maintenance' ? 'warning' : 'danger'
                                                                    }
                                                                    className="px-3 py-2"
                                                                >
                                                                    {asset.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="border-bottom border-light py-3 text-center">
                                                                <Button
                                                                    size="sm"
                                                                    color="light"
                                                                    onClick={() => handleEditAssetClick(asset)}
                                                                    title="Edit Asset Assignment"
                                                                >
                                                                    <Edit size={14} className="me-1" />
                                                                    Manage
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted px-3">
                                        <Monitor size={48} className="mb-3 opacity-50" />
                                        <p className="mb-0">No assets assigned</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col >
                </Row >

                {/* Subscription Edit Modal */}
                < Modal
                    isOpen={subModalOpen}
                    toggle={() => {
                        setSubModalOpen(false);
                        setShowSubRemoveConfirm(false);
                    }}
                    centered
                >
                    <ModalHeader toggle={() => {
                        setSubModalOpen(false);
                        setShowSubRemoveConfirm(false);
                    }}>
                        {showSubRemoveConfirm ? 'Confirm Removal' : `Edit Subscription: ${selectedSub?.name}`}
                    </ModalHeader>
                    <ModalBody>
                        {!showSubRemoveConfirm ? (
                            <>
                                <FormGroup>
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={subFormData.startDate}
                                        onChange={(e) => setSubFormData({ ...subFormData, startDate: e.target.value })}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Status</Label>
                                    <UncontrolledDropdown>
                                        <DropdownToggle
                                            caret
                                            className="w-100 text-start d-flex justify-content-between align-items-center bg-white"
                                            style={{
                                                borderRadius: '0.375rem',
                                                padding: '0.375rem 0.75rem',
                                                color: '#212529',
                                                border: '1px solid #ced4da'
                                            }}
                                        >
                                            {subFormData.status || 'Active'}
                                        </DropdownToggle>
                                        <DropdownMenu className="w-100 shadow-sm border-0">
                                            <DropdownItem onClick={() => setSubFormData({ ...subFormData, status: 'Active' })}>Active</DropdownItem>
                                            <DropdownItem onClick={() => setSubFormData({ ...subFormData, status: 'Paused' })}>Paused</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </FormGroup>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="mb-3">
                                    <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3">
                                        <Trash2 size={32} className="text-danger" />
                                    </div>
                                </div>
                                <h5 className="mb-3">Remove Subscription?</h5>
                                <p className="text-muted mb-0">
                                    Are you sure you want to remove <strong>{selectedSub?.name}</strong> from <strong>{employee.name}</strong>?
                                </p>
                                <p className="text-danger small mt-2">This action cannot be undone.</p>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter className={!showSubRemoveConfirm ? "justify-content-between" : ""}>
                        {!showSubRemoveConfirm ? (
                            <>
                                <Button
                                    color="danger"
                                    outline
                                    onClick={() => setShowSubRemoveConfirm(true)}
                                >
                                    <Trash2 size={16} className="me-2" />
                                    Remove Subscription
                                </Button>
                                <div className="d-flex gap-2">
                                    <Button color="light" className="border" onClick={() => setSubModalOpen(false)}>Cancel</Button>
                                    <button
                                        onClick={handleSaveSubModal}
                                        style={{
                                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '500',
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Button
                                    color="danger"
                                    onClick={() => {
                                        handleDeleteSubModal();
                                        setShowSubRemoveConfirm(false);
                                    }}
                                >
                                    Yes, Remove
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => setShowSubRemoveConfirm(false)}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </ModalFooter>
                </Modal >

                {/* Personal Info Edit Modal */}
                < Modal isOpen={personalInfoModalOpen} toggle={handleCancelPersonal} size="lg" centered >
                    <ModalHeader toggle={handleCancelPersonal}>Edit Personal Information</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Department</Label>
                                    <UncontrolledDropdown>
                                        <DropdownToggle
                                            caret
                                            className="w-100 text-start d-flex justify-content-between align-items-center bg-white"
                                            style={{
                                                borderRadius: '0.375rem',
                                                padding: '0.375rem 0.75rem',
                                                color: '#212529',
                                                border: '1px solid #ced4da'
                                            }}
                                        >
                                            {formData.department || 'Select Department'}
                                        </DropdownToggle>
                                        <DropdownMenu className="w-100 shadow-sm border-0">
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, department: 'Engineering' }))}>Engineering</DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, department: 'Product' }))}>Product</DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, department: 'Design' }))}>Design</DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, department: 'Marketing' }))}>Marketing</DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, department: 'HR' }))}>HR</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Role</Label>
                                    <Input
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Reporting To</Label>
                                    <UncontrolledDropdown>
                                        <DropdownToggle
                                            caret
                                            className="w-100 text-start d-flex justify-content-between align-items-center bg-white"
                                            style={{
                                                borderRadius: '0.375rem',
                                                padding: '0.375rem 0.75rem',
                                                color: '#212529',
                                                border: '1px solid #ced4da'
                                            }}
                                        >
                                            {(() => {
                                                const manager = employees.find(emp => emp.id.toString() === formData.reportingTo);
                                                return manager ? manager.name : 'Select Manager';
                                            })()}
                                        </DropdownToggle>
                                        <DropdownMenu className="w-100 shadow-sm border-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, reportingTo: '' }))}>Select Manager</DropdownItem>
                                            {employees
                                                .filter(emp => emp.id !== employee.id)
                                                .filter(emp => !(formData.reportees || []).includes(emp.id.toString()))
                                                .map(emp => (
                                                    <DropdownItem key={emp.id} onClick={() => setFormData(prev => ({ ...prev, reportingTo: emp.id.toString() }))}>
                                                        {emp.name}
                                                    </DropdownItem>
                                                ))}
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Salary (USD)</Label>
                                    <Input
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Employee Status</Label>
                                    <UncontrolledDropdown>
                                        <DropdownToggle
                                            caret
                                            disabled={hasActiveProjects}
                                            className="w-100 text-start d-flex justify-content-between align-items-center bg-white"
                                            style={{
                                                borderRadius: '0.375rem',
                                                padding: '0.375rem 0.75rem',
                                                color: '#212529',
                                                border: '1px solid #ced4da'
                                            }}
                                        >
                                            {formData.status || 'Active'}
                                        </DropdownToggle>
                                        <DropdownMenu className="w-100">
                                            <DropdownItem onClick={() => handleChange({ target: { name: 'status', value: 'Active' } })}>
                                                Active
                                            </DropdownItem>
                                            <DropdownItem onClick={() => handleChange({ target: { name: 'status', value: 'On Leave' } })}>
                                                On Leave
                                            </DropdownItem>
                                            <DropdownItem onClick={() => handleChange({ target: { name: 'status', value: 'Inactive' } })}>
                                                Inactive
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                    {hasActiveProjects && (
                                        <small className="text-danger mt-1 d-block">
                                            Cannot change status. Employee is assigned to active projects.
                                        </small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <button
                            onClick={handleSavePersonal}
                            style={{
                                background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                border: 'none',
                                color: 'white',
                                fontWeight: '500',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.25rem',
                                cursor: 'pointer'
                            }}
                        >
                            Save Changes
                        </button>
                        <Button color="light" className="border" onClick={handleCancelPersonal}>Cancel</Button>
                    </ModalFooter>
                </Modal>

                {/* Assign Project Modal */}
                <Modal isOpen={projectModalOpen} toggle={() => setProjectModalOpen(false)} size="lg" centered>
                    <ModalHeader toggle={() => setProjectModalOpen(false)}>
                        Assign Projects to {employee.name}
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-muted mb-4">Select projects to assign to this employee</p>

                        <div className="position-relative mb-4">
                            <Search className="position-absolute text-muted" size={18} style={{ top: '50%', left: '15px', transform: 'translateY(-50%)' }} />
                            <Input
                                type="text"
                                placeholder="Search projects..."
                                className="ps-5 bg-light border-0"
                                value={projectSearchTerm}
                                onChange={(e) => setProjectSearchTerm(e.target.value)}
                            />
                        </div>

                        {projects.filter(p => p.title.toLowerCase().includes(projectSearchTerm.toLowerCase())).length > 0 ? (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {projects.filter(p => p.title.toLowerCase().includes(projectSearchTerm.toLowerCase())).map(project => {
                                    const isAssigned = employeeProjects.some(p => p.id === project.id);
                                    const isLead = project.lead === employee.name;

                                    return (
                                        <div key={project.id} className={`border rounded p-3 mb-3 ${isAssigned ? 'bg-light' : ''}`}>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <h6 className="mb-0 fw-bold">{project.title}</h6>
                                                        <Badge
                                                            color={
                                                                project.status === 'In Progress' ? 'primary' :
                                                                    project.status === 'Planning' ? 'info' :
                                                                        project.status === 'Completed' ? 'success' :
                                                                            'secondary'
                                                            }
                                                            className="px-2 py-1"
                                                        >
                                                            {project.status}
                                                        </Badge>
                                                        {isLead && (
                                                            <Badge color="warning" className="px-2 py-1">
                                                                Project Lead
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted small mb-2">{project.description}</p>
                                                    <div className="d-flex gap-3 small text-muted">
                                                        <span><Calendar size={14} className="me-1" />{project.startDate}</span>
                                                        <span><Clock size={14} className="me-1" />{project.deadline}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    {isAssigned ? (
                                                        <Badge color="success" className="px-3 py-2">
                                                            <Check size={14} className="me-1" />
                                                            Assigned
                                                        </Badge>
                                                    ) : (
                                                        <button
                                                            size="sm"
                                                            onClick={() => {
                                                                const updatedTeam = [...(project.team || []), employee.name];
                                                                updateProject(project.id, { ...project, team: updatedTeam });
                                                            }}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                                                border: 'none',
                                                                color: 'white',
                                                                fontWeight: '500',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '0.25rem',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            }}
                                                        >
                                                            <Plus size={14} className="me-1" />
                                                            Assign
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <Briefcase size={48} className="mb-3 opacity-50" />
                                <p className="mb-0">No projects available</p>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" className="border" onClick={() => setProjectModalOpen(false)}>Close</Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Project Assignment Modal */}
                <Modal
                    isOpen={removeConfirmModalOpen}
                    toggle={() => {
                        setRemoveConfirmModalOpen(false);
                        setShowUnassignConfirm(false);
                    }}
                    centered
                >
                    <ModalHeader toggle={() => {
                        setRemoveConfirmModalOpen(false);
                        setShowUnassignConfirm(false);
                    }}>
                        {showUnassignConfirm ? 'Confirm Unassignment' : 'Edit Project Assignment'}
                    </ModalHeader>
                    <ModalBody>
                        {selectedProject && (
                            <div>
                                {!showUnassignConfirm ? (
                                    // Initial view - show project details
                                    <>
                                        <div className="mb-3">
                                            <strong>Project:</strong> {selectedProject.title}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Employee:</strong> {employee.name}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Current Role:</strong>{' '}
                                            <Badge color={getProjectRole(selectedProject) === 'Project Lead' ? 'warning' : 'info'}>
                                                {getProjectRole(selectedProject)}
                                            </Badge>
                                        </div>
                                    </>
                                ) : (
                                    // Confirmation view
                                    <div className="text-center py-3">
                                        <div className="mb-4">
                                            <div className="bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
                                                <X size={32} className="text-danger" />
                                            </div>
                                        </div>
                                        <h5 className="mb-3">Unassign Employee from Project?</h5>
                                        <p className="text-muted mb-0">
                                            Are you sure you want to remove <strong>{employee.name}</strong> from <strong>{selectedProject.title}</strong>?
                                        </p>
                                        <p className="text-danger small mt-2 mb-0">
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {!showUnassignConfirm ? (
                            <>
                                <Button
                                    color="danger"
                                    outline
                                    onClick={() => setShowUnassignConfirm(true)}
                                >
                                    Unassign from Project
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => setRemoveConfirmModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    color="danger"
                                    onClick={handleConfirmRemoveFromProject}
                                >
                                    Yes, Unassign
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => setShowUnassignConfirm(false)}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </ModalFooter>
                </Modal>

                {/* Edit Reportee Assignment Modal */}
                <Modal
                    isOpen={reporteeModalOpen}
                    toggle={() => {
                        setReporteeModalOpen(false);
                        setShowReporteeUnassignConfirm(false);
                    }}
                    centered
                >
                    <ModalHeader toggle={() => {
                        setReporteeModalOpen(false);
                        setShowReporteeUnassignConfirm(false);
                    }}>
                        {showReporteeUnassignConfirm ? 'Confirm Unassignment' : 'Edit Reportee Assignment'}
                    </ModalHeader>
                    <ModalBody>
                        {selectedReportee && (
                            <div>
                                {!showReporteeUnassignConfirm ? (
                                    <>
                                        <div className="mb-3">
                                            <strong>Reportee:</strong> {selectedReportee.name}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Current Manager:</strong> {employee.name}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-3">
                                        <div className="mb-4">
                                            <div className="bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
                                                <X size={32} className="text-danger" />
                                            </div>
                                        </div>
                                        <h5 className="mb-3">Unassign Reportee?</h5>
                                        <p className="text-muted mb-0">
                                            Are you sure you want to remove <strong>{selectedReportee.name}</strong> from reporting to <strong>{employee.name}</strong>?
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {!showReporteeUnassignConfirm ? (
                            <>
                                <Button
                                    color="danger"
                                    outline
                                    onClick={() => setShowReporteeUnassignConfirm(true)}
                                >
                                    Unassign Reportee
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => setReporteeModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    color="danger"
                                    onClick={handleConfirmUnassignReportee}
                                >
                                    Yes, Unassign
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => setShowReporteeUnassignConfirm(false)}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </ModalFooter>
                </Modal>

                {/* Assign Subscription Modal */}
                <Modal isOpen={assignSubModalOpen} toggle={() => setAssignSubModalOpen(false)} size="lg" centered>
                    <ModalHeader toggle={() => setAssignSubModalOpen(false)}>
                        Assign Subscription to {employee.name}
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-muted mb-4">Select subscriptions to assign to this employee</p>

                        <div className="position-relative mb-4">
                            <Search className="position-absolute text-muted" size={18} style={{ top: '50%', left: '15px', transform: 'translateY(-50%)' }} />
                            <Input
                                type="text"
                                placeholder="Search subscriptions..."
                                className="ps-5 bg-light border-0"
                                value={subscriptionSearchTerm}
                                onChange={(e) => setSubscriptionSearchTerm(e.target.value)}
                            />
                        </div>

                        {subscriptions.filter(sub => sub.name.toLowerCase().includes(subscriptionSearchTerm.toLowerCase())).length > 0 ? (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {subscriptions.filter(sub => sub.name.toLowerCase().includes(subscriptionSearchTerm.toLowerCase())).map(sub => {
                                    const isAssigned = getEmployeeSubscriptions().some(s => s.id === sub.id);

                                    return (
                                        <div key={sub.id} className={`border rounded p-3 mb-3 ${isAssigned ? 'bg-light' : ''}`}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1 fw-bold">{sub.name}</h6>
                                                    <div className="d-flex gap-3 text-muted small">
                                                        <span>{sub.type}</span>
                                                        <span>{formatPrice(sub.price)}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    {isAssigned ? (
                                                        <Badge color="success" className="px-3 py-2">
                                                            <Check size={14} className="me-1" />
                                                            Assigned
                                                        </Badge>
                                                    ) : (
                                                        <button
                                                            size="sm"
                                                            onClick={() => {
                                                                handleAssignSubscription(sub);
                                                                setAssignSubModalOpen(false);
                                                            }}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                                                border: 'none',
                                                                color: 'white',
                                                                fontWeight: '500',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '0.25rem',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            }}
                                                        >
                                                            <Plus size={14} className="me-1" />
                                                            Assign
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <CreditCard size={48} className="mb-3 opacity-50" />
                                <p className="mb-0">No subscriptions available</p>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" className="border" onClick={() => setAssignSubModalOpen(false)}>Close</Button>
                    </ModalFooter>
                </Modal>

                {/* Assign Asset Modal */}
                <Modal isOpen={assignAssetModalOpen} toggle={() => setAssignAssetModalOpen(false)} size="lg" centered>
                    <ModalHeader toggle={() => setAssignAssetModalOpen(false)}>
                        Assign Asset to {employee.name}
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-muted mb-4">Select available assets to assign to this employee</p>

                        <div className="position-relative mb-4">
                            <Search className="position-absolute text-muted" size={18} style={{ top: '50%', left: '15px', transform: 'translateY(-50%)' }} />
                            <Input
                                type="text"
                                placeholder="Search assets by name or tag..."
                                className="ps-5 bg-light border-0"
                                value={assetSearchTerm}
                                onChange={(e) => setAssetSearchTerm(e.target.value)}
                            />
                        </div>

                        {assets.filter(a => a.status === 'Available' && (a.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) || a.assetTag.toLowerCase().includes(assetSearchTerm.toLowerCase()))).length > 0 ? (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {assets.filter(a => a.status === 'Available' && (a.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) || a.assetTag.toLowerCase().includes(assetSearchTerm.toLowerCase()))).map(asset => {
                                    const Icon = getAssetIcon(asset.type);
                                    return (
                                        <div key={asset.id} className="border rounded p-3 mb-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-light p-2 rounded">
                                                        {Icon}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-1 fw-bold">{asset.name}</h6>
                                                        <div className="d-flex gap-2 text-muted small">
                                                            <Badge color="light" className="text-dark border">{asset.assetTag}</Badge>
                                                            <span>{asset.type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    size="sm"
                                                    onClick={() => handleAssignAsset(asset.id)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                                        border: 'none',
                                                        color: 'white',
                                                        fontWeight: '500',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '0.25rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                >
                                                    <Plus size={14} className="me-1" />
                                                    Assign
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <Monitor size={48} className="mb-3 opacity-50" />
                                <p className="mb-0">No available assets found</p>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" className="border" onClick={() => setAssignAssetModalOpen(false)}>Close</Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Asset Assignment Modal */}
                <Modal
                    isOpen={assetModalOpen}
                    toggle={() => {
                        setAssetModalOpen(false);
                        setShowAssetUnassignConfirm(false);
                    }}
                    centered
                >
                    <ModalHeader toggle={() => {
                        setAssetModalOpen(false);
                        setShowAssetUnassignConfirm(false);
                    }}>
                        {showAssetUnassignConfirm ? 'Confirm Unassignment' : 'Edit Asset Assignment'}
                    </ModalHeader>
                    <ModalBody>
                        {selectedAsset && (
                            <div>
                                {!showAssetUnassignConfirm ? (
                                    <>
                                        <div className="mb-3">
                                            <strong>Asset:</strong> {selectedAsset.name}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Asset Tag:</strong> {selectedAsset.assetTag}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Assigned To:</strong> {employee.name}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-3">
                                        <div className="mb-4">
                                            <div className="bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
                                                <X size={32} className="text-danger" />
                                            </div>
                                        </div>
                                        <h5 className="mb-3">Unassign Asset?</h5>
                                        <p className="text-muted mb-0">
                                            Are you sure you want to unassign <strong>{selectedAsset.name}</strong> from <strong>{employee.name}</strong>?
                                        </p>
                                        <p className="text-muted small mt-2">
                                            The asset status will be set to "Available".
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {!showAssetUnassignConfirm ? (
                            <>
                                <Button
                                    color="danger"
                                    outline
                                    onClick={() => setShowAssetUnassignConfirm(true)}
                                >
                                    Unassign Asset
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => setAssetModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    color="danger"
                                    onClick={handleConfirmUnassignAsset}
                                >
                                    Yes, Unassign
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => setShowAssetUnassignConfirm(false)}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </ModalFooter>
                </Modal>

                {/* Assign Reportees Modal */}
                <Modal isOpen={assignReporteeModalOpen} toggle={() => setAssignReporteeModalOpen(!assignReporteeModalOpen)} centered size="lg">
                    <ModalHeader toggle={() => setAssignReporteeModalOpen(!assignReporteeModalOpen)}>Assign Reportees</ModalHeader>
                    <ModalBody>
                        <div className="position-relative mb-4">
                            <Search className="position-absolute text-muted" size={18} style={{ top: '50%', left: '15px', transform: 'translateY(-50%)' }} />
                            <Input
                                type="text"
                                placeholder="Search employees..."
                                className="ps-5 bg-light border-0"
                                value={reporteeSearchTerm}
                                onChange={(e) => setReporteeSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {employees
                                .filter(emp => emp.id.toString() !== employee.id.toString()) // Exclude self
                                .filter(emp => !employee.reportingTo || emp.id.toString() !== employee.reportingTo.toString()) // Exclude manager
                                .filter(emp => emp.name.toLowerCase().includes(reporteeSearchTerm.toLowerCase()))
                                .map(emp => {
                                    const isAssigned = selectedReporteesForAssignment.includes(emp.id.toString());
                                    return (
                                        <div key={emp.id} className="d-flex align-items-center justify-content-between p-3 border-bottom hover-bg-light">
                                            <div className="d-flex align-items-center gap-3 flex-grow-1">
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold text-dark">{emp.name}</div>
                                                    <div className="d-flex gap-2 align-items-center">
                                                        <small className="text-muted">{emp.role}</small>
                                                        <small className="text-muted">•</small>
                                                        <small className="text-muted">{emp.department}</small>
                                                    </div>
                                                    <small className="text-muted">{emp.email}</small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                {emp.reportingTo && emp.reportingTo.toString() !== employee.id.toString() && (
                                                    <Badge color="warning" pill className="small bg-opacity-10 text-warning border border-warning">
                                                        Reports to {getManagerName(emp.reportingTo)}
                                                    </Badge>
                                                )}
                                                <button
                                                    size="sm"
                                                    onClick={() => toggleReporteeSelection(emp.id)}
                                                    className="d-flex align-items-center gap-1"
                                                    style={{
                                                        background: isAssigned ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                                        border: 'none',
                                                        color: 'white',
                                                        fontWeight: '500',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '0.25rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    {isAssigned ? (
                                                        <>
                                                            <Check size={14} />
                                                            Assigned
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus size={14} />
                                                            Assign
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            {employees.filter(emp => emp.id.toString() !== employee.id.toString()).length === 0 && (
                                <div className="text-center py-4 text-muted">
                                    No other employees available to assign.
                                </div>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" className="border" onClick={() => setAssignReporteeModalOpen(false)}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        </>
    );
};

export default EmployeeProfile;
