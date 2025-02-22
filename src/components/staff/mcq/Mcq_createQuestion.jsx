import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReactComponent as TrashIcon } from '../../../assets/Vector.svg';
import { ChevronRight } from "lucide-react";

const Mcq_createQuestion = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [level, setLevel] = useState("");
  const [blooms, setBlooms] = useState("");
  const [tags, setTags] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState([]);
  const [isNewQuestion, setIsNewQuestion] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [showFinishPopup, setShowFinishPopup] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
    setHasUnsavedChanges(true);
  };

  const handleTagChange = (e) => {
    setTags(e.target.value.split(',').map(tag => tag.trim()));
    setHasUnsavedChanges(true);
  };

  const handleNavigation = (navigateFunction) => {
    if (hasUnsavedChanges) {
      toast.info(
        <div className="flex flex-col items-center">
          <div className="text-blue-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-[#111933] mb-6">
            Are you sure you want to leave without saving?
          </p>
          <div className="flex justify-center gap-8">
            <button
              className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
              onClick={() => {
                navigateFunction();
                toast.dismiss();
              }}
            >
              Yes
            </button>
            <button
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              onClick={() => toast.dismiss()}
            >
              No
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          className: "!fixed !top-1/2 !left-1/2 !transform !-translate-x-1/2 !-translate-y-1/2",
          style: {
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            width: 'auto',
            minWidth: '400px',
            margin: 0,
            zIndex: 9999
          }
        }
      );
    } else {
      navigateFunction();
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("contestToken");
        if (!token) {
          toast.error("Unauthorized access. Please log in again.");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/mcq/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedQuestions = response.data.questions || [];
        setQuestionList(fetchedQuestions);

        if (fetchedQuestions.length > 0) {
          setCurrentQuestionIndex(0);
          loadQuestionIntoForm(fetchedQuestions[0]);
        } else {
          resetFormForNewQuestion();
        }
      } catch (error) {
        console.error("Error fetching questions:", error.response?.data || error.message);
        toast.error("Failed to load questions. Please try again.");
      }
    };

    fetchQuestions();
    resetFormForNewQuestion(); // Reset the form whenever the component mounts
  }, []);

  useEffect(() => {
    // Save form data to session storage whenever there are unsaved changes
    if (hasUnsavedChanges) {
      sessionStorage.setItem("mcqCreateQuestionFormData", JSON.stringify({
        question,
        options,
        answer,
        level,
        blooms,
        tags,
      }));
    }
  }, [question, options, answer, level, blooms, tags, hasUnsavedChanges]);

  const handleFinish = () => {
    setShowFinishPopup(true);
  };

  const confirmFinish = async () => {
    // First check if there are any questions in the list
    if (questionList.length === 0) {
      toast.error("Please add at least one question before finishing");
      return;
    }
  
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        toast.error("Unauthorized access. Please log in again.");
        return;
      }
  
      // Prepare the questions data
      const questionsData = {
        questions: questionList.map(q => ({
          question: q.question,
          options: q.options.filter(opt => opt.trim() !== ""),
          correctAnswer: q.correctAnswer,
          level: q.level,
          blooms: q.blooms,
          tags: q.tags || [],
        }))
      };
  
      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/save-questions/`,
        questionsData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
  
      if (response.data) {
        setHasUnsavedChanges(false);
        toast.success("Contest finished successfully!");
        navigate("/mcq/QuestionsDashboard");
      }
  
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error("Failed to save questions. Please try again.");
    }
  };

  const loadQuestionIntoForm = (questionData) => {
    setIsNewQuestion(false);
    setQuestion(questionData.question || "");
    setOptions(questionData.options || ["", "", "", "", "", ""]);
    setAnswer(questionData.correctAnswer || "");
    setLevel(questionData.level || "");
    setBlooms(questionData.blooms || "");
    setTags(questionData.tags || []);
  };

  const resetFormForNewQuestion = () => {
    setIsNewQuestion(true);
    setQuestion("");
    setOptions(["", "", "", "", "", ""]);
    setAnswer("");
    setLevel("");
    setBlooms("");
    setTags([]);
  };

  const handleSaveClick = () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const filledOptions = options.filter(option => option.trim() !== "");
    if (filledOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    if (!answer) {
      toast.error("Please select the correct answer");
      return;
    }

    if (!level) {
      toast.error("Please select the difficulty level");
      return;
    }

    if (!blooms) {
      toast.error("Please select the Blooms level");
      return;
    }

    const newQuestion = {
      question,
      options: filledOptions,
      correctAnswer: answer,
      level,
      blooms,
      tags,
    };

    setQuestionList([...questionList, newQuestion]);
    resetFormForNewQuestion();
    setHasUnsavedChanges(false);
  };

  const handlePreviousQuestion = () => {
    handleNavigation(() => {
      if (currentQuestionIndex > 0) {
        const prevIndex = currentQuestionIndex - 1;
        setCurrentQuestionIndex(prevIndex);
        loadQuestionIntoForm(questionList[prevIndex]);
      }
    });
  };

  const handleNextQuestion = () => {
    handleNavigation(() => {
      if (currentQuestionIndex < questionList.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = questionList[nextIndex];
        setQuestion(nextQuestion.question || "");
        setOptions(nextQuestion.options || ["", "", "", "", "", ""]);
        setAnswer(nextQuestion.correctAnswer || "");
        setLevel(nextQuestion.level || "");
        setBlooms(nextQuestion.blooms || "");
        setTags(nextQuestion.tags || []);
        setIsNewQuestion(false);
      } else {
        setCurrentQuestionIndex(questionList.length);
        resetFormForNewQuestion();
        setIsNewQuestion(true);
      }
    });
  };


  const handleDeleteOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleDeleteQuestion = (index, e) => {
    if (e) {
      e.stopPropagation(); // Prevent triggering question selection
    }

    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this question?")) {
      // Update question list by filtering out the deleted question
      setQuestionList(prevList => prevList.filter((_, i) => i !== index));

      // Reset form if the deleted question was currently selected
      if (currentQuestionIndex === index) {
        resetFormForNewQuestion();
        setCurrentQuestionIndex(-1);
      } else if (currentQuestionIndex > index) {
        // Adjust currentQuestionIndex if necessary
        setCurrentQuestionIndex(prev => prev - 1);
      }

      toast.success("Question deleted successfully!");
    }
  };

  return (
    <div className="bg-[#ecf2fe] h-full py-8 px-14">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        style={{
          top: '20px',
          right: '20px',
          transform: 'none'
        }}
        toastStyle={{
          background: 'white',
          color: 'black',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      />
      <div className="h-14 pb-10">
        <div className="flex items-center gap-2 text-[#111933]">
          <span className="opacity-60">Home</span>
          <span>{">"}</span>
          <span
            className="cursor-pointer opacity-60 hover:underline"
            onClick={() => navigate("/mcq/details", { state: { currentStep: 1 } })}
          >
            Assessment Overview
          </span>
          <span>{">"}</span>
          <span
            className="cursor-pointer opacity-60 hover:underline"
            onClick={() => navigate("/mcq/details", { state: { currentStep: 2 } })}
          >
            Test Configuration
          </span>
          <span>{">"}</span>
          <span onClick={() => window.history.back()} className="cursor-pointer opacity-60 hover:underline">
            Add Questions
          </span>
          <span>{">"}</span>
          <span>Create Questions</span>
        </div>
      </div>
      <div className="max-w-[1500px] mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <header className="mb-1 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-[#111933]">
            Create Questions
          </h2>
    
        </header>

        <div className="mb-6 pb-4 text-lg border-b-2 text-[#111933]">
          Choose how you’d like to add questions to your assessment. Select the method that works best for you to quickly build your test.
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Form */}
          <main className="col-span-8 border-2 p-6 rounded-lg">
            {/* Question Input */}
            <div className="mb-6">
              <label className="text-lg font-medium text-[#111933] mb-2 flex justify-start">
                Question
              </label>
              <textarea
                value={question}
                onChange={handleInputChange(setQuestion)}
                className="w-full border rounded-lg p-4 text-[#111933]"
                placeholder="Enter your question here"
                rows={4}
              />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
  <label className="text-lg font-medium text-[#111933] mb-2 flex justify-between col-span-2">
    Options
    {options.length < 6 && (
      <button
        className="text-green-500 hover:text-green-700"
        onClick={handleAddOption}
      >
        Add Option +
      </button>
    )}
  </label>
  {options.map((option, index) => (
    <div className="flex items-center mb-2" key={index}>
      <input
        type="text"
        value={option}
        onChange={(e) => handleOptionChange(index, e.target.value)}
        placeholder={`Option ${String.fromCharCode(65 + index)}`}
        className="flex-grow border rounded-lg p-2 text-[#111933]"
      />
      {options.length > 2 && (
        <button
          className="ml-2 text-red-500 hover:text-red-700"
          onClick={() => handleDeleteOption(index)}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  ))}
</div>


            {/* Correct Answer, Difficulty Level, and Blooms */}
            <div className="mb-6 flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-lg font-medium text-[#111933] mb-2 flex justify-start">
                  Correct Answer
                </label>
                <select
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full border rounded-lg p-2 text-[#111933]"
                >
                  <option value="">Select the correct option</option>
                  {options
                    .filter(option => option.trim() !== "")
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-lg font-medium text-[#111933] mb-2 flex justify-start">
                  Difficulty Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full border rounded-lg p-2 text-[#111933]"
                >
                  <option value="">Select difficulty level</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-lg font-medium text-[#111933] mb-2 flex justify-start">
                  Blooms
                </label>
                <select
                  value={blooms}
                  onChange={(e) => setBlooms(e.target.value)}
                  className="w-full border rounded-lg p-2 text-[#111933]"
                >
                  <option value="">Select Blooms level</option>
                  <option value="L1 - Remember">L1 - Remember</option>
                  <option value="L2 - Understanding">L2 - Understanding</option>
                  <option value="L3 - Apply">L3 - Apply</option>
                  <option value="L4 - Analyze">L4 - Analyze</option>
                  <option value="L5 - Evaluate">L5 - Evaluate</option>
                  <option value="L6 - Create">L6 - Create</option>
                </select>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="col-span-4 border-2 p-6 rounded-lg flex flex-col">
            <h3 className="font-semibold text-[#111933] mb-4">Question List</h3>
            <ul className="space-y-4 flex-grow">
              {questionList.map((q, index) => (
                <li
                  key={index}
                  className="p-3 bg-white border text-black rounded-lg flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    loadQuestionIntoForm(q);
                  }}
                >
                  <div className="text-black font-medium">
                    <span className="rounded-full bg-yellow-400 py-1 px-[10px] text-sm mr-2">
                      {index + 1}
                    </span>
                    <span className="font-medium">
                      {q.question || "No question text"}
                    </span>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => handleDeleteQuestion(index, e)}
                    aria-label="Delete question"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mr-32 mt-4">
          <div className="flex items-center justify-between gap-80">
            <button
              onClick={handlePreviousQuestion}
              className="py-2 px-4 bg-white border border-[#111933] font-semibold text-[#111933] rounded-md flex items-center justify-center gap-2"
            >
              <ChevronRight size={20} className="rotate-180" />Previous
            </button>

            <button
              onClick={handleSaveClick}
              className="py-2 px-4 border border-[#32ab24] font-semibold text-[#32ab24] rounded-md flex items-center justify-center gap-2"
            >
              Save
            </button>

            <button
              onClick={handleNextQuestion}
              className="bg-[#111933] text-white py-2 px-4 font-semibold rounded-md flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={20} />
            </button>
          </div>

          {/* Finish button in a separate div, moved 20px to the right */}
          <div className="mx-16">
            <button
              onClick={handleFinish}
              className="py-2 px-4 bg-[#32ab24] font-semibold text-white rounded-md flex items-center justify-center gap-2"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
      {/* Add the save confirmation popup with fixed positioning */}
      {showSavePopup && (
        <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 w-[400px] max-w-full rounded-xl shadow-lg text-center">
            <div className="text-blue-600 mb-4">
              <svg
                className="w-14 h-14 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#111933]">
              Are you sure you want to leave without saving?
            </h2>
            <div className="flex justify-center mt-8 space-x-4">
              <button
                className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                onClick={() => {
                  confirmFinish();
                  setShowSavePopup(false);
                }}
              >
                Yes
              </button>
              <button
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                onClick={() => setShowSavePopup(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the finish confirmation popup with fixed positioning */}
      {showFinishPopup && (
        <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 w-[400px] max-w-full rounded-xl shadow-lg text-center">
            <div className="text-blue-600 mb-4">
              <svg
                className="w-14 h-14 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#111933]">
              Are you sure you want to finish?
            </h2>
            <div className="flex justify-center mt-8 space-x-4">
              <button
                className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                onClick={() => {
                  confirmFinish();
                  setShowFinishPopup(false);
                }}
              >
                Yes
              </button>
              <button
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                onClick={() => setShowFinishPopup(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mcq_createQuestion;
