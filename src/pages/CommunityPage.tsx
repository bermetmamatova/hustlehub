import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Badge,
  Navbar,
  Nav,
} from "react-bootstrap";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { Link } from "react-router-dom";

function CommunityPage() {
  const user = auth.currentUser;
  const [posts, setPosts] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    location: "",
    jobLevel: "",
    company: "",
    position: "",
  });
  const [formData, setFormData] = useState({
    location: "",
    jobLevel: "",
    company: "",
    position: "",
    experienceText: "",
  });

  const fetchPosts = async () => {
    const snapshot = await getDocs(collection(db, "community_posts"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!user) return;
    const postData = {
      ...formData,
      username: user.displayName || "Anonymous",
      userId: user.uid,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
    };
    await addDoc(collection(db, "community_posts"), postData);
    setFormData({ location: "", jobLevel: "", company: "", position: "", experienceText: "" });
    fetchPosts();
  };

  const handleLike = async (post: any) => {
    const postRef = doc(db, "community_posts", post.id);
    const alreadyLiked = post.likedBy.includes(user?.uid);
    const newLikedBy = alreadyLiked
      ? post.likedBy.filter((id: string) => id !== user?.uid)
      : [...post.likedBy, user?.uid];

    await updateDoc(postRef, {
      likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
      likedBy: newLikedBy,
    });
    fetchPosts();
  };

  const filteredPosts = posts.filter((p) => {
    return (
      (!filters.location || p.location === filters.location) &&
      (!filters.jobLevel || p.jobLevel === filters.jobLevel) &&
      (!filters.company || p.company === filters.company) &&
      (!filters.position || p.position === filters.position)
    );
  });

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
    <Container className="my-5">
      <h2 className="mb-4">💬 Community Experiences</h2>

      <Card className="mb-4 p-3">
        <h5>📢 Share Your Job Application Experience</h5>
        <Row>
          <Col md={3}>
            <Form.Control
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mb-2"
            />
          </Col>
          <Col md={3}>
            <Form.Control
              placeholder="Job Level"
              value={formData.jobLevel}
              onChange={(e) => setFormData({ ...formData, jobLevel: e.target.value })}
              className="mb-2"
            />
          </Col>
          <Col md={3}>
            <Form.Control
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="mb-2"
            />
          </Col>
          <Col md={3}>
            <Form.Control
              placeholder="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="mb-2"
            />
          </Col>
        </Row>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Describe your experience..."
          value={formData.experienceText}
          onChange={(e) => setFormData({ ...formData, experienceText: e.target.value })}
          className="mb-3"
        />
        <Button onClick={handlePost}>Post</Button>
      </Card>

      <h5 className="mb-3">🔍 Filter Posts</h5>
      <Row className="mb-4">
        {Object.keys(filters).map((field) => (
          <Col key={field} md={3}>
            <Form.Control
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={filters[field as keyof typeof filters]}
              onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
            />
          </Col>
        ))}
      </Row>

      {filteredPosts.map((post) => (
        <Card key={post.id} className="mb-3">
          <Card.Body>
            <Card.Title>{post.username}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {post.position} at {post.company} ({post.jobLevel}) — {post.location}
            </Card.Subtitle>
            <Card.Text>{post.experienceText}</Card.Text>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleLike(post)}
            >
              {post.likedBy.includes(user?.uid) ? <AiFillLike /> : <AiOutlineLike />} {post.likes}
            </Button>
          </Card.Body>
        </Card>
      ))}
    </Container>
    </>
  );
}

export default CommunityPage;