import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaUser, FaFilter, FaUniversity, FaRegAddressBook, FaMailBulk, FaSchool, FaDownload } from 'react-icons/fa';
import { CircularProgress } from "@mui/material";
import UserImg from "../../assets/userplaceholder.png";
import PptxGenJS from "pptxgenjs"; // for PowerPoint generation
import { SHA256 } from 'crypto-js';
import { jsPDF } from "jspdf"; // for PDF export

const StudentResult = () => {
  const { contestId, studentId } = useParams();
  const [testData, setTestData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchStudentReport = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/mcq/student-report/${contestId}/${studentId}/`
        );
        setTestData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch student report.");
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudentReport();
    fetchStudents();
  }, [contestId, studentId]);

  const handleDownloadCertificate = async () => {
    if (!testData || !students.length) {
      alert("Student or contest data is missing.");
      return;
    }
  
    const matchedStudent = students.find((s) => s.studentId === testData.student_id);
    if (!matchedStudent) {
      alert("Student not found.");
      return;
    }
  
    const studentName = matchedStudent.name || "Unknown Student";
    const contestName = testData.contest_name || "Unknown Contest";
  
    // Generate a unique ID by hashing the student name and contest name
    const uniqueId = SHA256(`${studentName}-${contestName}`).toString();
  
    // Store certificate data in MongoDB
    try {
      await axios.post(`${API_BASE_URL}/api/mcq/store-certificate/`, {
        uniqueId,
        studentName,
        contestName,
        studentId: testData.student_id,
      });
    } catch (error) {
      console.error('Error storing certificate data:', error);
      alert('Failed to store certificate data.');
      return;
    }
  
    // Define the custom page size for 16:9 aspect ratio
    const width = 250; // Width in mm
    const height = 180.625; // Height in mm (16:9 aspect ratio)
  
    // Initialize jsPDF with custom page size
    const pdf = new jsPDF("l", "mm", [width, height]);
  
    // Add a background color
    pdf.setFillColor(255, 255, 204); // Light yellow background
    pdf.rect(0, 0, width, height, "F");
  
    // Add a border
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(5, 5, width - 10, height - 10);
  
    // Calculate the vertical center
    const centerY = height / 2;
  
    // Add certificate title with a larger font size
    pdf.setFontSize(36);
    pdf.setFont("helvetica", "bold");
    pdf.text("Certificate of Achievement", width / 2, centerY - 35, { align: "center" });
  
    // Add student name
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "normal");
    pdf.text(`This is to certify that`, width / 2, centerY - 10, { align: "center" });
  
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.text(studentName, width / 2, centerY + 10, { align: "center" });
  
    // Add contest name
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "normal");
    pdf.text(`has successfully completed the ${contestName} contest.`, width / 2, centerY + 30, { align: "center" });
  
    // Add additional text
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "normal");
    pdf.text("Congratulations on your achievement!", width / 2, centerY + 50, { align: "center" });
  
    // Add unique ID in the left bottom corner with font size 10
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Unique ID: ${uniqueId}`, 10, height - 10);
  
    // Save the PDF
    pdf.save("Certificate.pdf");
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!testData) return <div>No data available.</div>;

  const { attended_questions, start_time, finish_time, fullscreen, tabswitchwarning, facewarning, noisewarning, correct_answers, student_id } = testData;

  const score = (attended_questions.filter((q) => q.isCorrect).length / attended_questions.length) * 100;

  const start = new Date(start_time);
  const finish = new Date(finish_time);
  const timeTaken = (finish - start) / (1000 * 60);

  const notAnsweredQuestions = attended_questions.filter(q => q.userAnswer === null || q.userAnswer === '').length;
  const answeredQuestions = attended_questions.length - notAnsweredQuestions;

  const matchedStudent = students.find((s) => s.studentId === student_id);

  const filteredQuestions = attended_questions.filter(question => {
    if (filter === "all") return true;
    if (filter === "answered") return question.userAnswer !== null && question.userAnswer !== '';
    if (filter === "not_answered") return question.userAnswer === null || question.userAnswer === '';
    if (filter === "correct") return question.isCorrect;
    if (filter === "incorrect") return !question.isCorrect;
    return false;
  });

  return (
    <div id="report-preview" className="space-y-6 p-6 bg-gray-100">
      <div className="mb-8 flex items-stretch justify-between px-5">
        <div className="flex items-center mr-5">
          <img
            src={UserImg}
            className="w-[200px] w-max-[200px] h-[200px] h-max-[200px] rounded-full shadow-lg mx-auto border-[8px] border-white"
            alt="Image"
          />
        </div>

        <div className="flex-1 text-center flex flex-col items-start">
          <div className="flex-1 text-[#000975] text-2xl mb-3">
            <h3>{matchedStudent ? matchedStudent.name : "Unknown Student"}</h3>
          </div>
          <div className="w-full h-full card bg-white p-5 rounded-2xl shadow-sm grid grid-cols-2 gap-4 md:gap-x-4 lg:gap-x-14">
            {[ 
              { title: "Designation", value: "Student", icon: <FaUser className="text-lg" /> },
              { title: "College", value: matchedStudent?.collegename?.toUpperCase() || "N/A", icon: <FaUniversity className="text-lg" /> },
              { title: "Register No.", value: matchedStudent?.regno?.toUpperCase() || "N/A", icon: <FaRegAddressBook className="text-lg" /> },
              { title: "Email", value: matchedStudent?.email || "N/A", icon: <FaMailBulk className="text-lg" /> },
              { title: "Department", value: matchedStudent?.dept?.toUpperCase() || "N/A", icon: <FaSchool className="text-lg" /> }
            ].map((param, index) => (
              <div key={index} className="flex-1 flex justify-center">
                <div className="flex-1 flex justify-between text-sm max-w-[75%]">
                  <span className="flex items-center space-x-1">{param.icon}{" "}<p className="text-[#5A606B]"> {param.title} </p></span>
                  <p> {param.value} </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-stretch px-5">
        <div className="flex flex-col flex-[2] p-5 rounded-xl bg-white border-[1px] border-gray-200 mr-8">
          <p className="mb-4">Test Summary</p>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[ 
              { title: "Total Questions", value: attended_questions.length },
              { title: "Correct Answers", value: correct_answers },
              { title: "Time Taken", value: `${timeTaken.toFixed(2)} minutes` },
              { title: "Wrong Answers", value: attended_questions.length - correct_answers - notAnsweredQuestions },
              { title: "Total Marks", value: `${correct_answers}/${attended_questions.length}` },
              { title: "Fullscreen Policy Breach", value: fullscreen + tabswitchwarning },
              { title: "Face Recognition Anomaly", value: facewarning },
              { title: "Audio Disturbance Detected", value: noisewarning },
            ].map((stat, index) => (
              <div key={index} className="p-5 rounded-xl bg-[#ffcc00] bg-opacity-20 flex flex-col items-start text-[#151D48]">
                <p className="text-xl font-bold text-[#000975]">{stat.value}</p>
                <p className="text-xs font-semibold text-[#000975]">{stat.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col flex-1 p-8 rounded-xl border-[1px] bg-white border-gray-200 items-center justify-center">
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
                value={score}
                size={180}
                sx={{ color: "#fdc500" }}
                thickness={8}
              />
            </div>
            <div className="rounded-full absolute top-0 h-full w-full flex items-center justify-center">
              {score.toFixed(1)}%
            </div>
          </div>

          <p className="text-[#000975] mt-3 mb-1 font-medium"> Total Marks </p>
        </div>
      </div>

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

      {/* Download Certificate Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleDownloadCertificate}
          className="flex items-center bg-[#00296B] text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <FaDownload className="mr-2" />
          Download Certificate
        </button>
      </div>
    </div>
  );
};

export default StudentResult;
