import { useState, useEffect } from "react";
import { auth, getUserProfile, saveUserProfile } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Card, Alert, Row, Col, Navbar, Nav, Toast, ToastContainer } from "react-bootstrap";
import { Link } from "react-router-dom";

const europeanCities = [
    "Berlin", "Paris", "London", "Madrid", "Rome", "Amsterdam", "Brussels", "Vienna",
    "Stockholm", "Zurich", "Prague", "Warsaw", "Dublin", "Copenhagen"
];
const techCompanies = ["Google", "Microsoft", "Amazon", "Facebook", "Apple", "Netflix", "Tesla"];

function Dashboard() {
    const user = auth.currentUser;
    const navigate = useNavigate();

    const [role, setRole] = useState("");
    const [experienceYears, setExperienceYears] = useState("");
    const [companies, setCompanies] = useState<string[]>([]);
    const [location, setLocation] = useState("");
    const [goalDate, setGoalDate] = useState("");
    const [learningHours, setLearningHours] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    // Toast state
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
            role, experienceYears, companies, location, goalDate, learningHours
        };

        try {
            await saveUserProfile(user.uid, profileData);
            setToastMessage("Profile saved successfully!");
            setToastVariant("success");
            setShowToast(true);
        } catch {
            setToastMessage("Failed to save profile.");
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

    const handleNext = () => {
        setCurrentStep((prev) => prev + 1);
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand>HustleHub</Navbar.Brand>
                    <Nav className="ml-auto">
                        <Nav.Link as={Link} to="/dashboard">Personal Page</Nav.Link>
                        <Nav.Link as={Link} to="/explore">Explore Jobs</Nav.Link>
                        <Nav.Link onClick={() => auth.signOut()}>Log out</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            <Container className="d-flex flex-column align-items-center">
                <h2 className="text-primary mb-2">Hi, {user?.displayName || "User"}! 🚀</h2>
                <p className="lead mb-4">Let’s set up your preferences one by one:</p>

                <Card className="p-4 shadow w-100" style={{ maxWidth: "500px" }}>
                    <Form>
                        {currentStep === 1 && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Your current role</Form.Label>
                                    <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="">Select Role</option>
                                        <option value="student">Student</option>
                                        <option value="fresh-graduate">Fresh Graduate</option>
                                        <option value="developer">Developer</option>
                                        <option value="other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                                <Button onClick={handleNext} disabled={!role} className="w-100">
                                    Next
                                </Button>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>How many years of experience in IT do you have?</Form.Label>
                                    <Form.Select value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}>
                                        <option value="">Select years:</option>
                                        <option value="none">None</option>
                                        <option value="0-2">0-2 years</option>
                                        <option value="2-4">2-4 years</option>
                                        <option value="4-6">4-6 years</option>
                                        <option value="6+">6+ years</option>
                                    </Form.Select>
                                </Form.Group>
                                <Button onClick={handleNext} disabled={!experienceYears} className="w-100">
                                    Next
                                </Button>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Choose your top 5 companies</Form.Label>
                                    <Row>
                                        {techCompanies.map((company) => (
                                            <Col key={company} xs={6}>
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
                                <Button onClick={handleNext} disabled={companies.length === 0} className="w-100">
                                    Next
                                </Button>
                            </>
                        )}

                        {currentStep === 4 && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Where are you located?</Form.Label>
                                    <Form.Select value={location} onChange={(e) => setLocation(e.target.value)}>
                                        <option value="">Select City</option>
                                        {europeanCities.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Button onClick={handleNext} disabled={!location} className="w-100">
                                    Next
                                </Button>
                            </>
                        )}

                        {currentStep === 5 && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>When do you want to get a job?</Form.Label>
                                    <Form.Control type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} />
                                </Form.Group>
                                <Button onClick={handleNext} disabled={!goalDate} className="w-100">
                                    Next
                                </Button>
                            </>
                        )}

                        {currentStep === 6 && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>How many hours per day can you devote?</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={learningHours}
                                        onChange={(e) => setLearningHours(Number(e.target.value))}
                                    />
                                </Form.Group>
                                <Button onClick={handleSave} className="w-100" variant="success">
                                    Save Profile
                                </Button>
                            </>
                        )}
                    </Form>
                </Card>
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
