import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { Button, Container, Alert, Spinner, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";

function VerifyEmail() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const navigate = useNavigate();

  const handleSendVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (cooldown) {
      setError("Please wait before sending another request.");
      return;
    }

    setSending(true);
    setError("");
    try {
      await sendEmailVerification(user);
      setSent(true);
      setCooldown(true);

      // Cooldown for 60 seconds
      setTimeout(() => setCooldown(false), 60000);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait before trying again.");
      } else {
        setError("Failed to send verification email. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.emailVerified) {
      navigate("/login");
    }
  }, []);

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card className="p-4 shadow w-100" style={{ maxWidth: "480px" }}>
        <h2 className="text-center mb-4" style={{ color: "#7A8D63" }}>Verify Your Email ✉️</h2>

        <p className="text-center mb-3">
          Please check your inbox and click the link in the email to verify your address.
        </p>

        {error && <Alert variant="danger">{error}</Alert>}
        {sent && <Alert variant="success">Verification email sent! Please check your inbox.</Alert>}

        <div className="d-grid gap-2">
          <Button
            variant="success"
            onClick={handleSendVerification}
            disabled={sending || sent || cooldown}
          >
            {sending ? <Spinner size="sm" animation="border" /> : "Send Verification Email"}
          </Button>

          <Button
            variant="outline-secondary"
            onClick={() => auth.signOut().then(() => navigate("/login"))}
          >
            Back to Login
          </Button>
        </div>
      </Card>
    </Container>
  );
}

export default VerifyEmail;
