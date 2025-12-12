import React, { useState, useMemo } from 'react';
import {
    Card, CardBody, Button, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, InputGroup, InputGroupText, CardTitle,
    UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import { Plus, CheckCircle, XCircle, Globe, Server, Shield, UserPlus, Check, Search, PlayCircle, PauseCircle, Trash2, Edit, MoreVertical, Briefcase } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

const AvatarItem = ({ emp, idx }) => {
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
                zIndex: 4 - idx,
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
            {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
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
                    {emp.name}
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

const Subscriptions = () => {
    const { subscriptions, addSubscription, updateSubscription, removeSubscription, employees, projects } = useGlobal();
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSubscriptionId, setEditingSubscriptionId] = useState(null);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [projectSearch, setProjectSearch] = useState('');
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        type: 'Software',
        selectedProjects: []
    });

    const getIcon = (type) => {
        switch (type) {
            case 'Infrastructure': return Server;
            case 'Security': return Shield;
            case 'Services': return Briefcase;
            default: return Globe;
        }
    };

    // Helper function to format price with commas
    const formatPrice = (price) => {
        // Extract numeric value from price string (e.g., "$2500/mo" -> "2500")
        const match = price.match(/\$([\d.]+)\/mo/);
        if (!match) return price;

        const numericValue = match[1];
        const parts = numericValue.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedNumber = parts.join('.');

        return `$${formattedNumber}/mo`;
    };

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        setErrors({});
        // Reset form when closing
        if (modalOpen) {
            setFormData({
                name: '',
                price: '',
                type: 'Software',
                selectedProjects: []
            });
            setIsEditMode(false);
            setEditingSubscriptionId(null);
        }
    };

    const handleEditClick = (sub) => {
        // Extract numeric value from price for editing
        const match = sub.price.match(/\$([/\d.,]+)\/mo/);
        const numericPrice = match ? match[1].replace(/,/g, '') : '';

        setFormData({
            name: sub.name,
            price: numericPrice,
            type: sub.type,
            selectedProjects: sub.selectedProjects || []
        });
        setIsEditMode(true);
        setEditingSubscriptionId(sub.id);
        setModalOpen(true);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'Subscription name is required';
        } else if (!/[a-zA-Z]/.test(formData.name)) {
            newErrors.name = 'Subscription name must contain at least one letter';
        }

        if (!formData.price || formData.price.trim() === '') {
            newErrors.price = 'Price is required';
        } else {
            const numericPrice = Number(formData.price.replace(/,/g, ''));
            if (isNaN(numericPrice) || numericPrice <= 0) {
                newErrors.price = 'Price must be a positive number';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'price') {
            // Remove all non-digit characters except decimal point
            let numericValue = value.replace(/[^\d.]/g, '');

            // Ensure only one decimal point
            const parts = numericValue.split('.');
            if (parts.length > 2) {
                numericValue = parts[0] + '.' + parts.slice(1).join('');
            }

            // Limit to 2 decimal places
            if (parts.length === 2 && parts[1].length > 2) {
                numericValue = parts[0] + '.' + parts[1].substring(0, 2);
            }

            // Format with commas
            const finalParts = numericValue.split('.');
            finalParts[0] = finalParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const formattedValue = finalParts.join('.');

            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        // Remove commas before saving
        const numericPrice = formData.price.replace(/,/g, '');
        const submissionData = {
            ...formData,
            price: `$${numericPrice}/mo`
        };

        if (isEditMode) {
            // Update existing subscription
            const existingSub = subscriptions.find(s => s.id === editingSubscriptionId);
            updateSubscription({
                ...existingSub,
                ...submissionData
            });
        } else {
            // Add new subscription
            submissionData.status = 'Active';
            addSubscription(submissionData);
        }

        toggleModal();
    };

    const openAssignModal = (sub) => {
        setSelectedSubscription(sub);
        // Ensure backward compatibility or initialize as empty
        const currentAssignments = sub.assignedTo || [];
        // Normalize to array of objects if it was array of strings (migration on the fly)
        const normalizedAssignments = currentAssignments.map(item =>
            typeof item === 'string' ? { employeeId: item, date: new Date().toISOString().split('T')[0] } : item
        );
        // Store only employee IDs for selection logic
        setAssignedEmployees(normalizedAssignments.map(a => a.employeeId));
        setAssignModalOpen(true);
        setEmployeeSearch('');
    };

    const toggleAssignModal = () => {
        setAssignModalOpen(!assignModalOpen);
        if (assignModalOpen) {
            setSelectedSubscription(null);
            setAssignedEmployees([]);
        }
    };

    const toggleEmployeeAssignment = (employeeId) => {
        setAssignedEmployees(prev => {
            const exists = prev.includes(employeeId);
            if (exists) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const handleAssignSubmit = () => {
        if (selectedSubscription) {
            // Ensure backward compatibility and new structure
            const updatedAssignedTo = assignedEmployees.map(empId => {
                const existingAssignment = selectedSubscription.assignedTo?.find(a =>
                    (typeof a === 'string' ? a : a.employeeId) === empId
                );

                if (existingAssignment && typeof existingAssignment !== 'string') {
                    return existingAssignment;
                }

                return {
                    employeeId: empId,
                    date: new Date().toISOString().split('T')[0],
                    status: 'Active'
                };
            });

            updateSubscription({
                ...selectedSubscription,
                assignedTo: updatedAssignedTo
            });
            toggleAssignModal();
        }
    };

    const handleToggleStatus = (subscription) => {
        const newStatus = subscription.status === 'Paused' ? 'Active' : 'Paused';
        updateSubscription({
            ...subscription,
            status: newStatus
        });
    };

    const confirmDelete = (subscription) => {
        setSubscriptionToDelete(subscription);
        setConfirmDeleteModalOpen(true);
    };

    const handleDeleteSubscription = () => {
        if (subscriptionToDelete) {
            removeSubscription(subscriptionToDelete.id);
            setConfirmDeleteModalOpen(false);
            setSubscriptionToDelete(null);
        }
    };

    const filteredEmployees = useMemo(() =>
        employees.filter(emp =>
            emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
            emp.role.toLowerCase().includes(employeeSearch.toLowerCase())
        ),
        [employees, employeeSearch]
    );

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Subscriptions & Services</h2>
                    <p className="text-muted">Manage company software subscriptions and client services.</p>
                </div>
                <Button
                    className="d-flex align-items-center gap-2 shadow-sm"
                    onClick={toggleModal}
                    style={{
                        background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '500'
                    }}
                >
                    <Plus size={18} />
                    <span>Add Subscription</span>
                </Button>
            </div>

            <Row className="g-4">
                {subscriptions.map((sub) => {
                    const Icon = getIcon(sub.type);

                    // Type-based styling - Bold gradients matching Dashboard style
                    const typeConfig = {
                        'Software': {
                            color: '#ffffff',
                            gradient: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                            iconBg: 'rgba(255, 255, 255, 0.15)',
                            borderColor: '#0d3b2e',
                            textColor: '#ffffff'
                        },
                        'Infrastructure': {
                            color: '#ffffff',
                            gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                            iconBg: 'rgba(255, 255, 255, 0.15)',
                            borderColor: '#14b8a6',
                            textColor: '#ffffff'
                        },
                        'Security': {
                            color: '#ffffff',
                            gradient: 'linear-gradient(135deg, #bb4646ff 0%, #dc2626 100%)',
                            iconBg: 'rgba(255, 255, 255, 0.15)',
                            borderColor: '#ef4444',
                            textColor: '#ffffff'
                        },
                        'Services': {
                            color: '#ffffff',
                            gradient: 'linear-gradient(135deg, #81C14B 0%, #6da83d 100%)',
                            iconBg: 'rgba(255, 255, 255, 0.15)',
                            borderColor: '#84cc16',
                            textColor: '#ffffff'
                        }
                    };

                    const config = typeConfig[sub.type] || typeConfig['Software'];
                    const assignedEmployeesList = sub.assignedTo || [];
                    const activeEmployees = assignedEmployeesList.filter(a =>
                        (typeof a === 'string' ? true : a.status === 'Active')
                    );

                    // Filter active projects (exclude On Hold, Completed, Removed)
                    const activeProjectsList = (sub.selectedProjects || []).filter(projectId => {
                        const project = projects.find(p => p.id === projectId);
                        return project && !['On Hold', 'Completed', 'Removed'].includes(project.status);
                    });

                    return (
                        <Col key={sub.id} md={6} xl={4}>
                            <Card
                                className="glass-card border-0 h-100 subscription-card-modern"
                                style={{
                                    background: config.gradient,
                                    borderLeft: `4px solid ${config.borderColor}`,
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    opacity: sub.status === 'Paused' ? 0.7 : 1
                                }}
                            >
                                {/* Clipping container for decorative elements */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    pointerEvents: 'none',
                                    zIndex: 0
                                }}>
                                    {/* Decorative gradient accent */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '120px',
                                        height: '120px',
                                        background: `radial-gradient(circle at top right, ${config.color}15 0%, transparent 70%)`,
                                        borderTopRightRadius: '0.5rem'
                                    }} />
                                </div>

                                <CardBody className="d-flex flex-column position-relative" style={{ zIndex: 1 }}>
                                    {/* Header with icon and actions */}
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '16px',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)'
                                            }}>
                                                <Icon size={28} color="white" />
                                            </div>
                                            <div>
                                                <CardTitle tag="h5" className="mb-1 fw-bold" style={{ color: '#ffffff', fontSize: '1.1rem' }}>
                                                    {sub.name}
                                                </CardTitle>
                                                <span
                                                    style={{
                                                        backgroundColor: 'rgba(67, 75, 83, 0.25)',
                                                        color: '#ffffff',
                                                        fontWeight: '700',
                                                        fontSize: '0.7rem',
                                                        padding: '0.3rem 0.8rem',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                        borderRadius: '4px',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    {sub.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            {sub.status === 'Paused' && (
                                                <div
                                                    style={{
                                                        backgroundColor: '#f59e0b',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    <PauseCircle size={14} />
                                                    SUBSCRIPTION PAUSED
                                                </div>
                                            )}
                                            <UncontrolledDropdown style={{ position: 'relative', zIndex: 5 }}>
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
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <MoreVertical size={18} color="#ffffff" />
                                                </DropdownToggle>
                                                <DropdownMenu
                                                    style={{
                                                        minWidth: '200px',
                                                        zIndex: 1050,
                                                        position: 'fixed',
                                                        inset: 'auto auto auto auto',
                                                        transform: 'translateX(-100%)'
                                                    }}
                                                >
                                                    <DropdownItem onClick={() => handleEditClick(sub)}>
                                                        <Edit size={14} className="me-2" />
                                                        Edit Subscription
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => handleToggleStatus(sub)}>
                                                        {sub.status === 'Paused' ? <PlayCircle size={14} className="me-2" /> : <PauseCircle size={14} className="me-2" />}
                                                        {sub.status === 'Paused' ? 'Resume' : 'Pause'} Subscription
                                                    </DropdownItem>
                                                    <DropdownItem className="text-danger" onClick={() => confirmDelete(sub)}>
                                                        <Trash2 size={14} className="me-2" />
                                                        Delete Subscription
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                        </div>
                                    </div>

                                    {/* Pricing section */}
                                    <div className="mb-3" style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.75)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Monthly Cost
                                                </div>
                                                <div style={{
                                                    fontSize: '1.75rem',
                                                    fontWeight: '700',
                                                    color: '#1e293b',
                                                    lineHeight: '1'
                                                }}>
                                                    {formatPrice(sub.price)}
                                                </div>
                                            </div>
                                            <div style={{
                                                backgroundColor: activeProjectsList.length > 0 ? '#e2e8f0' : '#e2e8f0',
                                                color: '#1e293b',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '10px',
                                                textAlign: 'center',
                                                border: '1px solid #cbd5e1'
                                            }}>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: '1' }}>
                                                    {activeProjectsList.length}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '600', marginTop: '2px' }}>
                                                    {activeProjectsList.length === 1 ? 'PROJECT' : 'PROJECTS'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Projects section */}
                                    <div className="mb-3" style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                                    }}>
                                        {activeProjectsList.length > 0 ? (
                                            <>
                                                <small className="fw-bold d-block mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.5px', color: '#334155', textTransform: 'uppercase' }}>
                                                    Active in Projects
                                                </small>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {activeProjectsList.slice(0, 2).map(projectId => {
                                                        const project = projects.find(p => p.id === projectId);
                                                        return project ? (
                                                            <div
                                                                key={projectId}
                                                                style={{
                                                                    backgroundColor: '#ffffff',
                                                                    color: '#0f172a',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '6px',
                                                                    fontWeight: '600',
                                                                    fontSize: '0.75rem',
                                                                    padding: '0.35rem 0.75rem',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                    display: 'inline-block'
                                                                }}
                                                            >
                                                                {project.title}
                                                            </div>
                                                        ) : null;
                                                    })}
                                                    {activeProjectsList.length > 2 && (
                                                        <div
                                                            style={{
                                                                backgroundColor: '#f1f5f9',
                                                                color: '#64748b',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '6px',
                                                                fontWeight: '600',
                                                                fontSize: '0.75rem',
                                                                padding: '0.35rem 0.75rem',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                display: 'inline-block'
                                                            }}
                                                        >
                                                            +{activeProjectsList.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <small className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>
                                                    Not assigned to any active projects
                                                </small>
                                            </div>
                                        )}
                                    </div>

                                    {/* Employees section */}
                                    <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="d-flex" style={{ marginLeft: '0' }}>
                                                    {activeEmployees.slice(0, 4).map((assignment, idx) => {
                                                        const empId = typeof assignment === 'string' ? assignment : assignment.employeeId;
                                                        const emp = employees.find(e => e.id.toString() === empId);
                                                        if (!emp) return null;

                                                        return <AvatarItem key={idx} emp={emp} idx={idx} />;
                                                    })}
                                                    {activeEmployees.length > 4 && (
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
                                                            +{activeEmployees.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <small className="ms-1" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)' }}>
                                                    {activeEmployees.length === 0 ? 'No users' : `${activeEmployees.length} user${activeEmployees.length !== 1 ? 's' : ''}`}
                                                </small>
                                            </div>
                                            <Button
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                    borderRadius: '10px',
                                                    padding: '0.5rem 0.75rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                size="sm"
                                                onClick={() => openAssignModal(sub)}
                                                title="Manage Users"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <UserPlus size={16} style={{ color: '#ffffff' }} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Add Subscription Modal */}
            <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg">
                <ModalHeader toggle={toggleModal}>{isEditMode ? 'Edit Subscription' : 'Add New Subscription'}</ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <ModalBody>
                        <FormGroup>
                            <Label for="name">Subscription Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. AWS Cloud Infrastructure"
                                value={formData.name}
                                onChange={handleChange}
                                invalid={!!errors.name}
                            />
                            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                        </FormGroup>
                        <FormGroup>
                            <Label for="price">Monthly Cost</Label>
                            <InputGroup>
                                <InputGroupText>$</InputGroupText>
                                <Input
                                    id="price"
                                    name="price"
                                    type="text"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                    invalid={!!errors.price}
                                />
                                <InputGroupText>/mo</InputGroupText>
                            </InputGroup>
                            {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
                        </FormGroup>
                        <FormGroup>
                            <Label for="type">Type</Label>
                            <Input
                                id="type"
                                name="type"
                                type="select"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="Software">Software</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Security">Security</option>
                                <option value="Services">Services</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label className="fw-medium">Active Projects</Label>
                            <div className="position-relative mb-2">
                                <Search size={16} className="text-muted position-absolute" style={{ top: '10px', left: '10px' }} />
                                <Input
                                    placeholder="Search projects..."
                                    className="ps-5"
                                    value={projectSearch}
                                    onChange={(e) => setProjectSearch(e.target.value)}
                                />
                            </div>
                            <div className="border rounded bg-white p-2" style={{ height: '150px', overflowY: 'auto' }}>
                                {projects
                                    .filter(p => !['On Hold', 'Completed', 'Removed'].includes(p.status))
                                    .filter(p =>
                                        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
                                        p.status.toLowerCase().includes(projectSearch.toLowerCase())
                                    )
                                    .length > 0 ? (
                                    projects
                                        .filter(p => !['On Hold', 'Completed', 'Removed'].includes(p.status))
                                        .filter(p =>
                                            p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
                                            p.status.toLowerCase().includes(projectSearch.toLowerCase())
                                        )
                                        .map(project => {
                                            const isSelected = formData.selectedProjects.includes(project.id);
                                            return (
                                                <div
                                                    key={project.id}
                                                    className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            selectedProjects: isSelected
                                                                ? prev.selectedProjects.filter(id => id !== project.id)
                                                                : [...prev.selectedProjects, project.id]
                                                        }));
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => { }}
                                                        className="me-3"
                                                    />
                                                    <div>
                                                        <div className="fw-medium text-dark">{project.title}</div>
                                                        <small className="text-muted">{project.status}</small>
                                                    </div>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        <small>No active projects available</small>
                                    </div>
                                )}
                            </div>
                            <small className="text-muted mt-1 d-block">
                                Select projects that use this subscription. Selected: {formData.selectedProjects.length}
                            </small>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" className="border" onClick={toggleModal}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            style={{
                                background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                border: 'none',
                                color: 'white',
                                fontWeight: '500'
                            }}
                        >
                            {isEditMode ? 'Update Subscription' : 'Add Subscription'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal >

            {/* Assign Employees Modal */}
            < Modal isOpen={assignModalOpen} toggle={toggleAssignModal} >
                <ModalHeader toggle={toggleAssignModal}>
                    Assign to {selectedSubscription?.name}
                </ModalHeader>
                <ModalBody>
                    <div className="position-relative mb-3">
                        <Search size={16} className="text-muted position-absolute" style={{ top: '10px', left: '10px' }} />
                        <Input
                            placeholder="Search employees..."
                            className="ps-5"
                            value={employeeSearch}
                            onChange={(e) => setEmployeeSearch(e.target.value)}
                        />
                    </div>
                    <div
                        className="border rounded bg-white p-2"
                        style={{ height: '300px', overflowY: 'auto' }}
                    >
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map(emp => {
                                const isSelected = assignedEmployees.some(a => a === emp.id.toString());
                                return (
                                    <div
                                        key={emp.id}
                                        className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                        onClick={() => toggleEmployeeAssignment(emp.id.toString())}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div
                                            className={`d-flex align-items-center justify-content-center rounded border me-3 ${isSelected ? 'bg-primary border-primary' : 'bg-white border-secondary'}`}
                                            style={{ width: '20px', height: '20px', minWidth: '20px' }}
                                        >
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <div className="fw-medium text-dark">{emp.name}</div>
                                            <small className="text-muted">{emp.role}</small>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-muted py-4">
                                <small>No matching employees found.</small>
                            </div>
                        )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <small className="text-muted">
                            {assignedEmployees.length} employees selected
                        </small>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" className="border" onClick={toggleAssignModal}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssignSubmit}
                        style={{
                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '500'
                        }}
                    >
                        Save Assignments
                    </Button>
                </ModalFooter>
            </Modal >
            {/* Delete Confirmation Modal */}
            < Modal isOpen={confirmDeleteModalOpen} toggle={() => setConfirmDeleteModalOpen(false)}>
                <ModalHeader toggle={() => setConfirmDeleteModalOpen(false)}>Confirm Delete</ModalHeader>
                <ModalBody>
                    Are you sure you want to delete the subscription <strong>{subscriptionToDelete?.name}</strong>? This action cannot be undone and will remove it from all assigned employees.
                </ModalBody>
                <ModalFooter>
                    <Button color="light" className="border" onClick={() => setConfirmDeleteModalOpen(false)}>Cancel</Button>
                    <Button color="danger" onClick={handleDeleteSubscription}>Delete</Button>
                </ModalFooter>
            </Modal >
        </div >
    );
};

export default Subscriptions;
