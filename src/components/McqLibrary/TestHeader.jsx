import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImportQuestion from '../../assets/ImportQuestion.svg';
import AddQuestion from '../../assets/AddQuestion.svg';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X, Download } from 'lucide-react';
import Pagination from '@mui/material/Pagination';
import submiticon from '../../assets/submit.svg';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const TotalQuestions = ({ totalQuestions }) => {
  return (
    <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'left', width: '16rem', height: '30px', borderRadius: '10px', paddingTop: "5px" }}>
      <div className=' text-normal font-semibold'>Total Questions: </div>
      <div className='pl-2 text-normal font-semibold'>{totalQuestions}</div>
    </div>
  );
};

const Header = ({ searchQuery, setSearchQuery, totalQuestions }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [test, setTest] = useState(location.state['test'] || {});
  const [view, setView] = useState('list'); // 'list', 'details'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTest, setEditedTest] = useState({ ...test, tags: test?.tags || [] });
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [testTags, setTestTags] = useState(test?.tags || []);
  const [uploadStatus, setUploadStatus] = useState(null); // Define uploadStatus

  const [manualCategory, setManualCategory] = useState("");
  const [testTagsInput, setTestTagsInput] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    level: '',
    tags: []
  });
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
  const questionsPerPage = 3;
  const inputRef = useRef(null);

  const handleTestTagsChange = (e) => {
    setTestTagsInput(e.target.value);
    if (e.target.value.endsWith(',')) {
      const newTag = e.target.value.slice(0, -1).trim();
      if (newTag && !testTags.includes(newTag)) {
        const updatedTags = [...testTags, newTag];
        setTestTags(updatedTags);
        setEditedTest({ ...editedTest, tags: updatedTags }); // Synchronize with editedTest
      }
      setTestTagsInput('');
    }
  };

  const handleTestTagsKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = testTagsInput.trim();
      if (newTag && !testTags.includes(newTag)) {
        const updatedTags = [...testTags, newTag];
        setTestTags(updatedTags);
        setEditedTest({ ...editedTest, tags: updatedTags }); // Synchronize with editedTest
      }
      setTestTagsInput('');
    }
  };

  const removeTestTag = (tagIndex) => {
    const newTags = testTags.filter((_, i) => i !== tagIndex);
    setTestTags(newTags);
    setEditedTest({ ...editedTest, tags: newTags }); // Synchronize with editedTest
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setView('details');
  };

  const handleBack = () => {
    setView('list');
    setSelectedQuestion(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const fetchAllTests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fetch-all-tests/`);
      const tests = response.data.tests;
      setTest(tests.filter((t) => t._id === test._id)[0]);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  useEffect(() => {
    fetchAllTests();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/update-test/${editedTest.test_id}/`,
        {
          test_name: editedTest.test_name,
          level: editedTest.level,
          tags: editedTest.tags, // Use editedTest.tags
          category: editedTest.category === "Others" ? manualCategory : editedTest.category,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        test.test_name = editedTest.test_name;
        test.level = editedTest.level;
        test.tags = editedTest.tags;
        setIsEditing(false);
        setEditedTest({ ...editedTest, ...response.data });
        toast.success('Test details saved successfully');
      } else {
        setError('Failed to update test');
        toast.error('Failed to update test');
      }
    } catch (error) {
      setError('An error occurred while updating the test');
      toast.error('An error occurred while updating the test');
      console.error('Error updating test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = () => {
    setIsManualAddModalOpen(true);
  };

  const handleManualAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadStatus(null); // Reset upload status

    // Ensure correctAnswer is populated
    if (!newQuestion.correctAnswer) {
      setError('Please specify the correct answer');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/append-question-to-test/`,
        {
          test_id: editedTest.test_id,
          ...newQuestion
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setIsManualAddModalOpen(false);
        setNewQuestion({
          question: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correctAnswer: '',
          level: '',
          tags: [],
        });
        setEditedTest(prevTest => ({
          ...prevTest,
          questions: [...prevTest.questions, response.data.new_question],
        }));
        setUploadStatus('Success: Question added successfully');
        toast.success('Question added successfully');
      } else {
        setError('Failed to add question');
        setUploadStatus('Error: Failed to add question');
        toast.error('Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      setError('An error occurred while adding the question');
      setUploadStatus('Error: An error occurred while adding the question');
      toast.error('An error occurred while adding the question');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = () => {
    setIsBulkUploadModalOpen(true);
  };

  const handleFileChange = (event) => {
    setUploadFile(event.target.files[0]);
    setPreviewQuestions([]);
    setError(null);

    if (event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const questions = results.data
            .filter(question => question.question && question.correctAnswer)
            .map(question => ({
              ...question,
              level: question.level || question.Level,
              tags: question.tags ? question.tags.split(', ') : []
            }));
          setPreviewQuestions(questions);
        },
        error: (error) => {
          setError('Failed to parse the CSV file');
          console.error('Error parsing CSV file:', error);
        },
      });
    }
  };

  const selectedall = () => {
    setPreviewQuestions(previewQuestions.map(q => ({ ...q, selected: true })));
  };

  const onDrop = (acceptedFiles) => {
    setUploadFile(acceptedFiles[0]);
    setPreviewQuestions([]);
    setError(null);

    if (acceptedFiles[0]) {
      Papa.parse(acceptedFiles[0], {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const questions = results.data
            .filter(question => question.question && question.correctAnswer)
            .map(question => ({
              ...question,
              level: question.level || question.Level,
              tags: question.tags ? question.tags.split(', ') : []
            }));
          setPreviewQuestions(questions);
        },
        error: (error) => {
          setError('Failed to parse the CSV file');
          console.error('Error parsing CSV file:', error);
        },
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFileUpload = async () => {
    if (!uploadFile) {
      return;
    }

    const payload = {
      test_id: editedTest.test_id,
      questions: previewQuestions.filter(q => q.selected),
    };

    setLoading(true);
    setError(null);
    setUploadStatus(null); // Reset upload status

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/bulk-upload-questions-to-test/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const uploadedQuestions = Array.isArray(response.data.questions) ? response.data.questions : [];
        setIsBulkUploadModalOpen(false);
        setUploadFile(null);
        setPreviewQuestions([]);
        setEditedTest(prevTest => ({
          ...prevTest,
          questions: [...prevTest.questions, ...uploadedQuestions],
        }));
        setUploadStatus('Success: Questions uploaded successfully');
        toast.success('Questions uploaded successfully');
      } else {
        setError('Failed to upload questions');
        setUploadStatus('Error: Failed to upload questions');
        toast.error('Failed to upload questions');
      }
    } catch (error) {
      setUploadStatus('Error: An error occurred while uploading the questions');
      console.error('Error uploading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (previewQuestions.every(q => q.selected)) {
      handleFileUpload();
    }
  }, [previewQuestions]);

  const handleCloseModal = () => {
    setIsBulkUploadModalOpen(false);
    setUploadFile(null);
    setPreviewQuestions([]);
    setError(null);
    setUploadStatus(null); // Reset upload status
  };

  const handleCloseManualAddModal = () => {
    setIsManualAddModalOpen(false);
    setNewQuestion({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: '',
      level: '',
      tags: []
    });
    setError(null);
    setUploadStatus(null); // Reset upload status
  };

  const handlePrevPage = () => {
    setCurrentPreviewPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPreviewPage(prevPage => Math.min(prevPage + 1, Math.ceil(previewQuestions.length / questionsPerPage)));
  };

  const getCurrentQuestions = () => {
    const startIndex = (currentPreviewPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return previewQuestions.slice(startIndex, endIndex);
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample_document.csv';
    link.download = 'sample_document.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  if (!test) {
    return <div>No test selected</div>;
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center py-3 bg-white rounded-t-lg ">
      <div className="flex items-center gap-2 mt-2 md:mt-0 flex-grow">
        <TotalQuestions totalQuestions={totalQuestions} />
        <div className="relative flex-grow max-w-xl">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-3 border border-gray-300 rounded-full focus:ring-blue-500"
            style={{ borderColor: 'rgba(0,0,0,0.4)', outline: 'none' }}
            onFocus={(e) => (e.target.style.borderColor = '#111933')}
            onBlur={(e) => (e.target.style.borderColor = 'gray')}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2 ml-4 md:mt-0">
        <button
          onClick={handleBulkUpload}
          className="inline-flex items-center px-4 py-2 w-144px font-medium bg-[#111933] text-[#ffffff] hover:bg-[#111933] hover:scale-102 cursor-pointer"
          style={{ borderRadius: '0.5rem' }}
        >
          Import Question
          <img src={ImportQuestion} alt="Import" className="w-4 h-4 ml-3" />
        </button>
        <button
          onClick={handleManualAdd}
          className="inline-flex items-center px-4 py-2 w-144px font-medium bg-[#111933] text-[#ffffff] hover:bg-[#111933] transform transition-transform hover:scale-102 cursor-pointer"
          style={{ borderRadius: '0.5rem' }}
        >
          Add Question
          <img src={AddQuestion} alt="Add" className="w-4 h-4 ml-3" />
        </button>
      </div>
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10 transform transition-all duration-300 scale-100 opacity-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#111933]">
                Bulk Upload
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#111933] mb-4">
              Upload a CSV file containing multiple questions. Maximum file size: 5MB
            </p>
            <button
              onClick={handleDownloadSample}
              className="mb-4 w-full bg-[#E3E3E366] bg-opacity-70 text-[#111933] hover:bg-[#E3E3E3] hover:bg-opacity-100 py-2 px-4 rounded-md text-sm font-medium flex justify-between items-center"
            >
              <span>Sample file</span>
              <Download className="w-5 h-5 text-[#111933]" />
            </button>
            <div className="mb-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv"
                className="block w-full text-sm text-[#111933] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#111933] border-[#111933] file:text-[#ffffff] hover:file:bg-[#111933] hover:file:bg-opacity-100"
              />
            </div>

            {uploadFile && (
              <div className="mt-2">
                <p>Selected file: {uploadFile.name}</p>
              </div>
            )}

            {uploadFile && (
              <button
                onClick={selectedall}
                className="bg-blue-500 text-white p-2 flex items-center mt-4 w-full justify-center"
                style={{ backgroundColor: '#111933', borderRadius: '9px' }}
                disabled={loading}
              >
                Upload
              </button>
            )}

            {error && (
              <div className={`mt-4 p-3 rounded-md ${error.startsWith("Success")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
                }`}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}
      {isManualAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-4/5 max-w- px-16 py-8 overflow-hidden transform transition-all duration-300">
            <div className="flex mb-10">
              <div className='w-full'>
                <h2 className="text-lg font-semibold text-[#111933] pb-2">Add New Question</h2>
                <h2 className="text-sm font-light text-[#111933] pb-4">Choose how you’d like to add questions to your assessment. Select the method that works best for you to quickly build your test.</h2>
                <div className='border-b-2 border-[#111933]'></div>
              </div>
              <button
                onClick={handleCloseManualAddModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="absolute top-5 right-5 w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="Type your question here"
                    style={{ paddingBottom: '10rem' }}
                    className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    rows={2}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Choice <span className="text-red-500">*</span>
                  </label>
                  {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                    <div key={optionKey} className="flex items-center space-x-2 mb-4">
                      <input
                        type="text"
                        name={optionKey}
                        value={newQuestion[optionKey]}
                        placeholder='Type your choice here'
                        onChange={(e) => setNewQuestion({ ...newQuestion, [optionKey]: e.target.value })}
                        className="flex-1 p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 pr-20">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Select correct answer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="correctAnswer"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                    className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    required
                  >
                    <option value="">Select Correct Answer</option>
                    {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                      newQuestion[optionKey] && (
                        <option key={optionKey} value={newQuestion[optionKey]}>
                          Option {index + 1}: {newQuestion[optionKey]}
                        </option>
                      )
                    ))}
                  </select>
                </div>
                <div className="flex-1 pr-20">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    value={newQuestion.level}
                    onChange={(e) => setNewQuestion({ ...newQuestion, level: e.target.value })}
                    className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={newQuestion.tags.join(', ')}
                    onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                    className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    placeholder="e.g., math, algebra, geometry"
                  />
                  <p className="mt-1 text-sm text-[#111933]">Separate tags with commas</p>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  type='submit'
                  className="inline-flex items-center px-4 py-1 w-144px mt-2 font-medium bg-[#111933] text-[#ffffff] hover:bg-[#111933] focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-transform duration-300 hover:scale-102 cursor-pointer"
                  style={{ borderRadius: '0.5rem' }}
                >
                  Submit
                  <img src={submiticon} alt="submit" className="w-4 h-4 ml-2" />
                </button>
              </div>
              {error && (
                <div className="p-2 rounded-lg text-sm font-medium text-center shadow-sm bg-red-100 text-red-800">
                  {error}
                </div>
              )}
              {uploadStatus && (
                <div
                  className={`p-2 rounded-lg text-sm font-medium text-center shadow-sm ${
                    uploadStatus.startsWith("Success")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {uploadStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
