// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import Header from "../../../components/staff/mcq/Header";
// import Question from "../../../components/staff/mcq/Question";
// import Sidebar from "../../../components/staff/mcq/Sidebar";

// export default function Mcq_Assessment() {
//   const { contestId } = useParams(); // Get contestId from the URL
//   const studentId = localStorage.getItem("studentId")
//   const navigate = useNavigate();
//   const [questions, setQuestions] = useState([]);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [reviewStatus, setReviewStatus] = useState({});
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [duration, setDuration] = useState(0);
//   const [fullScreenMode, setFullScreenMode] = useState(false);
//   const [fullscreenWarnings, setFullscreenWarnings] = useState(0); // Track warnings
//   const [isTestFinished, setIsTestFinished] = useState(false); // Track if the test is finished
//   const mediaStreamRef = useRef(null);

//   // Fetch questions from backend
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const response = await axios.get(
//           `https://vercel-1bge.onrender.com/api/mcq/get_mcqquestions/${contestId}`
//         );
//         setQuestions(response.data.questions);
//         const { hours, minutes } = response.data.duration;
//         setDuration((parseInt(hours) * 3600) + (parseInt(minutes) * 60)); // Convert duration to seconds

//         // Fetch fullscreen mode setting from localStorage
//         const storedFullScreenMode = JSON.parse(localStorage.getItem(`fullScreenMode_${contestId}`));
//         setFullScreenMode(storedFullScreenMode !== null ? storedFullScreenMode : true); // Default to true if not set

//         setFullscreenWarnings(Number(localStorage.getItem(`fullscreenWarnings_${studentId}`)) || 0); // Get previous warnings count for student
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching questions:", error);
//         setLoading(false);
//       }
//     };

//     fetchQuestions();
//   }, [contestId, studentId]);

//   const handleAnswerSelect = (index, answer) => {
//     setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
//   };

//   const handleReviewMark = (index) => {
//     setReviewStatus((prev) => ({
//       ...prev,
//       [index]: !prev[index],
//     }));
//   };

//   useEffect(() => {
//     const goFullScreen = async () => {
//       try {
//         if (fullScreenMode && !isTestFinished) { // Check if fullscreen is allowed and the test is not finished
//           if (document.documentElement.requestFullscreen) {
//             await document.documentElement.requestFullscreen();
//           } else if (document.documentElement.webkitRequestFullscreen) {
//             await document.documentElement.webkitRequestFullscreen();
//           } else if (document.documentElement.mozRequestFullScreen) {
//             await document.documentElement.mozRequestFullScreen();
//           } else if (document.documentElement.msRequestFullscreen) {
//             await document.documentElement.msRequestFullscreen();
//           }
//         }
//       } catch (error) {
//         console.error("Error entering fullscreen mode:", error);
//       }
//     };

//     const exitFullScreen = () => {
//       if (!isTestFinished) { // Only trigger warning if test is not finished
//         if (
//           document.fullscreenElement || 
//           document.webkitFullscreenElement || 
//           document.mozFullScreenElement || 
//           document.msFullscreenElement
//         ) {
//           if (document.exitFullscreen) {
//             document.exitFullscreen();
//           } else if (document.webkitExitFullscreen) {
//             document.webkitExitFullscreen();
//           } else if (document.mozCancelFullScreen) {
//             document.mozCancelFullScreen();
//           } else if (document.msExitFullscreen) {
//             document.msExitFullscreen();
//           }

//           addWarning(); // Add warning only if test is not finished
//         } else {
//           console.log("Not in fullscreen mode. Cannot exit.");
//         }
//       }
//     };

//     const addWarning = () => {
//       let warnings = fullscreenWarnings + 1;
//       setFullscreenWarnings(warnings);
//       localStorage.setItem(`fullscreenWarnings_${studentId}`, warnings); // Save warning count with student ID
//       alert(`Warning ${warnings}: You have switched fullscreen mode.`);
      
//       // After the alert, re-enter fullscreen after a small delay
//       setTimeout(() => {
//         goFullScreen(); // This ensures the fullscreen request happens after the alert is dismissed
//       }, 100); // 100ms delay
//     };

//     // Fullscreen change events
//     const onFullscreenChange = () => {
//       const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
//       setFullScreenMode(isFullscreen);
//       localStorage.setItem(`fullScreenMode_${contestId}`, isFullscreen ? "true" : "false");

//       if (!isFullscreen && !isTestFinished) {
//         addWarning(); // If exiting fullscreen, increment warning (but not after test completion)
//       }
//     };

//     document.addEventListener("fullscreenchange", onFullscreenChange);
//     document.addEventListener("mozfullscreenchange", onFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", onFullscreenChange);
//     document.addEventListener("msfullscreenchange", onFullscreenChange);

//     // Run fullscreen logic when page loads
//     goFullScreen();

//     // Cleanup event listeners
//     return () => {
//       document.removeEventListener("fullscreenchange", onFullscreenChange);
//       document.removeEventListener("mozfullscreenchange", onFullscreenChange);
//       document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
//       document.removeEventListener("msfullscreenchange", onFullscreenChange);

//       if (mediaStreamRef.current) {
//         mediaStreamRef.current.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [fullScreenMode, studentId, contestId, isTestFinished]); // Now dependent on isTestFinished

//   const handleNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     }
//   };

//   const handleFinish = async () => {
//     try {
//       const payload = {
//         contestId,
//         answers: selectedAnswers,
//         warnings: fullscreenWarnings, // Send cumulative warnings with the test
//       };

//       const response = await axios.post(
//         "https://vercel-1bge.onrender.com/api/mcq/submit_assessment/",
//         payload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );
//       if (response.status === 200) {
//         navigate('/studentdashboard');
//       }

//       console.log("Test submitted successfully:", response.data);
//       alert("Test submitted successfully!");

//       // Mark the test as finished
//       setIsTestFinished(true); // Disable fullscreen warnings after test is finished
//     } catch (error) {
//       console.error("Error submitting test:", error);
//       alert("Failed to submit the test.");
//     }
//   };

//   if (loading) {
//     return <div>Loading questions...</div>;
//   }

//   if (!questions.length) {
//     return <div>No questions available.</div>;
//   }

//   return (
//     <div className="w-full min-h-screen bg-white rounded-[21px] p-8">
//       <Header duration={duration} />
//       <div className="flex gap-8">
//         <Question
//           question={questions[currentIndex]}
//           currentIndex={currentIndex}
//           totalQuestions={questions.length}
//           onNext={handleNext}
//           onPrevious={handlePrevious}
//           onFinish={handleFinish}
//           onAnswerSelect={handleAnswerSelect}
//           selectedAnswers={selectedAnswers}
//           onReviewMark={handleReviewMark}
//         />

//         <Sidebar
//           totalQuestions={questions.length}
//           currentIndex={currentIndex}
//           selectedAnswers={selectedAnswers}
//           reviewStatus={reviewStatus}
//           onQuestionClick={(index) => setCurrentIndex(index - 1)}
//         />
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/staff/mcq/Header";
import Question from "../../../components/staff/mcq/Question";
import Sidebar from "../../../components/staff/mcq/Sidebar";

export default function Mcq_Assessment() {
  const { contestId } = useParams();
  const studentId = localStorage.getItem("studentId");
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [reviewStatus, setReviewStatus] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const mediaStreamRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(0);

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

        const storedFullScreenMode = JSON.parse(localStorage.getItem(`fullScreenMode_${contestId}`));
        setFullScreenMode(storedFullScreenMode !== null ? storedFullScreenMode : true);

        setFullscreenWarnings(
          Number(localStorage.getItem(`fullscreenWarnings_${studentId}`)) || 0
        );

        const startTime = localStorage.getItem(`startTime_${contestId}`);
        if (startTime) {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
          setRemainingTime(totalDuration - elapsedTime);
        } else {
          localStorage.setItem(`startTime_${contestId}`, Date.now());
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

  const handleAnswerSelect = (index, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleReviewMark = (index) => {
    setReviewStatus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const goFullScreen = async () => {
      try {
        if (fullScreenMode && !isTestFinished) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            await document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.msRequestFullscreen) {
            await document.documentElement.msRequestFullscreen();
          }
        }
      } catch (error) {
        console.error("Error entering fullscreen mode:", error);
      }
    };

    const addWarning = () => {
      let warnings = fullscreenWarnings + 1;
      setFullscreenWarnings(warnings);
      localStorage.setItem(`fullscreenWarnings_${studentId}`, warnings);
      setShowWarningModal(true);
    };

    const onFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setFullScreenMode(isFullscreen);
      localStorage.setItem(
        `fullScreenMode_${contestId}`,
        isFullscreen ? "true" : "false"
      );

      if (!isFullscreen && !isTestFinished) {
        addWarning();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isTestFinished) {
        addWarning();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("msfullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    goFullScreen();

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("msfullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [fullScreenMode, studentId, contestId, isTestFinished]);

  const handleFullscreenReEntry = async () => {
    setShowWarningModal(false);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
    } catch (error) {
      console.error("Error entering fullscreen mode:", error);
    }
  };

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
        warnings: fullscreenWarnings,
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
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (!questions.length) {
    return <div>No questions available.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-white rounded-[21px] p-8 no-select" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
      <Header duration={remainingTime} />
      <div className="flex gap-8">
        <Question
          question={questions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onFinish={handleFinish}
          onAnswerSelect={handleAnswerSelect}
          selectedAnswers={selectedAnswers}
          onReviewMark={handleReviewMark}
        />

        <Sidebar
          totalQuestions={questions.length}
          currentIndex={currentIndex}
          selectedAnswers={selectedAnswers}
          reviewStatus={reviewStatus}
          onQuestionClick={(index) => setCurrentIndex(index - 1)}
        />
      </div>

      <div className="watermark" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        background: 'rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '50px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        transform: 'rotate(-45deg)',
        opacity: 0.1,
      }}>
        SNSGROUPS
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg">
              <span className="font-bold">Warning:{fullscreenWarnings}</span>: You have exited fullscreen mode. Please return to fullscreen to continue the test.
            </p>
            <button
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              onClick={handleFullscreenReEntry}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
