import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";

import Growth from "./growth.gif"; 
import {
  collection,
  getDocs,
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
  Form,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import JobStatusModal from "../components/JobStatusModal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";


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
  status: "accepted" | "rejected" | "ghosted";
  documents?: string[];
}

function ProgressPage() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [solvedQuestions, setSolvedQuestions] = useState<SolvedQuestion[]>([]);
  const [questionTitles, setQuestionTitles] = useState<{ [key: string]: string }>({});
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [preferencesChecked, setPreferencesChecked] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [questionDate, setQuestionDate] = useState<string>("");
  const [jobDate, setJobDate] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    const checkPreferences = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      const data = snap.data();
      setPreferencesChecked(true);
      if (!data?.role || !data?.learningHours || !Array.isArray(data?.companies) || data.companies.length === 0) {
        navigate("/progress");
      }
    };

    const fetchData = async () => {
      const qSnapshot = await getDocs(collection(db, "users", user.uid, "question_progress"));
      const questions: SolvedQuestion[] = qSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          questionId: doc.id,
          completedAt: data.finishedAt?.toDate().toISOString() || "",
        };
      });

      const titlesSnapshot = await getDocs(collection(db, "dsa_questions"));
      const titlesMap: { [key: string]: string } = {};
      titlesSnapshot.forEach((doc) => {
        const data = doc.data();
        titlesMap[doc.id] = data.title;
      });

      const jSnapshot = await getDocs(collection(db, "users", user.uid, "applied_jobs"));
      const jobs: JobApplication[] = jSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          job_id: data.job_id,
          job_title: data.job_title,
          employer_name: data.employer_name,
          appliedAt: data.appliedAt?.toDate().toISOString() || "",
          status: data.status || "ghosted",
          documents: data.documents || [],
        };
      });

      const sortedQuestions = questions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      const sortedJobs = jobs.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

      setSolvedQuestions(sortedQuestions);
      setQuestionTitles(titlesMap);
      setAppliedJobs(sortedJobs);
      setLoading(false);
    };

    checkPreferences();
    fetchData();
  }, [user, navigate, refreshKey]);

  const filteredSolved = questionDate ? solvedQuestions.filter(q => q.completedAt.startsWith(questionDate)) : solvedQuestions;
  const filteredJobs = jobDate ? appliedJobs.filter(j => j.appliedAt.startsWith(jobDate)) : appliedJobs;

  const accepted = appliedJobs.filter(j => j.status === "accepted").length;
  const rejected = appliedJobs.filter(j => j.status === "rejected").length;
  const ghosted = appliedJobs.filter(j => j.status === "ghosted").length;

  const chartData = Array.from(new Set([...solvedQuestions.map(q => q.completedAt.split("T")[0]), ...appliedJobs.map(j => j.appliedAt.split("T")[0])]))
    .sort()
    .map(date => ({
      date,
      solved: solvedQuestions.filter(q => q.completedAt.startsWith(date)).length,
      applied: appliedJobs.filter(j => j.appliedAt.startsWith(date)).length
    }));

  if (loading || !preferencesChecked) return <p className="p-4">Loading progress...</p>;

  return (
    <>
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
            <Nav.Link as={Link} to="/connect">Connect</Nav.Link>
            <Nav.Link as={Link} to="/mydata">My Data</Nav.Link>
            <Button variant="outline-light" onClick={() => auth.signOut()} className="ms-2">Log out</Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="p-4">
        <h2 className="fw-bold text-dark">📈 Your Progress Summary</h2>

        <Row className="my-4">
          <Col md={8}>
            <Card className="shadow-sm p-3 h-100">
              <h5 className="mb-3">📊 Effort Over Time</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="solved" stroke="#8884d8" name="Solved Questions" />
                  <Line type="monotone" dataKey="applied" stroke="#82ca9d" name="Jobs Applied" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col md={4} className="d-flex flex-column justify-content-between">
            <Card className="shadow-sm rounded-4 mb-3">
              <Card.Header><span role="img" aria-label="bar chart">📊</span> Overall Stats</Card.Header>
              <Card.Body>
                <p>Total Questions Solved: {solvedQuestions.length}</p>
                <p>Total Jobs Applied: {appliedJobs.length}</p>
                <p>Accepted: {accepted}, Rejected: {rejected}, Ghosted: {ghosted}</p>
              </Card.Body>
              <Card.Footer className="text-center">
                <Image
                  src={Growth}
                  alt="Growth"
                  style={{ maxWidth: "100%", height: "auto" }}
                  fluid
                />
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="filterQuestionDate">
              <Form.Label>Filter Solved Questions by Date</Form.Label>
              <Form.Control
                type="date"
                value={questionDate}
                onChange={(e) => setQuestionDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="filterJobDate">
              <Form.Label>Filter Applied Jobs by Date</Form.Label>
              <Form.Control
                type="date"
                value={jobDate}
                onChange={(e) => setJobDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="mb-4 shadow-sm rounded-4">
              <Card.Header>✅ Solved DSA Questions</Card.Header>
              <ListGroup variant="flush">
                {filteredSolved.length === 0 ? (
                  <ListGroup.Item>No problems solved on this date.</ListGroup.Item>
                ) : (
                  filteredSolved.map((q) => (
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
            <Card className="mb-4 shadow-sm rounded-4">
              <Card.Header>📮 Applied Jobs</Card.Header>
              <ListGroup variant="flush">
                {filteredJobs.length === 0 ? (
                  <ListGroup.Item>No jobs applied on this date.</ListGroup.Item>
                ) : (
                  filteredJobs.map((job) => (
                    <ListGroup.Item key={job.id} className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{job.job_title}</strong> @ {job.employer_name}
                        <br />
                        <small className="text-muted">Applied on: {new Date(job.appliedAt).toLocaleDateString()}</small>
                        <br />
                        <span className={`badge bg-${
                          job.status === "accepted" ? "success" :
                          job.status === "rejected" ? "danger" :
                          "secondary"
                        } mt-1`}>
                          {job.status.toUpperCase()}
                        </span>
                        {Array.isArray(job.documents) && job.documents.length > 0 && (
                          <div className="mt-2">
                            {job.documents.map((doc, i) => (
                              <a
                                key={i}
                                href={doc}
                                target="_blank"
                                rel="noreferrer"
                                className="d-block text-success"
                              >
                                📎 Document {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setSelectedJob(job)}
                      >
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
            onSave={() => {
              setSelectedJob(null);
              setRefreshKey(prev => prev + 1);
            }}
          />
        )}

      </Container>
    </>
  );
}

export default ProgressPage;
