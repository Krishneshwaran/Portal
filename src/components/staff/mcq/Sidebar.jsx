import React, { useEffect, useState } from "react";
import Legend from "./Legend";
import QuestionNumbers from "./QuestionNumbers";

export default function Sidebar({
  totalQuestions,
  currentIndex,
  selectedAnswers,
  reviewStatus,
  onQuestionClick,
  sections,
}) {
  const [isSectionBased, setIsSectionBased] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    // Check if the test is section-based
    const isSectionTest = sections && sections.length > 0;
    setIsSectionBased(isSectionTest);

    // Default to the first section being expanded
    if (isSectionTest) {
      setExpandedSection(0);
    }
  }, [sections]);

  const toggleSection = (index) => {
    setExpandedSection((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="w-[300px]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#00296b] font-medium">Sections</h3>
        </div>
        <Legend />
        {isSectionBased ? (
          <div className="flex flex-col space-y-4">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="flex flex-col space-y-2">
                {/* Section Header with Toggle */}
                <div
                  className="flex items-center justify-between px-4 py-2 bg-gray-200 rounded-full cursor-pointer"
                  onClick={() => toggleSection(sectionIndex)}
                >
                  <span>{section.sectionName}</span>
                  <span className="text-xl font-bold">
                    {expandedSection === sectionIndex ? "▲" : "▼"}
                  </span>
                </div>

                {/* Render Questions Only if the Section is Expanded */}
                {expandedSection === sectionIndex && (
                  <QuestionNumbers
                    questionNumbers={section.questions.map(
                      (_, index) => `S${sectionIndex + 1}Q${index + 1}`
                    )}
                    questionStatuses={section.questions.map((_, index) => {
                      const uniqueIndex = `${sectionIndex}-${index}`;
                      if (reviewStatus[uniqueIndex]) return "review";
                      if (selectedAnswers[uniqueIndex]) return "answered";
                      if (`${sectionIndex}-${index}` === `${currentIndex.section}-${currentIndex.question}`) return "current";
                      return "notAnswered";
                    })}
                    onQuestionClick={(questionIndex) =>
                      onQuestionClick({
                        section: sectionIndex,
                        question: questionIndex,
                      })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <QuestionNumbers
            questionNumbers={Array.from({ length: totalQuestions }, (_, i) => i + 1)}
            questionStatuses={Array.from({ length: totalQuestions }, (_, i) => {
              if (reviewStatus[i]) return "review";
              if (selectedAnswers[i]) return "answered";
              if (i === currentIndex) return "current";
              return "notAnswered";
            })}
            onQuestionClick={onQuestionClick}
          />
        )}
      </div>
    </div>
  );
}
