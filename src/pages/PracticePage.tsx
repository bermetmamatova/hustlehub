import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import QuestionCard from "../components/QuestionCard"; 
import { Question } from "../types"; 
import {
  Container,
  Row,
  Col,
  Form,
  Navbar,
  Nav,
  Card,
  Button,
  Badge, 
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { FaSignOutAlt, FaSun, FaMoon, FaTasks, FaCheckCircle, FaListUl, FaFilter } from "react-icons/fa"; 

function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  const [todayList, setTodayList] = useState<Question[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null); 
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(15); 
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const yellowTextColor = "#FFD54F";


  const user = auth.currentUser;
  const navigate = useNavigate();
  const todayDate = new Date().toISOString().split("T")[0];
  const { width, height } = useWindowSize();


  useEffect(() => {
    if (!user) {
      navigate("/login"); 
      return;
    };

    const fetchEverything = async () => {
      setLoading(true);
      try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.data();
        setProfile(profileData);

        const questionsSnapshot = await getDocs(collection(db, "dsa_questions"));
        const questionData = questionsSnapshot.docs.map((doc) => ({
          ...(doc.data() as Question),
          id: doc.id,
        }));

      let companyFiltered = questionData; 
      if (profileData && profileData.companies && profileData.companies.length > 0) {
        const userCompanies = profileData.companies; 
        companyFiltered = questionData.filter((q) =>
          q.companies?.some((c) => userCompanies.includes(c)) 
        );
      }

      setQuestions(companyFiltered); 
        const todoRef = doc(db, "users", user.uid, "meta", "todo");
        const todoSnap = await getDoc(todoRef);
        const savedData = todoSnap.data();

        if (savedData?.date === todayDate) {
          setTodayList(savedData.list || []);
          setCompletedIds(savedData.completed || []);
        } else {
          await setDoc(todoRef, {
            date: todayDate,
            list: [],
            completed: [],
          });
          setTodayList([]);
          setCompletedIds([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [user, navigate, todayDate]); 

  useEffect(() => {
    const difficultyFiltered =
      difficultyFilter === "All"
        ? questions
        : questions.filter((q) => q.difficulty === difficultyFilter);

    const availableForRecommendation = difficultyFiltered.filter(
      (q) => !todayList.find((t) => t.id === q.id)
    );

    setVisibleQuestions(availableForRecommendation.slice(0, visibleCount));
  }, [difficultyFilter, questions, visibleCount, todayList]); 

  const saveTodoState = async (newList: Question[], newCompleted: string[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "meta", "todo"), {
        date: todayDate,
        list: newList,
        completed: newCompleted,
      });
    } catch (error) {
        console.error("Error saving todo state:", error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || !user) return;

    if (source.droppableId === "questions" && destination.droppableId === "today") {
      const draggedQuestion = visibleQuestions[source.index];

     
      if (!todayList.find(q => q.id === draggedQuestion.id)) {
          const updatedTodayList = [...todayList];
          updatedTodayList.splice(destination.index, 0, draggedQuestion);

          const updatedVisibleQuestions = visibleQuestions.filter((q, index) => index !== source.index);

          setTodayList(updatedTodayList);
          setVisibleQuestions(updatedVisibleQuestions);
          saveTodoState(updatedTodayList, completedIds);
      }
    }
  
    else if (source.droppableId === "today" && destination.droppableId === "today") {
        const items = Array.from(todayList);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        setTodayList(items);
        saveTodoState(items, completedIds);
    }
     
  };

  const handleComplete = async (id: string) => {
    if (!user) return;
    const timestamp = Timestamp.now();
    const updatedCompleted = [...completedIds, id];
    setCompletedIds(updatedCompleted);
    saveTodoState(todayList, updatedCompleted); 

    try {
      await setDoc(
        doc(db, "users", user.uid, "question_progress", id),
        {
          finishedAt: timestamp,
          status: "finished",
          lastUpdated: timestamp, 
          questionId: id, 
        },
        { merge: true } 
      );

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); 
    } catch (error) {
        console.error("Error marking question complete:", error);
        setCompletedIds(completedIds); 
        saveTodoState(todayList, completedIds);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
         {}
         <p>Loading your practice space...</p>
      </div>
    );
  }

  const primaryColor = "#7A8D63";
  const dynamicLinkColor = darkMode ? yellowTextColor : primaryColor; 

  return (
    <div className={darkMode ? "dark-mode" : ""} style={{ backgroundColor: darkMode ? '#212529' : '#f8f9fa', minHeight: "100vh" }}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      {}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 sticky-top shadow-sm">
        <Container>
          {}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span
              style={{ backgroundColor: primaryColor, color: "white" }}
              className="rounded p-1 me-2 fw-bold"
            >
              HH
            </span>
            <span className="fw-bold">HustleHub</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {}
              <Nav.Link as={Link} to="/explore" className="mx-2 nav-link-custom">Jobs</Nav.Link>
              <Nav.Link as={Link} to="/community" className="mx-2 nav-link-custom">Community</Nav.Link>
              <Nav.Link as={Link} to="/progress" className="mx-2 nav-link-custom">Progress</Nav.Link>
              <Nav.Link as={Link} to="/connect" className="mx-2 nav-link-custom">Connect</Nav.Link>
              <Nav.Link as={Link} to="/mydata" className="mx-2 nav-link-custom">My Data</Nav.Link>

              {}
              <Button
                variant="outline-light"
                onClick={() => setDarkMode(!darkMode)}
                className="ms-2 d-flex align-items-center"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </Button>
              {}
              <Button
                  variant="outline-light"
                  onClick={handleLogout}
                  className="ms-2 d-flex align-items-center"
                  aria-label="Log out"
              >
                  <FaSignOutAlt />
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {}
      <Container fluid="lg" className="py-4">
          {}
          <Row className="mb-4 align-items-center">
              <Col>
                  <h2 className={`fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>
                    Welcome back, {user?.displayName || 'Hustler'}!
                  </h2>
                  <p className={darkMode ? 'text-white-50' : 'text-muted'}>
                    Drag questions to your daily list and start practicing.
                  </p>
              </Col>
              <Col xs="auto" className={`text-end ${darkMode ? 'text-light' : 'text-dark'}`}>
                  <div className="mb-1">
                      <FaTasks className="me-2" style={{ color: primaryColor }} />
                      Goal: <Badge bg={darkMode ? "secondary" : "light"} text={darkMode ? "light" : "dark"} pill className="ms-1">{todayList.length}</Badge>
                  </div>
                  <div>
                      <FaCheckCircle className="me-2" style={{ color: primaryColor }} />
                      Solved: <Badge bg={darkMode ? "secondary" : "light"} text={darkMode ? "light" : "dark"} pill className="ms-1">{completedIds.length}</Badge>
                  </div>
              </Col>
          </Row>

          <DragDropContext onDragEnd={handleDragEnd}>
              <Row className="g-4"> {}

                  {}
                  <Col md={7}>
                      <Card className={`shadow-sm rounded-lg h-100 border-0 ${darkMode ? 'bg-secondary text-light' : 'bg-white'}`}>
                          <Card.Header className={`bg-transparent border-0 pt-3 pb-2 ${darkMode ? 'text-light' : ''}`}>
                              <h4 className="mb-0 d-flex align-items-center">
                                <FaListUl className="me-2" style={{ color: primaryColor }} /> Recommended Questions
                              </h4>
                          </Card.Header>
                          <Card.Body className="pt-2">
                              <Form.Group controlId="difficultyFilter" className="mb-3 d-flex align-items-center w-75">
                                 <FaFilter className={`me-2 ${darkMode ? 'text-white-50' : 'text-muted'}`} />
                                 <Form.Select
                                    aria-label="Filter by difficulty"
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value)}
                                    className={darkMode ? 'form-select-dark' : ''} 
                                    size="sm"
                                >
                                    <option value="All">All Difficulties</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </Form.Select>
                              </Form.Group>

                              <Droppable droppableId="questions">
                                  {(provided, snapshot) => (
                                      <div
                                          ref={provided.innerRef}
                                          {...provided.droppableProps}
                                          style={{ minHeight: '300px', 
                                                   transition: 'background-color 0.2s ease',
                                                   backgroundColor: snapshot.isDraggingOver ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                                                   borderRadius: 'var(--bs-border-radius)' 
                                                }}
                                          className="p-2"
                                      >
                                          {visibleQuestions.length > 0 ? visibleQuestions.map((question, index) => (
                                              <Draggable key={question.id} draggableId={question.id} index={index}>
                                                  {(provided, snapshot) => (
                                                      <div
                                                          ref={provided.innerRef}
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                          style={{
                                                              ...provided.draggableProps.style,
                                                              userSelect: "none",
                                                              marginBottom: "10px",
                                                              opacity: snapshot.isDragging ? 0.8 : 1,
                                                            
                                                          }}
                                                      >
                                                          <QuestionCard
                                                              question={question}
                                                              variant="compact" 
                                                              darkMode={darkMode}
                                                              linkColor={dynamicLinkColor}
                                                          />
                                                      </div>
                                                  )}
                                              </Draggable>
                                          )) : (
                                              <p className={darkMode ? 'text-white-50' : 'text-muted'}>No more recommendations match your criteria. Try adjusting filters or adding more target companies!</p>
                                          )}
                                          {provided.placeholder}
                                      </div>
                                  )}
                              </Droppable>
                              {}
                          </Card.Body>
                      </Card>
                  </Col>

                  {}
                  <Col md={5}>
                      <Card className={`shadow-sm rounded-lg h-100 border-0 ${darkMode ? 'bg-secondary text-light' : 'bg-white'}`}>
                          <Card.Header className={`bg-transparent border-0 pt-3 pb-2 ${darkMode ? 'text-light' : ''}`}>
                             <h4 className="mb-0 d-flex align-items-center">
                               <FaTasks className="me-2" style={{ color: primaryColor }} /> Today’s To-Solve List
                             </h4>
                          </Card.Header>
                          <Card.Body className="pt-2">
                              <Droppable droppableId="today">
                                  {(provided, snapshot) => (
                                      <div
                                          ref={provided.innerRef}
                                          {...provided.droppableProps}
                                          style={{ minHeight: '300px',
                                                   transition: 'background-color 0.2s ease',
                                                   backgroundColor: snapshot.isDraggingOver ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                                                   borderRadius: 'var(--bs-border-radius)'
                                                 }}
                                          className="p-2"
                                      >
                                          {todayList.length > 0 ? todayList.map((question, index) => (
                                               <Draggable key={question.id} draggableId={question.id} index={index}>
                                                  {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps} 
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            userSelect: "none",
                                                            marginBottom: "10px",
                                                            opacity: snapshot.isDragging ? 0.8 : 1,
                                                        }}
                                                    >
                                                          <QuestionCard
                                                              question={question}
                                                              checked={completedIds.includes(question.id)}
                                                              onCheck={() => handleComplete(question.id)}
                                                              variant="todo" 
                                                              darkMode={darkMode}
                                                              linkColor={dynamicLinkColor}
                                                          />
                                                    </div>
                                                  )}
                                              </Draggable>
                                          )) : (
                                              <div className={`text-center p-5 ${darkMode ? 'text-white-50' : 'text-muted'}`}>
                                                  <p>Drag questions from the left to add them to your daily list.</p>
                                              </div>
                                          )}
                                          {provided.placeholder}
                                      </div>
                                  )}
                              </Droppable>
                          </Card.Body>
                      </Card>
                  </Col>
              </Row>
          </DragDropContext>
      </Container>

      {}
      {}

       {}
       <style jsx global>{`
            .dark-mode .form-select {
                background-color: #495057; /* Darker background */
                color: #ced4da; /* Lighter text */
                border-color: #6c757d; /* Darker border */
            }
            .dark-mode .form-select:focus {
                 border-color: ${primaryColor}; /* Use primary color for focus */
                 box-shadow: 0 0 0 0.25rem rgba(122, 141, 99, 0.5); /* Primary color focus shadow */
            }
            .nav-link-custom {
                color: rgba(255, 255, 255, 0.75); /* Slightly dimmer than active */
            }
            .nav-link-custom:hover {
                color: rgba(255, 255, 255, 1);
            }
            .dark-mode {
                // Define dark mode variables if needed, e.g., for QuestionCard
                // --bs-body-color: #dee2e6;
                // --bs-body-bg: #212529;
                // --bs-card-bg: #343a40; // Example dark card background
            }
            // Style for drag handle indication (optional but good UX)
            [data-rbd-drag-handle-context-id] {
                cursor: grab;
            }
       `}</style>
    </div>
  );
}

export default PracticePage;