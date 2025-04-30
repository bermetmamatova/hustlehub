// Home.tsx (Updated Full Code)

import { Link, useNavigate } from "react-router-dom";
import { Container, Button, Row, Col, Nav, Navbar, Card } from "react-bootstrap";
import { auth } from "../lib/firebase";
import jobImage from "./job.jpg";
import { FaSearch, FaCode, FaUsers, FaChartLine, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { useEffect, useState } from "react";

function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 sticky-top shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span style={{ backgroundColor: "#7A8D63", color: "white" }} className="rounded p-1 me-2 fw-bold">HH</span>
            <span className="fw-bold">HustleHub</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/community" className="mx-2">Community</Nav.Link>
              {user && user.role === "admin" && (
                <Nav.Link as={Link} to="/admin" className="mx-2">Admin Dashboard</Nav.Link>
              )}
              {!user && (
                <>
                  <Nav.Link as={Link} to="/login" className="mx-2">Sign In</Nav.Link>
                  <Nav.Link as={Link} to="/signup" className="mx-2">Sign Up</Nav.Link>
                </>
              )}
              {user && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={async () => { await auth.signOut(); window.location.reload(); }}
                  className="ms-3"
                >
                  Logout
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="d-flex flex-column min-vh-100">

        {/* Hero Section */}
        <section style={{ backgroundColor: "#7A8D63", color: "white" }} className="py-5">
          <Container className="py-5">
            <Row className="align-items-center">
              <Col lg={6} className="mb-5 mb-lg-0">
                <h1 className="display-4 fw-bold mb-4">Land Your Dream Tech Job <span className="text-warning">Faster</span></h1>
                <p className="lead mb-4">
                  HustleHub combines smart job matching with interview preparation and community support to accelerate your career growth.
                </p>
                <div className="d-flex gap-3">
                  <Link to="/login">
                    <Button variant="light" size="lg" className="px-4">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline-light" size="lg" className="px-4">Sign Up</Button>
                  </Link>
                </div>
              </Col>
              <Col lg={6}>
                <div className="position-relative">
                  <img
                    src={jobImage}
                    alt="Career growth"
                    className="img-fluid rounded-3 shadow-lg"
                    style={{ objectFit: "cover", width: "100%", height: "auto", border: "4px solid rgba(255,255,255,0.2)" }}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-5 my-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">Why Choose HustleHub?</h2>
              <p className="text-muted lead">Everything you need for your job search in one powerful platform</p>
            </div>
            <Row className="g-4">
              {[
                { icon: <FaSearch size={24} />, title: "Smart Job Matching", text: "Job recommendations tailored to your skills and preferences." },
                { icon: <FaCode size={24} />, title: "Interview Prep", text: "100+ LeetCode questions with company-specific patterns." },
                { icon: <FaUsers size={24} />, title: "Community", text: "Connect with mentors and peers for guidance and support." },
                { icon: <FaChartLine size={24} />, title: "Progress Tracking", text: "Visual dashboards to monitor your job search journey." }
              ].map((feature, idx) => (
                <Col md={6} lg={3} key={idx}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4 text-center">
                      <div className="icon-lg bg-primary bg-opacity-10 text-primary rounded-circle mb-3 mx-auto">{feature.icon}</div>
                      <h3 className="h5">{feature.title}</h3>
                      <p className="text-muted mb-0">{feature.text}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Call to Action Section */}
        <section className="bg-light py-5">
          <Container className="text-center py-5">
            <h2 className="display-5 fw-bold mb-4">Ready to accelerate your job search?</h2>
            <p className="lead mb-5">Join thousands of professionals who found their dream jobs with HustleHub</p>
            <Link to="/signup">
              <Button variant="primary" size="lg" className="px-5 py-3">Get Started Now</Button>
            </Link>
          </Container>
        </section>

        {/* Footer */}
        <footer className="bg-dark text-white py-5 mt-auto">
          <Container>
            <Row>
              <Col lg={4} className="mb-4 mb-lg-0">
                <h5 className="text-uppercase mb-4">HustleHub</h5>
                <p>The all-in-one platform for tech professionals to find jobs, prepare for interviews, and grow their careers.</p>
              </Col>
              <Col lg={2} md={4} className="mb-4 mb-md-0">
                <h5 className="text-uppercase mb-4">Links</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="/about" className="text-white-50">About</a></li>
                  <li className="mb-2"><a href="/contact" className="text-white-50">Contact</a></li>
                  <li className="mb-2"><a href="/privacy" className="text-white-50">Privacy</a></li>
                  <li><a href="/terms" className="text-white-50">Terms</a></li>
                </ul>
              </Col>
              <Col lg={2} md={4} className="mb-4 mb-md-0">
                <h5 className="text-uppercase mb-4">Resources</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="/blog" className="text-white-50">Blog</a></li>
                  <li className="mb-2"><a href="/guides" className="text-white-50">Guides</a></li>
                  <li className="mb-2"><a href="/faq" className="text-white-50">FAQ</a></li>
                </ul>
              </Col>
              <Col lg={4} md={4}>
                <h5 className="text-uppercase mb-4">Connect With Us</h5>
                <div className="d-flex gap-3 mb-4">
                  <a href="#" className="text-white-50"><FaFacebookF className="fs-4" /></a>
                  <a href="#" className="text-white-50"><FaTwitter className="fs-4" /></a>
                  <a href="#" className="text-white-50"><FaLinkedinIn className="fs-4" /></a>
                  <a href="#" className="text-white-50"><FaInstagram className="fs-4" /></a>
                </div>
                <p className="small text-white-50 mb-0">&copy; {new Date().getFullYear()} HustleHub. All rights reserved.</p>
              </Col>
            </Row>
          </Container>
        </footer>

      </div>
    </>
  );
}

export default Home;