import { useEffect, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  doc,
  query, 
  orderBy,
  where, 
  Timestamp, 
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Navbar,
  Nav,
  Spinner, 
  Alert, 
  Badge, 
} from "react-bootstrap";
import {
    FaHeart, 
    FaRegHeart, 
    FaPaperPlane, 
    FaComments, 
    FaFilter, 
    FaUser, 
    FaClock, 
    FaMapMarkerAlt, FaBuilding, FaLevelUpAlt, FaBriefcase,
    FaArrowLeft,
    FaSignOutAlt 
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; 


interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  location?: string;
  jobLevel?: string;
  company?: string;
  position?: string;
  experienceText: string;
  createdAt: Timestamp | null; 
  likes: number;
  likedBy: string[];
}

interface PostFormData {
  location: string;
  jobLevel: string;
  company: string;
  position: string;
  experienceText: string;
}

interface Filters {
  location: string;
  jobLevel: string;
  company: string;
  position: string;
}

const primaryColor = "#7A8D63";

function CommunityPage() {
  const navigate = useNavigate();
  const user = auth.currentUser; 

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filters, setFilters] = useState<Filters>({ location: "", jobLevel: "", company: "", position: "" });
  const [formData, setFormData] = useState<PostFormData>({ location: "", jobLevel: "", company: "", position: "", experienceText: "" });
  const [loadingPosts, setLoadingPosts] = useState(true); 
  const [posting, setPosting] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingPosts(true);
    setError(null);

    const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: CommunityPost[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as CommunityPost);
      });
      setPosts(postsData); 
      setLoadingPosts(false); 
    }, (err) => { 
      console.error("Error fetching posts in real-time:", err);
      setError("Could not load community posts. Please refresh.");
      setLoadingPosts(false);
    });

    return () => unsubscribe();
  }, []); 


  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setFilters(prev => ({ ...prev, [name]: value }));
  }

  const handlePost = async () => {
    if (!user) {
      setError("Please sign in to post.");
      return;
    }
    if (!formData.experienceText.trim()) {
        setError("Please enter your experience text before posting.");
        return;
    }

    setPosting(true);
    setError(null);

    const postData = {
      ...formData,
      username: user.displayName || "Anonymous",
      userId: user.uid,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [], 
    };

    try {
      await addDoc(collection(db, "community_posts"), postData); 
      setFormData({ location: "", jobLevel: "", company: "", position: "", experienceText: "" });
    } catch (err) {
      console.error("Error adding post:", err);
      setError("Failed to submit post. Please try again.");
    } finally {
      setPosting(false); 
    }
  };


  const handleLike = useCallback(async (post: CommunityPost) => {
    if (!user) {
      setError("Please sign in to like posts.");
      return;
    }
    setError(null); 

    const postRef = doc(db, "community_posts", post.id); 
    const alreadyLiked = post.likedBy.includes(user.uid); 

    const newLikedBy = alreadyLiked
      ? post.likedBy.filter((id: string) => id !== user.uid) 
      : [...post.likedBy, user.uid]; 
    const newLikes = alreadyLiked ? post.likes - 1 : post.likes + 1; 

    try {
      await updateDoc(postRef, {
        likes: newLikes,
        likedBy: newLikedBy,
      });
    } catch (err) {
      console.error("Error updating like:", err);
      setError("Could not update like status. Please try again.");
    }
  }, [user]); 

  const filteredPosts = posts.filter((p) => {
    return (
      (!filters.location || p.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.jobLevel || p.jobLevel?.toLowerCase().includes(filters.jobLevel.toLowerCase())) &&
      (!filters.company || p.company?.toLowerCase().includes(filters.company.toLowerCase())) &&
      (!filters.position || p.position?.toLowerCase().includes(filters.position.toLowerCase()))
    );
  });

  const formatTimestamp = (timestamp: Timestamp | null): string => {
     if (!timestamp) return 'Just now';
     const date = timestamp.toDate();
     const now = new Date();
     const secondsPast = (now.getTime() - date.getTime()) / 1000;
     if (secondsPast < 60) return `${Math.round(secondsPast)}s ago`;
     if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m ago`;
     if (secondsPast <= 86400) return `${Math.round(secondsPast / 3600)}h ago`;
     return date.toLocaleDateString();
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 sticky-top shadow-sm">
          <Container>
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
              <span style={{ backgroundColor: primaryColor, color: "white" }} className="rounded p-1 me-2 fw-bold">H☑︎H</span>
              <span className="fw-bold">HustleHub</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="hustlehub-navbar-nav" />
            <Navbar.Collapse id="hustlehub-navbar-nav" className="justify-content-end">
              <Nav className="align-items-center">
                  {}
                  <Nav.Link as={Link} to="/practice" className="nav-link-custom mx-2">Practice</Nav.Link>
                  <Nav.Link as={Link} to="/community" className="nav-link-custom mx-2 active">Community</Nav.Link> {}
                  <Nav.Link as={Link} to="/explore" className="nav-link-custom mx-2">Jobs</Nav.Link>
                  <Nav.Link as={Link} to="/connect" className="nav-link-custom mx-2">Connect</Nav.Link>
                  <Nav.Link as={Link} to="/progress" className="nav-link-custom mx-2">Progress</Nav.Link>
                  <Nav.Link as={Link} to="/mydata" className="nav-link-custom mx-2">My Data</Nav.Link>
                  {}
                  {user && (
                      <Button
                        variant="outline-light"
                        className="ms-2 d-flex align-items-center"
                        aria-label="Log out"
                        onClick={async () => { await auth.signOut(); navigate("/login"); }} 
                      >
                        <FaSignOutAlt />
                      </Button>
                  )}
              </Nav>
            </Navbar.Collapse>
          </Container>
      </Navbar>

      <Container className="py-4">
        {}
        {}

        {}
        <h2 className="mb-4 fw-bold d-flex align-items-center">
            <FaComments className="me-2" style={{ color: primaryColor }} /> Community Experiences
        </h2>

         {}
         {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

        {}
        {user && (
          <Card className="mb-4 shadow-sm rounded-lg border-0">
            <Card.Header className="bg-transparent border-0 pt-3 pb-2">
                <h5 className="mb-0">📢 Share Your Experience</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-2 mb-2">
                {}
                <Col md={3}><Form.Control size="sm" name="location" placeholder="Location (e.g., Berlin)" value={formData.location} onChange={handleFormChange} /></Col>
                <Col md={3}><Form.Control size="sm" name="jobLevel" placeholder="Level (e.g., Senior)" value={formData.jobLevel} onChange={handleFormChange} /></Col>
                <Col md={3}><Form.Control size="sm" name="company" placeholder="Company (e.g., Google)" value={formData.company} onChange={handleFormChange} /></Col>
                <Col md={3}><Form.Control size="sm" name="position" placeholder="Position (e.g., SWE)" value={formData.position} onChange={handleFormChange} /></Col>
              </Row>
              {}
              <Form.Control
                as="textarea"
                rows={3} 
                name="experienceText"
                placeholder="Describe your interview experience, tips, or ask questions..."
                value={formData.experienceText}
                onChange={handleFormChange}
                className="mb-3"
                required 
              />
              {}
              <Button
                 variant="hustle-primary" 
                 onClick={handlePost}
                 disabled={posting || !formData.experienceText.trim() || !user} 
              >
                {posting ? <Spinner as="span" animation="border" size="sm" className="me-2"/> : <FaPaperPlane className="me-1"/>}
                {posting ? 'Posting...' : 'Post Experience'}
              </Button>
            </Card.Body>
          </Card>
        )}
        {!user && ( 
            <Alert variant="info">Please <Link to="/login">sign in</Link> or <Link to="/signup">sign up</Link> to post or like experiences.</Alert>
        )}


        {}
        <Card className="mb-4 shadow-sm rounded-lg border-0">
            <Card.Header className="bg-transparent border-0 pt-3 pb-1">
                <h5 className="mb-0 d-flex align-items-center">
                    <FaFilter className="me-2" style={{color: primaryColor}}/> Filter Posts
                </h5>
            </Card.Header>
            <Card.Body className="pt-2">
                 <Row className="g-2">
                    {}
                    {(Object.keys(filters) as Array<keyof Filters>).map((field) => (
                        <Col key={field} md={3}>
                        <Form.Group controlId={`filter-${field}`}>
                             <Form.Label className="visually-hidden">{field}</Form.Label> {}
                             <Form.Control
                                size="sm"
                                type="search"
                                name={field}
                                placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                value={filters[field]}
                                onChange={handleFilterChange}
                             />
                        </Form.Group>
                        </Col>
                    ))}
                 </Row>
            </Card.Body>
        </Card>

        {}
        {loadingPosts && (
             <div className="text-center py-5">
                 <Spinner animation="border" style={{ color: primaryColor }}/>
                 <p className="text-muted mt-2">Loading posts...</p>
             </div>
        )}

        {}
        {!loadingPosts && filteredPosts.length === 0 && ( 
          <p className="text-muted text-center py-4">No posts found matching your criteria. Try broadening your filters or check back later!</p>
        )}

        {}
        <AnimatePresence>
          {!loadingPosts && filteredPosts.map((post, index) => (
            <motion.div
              key={post.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }} 
            >
                <Card className="mb-3 shadow-sm rounded-lg border-0 community-post">
                  {}
                  <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 pb-1">
                      <small className="d-flex align-items-center text-muted">
                          <FaUser className="me-2" /> {post.username || 'Anonymous'}
                      </small>
                      <small className="text-muted d-flex align-items-center">
                         <FaClock className="me-1"/> {formatTimestamp(post.createdAt)}
                      </small>
                  </Card.Header>
                  {}
                  <Card.Body className="pt-2 pb-3">
                    {}
                    <div className="mb-2 d-flex flex-wrap gap-1">
                        {post.position && <Badge pill bg="info" text="dark"><FaBriefcase className="me-1"/>{post.position}</Badge>}
                        {post.company && <Badge pill bg="secondary"><FaBuilding className="me-1"/>{post.company}</Badge>}
                        {post.jobLevel && <Badge pill bg="light" text="dark"><FaLevelUpAlt className="me-1"/>{post.jobLevel}</Badge>}
                        {post.location && <Badge pill bg="warning" text="dark"><FaMapMarkerAlt className="me-1"/>{post.location}</Badge>}
                    </div>
                    {}
                    <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{post.experienceText}</Card.Text>
                  </Card.Body>
                  {}
                  <Card.Footer className="bg-transparent border-0 d-flex justify-content-end pt-0 pb-2">
                      <Button
                          variant="light" 
                          size="sm"
                          onClick={() => handleLike(post)}
                          disabled={!user} 
                          className={`like-button ${post.likedBy?.includes(user?.uid ?? '') ? 'liked' : ''}`}
                          aria-label={post.likedBy?.includes(user?.uid ?? '') ? 'Unlike post' : 'Like post'}
                      >
                          {post.likedBy?.includes(user?.uid ?? '')
                             ? <FaHeart style={{ color: 'red' }}/> 
                             : <FaRegHeart /> 
                          }
                          <span className="ms-2">{post.likes ?? 0}</span> {}
                      </Button>
                  </Card.Footer>
                </Card>
            </motion.div>
          ))}
        </AnimatePresence>

      </Container>

       {}
       <style jsx global>{`
            /* Consistent Navbar Link Styling */
            .nav-link-custom { color: rgba(255, 255, 255, 0.75); transition: color 0.2s;}
            .nav-link-custom:hover, .nav-link-custom:focus { color: rgba(255, 255, 255, 1); }
            .nav-link-custom.active { color: #fff; font-weight: 500; }

            /* Primary Button Customization */
            .btn-hustle-primary {
                 --bs-btn-color: #fff;
                 --bs-btn-bg: ${primaryColor};
                 --bs-btn-border-color: ${primaryColor};
                 --bs-btn-hover-color: #fff;
                 --bs-btn-hover-bg: #5a6f48; /* Darker shade */
                 --bs-btn-hover-border-color: #516341;
                 --bs-btn-active-color: #fff;
                 --bs-btn-active-bg: #516341;
                 --bs-btn-active-border-color: #475639;
                 --bs-btn-disabled-color: #fff;
                 --bs-btn-disabled-bg: ${primaryColor};
                 --bs-btn-disabled-border-color: ${primaryColor};
                 color: var(--bs-btn-color);
                 background-color: var(--bs-btn-bg);
                 border-color: var(--bs-btn-border-color);
                 transition: all 0.2s ease-out;
            }
             .btn-hustle-primary:hover:not(:disabled) {
                background-color: var(--bs-btn-hover-bg);
                border-color: var(--bs-btn-hover-border-color);
                transform: translateY(-1px); /* Subtle lift */
             }
             .btn-hustle-primary:active:not(:disabled) {
                background-color: var(--bs-btn-active-bg);
                border-color: var(--bs-btn-active-border-color);
             }

            /* Like Button Styling */
             .like-button {
                color: #6c757d; /* Grey color */
                border: none;
                background-color: transparent;
                transition: transform 0.15s ease-out, color 0.15s ease-out;
             }
             .like-button:hover {
                 transform: scale(1.1);
                 color: #dc3545; /* Red color on hover */
             }
             .like-button.liked {
                 color: #dc3545; /* Red color when liked */
             }
             .like-button .ms-2 { /* Ensure space between icon and count */
                 font-size: 0.9em;
             }
             /* Styling for tags */
             .community-post .badge {
                 font-size: 0.75em;
                 padding: 0.3em 0.6em;
             }
      `}</style>
    </div>
  );
}

export default CommunityPage;