import React, { useEffect, useState } from "react";
import Legend from "./Legend";
import QuestionNumbers from "./QuestionNumbers";

export default function Sidebar({
  totalQuestions,
  currentIndex,
  selectedAnswers,
  reviewStatus,
  onQuestionClick,
  sections // Add sections prop
}) {
  const [isSectionBased, setIsSectionBased] = useState(false);
  const [sectionData, setSectionData] = useState([]);

  useEffect(() => {
    // Check local storage to determine if the test is section-based
    const isSectionBased = localStorage.getItem("sections_v6nheee9w") === "true";
    setIsSectionBased(isSectionBased);

    if (isSectionBased && sections) {
      // Extract section data from the sections prop
      const sectionData = sections.map(section => ({
        sectionName: section.sectionName,
        questions: section.questions.map((_, index) => index + 1)
      }));
      setSectionData(sectionData);
    }
  }, [sections]);

  const length = totalQuestions || 0;
  const questionNumbers = Array.from({ length }, (_, i) => i + 1);

  const questionStatuses = questionNumbers.map((num) => {
    const index = num - 1;
    if (reviewStatus[index]) return "review";
    if (num - 1 === currentIndex) return "current";
    if (selectedAnswers[index]) return "answered";
    return "notAnswered";
  });

  return (
    <div className="w-[300px]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#00296b] font-medium">
            {isSectionBased ? "Sections" : "Questions"}
          </h3>
        </div>
        <Legend />
        {isSectionBased ? (
          <div className="flex flex-col space-y-4">
            {sectionData.map((section, sectionIndex) => (
              <div key={sectionIndex} className="flex flex-col space-y-2">
                <div className="px-4 py-2 bg-gray-200 rounded-full text-center">
                  {section.sectionName}
                </div>
                <QuestionNumbers
                  questionNumbers={section.questions}
                  questionStatuses={section.questions.map((num) => {
                    const index = num - 1;
                    if (reviewStatus[index]) return "review";
                    if (num - 1 === currentIndex) return "current";
                    if (selectedAnswers[index]) return "answered";
                    return "notAnswered";
                  })}
                  onQuestionClick={onQuestionClick}
                />
              </div>
            ))}
          </div>
        ) : (
          <QuestionNumbers
            questionNumbers={questionNumbers}
            questionStatuses={questionStatuses}
            onQuestionClick={onQuestionClick}
          />
        )}
      </div>
    </div>
  );
}

