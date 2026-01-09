import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Table, Badge, Input, Button, Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label,
    UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
    Pagination, PaginationItem, PaginationLink, UncontrolledTooltip
} from 'reactstrap';
import { Search, Plus, Edit, Trash2, User, Save, Calendar, ChevronDown, Check } from 'lucide-react';
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
        reportees: [],
        leaveStartDate: '',
        leaveEndDate: '',
        totalLeaveDays: 0,
        paidLeaveDays: 0,
        unpaidLeaveDays: 0
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
            reportees: currentReportees,
            leaveStartDate: employee.leaveStartDate ? employee.leaveStartDate.split('T')[0] : '',
            leaveEndDate: employee.leaveEndDate ? employee.leaveEndDate.split('T')[0] : '',
            totalLeaveDays: employee.totalLeaveDays || 0,
            paidLeaveDays: employee.paidLeaveDays || 0,
            unpaidLeaveDays: employee.unpaidLeaveDays || 0
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
            const numericValue = value.replace(/[^\d]/g, '');
            const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
            return;
        }

        // Validate status change for project assignments
        if (name === 'status' && value === 'Inactive' && isEditMode && projects) {
            const currentEmployeeName = formData.name;
            const currentEmployeeId = editingEmployeeId ? editingEmployeeId.toString() : '';

            // Find all projects where this employee is involved
            const assignedProjects = projects.filter(project => {
                // Check if employee is Lead (by Name, ID, or Populated Name)
                const isLead = (project.lead === currentEmployeeName) ||
                    (project.leadName === currentEmployeeName) ||
                    (project.lead && String(project.lead) === currentEmployeeId);

                // Check if employee is Team Member (by Name, ID in team array, or Member Object)
                const isMember = (project.team && project.team.includes(currentEmployeeName)) ||
                    (project.team && project.team.map(String).includes(currentEmployeeId)) ||
                    (project.teamMembers && project.teamMembers.some(m => m.name === currentEmployeeName || String(m.id) === currentEmployeeId || String(m.employeeId) === currentEmployeeId));

                return isLead || isMember;
            });

            if (assignedProjects.length > 0) {
                const leadProjects = assignedProjects.filter(p =>
                    (p.lead === currentEmployeeName) ||
                    (p.leadName === currentEmployeeName) ||
                    (String(p.lead) === currentEmployeeId)
                ).map(p => p.title);

                const memberProjects = assignedProjects.filter(p =>
                    !leadProjects.includes(p.title) // Simply exclude projects where they are lead to avoid duplication
                ).map(p => p.title);

                let warningMsg = `Action cannot be done. ${currentEmployeeName} is currently active in the following projects:\n\n`;

                if (leadProjects.length > 0) {
                    warningMsg += `• Project Lead for: ${leadProjects.join(', ')}\n`;
                }
                if (memberProjects.length > 0) {
                    warningMsg += `• Team Member in: ${memberProjects.join(', ')}\n`;
                }

                warningMsg += `\nPlease reassign these projects before changing status to ${value}.`;

                setWarningMessage(warningMsg);
                setWarningModalOpen(true);
                return; // BLOCK the change
            }
        }

        // Handle Leave Calculations
        if (name === 'leaveStartDate' || name === 'leaveEndDate') {
            const startDate = name === 'leaveStartDate' ? value : formData.leaveStartDate;
            const endDate = name === 'leaveEndDate' ? value : formData.leaveEndDate;

            let totalDays = 0;
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (!isNaN(start) && !isNaN(end) && end >= start) {
                    const diffTime = Math.abs(end - start);
                    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start day
                }
            }

            setFormData(prev => ({
                ...prev,
                [name]: value,
                totalLeaveDays: totalDays,
                paidLeaveDays: 0,
                unpaidLeaveDays: totalDays // Default all to unpaid initially
            }));
            return;
        }

        if (name === 'paidLeaveDays') {
            const paidDays = parseInt(value) || 0;
            const totalDays = formData.totalLeaveDays;

            // Ensure paid days don't exceed total days
            if (paidDays <= totalDays) {
                setFormData(prev => ({
                    ...prev,
                    [name]: paidDays,
                    unpaidLeaveDays: totalDays - paidDays
                }));
            }
            return;
        }

        if (name === 'unpaidLeaveDays') {
            const unpaidDays = parseInt(value) || 0;
            const totalDays = formData.totalLeaveDays;

            // Ensure unpaid days don't exceed total days
            if (unpaidDays <= totalDays) {
                setFormData(prev => ({
                    ...prev,
                    [name]: unpaidDays,
                    paidLeaveDays: totalDays - unpaidDays
                }));
            }
            return;
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



    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            if (isEditMode) {
                // In edit mode, we're only updating the status
                const submissionData = {
                    status: formData.status
                };

                // If status is being changed to Inactive, set lastWorkingDate to today
                if (formData.status === 'Inactive') {
                    const today = new Date().toISOString().split('T')[0];
                    submissionData.lastWorkingDate = today;
                }
                // If status is being changed to Active, clear lastWorkingDate
                else if (formData.status === 'Active') {
                    submissionData.lastWorkingDate = null;
                    submissionData.leaveStartDate = null;
                    submissionData.leaveEndDate = null;
                    submissionData.totalLeaveDays = 0;
                    submissionData.paidLeaveDays = 0;
                    submissionData.unpaidLeaveDays = 0;
                }
                // If status is On Leave, check dates
                else if (formData.status === 'On Leave') {
                    submissionData.leaveStartDate = formData.leaveStartDate;
                    submissionData.leaveEndDate = formData.leaveEndDate;
                    submissionData.totalLeaveDays = formData.totalLeaveDays;
                    submissionData.paidLeaveDays = formData.paidLeaveDays;
                    submissionData.unpaidLeaveDays = formData.unpaidLeaveDays;

                    // If Start Date is in the future, 'Schedule' the leave but keep status Active
                    if (formData.leaveStartDate) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const startDate = new Date(formData.leaveStartDate);
                        startDate.setHours(0, 0, 0, 0);

                        if (startDate > today) {
                            submissionData.status = 'Active';
                            // We could show a toast here, but for now we basically just don't flip the status tag
                        }
                    }
                }

                updateEmployee(editingEmployeeId, submissionData);
            } else {
                // For new employee, send all data
                const submissionData = {
                    ...formData,
                    salary: String(formData.salary).replace(/,/g, '')
                };

                // Generate unique 6-digit employee ID
                const generateUniqueEmployeeId = () => {
                    const existingIds = employees.map(emp => emp.employeeId?.toString());
                    let newId;
                    let attempts = 0;
                    const maxAttempts = 1000; // Prevent infinite loop

                    do {
                        // Generate random 6-digit number (100000 to 999999)
                        newId = Math.floor(100000 + Math.random() * 900000).toString();
                        attempts++;
                    } while (existingIds.includes(newId) && attempts < maxAttempts);

                    return newId;
                };

                const employeeId = generateUniqueEmployeeId();
                addEmployee({ ...submissionData, employeeId });
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
        <>
            <style>{`
                .dropdown-menu .dropdown-item:hover,
                .dropdown-menu .dropdown-item:focus {
                    background-color: #0d3b2e !important;
                    color: white !important;
                }
            `}</style>
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
                                <Label className="fw-medium text-muted">Filter by Department</Label>
                                <UncontrolledDropdown>
                                    <DropdownToggle
                                        caret
                                        className="w-100 text-start d-flex justify-content-between align-items-center border-light bg-light"
                                        style={{
                                            borderRadius: '0.375rem',
                                            padding: '0.375rem 0.75rem',
                                            color: '#6c757d'
                                        }}
                                    >
                                        {departmentFilter || 'All Departments'}
                                    </DropdownToggle>
                                    <DropdownMenu className="w-100">
                                        <DropdownItem onClick={() => setDepartmentFilter('')}>All Departments</DropdownItem>
                                        <DropdownItem onClick={() => setDepartmentFilter('Engineering')}>Engineering</DropdownItem>
                                        <DropdownItem onClick={() => setDepartmentFilter('Product')}>Product</DropdownItem>
                                        <DropdownItem onClick={() => setDepartmentFilter('Design')}>Design</DropdownItem>
                                        <DropdownItem onClick={() => setDepartmentFilter('Marketing')}>Marketing</DropdownItem>
                                        <DropdownItem onClick={() => setDepartmentFilter('HR')}>HR</DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </Col>
                            <Col md={2}>
                                <Label className="fw-medium text-muted">Filter by Status</Label>
                                <UncontrolledDropdown>
                                    <DropdownToggle
                                        caret
                                        className="w-100 text-start d-flex justify-content-between align-items-center border-light bg-light"
                                        style={{
                                            borderRadius: '0.375rem',
                                            padding: '0.375rem 0.75rem',
                                            color: '#6c757d'
                                        }}
                                    >
                                        {statusFilter || 'All Status'}
                                    </DropdownToggle>
                                    <DropdownMenu className="w-100">
                                        <DropdownItem onClick={() => setStatusFilter('')}>All Status</DropdownItem>
                                        <DropdownItem onClick={() => setStatusFilter('Active')}>Active</DropdownItem>
                                        <DropdownItem onClick={() => setStatusFilter('On Leave')}>On Leave</DropdownItem>
                                        <DropdownItem onClick={() => setStatusFilter('Inactive')}>Inactive</DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
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
                                        <th className="border-0 fw-medium text-end px-4" style={{ color: '#0d3b2e' }}>Salary (USD)</th>
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
                                                    <span className="text-muted">
                                                        ${Number(employee.salary).toLocaleString()}
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
                                        <UncontrolledDropdown>
                                            <DropdownToggle
                                                caret
                                                className="w-100 text-start d-flex justify-content-between align-items-center bg-white"
                                                style={{
                                                    borderRadius: '0.375rem',
                                                    padding: '0.375rem 0.75rem',
                                                    color: '#6c757d',
                                                    border: '1px solid #ced4da'
                                                }}
                                            >
                                                {formData.status || 'Select Status'}
                                            </DropdownToggle>
                                            <DropdownMenu className="w-100 shadow-sm border-0">
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
                                        {errors.status && <div className="invalid-feedback d-block">{errors.status}</div>}
                                    </FormGroup>

                                    {/* Leave Details - Show only when status is "On Leave" */}
                                    {formData.status === 'On Leave' && (
                                        <div className="mt-4 p-3 bg-light rounded border">
                                            <h6 className="fw-bold text-dark mb-3">Leave Details</h6>

                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup>
                                                        <Label for="leaveStartDate" className="fw-medium">Leave Start Date</Label>
                                                        <Input
                                                            id="leaveStartDate"
                                                            name="leaveStartDate"
                                                            type="date"
                                                            value={formData.leaveStartDate}
                                                            onChange={handleChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup>
                                                        <Label for="leaveEndDate" className="fw-medium">Leave End Date</Label>
                                                        <Input
                                                            id="leaveEndDate"
                                                            name="leaveEndDate"
                                                            type="date"
                                                            value={formData.leaveEndDate}
                                                            onChange={handleChange}
                                                            min={formData.leaveStartDate}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md={4}>
                                                    <FormGroup>
                                                        <Label for="totalLeaveDays" className="fw-medium">Total Leave Days</Label>
                                                        <Input
                                                            id="totalLeaveDays"
                                                            name="totalLeaveDays"
                                                            type="number"
                                                            min="0"
                                                            value={formData.totalLeaveDays}
                                                            readOnly
                                                            className="bg-white"
                                                        />
                                                        <small className="text-muted">Auto-calculated</small>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={4}>
                                                    <FormGroup>
                                                        <Label for="paidLeaveDays" className="fw-medium">Paid Leave Days</Label>
                                                        <Input
                                                            id="paidLeaveDays"
                                                            name="paidLeaveDays"
                                                            type="number"
                                                            min="0"
                                                            max={formData.totalLeaveDays}
                                                            value={formData.paidLeaveDays}
                                                            onChange={handleChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md={4}>
                                                    <FormGroup>
                                                        <Label for="unpaidLeaveDays" className="fw-medium">Unpaid Leave Days</Label>
                                                        <Input
                                                            id="unpaidLeaveDays"
                                                            name="unpaidLeaveDays"
                                                            type="number"
                                                            min="0"
                                                            max={formData.totalLeaveDays}
                                                            value={formData.unpaidLeaveDays}
                                                            onChange={handleChange}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                    )}

                                    {/* Upcoming Leave Notification for Active Employees */}
                                    {formData.status === 'Active' && formData.leaveStartDate && (
                                        (() => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const startDate = new Date(formData.leaveStartDate);
                                            startDate.setHours(0, 0, 0, 0);

                                            if (startDate > today) {
                                                return (
                                                    <div className="mt-4 p-3 bg-light rounded border border-warning">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <Calendar size={18} className="text-warning" />
                                                            <h6 className="fw-bold text-dark mb-0">Upcoming Leave Scheduled</h6>
                                                        </div>
                                                        <p className="text-muted small mb-2">
                                                            This employee is scheduled to go on leave soon.
                                                        </p>
                                                        <div className="p-2 bg-white rounded border d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <div className="fw-bold text-dark">
                                                                    {new Date(formData.leaveStartDate).toLocaleDateString()} - {new Date(formData.leaveEndDate).toLocaleDateString()}
                                                                </div>
                                                                <div className="small text-muted">
                                                                    {formData.totalLeaveDays} Days ({formData.paidLeaveDays} Paid, {formData.unpaidLeaveDays} Unpaid)
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                color="light"
                                                                className="border"
                                                                onClick={() => {
                                                                    // Switch to On Leave mode to edit details
                                                                    handleChange({ target: { name: 'status', value: 'On Leave' } });
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Row>
                                        <Col md={12}>
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
                                                <UncontrolledDropdown>
                                                    <DropdownToggle
                                                        caret
                                                        className="w-100 text-start d-flex justify-content-between align-items-center bg-white"
                                                        style={{
                                                            borderRadius: '0.375rem',
                                                            padding: '0.375rem 0.75rem',
                                                            color: '#6c757d',
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
                                                                        className="d-flex align-items-center justify-content-center rounded me-3"
                                                                        style={{
                                                                            width: '20px',
                                                                            height: '20px',
                                                                            minWidth: '20px',
                                                                            border: '1px solid',
                                                                            borderColor: isSelected ? '#0d3b2e' : '#6c757d',
                                                                            backgroundColor: isSelected ? '#0d3b2e' : 'white',
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        {isSelected && <Check size={14} color="white" strokeWidth={3} />}
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
                                                            className={`d-flex align-items-center justify-content-center rounded-circle border me-3 ${!formData.reportingTo ? 'border-primary' : 'bg-white border-secondary'}`}
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                minWidth: '20px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: !formData.reportingTo ? 'inset 0 0 0 4px #0d3b2e' : 'none',
                                                                borderColor: !formData.reportingTo ? '#0d3b2e' : '#6c757d'
                                                            }}
                                                        >
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
                                                                        className={`d-flex align-items-center justify-content-center rounded-circle border me-3 ${isSelected ? 'border-primary' : 'bg-white border-secondary'}`}
                                                                        style={{
                                                                            width: '20px',
                                                                            height: '20px',
                                                                            minWidth: '20px',
                                                                            transition: 'all 0.2s ease',
                                                                            boxShadow: isSelected ? 'inset 0 0 0 4px #0d3b2e' : 'none',
                                                                            borderColor: isSelected ? '#0d3b2e' : '#6c757d'
                                                                        }}
                                                                    >
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
                <Modal isOpen={warningModalOpen} toggle={() => setWarningModalOpen(false)} centered>
                    <ModalHeader toggle={() => setWarningModalOpen(false)} className="text-danger">Action Blocked</ModalHeader>
                    <ModalBody style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{warningMessage}</ModalBody>
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
        </>
    );
};

export default EmployeeList;
