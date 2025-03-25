import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

function Home() {
    return (
        <Container className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light text-center">
            <h1 className="display-3 fw-bold text-primary mb-4">Welcome to HustleHub! 🚀</h1>

            <p className="lead text-dark mb-5">
                Your ultimate job-seeking and interview preparation tool.
            </p>

            <div className="d-flex gap-3">
                <Link to="/login">
                    <Button variant="primary" size="lg">
                        Sign In
                    </Button>
                </Link>

                <Link to="/signup">
                    <Button variant="success" size="lg">
                        Sign Up
                    </Button>
                </Link>
            </div>
        </Container>
    );
}

export default Home;
