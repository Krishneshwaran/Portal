import React, { useState, useEffect } from "react";

export default function Header({ duration }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-2">
        <h1 className="text-[#00296b] text-xl font-medium">MCQ ASSEMENT</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 text-[#00296b]">⏰</span>
        <div>
          <div className="text-[#00296b] font-medium">
            {formatTime(timeLeft)}
          </div>
          <div className="text-[#00296b] text-xs">Time Left</div>
        </div>
      </div>
    </div>
  );
}
