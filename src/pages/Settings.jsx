import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, Progress, InputGroup, InputGroupText } from 'reactstrap';
import { Lock, User, Mail, Shield, Check, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api.service';

const Settings = () => {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [validationErrors, setValidationErrors] = useState({
        length: false,
        match: false,
        filled: false
    });

    // Check password requirements in real-time
    useEffect(() => {
        const errors = {
            length: newPassword.length >= 6,
            match: newPassword === confirmPassword && confirmPassword.length > 0,
            filled: currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0
        };
        setValidationErrors(errors);

        // Calculate password strength
        let strength = 0;
        if (newPassword.length >= 6) strength += 25;
        if (newPassword.length >= 8) strength += 25;
        if (/[A-Z]/.test(newPassword)) strength += 25;
        if (/[0-9]/.test(newPassword)) strength += 25;
        setPasswordStrength(strength);
    }, [currentPassword, newPassword, confirmPassword]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'danger', text: 'Please fill in all fields' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'New password must be at least 6 characters' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'danger', text: 'New passwords do not match' });
            return;
        }

        try {
            setLoading(true);
            const response = await authService.updatePassword(currentPassword, newPassword);

            if (response.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordStrength(0);
            } else {
                setMessage({ type: 'danger', text: response.message || 'Failed to change password' });
            }
        } catch (error) {
            setMessage({
                type: 'danger',
                text: error.response?.data?.message || 'Failed to change password. Please check your current password.'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength < 25) return 'danger';
        if (passwordStrength < 50) return 'warning';
        if (passwordStrength < 75) return 'info';
        return 'success';
    };

    const getStrengthText = () => {
        if (passwordStrength < 25) return 'Weak';
        if (passwordStrength < 50) return 'Fair';
        if (passwordStrength < 75) return 'Good';
        return 'Strong';
    };

    return (
        <Container fluid className="p-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold">Account Settings</h2>
                    <p className="text-muted">Manage your account settings and preferences</p>
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    {/* User Information Card */}
                    <Card className="mb-4 shadow-sm border-0">
                        <CardBody className="p-4">
                            <h5 className="fw-bold mb-4">
                                <User size={20} className="me-2" />
                                User Information
                            </h5>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Label className="text-muted small">Username</Label>
                                    <div className="d-flex align-items-center p-3 bg-light rounded">
                                        <User size={18} className="text-muted me-2" />
                                        <span className="fw-semibold">{user?.username || 'N/A'}</span>
                                    </div>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Label className="text-muted small">Email</Label>
                                    <div className="d-flex align-items-center p-3 bg-light rounded">
                                        <Mail size={18} className="text-muted me-2" />
                                        <span className="fw-semibold">{user?.email || 'N/A'}</span>
                                    </div>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Label className="text-muted small">Role</Label>
                                    <div className="d-flex align-items-center p-3 bg-light rounded">
                                        <Shield size={18} className="text-muted me-2" />
                                        <span className="fw-semibold text-capitalize">{user?.role || 'N/A'}</span>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* Change Password Card */}
                    <Card className="shadow-sm border-0">
                        <CardBody className="p-4">
                            <h5 className="fw-bold mb-4">
                                <Lock size={20} className="me-2" />
                                Change Password
                            </h5>

                            {message.text && (
                                <Alert color={message.type} className="mb-4">
                                    {message.text}
                                </Alert>
                            )}

                            <Form onSubmit={handlePasswordChange}>
                                <FormGroup className="mb-3">
                                    <Label for="currentPassword" className="fw-semibold">
                                        Current Password
                                    </Label>
                                    <InputGroup>
                                        <Input
                                            type={showCurrentPassword ? "text" : "password"}
                                            id="currentPassword"
                                            placeholder="Enter your current password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            style={{ padding: '12px', borderRadius: '8px 0 0 8px', borderRight: 'none' }}
                                            required
                                        />
                                        <InputGroupText
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={{
                                                background: 'white',
                                                borderRadius: '0 8px 8px 0',
                                                cursor: 'pointer',
                                                borderLeft: 'none',
                                                padding: '0 12px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff size={20} style={{ color: '#6c757d' }} />
                                            ) : (
                                                <Eye size={20} style={{ color: '#6c757d' }} />
                                            )}
                                        </InputGroupText>
                                    </InputGroup>
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <Label for="newPassword" className="fw-semibold">
                                        New Password
                                    </Label>
                                    <InputGroup>
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            id="newPassword"
                                            placeholder="Enter your new password (min 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ padding: '12px', borderRadius: '8px 0 0 8px', borderRight: 'none' }}
                                            required
                                            minLength={6}
                                        />
                                        <InputGroupText
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                background: 'white',
                                                borderRadius: '0 8px 8px 0',
                                                cursor: 'pointer',
                                                borderLeft: 'none',
                                                padding: '0 12px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff size={20} style={{ color: '#6c757d' }} />
                                            ) : (
                                                <Eye size={20} style={{ color: '#6c757d' }} />
                                            )}
                                        </InputGroupText>
                                    </InputGroup>
                                    {newPassword && (
                                        <div className="mt-2">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <small className="text-muted">Password Strength:</small>
                                                <small className={`fw-bold text-${getStrengthColor()}`}>
                                                    {getStrengthText()}
                                                </small>
                                            </div>
                                            <Progress
                                                value={passwordStrength}
                                                color={getStrengthColor()}
                                                style={{ height: '6px' }}
                                            />
                                        </div>
                                    )}
                                </FormGroup>

                                <FormGroup className="mb-4">
                                    <Label for="confirmPassword" className="fw-semibold">
                                        Confirm New Password
                                    </Label>
                                    <InputGroup>
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            style={{ padding: '12px', borderRadius: '8px 0 0 8px', borderRight: 'none' }}
                                            required
                                        />
                                        <InputGroupText
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                background: 'white',
                                                borderRadius: '0 8px 8px 0',
                                                cursor: 'pointer',
                                                borderLeft: 'none',
                                                padding: '0 12px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} style={{ color: '#6c757d' }} />
                                            ) : (
                                                <Eye size={20} style={{ color: '#6c757d' }} />
                                            )}
                                        </InputGroupText>
                                    </InputGroup>
                                    {confirmPassword && (
                                        <div className="mt-2">
                                            {newPassword === confirmPassword ? (
                                                <small className="text-success">
                                                    <Check size={14} className="me-1" />
                                                    Passwords match
                                                </small>
                                            ) : (
                                                <small className="text-danger">
                                                    <X size={14} className="me-1" />
                                                    Passwords do not match
                                                </small>
                                            )}
                                        </div>
                                    )}
                                </FormGroup>

                                <Button
                                    color="primary"
                                    type="submit"
                                    disabled={loading || !validationErrors.length || !validationErrors.match || !validationErrors.filled}
                                    style={{
                                        padding: '12px 32px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                        border: 'none',
                                        fontWeight: '600'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} className="me-2" style={{ marginBottom: '2px' }} />
                                            Change Password
                                        </>
                                    )}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="shadow-sm border-0 bg-light">
                        <CardBody className="p-4">
                            <h6 className="fw-bold mb-3">Password Requirements</h6>
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2 d-flex align-items-start">
                                    {validationErrors.length ? (
                                        <Check size={16} className="text-success me-2 mt-1" />
                                    ) : (
                                        <X size={16} className="text-muted me-2 mt-1" />
                                    )}
                                    <span className={validationErrors.length ? 'text-success' : 'text-muted'}>
                                        At least 6 characters long
                                    </span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                    {newPassword.length >= 8 ? (
                                        <Check size={16} className="text-success me-2 mt-1" />
                                    ) : (
                                        <X size={16} className="text-muted me-2 mt-1" />
                                    )}
                                    <span className={newPassword.length >= 8 ? 'text-success' : 'text-muted'}>
                                        8+ characters (recommended)
                                    </span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                    {/[A-Z]/.test(newPassword) ? (
                                        <Check size={16} className="text-success me-2 mt-1" />
                                    ) : (
                                        <X size={16} className="text-muted me-2 mt-1" />
                                    )}
                                    <span className={/[A-Z]/.test(newPassword) ? 'text-success' : 'text-muted'}>
                                        Contains uppercase letter (recommended)
                                    </span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                    {/[0-9]/.test(newPassword) ? (
                                        <Check size={16} className="text-success me-2 mt-1" />
                                    ) : (
                                        <X size={16} className="text-muted me-2 mt-1" />
                                    )}
                                    <span className={/[0-9]/.test(newPassword) ? 'text-success' : 'text-muted'}>
                                        Contains number (recommended)
                                    </span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                    {validationErrors.match ? (
                                        <Check size={16} className="text-success me-2 mt-1" />
                                    ) : (
                                        <X size={16} className="text-muted me-2 mt-1" />
                                    )}
                                    <span className={validationErrors.match ? 'text-success' : 'text-muted'}>
                                        Passwords match
                                    </span>
                                </li>
                            </ul>

                            <hr className="my-4" />

                            <h6 className="fw-bold mb-3">Security Tips</h6>
                            <ul className="small text-muted mb-0" style={{ paddingLeft: '20px' }}>
                                <li className="mb-2">Use a strong, unique password</li>
                                <li className="mb-2">Don't reuse passwords from other sites</li>
                                <li className="mb-2">Don't share your password</li>
                                <li className="mb-2">Change it regularly</li>
                                <li className="mb-2">Log out from shared devices</li>
                            </ul>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;
