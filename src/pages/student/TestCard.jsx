import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from "framer-motion";
import { Calendar, Users, Clock, ChevronRight, FileText, Code } from "lucide-react";

const TestCard = ({
  test = {},
  assessment_type = 'unknown',
  isCompleted = false,
  studentId = '',
  isPublished = false,
}) => {
  const navigate = useNavigate();

  const icon = useMemo(() =>
    assessment_type === 'coding' ? <Code className="w-8 h-8 text-[#fd944e]" /> : <FileText className="w-8 h-8 text-[#000975]" />,
  [assessment_type]);

  const statusConfig = useMemo(() => ({
    color: isCompleted ? 'text-red-500' : 'text-green-500',
    text: isCompleted ? 'Completed' : 'Live',
    buttonText: isCompleted ? 'View Result' : 'Take Test',
  }), [isCompleted]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
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
    <motion.div whileHover={{ y: -2 }} className="w-full mb-4 p-3 max-w-8xl">
      <div
        className={`py-4 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer ${isCompleted ? 'cursor-not-allowed' : ''}`}
        onClick={isRegistrationStarted && !isCompleted ? handleCardClick : undefined}
      >
        
        <div className="flex justify-between items-center gap-5 p-4">
          <div className="flex gap-4 items-center">
            <div className="p-2 rounded-full">
              {icon}
            </div>
            <div className="text-[#000975]">
              <h3 className="text-xl font-bold">{test?.name || 'Unknown Test'}</h3>
              <p className="text-sm">{assessment_type?.toUpperCase() || 'Unknown Type'}</p>
            </div>
          </div>
          <span
            className={`px-4 py-2 mb-4 rounded-full text-xs font-semibold ${statusStyles[isRegistrationStarted ? statusConfig.text : 'Not Yet Started']}`}
          >
            {isRegistrationStarted ? statusConfig.text : 'Not Yet Started'}
          </span>
        </div>
        <div className="p-4">
          <p className="text-gray-600 italic">
            Take this test with proper preparation. All The Best!
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 mt-4">
            <div>
              {['starttime', 'endtime'].map((timeType) => (
                <p key={timeType} className="text-gray-800 mb-0.5">
                  <strong>{timeType === 'starttime' ? 'Start' : 'End'} Time:</strong> {formatDate(test?.[timeType])}
                </p>
              ))}
            </div>
            <div>
              {isCompleted && isPublished ? (
                <Link
                  to={`/result/${test?.contestId || test?.testId || 'unknown'}/${studentId}`}
                  className="text-white"
                >
                  <button
                    className="w-1/9 sm:w-32 ml-20 px-1 py-2 bg-[#000975] text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center font-light text-xs sm:text-base"
                  >
                    View Result
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </button>
                </Link>
              ) : isCompleted && !isPublished ? (
                <button
                  className="w-1/9 sm:w-32 ml-20 px-1 py-2 bg-[#000975] text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center font-light text-xs sm:text-base opacity-50 cursor-not-allowed"
                  disabled
                >
                  View Result
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </button>
              ) : (
                <button
                  className={`w-1/9 sm:w-32 ml-20 px-1 py-2 bg-[#000975] text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center font-light text-xs sm:text-base ${!isRegistrationStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={isRegistrationStarted ? handleCardClick : undefined}
                  disabled={!isRegistrationStarted}
                >
                  {isRegistrationStarted ? statusConfig.buttonText : 'Yet to Start'}
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
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
  }),
  assessment_type: PropTypes.string,
  isCompleted: PropTypes.bool,
  studentId: PropTypes.string,
  isPublished: PropTypes.bool,
};

export default React.memo(TestCard);
