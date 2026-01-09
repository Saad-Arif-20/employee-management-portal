import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, InputGroup, InputGroupText } from 'reactstrap';
import { LogIn, Users, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 50%, #1a7a5e 100%)'
        }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
                            <CardBody className="p-5">
                                <div className="text-center mb-4">
                                    <div className="d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                            color: 'white'
                                        }}>
                                        <Users size={40} />
                                    </div>
                                    <h2 className="fw-bold mb-2">Welcome Back</h2>
                                    <p className="text-muted">Employee Management Portal</p>
                                </div>

                                {error && (
                                    <Alert color="danger" className="mb-4">
                                        <strong>Error:</strong> {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <FormGroup className="mb-3">
                                        <Label for="email" className="fw-semibold">Email Address</Label>
                                        <Input
                                            type="email"
                                            id="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            style={{ padding: '12px', borderRadius: '8px' }}
                                        />
                                    </FormGroup>

                                    <FormGroup className="mb-4">
                                        <Label for="password" className="fw-semibold">Password</Label>
                                        <InputGroup>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '8px 0 0 8px',
                                                    borderRight: 'none'
                                                }}
                                            />
                                            <InputGroupText
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    background: 'white',
                                                    borderRadius: '0 8px 8px 0',
                                                    cursor: 'pointer',
                                                    borderLeft: 'none',
                                                    padding: '0 12px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#f8f9fa';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                }}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={20} style={{ color: '#6c757d' }} />
                                                ) : (
                                                    <Eye size={20} style={{ color: '#6c757d' }} />
                                                )}
                                            </InputGroupText>
                                        </InputGroup>
                                    </FormGroup>

                                    <Button
                                        color="primary"
                                        block
                                        disabled={loading}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)',
                                            border: 'none',
                                            fontWeight: '600',
                                            fontSize: '16px',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 16px rgba(13, 59, 46, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Logging in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn size={18} className="me-2" style={{ marginBottom: '2px' }} />
                                                Login
                                            </>
                                        )}
                                    </Button>
                                </Form>

                                <div className="mt-4 p-3 rounded text-center" style={{
                                    background: 'linear-gradient(135deg, rgba(13, 59, 46, 0.05) 0%, rgba(20, 92, 71, 0.05) 100%)',
                                    border: '1px solid rgba(13, 59, 46, 0.1)'
                                }}>
                                    <small className="d-block mb-1" style={{ color: '#0d3b2e', fontWeight: '600' }}>
                                        Default Credentials:
                                    </small>
                                    <small className="text-muted d-block">
                                        Email: <code style={{ background: 'rgba(13, 59, 46, 0.1)', color: '#0d3b2e', padding: '2px 6px', borderRadius: '4px' }}>admin@company.com</code>
                                    </small>
                                    <small className="text-muted d-block">
                                        Password: <code style={{ background: 'rgba(13, 59, 46, 0.1)', color: '#0d3b2e', padding: '2px 6px', borderRadius: '4px' }}>Admin123</code>
                                    </small>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
