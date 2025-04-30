import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";

import {
  Container,
  Card,
  ListGroup,
  Spinner,
  Navbar,
  Nav,
  Button,
  Row,
  Col,
  Form,
  Alert,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaBriefcase,
  FaClock,
  FaMapMarkerAlt,
  FaBuilding,
  FaHourglassHalf,
  FaCalendarCheck,
  FaArrowLeft,
  FaEdit,
  FaUser,
  FaLock,
} from "react-icons/fa";

const primaryColor = "#7A8D63";

interface UserProfileData {
  role?: string;
  experienceYears?: number | string;
  location?: string;
  companies?: string[];
  learningHours?: number;
  goalDate?: string;
}

function MyDataPage() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const previousPage = location.state?.from || "/practice";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        setProfile(snap.exists() ? (snap.data() as UserProfileData) : {});
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimate(true), 50);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleChangePassword = async () => {
    setPwSuccess("");
    setPwError("");
  
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword)) {
      setPwError(
        "Password must be 8+ characters, include uppercase, lowercase, number, and special character."
      );
      return;
    }
  
    const user = auth.currentUser;
  
    if (!user) {
      setPwError("No authenticated user.");
      return;
    }
  
    try {
      await updatePassword(user, newPassword);
      setPwSuccess("Password updated successfully!");
      setNewPassword("");
    } catch (err: any) {
      setPwError(err.message || "Failed to update password.");
    }
  };

  const displayData = (
    value: string | number | string[] | undefined | null,
    placeholder = "Not Set"
  ) => {
    if (value === undefined || value === null || value === "") return placeholder;
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : placeholder;
    return String(value);
  };

  const dataPoints = [
    { label: "Name", value: user?.displayName, icon: <FaUser /> },
    { label: "Email", value: user?.email, icon: <FaEnvelope /> },
    { label: "Role", value: profile?.role, icon: <FaBriefcase /> },
    {
      label: "Experience",
      value: profile?.experienceYears ? `${profile.experienceYears} years` : undefined,
      icon: <FaClock />,
    },
    { label: "Location", value: profile?.location, icon: <FaMapMarkerAlt /> },
    { label: "Target Companies", value: profile?.companies, icon: <FaBuilding /> },
    {
      label: "Daily Study Goal",
      value: profile?.learningHours ? `${profile.learningHours} hrs` : undefined,
      icon: <FaHourglassHalf />,
    },
    { label: "Target Date", value: profile?.goalDate, icon: <FaCalendarCheck /> },
  ];

  if (loading) {
    return (
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "80vh" }}
        >
          <Spinner
            animation="border"
            role="status"
            style={{ width: "3rem", height: "3rem", color: primaryColor }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar bg="dark" variant="dark" expand={false} className="mb-4 shadow-sm sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-auto">
            <span
              style={{ backgroundColor: primaryColor, color: "white" }}
              className="rounded p-1 me-2 fw-bold"
            >
              HH
            </span>
            <span className="fw-bold">HustleHub</span>
          </Navbar.Brand>
          <Nav>
            <Button
              variant="outline-light"
              onClick={() => navigate(previousPage)}
              className="d-flex align-items-center"
              aria-label="Go back"
            >
              <FaArrowLeft className="me-2" /> Back
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-4 py-lg-5" style={{ maxWidth: "700px" }}>
        <h3 className="mb-4 fw-bold text-center d-flex align-items-center justify-content-center">
          <FaUserCircle className="me-2" style={{ color: primaryColor }} /> My Data Overview
        </h3>

        <Card className={`shadow-sm rounded-lg border-0 data-card ${animate ? "fade-in" : ""}`}>
          <Card.Body className="p-lg-4">
            <ListGroup variant="flush">
              {dataPoints.map((item, index) => (
                <ListGroup.Item
                  key={index}
                  className="px-0 py-3 list-item-hover d-flex align-items-center"
                >
                  <span
                    className="me-3 list-item-icon"
                    style={{ color: primaryColor }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <div className="flex-grow-1">
                    <strong className="me-2">{item.label}:</strong>
                    {displayData(item.value)}
                  </div>
                </ListGroup.Item>
              ))}

              {/* Change Password Section */}
              <ListGroup.Item className="text-center px-0 pt-4 pb-2 border-0">
  <Row className="justify-content-center gap-3">
    <Col xs="auto">
      <Button
        variant="primary"
        className="update-button"
        style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
        onClick={() => navigate("/update")}
      >
        <FaEdit className="me-2" /> Update Preferences
      </Button>
    </Col>
    <Col xs="auto">
      <Button
        variant="outline-primary"
        className="update-button"
        style={{ borderColor: primaryColor, color: primaryColor }}
        onClick={() => navigate("/change-password")}
      >
        <FaLock className="me-2" /> Change Password
      </Button>
    </Col>
  </Row>
</ListGroup.Item>

            </ListGroup>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default MyDataPage;
