import React from "react";
import { Question } from "../types";

type Props = {
  question: Question;
  darkMode?: boolean;
  linkColor?: string;
  checked?: boolean;
  onCheck?: () => void;
  variant?: "compact" | "todo";
};

function QuestionCard({
  question,
  darkMode = false,
  linkColor = "#7A8D63",
  checked,
  onCheck,
  variant = "compact",
}: Props) {
  const bgColor = darkMode ? "#2c2f33" : "#f8f9fa";
  const textColor = darkMode ? "#f1f1f1" : "#212529";
  const subTextColor = darkMode ? "#cccccc" : "#555";

  return (
    <div
      className="p-3 rounded shadow-sm"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: darkMode ? "1px solid #444" : "1px solid #ddd",
      }}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="mb-2" style={{ color: textColor }}>
            {question.title}
          </h5>
          <p className="mb-1" style={{ color: subTextColor }}>
            <strong>Difficulty:</strong> {question.difficulty}
          </p>
          {question.companies && question.companies.length > 0 && (
            <p className="mb-2" style={{ color: subTextColor }}>
              <strong>Companies:</strong> {question.companies.join(", ")}
            </p>
          )}
          <a
            href={question.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: linkColor,
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            Solve on LeetCode
          </a>
        </div>

        {variant === "todo" && (
          <input
            type="checkbox"
            className="form-check-input mt-1"
            checked={checked}
            onChange={onCheck}
            style={{ transform: "scale(1.2)" }}
          />
        )}
      </div>
    </div>
  );
}

export default QuestionCard;
