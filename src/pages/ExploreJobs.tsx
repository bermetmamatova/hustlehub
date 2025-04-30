// Updated ExploreJobs.tsx with logic matching PracticePage functionality

import { useEffect, useState } from "react";
import { auth, db, getUserProfile } from "../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { fetchJobs, JobData } from "../api/JobsAPI";
import {
  Container, Row, Col, Spinner, Alert, Form, Badge, Card, Button, Navbar, Nav
} from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate, Link } from "react-router-dom";
import { FaClipboardList, FaMapMarkerAlt, FaBuilding, FaExternalLinkAlt, FaSignOutAlt, FaCheckCircle, FaTasks } from "react-icons/fa";

const primaryColor = "#7A8D63";

function ExploreJobs() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const todayDate = new Date().toISOString().split("T")[0];

  const [jobs, setJobs] = useState<JobData[]>([]);
  const [todoJobs, setTodoJobs] = useState<JobData[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [goal, setGoal] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.learningHours) setGoal(profile.learningHours);

        const todoRef = doc(db, "users", user.uid, "meta", "jobTodo");
        const todoSnap = await getDoc(todoRef);
        const saved = todoSnap.data();

        if (saved?.date === todayDate) {
          setTodoJobs(saved.todo || []);
          setCompletedIds(saved.completed || []);
        } else {
          await setDoc(todoRef, { date: todayDate, todo: [], completed: [] });
          setTodoJobs([]);
          setCompletedIds([]);
        }

        const location = profile?.location?.trim() || "Remote";
        const fetched = await fetchJobs(location);

        setJobs(
          fetched.filter((job) => !todoJobs.find((j) => j.job_id === job.job_id))
        );
      } catch (err: any) {
        setError("Error loading jobs: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user, navigate, todayDate]);

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination || !user) return;

    if (source.droppableId === "jobs" && destination.droppableId === "todoJobs") {
      const dragged = jobs[source.index];
      const updatedTodo = [...todoJobs];
      updatedTodo.splice(destination.index, 0, dragged);
      const updatedVisible = jobs.filter((_, i) => i !== source.index);
      setTodoJobs(updatedTodo);
      setJobs(updatedVisible);
      saveProgress(updatedTodo, completedIds);
    } else if (source.droppableId === "todoJobs" && destination.droppableId === "todoJobs") {
      const items = Array.from(todoJobs);
      const [reordered] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reordered);
      setTodoJobs(items);
      saveProgress(items, completedIds);
    }
  };

  const saveProgress = async (todo: JobData[], completed: string[]) => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid, "meta", "jobTodo"),
      { date: todayDate, todo, completed },
      { merge: true }
    );
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    const updatedCompleted = [...completedIds, jobId];
    setCompletedIds(updatedCompleted);
    saveProgress(todoJobs, updatedCompleted);

    await setDoc(doc(db, "users", user.uid, "applied_jobs", jobId), {
      job_id: jobId,
      appliedAt: Timestamp.now(),
      status: "applied",
    }, { merge: true });
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/">HustleHub</Navbar.Brand>
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

      <Container>
        <Row className="mb-3">
          <Col><FaTasks /> Goal: <Badge bg="light" text="dark">{todoJobs.length}</Badge></Col>
          <Col className="text-end"><FaCheckCircle /> Applied: <Badge bg="success">{completedIds.length}</Badge></Col>
        </Row>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Row>
            <Col md={6}>
              <h5>Available Jobs</h5>
              <Droppable droppableId="jobs">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {jobs.map((job, index) => (
                      <Draggable key={job.job_id} draggableId={job.job_id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card className="mb-3">
                              <Card.Body>
                                <Card.Title>{job.job_title}</Card.Title>
                                <Card.Text>{job.employer_name} - {job.job_city}</Card.Text>
                                <a href={job.job_apply_link} target="_blank" rel="noreferrer">
                                  <Button size="sm">Apply</Button>
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

            <Col md={6}>
              <h5>To Apply</h5>
              <Droppable droppableId="todoJobs">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {todoJobs.map((job, index) => {
                      const isDone = completedIds.includes(job.job_id);
                      return (
                        <Draggable key={job.job_id} draggableId={job.job_id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card className={`mb-3 ${isDone ? 'text-muted text-decoration-line-through' : ''}`}>
                                <Card.Body>
                                  <Card.Title>{job.job_title}</Card.Title>
                                  <Card.Text>{job.employer_name}</Card.Text>
                                  <Form.Check
                                    type="checkbox"
                                    label="Mark as Applied"
                                    checked={isDone}
                                    onChange={() => handleApply(job.job_id)}
                                    disabled={isDone}
                                  />
                                </Card.Body>
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
