import { useEffect, useState } from "react";
import { auth, getUserProfile, db } from "../lib/firebase";
import { fetchJobs } from "../api/JobsAPI";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Button,
  Form,
  Navbar,
  Nav,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { Link } from "react-router-dom";

function ExploreJobs() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [todoJobs, setTodoJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadJobs = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          const { location, companies, role } = profile;
          const companyString = companies.length > 0 ? companies[0] : "IT";

          const fetchedJobs = await fetchJobs(location, companyString, role || "developer");
          setJobs(fetchedJobs);

          const docRef = doc(db, "users", user.uid, "meta", "jobTodo");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTodoJobs(data.todoJobs || []);
            setAppliedJobs(data.appliedJobs || []);
          }
        }
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user, navigate]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === "jobs" && destination.droppableId === "todoJobs") {
      const draggedJob = jobs[source.index];
      const alreadyAdded = todoJobs.some((j) => j.job_id === draggedJob.job_id);
      if (!alreadyAdded) {
        const updatedList = [...todoJobs, draggedJob];
        setTodoJobs(updatedList);
        saveJobProgress(updatedList, appliedJobs);
      }
    }
  };

  const handleApply = async (job: any) => {
    const updatedApplied = [...appliedJobs, job.job_id];
    setAppliedJobs(updatedApplied);
    saveJobProgress(todoJobs, updatedApplied);

    await setDoc(doc(db, "users", user!.uid, "applied_jobs", job.job_id), {
      job_id: job.job_id,
      job_title: job.job_title,
      employer_name: job.employer_name,
      appliedAt: Timestamp.now().toDate().toISOString(),
      status: "applied",
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    jobId: string
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      console.log(`File selected for ${jobId}:`, file.name);
      // Optional file upload logic can go here
    }
  };

  const saveJobProgress = async (todo: any[], applied: string[]) => {
    if (user) {
      await setDoc(doc(db, "users", user.uid, "meta", "jobTodo"), {
        todoJobs: todo,
        appliedJobs: applied,
      }, { merge: true });
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">HustleHub</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/dashboard">Update My Preferences</Nav.Link>
              <Nav.Link as={Link} to="/explore">Explore Jobs</Nav.Link>
              <Nav.Link as={Link} to="/progress">Progress</Nav.Link>
              <Nav.Link as={Link} to="/personal">Practice</Nav.Link>
              <Nav.Link as={Link} to="/community">Practice</Nav.Link>
              <Nav.Link onClick={() => auth.signOut()}>Log out</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="my-5">
        <h1 className="text-primary mb-4">Explore Jobs</h1>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Row>
              <Col md={8}>
                <h4 className="mb-3">Available Jobs</h4>
                <Droppable droppableId="jobs">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {jobs.map((job, index) => (
                        <Draggable key={job.job_id} draggableId={job.job_id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                            >
                              <Card className="h-100 shadow-sm">
                                <Card.Body>
                                  <Card.Title>{job.job_title}</Card.Title>
                                  <Card.Subtitle className="mb-2 text-muted">
                                    {job.employer_name}
                                  </Card.Subtitle>
                                  <Card.Text>
                                    {job.job_city}, {job.job_country}
                                  </Card.Text>
                                  <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                                    <Button variant="success" className="w-100 mt-2">Apply</Button>
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

              <Col md={4}>
                <h4 className="mb-3">Today's To-do List</h4>
                <Droppable droppableId="todoJobs">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {todoJobs.map((job, index) => (
                        <div key={job.job_id} className={`mb-3 p-2 border rounded ${appliedJobs.includes(job.job_id) ? "bg-success text-white text-decoration-line-through" : ""}`}>
                          <strong>{job.job_title}</strong>
                          <p className="text-muted">{job.employer_name}</p>
                          <Form.Check
                            type="checkbox"
                            label="Mark as Applied"
                            checked={appliedJobs.includes(job.job_id)}
                            onChange={() => handleApply(job)}
                          />
                          <Form.Label className="mt-2">Upload Resume or Cover Letter</Form.Label>
                          <Form.Control
                            type="file"
                            onChange={(e) => handleFileChange(e as React.ChangeEvent<HTMLInputElement>, job.job_id)}
                          />
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Col>
            </Row>
          </DragDropContext>
        )}
      </Container>
    </>
  );
}

export default ExploreJobs;
