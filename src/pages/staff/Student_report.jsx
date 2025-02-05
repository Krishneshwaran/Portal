



import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaFilter,
  FaUserCog,
  FaUniversity,
  FaRegAddressBook,
  FaMailBulk,
  FaSchool,
} from "react-icons/fa";
import { CircularProgress } from "@mui/material";
import UserImg from "../../assets/userplaceholder.png";
import gradeA from "../../assets/badges/grade_a.png";
import gradeB from "../../assets/badges/grade_b.png";
import gradeC from "../../assets/badges/grade_c.png";
import gradeD from "../../assets/badges/grade_d.png";


const StudentReport = ({ contestId: propContestId, regno: propRegno, hideDetails }) => {
  const { contestId: paramContestId, regno: paramRegno } = useParams();
  const contestId = propContestId || paramContestId;
  const regno = propRegno || paramRegno;

  const [testData, setTestData] = useState(null);
  const [students, setStudents] = useState([]);
  // const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const [filter, setFilter] = useState("all"); // State for filtering questions

  useEffect(() => {
    // Fetch the list of students
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    // Fetch student report
    const fetchStudentReport = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/mcq/student-report/${contestId}/${regno}/`
            );
            setTestData(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch student report:", err);
            setError("Failed to fetch student report.");
            setLoading(false);
        }
    };

    fetchStudentReport();
}, [contestId, regno]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!testData) return <div>No data available.</div>;

  // Find the student's name using the student_id from the report
  const matchedStudent = testData?.student_id
    ? students.find((student) => student.studentId === testData.student_id)
    : null;

  // Determine the student's name or fallback to "Unknown Student"
  const studentName = matchedStudent ? matchedStudent.name : "Unknown Student";

  function formatTimeDifference(startTime, endTime) {
    // Parse the ISO date strings into Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate input dates
    if (isNaN(start) || isNaN(end)) {
      throw new Error(
        "Invalid date format. Please provide valid ISO date strings."
      );
    }

    // Ensure the end time is not earlier than the start time
    const diffInMilliseconds = Math.max(0, end - start);

    // Convert the difference into hours, minutes, and seconds
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((diffInMilliseconds % (1000 * 60)) / 1000);

    // Build a readable string
    const timeParts = [];
    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);
    if (seconds > 0 || timeParts.length === 0) timeParts.push(`${seconds}s`); // Include seconds if nothing else

    return timeParts.join(" ");
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!testData) return <div>No data available.</div>;

  const {
    attended_questions,
    start_time,
    finish_time,
    fullscreen,
    tabswitchwarning,
    facewarning,
    noisewarning,
    correct_answers,
    student,
  } = testData;

  // Fetch pass percentage from session storage
  // const passPercentage = sessionStorage.getItem("passPercentage");

  // const score = (correct_answers / attended_questions.length) * 100;

  // const start = new Date(start_time);
  // const finish = new Date(finish_time);
  // const timeTaken = (finish - start) / (1000 * 60); // Convert milliseconds to minutes

  // Calculate the number of questions not answered
  const notAnsweredQuestions = attended_questions.filter(
    (q) => q.userAnswer === null || q.userAnswer === ""
  ).length;
  // const answeredQuestions = attended_questions.length - notAnsweredQuestions;

  // Filter questions based on the selected filter
  const filteredQuestions = attended_questions.filter((question) => {
    if (filter === "all") return true;
    if (filter === "answered")
      return question.userAnswer !== null && question.userAnswer !== "";
    if (filter === "not_answered")
      return question.userAnswer === null || question.userAnswer === "";
    if (filter === "correct") return question.isCorrect;
    if (filter === "incorrect") return !question.isCorrect;
    return false;
  });

  return (
    <div id="report-preview" className="space-y-6 p-6 bg-gray-100">
    <div className="space-y-6 p-6 bg-gray-100">
      <div className="mb-8 flex items-stretch justify-between px-5">
        {/* User Image */}
        <div className="flex items-center mr-5">
          <img
            src={UserImg}
            className="w-[200px] max-w-[200px] h-[200px] max-h-[200px] rounded-full shadow-lg mx-auto border-[8px] border-white"
            alt="Image"
          />
        </div>
  
        {/* Student Details */}
        <div className="flex-1 text-center flex flex-col items-start">
          <div className="flex-1 text-[#000975] font-semibold text-2xl ml-1 mb-3 uppercase ">
            <h3>{studentName}</h3>
          </div>
          <div className="w-full h-full card bg-white p-5 rounded-2xl shadow-sm grid grid-cols-2 gap-4 md:gap-x-4 lg:gap-x-14">
            {[
              {
                title: "Designation",
                value: "Student",
                icon: <FaUserCog className="text-lg" />,
              },
              {
                title: "College",
                value: matchedStudent?.collegename?.toUpperCase() || "N/A",
                icon: <FaUniversity className="text-lg" />,
              },
              {
                title: "Register No.",
                value: matchedStudent?.regno?.toUpperCase() || "N/A",
                icon: <FaRegAddressBook className="text-lg" />,
              },
              {
                title: "Email",
                value: matchedStudent?.email || "N/A",
                icon: <FaMailBulk className="text-lg" />,
              },
              {
                title: "Department",
                value: matchedStudent?.dept?.toUpperCase() || "N/A",
                icon: <FaSchool className="text-lg" />,
              },
            ].map((param) => (
              <div className="flex-1 flex justify-center">
                <div className="flex-1 flex justify-between text-sm max-w-[75%]">
                  <span className="flex items-center space-x-1">
                    {param.icon}{" "}
                    <p className="text-[#5A606B]"> {param.title} </p>
                  </span>
                  <p> {param.value} </p>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Badge Section */}
        <div className="flex items-center ml-5">
          <div className="w-[200px] h-[160px] mt-10 bg-white rounded-xl shadow-sm flex flex-col justify-center items-center p-4">
            {(() => {
              const totalMarks = (correct_answers / attended_questions.length) * 100;

              if (totalMarks >= 90) {
                return (
                  <>
                    <img
                      src={gradeA}
                      alt="Grade A"
                      className="w-[140px] h-[140px] mb-3"
                    />
                    <p className="text-[#000975] text-sm font-bold text-center">
                      Excellent work! Keep it up!
                    </p>
                  </>
                );
              } else if (totalMarks >= 70) {
                return (
                  <>
                    <img
                      src={gradeB}
                      alt="Grade B"
                      className="w-[140px] h-[140px] mb-3"
                    />
                    <p className="text-[#000975] text-sm font-bold text-center">
                      Great job! Aim for the top!
                    </p>
                  </>
                );
              } else if (totalMarks >= 50) {
                return (
                  <>
                    <img
                      src={gradeC}
                      alt="Grade C"
                      className="w-[120px] h-[140px] mb-3"
                    />
                    <p className="text-[#000975] text-sm font-bold text-center">
                      Good effort! Push harder!
                    </p>
                  </>
                );
              } else if (totalMarks >= 30) {
                return (
                  <>
                    <img
                      src={gradeD}
                      alt="Grade D"
                      className="w-[140px] h-[140px] mb-3"
                    />
                    <p className="text-[#000975] text-sm font-bold text-center">
                      Needs improvement. Keep going!
                    </p>
                  </>
                );
              } else {
                return (
                  <div className="flex flex-col justify-center items-center h-full">
                    <p className="text-[#000975] text-sm font-bold text-center">
                      Don’t give up! Try again!
                    </p>
                  </div>
                );                
              }
            })()}
          </div>
        </div>

        </div>

        <div className="flex items-stretch px-5">
          {/* stats */}
          <div className="flex flex-col flex-[2] p-5 rounded-xl bg-white border-[1px] border-gray-200 mr-8">
            <p className="mb-4">Test Summary</p>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: "total_questions_icon",
                  title: "Total Questions",
                  value: attended_questions.length,
                },
                {
                  icon: "correct_answers_icon",
                  title: "Correct Answers",
                  value: correct_answers,
                },
                {
                  icon: "time_icon",
                  title: "Time Taken",
                  value: formatTimeDifference(start_time, finish_time), // String with "minutes"
                },
                {
                  icon: "wrong_answers_icon",
                  title: "Wrong Answers",
                  value:
                    attended_questions.length -
                    correct_answers -
                    notAnsweredQuestions,
                },
                {
                  icon: "total_icon",
                  title: "Total Marks",
                  value: `${correct_answers}/${attended_questions.length}`, // String format
                },
                {
                  icon: "fullscreen_icon",
                  title: "Fullscreen Policy Breach",
                  value: fullscreen + tabswitchwarning,
                },
                {
                  icon: "face_recognition_icon",
                  title: "Face Recognition Anomaly",
                  value: facewarning,
                },
                {
                  icon: "audio_disturbance_icon",
                  title: "Audio Disturbance Detected",
                  value: noisewarning,
                },
              ].map((stat) => (
                <div className="p-5 rounded-xl bg-[#ffcc00] bg-opacity-20 flex flex-col items-start text-[#151D48]">
                  {/* <img src={stat.icon} className={`${stat.icon === total_questions_icon ? "bg-[#000975] rounded-full p-1 w-8" : ""} w-8`}/> */}
                  <p className="text-xl font-bold text-[#000975]">
                    {" "}
                    {stat.value}{" "}
                  </p>
                  <p className="text-xs font-semibold text-[#000975]">
                    {" "}
                    {stat.title}{" "}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col flex-1 p-8 rounded-xl border-[1px] bg-white border-gray-200 items-center justify-center">
            {/* progress */}
            <div className="relative">
              <CircularProgress
                variant="determinate"
                value={100}
                size={180}
                sx={{ color: "#fff5cc" }}
                thickness={8}
              />
              <div className="absolute z-10 w-full h-full top-0">
                <CircularProgress
                  variant="determinate"
                  value={(correct_answers / attended_questions.length) * 100}
                  size={180}
                  sx={{ color: "#fdc500" }}
                  thickness={8}
                />
              </div>
              <div className="rounded-full absolute top-0 h-full w-full flex items-center justify-center">
                {((correct_answers / attended_questions.length) * 100).toFixed(1)}%
              </div>
            </div>

            <p className="text-[#000975] mt-3 mb-1 font-medium"> Total Marks </p>
            <p className="text-xs text-center">
              Embark on a journey to sharpen your analytical thinking and
              problem-solving skills with our "Logical Reasoning"
            </p>
          </div>
        </div>
      </div>
      {/* Filter Section */}
      {!hideDetails && (
  <div className="bg-white p-4 m-5 rounded-xl shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-[#00296B] text-xl">Question Details</h2>
      <div className="flex items-center space-x-4">
        <FaFilter className="text-xl text-gray-500" />
        <select
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="answered">Answered</option>
          <option value="not_answered">Not Answered</option>
          <option value="correct">Correct</option>
          <option value="incorrect">Incorrect</option>
        </select>
      </div>
    </div>
    <div className="space-y-4 mt-4">
      <div className="bg-white overflow-hidden">
        <div className="grid grid-cols-[30%_1fr_1fr_1fr] gap-4 p-4 bg-[#00296B] font-medium text-white">
          <p>Question</p>
          <p className="flex justify-center border-x-[1px]">Student Answer</p>
          <p className="flex justify-center border-r-[1px]">Correct Answer</p>
          <p className="flex justify-center">Result</p>
        </div>
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            className="grid grid-cols-[30%_1fr_1fr_1fr] gap-4 p-4 border-t"
          >
            <p className="flex justify-center">{question.question}</p>
            <p className={`flex justify-center ${question.isCorrect ? "text-green-600" : "text-red-600"}`}>
              {question.userAnswer || "Not Answered"}
            </p>
            <p className="text-green-600 flex justify-center">{question.correctAnswer}</p>
            <p className={`flex justify-center ${question.isCorrect ? "text-green-600" : "text-red-600"}`}>
              {question.isCorrect ? "Correct" : "Incorrect"}
            </p>

          </div>
        ))}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default StudentReport;
