import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import QuestionCard from "../components/QuestionCard";
import { Question } from "../types";

function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, "dsa_questions"));
      const data = snapshot.docs.map((doc) => {
        const questionData = doc.data();
        return {
          ...questionData,
          id: String(doc.id), 
        } as Question;
      });

      setQuestions(data);
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  if (loading) return <p>Loading questions...</p>;

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">Recommended Questions</h2>
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}

export default Questions;
