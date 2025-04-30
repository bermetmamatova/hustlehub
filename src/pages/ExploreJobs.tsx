// src/pages/ExploreJobs.tsx
import { useEffect, useState } from "react";
import { auth, db, getUserProfile } from "../lib/firebase";
import { fetchJobs, JobData } from "../api/JobsAPI";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Form,
  Badge,
  Card,
  Button,
  Navbar,
  Nav,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaClipboardList, FaMapMarkerAlt, FaBuilding, FaExternalLinkAlt, FaSignOutAlt } from "react-icons/fa";

const primaryColor = "#7A8D63";

function ExploreJobs() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobData[]>([]);
  const [todoJobs, setTodoJobs] = useState<JobData[]>([]);
  const [appliedToday, setAppliedToday] = useState<string[]>([]);
  const [goal, setGoal] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) {
          navigate("/login");
          return;
        }

        const profile = await getUserProfile(user.uid);
        if (profile?.learningHours) setGoal(profile.learningHours);
        else setGoal(3);

        const todoSnap = await getDoc(doc(db, "users", user.uid, "meta", "jobTodo"));
        const existingTodo = todoSnap.exists() ? todoSnap.data().todoJobs || [] : [];
        setTodoJobs(existingTodo);

        const appliedSnap = await getDocs(collection(db, "users", user.uid, "applied_jobs"));
const applied = appliedSnap.docs
  .filter((doc) =>
    doc.data().appliedAt?.toDate().toISOString().startsWith(today)
  )
  .map((doc) => doc.data().job_id); 
setAppliedToday(applied);

        const location = profile?.location?.trim() || "Remote";
const fetched = await fetchJobs(location );


        
        setJobs(
          fetched.filter(
            (j) => !existingTodo.some((tj: any) => tj.job_id === j.job_id)
          )
        );
      } catch (err: any) {
        setError("Error loading jobs: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate, today]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === "jobs" && destination.droppableId === "todoJobs") {
      const draggedJob = jobs[source.index];
      const alreadyInTodo = todoJobs.some((j) => j.job_id === draggedJob.job_id);
      if (!alreadyInTodo) {
        const updatedTodo = [...todoJobs];
        updatedTodo.splice(destination.index, 0, draggedJob);
        setTodoJobs(updatedTodo);
        setJobs(jobs.filter((_, i) => i !== source.index));
        saveJobProgress(updatedTodo);
      }
    }
  };

  const saveJobProgress = async (todo: JobData[]) => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid, "meta", "jobTodo"),
      { todoJobs: todo },
      { merge: true }
    );
  };

  const toggleApplied = async (job: JobData) => {
    if (!user) return;
    if (appliedToday.includes(job.job_id)) return;

    await setDoc(
      doc(db, "users", user.uid, "applied_jobs", job.job_id),
      {
        job_id: job.job_id,
        job_title: job.job_title,
        employer_name: job.employer_name,
        appliedAt: Timestamp.now(),
        status: "applied",
      },
      { merge: true }
    );

    setAppliedToday((prev) => [...prev, job.job_id]);
  };

  if (loading)
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading jobs...</p>
      </Container>
    );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 sticky-top shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <span className="rounded p-1 me-2 fw-bold" style={{ backgroundColor: primaryColor, color: "white" }}>
              HH
            </span>
            HustleHub
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/practice">Practice</Nav.Link>
            <Nav.Link as={Link} to="/progress">Progress</Nav.Link>
            <Nav.Link as={Link} to="/mydata">My Data</Nav.Link>
            <Button variant="outline-light" onClick={() => auth.signOut()} className="ms-2">
              <FaSignOutAlt />
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="pb-5">
        <Row className="align-items-center mb-4">
          <Col>
            <h3><FaClipboardList className="me-2" /> Job Goal</h3>
          </Col>
          <Col className="text-end">
            <Badge bg="light" className="me-2 text-dark">🎯 Goal: {goal}</Badge>
            <Badge bg="success">✅ Applied: {appliedToday.length}</Badge>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Row>
            <Col md={7}>
              <h5 className="mb-3 text-muted">Available Jobs</h5>
              <Droppable droppableId="jobs">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {jobs.map((job, index) => (
                      <Draggable key={job.job_id} draggableId={job.job_id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card className="mb-3 shadow-sm">
                              <Card.Body>
                                <Card.Title>{job.job_title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                  <FaBuilding className="me-2" />{job.employer_name}
                                </Card.Subtitle>
                                <Card.Text>
                                  <FaMapMarkerAlt className="me-2" />
                                  {job.job_city}, {job.job_country}
                                </Card.Text>
                                <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline-primary" size="sm">
                                    <FaExternalLinkAlt className="me-1" /> View Job
                                  </Button>
                                </a>
                              </Card.Body>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>

            <Col md={5}>
              <h5 className="mb-3 text-muted">To-Do List</h5>
              <Droppable droppableId="todoJobs">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {todoJobs.map((job, index) => {
                     const isDone = appliedToday.includes(job.job_id);
                      return (
                        <Draggable key={job.job_id} draggableId={job.job_id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card
                                className={`mb-3 p-3 border rounded ${isDone ? "bg-success text-white text-decoration-line-through" : ""}`}
                              >
                                <strong>{job.job_title}</strong>
                                <p className="mb-1">{job.employer_name}</p>
                                <Form.Check
                                  type="checkbox"
                                  label="Mark as Applied"
                                  checked={isDone}
                                  onChange={() => toggleApplied(job)}
                                  disabled={isDone}
                                />
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
          </Row>
        </DragDropContext>
      </Container>
    </div>
  );
}

export default ExploreJobs;
