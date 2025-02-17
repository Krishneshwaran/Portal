import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse'; // For CSV parsing
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@mui/material/Pagination';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Define categories here
const predefinedCategories = ["Math", "Science", "History", "Geography"];

const borderRadius = '5px'; // Define borderRadius

const AddTest = () => {
  const navigate = useNavigate();
  const [testName, setTestName] = useState("");
  const [testLevel, setTestLevel] = useState("");
  const [testTags, setTestTags] = useState([]);
  const [testTagsInput, setTestTagsInput] = useState("");
  const [showDownloadSample, setShowDownloadSample] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const [questions, setQuestions] = useState([{
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    level: "",
    tags: [],
    tagsInput: "",
    isVisible: true // Add a new field for managing visibility
  }]);
  const [showPopup, setShowPopup] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [manualCategory, setManualCategory] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 4;

  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const [bulkCurrentPage, setBulkCurrentPage] = useState(1);
  const bulkQuestionsPerPage = 10;

  const bulkTotalPages = Math.ceil(parsedQuestions.length / bulkQuestionsPerPage);

  const bulkIndexOfLastQuestion = bulkCurrentPage * bulkQuestionsPerPage;
  const bulkIndexOfFirstQuestion = bulkIndexOfLastQuestion - bulkQuestionsPerPage;
  const currentParsedQuestions = parsedQuestions.slice(bulkIndexOfFirstQuestion, bulkIndexOfLastQuestion);

  const handleBulkPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= bulkTotalPages) {
      setBulkCurrentPage(newPage);
    }
  };

  const createTest = async () => {
    // Validate all questions
    for (const question of questions) {
      const filledOptions = question.options.filter(option => option.trim() !== "");
      if (!question.question || filledOptions.length < 2 || !question.correctAnswer) {
        toast.error("Please ensure all questions filled properly.");
        return;
      }
    }

    try {
      // Remove tagsInput field before sending to API
      const questionsForApi = questions.map(q => ({
        question_id: uuidv4(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        level: q.level,
        tags: q.tags
      }));

      const response = await axios.post(`${API_BASE_URL}/api/create-test/`, {
        test_name: testName,
        level: testLevel,
        tags: testTags,
        category: selectedCategory === "Others" ? manualCategory : selectedCategory, // Include the selected category
        questions: questionsForApi
      });
      toast.success(response.data.message);
      toast.success('Test created successfully'); // Add this line
      navigate(-1);
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error('Error creating test');
    }
  };

  const clearForm = () => {
    setTestName("");
    setTestLevel("");
    setTestTags([]);
    setTestTagsInput("");
    setQuestions([{
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      level: "",
      tags: [],
      tagsInput: "",
      isVisible: true
    }]);
    setFile(null);
    setParsedQuestions([]);
    setSelectedQuestions([]);
    setSelectedCategory("");
    setManualCategory("");
    toast.info('Form cleared');
  };

  const addQuestion = () => {
    const currentQuestion = questions[questions.length - 1];
    const filledOptions = currentQuestion.options.filter(option => option.trim() !== "");

    if (!currentQuestion.question || filledOptions.length < 2 || !currentQuestion.correctAnswer) {
      toast.error("Please ensure the current question is fully filled out before adding a new one.");
      return;
    }

    setQuestions([...questions, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      level: "",
      tags: [],
      tagsInput: "",
      isVisible: true
    }]);
    toast.success('Question added');
  };

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    toast.success('Question deleted');
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === "tags") {
      newQuestions[index].tagsInput = value;
      // Only update tags array when there's a comma or Enter key press
      if (value.endsWith(',')) {
        const newTag = value.slice(0, -1).trim();
        if (newTag && !newQuestions[index].tags.includes(newTag)) {
          newQuestions[index].tags = [...newQuestions[index].tags, newTag];
        }
        newQuestions[index].tagsInput = '';
      }
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleTagKeyPress = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newQuestions = [...questions];
      const newTag = newQuestions[index].tagsInput.trim();
      if (newTag && !newQuestions[index].tags.includes(newTag)) {
        newQuestions[index].tags = [...newQuestions[index].tags, newTag];
      }
      newQuestions[index].tagsInput = '';
      setQuestions(newQuestions);
    }
  };

  const removeTag = (questionIndex, tagIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].tags = newQuestions[questionIndex].tags.filter((_, i) => i !== tagIndex);
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const levels = ["Easy", "Medium", "Hard"];

  const handleBulkUpload = () => {
    setShowPopup(false);
    setShowBulkUpload(true);
  };

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    parseFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const parseFile = (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data
          .filter(row => row.question && row.option1 && row.option2 && row.option3 && row.option4 && row.correctAnswer) // Filter out incomplete questions
          .map(row => ({
            question: row.question || "",
            options: [
              row.option1 || "",
              row.option2 || "",
              row.option3 || "",
              row.option4 || ""
            ],
            correctAnswer: row.correctAnswer || "", // Ensure correctAnswer is set
            level: row.Level || "",
            tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : []
          }));
        setParsedQuestions(parsedData);
        setBulkCurrentPage(1); // Reset to the first page when new file is uploaded
      },
      error: (error) => {
        console.error("Error parsing file:", error);
      }
    });
  };

  const handleBulkUploadSubmit = async () => {
    try {
      const questionsForApi = selectedQuestions.map(q => ({
        question_id: uuidv4(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        level: q.level,
        tags: q.tags
      }));

      // Prepare the payload according to the required format
      const payload = {
        test_id: uuidv4(),
        test_name: testName,
        level: testLevel,
        tags: testTags,
        category: selectedCategory === "Others" ? manualCategory : selectedCategory, // Include the selected category
        questions: questionsForApi
      };

      // Directly post the questions to the bulk upload URL
      const uploadResponse = await axios.post(`${API_BASE_URL}/api/bulk-upload-to-test/`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      toast.success(uploadResponse.data.message);
      navigate(-1);
    } catch (error) {
      console.error("Error uploading test:", error);
      toast.error('Error uploading test');
    }
  };

  const handleQuestionSelection = (index, isChecked) => {
    const question = parsedQuestions[bulkIndexOfFirstQuestion + index];
    const isAlreadySelected = selectedQuestions.some(q => q.question === question.question);
  
    if (isChecked && !isAlreadySelected) {
      setSelectedQuestions([...selectedQuestions, question]);
    } else if (!isChecked && isAlreadySelected) {
      setSelectedQuestions(selectedQuestions.filter(q => q.question !== question.question));
    }
  };

  const handleTestLevelChange = (e) => {
    setTestLevel(e.target.value);
  };

  const handleTestTagsChange = (e) => {
    setTestTagsInput(e.target.value);
    if (e.target.value.endsWith(',')) {
      const newTag = e.target.value.slice(0, -1).trim();
      if (newTag && !testTags.includes(newTag)) {
        setTestTags([...testTags, newTag]);
      }
      setTestTagsInput('');
    }
  };

  const handleTestTagsKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = testTagsInput.trim();
      if (newTag && !testTags.includes(newTag)) {
        setTestTags([...testTags, newTag]);
      }
      setTestTagsInput('');
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error('Please upload a file.');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question.');
      return;
    }
    handleBulkUploadSubmit();
  };

  const testtoggleExpand = (index) => {
    setExpandedQuestions((prev) =>
      prev.includes(bulkIndexOfFirstQuestion + index) ? prev.filter((i) => i !== (bulkIndexOfFirstQuestion + index)) : [...prev, bulkIndexOfFirstQuestion + index]
    );
  };

  const removeTestTag = (tagIndex) => {
    const newTags = testTags.filter((_, i) => i !== tagIndex);
    setTestTags(newTags);
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample_document.csv'; // Update the path to reference the public folder
    link.download = 'sample_document.csv'; // Corrected the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample document downloaded');
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      // Select all unique questions
      const uniqueQuestions = [...new Map(parsedQuestions.map(q => [q.question, q])).values()];
      setSelectedQuestions(uniqueQuestions);
    } else {
      // Deselect all questions
      setSelectedQuestions([]);
    }
  };

  const [expandedQuestion, setExpandedQuestion] = useState(questions.length - 1); // Last question is expanded

  const toggleExpand = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const handleSaveQuestion = (index) => {
    const question = questions[index];
    const filledOptions = question.options.filter(option => option.trim() !== "");

    if (!question.question || filledOptions.length < 2 || !question.correctAnswer) {
      toast.error("Please fill in the question, at least two options, and select a correct answer.");
      return;
    }

    // Check for duplicates
    const isDuplicate = questions.some((q, i) =>
      i !== index &&
      q.question === question.question &&
      q.options.every((option, j) => option === question.options[j]) &&
      q.correctAnswer === question.correctAnswer
    );

    if (isDuplicate) {
      toast.error("Duplicate question found. Please modify the question or options.");
      return;
    }

    // Remove duplicates and count them
    const uniqueQuestions = questions.filter((q, i) =>
      !(i !== index &&
        q.question === question.question &&
        q.options.every((option, j) => option === question.options[j]) &&
        q.correctAnswer === question.correctAnswer)
    );

    const duplicatesRemoved = questions.length - uniqueQuestions.length;

    if (duplicatesRemoved > 0) {
      toast.info(`Removed ${duplicatesRemoved} duplicate question(s).`);
    }

    // If all checks pass, show a success message
    toast.success("Question saved successfully.");

    // Add a new empty question to reset the form
    setQuestions([...uniqueQuestions, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      level: "",
      tags: [],
      tagsInput: "",
      isVisible: true
    }]);

    // Set the expanded question to the new question
    setExpandedQuestion(uniqueQuestions.length);
  };

  return (
    <div className="px-8 py-2 w-screen h-screen rounded shadow-md bg-[#ECF2FE]">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 p-9 bg-opacity-50 popup z-[1000]">
<div className="bg-white p-6 rounded shadow-md relative w-full max-w-[70%] mt-10 popup">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-semibold text-gray-800 text-left" style={{ color: '#111933' }}>
      Enter the Test Name
    </h2>
    <button
      onClick={() => navigate(-1)}
      className="text-gray-400 hover:text-gray-500"
    >
      <FontAwesomeIcon className='p-4' icon={faTimes} />
    </button>
  </div>
  <form className='flex flex-col space-y-4 mt-8 popup-content'
    onSubmit={(e) => {
      e.preventDefault();
      const buttonType = e.nativeEvent.submitter.getAttribute("data-type");

      if (buttonType === "manual") {
        setShowPopup(false);
        setShowManualForm(true);
      } else if (buttonType === "bulkUpload") {
        handleBulkUpload();
      } else {
        console.log("Unknown button type");
      }
    }}>
    <div className="">
      <label className="block text-gray-700 text-sm font-semibold mb-1" style={{ color: '#111933' }}>Test Name:</label>
      <input
        required
        type="text"
        value={testName}
        onChange={(e) => setTestName(e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        style={{ width: '100%', color: '#111933' }} // Increase width to 100%
      />
    </div>
    <div className="">
      <label className="block text-gray-700 text-sm font-semibold mb-1" style={{ color: '#111933' }}>Test Level:</label>
      <select
        required
        value={testLevel}
        onChange={handleTestLevelChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        style={{ width: '100%', color: '#111933' }} // Increase width to 100%
      >
        <option value="">Select Level</option>
        {levels.map((level, idx) => (
          <option key={idx} value={level} style={{ color: '#111933' }}>{level}</option>
        ))}
      </select>
    </div>
    <div className="">
      <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Tags:</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {testTags.map((tag, tagIndex) => (
          <span
            key={tagIndex}
            className="bg-blue-100 text-[#111933] px-2 py-1 rounded-full text-sm flex items-center"
            style={{ color: '#111933' }}
          >
            {tag}
            <button
              onClick={() => removeTestTag(tagIndex)}
              className="ml-2 text-[#111933] hover:text-blue-900"
              style={{ color: '#111933' }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={testTagsInput}
        onChange={handleTestTagsChange}
        onKeyPress={handleTestTagsKeyPress}
        placeholder="Type and press Enter or comma to add tags"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        style={{ width: '100%', color: '#111933' }} // Increase width to 100%
      />
    </div>
    <div className="">
      <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Select Category:</label>
      <select
        required
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        style={{ width: '100%', color: '#111933' }} // Increase width to 100%
      >
        <option value="">Select Category</option>
        {predefinedCategories.map((category, idx) => (
          <option key={idx} value={category} style={{ color: '#111933' }}>{category}</option>
        ))}
        <option value="Others" style={{ color: '#111933' }}>Others</option>
      </select>
      {selectedCategory === "Others" && (
        <input
          type="text"
          value={manualCategory}
          onChange={(e) => setManualCategory(e.target.value)}
          placeholder="Enter category manually"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
          style={{ width: '100%', color: '#111933' }} // Increase width to 100%
        />
      )}
    </div>

    <div className="flex justify-between">
      <button
        type="submit"
        data-type="manual"
        className="bg-yellow-500 text-white py-2 px-16 flex items-center hover-button"
        style={{ backgroundColor: '#111933', borderWidth: '2px', borderRadius: '9px', color: 'white' }}
      >
        Manual
      </button>

      <button
        type="submit"
        data-type="bulkUpload"
        className="bg-yellow-500 text-primary py-2 px-6 hover-button"
        style={{ backgroundColor: '#111933', borderWidth: '2px', borderRadius: '9px', color: 'white',}}
      >
        Bulk Upload
      </button>
    </div>
  </form>
</div>


        </div>
      )}
      {showManualForm && (
        <div className="manual-upload-container p-6 bg-white shadow-xl rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800" style={{ color: '#111933' }}>Manual Upload Test</h2>
          <div className='flex flex-1 space-x-4 items-end mb-6'>
            <div className="flex-1">
              <label className=" text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Name:</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="shadow appearance-none border rounded w-2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ width: '100%', color: '#111933' }} // Increase width to 100%
              />
            </div>
            <div className="flex-1">
              <label className=" text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Level:</label>
              <select
                value={testLevel}
                onChange={handleTestLevelChange}
                className="shadow appearance-none border rounded w-2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ width: '100%', color: '#111933' }} // Increase width to 100%
              >
                <option value="">Select Level</option>
                {levels.map((level, idx) => (
                  <option key={idx} value={level} style={{ color: '#111933' }}>{level}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Select Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ width: '100%', color: '#111933' }} // Increase width to 100%
              >
                <option value="">Select Category</option>
                {predefinedCategories.map((category, idx) => (
                  <option key={idx} value={category} style={{ color: '#111933' }}>{category}</option>
                ))}
                <option value="Others" style={{ color: '#111933' }}>Others</option>
              </select>
              {selectedCategory === "Others" && (
                <input
                  type="text"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  placeholder="Enter category manually"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                />
              )}
            </div>
            <div className=" flex-1">
              <label className=" text-gray-700 text-sm font-semibold" style={{ color: '#111933' }}>Test Tags:</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {testTags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                    style={{ color: '#111933' }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTestTag(tagIndex)}
                      className="ml-2 text-blue-800 hover:text-blue-900"
                      style={{ color: '#111933' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={testTagsInput}
                onChange={handleTestTagsChange}
                onKeyPress={handleTestTagsKeyPress}
                placeholder="Type and press Enter or comma to add tags"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ width: '100%', color: '#111933' }} // Increase width to 100%
              />
            </div>
          </div>
          {/* Question List */}

          <div className="flex space-x-4">
            <div className="w-1/4">
              <div
                className="p-4 shadow-md rounded-lg bg-white relative border border-gray-300 flex flex-col"
                style={{ height: '415px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-black">Question List</h3>
                  <button
                    onClick={() => {
                      addQuestion();
                    }}
                    className="p-2 rounded-lg bg-[#111933] text-white hover:bg-[#1f2b41]"
                  >
                    Add Question
                  </button>
                </div>

                {/* Scrollable Question Items */}
                <div className="overflow-y-auto flex-grow" style={{ maxHeight: '380px' }}>
                  {currentQuestions.map((q, index) => (
                    <div
                      key={index}
                      className="p-0.5 border rounded-lg border-gray-300 mb-2 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedQuestion(indexOfFirstQuestion + index)}
                    >
                      <div className="flex items-center">
                        <span className="mr-2 font-semibold text-[#111933] pl-2">
                          {indexOfFirstQuestion + index + 1}
                        </span>
                        <p className="text-sm font-semibold text-black truncate w-64">
                          {q.question}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the click event from propagating to the parent div
                          deleteQuestion(indexOfFirstQuestion + index);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls - Styled with Material UI */}
                <div className="flex justify-center">
                  <Pagination
                    count={totalPages} // Total number of pages
                    page={currentPage} // Current active page
                    onChange={(event, value) => handlePageChange(value)}
                    siblingCount={1} // Number of page numbers before and after current page
                    boundaryCount={0} // Number of boundary pages shown at start and end
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#111933', // Text color for pagination items
                      },
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: '#111933', // Background color for selected item
                        color: '#fff', // Text color for selected item
                      },
                      '& .MuiPaginationItem-root:hover': {
                        backgroundColor: 'rgba(0, 9, 117, 0.1)',
                        color: '#111933', // Hover effect
                      },
                    }}
                  />
                </div>

                {/* Create Test Button (Only for the Last Question) */}
                {questions.length > 0 && (
                  <div className="flex justify-center pr-3 mt-4">
                    <button
                      onClick={createTest}
                      className="p-2 rounded-lg bg-[#111933] text-white hover:bg-[#1f2b41] w-80 align-center"
                    >
                      Finish
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Question Form */}
            <div className="w-3/4">
              <div className="">
                {questions.map((q, index) => (
                  index === expandedQuestion && (
                    <div
                      key={index}
                      className="p-4 shadow-md rounded-lg bg-white mb-4 relative border border-gray-300"
                      style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                    >
                      {/* Delete Button (Icon Only) at Top-Right */}
                      {/* <button
                        onClick={() => deleteQuestion(index)}
                        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-600"
                      >
                        <DeleteIcon />
                      </button> */}

                      {/* Question Title */}
                      {/* <h3 className="text-xl font-semibold mb-2 text-[#111933]">Question {index + 1}</h3> */}

                      {/* Question & Options Section */}
                      <div className="flex space-x-2">
                        <div className="w-1/2">
                          <div className="mb-2">
                            <label className="block text-sm font-medium text-[#111933] mb-1">
                              Question <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={q.question}
                              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                              placeholder="Type your question here"
                              className="w-full h-[200px] pt-2 pl-2 rounded-lg border-2 border-gray-300 shadow-sm "
                              rows={2}
                              required
                            />
                          </div>
                        </div>

                        {/* Options Section */}
                        <div className="w-1/2">
                          <div >
                            <label className="block text-sm font-medium text-[#111933] mb-1">
                              Options <span className="text-red-500">*</span>
                            </label>
                            {q.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2 mb-2">

                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                  className="flex-1 p-2 rounded-lg border-2 border-gray-300 shadow-sm "
                                  placeholder={`Enter option `}
                                  required={optionIndex < 2}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Correct Answer, Difficulty Level, and Tags in one line */}
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-[#111933] mb-1">
                            Select correct answer <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                            className="w-full p-2 rounded-lg border-2 "
                            required
                          >
                            <option value="">Select Correct Answer</option>
                            {q.options.map((option, optionIndex) => (
                              option && (
                                <option key={optionIndex} value={option}>
                                  Option {String.fromCharCode(65 + optionIndex)}: {option}
                                </option>
                              )
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-[#111933] mb-1">
                            Difficulty Level <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={q.level}
                            onChange={(e) => handleQuestionChange(index, "level", e.target.value)}
                            className="w-full p-2 rounded-lg border-2 "
                            required
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-[#111933] mb-1">Tags</label>
                          <input
                            type="text"
                            value={q.tagsInput}
                            onChange={(e) => handleQuestionChange(index, "tags", e.target.value)}
                            onKeyPress={(e) => handleTagKeyPress(index, e)}
                            className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm "
                            placeholder="e.g., math, algebra, geometry"
                          />
                          <p className="mt-1 text-sm text-[#111933]">Separate tags with commas</p>

                          {/* Tags List */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {q.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                                style={{ color: '#111933' }}
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(index, tagIndex)}
                                  className="ml-2 text-blue-800 hover:text-blue-900"
                                  style={{ color: '#111933' }}
                                >
                                  x
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Create Test Button (Only for the Last Question) */}

                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              handleSaveQuestion(index);

                            }}
                            className="py-2 px-4  rounded-lg bg-[#111933] text-white hover:bg-[#1f2b41]"
                          >
                            Save
                          </button>
                        </div>

                    </div>
                  )
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
      {showBulkUpload && (
        <div className="p-6 my-4 bg-white shadow-xl rounded-lg">
          <ToastContainer />
          <div className='flex justify-between items-center mb-4'>
            <h2 className="text-2xl font-semibold text-gray-800" style={{ color: '#111933' }}>Bulk Upload Test</h2>
            <button
              onClick={handleDownloadSample}
              className="p-2 rounded-lg bg-[#111933] border-[#111933] border text-white px-5"
            >
              Download Sample
            </button>
          </div>
          <div className="flex flex-wrap -mx-4 mb-4">
            <div className="w-full md:w-1/4 px-4 mb-4 md:mb-0">
              <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Name:</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ color: '#111933' }}
              />
            </div>
            <div className="w-full md:w-1/4 px-4 mb-4 md:mb-0">
              <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Level:</label>
              <select
                value={testLevel}
                onChange={handleTestLevelChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ color: '#111933' }}
              >
                <option value="">Select Level</option>
                {levels.map((level, idx) => (
                  <option key={idx} value={level} style={{ color: '#111933' }}>{level}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4 px-4 mb-4 md:mb-0">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 text-sm font-semibold" style={{ color: '#111933' }}>Test Tags:</label>
                <div className="flex flex-wrap gap-2">
                  {testTags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-blue-100 text-[#111933] px-2 py-1 rounded-full text-sm flex items-center"
                      style={{ color: '#111933' }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTestTag(tagIndex)}
                        className="ml-2 text-[#111933] hover:text-blue-900"
                        style={{ color: '#111933' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={testTagsInput}
                onChange={handleTestTagsChange}
                onKeyPress={handleTestTagsKeyPress}
                placeholder="Type and press Enter or comma to add tags"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ color: '#111933' }}
              />
            </div>
            <div className="w-full md:w-1/4 px-4 mb-4 md:mb-0">
              <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Select Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ color: '#111933' }}
              >
                <option value="">Select Category</option>
                {predefinedCategories.map((category, idx) => (
                  <option key={idx} value={category} style={{ color: '#111933' }}>{category}</option>
                ))}
                <option value="Others" style={{ color: '#111933' }}>Others</option>
              </select>
              {selectedCategory === "Others" && (
                <input
                  type="text"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  placeholder="Enter category manually"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                  style={{ color: '#111933' }}
                />
              )}
            </div>
          </div>
          {!file && (
            <div
              {...getRootProps()}
              className="border-dashed border border-gray-300 px-20 py-10 text-center mx-14 flex flex-col items-center"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <>
                  <img src="/bulk.png" alt="Bulk" className="mb-4 w-56 h-56" />
                  <p style={{ color: '#111933' }}>Drop the files here ...</p>
                </>
              ) : (
                <>
                  <img src="/bulk.png" alt="Bulk" className="mb-4 w-56 h-56" />
                  <p style={{ color: '#111933' }}>Drag 'n' drop some files here, or click to select files</p>
                </>
              )}
            </div>
          )}

          {file && (
            <div className="mb-4">
              <p style={{ color: '#111933' }}>Selected file: {file.name}</p>
            </div>
          )}
{parsedQuestions.length > 0 && (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-gray-800" style={{ color: '#111933' }}>Preview Questions</h3>
      <button
        onClick={() => {
          const allSelected = selectedQuestions.length === parsedQuestions.length;
          handleSelectAll(!allSelected);
        }}
        className="bg-white text-[#111933] py-1 px-3 rounded-xl hover:bg-[#111933] hover:text-white border-2 border-gray-300"
      >
        {selectedQuestions.length === parsedQuestions.length ? 'Deselect All' : 'Select All'}
      </button>
    </div>
    {currentParsedQuestions.map((q, index) => (
      <div
        key={index}
        className="p-4 bg-white hover:shadow-md border-b-2 rounded-sm flex items-start justify-between cursor-pointer"
        onClick={() => handleQuestionSelection(index, !selectedQuestions.some(sq => sq.question === q.question))}
      >
        <input
          type="checkbox"
          checked={selectedQuestions.some(sq => sq.question === q.question)}
          onChange={(e) => handleQuestionSelection(index, e.target.checked)}
          className="mr-4 mt-1"
        />
        <div className="flex-1 flex flex-col items-start justify-between">
          <p className="text-left"><strong style={{ color: '#111933' }}>{q.question}</strong></p>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent the click event from propagating to the parent div
              testtoggleExpand(index);
            }}
            className="text-gray-700 hover:text-gray-900 mt-2"
          >
            {expandedQuestions.includes(bulkIndexOfFirstQuestion + index) && (
              <div className="mt-2 w-full">
                <p><strong style={{ color: '#111933' }}>Options:</strong> {q.options.join(', ')}</p>
                <p><strong style={{ color: '#111933' }}>Level:</strong> {q.level}</p>
                <p><strong style={{ color: '#111933' }}>Tags:</strong> {q.tags.join(', ')}</p>
              </div>
            )}
          </button>
        </div>
        <div className="flex-shrink-0 text-left w-1/4">
          <p><strong style={{ color: '#111933' }}>Answer:</strong> {q.correctAnswer}</p>
        </div>
      </div>
    ))}
    <div className="flex justify-center">
      <Pagination
        count={bulkTotalPages} // Total number of pages
        page={bulkCurrentPage} // Current active page
        onChange={(event, value) => handleBulkPageChange(value)}
        siblingCount={1} // Number of page numbers before and after current page
        boundaryCount={0} // Number of boundary pages shown at start and end
        className='mt-3'
        sx={{
          '& .MuiPaginationItem-root': {
            color: '#111933', // Text color for pagination items
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: '#111933', // Background color for selected item
            color: '#fff', // Text color for selected item
          },
          '& .MuiPaginationItem-root:hover': {
            backgroundColor: 'rgba(0, 9, 117, 0.1)',
            color: '#111933', // Hover effect
          },
        }}
      />
    </div>
  </div>
)}


          <div className="flex justify-end space-x-4 mt-4">

            <button
              onClick={handleSubmit}
              className="p-2 rounded-lg bg-[#111933] border-[#111933] border text-white px-5 "
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTest;
