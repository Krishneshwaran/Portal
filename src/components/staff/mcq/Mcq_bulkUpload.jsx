import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import downloadSampleFile from "../../../assets/csv file/bulk_upload_questions.xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Upload } from "lucide-react";
import { Download } from "lucide-react";
import PreviewTable from "../previewtable";
import { X } from 'lucide-react';
import correct from '../../../assets/icons/correcticon.png'
import EditPanel from './EditPanel';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-7xl relative">
        <button
          onClick={() => onClose(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="absolute top-5 right-5 w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

const Mcq_bulkUpload = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("My Device");
  const [setHighlightStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [showImage, setShowImage] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const requiredQuestions = location.state?.requiredQuestions || 0;
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const storedQuestions = JSON.parse(localStorage.getItem("uploadedQuestions")) || [];
    setQuestions(storedQuestions);
  }, []);

  useEffect(() => {
    localStorage.setItem("uploadedQuestions", JSON.stringify(questions));
  }, [questions]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "My Drive") setHighlightStep(1);
    else if (tab === "Dropbox") setHighlightStep(2);
    else if (tab === "My Device") setHighlightStep(3);
  };

  const handleEdit = (questionIndex) => {
    const question = questions[questionIndex];
    setEditingQuestion(question);
    setIsEditPanelOpen(true);
  };

  // Add this function to handle save
  const handleSaveEdit = (editedQuestion) => {
    const newQuestions = [...questions];
    const index = questions.findIndex(q => q.question === editingQuestion.question);
    if (index !== -1) {
      newQuestions[index] = editedQuestion;
      setQuestions(newQuestions);
    }
    setIsEditPanelOpen(false);
    setEditingQuestion(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select a valid CSV or XLSX file.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let dataRows = [];
        let headers = [];
  
        if (file.name.endsWith(".csv")) {
          const csvText = event.target.result;
          const parsedData = Papa.parse(csvText, { header: true });
          headers = parsedData.meta.fields || [];
          dataRows = parsedData.data.filter((row) => Object.keys(row).length > 1);
        } else if (file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(event.target.result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          headers = jsonData[0] || [];
          dataRows = jsonData.slice(1).map((row) => {
            let rowObject = {};
            headers.forEach((header, index) => {
              rowObject[header] = row[index];
            });
            return rowObject;
          });
        }
  
        const requiredColumns = ["question", "correct_answer", "blooms"]; // Added blooms column
        const optionColumns = ["option_1", "option_2", "option_3", "option_4", "option_5", "option_6"];
        const hasRequiredColumns = requiredColumns.every(col => headers.includes(col));
        const availableOptions = optionColumns.filter(col => headers.includes(col));
  
        if (!hasRequiredColumns || availableOptions.length < 2) {
          toast.error("Invalid file format. Ensure required columns exist and at least two options are provided.", {
            position: "top-center",
            autoClose: 3000,
          });
          return;
        }
  
        const formattedQuestions = dataRows.map((row) => {
          const options = availableOptions.map(opt => row[opt]).filter(Boolean).slice(0, 6);
          return {
            question: row.question,
            options,
            correctAnswer: row.correct_answer,
            blooms: row.blooms || "",  // Ensure blooms column is included
            level: "easy",
            tags: [],
          };
        });
  
        setSelectedQuestions([]);
        setQuestions(formattedQuestions);
        setShowImage(false);
        setShowPreview(true);
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
  
    reader.readAsBinaryString(file);
  };
  
  
  

  const handleSelectQuestion = (index) => {
    setSelectedQuestions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((_, index) => index));
    }
  };

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

      console.log("API Response:", response.data);

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
  
  const downloadSample = () => {
    const link = document.createElement('a');
    link.href = downloadSampleFile;
    link.download = "bulk_upload_questions.csv";
    link.click();
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#f4f6ff86] flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-[1500px] px-12">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#111933] text-sm">
            <span className="opacity-60">Home</span>
            <span>{">"}</span>
            <span className="opacity-60">Assessment Overview</span>
            <span>{">"}</span>
            <span className="opacity-60">Test Configuration</span>
            <span>{">"}</span>
            <span onClick={() => window.history.back()} className="cursor-pointer opacity-60 hover:underline">
              Add Questions
            </span>
          </div>
        </div>
        <div>
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
        {!showPreview && (
          <div className="bg-white shadow-lg rounded-xl px-10 py-12 w-full">
            <div className="text-start mb-6">
              <h1 className="text-3xl font-bold text-[#111933] mb-2">Upload Files</h1>
              <p className="text-[#A0A0A0] text-sm">
                Easily add questions by uploading your prepared files as{' '}
                <span className="font-medium text-[#111933] opacity-60">csv, xlsx etc.</span>
              </p>
              <hr className="border-t border-gray-400 my-4" />
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center mb-6 w-full">
              <p className="text-[#111933] text-xl mb-4">Upload files as csv, xlsx etc.</p>
              <label
                htmlFor="fileInput"
                className="bg-[#111933] text-white px-6 py-2 rounded-md cursor-pointer flex items-center gap-2"
              >
                Upload <Upload size={20} />
              </label>
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept=".csv, .xlsx"
                onChange={handleFileUpload}
              />
            </div>
            <div className=" p-6 rounded-lg w-full">
              <h2 className="text-lg font-semibold mb-1">Instructions</h2>
              <p className="text-[#A0A0A0] mb-2 text-sm">
                Easily add questions by uploading your prepared files as{' '}
                <span className="font-medium text-[#111933] opacity-60">csv, xlsx etc.</span>
              </p>
              <hr className="border-t border-gray-400 my-4" />
              <ul className="text-sm text-[#111933] space-y-2">
                <li className="flex items-center gap-2">
                   <img src={correct} alt="Checkmark" className="w-4 h-4" />
                  Ensure your file is in XLSX format.
                </li>
                <li className="flex items-center gap-2">
                   <img src={correct} alt="Checkmark" className="w-4 h-4" />
                  Options should be labeled as option1, option2, ..., option6.
                </li>
                <li className="flex items-center gap-2">
                   <img src={correct} alt="Checkmark" className="w-4 h-4" />
                  The correct answer should be specified in the correct answer column.
                </li>
                <li className="flex items-center gap-2">
                    <img src={correct} alt="Checkmark" className="w-4 h-4" />
                  Ensure all fields are properly filled.
                </li>
              </ul>

            </div>
            <button
                onClick={downloadSample}
                className="flex ml-7 items-center w-2/7 gap-2 border border-[#111933] text-[#111933] px-6 py-1 rounded-md cursor-pointer"
              >
                Sample Document <Download size={18} />
              </button>
          </div>
        )}
        {showPreview && (
          <div className="mt-4 text-center">
            <label
              htmlFor="fileInput"
              className="bg-yellow-400 text-black px-6 py-4 rounded-full shadow hover:bg-yellow-500 cursor-pointer transition"
            >
              Add Question
            </label>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".csv, .xlsx"
              onChange={handleFileUpload}
            />
          </div>
        )}
        <Modal isOpen={showPreview} onClose={() => setShowPreview(false)}>
          {questions.length > 0 && (
            <PreviewTable
            questions={currentQuestions}
            selectedQuestions={selectedQuestions}
            currentPage={currentPage}
            questionsPerPage={questionsPerPage}
            onSelectQuestion={handleSelectQuestion}
            onSelectAll={handleSelectAll}
            onPageChange={paginate}
            onSubmit={handleSubmit}
            indexOfFirstQuestion={indexOfFirstQuestion}
            totalPages={totalPages}
            showBlooms={true} 
            onEdit={handleEdit} // Pass blooms column to PreviewTable
          />          
          )}
        </Modal>
        <EditPanel
              isOpen={isEditPanelOpen}
              onClose={() => setIsEditPanelOpen(false)}
              question={editingQuestion}
              onSave={handleSaveEdit}
            />
      </div>
    </div>
  );

  
};

export default Mcq_bulkUpload;