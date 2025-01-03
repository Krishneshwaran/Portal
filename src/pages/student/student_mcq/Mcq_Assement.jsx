import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/staff/mcq/Header";
import Question from "../../../components/staff/mcq/Question";
import Sidebar from "../../../components/staff/mcq/Sidebar";

export default function Mcq_Assessment() {
  const { contestId } = useParams();
  const studentId = sessionStorage.getItem("studentId");
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    const storedAnswers = sessionStorage.getItem(`selectedAnswers_${contestId}`);
    return storedAnswers ? JSON.parse(storedAnswers) : {};
  });
  const [reviewStatus, setReviewStatus] = useState(() => {
    const storedReviewStatus = sessionStorage.getItem(`reviewStatus_${contestId}`);
    return storedReviewStatus ? JSON.parse(storedReviewStatus) : {};
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [fullScreenMode, setFullScreenMode] = useState(() => {
    const storedFullScreenMode = sessionStorage.getItem(`fullScreenMode_${contestId}`);
    return storedFullScreenMode === "true";
  });
  const [fullscreenWarnings, setFullscreenWarnings] = useState(() => {
    return Number(sessionStorage.getItem(`fullscreenWarnings_${contestId}`)) || 0;
  });
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(() => {
    return Number(sessionStorage.getItem(`tabSwitchWarnings_${contestId}`)) || 0;
  });
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const mediaStreamRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasFocus, setHasFocus] = useState(true);
  const lastActiveTime = useRef(Date.now());
  const lastWarningTime = useRef(Date.now());

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `https://vercel-1bge.onrender.com/api/mcq/get_mcqquestions/${contestId}`
        );
        setQuestions(response.data.questions);
        const { hours, minutes } = response.data.duration;
        const totalDuration = parseInt(hours) * 3600 + parseInt(minutes) * 60;
        setDuration(totalDuration);

        const startTime = sessionStorage.getItem(`startTime_${contestId}`);
        if (startTime) {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
          setRemainingTime(totalDuration - elapsedTime);
        } else {
          sessionStorage.setItem(`startTime_${contestId}`, Date.now());
          setRemainingTime(totalDuration);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [contestId, studentId]);

  useEffect(() => {
    sessionStorage.setItem(`selectedAnswers_${contestId}`, JSON.stringify(selectedAnswers));
    sessionStorage.setItem(`reviewStatus_${contestId}`, JSON.stringify(reviewStatus));
  }, [selectedAnswers, reviewStatus, contestId]);

  const handleAnswerSelect = (index, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleReviewMark = (index) => {
    setReviewStatus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addWarning = (type) => {
    const currentTime = Date.now();
    if (currentTime - lastWarningTime.current < 1000) {
      return; // Debounce warnings
    }
    lastWarningTime.current = currentTime;

    if (type === 'fullscreen') {
      setFullscreenWarnings((prevWarnings) => {
        const newWarnings = prevWarnings + 1;
        sessionStorage.setItem(`fullscreenWarnings_${contestId}`, newWarnings);
        return newWarnings;
      });
    } else if (type === 'tabSwitch') {
      setTabSwitchWarnings((prevWarnings) => {
        const newWarnings = prevWarnings + 1;
        sessionStorage.setItem(`tabSwitchWarnings_${contestId}`, newWarnings);
        return newWarnings;
      });
    }
    setShowWarningModal(true);
  };

  useEffect(() => {
    const enforceFullScreen = async () => {
      try {
        const element = document.documentElement;
        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement &&
            !document.msFullscreenElement) {
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if (element.webkitRequestFullscreen) {
            await element.webkitRequestFullscreen();
          } else if (element.mozRequestFullScreen) {
            await element.mozRequestFullScreen();
          } else if (element.msRequestFullscreen) {
            await element.msRequestFullscreen();
          }
        }
      } catch (error) {
        console.error("Error enforcing fullscreen mode:", error);
      }
    };

    // Check fullscreen on component mount and after any reload
    enforceFullScreen();

    const onFullscreenChange = async () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isFullscreen && !isTestFinished) {
        addWarning('fullscreen');
        // Immediately try to re-enter fullscreen
        await enforceFullScreen();
      }

      setFullScreenMode(isFullscreen);
      sessionStorage.setItem(
        `fullScreenMode_${contestId}`,
        isFullscreen ? "true" : "false"
      );
    };

    const preventReload = (e) => {
      if (!isTestFinished) {
        e.preventDefault();
        e.returnValue = '';
        enforceFullScreen();
        return e.returnValue;
      }
    };

    const handleKeyDown = async (e) => {
      if (!isTestFinished) {
        // Prevent ESC key
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          await enforceFullScreen();
          return false;
        }

        // Prevent F5 and Ctrl+R
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
          e.preventDefault();
          e.stopPropagation();
          addWarning('tabSwitch');
          return false;
        }

        // Prevent Alt+Tab
        if (e.altKey && e.key === 'Tab') {
          e.preventDefault();
          addWarning('tabSwitch');
          return false;
        }

        // Prevent Ctrl+W and Cmd+W
        if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
          e.preventDefault();
          addWarning('tabSwitch');
          return false;
        }

        // Prevent Ctrl+Shift+W and Cmd+Shift+W
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W') {
          e.preventDefault();
          addWarning('tabSwitch');
          return false;
        }

        // Prevent Alt+F4
        if (e.altKey && e.key === 'F4') {
          e.preventDefault();
          addWarning('tabSwitch');
          return false;
        }

        // Prevent Ctrl+Alt+Delete
        if (e.ctrlKey && e.altKey && e.key === 'Delete') {
          e.preventDefault();
          addWarning('tabSwitch');
          return false;
        }

        // Prevent Windows key
        if (e.key === 'Meta' || e.key === 'OS') {
          e.preventDefault();
          addWarning('tabSwitch');
          return false;
        }

        // Prevent Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
          addWarning('tabSwitch');
          return false;
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', preventReload);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);

    // Check fullscreen status periodically
    const fullscreenCheck = setInterval(() => {
      if (!isTestFinished && !document.fullscreenElement) {
        enforceFullScreen();
      }
    }, 1000);

    return () => {
      window.removeEventListener('beforeunload', preventReload);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
      clearInterval(fullscreenCheck);
    };
  }, [isTestFinished, contestId]);

  const handleFullscreenReEntry = async () => {
    setShowWarningModal(false);
    const element = document.documentElement;
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.error("Error entering fullscreen mode:", error);
      // Retry after a short delay
      setTimeout(handleFullscreenReEntry, 500);
    }
  };

  useEffect(() => {
    const initializeFullScreen = async () => {
      if (!isTestFinished) {
        try {
          await handleFullscreenReEntry();
        } catch (error) {
          console.error("Error initializing fullscreen:", error);
        }
      }
    };

    initializeFullScreen();
  }, []); // Empty dependency array for initial load only

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const payload = {
        contestId,
        answers: selectedAnswers,
        warnings: fullscreenWarnings + tabSwitchWarnings,
      };

      const response = await axios.post(
        "https://vercel-1bge.onrender.com/api/mcq/submit_assessment/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        navigate("/studentdashboard");
      }

      console.log("Test submitted successfully:", response.data);
      alert("Test submitted successfully!");

      setIsTestFinished(true);
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Failed to submit the test.");
    }
  };

  useEffect(() => {
    if (remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [remainingTime]);

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
    };

    const disableTextSelection = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("selectstart", disableTextSelection);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("selectstart", disableTextSelection);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isTestFinished) {
        e.preventDefault();
        e.returnValue = '';
        addWarning('tabSwitch');
        return '';
      }
    };

    const handleBlur = () => {
      if (!isTestFinished) {
        setHasFocus(false);
        addWarning('tabSwitch');
      }
    };

    const handleFocus = () => {
      setHasFocus(true);
    };

    const handleVisibilityChange = () => {
      if (!isTestFinished) {
        if (document.hidden) {
          const currentTime = Date.now();
          if (currentTime - lastActiveTime.current > 500) {
            addWarning('tabSwitch');
          }
        }
        lastActiveTime.current = Date.now();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const focusCheckInterval = setInterval(() => {
      if (!isTestFinished && !document.hasFocus()) {
        addWarning('tabSwitch');
      }
    }, 1000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(focusCheckInterval);
    };
  }, [isTestFinished]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-700 mb-4">No questions available</p>
          <button
            onClick={() => navigate("/studentdashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        pointerEvents: !hasFocus ? "none" : "auto",
        filter: !hasFocus ? "blur(5px)" : "none",
      }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onKeyDown={(e) => e.preventDefault()}
    >
      <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'none'"></meta>
      <div className="max-w-[1800px] max-h-[1540px] mx-auto p-7 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-12">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <Header duration={remainingTime} />
          </div>
          <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[750px] mt-7">
            <div className="flex-grow">
              <Question
                question={questions[currentIndex]}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onFinish={() => setShowConfirmModal(true)}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswers={selectedAnswers}
                onReviewMark={handleReviewMark}
                reviewStatus={reviewStatus}
              />
            </div>
            <div className="lg:w-80">
              <div className="sticky top-6">
                <Sidebar
                  totalQuestions={questions.length}
                  currentIndex={currentIndex}
                  selectedAnswers={selectedAnswers}
                  reviewStatus={reviewStatus}
                  onQuestionClick={(index) => setCurrentIndex(index)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="fixed inset-0 pointer-events-none z-[5] flex items-center justify-start opacity-[0.08]">
          <div className="transform rotate-45 text-black text-[120px] ml-8 font-extrabold select-none">
            SNSGROUPS
          </div>
        </div>

        <div className="fixed inset-0 pointer-events-none z-[5] flex items-center justify-center opacity-[0.08]">
          <div className="transform rotate-45 text-black text-[120px] font-extrabold select-none">
            SNSGROUPS
          </div>
        </div>

        {showWarningModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Warning #{fullscreenWarnings + tabSwitchWarnings}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {tabSwitchWarnings > 0
                  ? "You have switched tabs. Please return to the test tab to continue."
                  : "You have exited fullscreen mode. Please return to fullscreen to continue the test."}
              </p>
              <button
                onClick={handleFullscreenReEntry}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Fullscreen
              </button>
            </div>
          </div>
        )}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-semibold text-center mb-4">
                Submit Assessment
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to submit your assessment? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleFinish();
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
