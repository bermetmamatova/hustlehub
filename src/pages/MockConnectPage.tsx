import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  Container,
  Button,
  Card,
  Col,
  Row,
  Form,
  Modal,
  Alert,
  ListGroup,
  Navbar,
  Nav,
  Badge,
} from "react-bootstrap";
import { gapi } from "gapi-script";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaPaperPlane,
  FaTrash,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const CLIENT_ID = "619361168686-4ut0lj6p9jasr4gffoulh24abmlgaui3.apps.googleusercontent.com";
const API_KEY = "AIzaSyCrRikIZSe3Kh13z06aRj49iLMJPUD7Lyk";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";
const primaryColor = "#7A8D63";

interface AvailabilitySlot {
  id: string;
  date: string;
  time: string;
  timezone: string;
  name: string;
  email: string;
  userId: string;
  username?: string;
  company?: string;
}

interface InterviewRequest {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toEmail: string;
  toName: string;
  date: string;
  time: string;
  timezone: string;
  note: string;
  requestedAt: Timestamp;
  status?: "pending" | "accepted" | "declined";
}

export default function MockConnectPage() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("CET");
  const [username, setUsername] = useState("");
  const [company, setCompany] = useState("");

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [othersAvailability, setOthersAvailability] = useState<AvailabilitySlot[]>([]);
  const [myRequests, setMyRequests] = useState<InterviewRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [note, setNote] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gapi.load("client:auth2", async () => {
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      });
  
      const authInstance = gapi.auth2.getAuthInstance();
  
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn(); // ✅ Force user to log in
      }
    });
  }, []);
  

  useEffect(() => {
    if (!user) return;
  
    const fetchData = async () => {
      try {
        console.log("Fetching availability data...");
  
        const myAvailRef = collection(db, "users", user.uid, "mockAvailability");
        const availSnap = await getDocs(myAvailRef);
        const mySlots = availSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AvailabilitySlot[];
        setAvailability(mySlots);
  
        const publicSnap = await getDocs(collection(db, "mockAvailabilityPublic"));
        const otherSlots = publicSnap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((slot: any) => slot.userId !== user.uid) as AvailabilitySlot[];
        setOthersAvailability(otherSlots);
  
        const reqQuery = query(
          collection(db, "interviewRequests"),
          where("toUserId", "==", user.uid)
        );
        const reqSnap = await getDocs(reqQuery);
        const reqList = reqSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InterviewRequest[];
        setMyRequests(reqList);
  
        console.log("✅ All data fetched and set.");
      } catch (err) {
        console.error("Error fetching availability data:", err);
        setError("Failed to fetch data.");
      }
    };
  
    fetchData();
  }, [user]);
  

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !date || !time) return;

    const newSlot = {
      date,
      time,
      timezone,
      name: user.displayName || "Anonymous",
      email: user.email || "",
      userId: user.uid,
      username,
      company,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "users", user.uid, "mockAvailability"), newSlot);
      await addDoc(collection(db, "mockAvailabilityPublic"), newSlot);
      setSuccessMsg("✅ Availability added.");
      setDate("");
      setTime("");
      setUsername("");
      setCompany("");
    } catch {
      setError("Failed to add availability.");
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", user!.uid, "mockAvailability", id));
      setAvailability((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete slot.");
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedSlot || !user) return;

    try {
      await addDoc(collection(db, "interviewRequests"), {
        fromUserId: user.uid,
        fromName: user.displayName || "Anonymous",
        toUserId: selectedSlot.userId,
        toEmail: selectedSlot.email,
        toName: selectedSlot.name,
        requestedAt: Timestamp.now(),
        date: selectedSlot.date,
        time: selectedSlot.time,
        timezone: selectedSlot.timezone,
        note: note.trim(),
        status: "pending",
      });
      setShowModal(false);
      setNote("");
      setSuccessMsg(`Request sent to ${selectedSlot.name}.`);
    } catch {
      setError("Failed to send request.");
    }
  };

  const handleStatusUpdate = async (id: string, status: "accepted" | "declined") => {
    try {
      await updateDoc(doc(db, "interviewRequests", id), { status });
      setMyRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
  
      if (status === "accepted") {
        const acceptedRequest = myRequests.find((r) => r.id === id);
        if (acceptedRequest) {
          await createInterviewEvent(acceptedRequest);
          setSuccessMsg("✅ Interview accepted and event created!");
        }
      }
    } catch (err) {
      console.error("Status update failed:", err);
      setError("Status update failed.");
    }
  };
  

  async function createInterviewEvent(req: InterviewRequest) {
    const { gapi } = window as any;
  
    try {
      // Convert to 1-hour range
      const start = new Date(`${req.date}T${req.time}`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
  
      const event = {
        summary: `Mock Interview with ${req.fromName}`,
        description: req.note || "Scheduled via HustleHub",
        start: {
          dateTime: start.toISOString(),
          timeZone: req.timezone,
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: req.timezone,
        },
        attendees: [
          { email: req.toEmail },
          { email: auth.currentUser?.email || "" },
        ],
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(2),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };
  
      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: "all",
      });
  
      console.log("✅ Event created:", response);
    } catch (err) {
      console.error("❌ Failed to create calendar event:", err);
    }
  }
  
  

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 sticky-top shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span style={{ backgroundColor: "#7A8D63", color: "white" }} className="rounded p-1 me-2 fw-bold">HH</span>
            <span className="fw-bold">HustleHub</span>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/explore">Jobs</Nav.Link>
            <Nav.Link as={Link} to="/practice">Practice</Nav.Link>
            <Nav.Link as={Link} to="/community">Community</Nav.Link>
            <Nav.Link as={Link} to="/progress">Progress</Nav.Link>
            <Nav.Link as={Link} to="/mydata">My Data</Nav.Link>
            <Button variant="outline-light" onClick={() => auth.signOut()} className="ms-2">Log out</Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-3">
        <h2 className="mb-4">Engage in mock interviews and knowledge sharing with fellow candidates here</h2>

        {successMsg && <Alert variant="success">{successMsg}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Add Availability */}
        <Card className="mb-4 p-3">
          <h5>Please set your availability: </h5>
          <Form onSubmit={handleAddAvailability}>
            <Row className="g-3">
              <Col md={3}><Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Col>
              <Col md={2}><Form.Control type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></Col>
              <Col md={2}>
                <Form.Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="CET">CET</option>
                  <option value="IST">IST</option>
                  <option value="EST">EST</option>
                </Form.Select>
              </Col>
              <Col md={2}><Form.Control placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /></Col>
              <Col md={2}><Form.Control placeholder="Target Company" value={company} onChange={(e) => setCompany(e.target.value)} /></Col>
              <Col md={1}><Button type="submit"><FaPlusCircle /></Button></Col>
            </Row>
          </Form>
        </Card>

        {/* Your Availability */}
        <Card className="mb-4 p-3">
          <h5>Your Availability</h5>
          <ListGroup>
            {availability.map((slot) => (
              <ListGroup.Item key={slot.id} className="d-flex justify-content-between align-items-center">
                <span>{slot.date} @ {slot.time} ({slot.timezone})</span>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSlot(slot.id)}><FaTrash /></Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>

        {/* Other Users’ Availability */}
        <Card className="mb-4 p-3">
          <h5>Available peers for Mock Interviews: </h5>
          <ListGroup>
            {othersAvailability.length === 0 && <p>No available users right now.</p>}
            {othersAvailability.map((slot) => (
              <ListGroup.Item key={slot.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{slot.username || slot.name}</strong> ({slot.company || "No company"})
                  <div>{slot.date} @ {slot.time} ({slot.timezone})</div>
                </div>
                <Button size="sm" onClick={() => { setSelectedSlot(slot); setShowModal(true); }}>
                  <FaPaperPlane /> Request
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>

        {/* Interview Requests Received */}
        <Card className="p-3">
          <h5>Requests you have received: </h5>
          <ListGroup>
            {myRequests.map((req) => (
              <ListGroup.Item key={req.id}>
                <p>From: <strong>{req.fromName}</strong> on {req.date} at {req.time}</p>
                <p>Note: {req.note || "No note"}</p>
                {req.status === "accepted" || req.status === "declined" ? (
  <Badge bg={req.status === "accepted" ? "success" : "danger"}>
    {req.status.toUpperCase()}
  </Badge>
) : (
  <div className="d-flex gap-2">
    <Button size="sm" onClick={() => handleStatusUpdate(req.id, "accepted")}><FaCheck /> Accept</Button>
    <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(req.id, "declined")}><FaTimes /> Decline</Button>
  </div>
)}

              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton><Modal.Title>Send Interview Request</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Optional Note</Form.Label>
              <Form.Control as="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitRequest}><FaPaperPlane /> Send</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}
