import { Question } from "../types";

type Props = {
  question: Question;
  onFinish?: () => void;
  checked?: boolean;
  onCheck?: () => void;
  variant?: string; 
  darkMode: boolean; 
  linkColor?: string; 
  textColor?: string;
};

function QuestionCard({
  question,
  onFinish,
  checked,
  onCheck,
  variant,
  darkMode,
  linkColor = "#007bff",
  textColor, // ✅ NEW
}: Props) {
  return (
    <div
      className={`question-card border rounded p-3 shadow-sm mb-3 ${
        checked ? "border-success text-muted" : ""
      }`}
    >
      <h5
        style={{
          textDecoration: checked ? "line-through" : "none",
          color: textColor,
        }}
      >
        {question.title}
      </h5>

      <p style={{ color: textColor }}>
        <strong>Difficulty:</strong> {question.difficulty}
      </p>
      <p style={{ color: textColor }}>
        <strong>Companies:</strong> {question.companies.join(", ")}
      </p>
      <a
        href={question.link}
        target="_blank"
        rel="noreferrer"
        style={{ color: linkColor }}
      >
        Solve on LeetCode
      </a>

      {typeof checked !== "undefined" && onCheck && (
        <div className="form-check mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checked}
            onChange={onCheck}
            id={`check-${question.id}`}
          />
          <label
            className="form-check-label"
            htmlFor={`check-${question.id}`}
            style={{ color: textColor }}
          >
            Mark as complete
          </label>
        </div>
      )}

      {onFinish && (
        <div className="mt-2">
          <button onClick={onFinish} className="btn btn-outline-success btn-sm">
            Finish
          </button>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
