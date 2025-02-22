import React, { useEffect, useState } from "react";
import QuestionNumbers from "./QuestionNumbers";
import Legend from "./Legend";

export default function SectionBasedSidebar({
  sections,
  currentSectionIndex,
  currentQuestionIndex,
  selectedAnswers,
  reviewStatus,
  onQuestionClick,
  contestId,
}) {
  const [sectionTimes, setSectionTimes] = useState(() => {
    const storedTimes = sessionStorage.getItem(`sectionTimes_${contestId}`);
    return storedTimes ? JSON.parse(storedTimes) : sections.map((section) => ({
      remainingTime: section.duration.hours * 3600 + section.duration.minutes * 60,
      isActive: false,
      isFinished: false,
    }));
  });

  const [visitedQuestions, setVisitedQuestions] = useState(() => {
    const storedVisited = sessionStorage.getItem(`visitedQuestions_${contestId}`);
    return storedVisited
      ? JSON.parse(storedVisited)
      : sections.map(section => Array(section.questions.length).fill(false));
  });

  const [openSections, setOpenSections] = useState(new Set([currentSectionIndex]));

  useEffect(() => {
    sessionStorage.setItem(`sectionTimes_${contestId}`, JSON.stringify(sectionTimes));
  }, [sectionTimes, contestId]);

  useEffect(() => {
    let intervalId;

    const updateTimer = () => {
      setSectionTimes((prevTimes) =>
        prevTimes.map((time, index) => {
          if (index === currentSectionIndex && time.isActive && time.remainingTime > 0) {
            const newRemainingTime = time.remainingTime - 1;
            return { 
              ...time, 
              remainingTime: newRemainingTime,
              isFinished: newRemainingTime === 0 
            };
          }
          return time;
        })
      );
    };

    intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [currentSectionIndex]);

  useEffect(() => {
    setSectionTimes((prevTimes) =>
      prevTimes.map((time, index) => ({
        ...time,
        isActive: index === currentSectionIndex,
      }))
    );
  }, [currentSectionIndex]);

  const findNextSectionWithTime = () => {
    for (let i = currentSectionIndex + 1; i < sections.length; i++) {
      if (sectionTimes[i].remainingTime > 0) {
        return i;
      }
    }
    // If no sections ahead have time, check previous sections
    for (let i = 0; i < currentSectionIndex; i++) {
      if (sectionTimes[i].remainingTime > 0) {
        return i;
      }
    }
    return null;
  };

  useEffect(() => {
    if (sectionTimes[currentSectionIndex]?.remainingTime === 0) {
      const nextSectionIndex = findNextSectionWithTime();
      if (nextSectionIndex !== null) {
        onQuestionClick(nextSectionIndex, 0);
      }
    }
  }, [sectionTimes, currentSectionIndex]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSection = (sectionIndex) => {
    // Don't allow toggling if section is finished
    if (sectionTimes[sectionIndex].isFinished) return;
    
    setOpenSections((prevOpenSections) => {
      const newOpenSections = new Set(prevOpenSections);
      if (newOpenSections.has(sectionIndex)) {
        newOpenSections.delete(sectionIndex);
      } else {
        newOpenSections.add(sectionIndex);
      }
      return newOpenSections;
    });
  };

  const handleSectionClick = (sectionIndex) => {
    // Don't allow navigation to finished sections
    if (sectionTimes[sectionIndex].isFinished) return;

    if (sectionIndex === currentSectionIndex) {
      toggleSection(sectionIndex);
    } else {
      onQuestionClick(sectionIndex, 0);
      setOpenSections(new Set([sectionIndex]));
    }
  };

  useEffect(() => {
    sessionStorage.setItem(`visitedQuestions_${contestId}`, JSON.stringify(visitedQuestions));
  }, [visitedQuestions, contestId]);

  useEffect(() => {
    setVisitedQuestions(prev => {
      const newVisited = [...prev];
      if (newVisited[currentSectionIndex] && !newVisited[currentSectionIndex][currentQuestionIndex]) {
        newVisited[currentSectionIndex] = [...newVisited[currentSectionIndex]];
        newVisited[currentSectionIndex][currentQuestionIndex] = true;
      }
      return newVisited;
    });
  }, [currentSectionIndex, currentQuestionIndex]);

  const getQuestionStatus = (sectionIndex, questionIndex) => {
    if (sectionTimes[sectionIndex].isFinished) return "finished";
    if (reviewStatus[sectionIndex]?.[questionIndex]) return "review";
    if (sectionIndex === currentSectionIndex && questionIndex === currentQuestionIndex) return "current";
    if (selectedAnswers[sectionIndex]?.[questionIndex] !== undefined) return "answered";
    if (visitedQuestions[sectionIndex]?.[questionIndex]) return "notAttempted";
    return "notAnswered";
  };

  return (
    <div className="w-full p-4 space-y-6">
      <Legend />
      {sections.map((section, sectionIndex) => {
        const remainingTime = sectionTimes[sectionIndex].remainingTime;
        const formattedTime = formatTime(remainingTime);
        const isFinished = sectionTimes[sectionIndex].isFinished;

        return (
          <div key={sectionIndex} className={`border-b border-gray-200 pb-4 ${isFinished ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <button
                className={`flex items-center text-[#111933] font-medium ${
                  isFinished ? 'cursor-not-allowed' : 'hover:underline'
                }`}
                onClick={() => handleSectionClick(sectionIndex)}
                disabled={isFinished}
              >
                <span>{section.sectionName}</span>
                <svg
                  className={`w-4 h-4 ml-2 ${openSections.has(sectionIndex) ? "transform rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <span className={`text-gray-600 ${remainingTime === 0 ? 'text-red-500' : ''}`}>
                {formattedTime}
              </span>
            </div>
            {openSections.has(sectionIndex) && (
              <QuestionNumbers
                questionNumbers={section.questions.map((_, i) => i + 1)}
                questionStatuses={section.questions.map((_, i) => getQuestionStatus(sectionIndex, i))}
                onQuestionClick={(index) => !isFinished && onQuestionClick(sectionIndex, index)}
                isDisabled={isFinished}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}