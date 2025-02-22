import React, { useState } from "react";

export default function QuestionNumbers({
  questionNumbers,
  questionStatuses,
  onQuestionClick,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 50;
  const totalPages = Math.ceil(questionNumbers.length / questionsPerPage);

  const handleClick = (index) => {
    onQuestionClick(index);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getPaginatedQuestions = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return questionNumbers.slice(startIndex, endIndex);
  };

  const paginatedQuestionNumbers = getPaginatedQuestions();

  return (
    <div>
      <div className="grid grid-cols-5 gap-x-6 gap-y-4 mr-4">
        {paginatedQuestionNumbers.map((num, index) => {
          const actualIndex = (currentPage - 1) * questionsPerPage + index;
          return (
            <div
              key={num}
              className={`p-[6px] border rounded-md text-center cursor-pointer ${
                questionStatuses[actualIndex] === "current"
                  ? "bg-[#ffe078] text-black"
                  : questionStatuses[actualIndex] === "review"
                  ? "bg-blue-300 text-black"
                  : questionStatuses[actualIndex] === "answered"
                  ? "bg-[#c1f0c8] text-black"
                  : questionStatuses[actualIndex] === "notAttempted"
                  ? "bg-[#ff7676] text-black"
                  : "border border-[#ffe078] text-black"
              }`}
              onClick={() => handleClick(actualIndex)}
            >
              {num}
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 -mr-2 flex items-center justify-center rounded-full text-black disabled:opacity-50"
          >
            ‹
          </button>
          <button
            onClick={() => handlePageChange(1)}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              currentPage === 1
                ? "bg-[#ffe078]"
                : " text-black"
            }`}
          >
            1
          </button>
          <button
            onClick={() => handlePageChange(2)}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              currentPage === 2
                ? "bg-[#ffe078] "
                : " text-black"
            }`}
          >
            2
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 -ml-2 flex items-center justify-center rounded-full text-black disabled:opacity-50"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}