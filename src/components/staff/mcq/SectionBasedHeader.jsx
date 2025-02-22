import React, { useState, useEffect } from "react";
import clock from "../../../assets/Clock.svg";

export default function SectionBasedHeader({ contestId, totalDuration, sectionRemainingTime }) {
  const [totalTimeLeft, setTotalTimeLeft] = useState(() => {
    const storedTotalTime = sessionStorage.getItem(`totalTimeLeft_${contestId}`);
    return storedTotalTime ? JSON.parse(storedTotalTime) : totalDuration;
  });

  const [sectionTimeLeft, setSectionTimeLeft] = useState(() => {
    const storedSectionTime = sessionStorage.getItem(`sectionTimeLeft_${contestId}`);
    return storedSectionTime ? JSON.parse(storedSectionTime) : sectionRemainingTime;
  });

  useEffect(() => {
    const totalTimer = setInterval(() => {
      setTotalTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(totalTimer);
          return 0;
        }
        sessionStorage.setItem(`totalTimeLeft_${contestId}`, JSON.stringify(prevTime - 1));
        return prevTime - 1;
      });
    }, 1000);

    const sectionTimer = setInterval(() => {
      setSectionTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(sectionTimer);
          return 0;
        }
        sessionStorage.setItem(`sectionTimeLeft_${contestId}`, JSON.stringify(prevTime - 1));
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(totalTimer);
      clearInterval(sectionTimer);
    };
  }, [totalDuration, sectionRemainingTime, contestId]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center my-4 px-4 md:px-14">
    <div className="flex justify-center items-center gap-2">
      <h1 className="text-[#00296b] text-lg md:text-xl font-normal">MCQ ASSESSMENT</h1>
    </div>
    <div className="flex items-center mr-14 md:mr-0 gap-2">
      <img src={clock} alt="clock" className="w-8 h-8 md:w-10 md:h-10"></img>
      <div>
        <div className="text-[#00296b] text-base md:text-lg font-normal">
          {formatTime(totalTimeLeft)}
        </div>
        <div className="text-[#00296b] text-xs md:text-sm">Time Left</div>
      </div>
    </div>
  </div>
  
  );
}