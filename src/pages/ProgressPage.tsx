import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Navbar,
  Nav,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import JobStatusModal from "../components/JobStatusModal";

interface SolvedQuestion {
  id: string;
  questionId: string;
  completedAt: string;
}

interface JobApplication {
  id: string;
  job_id: string;
  job_title: string;
  employer_name: string;
  appliedAt: string;
  status: "applied" | "accepted" | "rejected" | "ghosted";
  documents?: string[];
}

function ProgressPage() {
  const user = auth.currentUser;
  const [solvedQuestions, setSolvedQuestions] = useState<SolvedQuestion[]>([]);
  const [questionTitles, setQuestionTitles] = useState<{ [key: string]: string }>({});
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch solved questions
      const qSnapshot = await getDocs(collection(db, "users", user.uid, "question_progress"));
      const questions = qSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          questionId: data.questionId,
          completedAt: data.finishedAt?.toDate().toISOString() || "",
        };
      }) as SolvedQuestion[];

      // Fetch titles for solved questions
      const allQuestionsSnapshot = await getDocs(collection(db, "dsa_questions"));
      const titlesMap: { [key: string]: string } = {};
      allQuestionsSnapshot.forEach((doc) => {
        const data = doc.data();
        titlesMap[doc.id] = data.title;
      });

      const sortedQuestions = questions.sort((a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      setSolvedQuestions(sortedQuestions);
      setQuestionTitles(titlesMap);

      // Fetch applied jobs
      const jSnapshot = await getDocs(query(collection(db, "users", user.uid, "applied_jobs")));
      const jobs = jSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          job_id: data.job_id,
          job_title: data.job_title,
          employer_name: data.employer_name,
          appliedAt: data.appliedAt,
          status: data.status,
          documents: data.documents || [],
        };
      }) as JobApplication[];

      const sortedJobs = jobs.sort((a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );
      setAppliedJobs(sortedJobs);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const todaysSolved = solvedQuestions.filter(q => q.completedAt.startsWith(today));
  const todaysJobs = appliedJobs.filter(j => j.appliedAt === today);

  const accepted = appliedJobs.filter(j => j.status === "accepted").length;
  const rejected = appliedJobs.filter(j => j.status === "rejected").length;
  const ghosted = appliedJobs.filter(j => j.status === "ghosted").length;

  if (loading) return <p className="p-4">Loading progress...</p>;

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
              <Nav.Link as={Link} to="/community">Community</Nav.Link>
              <Nav.Link as={Link} to="/personal">Practice</Nav.Link>
              <Nav.Link onClick={() => auth.signOut()}>Log out</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <h2 className="mb-4">📈 Your Progress Summary</h2>
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Header>📅 Today's Stats</Card.Header>
              <Card.Body>
                <p>Solved Questions: {todaysSolved.length}</p>
                <p>Applied Jobs: {todaysJobs.length}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>📊 Overall Stats</Card.Header>
              <Card.Body>
                <p>Total Questions Solved: {solvedQuestions.length}</p>
                <p>Total Jobs Applied: {appliedJobs.length}</p>
                <p>Accepted: {accepted}, Rejected: {rejected}, Ghosted: {ghosted}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>✅ Solved DSA Questions</Card.Header>
              <ListGroup variant="flush">
                {solvedQuestions.length === 0 ? (
                  <ListGroup.Item>No problems solved yet.</ListGroup.Item>
                ) : (
                  solvedQuestions.map((q) => (
                    <ListGroup.Item key={q.id}>
                      <strong>{questionTitles[q.questionId] || "(Title not found)"}</strong>
                      <br />
                      <small className="text-muted">Completed: {new Date(q.completedAt).toLocaleDateString()}</small>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>📮 Applied Jobs</Card.Header>
              <ListGroup variant="flush">
                {appliedJobs.length === 0 ? (
                  <ListGroup.Item>No jobs applied yet.</ListGroup.Item>
                ) : (
                  appliedJobs.map((job) => (
                    <ListGroup.Item key={job.id} className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{job.job_title}</strong> @ {job.employer_name}
                        <br />
                        <small className="text-muted">Applied on: {new Date(job.appliedAt).toLocaleDateString()}</small>
                        <br />
                        <span className={`badge bg-${
                          job.status === "accepted" ? "success" :
                          job.status === "rejected" ? "danger" :
                          job.status === "ghosted" ? "secondary" : "warning"
                        } mt-1`}>{job.status.toUpperCase()}</span>
                        {job.documents && job.documents.length > 0 && (
                          <div className="mt-2">
                            {job.documents.map((doc, i) => (
                              <a
                                key={i}
                                href={doc}
                                target="_blank"
                                rel="noreferrer"
                                className="d-block text-primary"
                              >
                                📎 Document {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline-secondary" size="sm" onClick={() => setSelectedJob(job)}>
                        Edit
                      </Button>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>
        {selectedJob && user?.uid && (
          <JobStatusModal
            show={!!selectedJob}
            onHide={() => setSelectedJob(null)}
            job={selectedJob}
            userId={user.uid}
            onSave={() => window.location.reload()}
          />
        )}
      </Container>
    </>
  );
}

export default ProgressPage;
