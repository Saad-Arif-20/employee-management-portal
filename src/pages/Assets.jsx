import React, { useState } from 'react';
import {
    Card, CardBody, Badge, Button, Table,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input,
    ButtonGroup, Row, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
    Pagination, PaginationItem, PaginationLink, InputGroup, InputGroupText
} from 'reactstrap';
import { Plus, Monitor, Smartphone, HardDrive, User, Save, X, Edit, Trash2, Layers, Tag, Search, MoreVertical, ChevronDown, Printer, Download, Laptop, Keyboard } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
        quantity: 1,
        price: ''
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

    // Employee Search State
    const [employeeSearch, setEmployeeSearch] = useState('');

    // Barcode Generation State
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [showBarcodeView, setShowBarcodeView] = useState(false);
    const [showSelectionMode, setShowSelectionMode] = useState(false);

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
            case 'Laptop': return Laptop;
            case 'Mobile': return Smartphone;
            case 'Storage': return HardDrive;
            case 'Peripheral':
            case 'Peripheral (Keyboard, Mouse, etc.)': return Layers;
            case 'Chair':
            case 'Desk':
            case 'Furniture':
            case 'Furniture (Chair, Desk, etc.)': return Layers;
            case 'Other': return Layers;
            default: return Monitor;
        }
    };

    // Get employee details by name
    const getEmployeeDetails = (employeeName) => {
        if (!employeeName) return null;
        return employees.find(emp => emp.name === employeeName);
    };

    // Helper function to format price with commas
    const formatPrice = (price) => {
        if (!price) return '$0.00';
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return '$0.00';
        return '$' + numPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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
                quantity: 1,
                price: '',
                purchaseDate: ''
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
            quantity: 1,
            price: asset.price || '',
            purchaseDate: asset.purchaseDate || ''
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
            let updates = { ...prev, [name]: name === 'quantity' ? parseInt(value) || 1 : value };

            // Handle price formatting - only allow whole numbers (no decimals)
            if (name === 'price') {
                // Remove all non-numeric characters (including decimal points)
                const numericValue = value.replace(/[^0-9]/g, '');
                updates.price = numericValue;
            }

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

        // Purchase Date validation
        if (!formData.purchaseDate) {
            newErrors.purchaseDate = 'Purchase Date is required';
        }

        // Price validation
        if (!formData.price || formData.price === '' || formData.price === '0') {
            newErrors.price = 'Price is required and must be greater than 0';
        }

        if (!isEditMode && formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';

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

    // Function to generate a unique 6-digit asset tag
    const generateUniqueAssetTag = (existingTags = []) => {
        let tag;
        let attempts = 0;
        const maxAttempts = 1000;

        do {
            // Generate a random 6-digit number (000000 to 999999)
            const randomNumber = Math.floor(Math.random() * 1000000);
            tag = String(randomNumber).padStart(6, '0');
            attempts++;

            if (attempts >= maxAttempts) {
                // Fallback: use timestamp-based tag if we can't find a unique random one
                tag = Date.now().toString().slice(-6);
                break;
            }
        } while (existingTags.includes(tag));

        return tag;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            if (isEditMode) {
                // Edit mode - update single asset (keep existing assetTag)
                const { quantity, ...assetData } = formData;
                updateAsset(editingAssetId, assetData);
            } else {
                // Create mode - handle quantity with auto-generated tags
                const quantity = parseInt(formData.quantity);
                const existingTags = assets.map(a => a.assetTag);

                if (quantity === 1) {
                    // Single asset
                    const { quantity, assetTag, ...assetData } = formData;
                    const newTag = generateUniqueAssetTag(existingTags);
                    addAsset({
                        ...assetData,
                        assetTag: newTag
                    });
                } else {
                    // Multiple assets
                    const newAssets = [];
                    const usedTags = [...existingTags];

                    for (let i = 0; i < quantity; i++) {
                        const { quantity, assetTag, ...assetData } = formData;
                        const newTag = generateUniqueAssetTag(usedTags);
                        usedTags.push(newTag);

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

    // Handle selecting/deselecting assets for barcode generation
    const toggleAssetSelection = (assetId) => {
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        );
    };

    // Handle select all/deselect all
    const toggleSelectAll = () => {
        const currentAssetIds = currentAssets.map(asset => asset.id);
        const allCurrentSelected = currentAssetIds.every(id => selectedAssets.includes(id));

        if (allCurrentSelected) {
            // Deselect all current page assets
            setSelectedAssets(prev => prev.filter(id => !currentAssetIds.includes(id)));
        } else {
            // Select all current page assets
            const newSelections = [...new Set([...selectedAssets, ...currentAssetIds])];
            setSelectedAssets(newSelections);
        }
    };

    // Handle barcode generation
    const handleGenerateBarcodes = () => {
        if (selectedAssets.length > 0) {
            setShowBarcodeView(true);
        }
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.querySelector('[data-pdf-content]');
        if (!element) return;

        try {
            // Capture the element as canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Calculate PDF dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');

            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if content is longer than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            const filename = `QR-Code-Labels-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Get selected asset objects
    const getSelectedAssetObjects = () => {
        return assets.filter(asset => selectedAssets.includes(asset.id));
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Assets & Hardware</h2>
                    <p className="text-muted">Track company assets, hardware, and furniture.</p>
                </div>
                <div className="d-flex gap-2">
                    {!showSelectionMode ? (
                        <>
                            <Button
                                className="d-flex align-items-center gap-2 shadow-sm"
                                onClick={() => setShowSelectionMode(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                    border: 'none',
                                    color: 'white'
                                }}
                            >
                                <Printer size={18} />
                                <span>Select for Barcodes</span>
                            </Button>
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
                        </>
                    ) : (
                        <>
                            <Button
                                className="d-flex align-items-center gap-2 shadow-sm"
                                onClick={handleGenerateBarcodes}
                                disabled={selectedAssets.length === 0}
                                style={{
                                    background: selectedAssets.length > 0
                                        ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                                        : '#e5e7eb',
                                    border: 'none',
                                    color: selectedAssets.length > 0 ? 'white' : '#9ca3af',
                                    cursor: selectedAssets.length > 0 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                <Printer size={18} />
                                <span>Generate Barcodes {selectedAssets.length > 0 && `(${selectedAssets.length})`}</span>
                            </Button>
                            <Button
                                color="light"
                                className="border d-flex align-items-center gap-2"
                                onClick={() => {
                                    setShowSelectionMode(false);
                                    setSelectedAssets([]);
                                }}
                            >
                                <X size={18} />
                                <span>Cancel</span>
                            </Button>
                        </>
                    )}
                </div>
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
                            <Label className="fw-medium text-muted">Filter by Type</Label>
                            <UncontrolledDropdown>
                                <DropdownToggle
                                    caret
                                    className="w-100 text-start d-flex justify-content-between align-items-center border-0 bg-light"
                                    style={{
                                        borderRadius: '0.375rem',
                                        padding: '0.375rem 0.75rem',
                                        color: '#6c757d'
                                    }}
                                >
                                    {typeFilter || 'All Types'}
                                </DropdownToggle>
                                <DropdownMenu className="w-100">
                                    <DropdownItem onClick={() => setTypeFilter('')}>All Types</DropdownItem>
                                    <DropdownItem onClick={() => setTypeFilter('Laptop')}>Laptop</DropdownItem>
                                    <DropdownItem onClick={() => setTypeFilter('Mobile')}>Mobile</DropdownItem>
                                    <DropdownItem onClick={() => setTypeFilter('Storage')}>Storage</DropdownItem>
                                    <DropdownItem onClick={() => setTypeFilter('Peripheral (Keyboard, Mouse, etc.)')}>Peripheral</DropdownItem>
                                    <DropdownItem onClick={() => setTypeFilter('Furniture (Chair, Desk, etc.)')}>Furniture</DropdownItem>
                                    <DropdownItem onClick={() => setTypeFilter('Other')}>Other</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </Col>
                        <Col md={3}>
                            <Label className="fw-medium text-muted">Filter by Status</Label>
                            <UncontrolledDropdown>
                                <DropdownToggle
                                    caret
                                    className="w-100 text-start d-flex justify-content-between align-items-center border-0 bg-light"
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
                                    <DropdownItem onClick={() => setStatusFilter('Available')}>Available</DropdownItem>
                                    <DropdownItem onClick={() => setStatusFilter('Assigned')}>Assigned</DropdownItem>
                                    <DropdownItem onClick={() => setStatusFilter('Under maintenance')}>Under maintenance</DropdownItem>
                                    <DropdownItem onClick={() => setStatusFilter('Discarded')}>Discarded</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </Col>
                    </Row>

                    <div className="table-responsive" style={{ overflow: 'visible' }}>
                        <Table hover className="align-middle">
                            <thead className="bg-light">
                                <tr>
                                    {showSelectionMode && (
                                        <th className="border-0 px-4" style={{ width: '50px' }}>
                                            <Input
                                                type="checkbox"
                                                checked={currentAssets.length > 0 && currentAssets.every(asset => selectedAssets.includes(asset.id))}
                                                onChange={toggleSelectAll}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </th>
                                    )}
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Asset Tag</th>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Asset Name</th>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Type</th>
                                    <th className="border-0 fw-medium text-end px-4" style={{ color: '#0d3b2e', whiteSpace: 'nowrap' }}>Price (USD)</th>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Model (Optional)</th>
                                    <th className="border-0 fw-medium px-4" style={{ color: '#0d3b2e' }}>Assigned To</th>
                                    <th className="border-0 fw-medium text-center px-4" style={{ color: '#0d3b2e' }}>Status</th>
                                    <th className="border-0 fw-medium text-center px-4" style={{ color: '#0d3b2e' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAssets.length > 0 ? (
                                    currentAssets.map((asset) => {
                                        const Icon = getIcon(asset.type);
                                        return (
                                            <tr key={asset.id}>
                                                {showSelectionMode && (
                                                    <td className="border-bottom border-light py-3 px-4">
                                                        <Input
                                                            type="checkbox"
                                                            checked={selectedAssets.includes(asset.id)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleAssetSelection(asset.id);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                )}
                                                <td className="border-bottom border-light py-3 px-4">
                                                    <span className="text-dark">{asset.assetTag || 'N/A'}</span>
                                                </td>
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
                                                <td className="border-bottom border-light py-3 px-4 text-end">
                                                    <span className="text-muted">
                                                        {asset.price ? `$${parseFloat(asset.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-'}
                                                    </span>
                                                </td>
                                                <td className="border-bottom border-light py-3 px-4">
                                                    <span className="text-muted small">
                                                        {asset.modelNumber || '-'}
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
                <Form onSubmit={handleSubmit} noValidate>
                    <ModalBody className="px-4 py-4">
                        <Row className="mb-3">
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="name" className="fw-medium">Asset Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. MacBook Pro 16"
                                        value={formData.name}
                                        onChange={handleChange}
                                        invalid={!!errors.name}
                                    />
                                    {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="type" className="fw-medium">Type</Label>
                                    <UncontrolledDropdown>
                                        <DropdownToggle
                                            caret
                                            className="w-100 text-start d-flex justify-content-between align-items-center"
                                            style={{
                                                borderRadius: '0.375rem',
                                                border: '1px solid #ced4da',
                                                backgroundColor: 'white',
                                                padding: '0.375rem 0.75rem',
                                                color: '#495057'
                                            }}
                                        >
                                            {formData.type}
                                        </DropdownToggle>
                                        <DropdownMenu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, type: 'Laptop' }))}>
                                                Laptop
                                            </DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, type: 'Mobile' }))}>
                                                Mobile
                                            </DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, type: 'Storage' }))}>
                                                Storage
                                            </DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, type: 'Peripheral' }))}>
                                                Peripheral
                                            </DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, type: 'Furniture (Chair, Desk, etc.)' }))}>
                                                Furniture
                                            </DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, type: 'Other' }))}>
                                                Other
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            {isEditMode && (
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="assetTag" className="fw-medium">Asset Tag</Label>
                                        <Input
                                            id="assetTag"
                                            name="assetTag"
                                            placeholder="e.g. AST-001"
                                            value={formData.assetTag}
                                            onChange={handleChange}
                                            invalid={!!errors.assetTag}
                                            required
                                            readOnly={isEditMode}
                                            disabled={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                                        />
                                        {isEditMode && <small className="text-muted d-block mt-1">Asset tag cannot be changed after asset creation</small>}
                                        {errors.assetTag && <div className="invalid-feedback d-block">{errors.assetTag}</div>}
                                    </FormGroup>
                                </Col>
                            )}
                            <Col md={isEditMode ? 6 : 12}>
                                <FormGroup>
                                    <Label for="status" className="fw-medium">Status</Label>
                                    <UncontrolledDropdown>
                                        <DropdownToggle
                                            caret
                                            className="w-100 text-start d-flex justify-content-between align-items-center"
                                            style={{
                                                borderRadius: '0.375rem',
                                                border: '1px solid #ced4da',
                                                backgroundColor: formData.assignedTo ? '#e9ecef' : 'white',
                                                padding: '0.375rem 0.75rem',
                                                color: '#495057',
                                                cursor: formData.assignedTo ? 'not-allowed' : 'pointer',
                                                opacity: formData.assignedTo ? 0.6 : 1
                                            }}
                                            disabled={!!formData.assignedTo}
                                        >
                                            {formData.status}
                                        </DropdownToggle>
                                        <DropdownMenu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, status: 'Available' }))}>
                                                Available
                                            </DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, status: 'Assigned' }))}>
                                                Assigned
                                            </DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, status: 'Under maintenance' }))}>
                                                Under maintenance
                                            </DropdownItem>
                                            <DropdownItem onClick={() => setFormData(prev => ({ ...prev, status: 'Discarded' }))}>
                                                Discarded
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
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
                                    />
                                    {errors.serial && <div className="invalid-feedback d-block">{errors.serial}</div>}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="price" className="fw-medium">Price (USD)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="text"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={handleChange}
                                        invalid={!!errors.price}
                                        required
                                        readOnly={isEditMode}
                                        disabled={isEditMode}
                                        style={isEditMode ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                                    />
                                    {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
                                    {isEditMode && <small className="text-muted d-block mt-1">Price cannot be changed after asset creation</small>}
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="purchaseDate" className="fw-medium">Purchase Date</Label>
                                    <Input
                                        id="purchaseDate"
                                        name="purchaseDate"
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                        invalid={!!errors.purchaseDate}
                                        readOnly={isEditMode}
                                        disabled={isEditMode}
                                        style={isEditMode ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                                    />
                                    {errors.purchaseDate && <div className="invalid-feedback d-block">{errors.purchaseDate}</div>}
                                    {isEditMode && <small className="text-muted d-block mt-1">Purchase date cannot be changed after asset creation</small>}
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
                                        <div className="position-relative mb-2">
                                            <Search size={16} className="text-muted position-absolute" style={{ top: '10px', left: '10px' }} />
                                            <Input
                                                placeholder="Search employees..."
                                                className="ps-5"
                                                value={employeeSearch}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="border rounded bg-white p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            <div
                                                className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${!formData.assignedTo ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, assignedTo: '', status: 'Available' }))}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="fw-medium text-dark">-- Available --</div>
                                            </div>
                                            {employees
                                                .filter(emp =>
                                                    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                                    emp.role.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                                    emp.department.toLowerCase().includes(employeeSearch.toLowerCase())
                                                )
                                                .map(emp => {
                                                    const isSelected = formData.assignedTo === emp.name;
                                                    return (
                                                        <div
                                                            key={emp.id}
                                                            className={`d-flex align-items-center p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                                                            onClick={() => setFormData(prev => ({ ...prev, assignedTo: emp.name, status: 'Assigned' }))}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div>
                                                                <div className="fw-medium text-dark">{emp.name}</div>
                                                                <small className="text-muted">{emp.role} • {emp.department}</small>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </FormGroup>
                                </Col>
                            )}
                        </Row>
                    </ModalBody>
                    <ModalFooter className="px-4 py-3" style={{ borderTop: 'none' }}>
                        <Button color="light" className="border" onClick={toggleModal}>Cancel</Button>
                        <Button
                            type="submit"
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

            {/* Barcode Print View */}
            {showBarcodeView && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'white',
                        zIndex: 9999,
                        overflow: 'auto'
                    }}
                >
                    {/* Print Controls - Hidden when printing */}
                    <div
                        className="d-print-none p-4 border-bottom"
                        style={{
                            position: 'sticky',
                            top: 0,
                            backgroundColor: 'white',
                            zIndex: 1000
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="mb-0">QR Code Labels ({getSelectedAssetObjects().length})</h3>
                            <div className="d-flex gap-2">
                                <Button
                                    color="primary"
                                    onClick={handlePrint}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Printer size={18} />
                                    Print QR Codes
                                </Button>
                                <Button
                                    color="success"
                                    onClick={handleDownloadPDF}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Download size={18} />
                                    Download as PDF
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => {
                                        setShowBarcodeView(false);
                                        setSelectedAssets([]);
                                    }}
                                >
                                    <X size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Barcode Grid - Compact Label Format */}
                    <div
                        data-pdf-content
                        style={{
                            padding: '20px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '15px',
                            pageBreakInside: 'avoid'
                        }}
                    >
                        {getSelectedAssetObjects().map((asset, index) => {
                            return (
                                <div
                                    key={asset.id}
                                    style={{
                                        border: '1px dashed #d1d5db',
                                        borderRadius: '6px',
                                        padding: '16px 12px',
                                        textAlign: 'center',
                                        backgroundColor: 'white',
                                        pageBreakInside: 'avoid',
                                        breakInside: 'avoid',
                                        minHeight: '230px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Company Logo and Property Text */}
                                    <div
                                        style={{
                                            width: '100%',
                                            marginBottom: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <img
                                            src="/valus-logo.svg"
                                            alt="Valus.io"
                                            style={{
                                                height: '24px',
                                                width: 'auto',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <div
                                            style={{
                                                fontSize: '9px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                letterSpacing: '0.3px'
                                            }}
                                        >
                                            This is the Property of Valus.io
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
                                        {(() => {
                                            try {
                                                if (!asset.assetTag) {
                                                    return <div style={{ fontSize: '10px', color: '#ef4444' }}>No asset tag</div>;
                                                }

                                                const assetTagString = String(asset.assetTag).trim();

                                                if (assetTagString.length === 0) {
                                                    return <div style={{ fontSize: '10px', color: '#ef4444' }}>Invalid tag</div>;
                                                }

                                                // Create QR code data with asset information in readable format
                                                const qrData = `========================
   V A L U S . I O
 Property Information
========================

This device is the property 
of Valus.io

Asset Tag: ${asset.assetTag}
Name: ${asset.name}
Type: ${asset.type}
Serial: ${asset.serial || 'N/A'}
Assigned To: ${asset.assignedTo || 'Unassigned'}
Status: ${asset.status}

------------------------
If found, please contact:
+92 xxxxxx

Valus.io - All Rights Reserved`;

                                                return (
                                                    <QRCodeCanvas
                                                        value={qrData}
                                                        size={120}
                                                        level="M"
                                                        includeMargin={true}
                                                    />
                                                );
                                            } catch (error) {
                                                console.error('QR code rendering error for asset:', asset.assetTag, error);
                                                return (
                                                    <div style={{ fontSize: '9px', color: '#ef4444', padding: '5px' }}>
                                                        Error: {asset.assetTag}
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* Asset Details */}
                                    <div style={{ marginTop: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '8px', width: '100%' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '3px', lineHeight: '1.2' }}>
                                            {asset.assetTag}
                                        </div>
                                        <div style={{ fontSize: '10px', fontWeight: '600', color: '#374151', marginBottom: '2px', lineHeight: '1.2' }}>
                                            {asset.name.length > 20 ? asset.name.substring(0, 20) + '...' : asset.name}
                                        </div>
                                        <div style={{ fontSize: '8px', color: '#6b7280', lineHeight: '1.2' }}>
                                            {asset.type}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Print Styles */}
                    <style>{`
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            
                            @page {
                                size: A4;
                                margin: 10mm;
                            }
                            
                            .d-print-none {
                                display: none !important;
                            }
                            
                            /* Ensure labels don't break across pages */
                            div[style*="breakInside"] {
                                page-break-inside: avoid;
                                break-inside: avoid;
                            }
                        }
                    `}</style>
                </div>
            )}
        </div >
    );
};

export default Assets;
