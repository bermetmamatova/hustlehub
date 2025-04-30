import { Container, Row, Col, Card, Button, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaQuoteLeft } from "react-icons/fa";
import aboutImage from "/Users/bermetmamatova/Documents/HustleHub/hustlehub/1656999783688.jpeg"; // Placeholder image

function AboutUs() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 sticky-top shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span
              style={{ backgroundColor: "#7A8D63", color: "white" }}
              className="rounded p-1 me-2 fw-bold"
            >
              HH
            </span>
            <span className="fw-bold">HustleHub</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/community" className="mx-2">Community</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="d-flex flex-column min-vh-100">

        <section style={{ backgroundColor: "#7A8D63", color: "white" }} className="py-5">
          <Container className="text-center py-5">
            <h1 className="display-4 fw-bold mb-4">About HustleHub</h1>
            <p className="lead mb-4">
              Empowering tech talent to land their dream careers faster with smart preparation, community support, and opportunity matching.
            </p>
            <img
              src={aboutImage}
              alt="About HustleHub"
              className="img-fluid rounded-3 shadow-lg"
              style={{ maxHeight: "400px", objectFit: "cover", border: "4px solid rgba(255,255,255,0.2)" }}
            />
          </Container>
        </section>

        <section className="py-5 bg-light">
          <Container>
            <Row className="text-center mb-5">
              <h2 className="fw-bold">Why We Exist</h2>
              <p className="text-muted">HustleHub was created to bridge the gap between job seekers and their dream companies. We combine practice, progress tracking, community, and job matching to maximize your success.</p>
            </Row>
            <Row className="g-4">
              {["Personalized learning paths", "Real-time job recommendations", "Peer-to-peer practice community", "Progress tracking and statistics"].map((reason, idx) => (
                <Col md={6} lg={3} key={idx}>
                  <Card className="h-100 border-0 shadow-sm text-center p-3">
                    <Card.Body>
                      <h5 className="fw-bold mb-2">{reason}</h5>
                      <p className="text-muted small">A smarter, faster route to your career goals.</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section className="py-5">
          <Container>
            <Row className="text-center mb-5">
              <h2 className="fw-bold">User Testimonials</h2>
              <p className="text-muted">See what our successful users say about HustleHub!</p>
            </Row>
            <Row className="g-4">
              {["HustleHub made job hunting so much easier!", "Thanks to the community mock interviews, I felt confident on my big day!", "The personalized recommendations were spot on.", "Tracking my daily practice helped me stay consistent."].map((quote, idx) => (
                <Col md={6} key={idx}>
                  <Card className="border-0 shadow-sm p-4 h-100">
                    <FaQuoteLeft size={30} color="#7A8D63" className="mb-3"/>
                    <Card.Text className="fst-italic">"{quote}"</Card.Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section style={{ backgroundColor: "#7A8D63", color: "white" }} className="py-5">
          <Container className="text-center">
            <h2 className="display-5 fw-bold mb-4">Ready to Start Your Hustle?</h2>
            <p className="lead mb-5">Join HustleHub today and land the tech job you've been dreaming about!</p>
            <Link to="/signup">
              <Button variant="light" size="lg" className="px-5 py-3">Join Now</Button>
            </Link>
          </Container>
        </section>

      </div>
    </>
  );
}

export default AboutUs;