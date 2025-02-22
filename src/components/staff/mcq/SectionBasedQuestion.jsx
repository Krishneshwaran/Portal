import React, { useState, useEffect } from "react";

const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export default function SectionBasedQuestion({
  sections,
  currentSectionIndex,
  currentQuestionIndex,
  onNext,
  onPrevious,
  onFinish,
  onAnswerSelect,
  selectedAnswers,
  onReviewMark,
  reviewStatus,
  sectionTimes, // Add this prop
}) {
  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const totalQuestions = currentSection?.questions.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isLastSection = currentSectionIndex === sections.length - 1;
  const isSectionFinished = sectionTimes?.[currentSectionIndex]?.isFinished;

  const [selectedOption, setSelectedOption] = useState(
    selectedAnswers[currentSectionIndex]?.[currentQuestionIndex] || null
  );
  const [showPopup, setShowPopup] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  useEffect(() => {
    if (currentQuestion) {
      setShuffledOptions(shuffleArray(currentQuestion.options));
    }
  }, [currentQuestion]);

  useEffect(() => {
    setSelectedOption(selectedAnswers[currentSectionIndex]?.[currentQuestionIndex] || null);
  }, [selectedAnswers, currentSectionIndex, currentQuestionIndex]);

  const handleOptionSelect = (option) => {
    if (isSectionFinished) return; // Prevent selection if section is finished
    
    setSelectedOption(option);
    onAnswerSelect(currentSectionIndex, currentQuestionIndex, option);
  };

  const handleFinishClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const confirmFinish = () => {
    sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        sessionStorage.setItem(
          `section_${sectionIndex}_question_${questionIndex}`,
          JSON.stringify({
            question,
            selectedOption: selectedAnswers[sectionIndex]?.[questionIndex],
          })
        );
      });
    });
    setShowPopup(false);
    onFinish();
  };

  const handleSubmit = () => {
    currentSection.questions.forEach((question, questionIndex) => {
      sessionStorage.setItem(
        `section_${currentSectionIndex}_question_${questionIndex}`,
        JSON.stringify({
          question,
          selectedOption: selectedAnswers[currentSectionIndex]?.[questionIndex],
        })
      );
    });
    if (isLastSection) {
      confirmFinish();
    } else {
      onNext();
    }
  };

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <div className="flex-1 relative flex flex-col px-4 md:px-14">
      <div className="flex justify-between items-center my-6">
        <h2 className="text-[#00296b] text-lg md:text-xl font-normal">
          Question {currentQuestionIndex + 1}
        </h2>
        <button
          className={`text-sm border rounded-full px-4 py-1 ${
            isSectionFinished 
              ? "text-gray-400 border-gray-400 cursor-not-allowed"
              : reviewStatus[currentSectionIndex]?.[currentQuestionIndex]
              ? "text-blue-500 border-blue-500"
              : "text-red-500 border-red-500"
          }`}
          onClick={() => !isSectionFinished && onReviewMark(currentSectionIndex, currentQuestionIndex)}
          disabled={isSectionFinished}
        >
          {reviewStatus[currentSectionIndex]?.[currentQuestionIndex] ? "Marked for Review" : "Mark for Review"}
        </button>
      </div>

      <p className="text-lg font-normal mb-8">{currentQuestion.text}</p>

      <div className="space-y-4 mb-12 flex-grow">
        {shuffledOptions.map((option, idx) => (
          <div
            key={idx}
            className={`flex items-center ${isSectionFinished ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handleOptionSelect(option)}
          >
            <button
              className={`w-8 h-8 flex items-center justify-center mr-4 border rounded-lg transition-colors text-lg font-semibold ${
                selectedOption === option ? "border-[#111933] bg-[#FDC500]" : ""
              } ${isSectionFinished ? 'opacity-50' : ''}`}
              disabled={isSectionFinished}
            >
              {String.fromCharCode(65 + idx)}
            </button>
            <span className={`flex-1 px-4 md:px-14 py-4 border rounded-lg transition-colors text-lg font-normal ${
              selectedOption === option ? "border-[#00296b] bg-[#fdc500]" : ""
            } ${isSectionFinished ? 'opacity-50' : ''}`}>
              {option}
            </span>
          </div>
        ))}
      </div>



    

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] p-6 rounded-xl shadow-lg">
            <h3 className="text-[#111933] text-lg font-bold mb-4">
              MCT Mock Test
            </h3>
            <p className="text-center text-sm mb-4">
              You have gone through all the questions. <br />
              Either browse through them once again or finish your assessment.
            </p>
            <div className="grid grid-cols-6 gap-2 mb-6">
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center rounded-md text-white ${
                    selectedAnswers[idx] ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="absolute inset-0 w-full h-full">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="38"
                    stroke="#E0E0E0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="38"
                    stroke="#111933"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="238"
                    strokeDashoffset={`${
                      238 - (Object.keys(selectedAnswers[currentSectionIndex] || {}).length / totalQuestions) * 238
                    }`}
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[#111933] font-bold text-xl">
                    {Object.keys(selectedAnswers[currentSectionIndex] || {}).length}/{totalQuestions}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                className="border border-red-500 text-red-500 px-6 py-2 rounded-full"
                onClick={closePopup}
              >
                Close
              </button>
              <button
                className="bg-[#fdc500] text-[#111933] px-6 py-2 rounded-full"
                onClick={confirmFinish}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}