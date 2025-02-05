import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";
import QuestionModal from "../../../components/staff/mcq/QuestionModal";
import { jwtDecode } from "jwt-decode";
import ShareModal from "../../../components/staff/mcq/ShareModal";
import clockIcon from "../../../assets/icons/clock-icon.svg";
import markIcon from "../../../assets/icons/mark-icon.svg";
import questionIcon from "../../../assets/icons/question-icon.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentTable from "../../../components/staff/StudentTable";
import { FaTrash } from "react-icons/fa";

const Mcq_Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    toast.dismiss(); // Clears all existing toasts when route changes
  }, [location.pathname]);

  const { formData, sections } = location.state || {};
  const [dashboardStats, setDashboardStats] = useState({
    totalQuestions: 0,
    totalMarks: 0,
    totalDuration: "00:00:00",
    maximumMark: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [initialQuestions, setInitialQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({ collegename: [], dept: [], year: "" });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharingLink, setSharingLink] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
   const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const itemsPerPage = 5;
  const initialFetch = useRef(true);

  useEffect(() => {
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


  const duplicateToastShown = useRef(false); // ✅ Prevent duplicate messages

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        showToast("Unauthorized access. Please log in again.", "error");
        return;
      }
  
      const response = await axios.get(`${API_BASE_URL}/api/mcq/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const fetchedQuestions = response.data.questions.map((question) => ({
        ...question,
        correctAnswer: question.correctAnswer || question.answer || "No Answer Provided",
      }));
  
      const duplicateCount = response.data.duplicateCount || 0;
  
      // ✅ Show warning only once per session
      if (duplicateCount > 0 && !duplicateToastShown.current) {
        showToast(`${duplicateCount} duplicate questions removed.`, "warning");
        duplicateToastShown.current = true;
      }
  
      if (duplicateCount === 0) {
        duplicateToastShown.current = false; // Reset for future warnings
      }
  
      setQuestions(fetchedQuestions);
  
      setDashboardStats((prev) => ({
        ...prev,
        totalQuestions: `${fetchedQuestions.length}/${localStorage.getItem("totalquestions") || 0}`,
      }));
  
    } catch (error) {
      console.error("Error fetching questions:", error.response?.data || error.message);
      showToast("Failed to load questions. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  

const filterDuplicateQuestions = (questions) => {
  const seenQuestions = new Set();
  const filteredQuestions = [];

  questions.forEach((question) => {
      const questionKey = `${question.question}-${question.options.join('-')}`;
      if (!seenQuestions.has(questionKey)) {
          seenQuestions.add(questionKey);
          filteredQuestions.push(question);
      }
  });

  return { filteredQuestions };
};



  const handleFinish = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        toast.error("Unauthorized access. Please log in again.");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/finish-contest`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Contest finished successfully! Question IDs have been saved.");
      } else {
        toast.error("Failed to finish the contest. Please try again.");
      }
    } catch (error) {
      console.error("Error finishing contest:", error.response?.data || error.message);
      toast.error("Failed to finish the contest. Please try again.");
    }
  };

  const showToast = (message, type = "info") => {
    toast[type](message);
  };
  
  
  const handleDeleteQuestion = async (questionId) => { 
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("contestToken");
      if (!token) {
        showToast("Unauthorized access. Please log in again.", "error");
        return;
      }
  
      const response = await axios.delete(
        `${API_BASE_URL}/api/mcq/delete-question/${questionId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.status === 200) {
        setQuestions((prevQuestions) =>
          prevQuestions.filter((question) => question._id !== questionId)
        );
        showToast("Question deleted successfully!", "success"); // ✅ Separate toast for delete
      } else {
        showToast(response.data.error || "Failed to delete question.", "error");
      }
    } catch (error) {
      console.error("Error deleting question:", error.response?.data || error.message);
      showToast("Failed to delete question. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };
  
  
  
  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        toast.error("Unauthorized access. Please log in again.");
        return;
      }
      const decodedToken = jwtDecode(token);
      const contestId = decodedToken?.contestId;
      if (!contestId) {
        toast.error("Invalid contest token. Please log in again.");
        return;
      }

      const uniqueQuestions = Array.from(
        new Set(questions.map(JSON.stringify))
      ).map(JSON.parse);

      const selectedStudentDetails = students.filter((student) =>
        selectedStudents.includes(student.regno)
      );
      const selectedStudentEmails = selectedStudentDetails.map(
        (student) => student.email
      );

      const payload = {
        contestId,
        questions: uniqueQuestions,
        students: selectedStudents,
        studentEmails: selectedStudentEmails,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/publish/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSharingLink(
          `${process.env.REACT_APP_FRONTEND_LINK}/testinstructions/${contestId}`
        );
        setShareModalOpen(true);
        toast.success("Questions published successfully!");
      } else {
        toast.error(`Failed to publish questions: ${response.data.message || "Unknown error."}`);
      }
    } catch (error) {
      console.error("Error publishing questions:", error);
      if (error.response) {
        toast.error(`Error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        toast.error("No response from the server. Please try again later.");
      } else {
        toast.error("An error occurred while publishing questions. Please try again.");
      }
    } finally {
      setPublishDialogOpen(false);
    }
  };

  const handleLibraryButtonClick = () => {
    setIsLibraryModalOpen(true);
  };

  const handleLibraryModalClose = () => {
    setIsLibraryModalOpen(false);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const totalMarks = localStorage.getItem("totalMarks");
        const duration = JSON.parse(localStorage.getItem("duration"));
        const passPercentage = localStorage.getItem("passPercentage");
        const totalQuestions = localStorage.getItem("totalquestions");

        let selectedQuestionsCount = 0;

        const token = localStorage.getItem("contestToken");
        if (token) {
          const response = await axios.get(`${API_BASE_URL}/api/mcq/questions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          selectedQuestionsCount = response.data.questions.length;
        }

        setDashboardStats((prev) => ({
          ...prev,
          totalMarks: totalMarks || 0,
          totalDuration: duration
            ? `${duration.hours.padStart(2, "0")}:${duration.minutes.padStart(
                2,
                "0"
              )}:00`
            : "00:00:00",
          maximumMark: passPercentage || 0,
          totalQuestions: `${selectedQuestionsCount}/${totalQuestions || 0}`,
        }));

        await fetchQuestions(initialFetch.current);
        initialFetch.current = false;
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [formData, sections]);

  const handleShareModalClose = () => {
    setShareModalOpen(false);
    navigate(`/staffdashboard`);
  };

  const handleAddQuestion = async () => {
    setIsModalOpen(true);
    await fetchQuestions(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="max-w-5xl w-full">
        <div className="mx-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-x-6 mb-8 mt-8 items-stretch justify-stretch">
          {[
            {
              label: "Total Questions",
              value: dashboardStats.totalQuestions,
              icon: questionIcon,
            },
            {
              label: "Total Marks",
              value: dashboardStats.totalMarks,
              icon: markIcon,
            },
            {
              label: "Total Duration",
              value: dashboardStats.totalDuration,
              icon: clockIcon,
            },
            {
              label: "Maximum Mark",
              value: dashboardStats.maximumMark,
              icon: markIcon,
            },
          ].map((item, index) => (
            <div className="bg-white text-[#000975] shadow-md rounded-lg p-5 relative flex flex-col items-center justify-center py-8">
              <span className="absolute -top-4 -right-4 p-2 bg-white z-10 shadow-lg rounded-full">
                <img src={item.icon} alt="" className="w-6" />
              </span>
              <p className="text-xs"> {item.label} </p>
              <p className="text-3xl"> {item.value} </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end mb-4">
          <Button
            onClick={handleAddQuestion}
            variant="contained"
            color="primary"
          >
            Add Question
          </Button>
        </div>

        {!isLoading && questions.length > 0 && (
          <div className="mt-8 px-5 pt-4 pb-6 bg-white shadow-md text-[#000975] rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Questions</h3>
            {isLoading ? (
              <p>Loading questions...</p>
            ) : (
              <ul className="space-y-4">
                {questions
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map((question, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-[#fafdff] shadow-md rounded-lg p-4 border border-gray-300"
                    >
                      <div className="flex text-sm">
                        <p className="">{question.question}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="font-semibold text-sm mr-1">Answer: </p>
                        <span className="text-sm">{question.correctAnswer}</span>
                        <button
                          className="ml-4 p-2 text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteQuestion(question._id)}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
            <div className="flex justify-center mt-6">
              <Pagination
                count={Math.ceil(questions.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#000975',
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    backgroundColor: '#FDC500',
                    color: '#fff',
                  },
                  '& .MuiPaginationItem-root:hover': {
                    backgroundColor: 'rgba(0, 9, 117, 0.1)',
                  },
                }}
              />
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center mt-16">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-yellow-500" />
            <p className="text-gray-600 mt-4">Loading questions...</p>
          </div>
        )}

        {!isLoading && questions.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-600">
              No questions available in the database.
            </p>
            <button
              onClick={() => navigate("/mcq/sectionDetails")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Sections and Questions
            </button>
          </div>
        )}

        {!isLoading && questions.length > 0 && (
          <div className="flex justify-end mt-10">
            <button
              onClick={() => {
                const [selected, total] = dashboardStats.totalQuestions.split('/').map(Number);
                if (selected < total) {
                  toast.warning("Insufficient questions to publish! Please add more questions.");
                } else {
                  setPublishDialogOpen(true);
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Publish
            </button>
          </div>
        )}

        {isModalOpen && (
          <QuestionModal
            showModal={isModalOpen}
            onClose={handleModalClose}
            handleCreateManually={() => navigate("/mcq/CreateQuestion")}
            handleBulkUpload={() => navigate("/mcq/bulkUpload")}
            handleMcqlibrary={() => navigate("/mcq/McqLibrary")}
            handleAi={() => navigate("/mcq/aigenerator")}
          />
        )}
        <Dialog
          open={publishDialogOpen}
          onClose={() => setPublishDialogOpen(false)}
          fullWidth
          maxWidth="lg"
        >
          <DialogTitle>Select Students</DialogTitle>
          <DialogContent>
            <StudentTable
              students={students}
              selectedStudents={selectedStudents}
              setSelectedStudents={setSelectedStudents}
              filters={filters}
              setFilters={setFilters}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              openFilterDialog={openFilterDialog}
              setOpenFilterDialog={setOpenFilterDialog}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setPublishDialogOpen(false)}
              color="primary"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button onClick={handlePublish} color="primary" variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <ShareModal
          open={shareModalOpen}
          onClose={handleShareModalClose}
          shareLink={sharingLink}
        />
      </div>
    </div>
  );
};

export default Mcq_Dashboard;