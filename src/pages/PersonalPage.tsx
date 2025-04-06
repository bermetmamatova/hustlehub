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
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

function PersonalPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  const [todayList, setTodayList] = useState<Question[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const user = auth.currentUser;
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;

    const fetchEverything = async () => {
      const profileRef = doc(db, "users", user.uid);
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.data();
      setProfile(profileData);

      const questionsSnapshot = await getDocs(collection(db, "dsa_questions"));
      const questionData = questionsSnapshot.docs.map((doc) => ({
        ...(doc.data() as Question),
        id: doc.id,
      }));

      const filtered = profileData
        ? questionData.filter((q) =>
            q.companies?.some((c) => profileData.companies.includes(c))
          )
        : questionData;

      setQuestions(filtered);
      setVisibleQuestions(filtered.slice(0, visibleCount));

      const progressSnapshot = await getDocs(
        collection(db, "users", user.uid, "question_progress")
      );
      const total = progressSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        return acc + (data.timeSpent || 0);
      }, 0);
      setTotalTimeSpent(total);

      const todoSnap = await getDoc(doc(db, "users", user.uid, "meta", "todo"));
      const savedData = todoSnap.data();

      if (savedData?.date === todayDate) {
        setTodayList(savedData.list || []);
        setCompletedIds(savedData.completed || []);
      } else {
        // expired todo, reset
        await setDoc(doc(db, "users", user.uid, "meta", "todo"), {
          date: todayDate,
          list: [],
          completed: [],
        });
        setTodayList([]);
        setCompletedIds([]);
      }

      setLoading(false);
    };

    fetchEverything();
  }, [user]);

  useEffect(() => {
    const filtered =
      difficultyFilter === "All"
        ? questions
        : questions.filter((q) => q.difficulty === difficultyFilter);

    setVisibleQuestions(filtered.slice(0, visibleCount));
  }, [difficultyFilter, questions, visibleCount]);

  const saveTodoState = async (newList: Question[], newCompleted: string[]) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "meta", "todo"), {
      date: todayDate,
      list: newList,
      completed: newCompleted,
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === "questions" && destination.droppableId === "today") {
      const dragged = visibleQuestions[source.index];
      const updatedList = [...todayList, dragged];
      setTodayList(updatedList);
      saveTodoState(updatedList, completedIds);
    }
  };

  const handleComplete = async (id: string) => {
    const timestamp = Timestamp.now();
    const updatedCompleted = [...completedIds, id];
    setCompletedIds(updatedCompleted);
    saveTodoState(todayList, updatedCompleted);

    await setDoc(
      doc(db, "users", user!.uid, "question_progress", id),
      {
        finishedAt: timestamp,
        status: "finished",
      },
      { merge: true }
    );
  };

  if (loading) return <p>Loading...</p>;

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
              <Nav.Link onClick={() => auth.signOut()}>Log out</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="p-4">
        <h2>👋 Welcome back, {user?.displayName}</h2>
        <p>Here are your personalized tasks.</p>
        <h5 className="text-muted mb-4">🕒 Total Time Spent: {totalTimeSpent} minutes</h5>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Row>
            <Col md={8}>
              <h4 className="mb-3">📚 Recommended DSA Questions</h4>
              <Form.Select
                className="mb-3"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Form.Select>

              <Droppable droppableId="questions">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {visibleQuestions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <QuestionCard
                              question={question}
                              variant="compact"
                            />
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
              <h4 className="mb-3">🗘️ Today’s To-do List</h4>
              <Droppable droppableId="today">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {todayList.map((question, index) => (
                      <div key={question.id} className="mb-2">
                        <QuestionCard
                          question={question}
                          checked={completedIds.includes(question.id)}
                          onCheck={() => handleComplete(question.id)}
                          variant="todo"
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
      </Container>
    </>
  );
}

export default PersonalPage;
