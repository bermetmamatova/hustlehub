import { useState } from "react";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import { requestPasswordReset } from "../lib/firebase"; 
import { Link } from "react-router-dom";

const primaryColor = "#7A8D63";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const msg = await requestPasswordReset(email);
      setMessage(msg);
      setError(null);
    } catch (err) {
      setMessage(null);
      setError((err as Error).message);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card className="p-4 shadow w-100" style={{ maxWidth: "450px" }}>
        <h2 className="mb-4 text-center" style={{ color: primaryColor }}>
          Forgot Your Password? 🔐
        </h2>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button type="submit" variant="success">
              Send Reset Link
            </Button>
            <Link to="/login" className="text-decoration-none text-center mt-2" style={{ color: primaryColor }}>
              🔙 Back to Login
            </Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
}

export default ForgotPasswordPage;
