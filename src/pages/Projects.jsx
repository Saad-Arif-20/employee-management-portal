import React, { useState } from 'react';
import {
    Card,
    CardBody,
    Badge,
    Button,
    Row,
    Col,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Input
} from 'reactstrap';
import { Plus, MoreVertical, Calendar, Clock, Users, Save, X, Edit, Trash2, Search } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

const TeamMemberAvatar = ({ member, idx }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#e2e8f0',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: '600',
                color: '#475569',
                marginLeft: idx > 0 ? '-8px' : '0',
                zIndex: 3 - idx,
                transition: 'transform 0.2s ease',
                position: 'relative',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                setShowTooltip(true);
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                setShowTooltip(false);
            }}
        >
            {member.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            {showTooltip && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '8px',
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    {member}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: '-4px',
                        borderWidth: '4px',
                        borderStyle: 'solid',
                        borderColor: '#333 transparent transparent transparent'
                    }} />
                </div>
            )}
        </div>
    );
};

const Projects = () => {
    const { projects, removeProject, addProject, updateProject, employees } = useGlobal();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [originalStartDate, setOriginalStartDate] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Planning',
        startDate: '',
        deadline: '',
        lead: '',
        team: [],
        completedDate: null
    });
    const [errors, setErrors] = useState({});
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [leadSearchTerm, setLeadSearchTerm] = useState('');
    const [teamSearchTerm, setTeamSearchTerm] = useState('');
    const [originalTeamMembers, setOriginalTeamMembers] = useState([]);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const [statusFilter, setStatusFilter] = useState('All');
    const [deadlineFilter, setDeadlineFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const confirmDelete = (projectId) => {
        setProjectToDelete(projectId);
        setDeleteModalOpen(true);
    };

    const handleDeleteProject = () => {
        if (projectToDelete) {
            removeProject(projectToDelete);
            setDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    const toggleModal = () => {
        const willClose = isModalOpen;
        setIsModalOpen(!isModalOpen);
        setErrors({});
        setLeadSearchTerm('');
        setTeamSearchTerm('');
        if (willClose) {
            setOriginalTeamMembers([]);
        }
    };

    const handleNewClick = () => {
        setFormData({
            title: '',
            description: '',
            status: 'Planning',
            startDate: '',
            deadline: '',
            lead: '',
            team: [],
            completedDate: null
        });
        setIsEditMode(false);
        setEditingProjectId(null);
        setOriginalStartDate('');
        setOriginalTeamMembers([]);
        toggleModal();
    };

    const handleEditClick = (project) => {
        setFormData({
            title: project.title || '',
            description: project.description || '',
            status: project.status || 'Planning',
            startDate: project.startDate || '',
            deadline: project.deadline || '',
            lead: project.lead || '',
            team: project.team || [],
            completedDate: project.completedDate || null
        });
        setIsEditMode(true);
        setEditingProjectId(project.id);
        setOriginalStartDate(project.startDate || '');
        setOriginalTeamMembers(project.team || []);
        toggleModal();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'primary';
            case 'Planning': return 'info';
            case 'On Hold': return 'warning';
            case 'Completed': return 'success';
            case 'Removed': return 'danger';
            default: return 'secondary';
        }
    };

    const validate = () => {
        const newErrors = {};
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const threeMonthsFromToday = new Date(today);
        threeMonthsFromToday.setMonth(threeMonthsFromToday.getMonth() + 3);
        const maxYear = threeMonthsFromToday.getFullYear();
        const maxMonth = String(threeMonthsFromToday.getMonth() + 1).padStart(2, '0');
        const maxDay = String(threeMonthsFromToday.getDate()).padStart(2, '0');
        const maxDeadlineStr = `${maxYear}-${maxMonth}-${maxDay}`;

        if (!formData.title) newErrors.title = 'Project title is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        } else if (formData.startDate < todayStr && !isEditMode) {
            newErrors.startDate = 'Start date cannot be in the past';
        } else if (isEditMode && originalStartDate && formData.startDate < originalStartDate) {
            newErrors.startDate = 'Start date cannot be earlier than the original start date';
        }
        if (!formData.deadline) {
            newErrors.deadline = 'Deadline is required';
        } else if (formData.deadline <= formData.startDate) {
            newErrors.deadline = 'Deadline must be after start date';
        } else if (formData.deadline > maxDeadlineStr) {
            newErrors.deadline = 'Deadline cannot be more than 3 months from today';
        }
        if (!formData.lead) newErrors.lead = 'Project lead is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const toggleTeamMember = (employee) => {
        if (employee.status !== 'Active') {
            setWarningMessage(`${employee.name} is ${employee.status} and cannot be added to the project team.`);
            setWarningModalOpen(true);
            return;
        }
        setFormData(prev => {
            const isSelected = prev.team.includes(employee.name);
            if (isSelected) {
                return { ...prev, team: prev.team.filter(name => name !== employee.name) };
            } else {
                return { ...prev, team: [...prev.team, employee.name] };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const submissionData = { ...formData };

            if (submissionData.status === 'Completed') {
                if (!submissionData.completedDate) {
                    submissionData.completedDate = new Date().toISOString();
                }
            } else {
                submissionData.completedDate = null;
            }

            if (isEditMode) {
                updateProject(editingProjectId, submissionData);
            } else {
                addProject(submissionData);
            }
            toggleModal();
        }
    };

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const threeMonthsFromToday = new Date(today);
    threeMonthsFromToday.setMonth(threeMonthsFromToday.getMonth() + 3);
    const maxYear = threeMonthsFromToday.getFullYear();
    const maxMonth = String(threeMonthsFromToday.getMonth() + 1).padStart(2, '0');
    const maxDay = String(threeMonthsFromToday.getDate()).padStart(2, '0');
    const maxDeadlineStr = `${maxYear}-${maxMonth}-${maxDay}`;

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Projects</h2>
                    <p className="text-muted">Track and manage ongoing projects.</p>
                </div>
                <Button
                    className="d-flex align-items-center gap-2 shadow-sm"
                    onClick={handleNewClick}
                    style={{
                        background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '500'
                    }}
                >
                    <Plus size={18} />
                    <span>New Project</span>
                </Button>
            </div>

            {/* Filters */}
            <div className="mb-4 d-flex gap-3 align-items-center flex-wrap">
                <div style={{ minWidth: '300px', maxWidth: '350px' }}>
                    <Label className="fw-medium mb-2">Search Projects</Label>
                    <div className="position-relative">
                        <Search size={16} className="text-muted position-absolute" style={{ top: '10px', left: '10px' }} />
                        <Input
                            placeholder="Search by project name..."
                            className="ps-5"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}
                        />
                    </div>
                </div>
                <div style={{ minWidth: '200px' }}>
                    <Label className="fw-medium mb-2">Filter by Status</Label>
                    <UncontrolledDropdown>
                        <DropdownToggle
                            caret
                            className="w-100 text-start d-flex justify-content-between align-items-center"
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                padding: '0.375rem 0.75rem',
                                color: '#6c757d'
                            }}
                        >
                            {statusFilter === 'All' ? 'All Statuses' : statusFilter}
                        </DropdownToggle>
                        <DropdownMenu className="w-100">
                            <DropdownItem onClick={() => setStatusFilter('All')}>All Statuses</DropdownItem>
                            <DropdownItem onClick={() => setStatusFilter('Planning')}>Planning</DropdownItem>
                            <DropdownItem onClick={() => setStatusFilter('In Progress')}>In Progress</DropdownItem>
                            <DropdownItem onClick={() => setStatusFilter('On Hold')}>On Hold</DropdownItem>
                            <DropdownItem onClick={() => setStatusFilter('Completed')}>Completed</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>
                <div style={{ minWidth: '280px' }}>
                    <Label className="fw-medium mb-2">Filter by Deadline</Label>
                    <UncontrolledDropdown>
                        <DropdownToggle
                            caret
                            className="w-100 text-start d-flex justify-content-between align-items-center"
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                padding: '0.375rem 0.75rem',
                                color: '#6c757d'
                            }}
                        >
                            {deadlineFilter === 'All' ? 'All Deadlines' :
                                deadlineFilter === 'Overdue' ? 'Overdue' :
                                    'Deadline Approaching (7 days)'}
                        </DropdownToggle>
                        <DropdownMenu className="w-100">
                            <DropdownItem onClick={() => setDeadlineFilter('All')}>All Deadlines</DropdownItem>
                            <DropdownItem onClick={() => setDeadlineFilter('Overdue')}>Overdue</DropdownItem>
                            <DropdownItem onClick={() => setDeadlineFilter('Approaching')}>Deadline Approaching (7 days)</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>
                {(statusFilter !== 'All' || deadlineFilter !== 'All' || searchQuery !== '') && (
                    <Button
                        color="light"
                        size="sm"
                        onClick={() => {
                            setStatusFilter('All');
                            setDeadlineFilter('All');
                            setSearchQuery('');
                        }}
                        style={{ marginTop: '28px' }}
                    >
                        Clear Filters
                    </Button>
                )}
            </div>

            <Row className="g-4">
                {projects.filter(project => {
                    if (searchQuery !== '') {
                        const query = searchQuery.toLowerCase();
                        const titleMatch = project.title.toLowerCase().includes(query);
                        if (!titleMatch) {
                            return false;
                        }
                    }

                    if (statusFilter !== 'All' && project.status !== statusFilter) {
                        return false;
                    }

                    if (deadlineFilter !== 'All') {
                        const deadline = new Date(project.deadline);
                        const today = new Date();
                        const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

                        if (deadlineFilter === 'Overdue' && (daysRemaining > 0 || project.status === 'Completed')) {
                            return false;
                        }
                        if (deadlineFilter === 'Approaching' && (daysRemaining > 7 || daysRemaining <= 0 || project.status === 'Completed')) {
                            return false;
                        }
                    }

                    return true;
                }).map(project => {
                    const deadline = new Date(project.deadline);
                    const today = new Date();
                    const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

                    const statusConfig = {
                        'In Progress': {
                            color: '#ffffff',
                            badgeBg: 'rgba(255, 255, 255, 0.2)',
                            bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderColor: '#10b981',
                            textColor: '#ffffff'
                        },
                        'Planning': {
                            color: '#ffffff',
                            badgeBg: 'rgba(255, 255, 255, 0.2)',
                            bgGradient: 'linear-gradient(135deg, #81C14B 0%, #6da83d 100%)',
                            borderColor: '#81C14B',
                            textColor: '#ffffff'
                        },
                        'On Hold': {
                            color: '#ffffff',
                            badgeBg: 'rgba(255, 255, 255, 0.2)',
                            bgGradient: 'linear-gradient(135deg, rgba(214, 163, 35, 1) 0%, rgb(191, 170, 60) 100%)',
                            borderColor: 'rgb(251, 191, 36)',
                            textColor: '#ffffff'
                        },
                        'Completed': {
                            color: '#ffffff',
                            badgeBg: 'rgba(255, 255, 255, 0.2)',
                            bgGradient: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                            borderColor: '#0d3b2e',
                            textColor: '#ffffff'
                        }
                    };

                    const config = statusConfig[project.status] || statusConfig['Planning'];

                    return (
                        <Col key={project.id} md={6} xl={4}>
                            <Card
                                className="glass-card border-0 h-100 project-card-modern"
                                style={{
                                    overflow: 'visible',
                                    background: config.bgGradient,
                                    borderLeft: `4px solid ${config.color}`,
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '100px',
                                    height: '100px',
                                    background: `radial-gradient(circle at top right, ${config.color}15 0%, transparent 70%)`,
                                    pointerEvents: 'none',
                                    borderTopRightRadius: '0.5rem'
                                }} />

                                <CardBody className="d-flex flex-column position-relative" style={{ zIndex: 1 }}>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex gap-2 flex-wrap">
                                            <span
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    fontSize: '0.75rem',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '50px',
                                                    border: 'none',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {project.status}
                                            </span>
                                            {/* Deadline Warning Badge */}
                                            {daysRemaining <= 7 && daysRemaining > 0 && project.status !== 'Completed' && (
                                                <Badge
                                                    style={{
                                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)',
                                                        backgroundSize: '200% 200%',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        fontSize: '0.75rem',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '50px',
                                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                                        border: 'none',
                                                    }}
                                                >
                                                    ⚠️ Deadline Approaching
                                                </Badge>
                                            )}
                                            {daysRemaining <= 0 && project.status !== 'Completed' && (
                                                <Badge
                                                    style={{
                                                        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #dc2626 100%)',
                                                        backgroundSize: '200% 200%',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        fontSize: '0.75rem',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '50px',
                                                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.5)',
                                                        border: 'none',
                                                    }}
                                                >
                                                    🚨 Overdue
                                                </Badge>
                                            )}
                                        </div>
                                        <UncontrolledDropdown>
                                            <DropdownToggle
                                                tag="span"
                                                className="cursor-pointer p-2 rounded-circle"
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <MoreVertical size={18} color="#ffffff" />
                                            </DropdownToggle>
                                            <DropdownMenu
                                                style={{
                                                    zIndex: 1050,
                                                    minWidth: '180px',
                                                    position: 'fixed',
                                                    inset: 'auto auto auto auto',
                                                    transform: 'translateX(-100%)'
                                                }}
                                            >
                                                <DropdownItem onClick={() => handleEditClick(project)}>
                                                    <Edit size={14} className="me-2" />
                                                    Edit Details
                                                </DropdownItem>
                                                <DropdownItem className="text-danger" onClick={() => confirmDelete(project.id)}>
                                                    <Trash2 size={14} className="me-2" />
                                                    Remove Project
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </UncontrolledDropdown>
                                    </div>

                                    {/* Project title and description */}
                                    <h5 className="fw-bold mb-2" style={{ color: '#ffffff', fontSize: '1.3rem' }}>
                                        {project.title}
                                    </h5>
                                    <p className="mb-3 flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'rgba(255, 255, 255, 0.8)' }}>
                                        {project.description}
                                    </p>

                                    {/* Timeline info */}
                                    <div className="mb-3" style={{
                                        backgroundColor: 'rgba(233, 230, 230, 0.57)',
                                        borderRadius: '12px',
                                        padding: '0.875rem',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        backgroundColor: `${config.color}50`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Calendar size={16} color={config.color} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: '#334155', fontWeight: '600' }}>
                                                            Start Date
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '600' }}>
                                                            {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        backgroundColor: daysRemaining <= 7 && daysRemaining > 0 && project.status !== 'Completed'
                                                            ? 'rgba(220, 38, 38, 0.25)'
                                                            : daysRemaining <= 0 && project.status !== 'Completed'
                                                                ? 'rgba(220, 38, 38, 0.25)'
                                                                : `${config.color}30`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Clock size={16} color={
                                                            daysRemaining <= 7 && daysRemaining > 0 && project.status !== 'Completed'
                                                                ? '#dc2626'
                                                                : daysRemaining <= 0 && project.status !== 'Completed'
                                                                    ? '#dc2626'
                                                                    : config.color
                                                        } />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: '#334155', fontWeight: '600' }}>
                                                            {project.status === 'Completed' ? 'Completed' : 'Deadline'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.8rem',
                                                            color: daysRemaining <= 7 && project.status !== 'Completed' ? '#dc2626' : '#1e293b',
                                                            fontWeight: '700'
                                                        }}>
                                                            {project.status === 'Completed' && project.completedDate
                                                                ? new Date(project.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                : new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                {project.status !== 'Completed' && (
                                                    <div style={{
                                                        backgroundColor: daysRemaining <= 7 && daysRemaining > 0
                                                            ? 'rgba(220, 38, 38, 0.15)'
                                                            : daysRemaining <= 0
                                                                ? 'rgba(220, 38, 38, 0.15)'
                                                                : 'rgba(30, 41, 59, 0.1)',
                                                        color: daysRemaining <= 7 && daysRemaining > 0
                                                            ? '#dc2626'
                                                            : daysRemaining <= 0
                                                                ? '#dc2626'
                                                                : '#1e293b',
                                                        padding: '0.25rem 0.6rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        {daysRemaining > 0 ? `${daysRemaining}d left` : 'Overdue'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team section */}
                                    <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                        {/* Project Lead */}
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#ffffff',
                                                    fontWeight: '600',
                                                    fontSize: '0.875rem',
                                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                    {project.lead.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
                                                        Project Lead
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>
                                                        {project.lead}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Team members */}
                                        <div className="d-flex align-items-center justify-content-between mt-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="d-flex" style={{ marginLeft: '0' }}>
                                                    {project.team.slice(0, 3).map((member, idx) => (
                                                        <TeamMemberAvatar key={idx} member={member} idx={idx} />
                                                    ))}
                                                    {project.team.length > 3 && (
                                                        <div
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '50%',
                                                                backgroundColor: '#cbd5e1',
                                                                border: '2px solid white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '700',
                                                                color: '#475569',
                                                                marginLeft: '-8px',
                                                                zIndex: 0
                                                            }}
                                                        >
                                                            +{project.team.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <small className="ms-1" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>
                                                    {project.team.length === 0 ? 'No team members' : `${project.team.length} member${project.team.length !== 1 ? 's' : ''}`}
                                                </small>
                                            </div>
                                            <div
                                                className="d-flex align-items-center gap-1"
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                    padding: '0.35rem 0.7rem',
                                                    borderRadius: '8px',
                                                    backdropFilter: 'blur(4px)'
                                                }}
                                            >
                                                <Users size={14} color="#ffffff" />
                                                <small style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffffff' }}>
                                                    {project.team.length + 1}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Project Modal */}
            <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" centered>
                <ModalHeader toggle={toggleModal}>
                    {isEditMode ? 'Edit Project Details' : 'Create New Project'}
                </ModalHeader>
                <ModalBody className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="title" className="fw-medium">Project Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="e.g. Website Redesign"
                                        value={formData.title}
                                        onChange={handleChange}
                                        invalid={!!errors.title}
                                    />
                                    {errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="status" className="fw-medium">Status</Label>
                                    <UncontrolledDropdown>
                                        <DropdownToggle
                                            caret
                                            className="w-100 text-start d-flex justify-content-between align-items-center"
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #ced4da',
                                                backgroundColor: 'white',
                                                padding: '0.375rem 0.75rem',
                                                color: '#495057',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {formData.status}
                                        </DropdownToggle>
                                        <DropdownMenu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <DropdownItem
                                                onClick={() => setFormData(prev => ({ ...prev, status: 'Planning' }))}
                                            >
                                                Planning
                                            </DropdownItem>
                                            <DropdownItem
                                                onClick={() => setFormData(prev => ({ ...prev, status: 'In Progress' }))}
                                            >
                                                In Progress
                                            </DropdownItem>
                                            <DropdownItem
                                                onClick={() => setFormData(prev => ({ ...prev, status: 'On Hold' }))}
                                            >
                                                On Hold
                                            </DropdownItem>
                                            <DropdownItem
                                                onClick={() => setFormData(prev => ({ ...prev, status: 'Completed' }))}
                                            >
                                                Completed
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="description" className="fw-medium">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        type="textarea"
                                        rows="3"
                                        placeholder="Brief description of the project..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        invalid={!!errors.description}
                                    />
                                    {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="startDate" className="fw-medium">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        min={isEditMode ? originalStartDate : todayStr}
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        invalid={!!errors.startDate}
                                    />
                                    {errors.startDate && <div className="invalid-feedback d-block">{errors.startDate}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="deadline" className="fw-medium">Deadline</Label>
                                    <Input
                                        id="deadline"
                                        name="deadline"
                                        type="date"
                                        min={formData.startDate || todayStr}
                                        max={maxDeadlineStr}
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        invalid={!!errors.deadline}
                                    />
                                    {errors.deadline && <div className="invalid-feedback d-block">{errors.deadline}</div>}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label className="fw-medium">Project Lead</Label>
                                    <div className="position-relative mb-2">
                                        <Search size={16} className="text-muted position-absolute" style={{ top: '10px', left: '10px' }} />
                                        <Input
                                            placeholder="Search employees..."
                                            className="ps-5"
                                            value={leadSearchTerm}
                                            onChange={(e) => setLeadSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="border rounded bg-white p-2" style={{ height: '150px', overflowY: 'auto' }}>
                                        {employees
                                            .filter(emp => emp.status === 'Active')
                                            .filter(emp =>
                                                emp.name.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
                                                emp.role.toLowerCase().includes(leadSearchTerm.toLowerCase())
                                            )
                                            .map(emp => {
                                                const isSelected = formData.lead === emp.name;
                                                return (
                                                    <div
                                                        key={emp.id}
                                                        className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, lead: emp.name }));
                                                            if (errors.lead) {
                                                                setErrors(prev => ({ ...prev, lead: '' }));
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className={`d-flex align-items-center justify-content-center rounded-circle border me-3 ${isSelected ? 'bg-primary border-primary' : 'bg-white border-secondary'}`}
                                                            style={{ width: '20px', height: '20px', minWidth: '20px' }}
                                                        >
                                                            {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white' }} />}
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium text-dark">{emp.name}</div>
                                                            <small className="text-muted">{emp.role}</small>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    {errors.lead && <div className="text-danger small mt-1">{errors.lead}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label className="fw-medium">Team Members</Label>
                                    <div className="position-relative mb-2">
                                        <Search size={16} className="text-muted position-absolute" style={{ top: '10px', left: '10px' }} />
                                        <Input
                                            placeholder="Search team members..."
                                            className="ps-5"
                                            value={teamSearchTerm}
                                            onChange={(e) => setTeamSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="border rounded bg-white p-2" style={{ height: '150px', overflowY: 'auto' }}>
                                        {employees
                                            .filter(emp => emp.status === 'Active')
                                            .filter(emp => {
                                                const isLead = formData.lead === emp.name;
                                                if (isLead) return false;
                                                return emp.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                                                    emp.role.toLowerCase().includes(teamSearchTerm.toLowerCase());
                                            })
                                            .sort((a, b) => {
                                                const aSelected = originalTeamMembers.includes(a.name);
                                                const bSelected = originalTeamMembers.includes(b.name);
                                                if (aSelected && !bSelected) return -1;
                                                if (!aSelected && bSelected) return 1;
                                                return 0;
                                            })
                                            .map(emp => {
                                                const isSelected = formData.team.includes(emp.name);
                                                return (
                                                    <div
                                                        key={emp.id}
                                                        className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                                        onClick={() => toggleTeamMember(emp)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }}
                                                            className="me-3"
                                                        />
                                                        <div>
                                                            <div className="fw-medium text-dark">{emp.name}</div>
                                                            <small className="text-muted">{emp.role}</small>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    <small className="text-muted mt-1 d-block">
                                        Click to select/deselect. Selected: {formData.team.length}
                                    </small>
                                </FormGroup>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end gap-3 mt-4">
                            <Button color="light" className="d-flex align-items-center gap-2 border" onClick={toggleModal} type="button">
                                <X size={18} />
                                <span>Cancel</span>
                            </Button>
                            <Button
                                type="submit"
                                className="d-flex align-items-center gap-2 px-4"
                                style={{
                                    background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: '500'
                                }}
                            >
                                <Save size={18} />
                                <span>{isEditMode ? 'Confirm Changes' : 'Create Project'}</span>
                            </Button>
                        </div>
                    </Form>
                </ModalBody>
            </Modal>

            {/* Warning Modal */}
            <Modal isOpen={warningModalOpen} toggle={() => setWarningModalOpen(false)}>
                <ModalHeader toggle={() => setWarningModalOpen(false)}>Warning</ModalHeader>
                <ModalBody>{warningMessage}</ModalBody>
                <ModalFooter>
                    <Button
                        onClick={() => setWarningModalOpen(false)}
                        style={{
                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '500'
                        }}
                    >
                        OK
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)}>
                <ModalHeader toggle={() => setDeleteModalOpen(false)}>Confirm Delete</ModalHeader>
                <ModalBody>
                    Are you sure you want to delete this project? This action cannot be undone.
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button color="danger" onClick={handleDeleteProject}>Delete</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default Projects;
