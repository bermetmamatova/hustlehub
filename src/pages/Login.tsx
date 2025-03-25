import { useState } from "react";
import { loginWithEmail, signInWithGoogle } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        setSuccess(false);

        try {
            await loginWithEmail(email, password);
            console.log("User logged in successfully!");
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <Card className="p-4 shadow w-100" style={{ maxWidth: "400px" }}>
                <h2 className="text-center text-primary mb-4">Login to HustleHub 🚀</h2>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Login successful! Redirecting...</Alert>}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button variant="primary" onClick={handleLogin}>
                            Login
                        </Button>
                        <Button variant="danger" onClick={signInWithGoogle}>
                            Sign in with Google
                        </Button>
                    </div>

                    <p className="text-center mt-3">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-decoration-none text-primary">
                            Sign up here
                        </Link>
                    </p>
                </Form>
            </Card>
        </Container>
    );
}

export default Login;
