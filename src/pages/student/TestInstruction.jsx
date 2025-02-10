import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import image from '../../assets/test_view_hero_img.png';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Importing new icons
import Navbar from "./Navbar";
import { useTestContext } from './TestContext';
import { CiCalendar } from "react-icons/ci";
import { MdAccessTime } from "react-icons/md";
import { LuFileQuestion } from "react-icons/lu";
import { FaRegCircleQuestion } from "react-icons/fa6";


const TestInstructions = () => {
  const [testDetails, setTestDetails] = useState(() => {
    const storedDetails = localStorage.getItem("testDetails");
    return storedDetails ? JSON.parse(storedDetails) : {}; // Restore from localStorage
  });

  const [currentTest, setCurrentTest] = useState(() => {
    const storedCurrentTest = localStorage.getItem("currentTest");
    return storedCurrentTest ? JSON.parse(storedCurrentTest) : null; // Restore from localStorage
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { contestId } = useParams();
  const { assessment_type } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [mcqTests, setMcqTests] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // Coding Assessment API function
  const start_codingTest = async (contestId, studentId) => {
    try {
      const startTestResponse = await axios.post(`${API_BASE_URL}/api/start_test/`, {
        contest_id: contestId,
        student_id: studentId,
      });

      console.log("Fetched from start_test API:", startTestResponse.data.message);

      const saveReportResponse = await axios.post(`${API_BASE_URL}/api/save_coding_report/`, {
        contest_id: contestId,
        student_id: studentId,
      });

      console.log("Fetched from save_contest_report API:", saveReportResponse.data.message);

    } catch (error) {
      console.error("Error during API calls:", error);
      throw error;
    }
  };

  // MCQ Assessment API function
  const start_mcqTest = async (contestId, studentId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/start_mcqtest/`, {
        contest_id: contestId,
        student_id: studentId,
      });
      console.log("Fetched from API:", response.data.message);
    } catch (error) {
      console.error("Error starting test:", error);
      throw error;
    }
  };

  const fetchMcqTests = async (regno) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/mcq-tests?regno=${regno}`, {
        withCredentials: true,
      });

      const formattedTests = response.data.map((test) => {
        const { hours = 0, minutes = 0 } = test.testConfiguration?.duration || {};
        const duration = (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
        const fullScreenMode = test.testConfiguration?.fullScreenMode || false;
        const faceDetection = test.testConfiguration?.faceDetection || false;
        const passPercentage = test.testConfiguration?.passPercentage || 0;
        
        localStorage.setItem(`testDuration_${test._id}`, duration);
        localStorage.setItem(`fullScreenMode_${test._id}`, fullScreenMode);
        localStorage.setItem(`faceDetection_${test._id}`, faceDetection);

        return {
          testId: test._id,
          name: test.assessmentOverview?.name || "Unknown Test",
          description: test.assessmentOverview?.description || "No description available.",
          starttime: test.assessmentOverview?.registrationStart || "No Time",
          endtime: test.assessmentOverview?.registrationEnd || "No Time",
          questions: parseInt(test.testConfiguration?.questions, 10) || 0,
          duration: `${hours} hours ${minutes} minutes`,
          passPercentage: passPercentage,
          assessment_type: "mcq",
          status: test.status,
          fullScreenMode,
          faceDetection,
          deviceRestriction: test.testConfiguration?.deviceRestriction || false,
          noiseDetection: test.testConfiguration?.noiseDetection || false,
          guidelines: test.assessmentOverview?.guidelines || "No guidelines available.",
          resultVisibility: test.testConfiguration?.resultVisibility || "Host Control",
          shuffleQuestions: test.testConfiguration?.shuffleQuestions || false,
          shuffleOptions: test.testConfiguration?.shuffleOptions || false,
          sectionDetails: test.assessmentOverview?.sectionDetails || "No",
          totalMarks: test.testConfiguration?.totalMarks || '0',
          noOfSections: test.no_of_section || 'None',
        };
      });

      return formattedTests;
    } catch (err) {
      if (err.response?.status === 401) {
        // Redirect to login if unauthorized
        navigate("/studentlogin");
      } else {
        console.error("Failed to fetch test details");
        console.error("Error fetching test details:", err);
      }
    }
  };

  useEffect(() => {
    if (testDetails) {
      localStorage.setItem("testDetails", JSON.stringify(testDetails));
    }
    if (currentTest) {
      localStorage.setItem("currentTest", JSON.stringify(currentTest));
    }
  }, [testDetails, currentTest]);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const storedContestState = localStorage.getItem("contestState");
    const storedTestDetails = localStorage.getItem("testDetails");

    const fetchAndSetTestDetails = async () => {
      if (!studentId || !contestId) {
        console.error("Student ID or Contest ID is missing!");
        return;
      }

      try {
        // Fetch test details if not present or empty
        const response = await fetchMcqTests(studentId);
        if (response && response.length > 0) {
          const parsedDetails = response.reduce((acc, test) => {
            acc[test.testId] = test; // Use testId as the key
            return acc;
          }, {});
          
          setTestDetails(parsedDetails);
          localStorage.setItem("testDetails", JSON.stringify(parsedDetails)); // Save to localStorage

          if (parsedDetails[contestId]) {
            setCurrentTest(parsedDetails[contestId]); // Set current test
          } else {
            console.error("Contest ID not found in test details!");
          }
        } else {
          console.error("No test details found for the student!");
        }
      } catch (error) {
        console.error("Error fetching test details:", error);
      }
    };

    // Restore testDetails and currentTest from localStorage if available
    if (storedTestDetails && Object.keys(JSON.parse(storedTestDetails)).length > 0) {
      const parsedTestDetails = JSON.parse(storedTestDetails);
      setTestDetails(parsedTestDetails);

      if (!currentTest && storedContestState) {
        const { contest_id } = JSON.parse(storedContestState);
        if (parsedTestDetails[contest_id]) {
          setCurrentTest(parsedTestDetails[contest_id]); // Set current test
        } else {
          console.error("Contest ID not found in stored test details!");
        }
      }
    } else {
      // Fetch test details if not available
      fetchAndSetTestDetails();
    }
  }, [contestId, currentTest]);

  if (!currentTest) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl text-gray-700">Fetching test details, please wait...</p>
    </div>; // Provide a better loading UI
  }

  const handleStartTest = async () => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      alert("Student ID not found. Please log in again.");
      return;
    }

    if (!currentTest) {
      alert("Test details not found. Please try again later.");
      return;
    }

    setLoading(true);
    try {
      if (assessment_type === "coding") {
        await start_codingTest(contestId, studentId);
        navigate(`/coding/${contestId}`, {
          state: { contest_id: contestId, student_id: studentId }
        });
      } else if (assessment_type === "mcq") {
        if (currentTest.sectionDetails === "Yes") {
          navigate(`/section-based-mcq/${contestId}`, {
            state: { formData: { assessmentOverview: { sectionDetails: "Yes" } } }
          });
        } else {
          await start_mcqTest(contestId, studentId);
          navigate(`/mcq/${contestId}`, {
            state: { contest_id: contestId, student_id: studentId }
          });
        }
      }
    } catch (error) {
      console.error("Error starting test:", error);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  };

  // const currentTest = mcqTests.find(test => test.testId === contestId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Main Container */}
      <div className="mx-12 mt-4 mb-4 rounded-2xl">
        <div className="w-full p-8 text-lg">

          <div className="flex items-center gap-6 mb-8 bg-white shadow-md p-8 rounded-3xl">
            <div className="w-4/6">
              <h1 className="text-[#111933] font-bold text-2xl mb-4">
                {currentTest?.name || "Test Name"}
              </h1>
              <p className='mb-5'>{currentTest?.description}</p>
              <div className="w-3/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><CiCalendar className='mr-2 text-2xl' />Registration Start Date</p>
                  <p className='w-1/2'>: {formatDate(currentTest?.starttime) || "23 AUG 2023 Time: 7 PM"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><CiCalendar className='mr-2 text-2xl' />Registration End Date</p>
                  <p className='w-1/2'>: {formatDate(currentTest?.endtime) || "23 AUG 2023 Time: 7 PM"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><MdAccessTime className='mr-2 text-2xl' />Total Duration</p>
                  <p className='w-1/2'>: {currentTest?.duration || "0"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><LuFileQuestion className='mr-2 text-2xl' />Assessment Type</p>
                  <p className='w-1/2'>: {currentTest?.assessment_type.toUpperCase() || "23 AUG 2023 Time: 7 PM"}</p>
                </div>
              </div>
            </div>

            <div className="w-2/6">
              <img
                src={image}
                alt="test_instruction_img"
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className='flex flex-1 items-stretch gap-6 mb-8'>
            <div className='w-4/6 bg-white p-8 rounded-3xl shadow-md'>
              <h1 className="text-[#111933] font-bold text-2xl mb-8">
                Questions & Section Details
              </h1>
              <div className='w-3/5 space-y-3'>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><FaRegCircleQuestion className='mr-2 text-2xl' />No. Of Questions</p>
                  <p className='w-1/2'>: {currentTest?.questions || "0"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><MdAccessTime className='mr-2 text-2xl' />No. Of Sections</p>
                  <p className='w-1/2'>: {currentTest?.noOfSections }</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><MdAccessTime className='mr-2 text-2xl' />Total Marks</p>
                  <p className='w-1/2'>: {currentTest?.totalMarks || "0"}</p>
                </div>
              </div>
            </div>
            <div className='w-2/6 bg-white rounded-3xl shadow-md text-[#111933]'>
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-8 py-4 border-r border-gray-300 text-xl">Sections</th>
                    <th className="px-8 py-4 text-xl">No. Of Questions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="px-8 py-4 border-r border-gray-300">Coding Test I</td>
                    <td className="px-8 py-4">7</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-8 py-4 border-r border-gray-300">Coding Test I</td>
                    <td className="px-8 py-4">7</td>
                  </tr>
                  <tr className='font-semibold'>
                    <td className="px-8 py-4 border-r border-gray-300">Total</td>
                    <td className="px-8 py-4">7</td>
                  </tr>
                </tbody>
              </table>


            </div>
          </div>

          <div className="mb-8 bg-white shadow-md p-8 rounded-3xl">
            <div className='flex items-center'>
              <div className='w-4/6'>
                <h1 className="text-[#111933] font-bold text-2xl mb-4">
                  Rules & Regulations
                </h1>
                <div className="mb-8 text-md text-[#111933] ">
                  <p className="mb-4 text-lg font-medium">Instructions: Read carefully; contact the Department for clarifications.</p>
                  <ul className="list-disc list-inside space-y-2 ml-10">
                    <li>Questions: {currentTest?.questions || "30"} questions, { currentTest?.totalMarks/currentTest?.questions } mark each.</li>
                    <li>Duration: {currentTest?.duration || "45"} minutes.</li>
                    <li>
                      Device: Use a stable internet connection on a laptop or suitable device (iPhones not recommended).
                    </li>
                    <li>Submission: Click "Submit" after each question.</li>
                    <li>Fair Play: Unfair practices, including plagiarism, result in disqualification.</li>
                    <li>Review: Double-check answers before final submission.</li>
                    <li>Internet: Ensure stable connectivity to avoid issues.</li>
                    <li>Stay Until The Test ends</li>
                    <li>Section Timer is Set</li>
                  </ul>
                </div>
              </div>
              <div className='w-2/6 mx-8 space-y-10'>
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className='text-left border-b border-gray-200 bg-[#111933] py-3 pl-4 leading-6'>
                    <h2 className="font-bold text-white text-center">Proctoring Enabled</h2>
                  </div>

                  <div className="text-[#111933] space-y-5 py-5 px-8">
                    <div className="flex justify-between text-[#111933]">
                      <p>Face Detection</p>
                      {currentTest?.faceDetection ? (
                        <FaCheckCircle className="text-green-500 text-2xl" />
                      ) : (
                        <FaTimesCircle className="text-red-500 text-2xl" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <p>Noise Detection</p>
                      {currentTest?.noiseDetection ? (
                        <FaCheckCircle className="text-green-500 text-2xl" />
                      ) : (
                        <FaTimesCircle className="text-red-500 text-2xl" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <p>Full Screen Mode</p>
                      {currentTest?.fullScreenMode ? (
                        <FaCheckCircle className="text-green-500 text-2xl" />
                      ) : (
                        <FaTimesCircle className="text-red-500 text-2xl" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <p>Mobile Access Restriction</p>
                      {currentTest?.deviceRestriction ? (
                        <FaCheckCircle className="text-green-500 text-2xl" />
                      ) : (
                        <FaTimesCircle className="text-red-500 text-2xl" />
                      )}
                    </div>
                  </div>
                </div>

                <div className='bg-gray-300 border border-[#111933] py-3 text-center rounded-xl'>
                  <p className='text-sm'>Pass Percentage is {currentTest?.passPercentage}% or Higher</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex justify-end">
            <h1 className='text-2xl absolute inset-0 z-5 flex justify-center items-center text-[#111933] font-semibold'>All The Best!</h1>
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="px-10 z-10 py-4 bg-[#facc15] text-[#111933] rounded-2xl shadow-lg font-semibold text-lg hover:bg-[#e5b810] transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Start Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInstructions;