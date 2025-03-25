import { useEffect, useState } from "react";
import { auth, getUserProfile } from "../lib/firebase";
import { fetchJobs } from "../api/JobsAPI";
import { Card, Container, Row, Col, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function ExploreJobs() {
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<any[]>([]);
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
                }
            } catch (error) {
                console.error("Error loading jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, [user, navigate]);

    return (
        <Container className="my-5">
            <h1 className="text-primary mb-4">Explore Jobs</h1>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : jobs.length > 0 ? (
                <Row>
                    {jobs.map((job, index) => (
                        <Col key={index} md={4} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <Card.Title>{job.job_title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {job.employer_name}
                                    </Card.Subtitle>
                                    <Card.Text>{job.job_city}, {job.job_country}</Card.Text>
                                    <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                                        <Button variant="success" className="w-100 mt-3">
                                            Apply Now
                                        </Button>
                                    </a>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <p>No jobs found based on your preferences.</p>
            )}
        </Container>
    );
}

export default ExploreJobs;
