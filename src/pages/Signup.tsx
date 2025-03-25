import { useState } from "react";
import { signUpWithEmail } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";

function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async () => {
        setError("");
        setSuccess(false);

        try {
            const fullName = `${firstName} ${lastName}`;
            await signUpWithEmail(email, password, fullName,lastName);
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <Card className="p-4 shadow w-100 text-center" style={{ maxWidth: "450px" }}>
                <h2 className="mb-4" style={{ color: "#7A8D63" }}>Sign Up for HustleHub 🚀</h2>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Signup successful! Redirecting...</Alert>}

                <Form>
                    <Row className="mb-3">
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </Col>
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Control
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button variant="success" onClick={handleSignup}>
                            Sign Up
                        </Button>
                    </div>

                    <p className="text-center mt-3">
                        Already have an account?{" "}
                        <Link to="/login" className="text-decoration-none" style={{ color: "#7A8D63" }}>
                            Login here
                        </Link>
                    </p>
                </Form>
            </Card>
        </Container>
    );
}

export default Signup;
