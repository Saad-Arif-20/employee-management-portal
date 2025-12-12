import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Table, Badge, Input, Button, Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label,
    UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
    Pagination, PaginationItem, PaginationLink, UncontrolledTooltip
} from 'reactstrap';
import { Search, Plus, Edit, Trash2, User, Users, Save, X, Check, Calendar, PauseCircle, PlayCircle, MoreVertical, ChevronDown, Info } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';
import DateRangeFilter from '../components/DateRangeFilter';

const EmployeeList = () => {
    const navigate = useNavigate();
    const { employees, removeEmployee, addEmployee, updateEmployee, projects, subscriptions, updateSubscription } = useGlobal();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter states
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    // Reset page when search term or filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, departmentFilter, statusFilter, dateFromFilter, dateToFilter]);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        email: '',
        joinDate: '',
        salary: '',
        role: '',
        reportingTo: '',
        department: '',
        status: 'Active',
        reportees: []
    });
    const [reporteeSearch, setReporteeSearch] = useState('');
    const [reportingToSearch, setReportingToSearch] = useState('');
    const [errors, setErrors] = useState({});

    // Delete Confirmation Modal
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // Warning Modal
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');




    // Helper to find reportees
    const getReportees = (employeeId) => {
        const reportees = employees.filter(e => e.reportingTo && e.reportingTo.toString() === employeeId.toString());
        if (reportees.length === 0) return '-';
        return reportees.map(e => e.name).join(', ');
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

    // Form Logic
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setErrors({});
        setReporteeSearch('');
        setReportingToSearch('');
    };

    const handleNewClick = () => {
        setFormData({
            employeeId: '',
            name: '',
            email: '',
            joinDate: '',
            salary: '',
            role: '',
            reportingTo: '',
            department: '',
            status: 'Active',
            reportees: []
        });
        setIsEditMode(false);
        setEditingEmployeeId(null);
        toggleModal();
    };

    const handleEditClick = (employee) => {
        // Find current reportees
        const currentReportees = employees
            .filter(e => e.reportingTo === employee.id.toString())
            .map(e => e.id.toString());

        setFormData({
            employeeId: employee.employeeId || '',
            name: employee.name,
            email: employee.email,
            joinDate: employee.joinDate,
            salary: String(employee.salary),
            role: employee.role,
            reportingTo: employee.reportingTo || '',
            department: employee.department,
            status: employee.status || 'Active',
            reportees: currentReportees
        });
        setIsEditMode(true);
        setEditingEmployeeId(employee.id);
        toggleModal();
    };

    const validate = () => {
        const newErrors = {};

        // In edit mode, we're only updating status, so skip other validations
        if (isEditMode) {
            // No additional validation needed for status-only updates
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }

        // Full validation for new employee enrollment
        const joinYear = new Date(formData.joinDate).getFullYear();
        const today = new Date().toISOString().split('T')[0];

        if (!formData.employeeId) {
            newErrors.employeeId = 'Employee ID is required';
        } else {
            // Check if it is a positive number
            if (isNaN(formData.employeeId) || Number(formData.employeeId) <= 0) {
                newErrors.employeeId = 'Employee ID must be a positive number';
            } else {
                // Check for duplicate Employee ID
                const duplicateId = employees.find(e =>
                    e.employeeId.toString() === formData.employeeId.toString() &&
                    (!isEditMode || e.id.toString() !== editingEmployeeId?.toString())
                );
                if (duplicateId) newErrors.employeeId = 'Employee ID already exists';
            }
        }

        if (!formData.name) newErrors.name = 'Full Name is required';

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else {
            // Check for duplicate Email
            const duplicateEmail = employees.find(e =>
                e.email.toLowerCase() === formData.email.toLowerCase() &&
                (!isEditMode || e.id.toString() !== editingEmployeeId?.toString())
            );
            if (duplicateEmail) newErrors.email = 'Email address already exists';
        }

        if (!formData.joinDate) {
            newErrors.joinDate = 'Date of Joining is required';
        } else {
            if (joinYear < 2020) newErrors.joinDate = 'Date of Joining cannot be before 2020';
            if (formData.joinDate > today) newErrors.joinDate = 'Date of Joining cannot be in the future';
        }

        if (!formData.salary) {
            newErrors.salary = 'Salary is required';
        } else if (Number(String(formData.salary).replace(/,/g, '')) < 25000) {
            newErrors.salary = 'Salary must be at least 25,000 USD';
        }

        if (!formData.role) newErrors.role = 'Position is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle salary formatting
        if (name === 'salary') {
            // Remove all non-digit characters
            const numericValue = value.replace(/[^\d]/g, '');
            // Format with commas
            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
            return;
        }

        // Validate status change for project assignments
        if (name === 'status' && (value === 'Inactive' || value === 'On Leave') && isEditMode) {
            const currentEmployeeName = formData.name;

            // Find all projects where this employee is involved
            const assignedProjects = projects.filter(project =>
                project.lead === currentEmployeeName ||
                (project.team && project.team.includes(currentEmployeeName))
            );

            if (assignedProjects.length > 0) {
                const projectNames = assignedProjects.map(p => p.title).join(', ');
                const errorMsg = `Cannot set status to ${value}. ${currentEmployeeName} is currently assigned to: ${projectNames}`;

                setErrors(prev => ({ ...prev, status: errorMsg }));
                setWarningMessage(errorMsg);
                setWarningModalOpen(true);
                return; // Prevent the status change
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const toggleReportee = (employeeId) => {
        setFormData(prev => {
            const isSelected = prev.reportees.includes(employeeId);
            if (isSelected) {
                return { ...prev, reportees: prev.reportees.filter(id => id !== employeeId) };
            } else {
                return { ...prev, reportees: [...prev.reportees, employeeId] };
            }
        });
    };

    // Subscription Management Handlers
    const handleToggleSubscriptionStatus = (subscriptionId, employeeId) => {
        const subscription = subscriptions.find(sub => sub.id === subscriptionId);
        if (!subscription) return;

        const updatedAssignedTo = subscription.assignedTo.map(assignment => {
            const assignmentEmployeeId = typeof assignment === 'string' ? assignment : assignment.employeeId;

            if (assignmentEmployeeId === employeeId) {
                // Toggle status for this specific employee
                if (typeof assignment === 'string') {
                    return { employeeId: assignment, date: new Date().toISOString().split('T')[0], status: 'Paused' };
                } else {
                    return {
                        ...assignment,
                        status: assignment.status === 'Paused' ? 'Active' : 'Paused'
                    };
                }
            }
            return assignment;
        });

        updateSubscription({ ...subscription, assignedTo: updatedAssignedTo });
    };

    const handleRemoveSubscription = (subscriptionId, employeeId) => {
        const subscription = subscriptions.find(sub => sub.id === subscriptionId);
        if (!subscription) return;

        // Remove only this employee's assignment
        const updatedAssignedTo = subscription.assignedTo.filter(assignment => {
            const assignmentEmployeeId = typeof assignment === 'string' ? assignment : assignment.employeeId;
            return assignmentEmployeeId !== employeeId;
        });

        updateSubscription({ ...subscription, assignedTo: updatedAssignedTo });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Remove commas from salary before saving
            const submissionData = {
                ...formData,
                salary: String(formData.salary).replace(/,/g, '')
            };

            if (isEditMode) {
                updateEmployee(editingEmployeeId, submissionData);
            } else {
                addEmployee(submissionData);
            }
            toggleModal();
        }
    };

    const confirmDelete = (employee) => {
        setEmployeeToDelete(employee);
        setConfirmDeleteModalOpen(true);
    };

    const handleDeleteEmployee = () => {
        if (employeeToDelete) {
            removeEmployee(employeeToDelete.id);
            setConfirmDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const filteredEmployees = employees.filter(employee => {
        // Exclude deleted employees from the list
        if (employee.deleted) return false;

        // Search filter
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

        // Department filter
        const matchesDepartment = !departmentFilter || employee.department === departmentFilter;

        // Status filter
        const matchesStatus = !statusFilter || employee.status === statusFilter;

        // Date range filter
        let matchesDateRange = true;
        if (dateFromFilter || dateToFilter) {
            const joinDate = new Date(employee.joinDate);
            if (dateFromFilter) {
                matchesDateRange = matchesDateRange && joinDate >= new Date(dateFromFilter);
            }
            if (dateToFilter) {
                matchesDateRange = matchesDateRange && joinDate <= new Date(dateToFilter);
            }
        }

        return matchesSearch && matchesDepartment && matchesStatus && matchesDateRange;
    });

    // Pagination Logic
    const indexOfLastEmployee = currentPage * itemsPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Filter out the current employee from potential managers and reportees
    const potentialRelations = employees.filter(e => !isEditMode || e.id.toString() !== editingEmployeeId?.toString());

    const filteredRelations = potentialRelations.filter(e =>
        e.name.toLowerCase().includes(reporteeSearch.toLowerCase()) ||
        e.role.toLowerCase().includes(reporteeSearch.toLowerCase())
    );

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Employees</h2>
                    <p className="text-muted">Manage your team members and their account permissions.</p>
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
                    <span>Add Employee</span>
                </Button>
            </div>

            <Card
                className="border-0 shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(13, 59, 46, 0.12)'
                }}
            >
                <CardBody>
                    <Row className="mb-5 mt-4 px-4">
                        <Col md={4}>
                            <Label htmlFor="search-input" className="fw-medium text-muted">Search Employees</Label>
                            <div className="position-relative">
                                <Search size={18} className="text-muted position-absolute" style={{ top: '12px', left: '12px' }} />
                                <Input
                                    id="search-input"
                                    type="text"
                                    placeholder="Search employees..."
                                    className="ps-5 border-light bg-light"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={2}>
                            <Label htmlFor="department-filter" className="fw-medium text-muted">Filter by Department</Label>
                            <Input
                                id="department-filter"
                                type="select"
                                className="border-light bg-light"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Product">Product</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                                <option value="HR">HR</option>
                            </Input>
                        </Col>
                        <Col md={2}>
                            <Label htmlFor="status-filter" className="fw-medium text-muted">Filter by Status</Label>
                            <Input
                                id="status-filter"
                                type="select"
                                className="border-light bg-light"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Inactive">Inactive</option>
                            </Input>
                        </Col>
                        <Col md={4}>
                            <Label className="fw-medium text-muted">Filter by Date of Joining</Label>
                            <DateRangeFilter
                                startDate={dateFromFilter}
                                endDate={dateToFilter}
                                onChange={(start, end) => {
                                    const formatDate = (date) => {
                                        if (!date) return '';
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        return `${year}-${month}-${day}`;
                                    };
                                    setDateFromFilter(formatDate(start));
                                    setDateToFilter(formatDate(end));
                                }}
                            />
                        </Col>
                    </Row>

                    <div>
                        <Table hover className="align-middle">
                            <thead style={{
                                background: 'linear-gradient(135deg, rgba(13, 59, 46, 0.08) 0%, rgba(20, 92, 71, 0.08) 100%)'
                            }}>
                                <tr>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>ID</th>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Name</th>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Role</th>
                                    <th className="border-0 fw-medium text-end px-4" style={{ color: '#0d3b2e' }}>Salary</th>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Reporting To</th>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Date of Joining</th>
                                    <th className="border-0 fw-medium text-center px-4" style={{ color: '#0d3b2e' }}>Status</th>
                                    <th className="border-0 fw-medium text-center px-4" style={{ color: '#0d3b2e' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEmployees.length > 0 ? (
                                    currentEmployees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td className="border-bottom border-light py-3 px-4">
                                                <span className="text-muted fw-medium small">{employee.employeeId || '-'}</span>
                                            </td>
                                            <td className="border-bottom border-light py-3 px-4">
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-dark">{employee.name}</h6>
                                                    <small className="text-muted">{employee.email}</small>
                                                </div>
                                            </td>
                                            <td className="border-bottom border-light py-3 px-4">
                                                <span className="text-dark">{employee.role}</span>
                                                <div className="text-muted small">{employee.department}</div>
                                            </td>
                                            <td className="border-bottom border-light py-3 px-4 text-end">
                                                <span className="text-dark fw-medium">
                                                    {Number(employee.salary).toLocaleString()} USD
                                                </span>
                                            </td>
                                            <td className="border-bottom border-light py-3 px-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    {employee.reportingTo ? (() => {
                                                        const manager = employees.find(e => e.id.toString() === employee.reportingTo.toString());
                                                        if (!manager) return <span className="text-muted">Unknown</span>;
                                                        const tooltipId = `manager-tooltip-${employee.id}`;
                                                        return (
                                                            <>
                                                                <User size={14} className="text-muted" />
                                                                <span
                                                                    className="text-muted"
                                                                    id={tooltipId}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {manager.name}
                                                                </span>
                                                                <UncontrolledTooltip
                                                                    placement="top"
                                                                    target={tooltipId}
                                                                    delay={{ show: 0, hide: 0 }}
                                                                    innerClassName="text-nowrap custom-tooltip-padding"
                                                                >
                                                                    <div className="text-start" style={{ fontSize: '0.85rem' }}>
                                                                        <div><strong>Designation:</strong> {manager.role}</div>
                                                                        <div><strong>Email:</strong> {manager.email}</div>
                                                                    </div>
                                                                </UncontrolledTooltip>
                                                            </>
                                                        );
                                                    })() : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border-bottom border-light py-3 px-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Calendar size={14} className="text-muted" />
                                                    <span className="text-muted">
                                                        {new Date(employee.joinDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="border-bottom border-light py-3 px-4 text-center">
                                                <Badge
                                                    className="px-3 py-2 rounded-pill bg-opacity-10"
                                                    style={{
                                                        backgroundColor:
                                                            employee.status === 'Active' ? 'rgba(13, 59, 46, 0.1)' :
                                                                employee.status === 'On Leave' ? 'rgba(251, 191, 36, 0.1)' :
                                                                    'rgba(239, 68, 68, 0.1)',
                                                        color:
                                                            employee.status === 'Active' ? '#0d3b2e' :
                                                                employee.status === 'On Leave' ? '#fbbf24' :
                                                                    '#ef4444'
                                                    }}
                                                >
                                                    {employee.status}
                                                </Badge>
                                            </td>
                                            <td className="border-bottom border-light py-3 px-4 text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <UncontrolledDropdown>
                                                        <DropdownToggle color="light" size="sm" className="d-flex align-items-center gap-1 border">
                                                            Actions <ChevronDown size={14} />
                                                        </DropdownToggle>
                                                        <DropdownMenu end
                                                            style={{
                                                                position: 'fixed',
                                                                inset: 'auto auto auto auto',
                                                                transform: 'translateX(-100%)'
                                                            }}>
                                                            <DropdownItem onClick={() => navigate(`/employees/${employee.id}`)}>
                                                                <User size={14} className="me-2" />
                                                                View Profile
                                                            </DropdownItem>
                                                            <DropdownItem onClick={() => handleEditClick(employee)}>
                                                                <Edit size={14} className="me-2" />
                                                                Update Profile
                                                            </DropdownItem>
                                                            <DropdownItem onClick={() => confirmDelete(employee)} className="text-danger">
                                                                <Trash2 size={14} className="me-2" />
                                                                Delete Profile
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {filteredEmployees.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-4 px-4">
                            <span className="text-muted small">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Pagination className="mb-0">
                                <PaginationItem disabled={currentPage === 1}>
                                    <PaginationLink previous onClick={() => paginate(currentPage - 1)} style={{ color: '#6c757d' }} />
                                </PaginationItem>
                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem active={i + 1 === currentPage} key={i}>
                                        <PaginationLink
                                            onClick={() => paginate(i + 1)}
                                            style={i + 1 === currentPage ? {
                                                background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                                border: 'none',
                                                color: 'white'
                                            } : {
                                                color: '#6c757d'
                                            }}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem disabled={currentPage === totalPages}>
                                    <PaginationLink next onClick={() => paginate(currentPage + 1)} style={{ color: '#6c757d' }} />
                                </PaginationItem>
                            </Pagination>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Employee Modal */}
            <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" scrollable centered>
                <ModalHeader toggle={toggleModal}>
                    {isEditMode ? 'Edit Employee' : 'Enroll Employee'}
                </ModalHeader>
                <ModalBody className="p-4">
                    <Form onSubmit={handleSubmit}>
                        {isEditMode ? (
                            <div className="py-2">
                                <div className="mb-4 p-3 bg-light rounded border">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold text-dark mb-1">{formData.name}</h5>
                                            <div className="text-muted small">{formData.role} • {formData.department}</div>
                                            <div className="text-muted small">{formData.email}</div>
                                        </div>
                                    </div>
                                </div>

                                <FormGroup>
                                    <Label for="status" className="fw-medium">Employee Status</Label>
                                    <Input
                                        id="status"
                                        name="status"
                                        type="select"
                                        value={formData.status}
                                        onChange={handleChange}
                                        invalid={!!errors.status}
                                        bsSize="lg"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="On Leave">On Leave</option>
                                        <option value="Inactive">Inactive</option>
                                    </Input>
                                    {errors.status && <div className="invalid-feedback d-block">{errors.status}</div>}
                                </FormGroup>
                            </div>
                        ) : (
                            <>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="employeeId" className="fw-medium">Employee ID</Label>
                                            <Input
                                                id="employeeId"
                                                name="employeeId"
                                                placeholder="e.g. 1001"
                                                value={formData.employeeId}
                                                onChange={handleChange}
                                                invalid={!!errors.employeeId}
                                            />
                                            {errors.employeeId && <div className="invalid-feedback d-block">{errors.employeeId}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="name" className="fw-medium">Full Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="e.g. John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                                invalid={!!errors.name}
                                            />
                                            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="email" className="fw-medium">Email Address</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="e.g. john@company.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                invalid={!!errors.email}
                                            />
                                            {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="joinDate" className="fw-medium">Date of Joining</Label>
                                            <Input
                                                id="joinDate"
                                                name="joinDate"
                                                type="date"
                                                min="2020-01-01"
                                                max={new Date().toISOString().split('T')[0]}
                                                value={formData.joinDate}
                                                onChange={handleChange}
                                                invalid={!!errors.joinDate}
                                            />
                                            {errors.joinDate && <div className="invalid-feedback d-block">{errors.joinDate}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="salary" className="fw-medium">Salary (USD)</Label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light text-muted">USD</span>
                                                <Input
                                                    id="salary"
                                                    name="salary"
                                                    type="text"
                                                    placeholder="0"
                                                    value={formData.salary}
                                                    onChange={handleChange}
                                                    invalid={!!errors.salary}
                                                />
                                                {errors.salary && <div className="invalid-feedback d-block">{errors.salary}</div>}
                                            </div>
                                            <small className="text-muted">Minimum salary is 25,000 USD</small>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="role" className="fw-medium">Position</Label>
                                            <Input
                                                id="role"
                                                name="role"
                                                placeholder="e.g. Senior Developer"
                                                value={formData.role}
                                                onChange={handleChange}
                                                invalid={!!errors.role}
                                            />
                                            {errors.role && <div className="invalid-feedback d-block">{errors.role}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <FormGroup>
                                            <Label for="department" className="fw-medium">Department</Label>
                                            <Input
                                                id="department"
                                                name="department"
                                                type="select"
                                                value={formData.department}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Department</option>
                                                <option value="Engineering">Engineering</option>
                                                <option value="Product">Product</option>
                                                <option value="Design">Design</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="HR">HR</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="reportees" className="fw-medium">Assign Reportees</Label>
                                            <div className="position-relative mb-2">
                                                <Search size={16} className="text-muted position-absolute" style={{ top: '10px', left: '10px' }} />
                                                <Input
                                                    placeholder="Search employees..."
                                                    className="ps-5"
                                                    value={reporteeSearch}
                                                    onChange={(e) => setReporteeSearch(e.target.value)}
                                                />
                                            </div>
                                            <div
                                                className="border rounded bg-white p-2"
                                                style={{ height: '200px', overflowY: 'auto' }}
                                            >
                                                {filteredRelations.length > 0 ? (
                                                    filteredRelations.map(emp => {
                                                        const isSelected = formData.reportees.includes(emp.id.toString());
                                                        return (
                                                            <div
                                                                key={emp.id}
                                                                className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                                                onClick={() => toggleReportee(emp.id.toString())}
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
                                            <small className="text-muted mt-1 d-block">
                                                Click to select/deselect. Selected: {formData.reportees.length}
                                            </small>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="reportingTo" className="fw-medium">Reporting To</Label>
                                            <div className="position-relative mb-2">
                                                <Search size={16} className="text-muted position-absolute" style={{ top: '10px', left: '10px' }} />
                                                <Input
                                                    placeholder="Search managers..."
                                                    className="ps-5"
                                                    value={reportingToSearch}
                                                    onChange={(e) => setReportingToSearch(e.target.value)}
                                                />
                                            </div>
                                            <div
                                                className="border rounded bg-white p-2"
                                                style={{ height: '200px', overflowY: 'auto' }}
                                            >
                                                <div
                                                    className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${!formData.reportingTo ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, reportingTo: '' }))}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div
                                                        className={`d-flex align-items-center justify-content-center rounded border me-3 ${!formData.reportingTo ? 'bg-primary border-primary' : 'bg-white border-secondary'}`}
                                                        style={{ width: '20px', height: '20px', minWidth: '20px' }}
                                                    >
                                                        {!formData.reportingTo && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <div>
                                                        <div className="fw-medium text-dark">No Manager</div>
                                                        <small className="text-muted">Reports to no one</small>
                                                    </div>
                                                </div>
                                                {potentialRelations
                                                    .filter(e =>
                                                        e.name.toLowerCase().includes(reportingToSearch.toLowerCase()) ||
                                                        e.role.toLowerCase().includes(reportingToSearch.toLowerCase())
                                                    )
                                                    .map(emp => {
                                                        const isSelected = formData.reportingTo === emp.id.toString();
                                                        return (
                                                            <div
                                                                key={emp.id}
                                                                className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                                                onClick={() => setFormData(prev => ({ ...prev, reportingTo: emp.id.toString() }))}
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
                                                    })}
                                            </div>
                                            <small className="text-muted mt-1 d-block">
                                                Click to select a manager
                                            </small>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </>
                        )}

                        <div className="d-flex justify-content-end gap-3 mt-4">
                            <Button
                                color="light"
                                className="d-flex align-items-center gap-2 border"
                                onClick={toggleModal}
                                type="button"
                            >
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
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #082920 0%, #0d3b2e 100%)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 59, 46, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Save size={18} />
                                <span>{isEditMode ? 'Update Status' : 'Enroll Employee'}</span>
                            </Button>
                        </div>
                    </Form>
                </ModalBody>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={confirmDeleteModalOpen} toggle={() => setConfirmDeleteModalOpen(false)}>
                <ModalHeader toggle={() => setConfirmDeleteModalOpen(false)}>Confirm Delete</ModalHeader>
                <ModalBody>
                    Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>? This action cannot be undone.
                </ModalBody>
                <ModalFooter>
                    <Button color="light" className="border" onClick={() => setConfirmDeleteModalOpen(false)}>Cancel</Button>
                    <Button color="danger" onClick={handleDeleteEmployee}>Delete</Button>
                </ModalFooter>
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
        </div>
    );
};

export default EmployeeList;
