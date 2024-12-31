import React from "react";

export default function QuestionNumbers({
  questionNumbers,
  questionStatuses,
  onQuestionClick,
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {questionNumbers.map((num, index) => (
        <button
          key={num}
          className={`w-10 h-10 flex items-center justify-center rounded-md ${
            questionStatuses[index] === "current"
              ? "bg-yellow-400 text-white"
              : questionStatuses[index] === "answered"
              ? "bg-green-500 text-white"
              : questionStatuses[index] === "review"
              ? "bg-blue-600 text-white"
              : "bg-gray-100"
          }`}
          onClick={() => onQuestionClick(num)} // Navigate to specific question
        >
          {num}
        </button>
      ))}
    </div>
  );
}
