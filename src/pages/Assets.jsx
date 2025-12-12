import React, { useState } from 'react';
import {
    Card, CardBody, Badge, Button, Table,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input,
    ButtonGroup, Row, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
    Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import { Plus, Monitor, Smartphone, HardDrive, User, Save, X, Edit, Trash2, Layers, Tag, Search, MoreVertical, ChevronDown } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

const Assets = () => {
    const { assets, addAsset, addAssets, updateAsset, removeAsset, employees } = useGlobal();
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAssetId, setEditingAssetId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Laptop',
        assetTag: '',
        modelNumber: '',
        serial: '',
        assignedTo: '',
        status: 'Available',
        quantity: 1
    });

    // Delete Confirmation Modal
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Tooltip State
    const [hoveredEmployee, setHoveredEmployee] = useState(null);

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, statusFilter]);

    const filteredAssets = assets.filter(asset => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            asset.name.toLowerCase().includes(query) ||
            asset.assetTag.toLowerCase().includes(query) ||
            (asset.serial && asset.serial.toLowerCase().includes(query)) ||
            (asset.assignedTo && asset.assignedTo.toLowerCase().includes(query)) ||
            asset.type.toLowerCase().includes(query)
        );
        const matchesType = !typeFilter || asset.type === typeFilter;
        const matchesStatus = !statusFilter || asset.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    // Pagination Logic
    const indexOfLastAsset = currentPage * itemsPerPage;
    const indexOfFirstAsset = indexOfLastAsset - itemsPerPage;
    const currentAssets = filteredAssets.slice(indexOfFirstAsset, indexOfLastAsset);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getIcon = (type) => {
        switch (type) {
            case 'Mobile': return Smartphone;
            case 'Storage': return HardDrive;
            case 'Chair':
            case 'Desk':
            case 'Furniture':
            case 'Furniture (Chair, Desk, etc.)': return Layers;
            default: return Monitor;
        }
    };

    // Get employee details by name
    const getEmployeeDetails = (employeeName) => {
        if (!employeeName) return null;
        return employees.find(emp => emp.name === employeeName);
    };

    const [errors, setErrors] = useState({});

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        setErrors({});
        if (!modalOpen) {
            // Reset form when opening for new entry
            setFormData({
                name: '',
                type: 'Laptop',
                assetTag: '',
                modelNumber: '',
                serial: '',
                assignedTo: '',
                status: 'Available',
                quantity: 1
            });
            setIsEditMode(false);
            setEditingAssetId(null);
        }
    };

    const handleEditClick = (asset) => {
        setFormData({
            name: asset.name,
            type: asset.type,
            assetTag: asset.assetTag || '',
            modelNumber: asset.modelNumber || '',
            serial: asset.serial || '',
            assignedTo: asset.assignedTo || '',
            status: asset.status,
            quantity: 1
        });
        setIsEditMode(true);
        setEditingAssetId(asset.id);
        setModalOpen(true);
    };

    const confirmDelete = (asset) => {
        setAssetToDelete(asset);
        setConfirmDeleteModalOpen(true);
    };

    const handleDeleteAsset = () => {
        if (assetToDelete) {
            removeAsset(assetToDelete.id);
            setConfirmDeleteModalOpen(false);
            setAssetToDelete(null);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: name === 'quantity' ? parseInt(value) || 1 : value };

            if (name === 'assignedTo') {
                updates.status = value ? 'Assigned' : 'Available';
            }

            // Clear assignedTo when quantity > 1
            if (name === 'quantity' && parseInt(value) > 1) {
                updates.assignedTo = '';
                updates.status = 'Available';
            }

            return updates;
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };



    const validate = () => {
        const newErrors = {};

        // Asset Name validation
        if (!formData.name) {
            newErrors.name = 'Asset Name is required';
        } else if (!/[a-zA-Z]/.test(formData.name)) {
            newErrors.name = 'Asset Name must contain at least one letter';
        }

        // Asset Tag validation
        if (!formData.assetTag) {
            newErrors.assetTag = 'Asset Tag is required';
        } else if (!/^[a-zA-Z]+-\d+$/.test(formData.assetTag)) {
            newErrors.assetTag = 'Asset Tag must follow format: LETTER(S)-NUMBER(S) (e.g., AST-001, LP-123)';
        }

        if (!isEditMode && formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';

        // Check for duplicate Asset Tag
        if (isEditMode) {
            const duplicateTag = assets.find(a =>
                a.assetTag && a.assetTag.toLowerCase() === formData.assetTag.toLowerCase() &&
                a.id !== editingAssetId
            );
            if (duplicateTag) newErrors.assetTag = 'Asset Tag already exists';
        } else {
            // Create mode
            const quantity = parseInt(formData.quantity) || 1;

            if (quantity === 1) {
                const duplicateTag = assets.find(a =>
                    a.assetTag && a.assetTag.toLowerCase() === formData.assetTag.toLowerCase()
                );
                if (duplicateTag) newErrors.assetTag = 'Asset Tag already exists';
            } else {
                // Check all generated tags for bulk creation
                const baseTag = formData.assetTag;
                const match = baseTag.match(/^(.*?)(\d+)$/);

                for (let i = 0; i < quantity; i++) {
                    let tagToCheck;
                    if (match) {
                        const prefix = match[1];
                        const numberStr = match[2];
                        const startNumber = parseInt(numberStr, 10);
                        const padding = numberStr.length;
                        const currentNumber = startNumber + i;
                        tagToCheck = `${prefix}${String(currentNumber).padStart(padding, '0')}`;
                    } else {
                        tagToCheck = i === 0 ? baseTag : `${baseTag}-${i + 1}`;
                    }

                    const duplicateTag = assets.find(a =>
                        a.assetTag && a.assetTag.toLowerCase() === tagToCheck.toLowerCase()
                    );

                    if (duplicateTag) {
                        newErrors.assetTag = `Asset Tag '${tagToCheck}' already exists`;
                        break;
                    }
                }
            }
        }

        // Serial Number validation - now optional
        if (formData.serial) {
            const duplicateSerial = assets.find(a =>
                a.serial === formData.serial &&
                (!isEditMode || a.id !== editingAssetId)
            );
            if (duplicateSerial) {
                newErrors.serial = 'Serial Number already exists';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            if (isEditMode) {
                // Edit mode - update single asset
                const { quantity, ...assetData } = formData;
                updateAsset(editingAssetId, assetData);
            } else {
                // Create mode - handle quantity
                const quantity = parseInt(formData.quantity);
                if (quantity === 1) {
                    // Single asset
                    const { quantity, ...assetData } = formData;
                    addAsset(assetData);
                } else {
                    // Multiple assets
                    const newAssets = [];
                    const baseTag = formData.assetTag;
                    const match = baseTag.match(/^(.*?)(\d+)$/);

                    for (let i = 0; i < quantity; i++) {
                        const { quantity, ...assetData } = formData;

                        let newTag;
                        if (match) {
                            const prefix = match[1];
                            const numberStr = match[2];
                            const startNumber = parseInt(numberStr, 10);
                            const padding = numberStr.length;
                            const currentNumber = startNumber + i;
                            newTag = `${prefix}${String(currentNumber).padStart(padding, '0')}`;
                        } else {
                            newTag = i === 0 ? baseTag : `${baseTag}-${i + 1}`;
                        }

                        newAssets.push({
                            ...assetData,
                            assetTag: newTag,
                            assignedTo: '',
                            status: 'Available'
                        });
                    }
                    addAssets(newAssets);
                }
            }
            setModalOpen(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Assets & Hardware</h2>
                    <p className="text-muted">Track company assets, hardware, and furniture.</p>
                </div>
                <Button
                    className="d-flex align-items-center gap-2 shadow-sm"
                    onClick={toggleModal}
                    style={{
                        background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                        border: 'none',
                        color: 'white'
                    }}
                >
                    <Plus size={18} />
                    <span>Enroll Asset</span>
                </Button>
            </div>

            <Card className="glass-card border-0">
                <CardBody>
                    <Row className="mb-5 mt-4 px-4">
                        <Col md={4}>
                            <Label htmlFor="search-assets" className="fw-medium text-muted">Search Assets</Label>
                            <div className="position-relative">
                                <Search className="position-absolute text-muted" size={18} style={{ top: '50%', left: '15px', transform: 'translateY(-50%)' }} />
                                <Input
                                    id="search-assets"
                                    type="text"
                                    placeholder="Search assets..."
                                    className="ps-5 border-0 bg-light"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={3}>
                            <Label htmlFor="type-filter" className="fw-medium text-muted">Filter by Type</Label>
                            <Input
                                id="type-filter"
                                type="select"
                                className="border-0 bg-light"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Storage">Storage</option>
                                <option value="Peripheral (Keyboard, Mouse, etc.)">Peripheral</option>
                                <option value="Furniture (Chair, Desk, etc.)">Furniture</option>
                                <option value="Other">Other</option>
                            </Input>
                        </Col>
                        <Col md={3}>
                            <Label htmlFor="status-filter" className="fw-medium text-muted">Filter by Status</Label>
                            <Input
                                id="status-filter"
                                type="select"
                                className="border-0 bg-light"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="Available">Available</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Under maintenance">Under maintenance</option>
                                <option value="Discarded">Discarded</option>
                            </Input>
                        </Col>
                    </Row>

                    <div className="table-responsive" style={{ overflow: 'visible' }}>
                        <Table hover className="align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 text-muted fw-medium px-4">Asset Name</th>
                                    <th className="border-0 text-muted fw-medium px-4">Type</th>
                                    <th className="border-0 text-muted fw-medium px-4">Asset Tag</th>
                                    <th className="border-0 text-muted fw-medium px-4">Model (Optional)</th>
                                    <th className="border-0 text-muted fw-medium px-4">Serial (Optional)</th>
                                    <th className="border-0 text-muted fw-medium px-4">Assigned To</th>
                                    <th className="border-0 text-muted fw-medium text-center px-4">Status</th>
                                    <th className="border-0 text-muted fw-medium text-center px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAssets.length > 0 ? (
                                    currentAssets.map((asset) => {
                                        const Icon = getIcon(asset.type);
                                        return (
                                            <tr key={asset.id}>
                                                <td className="border-bottom border-light py-3 px-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="p-2 rounded bg-light">
                                                            <Icon size={18} className="text-secondary" />
                                                        </div>
                                                        <span className="fw-bold text-dark">{asset.name}</span>
                                                    </div>
                                                </td>
                                                <td className="border-bottom border-light py-3 px-4">
                                                    <span className="text-muted">{asset.type}</span>
                                                </td>
                                                <td className="border-bottom border-light py-3 px-4">
                                                    <Badge color="light" className="text-dark border">
                                                        {asset.assetTag || 'N/A'}
                                                    </Badge>
                                                </td>
                                                <td className="border-bottom border-light py-3 px-4">
                                                    <span className="text-muted small">
                                                        {asset.modelNumber || '-'}
                                                    </span>
                                                </td>
                                                <td className="border-bottom border-light py-3 px-4">
                                                    <span className="text-muted font-monospace small">
                                                        {asset.serial || '-'}
                                                    </span>
                                                </td>
                                                <td className="border-bottom border-light py-3 px-4">
                                                    {asset.assignedTo ? (
                                                        <div
                                                            className="position-relative d-inline-block"
                                                            onMouseEnter={() => setHoveredEmployee(asset.id)}
                                                            onMouseLeave={() => setHoveredEmployee(null)}
                                                        >
                                                            <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                                                <User size={14} className="text-muted" />
                                                                <span className="text-dark">{asset.assignedTo}</span>
                                                            </div>
                                                            {hoveredEmployee === asset.id && getEmployeeDetails(asset.assignedTo) && (
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
                                                                    pointerEvents: 'none',
                                                                    opacity: 0,
                                                                    animation: 'tooltipFadeIn 0.15s ease-in forwards'
                                                                }}>
                                                                    <div className="text-start">
                                                                        <div><strong>Designation:</strong> {getEmployeeDetails(asset.assignedTo).role}</div>
                                                                        <div><strong>Email:</strong> {getEmployeeDetails(asset.assignedTo).email}</div>
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
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td className="border-bottom border-light py-3 px-4 text-center">
                                                    <Badge
                                                        className="px-3 py-2 rounded-pill bg-opacity-10"
                                                        style={{
                                                            backgroundColor:
                                                                asset.status === 'Assigned' ? 'rgba(13, 59, 46, 0.1)' :
                                                                    asset.status === 'Under maintenance' ? 'rgba(251, 191, 36, 0.1)' :
                                                                        asset.status === 'Discarded' ? 'rgba(239, 68, 68, 0.1)' :
                                                                            'rgba(16, 185, 129, 0.1)',
                                                            color:
                                                                asset.status === 'Assigned' ? '#0d3b2e' :
                                                                    asset.status === 'Under maintenance' ? '#f59e0b' :
                                                                        asset.status === 'Discarded' ? '#ef4444' :
                                                                            '#10b981',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {asset.status}
                                                    </Badge>
                                                </td>
                                                <td className="border-bottom border-light py-3 text-center px-4">
                                                    <div className="d-flex justify-content-center">
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
                                                                <DropdownItem className="px-3 py-1" onClick={() => handleEditClick(asset)}>
                                                                    <Edit size={14} className="me-2" /> Update Asset
                                                                </DropdownItem>
                                                                <DropdownItem className="text-danger px-3 py-1" onClick={() => confirmDelete(asset)}>
                                                                    <Trash2 size={14} className="me-2" /> Delete Asset
                                                                </DropdownItem>
                                                            </DropdownMenu>
                                                        </UncontrolledDropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            No assets found. Click "Enroll Asset" to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {filteredAssets.length > 0 && (
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

            {/* Enroll/Edit Asset Modal */}
            <Modal isOpen={modalOpen} toggle={toggleModal} size="lg" centered>
                <ModalHeader toggle={toggleModal}>
                    {isEditMode ? 'Edit Asset' : 'Enroll New Asset'}
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <ModalBody className="px-4 py-4">
                        <Row className="mb-3">
                            <Col md={8}>
                                <FormGroup>
                                    <Label for="name" className="fw-medium">Asset Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. MacBook Pro 16"
                                        value={formData.name}
                                        onChange={handleChange}
                                        invalid={!!errors.name}
                                        className="form-control-lg"
                                    />
                                    {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="type" className="fw-medium">Type</Label>
                                    <Input
                                        id="type"
                                        name="type"
                                        type="select"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="form-control-lg"
                                    >
                                        <option value="Laptop">Laptop</option>
                                        <option value="Mobile">Mobile</option>
                                        <option value="Storage">Storage</option>
                                        <option value="Peripheral (Keyboard, Mouse, etc.)">Peripheral</option>
                                        <option value="Furniture (Chair, Desk, etc.)">Furniture</option>
                                        <option value="Other">Other</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="assetTag" className="fw-medium">Asset Tag <span className="text-danger">*</span></Label>
                                    <Input
                                        id="assetTag"
                                        name="assetTag"
                                        placeholder="e.g. AST-001"
                                        value={formData.assetTag}
                                        onChange={handleChange}
                                        invalid={!!errors.assetTag}
                                        required
                                        className="form-control-lg"
                                    />
                                    {errors.assetTag && <div className="invalid-feedback d-block">{errors.assetTag}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="status" className="fw-medium">Status</Label>
                                    <Input
                                        id="status"
                                        name="status"
                                        type="select"
                                        value={formData.status}
                                        onChange={handleChange}
                                        disabled={!!formData.assignedTo}
                                        className="form-control-lg"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Assigned">Assigned</option>
                                        <option value="Under maintenance">Under maintenance</option>
                                        <option value="Discarded">Discarded</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="modelNumber" className="fw-medium">Model Number <span className="text-muted small">(Optional)</span></Label>
                                    <Input
                                        id="modelNumber"
                                        name="modelNumber"
                                        placeholder="e.g. MBP-2023"
                                        value={formData.modelNumber}
                                        onChange={handleChange}
                                        className="form-control-lg"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="serial" className="fw-medium">Serial Number <span className="text-muted small">(Optional)</span></Label>
                                    <Input
                                        id="serial"
                                        name="serial"
                                        placeholder="e.g. SN-12345678"
                                        value={formData.serial}
                                        onChange={handleChange}
                                        invalid={!!errors.serial}
                                        className="form-control-lg"
                                    />
                                    {errors.serial && <div className="invalid-feedback d-block">{errors.serial}</div>}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            {!isEditMode && (
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="quantity" className="fw-medium">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            invalid={!!errors.quantity}
                                            className="form-control-lg"
                                        />
                                        <small className="text-muted">
                                            Enter quantity &gt; 1 to create multiple assets with auto-generated tags
                                        </small>
                                        {errors.quantity && <div className="invalid-feedback d-block">{errors.quantity}</div>}
                                    </FormGroup>
                                </Col>
                            )}
                            {(isEditMode || formData.quantity === 1) && (
                                <Col md={!isEditMode ? 6 : 12}>
                                    <FormGroup>
                                        <Label for="assignedTo" className="fw-medium">Assign To <span className="text-muted small">(Optional)</span></Label>
                                        <Input
                                            id="assignedTo"
                                            name="assignedTo"
                                            type="select"
                                            value={formData.assignedTo}
                                            onChange={handleChange}
                                            className="form-control-lg"
                                        >
                                            <option value="">-- Available --</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.name}>
                                                    {emp.name} ({emp.role})
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                </Col>
                            )}
                        </Row>
                    </ModalBody>
                    <ModalFooter className="px-4 py-3">
                        <Button color="light" size="lg" className="border" onClick={toggleModal}>Cancel</Button>
                        <Button
                            type="submit"
                            size="lg"
                            style={{
                                background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                border: 'none',
                                color: 'white'
                            }}
                        >
                            {isEditMode ? 'Update Asset' : 'Enroll Asset'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            < Modal isOpen={confirmDeleteModalOpen} toggle={() => setConfirmDeleteModalOpen(false)}>
                <ModalHeader toggle={() => setConfirmDeleteModalOpen(false)} className="text-danger">
                    Confirm Deletion
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to delete the asset <strong>{assetToDelete?.name}</strong>? This action cannot be undone.
                </ModalBody>
                <ModalFooter>
                    <Button color="light" className="border" onClick={() => setConfirmDeleteModalOpen(false)}>Cancel</Button>
                    <Button color="danger" onClick={handleDeleteAsset}>Delete</Button>
                </ModalFooter>
            </Modal >
        </div >
    );
};

export default Assets;
