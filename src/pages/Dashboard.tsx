import { useState, useEffect } from "react";
import { auth, getUserProfile, saveUserProfile } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Card,
  Row,
  Col,
  Navbar,
  Nav,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const europeanCities = [
  "Berlin",
  "Paris",
  "London",
  "Madrid",
  "Rome",
  "Amsterdam",
  "Brussels",
  "Vienna",
  "Stockholm",
  "Zurich",
  "Prague",
  "Warsaw",
  "Dublin",
  "Copenhagen",
];
const techCompanies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Facebook",
  "Apple",
  "Netflix",
  "Tesla",
];

function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [role, setRole] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [companies, setCompanies] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [learningHours, setLearningHours] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    getUserProfile(user.uid)
      .then((data) => {
        if (data) {
          setRole(data.role || "");
          setExperienceYears(data.experienceYears || "");
          setCompanies(data.companies || []);
          setLocation(data.location || "");
          setGoalDate(data.goalDate || "");
          setLearningHours(data.learningHours || 0);
        }
        setProfileLoaded(true);
        setLoading(false);
      })
      .catch(() => {
        setToastMessage("Error loading profile.");
        setToastVariant("danger");
        setShowToast(true);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    const profileData = {
      role,
      experienceYears,
      companies,
      location,
      goalDate,
      learningHours,
      onboardingComplete: true,
    };

    try {
      await saveUserProfile(user.uid, profileData);
      setToastMessage("Profile updated successfully!");
      setToastVariant("success");
      setShowToast(true);
      setShowForm(false);
    } catch {
      setToastMessage("Failed to update profile.");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleCompanyToggle = (company: string) => {
    if (companies.includes(company)) {
      setCompanies(companies.filter((c) => c !== company));
    } else if (companies.length < 5) {
      setCompanies([...companies, company]);
    } else {
      setToastMessage("You can only select up to 5 companies.");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>HustleHub</Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/personal">Personal Page</Nav.Link>
            <Nav.Link as={Link} to="/progress">Progress</Nav.Link>
            <Nav.Link as={Link} to="/explore">Explore Jobs</Nav.Link>
            <Nav.Link as={Link} to="/community">Community</Nav.Link>
            <Nav.Link onClick={() => auth.signOut()}>Log out</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container style={{ maxWidth: "700px" }}>
        <h2 className="text-primary mb-3">👤 My Account</h2>
        <p><strong>Name:</strong> {user?.displayName}</p>
        <p><strong>Email:</strong> {user?.email}</p>

        {!showForm && (
          <>
            <h4 className="mt-4">📌 My Preferences</h4>
            <ul>
              <li><strong>Role:</strong> {role}</li>
              <li><strong>Experience:</strong> {experienceYears}</li>
              <li><strong>Location:</strong> {location}</li>
              <li><strong>Companies:</strong> {companies.join(", ")}</li>
              <li><strong>Goal Date:</strong> {goalDate}</li>
              <li><strong>Daily Commitment:</strong> {learningHours} hrs</li>
            </ul>
            <Button variant="outline-primary" onClick={() => setShowForm(true)}>Update My Preferences</Button>
          </>
        )}

        {showForm && (
          <Card className="p-4 mt-4">
            <h5>Update Your Preferences</h5>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="fresh-graduate">Fresh Graduate</option>
                  <option value="developer">Developer</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Experience</Form.Label>
                <Form.Select value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}>
                  <option value="">Select Years</option>
                  <option value="none">None</option>
                  <option value="0-2">0-2 years</option>
                  <option value="2-4">2-4 years</option>
                  <option value="4-6">4-6 years</option>
                  <option value="6+">6+ years</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Top Companies</Form.Label>
                <Row>
                  {techCompanies.map((company) => (
                    <Col xs={6} key={company}>
                      <Form.Check
                        type="checkbox"
                        label={company}
                        checked={companies.includes(company)}
                        onChange={() => handleCompanyToggle(company)}
                      />
                    </Col>
                  ))}
                </Row>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Select City</option>
                  {europeanCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Goal Date</Form.Label>
                <Form.Control type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Daily Study Hours</Form.Label>
                <Form.Control type="number" value={learningHours} onChange={(e) => setLearningHours(Number(e.target.value))} />
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </Form>
          </Card>
        )}
      </Container>

      <ToastContainer position="top-center" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} bg={toastVariant} delay={3000} autohide>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default Dashboard;
