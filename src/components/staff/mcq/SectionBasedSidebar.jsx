import React, { useEffect, useState } from "react";
import Legend from "./Legend";
import SectionBasedQuestionNumbers from "./SectionBasedQuestionNumbers";

export default function SectionBasedSidebar({
  sections,
  currentSectionIndex,
  currentQuestionIndex,
  selectedAnswers,
  reviewStatus,
  onQuestionClick,
  contestId, // Accept contestId as a prop
}) {
  const [sectionTimes, setSectionTimes] = useState(() => {
    const storedTimes = sessionStorage.getItem(`sectionTimes_${contestId}`);
    return storedTimes ? JSON.parse(storedTimes) : sections.map((section) => ({
      remainingTime: section.duration.hours * 3600 + section.duration.minutes * 60,
      isActive: false,
    }));
  });

  useEffect(() => {
    sessionStorage.setItem(`sectionTimes_${contestId}`, JSON.stringify(sectionTimes));
  }, [sectionTimes, contestId]);

  useEffect(() => {
    let intervalId;

    const updateTimer = () => {
      setSectionTimes((prevTimes) =>
        prevTimes.map((time, index) => {
          if (index === currentSectionIndex && time.isActive && time.remainingTime > 0) {
            return { ...time, remainingTime: time.remainingTime - 1 };
          }
          return time;
        })
      );
    };

    intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [currentSectionIndex, contestId]);

  useEffect(() => {
    setSectionTimes((prevTimes) =>
      prevTimes.map((time, index) => ({
        ...time,
        isActive: index === currentSectionIndex,
      }))
    );
  }, [currentSectionIndex]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="w-[300px]">
    
      {sections.map((section, sectionIndex) => {
        const remainingTime = sectionTimes[sectionIndex].remainingTime;
        const formattedTime = formatTime(remainingTime);

        return (
          <div key={sectionIndex} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#00296b] font-medium">{section.sectionName}</h3>
              <span className="text-gray-600">
                Duration: {formattedTime}
              </span>
            </div>
            <SectionBasedQuestionNumbers
              questionNumbers={section.questions.map((_, i) => i + 1)}
              questionStatuses={section.questions.map((_, i) => {
                if (reviewStatus[sectionIndex]?.[i]) return "review";
                if (sectionIndex === currentSectionIndex && i === currentQuestionIndex) return "current";
                if (selectedAnswers[sectionIndex]?.[i]) return "answered";
                return "notAnswered";
              })}
              onQuestionClick={(index) => onQuestionClick(sectionIndex, index)}
            />
          </div>
        );
      })}
    </div>
  );
}
