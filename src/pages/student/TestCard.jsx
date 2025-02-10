import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from "framer-motion";
import { GiDuration } from "react-icons/gi";
import { Calendar, Clock,  FileText, Code } from "lucide-react";
import { FaArrowRightLong } from "react-icons/fa6";

const TestCard = ({
  test = {},
  assessment_type = 'unknown',
  isCompleted = false,
  studentId = '',
  isPublished = false,
}) => {
  const navigate = useNavigate();

  const icon = useMemo(() =>
    assessment_type === 'coding' ? <Code className="w-5 h-5 text-[#fd944e]" /> : <FileText className="w-5 h-5 text-[#000975]" />, [assessment_type]);

  const statusConfig = useMemo(() => ({
    color: isCompleted ? 'text-red-500' : 'text-green-500',
    text: isCompleted ? 'Completed' : 'Live',
    buttonText: isCompleted ? 'View Result' : 'Take Test',
  }), [isCompleted]); 

  const formatDuration = (hours, minutes) => {
    const totalHours = Math.floor((parseInt(hours || 0) * 60 + parseInt(minutes || 0)) / 60);
    const remainingMinutes = (parseInt(hours || 0) * 60 + parseInt(minutes || 0)) % 60;
    
    if (totalHours === 0) {
      return `${remainingMinutes} mins`;
    } else if (remainingMinutes === 0) {
      return totalHours === 1 ? `1 hr` : `${totalHours} hrs`;
    } else {
      return `${totalHours} hr ${remainingMinutes} mins`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };
  

  const handleCardClick = (e) => {
    e.preventDefault();
    if (!isCompleted) {
      const testId = test?.contestId || test?.testId || 'unknown';
      navigate(`/testinstructions/${testId}`, {
        state: { test, assessment_type },
      });
    }
  };

  const registrationStartTime = new Date(test?.starttime);
  const currentTime = new Date();
  const isRegistrationStarted = currentTime >= registrationStartTime;

  const statusStyles = {
    Live: "bg-[#34cf70] text-white",
    Upcoming: "bg-[#fd944e] text-white",
    Completed: "bg-red-500 text-white",
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="w-full mb-4 max-w-md">
      <div
        className={`py-5 px-4 border bg-gradient-to-br from-blue-50 to-white rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer ${isCompleted ? 'cursor-not-allowed' : ''}`}
        onClick={isRegistrationStarted && !isCompleted ? handleCardClick : undefined}
      >
        <div className="flex justify-between items-center gap-4 p-2">
          <div className="flex gap-2 items-center">
            <div className="rounded-full p-1 bg-white">
              {icon}
            </div>
            <div className="text-[#111933]">
              <h3 className="text-base font-semibold">{test?.name || 'Unknown Test'}</h3>
              <p className="text-sm">{assessment_type?.toUpperCase() || 'Unknown Type'}</p>
            </div>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-xl font-semibold ${statusStyles[isRegistrationStarted ? statusConfig.text : 'Not Yet Started']}`}
          >
            {isRegistrationStarted ? statusConfig.text : 'Not Yet Started'}
          </span>
        </div>
        <div className="p-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-2">
            <div className="flex flex-row gap-2 flex-wrap">
              <div className="flex bg-white py-1 px-2 border shadow rounded-sm items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{formatDate(test?.starttime).split(',')[0]}</span>
              </div>
              <div className="flex bg-white py-1 px-2 border shadow rounded-sm items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs whitespace-nowrap">
                  {new Date(test?.starttime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                </span>
              </div>

              <div className="flex bg-white py-1 px-2 border shadow rounded-sm items-center gap-1">
                <GiDuration className="w-3 h-3" />
                <span className="text-xs">
                  {formatDuration(test?.duration?.hours, test?.duration?.minutes)}
                </span>
              </div>
            </div>
            <div className="mt-2 sm:mt-0">
              {isCompleted && isPublished ? (
                <Link
                  to={`/result/${test?.contestId || test?.testId || 'unknown'}/${studentId}`}
                  className="text-white"
                >
                  <button
                    className="px-2 py-2.5 bg-[#111933] text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center font-light text-xs"
                  >
                    View Result
                    <FaArrowRightLong className="w-3 h-3 ml-1" />
                  </button>
                </Link>
              ) : isCompleted && !isPublished ? (
                <button
                  className="px-2 py-2.5 bg-[#111933] text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center font-light text-xs opacity-50 cursor-not-allowed"
                  disabled
                >
                  View Result 
                  <FaArrowRightLong className="w-3 h-3 ml-1" />
                </button>
              ) : (
                <button
                  className={`px-2 py-2.5 bg-[#111933] text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center font-light text-xs ${!isRegistrationStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={isRegistrationStarted ? handleCardClick : undefined}
                  disabled={!isRegistrationStarted}
                >
                  {isRegistrationStarted ? statusConfig.buttonText : 'Yet to Start'}
                  <FaArrowRightLong className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

TestCard.propTypes = {
  test: PropTypes.shape({
    name: PropTypes.string,
    contestId: PropTypes.string,
    testId: PropTypes.string,
    starttime: PropTypes.string,
    endtime: PropTypes.string,
    assessment_type: PropTypes.string,
    duration: PropTypes.shape({
      hours: PropTypes.string,
      minutes: PropTypes.string,
    }),
  }),
  assessment_type: PropTypes.string,
  isCompleted: PropTypes.bool,
  studentId: PropTypes.string,
  isPublished: PropTypes.bool,
};

export default React.memo(TestCard);
