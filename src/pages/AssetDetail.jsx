import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Badge, Button, Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input
} from 'reactstrap';
import { ArrowLeft, Monitor, Smartphone, HardDrive, Layers, User, Edit, Calendar, DollarSign, Tag, AlertCircle, Package } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

const AssetDetail = () => {
    const { assetTag } = useParams();
    const navigate = useNavigate();
    const { assets, employees, updateAsset } = useGlobal();

    // Find asset by tag
    const asset = assets.find(a => a.assetTag === assetTag);

    // Modal states
    const [reportIssueModal, setReportIssueModal] = useState(false);
    const [issueDescription, setIssueDescription] = useState('');

    if (!asset) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center">
                    <AlertCircle size={64} className="text-muted mb-3" />
                    <h3 className="text-dark mb-2">Asset Not Found</h3>
                    <p className="text-muted mb-4">
                        No asset found with tag: <strong>{assetTag}</strong>
                    </p>
                    <Button
                        onClick={() => navigate('/assets')}
                        style={{
                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                            border: 'none',
                            color: 'white'
                        }}
                    >
                        <ArrowLeft size={18} className="me-2" />
                        Back to Assets
                    </Button>
                </div>
            </div>
        );
    }

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

    const Icon = getIcon(asset.type);
    const assignedEmployee = employees.find(emp => emp.name === asset.assignedTo);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'success';
            case 'Assigned': return 'primary';
            case 'Under maintenance': return 'warning';
            case 'Discarded': return 'danger';
            default: return 'secondary';
        }
    };

    const handleReportIssue = () => {
        // In a real app, this would send to a ticketing system
        alert(`Issue reported for ${asset.name}: ${issueDescription}`);
        setReportIssueModal(false);
        setIssueDescription('');
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="mb-4">
                <Button
                    color="light"
                    className="border mb-3"
                    onClick={() => navigate('/assets')}
                >
                    <ArrowLeft size={18} className="me-2" />
                    Back to Assets
                </Button>
                <h2 className="fw-bold text-dark mb-1">Asset Details</h2>
                <p className="text-muted">Complete information for asset {asset.assetTag}</p>
            </div>

            <Row>
                {/* Main Asset Information */}
                <Col lg={8}>
                    <Card className="glass-card border-0 mb-4">
                        <CardBody className="p-4">
                            {/* Asset Header */}
                            <div className="d-flex align-items-start justify-content-between mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="p-3 rounded-3"
                                        style={{
                                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                            color: 'white'
                                        }}
                                    >
                                        <Icon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold text-dark mb-1">{asset.name}</h3>
                                        <div className="d-flex align-items-center gap-2">
                                            <Tag size={16} className="text-muted" />
                                            <span className="text-muted">{asset.assetTag}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge color={getStatusColor(asset.status)} className="px-3 py-2">
                                    {asset.status}
                                </Badge>
                            </div>

                            {/* Asset Details Grid */}
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <Package size={18} className="text-muted" />
                                            <span className="text-muted small">Type</span>
                                        </div>
                                        <div className="fw-semibold text-dark">{asset.type}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <DollarSign size={18} className="text-muted" />
                                            <span className="text-muted small">Price</span>
                                        </div>
                                        <div className="fw-semibold text-dark">
                                            ${parseFloat(asset.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </Col>
                                {asset.modelNumber && (
                                    <Col md={6}>
                                        <div className="p-3 bg-light rounded-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Tag size={18} className="text-muted" />
                                                <span className="text-muted small">Model Number</span>
                                            </div>
                                            <div className="fw-semibold text-dark">{asset.modelNumber}</div>
                                        </div>
                                    </Col>
                                )}
                                {asset.serial && (
                                    <Col md={6}>
                                        <div className="p-3 bg-light rounded-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Tag size={18} className="text-muted" />
                                                <span className="text-muted small">Serial Number</span>
                                            </div>
                                            <div className="fw-semibold text-dark">{asset.serial}</div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </CardBody>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="glass-card border-0">
                        <CardBody className="p-4">
                            <h5 className="fw-bold text-dark mb-3">Quick Actions</h5>
                            <div className="d-flex gap-2 flex-wrap">
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => setReportIssueModal(true)}
                                >
                                    <AlertCircle size={18} className="me-2" />
                                    Report Issue
                                </Button>
                                <Button
                                    color="light"
                                    className="border"
                                    onClick={() => navigate(`/assets`)}
                                >
                                    <Edit size={18} className="me-2" />
                                    Edit Asset
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* Assignment Information */}
                <Col lg={4}>
                    <Card className="glass-card border-0">
                        <CardBody className="p-4">
                            <h5 className="fw-bold text-dark mb-3">Assignment Information</h5>

                            {asset.assignedTo && assignedEmployee ? (
                                <div>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div
                                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                            style={{ width: '48px', height: '48px' }}
                                        >
                                            <User size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark">{assignedEmployee.name}</div>
                                            <div className="small text-muted">{assignedEmployee.role}</div>
                                        </div>
                                    </div>

                                    <div className="border-top pt-3">
                                        <div className="small text-muted mb-1">Department</div>
                                        <div className="fw-medium text-dark mb-3">{assignedEmployee.department}</div>

                                        <div className="small text-muted mb-1">Email</div>
                                        <div className="fw-medium text-dark">{assignedEmployee.email}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="text-muted mb-2">
                                        <Package size={48} className="opacity-50" />
                                    </div>
                                    <p className="text-muted mb-0">Not currently assigned</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Asset Info Card */}
                    <Card className="glass-card border-0 mt-3">
                        <CardBody className="p-4">
                            <h5 className="fw-bold text-dark mb-3">Asset Information</h5>
                            <div className="small">
                                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                    <span className="text-muted">Asset Tag</span>
                                    <span className="fw-semibold text-dark">{asset.assetTag}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                    <span className="text-muted">Status</span>
                                    <Badge color={getStatusColor(asset.status)}>{asset.status}</Badge>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Type</span>
                                    <span className="fw-semibold text-dark">{asset.type}</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Report Issue Modal */}
            <Modal isOpen={reportIssueModal} toggle={() => setReportIssueModal(false)}>
                <ModalHeader toggle={() => setReportIssueModal(false)}>
                    Report Issue
                </ModalHeader>
                <ModalBody>
                    <p className="text-muted mb-3">
                        Report an issue with <strong>{asset.name}</strong> (Tag: {asset.assetTag})
                    </p>
                    <FormGroup>
                        <Label>Issue Description</Label>
                        <Input
                            type="textarea"
                            rows={4}
                            placeholder="Describe the issue..."
                            value={issueDescription}
                            onChange={(e) => setIssueDescription(e.target.value)}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" className="border" onClick={() => setReportIssueModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReportIssue}
                        disabled={!issueDescription.trim()}
                        style={{
                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                            border: 'none',
                            color: 'white'
                        }}
                    >
                        Submit Report
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AssetDetail;
