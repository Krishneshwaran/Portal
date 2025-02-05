import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import GroupImage from "../../../assets/bulk.png";
import SampleCSV from "../../../assets/csv file/bulk_upload_questions.csv"; // Import the sample CSV file
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Mcq_bulkUpload = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("My Device"); // Default tab
  const [setHighlightStep] = useState(1); // Step highlight state
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [questionsPerPage] = useState(10); // Number of questions per page
  const [showImage, setShowImage] = useState(true); // Control visibility of the image
  const [showPreview, setShowPreview] = useState(false); // Control visibility of the preview section
  const navigate = useNavigate();
  const location = useLocation();
  const requiredQuestions = location.state?.requiredQuestions || 0;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    // Load questions from local storage on component mount
    const storedQuestions = JSON.parse(localStorage.getItem("uploadedQuestions")) || [];
    setQuestions(storedQuestions);
  }, []);

  useEffect(() => {
    // Save questions to local storage whenever questions state changes
    localStorage.setItem("uploadedQuestions", JSON.stringify(questions));
  }, [questions]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "My Drive") setHighlightStep(1);
    else if (tab === "Dropbox") setHighlightStep(2);
    else if (tab === "My Device") setHighlightStep(3);
  };

  // Handle CSV Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select a valid CSV file.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        const rows = csvText.split("\n").map((row) => row.split(","));
        const headers = rows[0];
        const dataRows = rows.slice(1).filter((row) => row.length > 1);

        console.log("Headers:", headers); // Debugging statement
        console.log("Data Rows:", dataRows); // Debugging statement

        const formattedQuestions = dataRows.map((row) => ({
          question: row[0]?.replace(/["]/g, ""),
          options: [
            row[1]?.trim(),
            row[2]?.trim(),
            row[3]?.trim(),
            row[4]?.trim(),
            row[5]?.trim(),
            row[6]?.trim(),
          ].filter(Boolean) || [], // Ensure options is always an array
          correctAnswer: row[7]?.trim(),
          negativeMarking: row[8]?.trim(),
          mark: row[9]?.trim(),
          level: "easy", // Default level if not provided
          tags: [], // Default tags if not provided
        }));

        console.log("Formatted Questions:", formattedQuestions); // Debugging statement

        setQuestions((prevQuestions) => [...prevQuestions, ...formattedQuestions]);
        setShowImage(false); // Hide the image after upload
        setShowPreview(true); // Show the preview section
        toast.success("File uploaded successfully! Preview the questions below.", {
          position: "top-center",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error(`Error processing file: ${error.message}`, {
          position: "top-center",
          autoClose: 3000,
        });
      }
    };

    reader.onerror = (error) => {
      console.error("File reading error:", error);
      toast.error("Error reading file", {
        position: "top-center",
        autoClose: 3000,
      });
    };

    reader.readAsText(file);
  };

  // Handle Question Selection
  const handleSelectQuestion = (index) => {
    setSelectedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((_, index) => index));
    }
  };

  // Submit Selected Questions
  const handleSubmit = async () => {
    if (selectedQuestions.length < requiredQuestions) {
      toast.warn(`Please select at least ${requiredQuestions} questions.`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const token = localStorage.getItem("contestToken");
    const selected = selectedQuestions.map((index) => questions[index]);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/save-questions/`,
        { questions: selected },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("API Response:", response.data); // Debugging statement

      toast.success("Questions added successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
      setQuestions([]);
      setSelectedQuestions([]);
      navigate("/mcq/QuestionsDashboard");
    } catch (error) {
      console.error("Error submitting questions:", error);
      toast.error("Failed to submit questions. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  // Pagination Logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div>
        {/* Toast Container for rendering notifications */}
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
      </div>
      {/* Title Section */}
      {!showPreview && (
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Files</h1>
          <p className="text-gray-500 text-sm">
            Easily add questions by uploading your prepared files as{" "}
            <span className="font-medium text-gray-600">csv, xlsx etc.</span>
          </p>
        </div>
      )}

      {/* Main Upload Section */}
      {!showPreview && (
        <div className="bg-white shadow-lg rounded-3xl p-8 w-[90%] max-w-4xl">
          {/* Tabs Section */}
          <div className="flex space-x-6 mb-6 justify-center">
            <button
              className={`font-medium ${
                activeTab === "My Device"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500"
              }`}
              onClick={() => handleTabChange("My Device")}
            >
              My Device
            </button>
          </div>

          {/* Upload Section */}
          <div className="flex flex-col items-center justify-center mb-6">
            {showImage && (
              <img
                src={GroupImage}
                alt="Upload Illustration"
                className="w-48 h-48 object-contain mb-4"
              />
            )}
            {/* Download Sample CSV Button */}
            <a
              href={SampleCSV}
              download="bulk_upload_questions.csv"
              className="mb-4 bg-yellow-400 text-black px-6 py-2 rounded-full shadow hover:bg-yellow-500 cursor-pointer transition"
            >
              Download Sample CSV
            </a>
            {/* Upload CSV Button */}
            <label
              htmlFor="fileInput"
              className="bg-yellow-400 text-black px-6 py-2 rounded-full shadow hover:bg-yellow-500 cursor-pointer transition"
            >
              {showImage ? "Upload CSV" : "Add Question"}
            </label>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              accept=".csv"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

{showPreview && (
        <div className="mt-8">
          <label
            htmlFor="fileInput"
            className="bg-yellow-400 text-black px-6 py-4 rounded-full shadow hover:bg-yellow-500 cursor-pointer transition"
          >
            Add Question
          </label>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* Questions Preview Section */}
      {showPreview && questions.length > 0 && (
        <div className="bg-white shadow-lg rounded-3xl p-6 mt-8 w-[90%] max-w-5xl">
          <h2 className="text-2xl font-semibold mb-4">Questions Preview</h2>
          <div className="flex justify-between mb-4">
            <button
              onClick={handleSelectAll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {selectedQuestions.length === questions.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Select</th>
                <th className="px-4 py-2 text-left">Question</th>
                
                <th className="px-4 py-2 text-left">Correct Answer</th>
             
              </tr>
            </thead>
            <tbody>
              {currentQuestions.map((q, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } text-gray-800`}
                >
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(indexOfFirstQuestion + index)}
                      onChange={() => handleSelectQuestion(indexOfFirstQuestion + index)}
                    />
                  </td>
                  <td className="px-4 py-2 text-justify">{q.question}</td>
                 
                  <td className="px-4 py-2 text-left">{q.correctAnswer}</td>
                 
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {Math.ceil(questions.length / questionsPerPage)}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Selected Questions
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default Mcq_bulkUpload;
